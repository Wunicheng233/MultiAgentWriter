"""
章节持久化服务

职责：
- 保存章节内容到文件
- 记录章节元数据（字数、质量评分等）
- 管理章节版本历史
"""

from pathlib import Path
from typing import List, Dict, Any, Optional
from utils.file_utils import save_output
from utils.logger import logger


class ChapterSaver:
    """章节持久化服务"""

    def __init__(
        self,
        output_dir: Path,
        novel_name: str = "unknown_novel",
    ):
        """
        初始化章节保存服务

        Args:
            output_dir: 输出目录
            novel_name: 小说名称
        """
        self.output_dir = output_dir
        self.novel_name = novel_name
        self._chapter_metadata: Dict[int, Dict[str, Any]] = {}

    def save_chapter(
        self,
        chapter_index: int,
        content: str,
        quality_score: float = 0.0,
        status: str = "completed",
        revision_count: int = 0,
    ) -> Path:
        """
        保存章节内容和元数据

        Args:
            chapter_index: 章节序号
            content: 章节内容
            quality_score: 质量评分
            status: 章节状态
            revision_count: 修订次数

        Returns:
            保存后的文件路径
        """
        word_count = len(content)

        # 保存内容文件
        filename = f"chapter_{chapter_index}.txt"
        file_path = save_output(content, filename, self.output_dir)

        # 记录元数据
        self._chapter_metadata[chapter_index] = {
            "chapter_index": chapter_index,
            "word_count": word_count,
            "quality_score": quality_score,
            "status": status,
            "revision_count": revision_count,
            "file_path": str(file_path),
        }

        logger.info(f"第 {chapter_index} 章已保存，{word_count} 字，评分 {quality_score}/10")
        return file_path

    def get_chapter_metadata(self, chapter_index: int) -> Optional[Dict[str, Any]]:
        """获取章节元数据"""
        return self._chapter_metadata.get(chapter_index)

    def list_all_chapters(self) -> List[Dict[str, Any]]:
        """列出所有已保存章节的元数据"""
        return sorted(self._chapter_metadata.values(), key=lambda x: x["chapter_index"])

    def get_total_word_count(self) -> int:
        """获取总字数"""
        return sum(m.get("word_count", 0) for m in self._chapter_metadata.values())

    def get_average_quality_score(self) -> float:
        """获取平均质量评分"""
        scores = [
            m.get("quality_score", 0.0)
            for m in self._chapter_metadata.values()
            if m.get("quality_score", 0.0) > 0
        ]
        if not scores:
            return 0.0
        return sum(scores) / len(scores)
