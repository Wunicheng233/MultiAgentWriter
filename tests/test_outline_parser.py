"""
大纲解析模块单元测试
"""

import unittest
from backend.core.outline_parser import parse_outlines_from_setting_bible


class TestOutlineParser(unittest.TestCase):
    """测试大纲解析功能"""

    def test_parse_empty_bible_returns_empty(self):
        """空的设定圣经返回空列表"""
        result = parse_outlines_from_setting_bible(
            setting_bible=None,
            plan=None,
            chapter_word_count="2000",
        )
        self.assertEqual(result, [])

    def test_parse_bible_with_table_format(self):
        """解析表格格式的大纲"""
        bible = """# 设定圣经

## 分章大纲

| 章节 | 本章目标（情节推进） | 核心冲突/爽点 | 结尾钩子 |
| :--- | :--- | :--- | :--- |
| 第1章 | 主角抵达码头 | 线人失踪 | 箱子发出声音 |
| 第2章 | 主角追查货单 | 对手销毁证据 | 货单指向熟人 |
"""
        result = parse_outlines_from_setting_bible(
            setting_bible=bible,
            plan=None,
            chapter_word_count="2000",
        )

        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]['chapter_num'], 1)
        self.assertEqual(result[1]['chapter_num'], 2)

    def test_fallback_to_plan_when_no_outlines_found(self):
        """如果没有解析到大纲，回退使用 plan 作为唯一一章"""
        bible = """# 设定圣经

这只是一些设定内容
没有章节信息
"""
        plan = "完整的策划方案内容"
        result = parse_outlines_from_setting_bible(
            setting_bible=bible,
            plan=plan,
            chapter_word_count="2000",
        )

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['chapter_num'], 1)
        self.assertEqual(result[0]['outline'], plan)

    def test_target_word_count_is_set(self):
        """每章目标字数正确设置"""
        bible = """
| 章节 | 本章目标 | 核心冲突 | 结尾钩子 |
| :--- | :--- | :--- | :--- |
| 第1章 | 测试目标 | 测试冲突 | 测试钩子 |
"""
        result = parse_outlines_from_setting_bible(
            setting_bible=bible,
            plan=None,
            chapter_word_count="3000",
        )

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['target_word_count'], 3000)

    def test_scene_anchor_section_is_skipped_in_table_format(self):
        """表格格式中场景锚点部分被跳过"""
        bible = """
| 章节 | 本章目标 | 核心冲突 | 结尾钩子 |
| :--- | :--- | :--- | :--- |
| 第1章 | 测试目标 | 测试冲突 | 测试钩子 |

## Scene Anchors
### 第1章
```json
{"scene_anchors": []}
```
"""
        result = parse_outlines_from_setting_bible(
            setting_bible=bible,
            plan=None,
            chapter_word_count="2000",
        )

        # 场景锚点标记应该不影响章节解析
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['chapter_num'], 1)

    def test_scene_anchors_attached_to_outline(self):
        """场景锚点被附加到大纲中"""
        bible = """
| 章节 | 本章目标 | 核心冲突 | 结尾钩子 |
| :--- | :--- | :--- | :--- |
| 第1章 | 测试目标 | 测试冲突 | 测试钩子 |

## Scene Anchors
### 第1章
```json
{"scene_anchors": [{"scene_id": "test"}]}
```
"""
        result = parse_outlines_from_setting_bible(
            setting_bible=bible,
            plan=None,
            chapter_word_count="2000",
        )

        self.assertEqual(len(result), 1)
        # 场景锚点的 JSON 应该被包含在 outline 中
        self.assertIn('scene_anchors', result[0]['outline'])


if __name__ == '__main__':
    unittest.main()
