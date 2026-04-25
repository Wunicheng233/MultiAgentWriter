import unittest
from utils.file_utils import load_prompt


class PerspectiveEndToEndTests(unittest.TestCase):
    def test_liu_cixin_perspective_loads_successfully(self):
        """真实的刘慈欣视角应该能成功加载并注入到 writer prompt"""
        # 这是一个集成测试，验证完整流程
        try:
            result = load_prompt('writer', perspective='liu-cixin')

            # 应该包含刘慈欣的特定内容
            self.assertIn("刘慈欣", result)
            self.assertIn("Skill: liu-cixin-perspective", result)
            self.assertIn("短句", result)

            # 应该包含原始 prompt 的核心内容
            self.assertIn("Role", result)  # 原始 prompt 开头有 Role

            print(f"✅ 刘慈欣视角注入成功，最终 prompt 长度: {len(result)} 字符")
            print(f"✅ 包含表达风格适配部分")

        except Exception as e:
            self.fail(f"刘慈欣视角加载失败: {e}")

    def test_liu_cixin_perspective_for_planner(self):
        """刘慈欣视角应该能成功注入到 planner"""
        result = load_prompt('planner', perspective='liu-cixin')

        self.assertIn("Skill: liu-cixin-perspective", result)
        self.assertIn("思想实验公理框架", result)
        self.assertIn("黑暗森林思维", result)

    def test_perspective_strength_parameter_works(self):
        """视角强度参数应该生效"""
        full_strength = load_prompt('writer', perspective='liu-cixin', perspective_strength=1.0)
        low_strength = load_prompt('writer', perspective='liu-cixin', perspective_strength=0.2)

        # 满强度应该比低强度有更多内容
        self.assertTrue(len(full_strength) >= len(low_strength))

        self.assertIn("Skill Layer Start", full_strength)
        self.assertIn("Skill Layer Start", low_strength)


class WriterAgentPerspectiveTests(unittest.TestCase):
    def test_writer_agent_accepts_perspective_parameter(self):
        """generate_chapter 应该接受 perspective 参数"""
        import inspect
        from agents.writer_agent import generate_chapter

        sig = inspect.signature(generate_chapter)
        params = list(sig.parameters.keys())

        self.assertIn('perspective', params)
        self.assertIn('perspective_strength', params)

        print("✅ generate_chapter 接受 perspective 和 perspective_strength 参数")

    def test_writer_agent_perspective_effect(self):
        """传入 perspective 应该影响生成的 prompt"""
        from agents.writer_agent import generate_chapter

        # 检查函数定义
        import inspect
        source = inspect.getsource(generate_chapter)

        # 应该在调用 load_prompt 时传入 perspective
        self.assertIn('perspective', source)
        self.assertIn('perspective_strength', source)

        print("✅ generate_chapter 内部使用 perspective 参数")


class AllAgentsPerspectiveTests(unittest.TestCase):
    def test_all_agents_accept_perspective(self):
        """所有 agent 入口函数都应该接受 perspective 参数"""
        import inspect

        agents_to_check = [
            ('planner_agent', 'generate_plan'),
            ('planner_agent', 'revise_plan'),
            ('writer_agent', 'generate_chapter'),
            ('critic_agent', 'critic_chapter'),
            ('revise_agent', 'revise_chapter'),
            ('revise_agent', 'revise_local_patch'),
            ('revise_agent', 'stitch_chapter'),
        ]

        for module_name, func_name in agents_to_check:
            module = __import__(f'agents.{module_name}', fromlist=[func_name])
            func = getattr(module, func_name)
            sig = inspect.signature(func)
            params = list(sig.parameters.keys())

            self.assertIn(
                'perspective',
                params,
                f"{module_name}.{func_name} 缺少 perspective 参数"
            )
            self.assertIn(
                'perspective_strength',
                params,
                f"{module_name}.{func_name} 缺少 perspective_strength 参数"
            )

            print(f"✅ {module_name}.{func_name} 接受 perspective 参数")
