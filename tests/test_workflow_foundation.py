import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import backend.api.projects as projects_api
import backend.api.tasks as tasks_api
import tasks.writing_tasks as writing_tasks
from backend.database import Base, get_db
from backend.deps import get_current_user
from backend.main import app
from backend.models import Artifact, FeedbackItem, GenerationTask, Project, User, WorkflowRun, WorkflowStepRun
from backend.workflow_service import create_generation_workflow_run, update_workflow_run_status


class WorkflowFoundationTests(unittest.TestCase):
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
                config={
                    "novel_name": name,
                    "core_requirement": "一个少年踏上修仙路",
                    "chapter_word_count": 2000,
                    "start_chapter": 1,
                    "end_chapter": 3,
                },
            )
            db.add(project)
            db.commit()
            db.refresh(project)
            db.expunge(project)
            return project
        finally:
            db.close()

    def test_trigger_generation_creates_workflow_run_and_project_snapshot_artifact(self):
        owner = self._create_user("workflow_owner", "workflow_owner@example.com")
        project_dir = self.workspace / "workflow-project"
        project_dir.mkdir()
        project = self._create_project(owner, name="Workflow Novel", file_path=str(project_dir))
        self._set_current_user(owner)

        original_delay = projects_api.generate_novel_task.delay
        try:
            projects_api.generate_novel_task.delay = lambda project_dir, user_id: SimpleNamespace(id="celery-workflow-1")
            response = self.client.post(f"/api/projects/{project.id}/generate")
        finally:
            projects_api.generate_novel_task.delay = original_delay

        self.assertEqual(response.status_code, 200)

        db = self.SessionLocal()
        try:
            run = db.query(WorkflowRun).filter(WorkflowRun.project_id == project.id).one()
            self.assertEqual(run.status, "pending")
            self.assertEqual(run.run_kind, "generation")
            self.assertEqual(run.triggered_by_user_id, owner.id)
            self.assertIsNotNone(run.generation_task_id)

            artifact = db.query(Artifact).filter(Artifact.workflow_run_id == run.id).one()
            self.assertEqual(artifact.artifact_type, "project_config_snapshot")
            self.assertEqual(artifact.scope, "project")
            self.assertEqual(artifact.version_number, 1)
            self.assertTrue(artifact.is_current)
            self.assertEqual(artifact.content_json["novel_name"], "Workflow Novel")

            queued_step = db.query(WorkflowStepRun).filter(
                WorkflowStepRun.workflow_run_id == run.id,
                WorkflowStepRun.step_key == "queued_generation",
            ).one()
            self.assertEqual(queued_step.status, "completed")
            self.assertEqual(queued_step.step_type, "system")
        finally:
            db.close()

    def test_rejected_chapter_confirmation_persists_structured_feedback_item(self):
        owner = self._create_user("feedback_owner", "feedback_owner@example.com")
        project_dir = self.workspace / "feedback-project"
        project_dir.mkdir()
        project = self._create_project(owner, name="Feedback Novel", file_path=str(project_dir))
        self._set_current_user(owner)

        db = self.SessionLocal()
        try:
            task = GenerationTask(
                project_id=project.id,
                celery_task_id="celery-feedback-1",
                status="waiting_confirm",
                progress=0.5,
                current_chapter=2,
            )
            db.add(task)
            db.commit()
            db.refresh(task)

            run = WorkflowRun(
                project_id=project.id,
                generation_task_id=task.id,
                run_kind="generation",
                status="waiting_confirm",
                triggered_by_user_id=owner.id,
            )
            db.add(run)
            db.commit()
        finally:
            db.close()

        original_delay = tasks_api.generate_novel_task.delay
        try:
            tasks_api.generate_novel_task.delay = lambda project_dir, user_id: SimpleNamespace(id="celery-feedback-2")
            response = self.client.post(
                "/api/tasks/celery-feedback-1/confirm",
                json={"approved": False, "feedback": "这一章主角存在感太弱，重写并增强冲突。"},
            )
        finally:
            tasks_api.generate_novel_task.delay = original_delay

        self.assertEqual(response.status_code, 200)

        db = self.SessionLocal()
        try:
            feedback = db.query(FeedbackItem).filter(FeedbackItem.project_id == project.id).one()
            self.assertEqual(feedback.workflow_run.run_kind, "generation")
            self.assertEqual(feedback.feedback_scope, "chapter")
            self.assertEqual(feedback.feedback_type, "user_rejection")
            self.assertEqual(feedback.action_type, "rewrite")
            self.assertEqual(feedback.chapter_index, 2)
            self.assertEqual(feedback.created_by_user_id, owner.id)
            self.assertIn("主角存在感太弱", feedback.content)
        finally:
            db.close()

    def test_update_workflow_run_status_tracks_lifecycle_and_completion(self):
        owner = self._create_user("status_owner", "status_owner@example.com")
        project = self._create_project(owner, name="Status Novel")

        db = self.SessionLocal()
        try:
            task = GenerationTask(
                project_id=project.id,
                celery_task_id="celery-status-1",
                status="pending",
                progress=0.0,
            )
            db.add(task)
            db.commit()
            db.refresh(task)

            run = WorkflowRun(
                project_id=project.id,
                generation_task_id=task.id,
                run_kind="generation",
                trigger_source="manual",
                status="pending",
                current_step_key="queued_generation",
                triggered_by_user_id=owner.id,
            )
            db.add(run)
            db.commit()
            db.refresh(run)

            update_workflow_run_status(
                db=db,
                generation_task=task,
                task_status="started",
                current_step_key="booting",
            )
            db.refresh(run)
            self.assertEqual(run.status, "running")
            self.assertEqual(run.current_step_key, "booting")
            booting_step = db.query(WorkflowStepRun).filter(
                WorkflowStepRun.workflow_run_id == run.id,
                WorkflowStepRun.step_key == "booting",
            ).one()
            self.assertEqual(booting_step.status, "running")

            update_workflow_run_status(
                db=db,
                generation_task=task,
                task_status="progress",
                current_step_key="generating_chapter",
                current_chapter=3,
                metadata_updates={"last_message": "正在生成第 3 章..."},
            )
            db.refresh(run)
            self.assertEqual(run.status, "running")
            self.assertEqual(run.current_step_key, "generating_chapter")
            self.assertEqual(run.current_chapter, 3)
            self.assertEqual(run.run_metadata["last_message"], "正在生成第 3 章...")
            db.refresh(booting_step)
            self.assertEqual(booting_step.status, "completed")
            chapter_step = db.query(WorkflowStepRun).filter(
                WorkflowStepRun.workflow_run_id == run.id,
                WorkflowStepRun.step_key == "generating_chapter",
                WorkflowStepRun.chapter_index == 3,
            ).one()
            self.assertEqual(chapter_step.status, "running")
            self.assertEqual(chapter_step.step_type, "generator")
            self.assertEqual(chapter_step.step_data["last_message"], "正在生成第 3 章...")

            update_workflow_run_status(
                db=db,
                generation_task=task,
                task_status="waiting_confirm",
                current_step_key="waiting_confirm",
                current_chapter=3,
            )
            db.refresh(run)
            self.assertEqual(run.status, "waiting_confirm")
            self.assertEqual(run.current_step_key, "waiting_confirm")
            db.refresh(chapter_step)
            self.assertEqual(chapter_step.status, "completed")
            waiting_step = db.query(WorkflowStepRun).filter(
                WorkflowStepRun.workflow_run_id == run.id,
                WorkflowStepRun.step_key == "waiting_confirm",
                WorkflowStepRun.chapter_index == 3,
            ).one()
            self.assertEqual(waiting_step.status, "waiting_confirm")
            self.assertEqual(waiting_step.step_type, "approval")

            update_workflow_run_status(
                db=db,
                generation_task=task,
                task_status="success",
                current_step_key="completed",
            )
            db.refresh(run)
            self.assertEqual(run.status, "completed")
            self.assertEqual(run.current_step_key, "completed")
            self.assertIsNotNone(run.completed_at)
            db.refresh(waiting_step)
            self.assertEqual(waiting_step.status, "completed")
            completed_step = db.query(WorkflowStepRun).filter(
                WorkflowStepRun.workflow_run_id == run.id,
                WorkflowStepRun.step_key == "completed",
            ).one()
            self.assertEqual(completed_step.status, "completed")
            self.assertEqual(completed_step.step_type, "system")
        finally:
            db.close()

    def test_generate_novel_task_waiting_confirm_updates_workflow_run_status(self):
        owner = self._create_user("waiting_owner", "waiting_owner@example.com")
        project_dir = self.workspace / "waiting-project"
        project_dir.mkdir()
        project = self._create_project(owner, name="Waiting Novel", file_path=str(project_dir))

        db = self.SessionLocal()
        try:
            task = GenerationTask(
                project_id=project.id,
                celery_task_id="celery-waiting-1",
                status="pending",
                progress=0.0,
            )
            db.add(task)
            db.commit()
            db.refresh(task)
            create_generation_workflow_run(
                db=db,
                project=project,
                generation_task=task,
                triggered_by_user_id=owner.id,
            )
            db.commit()
        finally:
            db.close()

        class FakeOrchestrator:
            def __init__(self, project_dir, progress_callback, user_api_key):
                self.progress_callback = progress_callback

            def run_full_novel(self):
                self.progress_callback(35, "正在生成第 2 章...")
                raise writing_tasks.WaitingForConfirmationError(2, "待审阅章节")

        original_session_local = writing_tasks.SessionLocal
        original_orchestrator = writing_tasks.NovelOrchestrator
        try:
            writing_tasks.SessionLocal = self.SessionLocal
            writing_tasks.NovelOrchestrator = FakeOrchestrator
            writing_tasks.generate_novel_task.push_request(id="celery-waiting-1", retries=0)
            result = writing_tasks.generate_novel_task.run(project_dir=str(project_dir), user_id=str(owner.id))
        finally:
            writing_tasks.generate_novel_task.pop_request()
            writing_tasks.SessionLocal = original_session_local
            writing_tasks.NovelOrchestrator = original_orchestrator

        self.assertTrue(result["waiting_confirmation"])
        self.assertEqual(result["chapter_index"], 2)

        db = self.SessionLocal()
        try:
            task = db.query(GenerationTask).filter(GenerationTask.celery_task_id == "celery-waiting-1").one()
            run = db.query(WorkflowRun).filter(WorkflowRun.generation_task_id == task.id).one()
            self.assertEqual(task.status, "waiting_confirm")
            self.assertEqual(run.status, "waiting_confirm")
            self.assertEqual(run.current_step_key, "waiting_confirm")
            self.assertEqual(run.current_chapter, 2)
            self.assertTrue(run.run_metadata["waiting_confirmation"])
            step_keys = [
                (step.step_key, step.status, step.chapter_index)
                for step in db.query(WorkflowStepRun)
                .filter(WorkflowStepRun.workflow_run_id == run.id)
                .order_by(WorkflowStepRun.id)
            ]
            self.assertEqual(
                step_keys,
                [
                    ("queued_generation", "completed", None),
                    ("booting", "completed", None),
                    ("generating_chapter", "completed", 2),
                    ("waiting_confirm", "waiting_confirm", 2),
                ],
            )
        finally:
            db.close()

    def test_generate_novel_task_success_updates_workflow_run_status(self):
        owner = self._create_user("success_owner", "success_owner@example.com")
        project_dir = self.workspace / "success-project"
        project_dir.mkdir()
        chapters_dir = project_dir / "chapters"
        chapters_dir.mkdir()
        (chapters_dir / "chapter_1.txt").write_text("第1章 标题\n\n章节内容", encoding="utf-8")
        project = self._create_project(owner, name="Success Novel", file_path=str(project_dir))

        db = self.SessionLocal()
        try:
            task = GenerationTask(
                project_id=project.id,
                celery_task_id="celery-success-1",
                status="pending",
                progress=0.0,
            )
            db.add(task)
            db.commit()
            db.refresh(task)
            create_generation_workflow_run(
                db=db,
                project=project,
                generation_task=task,
                triggered_by_user_id=owner.id,
            )
            db.commit()
        finally:
            db.close()

        class FakeOrchestrator:
            def __init__(self, project_dir, progress_callback, user_api_key):
                self.progress_callback = progress_callback

            def run_full_novel(self):
                self.progress_callback(80, "正在生成第 1 章...")
                self.progress_callback(100, "🎉 完成")
                return {"generated_chapters": 1}

        original_session_local = writing_tasks.SessionLocal
        original_orchestrator = writing_tasks.NovelOrchestrator
        try:
            writing_tasks.SessionLocal = self.SessionLocal
            writing_tasks.NovelOrchestrator = FakeOrchestrator
            writing_tasks.generate_novel_task.push_request(id="celery-success-1", retries=0)
            result = writing_tasks.generate_novel_task.run(project_dir=str(project_dir), user_id=str(owner.id))
        finally:
            writing_tasks.generate_novel_task.pop_request()
            writing_tasks.SessionLocal = original_session_local
            writing_tasks.NovelOrchestrator = original_orchestrator

        self.assertTrue(result["success"])
        self.assertTrue(result["completed"])

        db = self.SessionLocal()
        try:
            task = db.query(GenerationTask).filter(GenerationTask.celery_task_id == "celery-success-1").one()
            run = db.query(WorkflowRun).filter(WorkflowRun.generation_task_id == task.id).one()
            self.assertEqual(task.status, "success")
            self.assertEqual(run.status, "completed")
            self.assertEqual(run.current_step_key, "completed")
            self.assertIsNotNone(run.completed_at)
            self.assertTrue(run.run_metadata["completed"])
            step_keys = [
                (step.step_key, step.status, step.chapter_index)
                for step in db.query(WorkflowStepRun)
                .filter(WorkflowStepRun.workflow_run_id == run.id)
                .order_by(WorkflowStepRun.id)
            ]
            self.assertEqual(
                step_keys,
                [
                    ("queued_generation", "completed", None),
                    ("booting", "completed", None),
                    ("generating_chapter", "completed", 1),
                    ("completed", "completed", None),
                ],
            )
        finally:
            db.close()


if __name__ == "__main__":
    unittest.main()
