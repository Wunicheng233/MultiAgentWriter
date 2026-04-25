from __future__ import annotations


def _split_markdown_sections(content: str) -> list[str]:
    """按 markdown 二级标题分割内容"""
    sections: list[str] = []
    current: list[str] = []
    for line in content.strip().splitlines():
        is_section_heading = line.startswith("## ")
        if is_section_heading and current:
            sections.append("\n".join(current).strip())
            current = [line]
        else:
            current.append(line)
    if current:
        sections.append("\n".join(current).strip())
    return [section for section in sections if section]


def trim_by_strength(content: str, strength: float = 0.7) -> str:
    """根据强度裁剪内容"""
    if strength <= 0:
        return ""
    if strength >= 0.95:
        return content.strip()

    sections = _split_markdown_sections(content)
    if len(sections) <= 1:
        return content.strip()

    if strength <= 0.3:
        keep_count = max(1, round(len(sections) * 0.4))
    elif strength <= 0.7:
        keep_count = max(1, round(len(sections) * 0.7))
    else:
        # strength 在 (0.7, 0.95) 区间时线性增加到 100%
        ratio = 0.7 + 0.3 * (strength - 0.7) / 0.25
        keep_count = max(1, round(len(sections) * ratio))

    return "\n\n".join(sections[:keep_count]).strip()


class StrengthTrimmer:
    """向后兼容的包装器类 - 请直接使用 trim_by_strength 函数"""
    def trim(self, content: str, strength: float | int | None = 0.7) -> str:
        try:
            value = float(strength if strength is not None else 0.7)
        except (TypeError, ValueError):
            value = 0.7
        value = max(0.0, min(1.0, value))
        return trim_by_strength(content, strength=value)
