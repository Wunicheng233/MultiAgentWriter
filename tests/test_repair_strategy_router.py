"""
修复策略路由器单元测试
"""

import unittest
from backend.core.repair_strategy_router import (
    RepairStrategyRouter,
    STRATEGY_LOCAL_PATCH,
    STRATEGY_STYLE_REPAIR,
    STRATEGY_FULL_REWRITE,
    STRATEGY_CHARACTER_CONSISTENCY,
)


class TestRepairStrategyRouter(unittest.TestCase):
    """测试修复策略路由器"""

    def setUp(self):
        self.router = RepairStrategyRouter()

    def test_initialization(self):
        """测试初始化"""
        self.assertEqual(len(self.router.route_log), 0)

    def test_route_plot_hole_issue(self):
        """测试情节漏洞路由到整章重写"""
        issue = {"type": "plot_hole", "severity": "medium"}
        strategy = self.router.route(issue)
        self.assertEqual(strategy, STRATEGY_FULL_REWRITE)

    def test_route_character_inconsistency(self):
        """测试人物不一致路由到一致性修复"""
        issue = {"type": "character_inconsistency", "severity": "medium"}
        strategy = self.router.route(issue)
        self.assertEqual(strategy, STRATEGY_CHARACTER_CONSISTENCY)

    def test_route_pacing_issue(self):
        """测试节奏问题路由到局部修复"""
        issue = {"type": "pacing_issue", "severity": "medium"}
        strategy = self.router.route(issue)
        self.assertEqual(strategy, STRATEGY_LOCAL_PATCH)

    def test_critical_severity_upgrades_strategy(self):
        """测试严重问题升级策略"""
        # 本来是 local patch 的问题，严重程度 critical 会升级到 full rewrite
        issue = {"type": "pacing_issue", "severity": "critical"}
        strategy = self.router.route(issue)
        self.assertEqual(strategy, STRATEGY_FULL_REWRITE)

    def test_unknown_issue_type_uses_default(self):
        """测试未知问题类型使用默认策略"""
        issue = {"type": "some_unknown_issue", "severity": "medium"}
        strategy = self.router.route(issue)
        self.assertEqual(strategy, STRATEGY_STYLE_REPAIR)

    def test_route_log_records_decision(self):
        """测试路由决策被记录"""
        issue = {"type": "plot_hole", "severity": "high"}
        self.router.route(issue)

        self.assertEqual(len(self.router.route_log), 1)
        self.assertEqual(self.router.route_log[0]["issue_type"], "plot_hole")
        self.assertEqual(self.router.route_log[0]["assigned_strategy"], STRATEGY_FULL_REWRITE)

    def test_should_use_local_repair_few_issues(self):
        """测试少数问题可以使用本地修复"""
        issues = [
            {"type": "pacing_issue", "severity": "medium"},
            {"type": "dialogue_issue", "severity": "low"},
        ]
        result = self.router.should_use_local_repair(issues)
        self.assertTrue(result)

    def test_should_use_local_repair_too_many_issues(self):
        """测试问题太多时不建议本地修复"""
        issues = [{"type": "pacing_issue", "severity": "medium"}] * 6
        result = self.router.should_use_local_repair(issues)
        self.assertFalse(result)

    def test_should_use_local_repair_critical_issue(self):
        """测试有严重问题时不建议本地修复"""
        issues = [
            {"type": "plot_hole", "severity": "critical"},
        ]
        result = self.router.should_use_local_repair(issues)
        self.assertFalse(result)

    def test_should_use_local_repair_empty_list(self):
        """测试空问题列表返回 False"""
        result = self.router.should_use_local_repair([])
        self.assertFalse(result)

    def test_route_batch_groups_by_strategy(self):
        """测试批量路由正确分组"""
        issues = [
            {"type": "plot_hole", "severity": "high"},
            {"type": "pacing_issue", "severity": "medium"},
            {"type": "dialogue_issue", "severity": "low"},
            {"type": "character_inconsistency", "severity": "medium"},
        ]
        grouped = self.router.route_batch(issues)

        self.assertIn(STRATEGY_FULL_REWRITE, grouped)
        self.assertIn(STRATEGY_LOCAL_PATCH, grouped)
        self.assertIn(STRATEGY_CHARACTER_CONSISTENCY, grouped)

        self.assertEqual(len(grouped[STRATEGY_FULL_REWRITE]), 1)
        self.assertEqual(len(grouped[STRATEGY_LOCAL_PATCH]), 2)
        self.assertEqual(len(grouped[STRATEGY_CHARACTER_CONSISTENCY]), 1)

    def test_get_route_summary(self):
        """测试获取路由统计"""
        issues = [
            {"type": "plot_hole", "severity": "high"},
            {"type": "pacing_issue", "severity": "medium"},
            {"type": "dialogue_issue", "severity": "low"},
        ]
        self.router.route_batch(issues)

        summary = self.router.get_route_summary()
        self.assertEqual(summary[STRATEGY_FULL_REWRITE], 1)
        self.assertEqual(summary[STRATEGY_LOCAL_PATCH], 2)


if __name__ == "__main__":
    unittest.main()
