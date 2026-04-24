import unittest
from pathlib import Path
import tempfile
import yaml

from core.perspective_engine import PerspectiveEngine


class PerspectiveEngineLoadTests(unittest.TestCase):
    def test_can_instantiate_without_perspective(self):
        """不指定视角时也可以实例化"""
        engine = PerspectiveEngine()
        self.assertIsNone(engine.perspective_name)
        self.assertIsNone(engine.perspective_data)

    def test_raises_for_nonexistent_perspective(self):
        """加载不存在的视角时抛出 ValueError"""
        with self.assertRaises(ValueError) as ctx:
            PerspectiveEngine("nonexistent-writer-12345")
        self.assertIn("not found", str(ctx.exception).lower())


class PerspectiveFileLoadTests(unittest.TestCase):
    def setUp(self):
        # Create temporary test directory
        self.temp_dir = tempfile.mkdtemp()
        self.original_builtin = PerspectiveEngine.BUILTIN_PERSPECTIVES
        PerspectiveEngine.BUILTIN_PERSPECTIVES = Path(self.temp_dir)

    def tearDown(self):
        PerspectiveEngine.BUILTIN_PERSPECTIVES = self.original_builtin
        import shutil
        shutil.rmtree(self.temp_dir)

    def test_loads_complete_perspective_structure(self):
        """完整的视角文件应该能被正确解析"""
        # 创建测试视角文件
        test_perspective = {
            'name': '测试作家',
            'genre': '测试题材',
            'description': '测试描述',
            'strength_recommended': 0.7,
            'strengths': ['优点1', '优点2'],
            'weaknesses': ['缺点1'],
            'planner_injection': {
                'mental_models': '心智模型测试',
                'worldview_principles': '世界观原则测试',
            },
            'writer_injection': {
                'sentence_patterns': '句式测试',
                'vocabulary_traits': '词汇测试',
                'rhythm_principles': '节奏测试',
                'example_sentences': '例句测试',
            },
            'critic_injection': '评审标准测试',
            'revise_injection': '修改策略测试',
        }

        test_file = Path(self.temp_dir) / 'test-writer.yaml'
        with open(test_file, 'w', encoding='utf-8') as f:
            yaml.safe_dump(test_perspective, f, allow_unicode=True)

        engine = PerspectiveEngine('test-writer')

        self.assertEqual(engine.perspective_data['name'], '测试作家')
        self.assertEqual(engine.perspective_data['planner_injection']['mental_models'], '心智模型测试')
        self.assertEqual(engine.perspective_data['writer_injection']['sentence_patterns'], '句式测试')

    def test_list_available_perspectives(self):
        """list_available_perspectives 应该返回所有可用视角"""
        # 创建测试视角
        test_file = Path(self.temp_dir) / 'test-writer.yaml'
        with open(test_file, 'w', encoding='utf-8') as f:
            yaml.safe_dump({
                'name': '测试作家',
                'genre': '测试题材',
                'description': '测试描述',
                'strength_recommended': 0.7,
                'strengths': [],
                'weaknesses': [],
                'planner_injection': {},
                'writer_injection': {},
                'critic_injection': '',
                'revise_injection': '',
            }, f, allow_unicode=True)

        perspectives = PerspectiveEngine.list_available_perspectives()

        self.assertEqual(len(perspectives), 1)
        self.assertEqual(perspectives[0]['id'], 'test-writer')
        self.assertEqual(perspectives[0]['name'], '测试作家')
        self.assertTrue(perspectives[0]['builtin'])


