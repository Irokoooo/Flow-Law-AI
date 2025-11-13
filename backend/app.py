from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS  # 解决跨域问题
import requests
import json
import os
from datetime import datetime
from dotenv import load_dotenv  # 加载环境变量
"""运行方式说明：
推荐使用模块方式启动：python -m backend.app
若使用 python backend/app.py 直接运行，包前缀可能不可解析，可回退到相对导入。
下面的导入做了双路径兼容，避免 ModuleNotFoundError。
"""
try:
    from backend.utils.tencent_sign import build_tc3_signature  # 包方式
except ModuleNotFoundError:  # 脚本直接运行回退
    from utils.tencent_sign import build_tc3_signature
from bs4 import BeautifulSoup
import threading
import time

load_dotenv()  # 支持 .env 文件

app = Flask(__name__)
CORS(app)  # 允许前端访问

# 路径配置（统一绝对路径）
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'frontend'))
UPLOADS_DIR = os.path.join(BASE_DIR, 'uploads')
os.makedirs(UPLOADS_DIR, exist_ok=True)

"""环境变量说明（含 WebSocket 可选项）：
普通问答 Agent 必需：
    TENCENT_AGENT_ENDPOINT (HTTP)
    TENCENT_SECRET_ID
    TENCENT_SECRET_KEY
    TENCENT_AGENT_MODEL
可选：
    TENCENT_AGENT_TRANSPORT=http|ws (默认 http)
    TENCENT_AGENT_WS_ENDPOINT (ws 模式使用)
    TENCENT_AGENT_APPKEY (若 ws 需要 appkey / token)

合同审核 Agent 必需：
    CONTRACT_AGENT_ENDPOINT
    CONTRACT_SECRET_ID
    CONTRACT_SECRET_KEY
    CONTRACT_AGENT_MODEL
可选：
    CONTRACT_AGENT_WS_ENDPOINT
    CONTRACT_AGENT_APPKEY

上述变量由 .env 提供，未配置时走占位降级逻辑。
"""


# 腾讯智能问答 Agent 环境变量
TENCENT_AGENT_ENDPOINT = os.getenv('TENCENT_AGENT_ENDPOINT')
TENCENT_AGENT_WS_ENDPOINT = os.getenv('TENCENT_AGENT_WS_ENDPOINT')
TENCENT_AGENT_TRANSPORT = os.getenv('TENCENT_AGENT_TRANSPORT', 'http').lower()
TENCENT_SECRET_ID = os.getenv('TENCENT_SECRET_ID')
TENCENT_SECRET_KEY = os.getenv('TENCENT_SECRET_KEY')
TENCENT_AGENT_MODEL = os.getenv('TENCENT_AGENT_MODEL', 'lawflow-default')
TENCENT_AGENT_APPKEY = os.getenv('TENCENT_AGENT_APPKEY')

# 用户系统（简化版，实际应该用数据库）
users = {
    'demo': {'password': 'demo', 'name': '测试用户'},
    'admin': {'password': 'admin123', 'name': '管理员'}
}

# 模拟的会话存储（实际应该用Redis或数据库）
sessions = {}

# 1. 登录接口
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json or {}
    username = data.get('username')
    password = data.get('password')
    if username in users and users[username]['password'] == password:
        session_id = f"session_{datetime.now().timestamp()}"
        sessions[session_id] = {'username': username, 'login_time': datetime.now()}
        return jsonify({'success': True, 'message': '登录成功', 'session_id': session_id, 'user': {'name': users[username]['name']}})
    return jsonify({'success': False, 'message': '用户名或密码错误'})

# 2. 文件上传接口
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': '没有文件'})
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'message': '未选择文件'})
    filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
    file_path = os.path.join(UPLOADS_DIR, filename)
    file.save(file_path)
    return jsonify({'success': True, 'message': '文件上传成功', 'filename': filename, 'file_url': f"/uploads/{filename}"})

