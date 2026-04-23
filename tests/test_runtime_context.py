import tempfile
import unittest
from pathlib import Path

import config
from core.worldview_manager import WorldviewManager
from utils import vector_db


class RuntimeContextIsolationTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.workspace = Path(self.temp_dir.name)
        self.original_output_dir = config.CURRENT_OUTPUT_DIR

    def tearDown(self):
        config.CURRENT_OUTPUT_DIR = self.original_output_dir
        self.temp_dir.cleanup()

    def test_vector_collection_names_follow_current_output_dir_dynamically(self):
        config.CURRENT_OUTPUT_DIR = None
        self.assertEqual(vector_db._get_current_chapter_collection_name(), "novel_chapter_content_default")
        self.assertEqual(vector_db._get_current_setting_collection_name(), "novel_world_setting_default")

        config.CURRENT_OUTPUT_DIR = self.workspace / "project-a"
        self.assertEqual(vector_db._get_current_chapter_collection_name(), "chapters_project-a")
        self.assertEqual(vector_db._get_current_setting_collection_name(), "settings_project-a")

        config.CURRENT_OUTPUT_DIR = self.workspace / "project-b"
        self.assertEqual(vector_db._get_current_chapter_collection_name(), "chapters_project-b")
        self.assertEqual(vector_db._get_current_setting_collection_name(), "settings_project-b")

    def test_worldview_reset_uses_current_project_path_without_mutating_default_state(self):
        project_a = self.workspace / "project-a"
        project_b = self.workspace / "project-b"
        project_a.mkdir()
        project_b.mkdir()

        config.CURRENT_OUTPUT_DIR = project_a
        manager = WorldviewManager()
        self.assertEqual(manager.file_path, project_a / "worldview_state.json")

        manager.add_character("hero", {"name": "主角"})
        self.assertIn("hero", manager.state["characters"])

        config.CURRENT_OUTPUT_DIR = project_b
        manager.reset_worldview()

        self.assertEqual(manager.file_path, project_b / "worldview_state.json")
        self.assertEqual(manager.state["characters"], {})
        self.assertTrue((project_b / "worldview_state.json").exists())


if __name__ == "__main__":
    unittest.main()
