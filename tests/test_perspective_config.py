"""
视角配置类单元测试
"""

import unittest
from core.perspective_config import PerspectiveConfig


class TestPerspectiveConfig(unittest.TestCase):
    """测试 PerspectiveConfig 类"""

    def test_default_config(self):
        """测试默认配置"""
        config = PerspectiveConfig()
        self.assertIsNone(config.perspective)
        self.assertEqual(config.strength, 0.7)
        self.assertTrue(config.use_for_critic)

    def test_custom_config(self):
        """测试自定义配置"""
        config = PerspectiveConfig(
            perspective="liu-cixin",
            strength=0.8,
            use_for_critic=False,
        )
        self.assertEqual(config.perspective, "liu-cixin")
        self.assertEqual(config.strength, 0.8)
        self.assertFalse(config.use_for_critic)

    def test_from_project(self):
        """测试从 Project 模型字段创建配置"""
        config = PerspectiveConfig.from_project(
            writer_perspective="jin-yong",
            perspective_strength=0.9,
            use_perspective_critic=True,
        )
        self.assertEqual(config.perspective, "jin-yong")
        self.assertEqual(config.strength, 0.9)
        self.assertTrue(config.use_for_critic)

    def test_from_project_none_perspective(self):
        """测试 None 视角的情况"""
        config = PerspectiveConfig.from_project(
            writer_perspective=None,
        )
        self.assertIsNone(config.perspective)
        self.assertEqual(config.strength, 0.7)
        self.assertTrue(config.use_for_critic)

    def test_for_critic_when_enabled(self):
        """测试启用 critic 视角时返回相同配置"""
        config = PerspectiveConfig(
            perspective="liu-cixin",
            strength=0.8,
            use_for_critic=True,
        )
        critic_config = config.for_critic()
        self.assertEqual(critic_config.perspective, "liu-cixin")
        self.assertEqual(critic_config.strength, 0.8)
        self.assertTrue(critic_config.use_for_critic)

    def test_for_critic_when_disabled(self):
        """测试禁用 critic 视角时返回空配置"""
        config = PerspectiveConfig(
            perspective="liu-cixin",
            strength=0.8,
            use_for_critic=False,
        )
        critic_config = config.for_critic()
        self.assertIsNone(critic_config.perspective)
        self.assertEqual(critic_config.strength, 0.8)
        self.assertFalse(critic_config.use_for_critic)

    def test_has_perspective(self):
        """测试是否配置了有效视角"""
        config_with = PerspectiveConfig(perspective="liu-cixin")
        config_without = PerspectiveConfig(perspective=None)

        self.assertTrue(config_with.has_perspective())
        self.assertFalse(config_without.has_perspective())


if __name__ == "__main__":
    unittest.main()
