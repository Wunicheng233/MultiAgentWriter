import unittest
from fastapi.testclient import TestClient

from backend.main import app


class SkillAPITests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_list_skills_endpoint_returns_builtin_skills(self):
        response = self.client.get("/api/skills")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("skills", data)
        skill_ids = {skill["id"] for skill in data["skills"]}
        self.assertIn("liu-cixin-perspective", skill_ids)

    def test_update_project_skills_requires_authentication(self):
        response = self.client.post(
            "/api/projects/1/skills",
            json={"enabled": [{"skill_id": "liu-cixin-perspective"}]},
        )

        self.assertEqual(response.status_code, 401)


if __name__ == "__main__":
    unittest.main()
