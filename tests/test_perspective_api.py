import unittest
from sqlalchemy import inspect
from backend.database import Base, engine
from fastapi.testclient import TestClient
from pydantic import ValidationError
from backend.main import app


class ModelFieldTests(unittest.TestCase):
    def test_project_has_perspective_fields(self):
        """Project 模型应该有所有视角相关字段"""
        # 先做一个简单的 import 测试
        from backend.models import Project

        # 检查类属性
        self.assertTrue(hasattr(Project, 'writer_perspective'))
        self.assertTrue(hasattr(Project, 'use_perspective_critic'))
        self.assertTrue(hasattr(Project, 'perspective_strength'))
        self.assertTrue(hasattr(Project, 'perspective_mix'))

        print("✅ Project 模型包含所有视角相关字段")

    def test_project_response_exposes_perspective_fields(self):
        """ProjectResponse 应该把视角配置返回给前端"""
        from backend.schemas import ProjectResponse

        fields = ProjectResponse.model_fields
        self.assertIn("user_id", fields)
        self.assertIn("writer_perspective", fields)
        self.assertIn("use_perspective_critic", fields)
        self.assertIn("perspective_strength", fields)


class PerspectiveAPITests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_list_perspectives_endpoint_exists(self):
        """GET /api/perspectives 应该返回可用视角列表"""
        response = self.client.get("/api/perspectives/")

        # 端点应该存在
        self.assertNotEqual(response.status_code, 404)

        # 应该至少有一个视角（liu-cixin）
        data = response.json()
        self.assertIn('perspectives', data)
        perspectives = data['perspectives']

        # 找到刘慈欣视角
        liu_cixin = next((p for p in perspectives if p['id'] == 'liu-cixin'), None)
        self.assertIsNotNone(liu_cixin)
        self.assertEqual(liu_cixin['name'], '刘慈欣')
        self.assertEqual(liu_cixin['genre'], '科幻')

        print(f"✅ 获取到 {len(perspectives)} 个视角")

    def test_get_perspective_detail(self):
        """GET /api/perspectives/{id} 应该返回视角详情"""
        response = self.client.get("/api/perspectives/liu-cixin")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data['id'], 'liu-cixin')
        self.assertEqual(data['name'], '刘慈欣')
        self.assertIn('preview', data)
        self.assertIn('planner_injection', data['preview'])
        self.assertIn('writer_injection', data['preview'])
        self.assertIn('critic_injection', data['preview'])
        self.assertIn('strengths', data)
        self.assertIn('weaknesses', data)

    def test_get_nonexistent_perspective_returns_404(self):
        """获取不存在的视角应该返回 404"""
        response = self.client.get("/api/perspectives/nonexistent-writer-12345")
        self.assertEqual(response.status_code, 404)

    def test_update_request_accepts_documented_perspective_id_alias(self):
        """更新接口兼容白皮书中的 perspective_id 字段"""
        from backend.api.perspectives import UpdateProjectPerspectiveRequest

        request = UpdateProjectPerspectiveRequest(
            perspective_id="liu-cixin",
            perspective_strength=0.8,
            use_perspective_critic=True,
        )
        self.assertEqual(request.selected_perspective(), "liu-cixin")

    def test_update_request_rejects_invalid_strength(self):
        """风格强度必须限制在 0.0 到 1.0"""
        from backend.api.perspectives import UpdateProjectPerspectiveRequest

        with self.assertRaises(ValidationError):
            UpdateProjectPerspectiveRequest(perspective="liu-cixin", perspective_strength=1.5)

    def test_update_project_perspective_requires_authentication(self):
        """修改项目视角配置必须登录，避免跨用户篡改项目配置"""
        response = self.client.put(
            "/api/perspectives/project/1",
            json={
                "perspective": "liu-cixin",
                "perspective_strength": 0.8,
                "use_perspective_critic": True,
            },
        )
        self.assertEqual(response.status_code, 401)
