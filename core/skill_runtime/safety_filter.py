from __future__ import annotations

import re


class SafetyFilter:
    """Remove prompt fragments that should not be injected as user-configurable skills."""

    BLOCKED_PATTERNS = (
        "你是",
        "我是",
        "扮演",
        "身份是",
        "请你作为",
        "政治",
        "意识形态",
        "价值观",
        "立场",
        "我不擅长",
        "我的局限",
        "我不会",
    )
    UNSAFE_BLOCK_RE = re.compile(
        r"<!--\s*unsafe:start\s*-->[\s\S]*?<!--\s*unsafe:end\s*-->",
        re.IGNORECASE,
    )
    ROLEPLAY_SECTION_RE = re.compile(
        r"\n##\s*(角色扮演规则|示例对话|回答工作流|Agentic Protocol)[\s\S]*?(?=\n##\s+|\Z)",
        re.IGNORECASE,
    )

    def filter(self, content: str, mode: str = "style_only") -> str:
        if not content:
            return ""

        filtered = self.UNSAFE_BLOCK_RE.sub("", content)
        if mode != "style_only":
            return filtered.strip()

        filtered = self.ROLEPLAY_SECTION_RE.sub("", filtered)
        safe_lines = []
        for line in filtered.splitlines():
            if any(pattern in line for pattern in self.BLOCKED_PATTERNS):
                continue
            safe_lines.append(line)
        return "\n".join(safe_lines).strip()
