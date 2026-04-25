from __future__ import annotations

from .skill_assembler import AssembledSkill


class SkillInjector:
    PLACEHOLDER = "{{skill_layer}}"

    def build_skill_layer(self, assembled_skills: list[AssembledSkill]) -> str:
        if not assembled_skills:
            return ""

        parts = [
            "## ════════════════════════════════════",
            f"## Skill Layer Start ({len(assembled_skills)} skills enabled)",
            "## ════════════════════════════════════",
        ]
        for item in assembled_skills:
            parts.extend(
                [
                    "",
                    f"## Skill: {item.skill.id} (priority: {item.skill.priority})",
                    item.rendered_content.strip(),
                    "",
                    "---",
                ]
            )
        parts.extend(
            [
                "",
                "## ════════════════════════════════════",
                "## Skill Layer End",
                "## ════════════════════════════════════",
                "",
                "请在创作中遵循以上所有 Skill 的原则。",
            ]
        )
        return "\n".join(parts).strip()

    def inject(self, prompt: str, assembled_skills: list[AssembledSkill]) -> str:
        skill_layer = self.build_skill_layer(assembled_skills)
        if not skill_layer:
            return prompt.replace(self.PLACEHOLDER, "").strip()

        if self.PLACEHOLDER in prompt:
            return prompt.replace(self.PLACEHOLDER, skill_layer).strip()

        return f"{prompt.rstrip()}\n\n---\n\n{skill_layer}"
