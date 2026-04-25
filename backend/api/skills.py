from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from core.skill_runtime import SkillRegistry
from backend.rate_limiter import limit_requests


router = APIRouter(prefix="/skills", tags=["skills"])


class SkillSummary(BaseModel):
    id: str
    name: str
    description: str
    version: str
    author: str
    applies_to: list[str]
    priority: int
    tags: list[str]
    config_schema: dict[str, Any]
    safety_tags: list[str]
    dependencies: list[str]


class SkillListResponse(BaseModel):
    skills: list[SkillSummary]


@router.get("", response_model=SkillListResponse, dependencies=[Depends(limit_requests(60))])
def list_skills():
    """列出本机已安装的小说创作 Skill。"""
    return {"skills": SkillRegistry().list_skill_summaries()}
