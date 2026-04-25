import unittest
from dataclasses import FrozenInstanceError, fields

from core.agent_contract import AgentContract, get_agent_contract, list_agent_contracts


class AgentContractTests(unittest.TestCase):
    def test_core_agent_contracts_cover_current_slim_runtime(self):
        contracts = {contract.agent_key: contract for contract in list_agent_contracts()}
        self.assertEqual(set(contracts), {"critic", "planner", "revise", "writer"})

        self.assertEqual(contracts["planner"].prompt_template_key, "planner")
        self.assertIn("planning", contracts["planner"].supported_workflow_nodes)
        self.assertEqual(contracts["writer"].output_schema_ref, "ChapterDraftArtifact.v1")
        self.assertEqual(contracts["critic"].retry_policy_key, "strict_json_retry")
        self.assertIn("feedback_revision", contracts["revise"].supported_workflow_nodes)

        for contract in contracts.values():
            self.assertEqual(contract.model_policy_key, contract.agent_key)
            self.assertTrue(contract.input_schema_ref.endswith(".v1"))
            self.assertTrue(contract.output_schema_ref.endswith(".v1"))

    def test_unknown_agent_contract_fails_explicitly(self):
        with self.assertRaises(KeyError) as context:
            get_agent_contract("guardian")

        self.assertIn("未知 Agent Contract", str(context.exception))
        self.assertIn("guardian", str(context.exception))

    def test_agent_contract_dataclass_has_all_required_fields(self):
        """Test that AgentContract dataclass defines all required schema fields."""
        expected_fields = {
            "agent_key",
            "display_name",
            "purpose",
            "layer",
            "supported_workflow_nodes",
            "input_schema_ref",
            "output_schema_ref",
            "prompt_template_key",
            "model_policy_key",
            "retry_policy_key",
            "fallback_policy_key",
        }

        actual_fields = {field.name for field in fields(AgentContract)}
        self.assertEqual(expected_fields, actual_fields)

    def test_all_contracts_have_valid_layer_values(self):
        """Test that all agent contracts have recognized layer values."""
        valid_layers = {"core_production", "quality_control", "orchestration"}

        for contract in list_agent_contracts():
            self.assertIn(contract.layer, valid_layers)

    def test_all_contracts_have_non_empty_display_and_purpose(self):
        """Test that all contracts have non-empty display name and purpose."""
        for contract in list_agent_contracts():
            self.assertTrue(len(contract.display_name) > 0)
            self.assertTrue(len(contract.purpose) > 0)

    def test_supported_workflow_nodes_are_tuple_not_list(self):
        """Test that supported_workflow_nodes is immutable tuple for safety."""
        for contract in list_agent_contracts():
            self.assertIsInstance(contract.supported_workflow_nodes, tuple)
            self.assertTrue(len(contract.supported_workflow_nodes) > 0)

    def test_get_agent_contract_with_valid_keys_returns_correct_type(self):
        """Test that get_agent_contract returns AgentContract for all valid keys."""
        for key in ["planner", "writer", "critic", "revise"]:
            contract = get_agent_contract(key)
            self.assertIsInstance(contract, AgentContract)
            self.assertEqual(contract.agent_key, key)

    def test_list_agent_contracts_returns_sorted_list(self):
        """Test that list_agent_contracts returns contracts in sorted order."""
        contracts = list_agent_contracts()
        keys = [c.agent_key for c in contracts]
        self.assertEqual(keys, sorted(keys))

    def test_agent_contract_immutability(self):
        """Test that AgentContract instances are frozen/immutable."""
        contract = get_agent_contract("writer")

        with self.assertRaises((AttributeError, FrozenInstanceError)):
            # Attempt to modify a field should raise exception
            contract.agent_key = "modified"

    def test_schema_ref_version_consistency(self):
        """Test that input and output schema refs follow consistent naming patterns."""
        for contract in list_agent_contracts():
            # Both input and output refs should use .v1 versioning
            self.assertRegex(contract.input_schema_ref, r"^.+\.v1$")
            self.assertRegex(contract.output_schema_ref, r"^.+\.v1$")

            # Schema ref should typically be related to the agent's purpose
            self.assertIn(contract.agent_key.title(), contract.input_schema_ref)


if __name__ == "__main__":
    unittest.main()