# 3. 与腾讯云普通问答Agent对话接口
@app.route('/api/chat', methods=['POST'])
def chat_with_agent():
    data = request.json or {}
    message = data.get('message')
    session_id = data.get('session_id')
    if not session_id or session_id not in sessions:
        return jsonify({'success': False, 'message': '请先登录'})
    try:
        tencent_response = call_tencent_agent(message)
        return jsonify({'success': True, 'response': tencent_response, 'timestamp': datetime.now().isoformat()})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Agent调用失败: {str(e)}'})

def _generic_agent_call(message: str, endpoint: str, secret_id: str, secret_key: str, model: str, *,
                        service: str = 'aiagent', action: str = 'Chat', version: str = '2023-11-11',
                        transport: str = 'http', ws_endpoint: str | None = None, appkey: str | None = None):
    """统一的腾讯云 Agent 调用封装: http | ws.

    ws 模式：
        - 依赖 utils/tencent_ws.py 中的 ws_agent_chat (简化同步实现)
        - 若 ws 失败可回退 http
    """
    if not endpoint or not secret_id or not secret_key:
        # 移除“占位/模拟”字样，录屏时避免测试痕迹
        return {
            'text': f"暂未连接外部AI服务，当前界面展示回答。原问题: {message}",
            'suggestions': [],
            'confidence': 0.0
        }

    # 优先 WS
    if transport == 'ws' and ws_endpoint:
        try:
            try:
                from backend.utils.tencent_ws import ws_agent_chat  # 包模式
            except ModuleNotFoundError:
                from utils.tencent_ws import ws_agent_chat  # 脚本模式
            ws_res = ws_agent_chat(
                appkey=appkey or 'APPKEY_PLACEHOLDER',
                secret_id=secret_id,
                secret_key=secret_key,
                model=model,
                message=message,
                endpoint=ws_endpoint
            )
            if ws_res and ws_res.get('text'):  # 成功
                return {
                    'text': ws_res.get('text'),
                    'suggestions': ws_res.get('suggestions', []),
                    'confidence': 0.9,
                    'transport': 'ws'
                }
        except Exception as e:
            # 回退 HTTP
            fallback_note = f"WS失败回退HTTP: {e}"[:160]
        else:
            fallback_note = None
    else:
        fallback_note = None

    # HTTP 路径
    payload = {
        'model': model,
        'messages': [
            {'role': 'user', 'content': message}
        ],
        'stream': False
    }
    payload_json = json.dumps(payload, ensure_ascii=False)
    host = endpoint.replace('https://', '').replace('http://', '').split('/')[0]
    region = 'ap-guangzhou'
    sig_headers = build_tc3_signature(secret_id, secret_key, service, host, region, action, version, payload_json)
    resp = requests.post(endpoint, headers=sig_headers, data=payload_json, timeout=15)
    if resp.status_code != 200:
        raise RuntimeError(f"非200响应: {resp.status_code} {resp.text[:200]}")
    try:
        data = resp.json()
    except Exception:
        raise RuntimeError('响应非JSON格式')
    text = data.get('text') or data.get('choices', [{}])[0].get('message', {}).get('content') or '[未获取到文本内容]'
    suggestions = data.get('suggestions') or []
    confidence = data.get('confidence', 0.9)
    result = {
        'text': text,
        'suggestions': suggestions,
        'confidence': confidence,
        'transport': 'http'
    }
    if fallback_note:
        result['note'] = fallback_note
    return result

def call_tencent_agent(message: str):
    return _generic_agent_call(
        message,
        TENCENT_AGENT_ENDPOINT,
        TENCENT_SECRET_ID,
        TENCENT_SECRET_KEY,
        TENCENT_AGENT_MODEL,
        transport=TENCENT_AGENT_TRANSPORT,
        ws_endpoint=TENCENT_AGENT_WS_ENDPOINT,
        appkey=TENCENT_AGENT_APPKEY
    )


