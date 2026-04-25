"""
进度报告服务单元测试
"""

import unittest
from unittest.mock import MagicMock, call
from core.progress_reporter import ProgressReporter


class TestProgressReporter(unittest.TestCase):
    """测试进度报告器"""

    def test_initialization(self):
        """测试初始化"""
        reporter = ProgressReporter()
        self.assertIsNone(reporter.progress_callback)
        self.assertIsNone(reporter.cancellation_checker)
        self.assertEqual(reporter._last_progress_percent, 0)

    def test_report_progress(self):
        """测试报告进度"""
        callback = MagicMock()
        reporter = ProgressReporter(progress_callback=callback)

        reporter.report_progress(50, "测试消息")

        callback.assert_called_once_with(50, "测试消息")
        self.assertEqual(reporter._last_progress_percent, 50)

    def test_report_progress_no_callback(self):
        """测试没有回调时也能正常工作"""
        reporter = ProgressReporter()
        reporter.report_progress(50, "测试消息")
        # 不报错就是成功
        self.assertEqual(reporter._last_progress_percent, 50)

    def test_report_workflow_event(self):
        """测试报告工作流事件"""
        callback = MagicMock()
        reporter = ProgressReporter(progress_callback=callback)

        reporter._last_progress_percent = 50
        reporter.report_workflow_event("事件消息")

        callback.assert_called_once_with(50, "事件消息")

    def test_check_cancellation(self):
        """测试取消检查"""
        checker = MagicMock()
        reporter = ProgressReporter(cancellation_checker=checker)

        reporter.check_cancellation()

        checker.assert_called_once()

    def test_cancellation_check_during_progress_report(self):
        """测试进度报告时自动检查取消"""
        checker = MagicMock()
        reporter = ProgressReporter(cancellation_checker=checker)

        reporter.report_progress(50, "测试")

        checker.assert_called_once()

    def test_callback_exception_handling(self):
        """测试回调异常不会中断流程"""
        bad_callback = MagicMock(side_effect=Exception("回调出错"))
        reporter = ProgressReporter(progress_callback=bad_callback)

        # 不应该抛出异常
        reporter.report_progress(50, "测试")

        bad_callback.assert_called_once()


if __name__ == "__main__":
    unittest.main()
