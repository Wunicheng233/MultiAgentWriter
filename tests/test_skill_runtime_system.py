import json
import shutil
import tempfile
import unittest
from pathlib import Path


class SkillRuntimeTestCase(unittest.TestCase):
    def setUp(self):
        self.temp_dir = Path(tempfile.mkdtemp())

    def tearDown(self):
        shutil.rmtree(self.temp_dir)

    def write_skill(
        self,
        skill_id: str,
        *,
        applies_to=None,
        priority: int = 100,
        injection: str = "## Skill Body\n核心内容",
        safety_tags=None,
    ) -> Path:
        skill_dir = self.temp_dir / skill_id
        skill_dir.mkdir(parents=True)
        metadata = {
            "id": skill_id,
            "name": skill_id.replace("-", " ").title(),
            "description": "测试 Skill",
            "version": "1.0",
            "author": "tests",
            "applies_to": applies_to or ["planner", "writer", "revise"],
            "priority": priority,
            "tags": ["test"],
            "config_schema": {
                "strength": {
                    "type": "float",
                    "default": 0.7,
                    "min": 0.0,
                    "max": 1.0,
                }
            },
            "safety_tags": safety_tags or ["safe_for_all"],
            "dependencies": [],
        }
        (skill_dir / "skill.json").write_text(
            json.dumps(metadata, ensure_ascii=False),
            encoding="utf-8",
        )
        (skill_dir / "injection.md").write_text(injection, encoding="utf-8")
        return skill_dir


class SkillRegistryTests(SkillRuntimeTestCase):
    def test_registry_scans_and_loads_skills(self):
        from core.skill_runtime.skill_registry import SkillRegistry

        self.write_skill("skill-a", priority=50)
        self.write_skill("skill-b", priority=120)

        registry = SkillRegistry(self.temp_dir)
        skills = registry.list_skills()

        self.assertEqual([skill.id for skill in skills], ["skill-a", "skill-b"])
        self.assertEqual(registry.load_skill("skill-a").priority, 50)
        self.assertIsNone(registry.load_skill("missing"))

    def test_missing_required_fields_raises_error(self):
        from core.skill_runtime.skill_registry import SkillRegistry, SkillValidationError

        skill_dir = self.temp_dir / "broken"
        skill_dir.mkdir()
        (skill_dir / "skill.json").write_text('{"id": "broken"}', encoding="utf-8")
        (skill_dir / "injection.md").write_text("broken", encoding="utf-8")

        with self.assertRaises(SkillValidationError):
            SkillRegistry(self.temp_dir).load_skill("broken")


class SkillAssemblerTests(SkillRuntimeTestCase):
    def test_assembler_filters_overrides_and_sorts_by_priority(self):
        from core.skill_runtime.skill_assembler import SkillAssembler
        from core.skill_runtime.skill_registry import SkillRegistry

        self.write_skill("writer-only", applies_to=["writer"], priority=200)
        self.write_skill("planner-default", applies_to=["planner"], priority=50)

        registry = SkillRegistry(self.temp_dir)
        project_config = {
            "skills": {
                "enabled": [
                    {"skill_id": "writer-only", "config": {"strength": 0.9}},
                    {
                        "skill_id": "planner-default",
                        "applies_to_override": ["writer"],
                        "config": {"strength": 0.7},
                    },
                ]
            }
        }

        assembled = SkillAssembler(registry).assemble("writer", project_config=project_config)

        self.assertEqual([item.skill.id for item in assembled], ["planner-default", "writer-only"])
        self.assertTrue(all(item.rendered_content for item in assembled))

    def test_critic_never_receives_skills(self):
        from core.skill_runtime.skill_assembler import SkillAssembler
        from core.skill_runtime.skill_registry import SkillRegistry

        self.write_skill("critic-requested", applies_to=["critic", "writer"])
        project_config = {
            "skills": {
                "enabled": [
                    {"skill_id": "critic-requested", "applies_to_override": ["critic"]}
                ]
            }
        }

        assembled = SkillAssembler(SkillRegistry(self.temp_dir)).assemble(
            "critic",
            project_config=project_config,
        )

        self.assertEqual(assembled, [])

    def test_zero_strength_disables_skill(self):
        from core.skill_runtime.skill_assembler import SkillAssembler
        from core.skill_runtime.skill_registry import SkillRegistry

        self.write_skill("muted", applies_to=["writer"])
        project_config = {"skills": {"enabled": [{"skill_id": "muted", "config": {"strength": 0}}]}}

        assembled = SkillAssembler(SkillRegistry(self.temp_dir)).assemble("writer", project_config=project_config)

        self.assertEqual(assembled, [])


class SkillInjectorTests(SkillRuntimeTestCase):
    def test_injector_adds_markers_and_replaces_placeholder(self):
        from core.skill_runtime.skill_assembler import SkillAssembler
        from core.skill_runtime.skill_injector import SkillInjector
        from core.skill_runtime.skill_registry import SkillRegistry

        self.write_skill("skill-a", applies_to=["writer"], injection="### A\n内容A")
        project_config = {"skills": {"enabled": [{"skill_id": "skill-a"}]}}
        assembled = SkillAssembler(SkillRegistry(self.temp_dir)).assemble("writer", project_config=project_config)

        result = SkillInjector().inject("base\n{{skill_layer}}", assembled)

        self.assertIn("Skill Layer Start", result)
        self.assertIn("Skill: skill-a", result)
        self.assertIn("内容A", result)
        self.assertNotIn("{{skill_layer}}", result)

    def test_empty_layer_preserves_prompt_without_placeholder(self):
        from core.skill_runtime.skill_injector import SkillInjector

        self.assertEqual(SkillInjector().inject("base", []), "base")


class SafetyFilterTests(unittest.TestCase):
    def test_safety_filter_removes_roleplay_and_blocked_terms(self):
        from core.skill_runtime.safety_filter import SafetyFilter

        content = "你是某作家。\n保留这行。\n<!-- unsafe:start -->扮演内容<!-- unsafe:end -->\n政治立场"

        filtered = SafetyFilter().filter(content, mode="style_only")

        self.assertIn("保留这行", filtered)
        self.assertNotIn("你是", filtered)
        self.assertNotIn("扮演内容", filtered)
        self.assertNotIn("政治", filtered)


class SkillPromptIntegrationTests(unittest.TestCase):
    def test_load_prompt_injects_project_skills_into_writer(self):
        from utils.file_utils import load_prompt

        project_config = {
            "skills": {
                "enabled": [
                    {"skill_id": "liu-cixin-perspective", "config": {"strength": 0.8}},
                ]
            }
        }

        result = load_prompt("writer", project_config=project_config)

        self.assertIn("Skill Layer Start", result)
        self.assertIn("Skill: liu-cixin-perspective", result)
        self.assertIn("刘慈欣", result)

    def test_legacy_perspective_maps_to_skill_runtime_but_not_critic(self):
        from utils.file_utils import load_prompt

        writer_prompt = load_prompt("writer", perspective="liu-cixin", perspective_strength=0.8)
        critic_prompt = load_prompt("critic", perspective="liu-cixin", perspective_strength=0.8)

        self.assertIn("Skill: liu-cixin-perspective", writer_prompt)
        self.assertNotIn("Skill: liu-cixin-perspective", critic_prompt)
        self.assertNotIn("评审视角：刘慈欣", critic_prompt)


if __name__ == "__main__":
    unittest.main()
