from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.database import Base
from backend.models import Chapter, Project, User
from services.export_service import ExportService


class ExportServiceSecurityTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.workspace = Path(self.temp_dir.name)
        self.engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        Base.metadata.create_all(bind=self.engine)

    def tearDown(self):
        self.engine.dispose()
        self.temp_dir.cleanup()

    def test_html_export_sanitizes_metadata_and_chapter_content(self):
        db = self.SessionLocal()
        try:
            user = User(
                username='author<script>alert("name")</script>',
                email="author@example.com",
                hashed_password="hashed",
                is_active=True,
            )
            db.add(user)
            db.flush()

            project = Project(
                user_id=user.id,
                name='Bad <img src=x onerror="alert(1)"> Title',
                description='Description <script>alert("desc")</script>',
                content_type="full_novel",
                status="completed",
                config={
                    "novel_name": 'Novel <script>alert("title")</script>',
                    "novel_description": 'Desc <img src=x onerror="alert(2)">',
                },
            )
            db.add(project)
            db.flush()

            db.add(
                Chapter(
                    project_id=project.id,
                    chapter_index=1,
                    title='Chapter <script>alert("chapter")</script>',
                    content='<p onclick="alert(3)">正文</p><script>alert("body")</script><a href="javascript:alert(4)">坏链接</a>',
                    word_count=2,
                )
            )
            db.commit()

            service = ExportService(db, project.id)
            file_path, _filename = service.export_html(str(self.workspace))
            exported = Path(file_path).read_text(encoding="utf-8").lower()

            self.assertNotIn("<script", exported)
            self.assertNotIn("onerror", exported)
            self.assertNotIn("onclick", exported)
            self.assertNotIn("javascript:", exported)
            self.assertNotIn("&lt;script", exported)
            self.assertNotIn("&lt;img", exported)
            self.assertIn("正文", exported)
        finally:
            db.close()


if __name__ == "__main__":
    unittest.main()
