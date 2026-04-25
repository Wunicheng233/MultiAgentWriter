#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
JSON 解析工具 - 统一处理从 Agent 输出中提取和解析 JSON 的逻辑
"""

import json
import re
from typing import Dict, Optional
from utils.logger import logger


def extract_json_from_markdown(text: str) -> str:
    """从markdown中提取JSON内容。"""
    # 匹配 ```json ... ```
    json_block_pattern = r'```(?:json)?\s*({[\s\S]*?})\s*```'
    match = re.search(json_block_pattern, text)
    if match:
        return match.group(1)

    # 匹配 {...} 整块
    curly_pattern = r'({[\s\S]*})'
    match = re.search(curly_pattern, text)
    if match:
        return match.group(1)

    # 如果都没找到，返回原文本尝试直接解析
    return text.strip()


def parse_json_result(result: str) -> Optional[Dict]:
    """从输出中提取并解析JSON。"""
    try:
        # 尝试提取被markdown包裹的JSON
        json_text = extract_json_from_markdown(result)
        data = json.loads(json_text)
        return data
    except Exception as e:
        logger.warning(f"JSON解析失败: {e}")
        return None
