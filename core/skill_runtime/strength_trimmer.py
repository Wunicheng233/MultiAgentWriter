from __future__ import annotations


class StrengthTrimmer:
    """Trim skill content by strength without requiring skill-specific code."""

    def trim(self, content: str, strength: float | int | None = 0.7) -> str:
        if not content:
            return ""

        try:
            value = float(strength if strength is not None else 0.7)
        except (TypeError, ValueError):
            value = 0.7

        value = max(0.0, min(1.0, value))
        if value <= 0:
            return ""
        if value >= 0.95:
            return content.strip()

        sections = self._split_markdown_sections(content)
        if len(sections) <= 1:
            return content.strip()

        if value <= 0.3:
            keep_count = max(1, round(len(sections) * 0.4))
        elif value <= 0.7:
            keep_count = max(1, round(len(sections) * 0.7))
        else:
            keep_count = len(sections)

        return "\n\n".join(sections[:keep_count]).strip()

    def _split_markdown_sections(self, content: str) -> list[str]:
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