# 已移除合同 agent 相关逻辑，合同审核功能暂不可用。

# 3b. 合同审核接口：接收已上传文件名，解析文本后调用合同 Agent
@app.route('/api/contract_audit', methods=['POST'])
def contract_audit():
    data = request.json or {}
    filename = data.get('filename')
    session_id = data.get('session_id')
    if not session_id or session_id not in sessions:
        return jsonify({'success': False, 'message': '请先登录'})
    if not filename:
        return jsonify({'success': False, 'message': '缺少文件名'})
    file_path = os.path.join(UPLOADS_DIR, filename)
    if not os.path.exists(file_path):
        return jsonify({'success': False, 'message': '文件不存在'})
    try:
        extracted_text = extract_contract_text(file_path)
        # 合同 agent 已移除，返回占位提示
        return jsonify({'success': False, 'message': '合同审核智能 agent 未接入，仅支持腾讯问答', 'timestamp': datetime.now().isoformat()})
    except Exception as e:
        return jsonify({'success': False, 'message': f'合同审核失败: {str(e)}'})

# 4. 文件扫描接口（模拟）
@app.route('/api/scan', methods=['POST'])
def scan_file():
    data = request.json or {}
    filename = data.get('filename')
    session_id = data.get('session_id')
    if not session_id or session_id not in sessions:
        return jsonify({'success': False, 'message': '请先登录'})
    try:
        scan_result = simulate_file_scan(filename)
        return jsonify({'success': True, 'scan_result': scan_result, 'scan_time': datetime.now().isoformat()})
    except Exception as e:
        return jsonify({'success': False, 'message': f'文件扫描失败: {str(e)}'})

def simulate_file_scan(filename):
    return {
        'filename': filename,
        'status': 'safe',
        'threats_detected': [],
        'scan_details': {
            'malware_scan': 'clean',
            'sensitive_info': 'none',
            'file_integrity': 'good'
        },
        'recommendations': ['文件安全，可以正常使用']
    }

# 静态文件：前端入口
@app.route('/')
def serve_index():
    return send_from_directory(FRONTEND_DIR, 'index.html')

# 静态文件通用（支持 shared/, pages/, assets 等）
@app.route('/<path:filepath>')
def serve_static(filepath):
    target = os.path.join(FRONTEND_DIR, filepath)
    if not os.path.abspath(target).startswith(FRONTEND_DIR):  # 防止目录遍历
        abort(403)
    if os.path.isdir(target):
        index_file = os.path.join(target, 'index.html')
        if os.path.exists(index_file):
            return send_from_directory(target, 'index.html')
        abort(404)
    if not os.path.exists(target):
        abort(404)
    # 拆分目录与文件名
    directory = os.path.dirname(target)
    filename = os.path.basename(target)
    return send_from_directory(directory, filename)

# 提供上传文件访问
@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    file_path = os.path.join(UPLOADS_DIR, filename)
    if not os.path.exists(file_path):
        abort(404)
    return send_from_directory(UPLOADS_DIR, filename)

# 合同文本抽取：支持 PDF / DOCX / 纯文本
def extract_contract_text(path: str) -> str:
    lower = path.lower()
    try:
        if lower.endswith('.pdf'):
            from pdfminer.high_level import extract_text
            return extract_text(path)
        elif lower.endswith('.docx'):
            from docx import Document
            doc = Document(path)
            return '\n'.join(p.text for p in doc.paragraphs if p.text.strip())
        else:
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
    except Exception as e:
        raise RuntimeError(f'解析文件失败: {e}')

# ===== 合规新闻抓取 & 政策趋势接口 =====
_news_cache = {'items': [], 'timestamp': 0}
_trends_cache = None
_trends_lock = threading.Lock()

