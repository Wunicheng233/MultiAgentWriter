from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .safety_filter import SafetyFilter
from .skill_registry import Skill, SkillRegistry
from .strength_trimmer import StrengthTrimmer


@dataclass(frozen=True)
class AssembledSkill:
    skill: Skill
    rendered_content: str
    config: dict[str, Any]


class SkillAssembler:
    """Match enabled project skills to an agent and render their injection text."""

    AGENT_ALLOWLIST = {"planner", "writer", "revise"}

    def __init__(
        self,
        registry: SkillRegistry | None = None,
        safety_filter: SafetyFilter | None = None,
        strength_trimmer: StrengthTrimmer | None = None,
    ):
        self.registry = registry or SkillRegistry()
        self.safety_filter = safety_filter or SafetyFilter()
        self.strength_trimmer = strength_trimmer or StrengthTrimmer()

    def assemble(
        self,
        agent_name: str,
        *,
        project_config: dict[str, Any] | None = None,
        skill_ids: list[str] | None = None,
        skill_configs: dict[str, dict[str, Any]] | None = None,
    ) -> list[AssembledSkill]:
        if agent_name not in self.AGENT_ALLOWLIST:
            return []

        enabled = self._enabled_skill_entries(project_config, skill_ids, skill_configs)
        assembled: list[AssembledSkill] = []
        for entry in enabled:
            skill_id = str(entry.get("skill_id") or "")
            skill = self.registry.load_skill(skill_id)
            if skill is None or not self._applies_to_agent(skill, agent_name, entry):
                continue

            config = dict(entry.get("config") or {})
            strength = config.get("strength", self._default_strength(skill))
            raw_content = skill.injection_for(agent_name)
            trimmed = self.strength_trimmer.trim(raw_content, strength)
            if not trimmed:
                continue
            mode = str(config.get("mode") or "style_only")
            rendered = self.safety_filter.filter(trimmed, mode=mode)
            if rendered:
                assembled.append(AssembledSkill(skill=skill, rendered_content=rendered, config=config))

        return sorted(assembled, key=lambda item: (item.skill.priority, item.skill.id))

    def _enabled_skill_entries(
        self,
        project_config: dict[str, Any] | None,
        skill_ids: list[str] | None,
        skill_configs: dict[str, dict[str, Any]] | None,
    ) -> list[dict[str, Any]]:
        entries = []
        config_entries = ((project_config or {}).get("skills") or {}).get("enabled") or []
        for entry in config_entries:
            if isinstance(entry, str):
                entries.append({"skill_id": entry})
            elif isinstance(entry, dict):
                entries.append(dict(entry))

        for skill_id in skill_ids or []:
            entry = {"skill_id": skill_id}
            if skill_configs and skill_id in skill_configs:
                entry.update(skill_configs[skill_id])
                entry.setdefault("config", skill_configs[skill_id])
            entries.append(entry)

        seen = set()
        deduped = []
        for entry in entries:
            skill_id = entry.get("skill_id")
            if not skill_id or skill_id in seen:
                continue
            seen.add(skill_id)
            deduped.append(entry)
        return deduped

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
