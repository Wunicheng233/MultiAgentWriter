"""
进度报告服务

职责：
- 统一管理生成进度的报告
- 报告工作流事件
- 处理取消检查
"""

from typing import Callable, Optional
from backend.utils.logger import logger


class ProgressReporter:
    """进度报告器"""

    def __init__(
        self,
        progress_callback: Optional[Callable[[int, str], None]] = None,
        cancellation_checker: Optional[Callable[[], None]] = None,
    ):
        """
        初始化进度报告器

        Args:
            progress_callback: 进度回调函数 (百分比, 消息) -> None
            cancellation_checker: 取消检查函数，抛出异常表示取消
        """
        self.progress_callback = progress_callback
        self.cancellation_checker = cancellation_checker
        self._last_progress_percent = 0

    def check_cancellation(self) -> None:
        """检查是否已取消"""
        if self.cancellation_checker:
            self.cancellation_checker()

    def report_progress(self, percent: int, message: str) -> None:
        """
        报告进度

        Args:
            percent: 进度百分比 0-100
            message: 进度消息
        """
        self.check_cancellation()
        self._last_progress_percent = percent
        logger.info(f"进度 {percent}%: {message}")
        if self.progress_callback:
            try:
                self.progress_callback(percent, message)
            except Exception as e:
                logger.error(f"进度回调执行失败: {e}")

    def report_workflow_event(self, message: str) -> None:
        """
        报告工作流事件（不推进进度条）

        Args:
            message: 事件消息
        """
        self.check_cancellation()
        logger.info(message)
        if self.progress_callback:
            try:
                self.progress_callback(self._last_progress_percent, message)
            except Exception as e:
                logger.error(f"工作流事件回调执行失败: {e}")
