from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from . import safety_filter
from . import strength_trimmer
from .skill_registry import Skill, SkillRegistry


@dataclass(frozen=True)
class AssembledSkill:
    skill: Skill
    rendered_content: str
    config: dict[str, Any]


class SkillAssembler:
    """Match enabled project skills to an agent and render their injection text."""

    AGENT_ALLOWLIST = {"planner", "writer", "revise", "critic", "revise_local_patch", "stitch"}

    def __init__(
        self,
        registry: SkillRegistry | None = None,
    ):
        self.registry = registry or SkillRegistry()

    def assemble(
        self,
        agent_name: str,
        *,
        project_config: dict[str, Any] | None = None,
    ) -> list[AssembledSkill]:
        if agent_name not in self.AGENT_ALLOWLIST:
            return []

        enabled = self._enabled_skill_entries(project_config)
        assembled: list[AssembledSkill] = []
        for entry in enabled:
            skill_id = str(entry.get("skill_id") or "")
            skill = self.registry.load_skill(skill_id)
            if skill is None or not self._applies_to_agent(skill, agent_name, entry):
                continue

            config = dict(entry.get("config") or {})
            strength = config.get("strength", self._default_strength(skill))
            raw_content = skill.injection_for(agent_name)
            trimmed = strength_trimmer.trim_by_strength(raw_content, strength=strength)
            if not trimmed:
                continue
            mode = str(config.get("mode") or "style_only")
            rendered = safety_filter.filter_unsafe_content(trimmed, mode=mode)
            if rendered:
                assembled.append(AssembledSkill(skill=skill, rendered_content=rendered, config=config))

        return sorted(assembled, key=lambda item: (item.skill.priority, item.skill.id))

    def _enabled_skill_entries(self, project_config: dict[str, Any] | None) -> list[dict[str, Any]]:
        if not project_config:
            return []

        skills_config = project_config.get("skills") or {}
        enabled = skills_config.get("enabled") or []

        entries = []
        seen = set()
        import logging
        logger = logging.getLogger(__name__)
        for entry in enabled:
            if isinstance(entry, str):
                normalized = {"skill_id": entry, "config": {}}
            else:
                normalized = entry
                if "skill_id" not in normalized:
                    logger.warning(f"跳过无效的 skill 配置项: {entry}")
                    continue

            skill_id = normalized["skill_id"]
            if skill_id not in seen:
                seen.add(skill_id)
                entries.append(normalized)
        return entries

    def _applies_to_agent(self, skill: Skill, agent_name: str, entry: dict[str, Any]) -> bool:
        override = entry.get("applies_to_override")
        if override is not None:
            return agent_name in override
        applies_to = entry.get("applies_to") or skill.applies_to
        return agent_name in applies_to

    def _default_strength(self, skill: Skill) -> float:
        strength_schema = skill.config_schema.get("strength")
        if isinstance(strength_schema, dict):
            return float(strength_schema.get("default", 0.7))
        return 0.7
