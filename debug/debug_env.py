#!/usr/bin/env python3
from pathlib import Path
from core.config import settings

env_path = Path(".env")
jwt_secret_length = 0
jwt_secret_present = False
if env_path.exists():
    for line in env_path.read_text(encoding="utf-8").splitlines():
        if "JWT_SECRET_KEY" in line and "=" in line:
            _, value = line.split("=", 1)
            jwt_secret_present = bool(value.strip())
            jwt_secret_length = len(value.strip())
            break

print()
print(f"JWT_SECRET_KEY present in .env: {jwt_secret_present}")
print(f"JWT_SECRET_KEY length in .env: {jwt_secret_length}")
print(f"Configured JWT secret length: {len(settings.jwt_secret_key)}")
