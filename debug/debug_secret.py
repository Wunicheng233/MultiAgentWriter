#!/usr/bin/env python3
import os
os.makedirs("logs", exist_ok=True)

from backend import auth
from core.config import settings

print(f"backend.auth JWT secret length: {len(auth.SECRET_KEY)}")
print(f"core.config JWT secret length: {len(settings.jwt_secret_key)}")
secrets_match = auth.SECRET_KEY.__eq__(settings.jwt_secret_key)
print(f"Are backend and core JWT secrets equal? {secrets_match}")
