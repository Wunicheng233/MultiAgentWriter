from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from backend.database import get_db
from backend.deps import get_current_user
from backend.models import Project, User
from core.perspective_engine import PerspectiveEngine

router = APIRouter(prefix="/perspectives", tags=["perspectives"])


class Perspective(BaseModel):
    id: str
    name: str
    genre: str
    description: str
    strength_recommended: float
    builtin: bool
    strengths: List[str]
    weaknesses: List[str]


class PerspectiveDetail(Perspective):
    preview: Dict[str, dict | str]


@router.get("/", response_model=Dict[str, List[Perspective]])
async def list_perspectives():
    """列出所有可用的作家视角"""
    perspectives = PerspectiveEngine.list_available_perspectives()

    # 补充 strengths 和 weaknesses
    for p in perspectives:
        try:
            engine = PerspectiveEngine(p['id'])
            p['strengths'] = engine.perspective_data.get('strengths', [])
            p['weaknesses'] = engine.perspective_data.get('weaknesses', [])
        except Exception:
            p['strengths'] = []
            p['weaknesses'] = []

    return {"perspectives": perspectives}


@router.get("/{perspective_id}", response_model=PerspectiveDetail)
async def get_perspective_detail(perspective_id: str):
    """获取特定视角的详细信息和预览"""
    try:
        engine = PerspectiveEngine(perspective_id)
        data = engine.perspective_data
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Perspective '{perspective_id}' not found")

    return PerspectiveDetail(
        id=perspective_id,
        name=data['name'],
        genre=data['genre'],
        description=data['description'],
        strength_recommended=data['strength_recommended'],
        builtin=True,
        strengths=data.get('strengths', []),
        weaknesses=data.get('weaknesses', []),
        preview={
            'planner_injection': engine._get_planner_injection(data['strength_recommended']),
            'writer_injection': engine._get_writer_injection(data['strength_recommended']),
            'critic_injection': engine._get_critic_injection(data['strength_recommended']),
        }
    )


class UpdateProjectPerspectiveRequest(BaseModel):
    perspective: Optional[str] = None
    perspective_id: Optional[str] = None
    perspective_strength: float = Field(0.7, ge=0.0, le=1.0)
    use_perspective_critic: bool = True

    def selected_perspective(self) -> Optional[str]:
        """兼容前端当前字段 perspective 和白皮书中的 perspective_id。"""
        return self.perspective if self.perspective is not None else self.perspective_id


@router.put("/project/{project_id}")
async def update_project_perspective(
    project_id: int,
    request: UpdateProjectPerspectiveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """更新项目的创作风格配置"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id,
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    selected_perspective = request.selected_perspective()

    # 验证 perspective 是否有效
    if selected_perspective is not None:
        try:
            PerspectiveEngine(selected_perspective)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid perspective: {selected_perspective}")

    # 更新字段
    project.writer_perspective = selected_perspective
    project.perspective_strength = request.perspective_strength
    project.use_perspective_critic = request.use_perspective_critic

    db.commit()
    db.refresh(project)

    return {
        "status": "ok",
        "writer_perspective": project.writer_perspective,
        "perspective_strength": project.perspective_strength,
        "use_perspective_critic": project.use_perspective_critic,
    }
