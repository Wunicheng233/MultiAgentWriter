"""
修复管理器单元测试
"""

import unittest
from unittest.mock import MagicMock
from core.repair_manager import RepairManager


class TestRepairManager(unittest.TestCase):
    """测试修复管理器功能"""

    def setUp(self):
        """设置测试环境"""
        self.mock_revise = MagicMock()
        self.setting_bible = "测试设定圣经"
        self.chapter_outline = "测试章节大纲"
        self.chapter_index = 1
        self.manager = RepairManager(
            revise_agent=self.mock_revise,
            setting_bible=self.setting_bible,
            chapter_outline=self.chapter_outline,
            chapter_index=self.chapter_index,
            perspective=None,
            perspective_strength=0.7,
        )

    def test_initialization(self):
        """测试初始化"""
        self.assertEqual(self.manager.chapter_index, 1)
        self.assertEqual(self.manager.setting_bible, self.setting_bible)
        self.assertEqual(len(self.manager.stitching_reports), 0)

    def test_stitching_pass_no_stitcher_available(self):
        """当没有 stitch_chapter 方法时返回原内容"""
        self.mock_revise.stitch_chapter = None
        original_content = "原始章节内容"

        result = self.manager.run_stitching_pass(original_content, [])

        self.assertEqual(result, original_content)
        self.assertEqual(len(self.manager.stitching_reports), 1)
        self.assertFalse(self.manager.stitching_reports[0]["applied"])

    def test_stitching_pass_with_stitcher_returns_same(self):
        """当拼接返回相同内容时标记未应用"""
        original_content = "原始章节内容"
        self.mock_revise.stitch_chapter = MagicMock(return_value=original_content)

        result = self.manager.run_stitching_pass(original_content, [])

        self.assertEqual(result, original_content)
        self.assertEqual(len(self.manager.stitching_reports), 1)
        self.assertFalse(self.manager.stitching_reports[0]["applied"])

    def test_stitching_pass_with_stitcher_returns_different(self):
        """当拼接返回不同内容时标记已应用"""
        original_content = "原始章节内容"
        stitched_content = "修复后的章节内容"
        self.mock_revise.stitch_chapter = MagicMock(return_value=stitched_content)

        result = self.manager.run_stitching_pass(original_content, [])

        self.assertEqual(result, stitched_content)
        self.assertEqual(len(self.manager.stitching_reports), 1)
        self.assertTrue(self.manager.stitching_reports[0]["applied"])
        self.mock_revise.stitch_chapter.assert_called_once()

    def test_stitching_pass_perspective_params(self):
        """验证视角参数正确传递给 stitch_chapter"""
        manager_with_perspective = RepairManager(
            revise_agent=self.mock_revise,
            setting_bible=self.setting_bible,
            chapter_outline=self.chapter_outline,
            chapter_index=1,
            perspective="liu-cixin",
            perspective_strength=0.8,
        )
        self.mock_revise.stitch_chapter = MagicMock(return_value="修复后内容")

        manager_with_perspective.run_stitching_pass("原始内容", [])

        call_args = self.mock_revise.stitch_chapter.call_args
        self.assertEqual(call_args[1]["perspective"], "liu-cixin")
        self.assertEqual(call_args[1]["perspective_strength"], 0.8)

    def test_event_reporter_called(self):
        """验证事件报告回调被调用"""
        events = []

        def reporter(msg):
            events.append(msg)

        manager_with_reporter = RepairManager(
            revise_agent=self.mock_revise,
            setting_bible=self.setting_bible,
            chapter_outline=self.chapter_outline,
            chapter_index=1,
            event_reporter=reporter,
        )
        self.mock_revise.stitch_chapter = MagicMock(return_value="修复后内容")

        manager_with_reporter.run_stitching_pass("原始内容", [])

        self.assertEqual(len(events), 1)
        self.assertIn("Stitching Pass", events[0])

    def test_apply_repair_batch_fallback_to_full_revise(self):
        """当本地修复不适用时，回退到整章修订"""
        issues = [{"type": "plot_hole", "fix_strategy": "rewrite"}]
        self.mock_revise.revise_chapter = MagicMock(return_value="修订后的内容")

        result, used_local, trace = self.manager.apply_repair_batch(
            "原始内容", issues
        )

        self.assertEqual(result, "修订后的内容")
        self.assertFalse(used_local)
        self.mock_revise.revise_chapter.assert_called_once()

    def test_apply_repair_batch_perspective_params(self):
        """验证视角参数正确传递给 revise_chapter"""
        manager_with_perspective = RepairManager(
            revise_agent=self.mock_revise,
            setting_bible=self.setting_bible,
            chapter_outline=self.chapter_outline,
            chapter_index=1,
            perspective="liu-cixin",
            perspective_strength=0.8,
        )
        issues = [{"type": "plot_hole"}]
        manager_with_perspective.apply_repair_batch("原始内容", issues)

        call_args = self.mock_revise.revise_chapter.call_args
        self.assertEqual(call_args[1]["perspective"], "liu-cixin")
        self.assertEqual(call_args[1]["perspective_strength"], 0.8)


if __name__ == "__main__":
    unittest.main()
