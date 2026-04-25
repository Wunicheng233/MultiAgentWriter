from __future__ import annotations

from .skill_assembler import AssembledSkill

PLACEHOLDER = "{{skill_layer}}"

def build_skill_layer(assembled_skills: list[AssembledSkill]) -> str:
    """构建技能层"""
    if not assembled_skills:
        return ""

    parts = [f"## Skills Enabled ({len(assembled_skills)})"]
    for item in assembled_skills:
        parts.extend([
            "",
            f"### {item.skill.id}",
            item.rendered_content.strip(),
        ])
    parts.extend([
        "",
        "请在创作中遵循以上所有 Skill 的原则。",
    ])
    return "\n".join(parts).strip()

def inject(content: str, assembled_skills: list[AssembledSkill]) -> str:
    """将技能层注入到内容中"""
    skill_layer = build_skill_layer(assembled_skills)
    if not skill_layer:
        return content

    if PLACEHOLDER in content:
        return content.replace(PLACEHOLDER, skill_layer)
    return f"{content}\n\n{skill_layer}"


class SkillInjector:
    """向后兼容的包装器类 - 请直接使用 inject 和 build_skill_layer 函数"""
    PLACEHOLDER = PLACEHOLDER

    def build_skill_layer(self, assembled_skills: list[AssembledSkill]) -> str:
        return build_skill_layer(assembled_skills)

    def inject(self, prompt: str, assembled_skills: list[AssembledSkill]) -> str:
        return inject(prompt, assembled_skills)
