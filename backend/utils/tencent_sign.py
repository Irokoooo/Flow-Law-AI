"""Tencent Cloud TC3-HMAC-SHA256 signature helper.
Reference: https://cloud.tencent.com/document/api (generic pattern)
This module builds Authorization header required for Tencent Cloud API requests.
Simplified for JSON POST with application/json content.

Usage:
    from utils.tencent_sign import build_tc3_signature
    headers = build_tc3_signature(secret_id, secret_key, service, host, region, action, version, payload_json)
You can then merge returned headers with your request headers.

Note: Adjust 'service', 'action', 'version' according to actual agent API definition.
"""
import hashlib
import hmac
import time
import json
from typing import Dict

ALGORITHM = 'TC3-HMAC-SHA256'

def sha256_hex(s: str) -> str:
    return hashlib.sha256(s.encode('utf-8')).hexdigest()

def hmac_sha256(key: bytes, msg: str) -> bytes:
    return hmac.new(key, msg.encode('utf-8'), hashlib.sha256).digest()

def build_tc3_signature(secret_id: str, secret_key: str, service: str, host: str, region: str, action: str, version: str, payload_json: str, timestamp: int = None) -> Dict[str, str]:
    if timestamp is None:
        timestamp = int(time.time())
    date = time.strftime('%Y-%m-%d', time.gmtime(timestamp))

    http_request_method = 'POST'
    canonical_uri = '/'
    canonical_querystring = ''
    canonical_headers = f'content-type:application/json\nhost:{host}\n'
    signed_headers = 'content-type;host'
    hashed_request_payload = sha256_hex(payload_json)
    canonical_request = '\n'.join([
        http_request_method,
        canonical_uri,
        canonical_querystring,
        canonical_headers,
        signed_headers,
        hashed_request_payload
    ])

    credential_scope = f'{date}/{service}/tc3_request'
    hashed_canonical_request = sha256_hex(canonical_request)
    string_to_sign = '\n'.join([
        ALGORITHM,
        str(timestamp),
        credential_scope,
        hashed_canonical_request
    ])

    secret_date = hmac_sha256(('TC3' + secret_key).encode('utf-8'), date)
    secret_service = hmac_sha256(secret_date, service)
    secret_signing = hmac_sha256(secret_service, 'tc3_request')
    signature = hmac.new(secret_signing, string_to_sign.encode('utf-8'), hashlib.sha256).hexdigest()

    authorization = (
        f'{ALGORITHM} Credential={secret_id}/{credential_scope}, '
        f'SignedHeaders={signed_headers}, Signature={signature}'
    )

    return {
        'Authorization': authorization,
        'Content-Type': 'application/json',
        'Host': host,
        'X-TC-Action': action,
        'X-TC-Version': version,
        'X-TC-Timestamp': str(timestamp),
        'X-TC-Region': region,
    }

if __name__ == '__main__':
    # Quick self-test (dummy values)
    payload = json.dumps({'Ping': 'Test'})
    headers = build_tc3_signature('AKIDEXAMPLE', 'SECRET', 'example', 'example.tencentcloudapi.com', 'ap-guangzhou', 'ExampleAction', '2023-11-11', payload)
    for k, v in headers.items():
        print(k, ':', v)