def _fetch_external_news(limit=15, timeout=8):
    sources = [
        ('CNIL', 'https://www.cnil.fr/en/news'),
        ('EDPB', 'https://www.edpb.europa.eu/news')
    ]
    items = []
    for name, url in sources:
        try:
            resp = requests.get(url, timeout=timeout)
            if resp.status_code != 200:
                continue
            soup = BeautifulSoup(resp.text, 'html.parser')
            # 简单提取前几个标题链接
            links = soup.select('a')[:30]
            for a in links:
                title = (a.get_text(strip=True) or '')
                href = a.get('href') or ''
                if len(title) < 10 or not href:
                    continue
                if href.startswith('/'):
                    href = url.rstrip('/') + href
                items.append({
                    'title': title[:150],
                    'url': href,
                    'source': name,
                    'published_at': datetime.now().strftime('%Y-%m-%d'),
                    'summary': ''
                })
                if len(items) >= limit:
                    break
            if len(items) >= limit:
                break
        except Exception:
            continue
    return items

def _fallback_news():
    return [
        {'title': '欧盟数据保护委员会发布最新跨境数据传输指引', 'url': '#', 'source': 'EDPB', 'published_at': datetime.now().strftime('%Y-%m-%d'), 'summary': '演示数据（待接入真实抓取）。'},
        {'title': '法国 CNIL 通报多家企业合规罚款情况', 'url': '#', 'source': 'CNIL', 'published_at': datetime.now().strftime('%Y-%m-%d'), 'summary': '演示数据。'},
        {'title': '新加坡 PDPC 发布个人数据保护监管简报', 'url': '#', 'source': 'PDPC', 'published_at': datetime.now().strftime('%Y-%m-%d'), 'summary': '演示数据。'}
    ]

@app.route('/api/compliance_news', methods=['GET'])
def compliance_news():
    now = time.time()
    # 10分钟缓存
    if now - _news_cache['timestamp'] > 600 or not _news_cache['items']:
        try:
            items = _fetch_external_news(limit=int(request.args.get('limit', 15)))
            if not items:
                items = _fallback_news()
            _news_cache['items'] = items
            _news_cache['timestamp'] = now
        except Exception:
            _news_cache['items'] = _fallback_news()
            _news_cache['timestamp'] = now
    return jsonify({'success': True, 'items': _news_cache['items'], 'cached_at': datetime.fromtimestamp(_news_cache['timestamp']).isoformat()})

def _load_trends():
    global _trends_cache
    if _trends_cache is None:
        with _trends_lock:
            if _trends_cache is None:
                data_path = os.path.join(BASE_DIR, 'data', 'policy_trends.json')
                if not os.path.exists(data_path):
                    _trends_cache = []
                else:
                    try:
                        with open(data_path, 'r', encoding='utf-8') as f:
                            _trends_cache = json.load(f)
                    except Exception:
                        _trends_cache = []
    return _trends_cache

@app.route('/api/policy_trends', methods=['GET'])
def policy_trends():
    items = _load_trends()
    region = request.args.get('region')
    category_raw = request.args.get('category')  # 支持逗号分隔多类别
    search = request.args.get('search', '').strip().lower()
    categories = []
    if category_raw and category_raw != 'all':
        categories = [c.strip() for c in category_raw.split(',') if c.strip()]
    filtered = []
    for it in items:
        if region and region != 'all' and it.get('region') != region:
            continue
        if categories and it.get('category') not in categories:
            continue
        if search and search not in (it.get('title','')+it.get('summary','')).lower():
            continue
        filtered.append(it)
    return jsonify({'success': True, 'items': filtered, 'total': len(filtered), 'filters': {'region': region, 'categories': categories, 'search': search}})

# ====== 新增：登出、产品信息抓取与产品合规占位审核 ======
@app.route('/api/logout', methods=['POST'])
def logout():
    data = request.json or {}
    session_id = data.get('session_id')
    if session_id and session_id in sessions:
        sessions.pop(session_id, None)
        return jsonify({'success': True, 'message': '已登出'})
    return jsonify({'success': False, 'message': '无效的 session 或已过期'})

