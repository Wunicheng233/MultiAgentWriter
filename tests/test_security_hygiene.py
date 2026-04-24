from __future__ import annotations

import re
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEBUG_FILES = sorted((PROJECT_ROOT / "debug").glob("*.py"))


class SecurityHygieneTests(unittest.TestCase):
    def test_debug_scripts_do_not_embed_tokens_or_raw_secrets(self):
        jwt_pattern = re.compile(r"eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+")
        risky_fragments = [
            "Trying default secret:",
            "Trying .env secret:",
            "Using SECRET_KEY:",
            "SECRET_KEY =",
            "jwt_secret_key =",
            "New token created:",
            "API Key:",
            "Raw line:",
            "settings.jwt_secret_key from Pydantic:",
        ]

        offenders: list[str] = []
        for path in DEBUG_FILES:
            content = path.read_text(encoding="utf-8")
            if jwt_pattern.search(content):
                offenders.append(f"{path.relative_to(PROJECT_ROOT)} embeds a JWT")
            for fragment in risky_fragments:
                if fragment in content:
                    offenders.append(f"{path.relative_to(PROJECT_ROOT)} prints {fragment!r}")

        self.assertEqual(offenders, [])

    def test_exports_are_not_publicly_mounted(self):
        from backend.main import app

        mounted_paths = {getattr(route, "path", None) for route in app.routes}

        self.assertNotIn("/exports", mounted_paths)


if __name__ == "__main__":
    unittest.main()
