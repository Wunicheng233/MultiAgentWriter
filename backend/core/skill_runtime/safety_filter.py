from __future__ import annotations

import re

BLOCKED_PATTERNS = {
    "你是", "我是", "扮演", "身份是", "请你作为",
    "政治", "意识形态", "价值观", "立场",
    "我不擅长", "我的局限", "我不会",
}

UNSAFE_BLOCK_RE = re.compile(
    r"<!--\s*unsafe:start\s*-->[\s\S]*?<!--\s*unsafe:end\s*-->", re.IGNORECASE
)
ROLEPLAY_SECTION_RE = re.compile(
    r"\n##\s*(角色扮演规则|示例对话|回答工作流|Agentic Protocol)[\s\S]*?(?=\n##\s+|\Z)",
    re.IGNORECASE,
)

def filter_unsafe_content(content: str, mode: str = "style_only") -> str:
    """过滤不安全的内容"""
    # 移除 unsafe 块
    content = UNSAFE_BLOCK_RE.sub("", content)

    # 移除角色扮演章节 (仅 style_only 模式)
    if mode == "style_only":
        content = ROLEPLAY_SECTION_RE.sub("", content)

    lines = content.split("\n")
    filtered = [
        line for line in lines
        if not any(pattern in line for pattern in BLOCKED_PATTERNS)
    ]
    return "\n".join(filtered)


class SafetyFilter:
    """向后兼容的包装器类 - 请直接使用 filter_unsafe_content 函数"""
    def filter(self, content: str, mode: str = "style_only") -> str:
        return filter_unsafe_content(content, mode=mode)
