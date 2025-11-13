"""Minimal Flask API health & auth tests.
Run with:
  python -m unittest discover -s backend/tests -p "test_*.py"
Or if pytest added later:
  pytest backend/tests
"""
import unittest
from backend.app import app, sessions

class ApiHealthTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_login_fail(self):
        resp = self.client.post('/api/login', json={'username': 'x', 'password': 'y'})
        data = resp.get_json()
        self.assertFalse(data['success'])

    def test_login_success_and_chat(self):
        resp = self.client.post('/api/login', json={'username': 'demo', 'password': 'demo'})
        data = resp.get_json()
        self.assertTrue(data['success'])
        session_id = data['session_id']
        self.assertIn(session_id, sessions)
        chat_resp = self.client.post('/api/chat', json={'message': '测试消息', 'session_id': session_id})
        chat_data = chat_resp.get_json()
        self.assertTrue(chat_data['success'])
        self.assertIn('response', chat_data)
        self.assertIn('text', chat_data['response'])
        # 新增：政策趋势与新闻接口基本可访问
        news_resp = self.client.get('/api/compliance_news')
        news_data = news_resp.get_json()
        self.assertTrue(news_data['success'])
        self.assertIn('items', news_data)
        trends_resp = self.client.get('/api/policy_trends')
        trends_data = trends_resp.get_json()
        self.assertTrue(trends_data['success'])
        self.assertIn('items', trends_data)

    def test_chat_requires_login(self):
        resp = self.client.post('/api/chat', json={'message': 'hi', 'session_id': 'fake'})
        data = resp.get_json()
        self.assertFalse(data['success'])

if __name__ == '__main__':
    unittest.main()
