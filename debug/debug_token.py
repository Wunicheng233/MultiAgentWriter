#!/usr/bin/env python3
import os

from backend.auth import decode_token


token = os.getenv("DEBUG_JWT_TOKEN", "").strip()
if not token:
    raise SystemExit("Set DEBUG_JWT_TOKEN to decode a token safely.")

payload = decode_token(token)
if payload is None:
    print("decode_token returned None → JWT verification FAILED")
    print("This means signature is invalid because secret key doesn't match what was used to sign")
else:
    print(f"decode_token SUCCESS! Payload: {payload}")
