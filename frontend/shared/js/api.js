// 统一 API 请求封装 & 功能接口抽取
// 使用方式：在页面 HTML 中确保 <script src="shared/js/api.js"></script> 早于 script.js / 其他业务脚本。
// 调用：FlowLawAPI.login(username, password)

(function(global){
const BASE = 'https://flow-law-ai.onrender.com/api';
	async function request(path, { method = 'GET', headers = {}, body = undefined, raw = false } = {}) {
		const opts = { method, headers, body };
		const resp = await fetch(`${BASE}${path}`, opts);
		if (raw) return resp;
		let data;
		try { data = await resp.json(); } catch (e) { throw new Error(`响应不是有效JSON: ${e.message}`); }
		return data;
	}

	async function login(username, password){
		return request('/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password })
		});
	}

	async function uploadFile(file){
		const fd = new FormData();
		fd.append('file', file);
		return request('/upload', { method: 'POST', body: fd });
	}

	// 修复：chat 方法改为后端 API 调用，安全无跨域
	async function chat(message, sessionId){
		return request('/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ message, session_id: sessionId })
		});
	}

	async function scan(filename, sessionId){
		return request('/scan', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ filename, session_id: sessionId })
		});
	}

	async function auditContract(filename, sessionId){
		return request('/contract_audit', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ filename, session_id: sessionId })
		});
	}

	async function logout(sessionId){
		return request('/logout', {
			method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId })
		});
	}

	async function productInfo(url, sessionId){
		return request('/product_info', {
			method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url, session_id: sessionId })
		});
	}

	async function productAudit(product, sessionId){
		return request('/product_audit', {
			method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product, session_id: sessionId })
		});
	}

	global.FlowLawAPI = { request, login, uploadFile, chat, scan, auditContract, logout, productInfo, productAudit };
})(window);

