import unittest
from fastapi.testclient import TestClient

from backend.main import app
from tests.base import BaseWorkflowTestCase


class SkillAPITests(BaseWorkflowTestCase):
    def test_list_skills_endpoint_returns_builtin_skills(self):
        response = self.client.get("/api/skills")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("skills", data)
        skill_ids = {skill["id"] for skill in data["skills"]}
        self.assertIn("liu-cixin-perspective", skill_ids)

    def test_list_skills_includes_required_fields(self):
        """Test that each skill summary includes all required schema fields."""
        response = self.client.get("/api/skills")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        for skill in data["skills"]:
            self.assertIn("id", skill)
            self.assertIn("name", skill)
            self.assertIn("description", skill)
            self.assertIn("version", skill)
            self.assertIn("author", skill)
            self.assertIn("applies_to", skill)
            self.assertIn("priority", skill)
            self.assertIn("tags", skill)
            self.assertIn("config_schema", skill)
            self.assertIn("safety_tags", skill)
            self.assertIn("dependencies", skill)

    def test_update_project_skills_requires_authentication(self):
        response = self.client.post(
            "/api/projects/1/skills",
            json={"enabled": [{"skill_id": "liu-cixin-perspective"}]},
        )

        self.assertEqual(response.status_code, 401)

    def test_update_project_skills_with_valid_skill_succeeds(self):
        """Test enabling a valid skill with proper authentication."""
        owner = self._create_user("skill_owner", "skill_owner@example.com")
        project = self._create_project(owner, name="Skill Test Novel")
        self._set_current_user(owner)

        response = self.client.post(
            f"/api/projects/{project.id}/skills",
            json={"enabled": [{"skill_id": "liu-cixin-perspective"}]},
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("config", data)
        skills_config = data["config"].get("skills", {})
        self.assertIn("enabled", skills_config)
        self.assertEqual(len(skills_config["enabled"]), 1)
        self.assertEqual(skills_config["enabled"][0]["skill_id"], "liu-cixin-perspective")

    def test_update_project_skills_rejects_nonexistent_skill(self):
        """Test that enabling a non-existent skill returns appropriate error."""
        owner = self._create_user("skill_owner2", "skill_owner2@example.com")
        project = self._create_project(owner, name="Skill Test Novel 2")
        self._set_current_user(owner)

        response = self.client.post(
            f"/api/projects/{project.id}/skills",
            json={"enabled": [{"skill_id": "nonexistent-skill-12345"}]},
        )

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("detail", data)
        self.assertIn("Skill 不存在", data["detail"])

    def test_update_project_skills_with_config(self):
        """Test enabling a skill with custom configuration."""
        owner = self._create_user("skill_owner3", "skill_owner3@example.com")
        project = self._create_project(owner, name="Skill Test Novel 3")
        self._set_current_user(owner)

        response = self.client.post(
            f"/api/projects/{project.id}/skills",
            json={
                "enabled": [
                    {
                        "skill_id": "liu-cixin-perspective",
                        "config": {"intensity": "high", "style": "epic"},
                    }
                ]
            },
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        skills_config = data["config"].get("skills", {})
        enabled_skill = skills_config["enabled"][0]
        self.assertEqual(enabled_skill["config"], {"intensity": "high", "style": "epic"})

    def test_update_project_skills_empty_list_clears_skills(self):
        """Test that an empty enabled list clears project skills."""
        owner = self._create_user("skill_owner4", "skill_owner4@example.com")
        project = self._create_project(owner, name="Skill Test Novel 4")
        self._set_current_user(owner)

        # First, enable a skill
        response = self.client.post(
            f"/api/projects/{project.id}/skills",
            json={"enabled": [{"skill_id": "liu-cixin-perspective"}]},
        )
        self.assertEqual(response.status_code, 200)

        # Then, clear all skills
        response = self.client.post(
            f"/api/projects/{project.id}/skills",
            json={"enabled": []},
        )
        self.assertEqual(response.status_code, 200)

        data = response.json()
        skills_config = data["config"].get("skills", {})
        self.assertEqual(skills_config["enabled"], [])


if __name__ == "__main__":
    unittest.main()
