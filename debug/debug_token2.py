#!/usr/bin/env python3
import logging
import os
os.makedirs("logs", exist_ok=True)

from jose import JWTError, jwt
from core.config import settings


token = os.getenv("DEBUG_JWT_TOKEN", "").strip()
candidate_secret = os.getenv("DEBUG_JWT_SECRET_CANDIDATE", "").strip() or settings.jwt_secret_key
if not token:
    raise SystemExit("Set DEBUG_JWT_TOKEN to validate a token safely.")

print("Trying configured/candidate JWT secret")
try:
    payload = jwt.decode(token, candidate_secret, algorithms=["HS256"])
    print(f"✅ SUCCESS. Decoded payload: {payload}")
except JWTError as e:
    print(f"❌ FAILED: {e}")
