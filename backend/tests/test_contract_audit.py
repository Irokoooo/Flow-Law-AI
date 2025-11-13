import os
import unittest
from backend.app import app, sessions, UPLOADS_DIR
from datetime import datetime

class ContractAuditTestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        # 保证上传目录存在
        os.makedirs(UPLOADS_DIR, exist_ok=True)

    def login(self):
        resp = self.client.post('/api/login', json={'username': 'demo', 'password': 'demo'})
        data = resp.get_json()
        self.assertTrue(data['success'])
        return data['session_id']

    def test_audit_requires_login(self):
        resp = self.client.post('/api/contract_audit', json={'filename': 'any.txt', 'session_id': 'invalid'})
        data = resp.get_json()
        self.assertFalse(data['success'])
        self.assertIn('请先登录', data['message'])

    def test_audit_missing_filename(self):
        session_id = self.login()
        resp = self.client.post('/api/contract_audit', json={'session_id': session_id})
        data = resp.get_json()
        self.assertFalse(data['success'])
        self.assertIn('缺少文件名', data['message'])

    def test_audit_file_not_found(self):
        session_id = self.login()
        resp = self.client.post('/api/contract_audit', json={'session_id': session_id, 'filename': 'not_exist.txt'})
        data = resp.get_json()
        self.assertFalse(data['success'])
        self.assertIn('文件不存在', data['message'])

    def test_audit_success_text_file(self):
        session_id = self.login()
        # 创建一个临时合同文本文件
        filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_temp_contract.txt"
        path = os.path.join(UPLOADS_DIR, filename)
        with open(path, 'w', encoding='utf-8') as f:
            f.write('甲方与乙方签订如下保密协议条款：保密范围、期限、违约责任。')
        resp = self.client.post('/api/contract_audit', json={'session_id': session_id, 'filename': filename})
        data = resp.get_json()
        self.assertTrue(data['success'])
        self.assertIn('audit', data)
        audit = data['audit']
        self.assertIn('text', audit)
        # 清理文件
        try:
            os.remove(path)
        except OSError:
            pass

if __name__ == '__main__':
    unittest.main()
