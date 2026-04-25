"""
章节保存服务单元测试
"""

import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from core.chapter_saver import ChapterSaver


class TestChapterSaver(unittest.TestCase):
    """测试章节保存服务"""

    def setUp(self):
        """设置临时目录"""
        self.temp_dir = TemporaryDirectory()
        self.output_dir = Path(self.temp_dir.name)
        self.saver = ChapterSaver(self.output_dir, "test_novel")

    def tearDown(self):
        """清理临时目录"""
        self.temp_dir.cleanup()

    def test_initialization(self):
        """测试初始化"""
        self.assertEqual(self.saver.output_dir, self.output_dir)
        self.assertEqual(self.saver.novel_name, "test_novel")
        self.assertEqual(len(self.saver._chapter_metadata), 0)

    def test_save_chapter(self):
        """测试保存章节"""
        content = "这是第一章的内容。" * 10
        file_path = self.saver.save_chapter(
            chapter_index=1,
            content=content,
            quality_score=8.5,
            status="completed",
            revision_count=1,
        )

        self.assertTrue(file_path.exists())
        self.assertEqual(file_path.name, "chapter_1.txt")

        # 验证元数据
        meta = self.saver.get_chapter_metadata(1)
        self.assertIsNotNone(meta)
        self.assertEqual(meta["chapter_index"], 1)
        self.assertEqual(meta["quality_score"], 8.5)
        self.assertEqual(meta["status"], "completed")
        self.assertEqual(meta["revision_count"], 1)

    def test_get_chapter_metadata_not_found(self):
        """测试获取不存在的章节元数据"""
        meta = self.saver.get_chapter_metadata(999)
        self.assertIsNone(meta)

    def test_list_all_chapters(self):
        """测试列出所有章节"""
        self.saver.save_chapter(1, "内容一", 8.0)
        self.saver.save_chapter(2, "内容二", 7.5)
        self.saver.save_chapter(3, "内容三", 9.0)

        chapters = self.saver.list_all_chapters()
        self.assertEqual(len(chapters), 3)
        self.assertEqual(chapters[0]["chapter_index"], 1)
        self.assertEqual(chapters[1]["chapter_index"], 2)
        self.assertEqual(chapters[2]["chapter_index"], 3)

    def test_get_total_word_count(self):
        """测试获取总字数"""
        self.saver.save_chapter(1, "a" * 100, 8.0)
        self.saver.save_chapter(2, "b" * 200, 7.5)

        total = self.saver.get_total_word_count()
        self.assertEqual(total, 300)

    def test_get_average_quality_score(self):
        """测试获取平均质量评分"""
        self.saver.save_chapter(1, "内容一", 8.0)
        self.saver.save_chapter(2, "内容二", 7.0)
        self.saver.save_chapter(3, "内容三", 9.0)

        avg = self.saver.get_average_quality_score()
        self.assertEqual(avg, 8.0)

    def test_get_average_quality_score_no_data(self):
        """测试没有评分数据时返回 0"""
        avg = self.saver.get_average_quality_score()
        self.assertEqual(avg, 0.0)


if __name__ == "__main__":
    unittest.main()