class PlannerInjectionTests(unittest.TestCase):
    def setUp(self):
        import tempfile
        self.temp_dir = tempfile.mkdtemp()
        self.original_builtin = PerspectiveEngine.BUILTIN_PERSPECTIVES
        PerspectiveEngine.BUILTIN_PERSPECTIVES = Path(self.temp_dir)

        # Create test perspective
        test_file = Path(self.temp_dir) / 'test-writer.yaml'
        with open(test_file, 'w', encoding='utf-8') as f:
            yaml.safe_dump({
                'name': '测试作家',
                'genre': '测试',
                'description': '测试',
                'strength_recommended': 0.7,
                'strengths': [],
                'weaknesses': [],
                'planner_injection': {
                    'mental_models': '心智模型内容',
                    'worldview_principles': '世界观原则内容',
                },
                'writer_injection': {},
                'critic_injection': '',
                'revise_injection': '',
            }, f, allow_unicode=True)

        self.engine = PerspectiveEngine('test-writer')

    def tearDown(self):
        PerspectiveEngine.BUILTIN_PERSPECTIVES = self.original_builtin
        import shutil
        shutil.rmtree(self.temp_dir)

    def test_inject_for_planner_adds_header(self):
        """Planner 注入应该在开头添加视角模式标题"""
        original = "原始 prompt 内容"
        result = self.engine.inject_for_planner(original)

        self.assertIn("创作思维模式：测试作家", result)
        self.assertIn("心智模型内容", result)
        self.assertIn("世界观原则内容", result)
        # Original content should be preserved
        self.assertIn("原始 prompt 内容", result)

    def test_inject_for_planner_with_no_perspective_returns_original(self):
        """没有加载视角时直接返回原始内容"""
        engine = PerspectiveEngine()
        original = "原始 prompt 内容"
        result = engine.inject_for_planner(original)

        self.assertEqual(result, original)

    def test_inject_for_planner_preserves_original_content(self):
        """原始 prompt 的所有内容都应该被完整保留"""
        original = "第一行\n第二行\n第三行包含特殊字符!@#$%^&*()"
        result = self.engine.inject_for_planner(original)

        self.assertIn("第一行", result)
        self.assertIn("第二行", result)
        self.assertIn("第三行包含特殊字符!@#$%^&*()", result)


class WriterInjectionTests(unittest.TestCase):
    def setUp(self):
        import tempfile
        self.temp_dir = tempfile.mkdtemp()
        self.original_builtin = PerspectiveEngine.BUILTIN_PERSPECTIVES
        PerspectiveEngine.BUILTIN_PERSPECTIVES = Path(self.temp_dir)

        test_file = Path(self.temp_dir) / 'test-writer.yaml'
        with open(test_file, 'w', encoding='utf-8') as f:
            yaml.safe_dump({
                'name': '测试作家',
                'genre': '测试',
                'description': '测试',
                'strength_recommended': 0.7,
                'strengths': [],
                'weaknesses': [],
                'planner_injection': {},
                'writer_injection': {
                    'sentence_patterns': '句式内容',
                    'vocabulary_traits': '词汇内容',
                    'rhythm_principles': '节奏内容',
                    'example_sentences': '例句内容',
                },
                'critic_injection': '',
                'revise_injection': '',
            }, f, allow_unicode=True)

        self.engine = PerspectiveEngine('test-writer')

    def tearDown(self):
        PerspectiveEngine.BUILTIN_PERSPECTIVES = self.original_builtin
        import shutil
        shutil.rmtree(self.temp_dir)

    def test_inject_for_writer_adds_content_at_end(self):
        """Writer 注入应该在末尾添加风格适配内容"""
        original = "原始 prompt 内容\n原始 prompt 第二行"
        result = self.engine.inject_for_writer(original, strength=0.8)

        # Original content should be first (before injection)
        self.assertTrue(result.index("原始 prompt 内容") < result.index("表达风格适配"))
        self.assertIn("句式内容", result)
        self.assertIn("词汇内容", result)
        self.assertIn("节奏内容", result)
        self.assertIn("例句内容", result)


    def test_inject_for_writer_with_no_perspective_returns_original(self):
        """没有加载视角时直接返回原始内容"""
        engine = PerspectiveEngine()
        original = "原始 prompt 内容"
        result = engine.inject_for_writer(original)
        self.assertEqual(result, original)

    def test_writer_injection_strength_filters_content(self):
        """根据强度正确过滤 Writer 注入内容"""
        # Low strength (<= 0.3): no rhythm, no examples
        result_low = self.engine.inject_for_writer("original", strength=0.3)
        self.assertIn("句式内容", result_low)
        self.assertIn("词汇内容", result_low)
        self.assertNotIn("节奏内容", result_low)
        self.assertNotIn("例句内容", result_low)

        # Medium strength (<= 0.7): no examples
        result_med = self.engine.inject_for_writer("original", strength=0.7)
        self.assertIn("句式内容", result_med)
        self.assertIn("词汇内容", result_med)
        self.assertIn("节奏内容", result_med)
        self.assertNotIn("例句内容", result_med)

        # High strength (> 0.7): all content
        result_high = self.engine.inject_for_writer("original", strength=0.8)
        self.assertIn("句式内容", result_high)
        self.assertIn("词汇内容", result_high)
        self.assertIn("节奏内容", result_high)
        self.assertIn("例句内容", result_high)
