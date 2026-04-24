import unittest
from sqlalchemy import inspect
from backend.database import Base, engine


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