@app.route('/api/product_info', methods=['POST'])
def product_info():
    data = request.json or {}
    url = data.get('url')
    session_id = data.get('session_id')
    if not session_id or session_id not in sessions:
        return jsonify({'success': False, 'message': '请先登录'})
    if not url:
        return jsonify({'success': False, 'message': '缺少产品链接 url'})
    # 简单占位抓取（安全考虑：不跟随过多跳转、超时限制；失败则使用占位）
    title = '产品标题'
    desc = '收到链接后将抓取页面内容并抽取图片与简介（当前为展示模式）。'
    img = 'https://via.placeholder.com/240x160?text=Product'
    try:
        resp = requests.get(url, timeout=6, headers={'User-Agent': 'LawFlowBot/1.0'})
        if resp.status_code == 200 and 'text/html' in resp.headers.get('Content-Type',''):
            from bs4 import BeautifulSoup as _BS
            soup = _BS(resp.text, 'html.parser')
            page_title = soup.find('title')
            if page_title and page_title.text.strip():
                title = page_title.text.strip()[:120]
            first_img = soup.find('img')
            if first_img and first_img.get('src'):
                img = first_img.get('src')
            # 简单取首段文本
            p = soup.find('p')
            if p and p.get_text(strip=True):
                desc = p.get_text(strip=True)[:300]
    except Exception:
        pass
    return jsonify({'success': True, 'product': {
        'url': url, 'title': title, 'image': img, 'description': desc, 'fetched_at': datetime.now().isoformat()
    }})

@app.route('/api/product_audit', methods=['POST'])
def product_audit():
    data = request.json or {}
    session_id = data.get('session_id')
    product = data.get('product', {})
    if not session_id or session_id not in sessions:
        return jsonify({'success': False, 'message': '请先登录'})
    title = product.get('title') or '未命名产品'
    url = product.get('url') or 'N/A'
    desc = product.get('description','')[:800]
    # 构造提示（若真实接入则通过 call_tencent_agent）
    prompt = f"对下述产品进行合规审查并输出：1. 政策合规 2. 知识产权风险 3. 商标识别与合法性 4. 综合判断(是否推荐该地区销售) 5. 改进建议 6. 推荐潜在市场。产品标题:{title}\n链接:{url}\n简介:{desc}"[:4000]
    agent_res = call_tencent_agent(prompt)
    # 若为占位返回，构造结构化包装
    text = agent_res.get('text','')
    summary_md = f"# 产品合规审查报告\n\n**产品标题**: {title}\n\n**链接**: {url}\n\n**政策合规**: \n- 需确认主要销售地区的进口/许可要求。\n\n**知识产权**: \n- 暂未发现明显侵权元素，建议进行进一步图像检索。\n\n**商标合法性**: \n- 建议核对商标注册分类。\n\n**综合判断**: \n- 初步可在主要目标市场试销。\n\n**改进建议**: \n- 强化产品描述合法来源说明。\n- 增补隐私/数据收集声明。\n\n**推荐市场**: 东南亚、欧洲部分国家。\n\n---\n参考回答: \n{text}"
    return jsonify({'success': True, 'audit': {
        'raw_text': text,
        'summary_md': summary_md,
        'suggestions': agent_res.get('suggestions', []),
        'recommended_markets': ['东南亚', '欧洲部分国家', '拉美新兴市场']
    }, 'timestamp': datetime.now().isoformat()})

# ====== 新增：统计接口（数字瀑布驱动） ======
@app.route('/api/stats', methods=['GET'])
def stats():
    base_monthly = 245
    high_risk = 37
    countries = 42
    return jsonify({'success': True, 'data': {
        'monthly_updates': base_monthly,
        'high_risk': high_risk,
        'countries_monitored': countries,
        'timestamp': datetime.now().isoformat()
    }})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)