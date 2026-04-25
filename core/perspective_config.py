"""
作家视角配置

统一封装视角相关参数，避免在各个方法中重复传递 3-4 个参数。
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class PerspectiveConfig:
    """作家视角配置

    Attributes:
        perspective: 作家视角 ID，None 表示不使用特定视角
        strength: 视角注入强度 (0.0-1.0)，默认 0.7
        use_for_critic: 是否在 Critic 评审中也使用该视角，默认 True
    """

    perspective: Optional[str] = None
    strength: float = 0.7
    use_for_critic: bool = True

    @classmethod
    def from_project(
        cls,
        writer_perspective: Optional[str],
        perspective_strength: float = 0.7,
        use_perspective_critic: bool = True,
    ) -> "PerspectiveConfig":
        """从 Project 模型字段创建配置"""
        return cls(
            perspective=writer_perspective,
            strength=perspective_strength if perspective_strength is not None else 0.7,
            use_for_critic=use_perspective_critic if use_perspective_critic is not None else True,
        )

    def for_critic(self) -> "PerspectiveConfig":
        """获取用于 Critic 的配置（如果禁用了则返回空配置）"""
        if not self.use_for_critic:
            return PerspectiveConfig(perspective=None, strength=self.strength, use_for_critic=False)
        return self

    def has_perspective(self) -> bool:
        """是否配置了有效的作家视角"""
        return self.perspective is not None
