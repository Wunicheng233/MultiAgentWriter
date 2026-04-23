import asyncio
import json
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import backend.api.projects as projects_api
import backend.deps as deps
import agents.writer_agent as writer_agent
import core.orchestrator as orchestrator_module
import utils.file_utils as file_utils
import utils.volc_engine as volc_engine
from backend.api.auth import clear_api_key, refresh_api_key, register
from backend.api.chapters import restore_version, update_chapter
from backend.chapter_sync import html_content_to_plain_text
from backend.database import Base, get_db
from backend.deps import get_current_user
from backend.main import app
from backend.models import Chapter, ChapterVersion, GenerationTask, Project, ProjectCollaborator, ShareLink, User
from backend.schemas import ChapterUpdate, UserCreate
from core.orchestrator import NovelOrchestrator


class ReviewFixRegressionTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.workspace = Path(self.temp_dir.name)
        self.db_path = self.workspace / "test.db"
        self.engine = create_engine(
            f"sqlite:///{self.db_path}",
            connect_args={"check_same_thread": False},
        )
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        Base.metadata.create_all(bind=self.engine)

        app.dependency_overrides.clear()
        app.dependency_overrides[get_db] = self._override_get_db
        self.client = TestClient(app)

    def tearDown(self):
        app.dependency_overrides.clear()
        self.engine.dispose()
        self.temp_dir.cleanup()

    def _override_get_db(self):
        db = self.SessionLocal()
        try:
            yield db
        finally:
            db.close()

    def _set_current_user(self, user):
        async def override_current_user():
            return user

        app.dependency_overrides[get_current_user] = override_current_user

    def _create_user(self, username: str, email: str) -> User:
        db = self.SessionLocal()
        try:
            user = User(
                username=username,
                email=email,
                hashed_password="hashed",
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            db.expunge(user)
            return user
        finally:
            db.close()

    def _create_project(self, owner: User, name: str = "Project", file_path: str | None = None) -> Project:
        db = self.SessionLocal()
        try:
            project = Project(
                user_id=owner.id,
                name=name,
                description="demo",
                content_type="full_novel",
                status="draft",
                file_path=file_path,
                config={"novel_name": name},
            )
            db.add(project)
            db.commit()
            db.refresh(project)
            db.expunge(project)
            return project
        finally:
            db.close()

    def test_shared_project_endpoint_loads_related_project(self):
        owner = self._create_user("owner", "owner@example.com")
        project = self._create_project(owner, name="Shared Novel")

        db = self.SessionLocal()
        try:
            db.add(Chapter(project_id=project.id, chapter_index=1, title="第一章", content="<p>内容</p>", word_count=2))
            db.add(ShareLink(project_id=project.id, share_token="public-token"))
            db.commit()
        finally:
            db.close()

        response = self.client.get("/api/share/public-token")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["title"], "Shared Novel")
        self.assertEqual(payload["author"], "owner")
        self.assertEqual(len(payload["chapters"]), 1)

    def test_collaborator_list_can_access_related_user(self):
        owner = self._create_user("owner2", "owner2@example.com")
        teammate = self._create_user("teammate", "teammate@example.com")
        project = self._create_project(owner, name="Team Novel")

        db = self.SessionLocal()
        try:
            db.add(
                ProjectCollaborator(
                    project_id=project.id,
                    user_id=teammate.id,
                    role="viewer",
                )
            )
            db.commit()
        finally:
            db.close()

        self._set_current_user(owner)
        response = self.client.get(f"/api/projects/{project.id}/collaborators")
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(len(payload), 1)
        self.assertEqual(payload[0]["username"], "teammate")

    def test_register_does_not_seed_random_model_api_key(self):
        db = self.SessionLocal()
        try:
            user = register(
                UserCreate(username="newbie", email="newbie@example.com", password="secret123"),
                db=db,
            )
            self.assertIsNone(user.api_key)
        finally:
            db.close()

    def test_refresh_api_key_compat_endpoint_clears_custom_model_api_key(self):
        owner = self._create_user("api_owner", "api_owner@example.com")

        db = self.SessionLocal()
        try:
            user = db.query(User).filter(User.id == owner.id).one()
            user.api_key = "custom-model-key"
            db.commit()

            refreshed_user = refresh_api_key(current_user=user, db=db)
            self.assertIsNone(refreshed_user.api_key)

            user.api_key = "another-custom-key"
            db.commit()
            cleared_user = clear_api_key(current_user=user, db=db)
            self.assertIsNone(cleared_user.api_key)
        finally:
            db.close()

    def test_auth_dependency_does_not_log_raw_token_or_payload(self):
        owner = self._create_user("auth_log_owner", "auth_log_owner@example.com")
        raw_token = "super-secret-token"

        class FakeRequest:
            headers = {"Authorization": f"Bearer {raw_token}"}

        db = self.SessionLocal()
        original_decode_token = deps.decode_token
        try:
            deps.decode_token = lambda token: {"sub": str(owner.id), "role": "sensitive-payload"}
            with self.assertLogs("backend.deps", level="DEBUG") as logs:
                user = asyncio.run(deps.get_current_user(FakeRequest(), db=db))

            self.assertEqual(user.id, owner.id)
            log_text = "\n".join(logs.output)
            self.assertNotIn(raw_token, log_text)
            self.assertNotIn("Bearer", log_text)
            self.assertNotIn("sensitive-payload", log_text)
        finally:
            deps.decode_token = original_decode_token
            db.close()

    def test_html_content_to_plain_text_removes_editor_markup(self):
        content = "<p>第一段</p><p>第二段<br/>换行</p>"
        plain_text = html_content_to_plain_text(content)

        self.assertIn("第一段", plain_text)
        self.assertIn("第二段", plain_text)
        self.assertIn("换行", plain_text)
        self.assertNotIn("<p>", plain_text)

    def test_volc_retry_preserves_client_and_context(self):
        captured_contexts = []

        class FakeMessage:
            content = "成功"

        class FakeChoice:
            message = FakeMessage()

        class FakeUsage:
            prompt_tokens = 0
            completion_tokens = 0
            total_tokens = 0

        class FakeResponse:
            choices = [FakeChoice()]
            usage = FakeUsage()

        class FakeCompletions:
            def __init__(self):
                self.calls = 0

            def create(self, **kwargs):
                self.calls += 1
                if self.calls == 1:
                    raise RuntimeError("temporary")
                return FakeResponse()

        class FakeClient:
            def __init__(self):
                self.chat = SimpleNamespace(completions=FakeCompletions())

        fake_client = FakeClient()
        original_load_prompt = file_utils.load_prompt
        original_sleep = volc_engine.time.sleep
        try:
            file_utils.load_prompt = lambda agent_role, content_type=None, context=None: captured_contexts.append(context) or "system"
            volc_engine.time.sleep = lambda seconds: None
            result = volc_engine.call_volc_api(
                agent_role="writer",
                user_input="input",
                client=fake_client,
                context={"world_bible": "设定"},
                max_retries=2,
            )
        finally:
            file_utils.load_prompt = original_load_prompt
            volc_engine.time.sleep = original_sleep

        self.assertEqual(result, "成功")
        self.assertEqual(captured_contexts, [{"world_bible": "设定"}, {"world_bible": "设定"}])

    def test_writer_title_retry_preserves_prompt_context(self):
        captured_contexts = []

        def fake_call_volc_api(*args, **kwargs):
            captured_contexts.append(kwargs.get("context"))
            if len(captured_contexts) == 1:
                return "没有标题的正文"
            return "第1章 标题\n\n正文"

        original_call = writer_agent.call_volc_api
        original_search_ref = writer_agent.search_reference_style
        try:
            writer_agent.call_volc_api = fake_call_volc_api
            writer_agent.search_reference_style = lambda *args, **kwargs: ""
            result = writer_agent.generate_chapter(
                setting_bible="设定",
                plan="第1章 大纲",
                chapter_num=1,
                content_type="novel",
            )
        finally:
            writer_agent.call_volc_api = original_call
            writer_agent.search_reference_style = original_search_ref

        self.assertTrue(result.startswith("第1章"))
        self.assertEqual(captured_contexts[0], captured_contexts[1])
        self.assertEqual(captured_contexts[0]["world_bible"], "设定")

    def test_update_chapter_writes_back_to_chapters_subdirectory(self):
        owner = self._create_user("owner3", "owner3@example.com")
        project_dir = self.workspace / "project-update"
        project_dir.mkdir()
        project = self._create_project(owner, file_path=str(project_dir))

        db = self.SessionLocal()
        try:
            db.add(
                Chapter(
                    project_id=project.id,
                    chapter_index=1,
                    title="第一章",
                    content="<p>旧内容</p>",
                    word_count=3,
                    status="generated",
                )
            )
            db.commit()
        finally:
            db.close()

        db = self.SessionLocal()
        try:
            chapter = update_chapter(
                project.id,
                1,
                ChapterUpdate(content="<p>新内容</p>"),
                current_user=owner,
                db=db,
            )
            chapter_path = project_dir / "chapters" / "chapter_1.txt"
            self.assertTrue(chapter_path.exists())
            self.assertEqual(chapter.content, "<p>新内容</p>")
            self.assertEqual(chapter_path.read_text(encoding="utf-8"), "第一章\n\n新内容")
        finally:
            db.close()

    def test_restore_version_writes_back_to_chapters_subdirectory(self):
        owner = self._create_user("owner4", "owner4@example.com")
        project_dir = self.workspace / "project-restore"
        project_dir.mkdir()
        project = self._create_project(owner, file_path=str(project_dir))

        db = self.SessionLocal()
        try:
            chapter = Chapter(
                project_id=project.id,
                chapter_index=1,
                title="第一章",
                content="<p>当前内容</p>",
                word_count=4,
                status="generated",
            )
            db.add(chapter)
            db.commit()
            db.refresh(chapter)

            version = ChapterVersion(
                chapter_id=chapter.id,
                version_number=1,
                content="<p>历史内容</p>",
                word_count=4,
            )
            db.add(version)
            db.commit()
            version_id = version.id
        finally:
            db.close()

        db = self.SessionLocal()
        try:
            chapter = restore_version(
                project.id,
                1,
                version_id,
                current_user=owner,
                db=db,
            )
            chapter_path = project_dir / "chapters" / "chapter_1.txt"
            self.assertTrue(chapter_path.exists())
            self.assertEqual(chapter.content, "<p>历史内容</p>")
            self.assertEqual(chapter_path.read_text(encoding="utf-8"), "第一章\n\n历史内容")
        finally:
            db.close()

    def test_resume_with_feedback_rewrites_existing_chapter_instead_of_skipping(self):
        project_dir = self.workspace / "orchestrator-project"
        chapters_dir = project_dir / "chapters"
        chapters_dir.mkdir(parents=True)
        chapter_path = chapters_dir / "chapter_1.txt"
        chapter_path.write_text("旧章节内容", encoding="utf-8")
        feedback_path = project_dir / "feedback_1.txt"
        feedback_path.write_text("请重写", encoding="utf-8")

        orchestrator = NovelOrchestrator.__new__(NovelOrchestrator)
        orchestrator.output_dir = project_dir
        orchestrator.info_path = project_dir / "info.json"
        orchestrator.start_chapter = 1
        orchestrator.end_chapter = 1
        orchestrator.chapter_word_count = "2000"
        orchestrator.chapter_outlines = [{"chapter_num": 1, "title": "第一章", "outline": "剧情", "target_word_count": 2000}]
        orchestrator.novel_name = "Test Novel"
        orchestrator.plan = "plan"
        orchestrator.setting_bible = "bible"
        orchestrator.req = {"content_type": "novel"}
        orchestrator.content_type = "novel"
        orchestrator.dimension_scores = {"plot": [], "character": [], "hook": [], "writing": [], "setting": []}
        orchestrator.allow_plot_adjustment = False
        orchestrator.run_planner = lambda confirmation_handler=None: "bible"
        orchestrator._report_progress = lambda *args, **kwargs: None
        orchestrator.run_chapter_generation = lambda *args, **kwargs: (_ for _ in ()).throw(AssertionError("should use feedback rewrite path"))

        class FakeRevise:
            def revise_chapter(self, existing_content, issues, setting_bible):
                return "重写后的章节内容"

        class FakeCritic:
            def critic_chapter(self, current_content, setting_bible, outline, content_type):
                return True, 9, {"plot": 9, "character": 9, "hook": 9, "writing": 9, "setting": 9}, []

        orchestrator.revise = FakeRevise()
        orchestrator.critic = FakeCritic()

        original_guardrails = orchestrator_module.run_system_guardrails
        try:
            orchestrator_module.run_system_guardrails = lambda content, context: SimpleNamespace(corrected_content=content)
            result = orchestrator.run_full_novel()
        finally:
            orchestrator_module.run_system_guardrails = original_guardrails

        self.assertEqual(chapter_path.read_text(encoding="utf-8"), "重写后的章节内容")
        self.assertFalse(feedback_path.exists())
        self.assertEqual(result["generated_chapters"], 1)
        info = json.loads((project_dir / "info.json").read_text(encoding="utf-8"))
        self.assertEqual(info["evaluation_harness_version"], "chapter-evaluation-v1")
        self.assertEqual(info["evaluation_reports"][0]["chapter_index"], 1)
        self.assertEqual(info["evaluation_reports"][0]["score"], 9.0)

    def test_export_download_requires_authenticated_access(self):
        owner = self._create_user("owner5", "owner5@example.com")
        project = self._create_project(owner, name="Export Novel")
        export_file = self.workspace / "story.html"
        export_file.write_text("<html></html>", encoding="utf-8")

        db = self.SessionLocal()
        try:
            db.add(
                GenerationTask(
                    project_id=project.id,
                    celery_task_id="celery-export-1",
                    status="success",
                    progress=1.0,
                )
            )
            db.commit()
        finally:
            db.close()

        class FakeAsyncResult:
            def __init__(self, task_id):
                self.task_id = task_id
                self.result = {
                    "file_path": str(export_file),
                    "filename": "story.html",
                    "format": "html",
                }

            def ready(self):
                return True

            def failed(self):
                return False

        original_async_result = projects_api.AsyncResult if hasattr(projects_api, "AsyncResult") else None
        import celery.result

        celery_async_result = celery.result.AsyncResult
        try:
            celery.result.AsyncResult = FakeAsyncResult
            response = self.client.get(f"/api/projects/{project.id}/export/download?task_id=1")
        finally:
            celery.result.AsyncResult = celery_async_result
            if original_async_result is not None:
                projects_api.AsyncResult = original_async_result

        self.assertEqual(response.status_code, 401)

    def test_editor_navigation_uses_registered_write_route(self):
        editor_source = Path("/Users/nobody1/Desktop/project/writer/frontend/src/pages/Editor.tsx").read_text(encoding="utf-8")
        self.assertNotIn("/projects/${id}/edit/", editor_source)
        self.assertIn("/projects/${id}/write/", editor_source)


if __name__ == "__main__":
    unittest.main()
