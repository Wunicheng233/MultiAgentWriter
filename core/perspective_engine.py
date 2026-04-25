from pathlib import Path
from typing import Optional, Dict, List
import yaml


class PerspectiveEngine:
    """作家视角注入引擎

    负责：
    1. 加载/解析 perspective skill 文件
    2. 按智能体类型提取可注入片段
    3. 执行实际的 prompt 注入操作
    """

    BUILTIN_PERSPECTIVES = Path(__file__).parent.parent / 'perspectives'

    def __init__(self, perspective_name: str = None):
        self.perspective_name = perspective_name
        self.perspective_data: Optional[Dict] = None

        if perspective_name:
            self.load(perspective_name)

    def load(self, name: str) -> None:
        """加载指定的 perspective skill"""
        # 先找内置的
        builtin_path = self.BUILTIN_PERSPECTIVES / f"{name}.yaml"
        if builtin_path.exists():
            with open(builtin_path, 'r', encoding='utf-8') as f:
                self.perspective_data = yaml.safe_load(f)
            return

        # 找不到就报错
        raise ValueError(f"Perspective '{name}' not found")

    @classmethod
    def list_available_perspectives(cls) -> List[Dict]:
        """列出所有可用的作家视角"""
        perspectives = []

        if cls.BUILTIN_PERSPECTIVES.exists():
            for f in cls.BUILTIN_PERSPECTIVES.glob("*.yaml"):
                if f.stem == '_template':
                    continue
                with open(f, 'r', encoding='utf-8') as fp:
                    data = yaml.safe_load(fp)
                    perspectives.append({
                        'id': f.stem,
                        'name': data['name'],
                        'genre': data['genre'],
                        'description': data['description'],
                        'strength_recommended': data['strength_recommended'],
                        'builtin': True,
                    })

        return sorted(perspectives, key=lambda x: x['genre'])

    def inject_for_planner(self, original_prompt: str, strength: float = 0.7) -> str:
        """为 Planner 注入心智模型

        注入位置：prompt 最开头
        注入内容：核心心智模型、世界观构建原则
        """
        if not self.perspective_data:
            return original_prompt

        injection = self._get_planner_injection(strength)

        return f"""
# 创作思维模式：{self.perspective_data['name']}

## 核心心智模型（请在构思时融入以下思维方式）
{injection['mental_models']}

## 世界观构建原则
{injection['worldview_principles']}

---

{original_prompt}
""".lstrip('\n')

    def _get_planner_injection(self, strength: float) -> Dict[str, str]:
        """根据强度裁剪 Planner 注入内容"""
        data = self.perspective_data['planner_injection']

        mental_models = data['mental_models']
        worldview = data['worldview_principles']

        # 根据强度裁剪
        if strength <= 0.3:
            # 低强度：只保留前 2 条心智模型
            models_lines = mental_models.strip().split('\n')
            mental_models = '\n'.join(models_lines[:2])
            # 世界观只保留第一条
            worldview_lines = worldview.strip().split('\n')
            worldview = '\n'.join(worldview_lines[:1])
        elif strength <= 0.7:
            # 中强度：保留前 4 条心智模型 + 世界观
            models_lines = mental_models.strip().split('\n')
            mental_models = '\n'.join(models_lines[:4])

        return {
            'mental_models': mental_models,
            'worldview_principles': worldview,
        }

    def inject_for_writer(self, original_prompt: str, strength: float = 0.7) -> str:
        """为 Writer 注入表达风格DNA

        注入位置：prompt 末尾（在所有硬性规则之后）
        注入内容：句式偏好、词汇特征、节奏感、经典句式参考
        """
        if not self.perspective_data:
            return original_prompt

        injection = self._get_writer_injection(strength)
        sections = [
            ("句式偏好", injection["sentence_patterns"]),
            ("词汇特征", injection["vocabulary_traits"]),
            ("节奏感", injection["rhythm_principles"]),
            ("经典句式参考（可直接化用）", injection["example_sentences"]),
        ]
        rendered_sections = "\n\n".join(
            f"### {title}\n{content}"
            for title, content in sections
            if str(content).strip()
        )

        return f"""{original_prompt}

---

## 表达风格适配：{self.perspective_data['name']} 模式

{rendered_sections}
"""

    def _get_writer_injection(self, strength: float) -> Dict[str, str]:
        """根据强度裁剪 Writer 注入内容"""
        data = self.perspective_data['writer_injection']

        sentences = data['sentence_patterns']
        vocabulary = data['vocabulary_traits']
        rhythm = data['rhythm_principles']
        examples = data['example_sentences']

        if strength <= 0.3:
            # Low intensity: only sentence patterns and vocabulary
            rhythm = ''
            examples = ''
        elif strength <= 0.7:
            # Medium intensity: no examples
            examples = ''

        return {
            'sentence_patterns': sentences,
            'vocabulary_traits': vocabulary,
            'rhythm_principles': rhythm,
            'example_sentences': examples,
        }

    def inject_for_critic(self, original_input: str, strength: float = 0.7) -> str:
        """为 Critic 注入审美标准"""
        if not self.perspective_data:
            return original_input

        standards = self._get_critic_injection(strength)

        return f"""{original_input}

---

## 评审视角：{self.perspective_data['name']} 的审美标准
{standards}
"""

    def inject_for_revise(self, original_input: str, strength: float = 0.7) -> str:
        """为 Revise 注入修改策略"""
        if not self.perspective_data:
            return original_input

        strategy = self._get_revise_injection(strength)

        return f"""{original_input}

---

## 修改策略：{self.perspective_data['name']} 风格
{strategy}
"""

    def _get_critic_injection(self, strength: float) -> str:
        """根据强度裁剪 Critic 注入内容"""
        content = self.perspective_data['critic_injection']
        if strength <= 0.3:
            # 低强度：只保留前 2 条评审标准
            lines = content.strip().split('\n')
            content = '\n'.join(lines[:2])
        return content

    def _get_revise_injection(self, strength: float) -> str:
        """根据强度裁剪 Revise 注入内容"""
        content = self.perspective_data['revise_injection']
        if strength <= 0.3:
            # 低强度：只保留前 2 条修改策略
            lines = content.strip().split('\n')
            content = '\n'.join(lines[:2])
        return content
