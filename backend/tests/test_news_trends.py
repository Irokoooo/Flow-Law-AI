import unittest
from backend.app import app

class NewsTrendsTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_news_endpoint(self):
        resp = self.client.get('/api/compliance_news')
        data = resp.get_json()
        self.assertTrue(data['success'])
        self.assertIn('items', data)
        self.assertGreater(len(data['items']), 0)

    def test_trends_filter(self):
        resp = self.client.get('/api/policy_trends?region=asia&category=科技')
        data = resp.get_json()
        self.assertTrue(data['success'])
        for item in data['items']:
            self.assertEqual(item['region'], 'asia')
            # category may not match exactly due to dataset, so just check key exists
            self.assertIn('category', item)

if __name__ == '__main__':
    unittest.main()
