// 统一 API 请求封装 & 功能接口抽取
// 使用方式：在页面 HTML 中确保 <script src="shared/js/api.js"></script> 早于 script.js / 其他业务脚本。
// 调用：FlowLawAPI.login(username, password)

(function(global){
	const BASE = 'const BASE = 'https://flow-law-ai.onrender.com/api'; 

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

	// 腾讯云 HTTP SSE 智能问答
	const FIXED_BOT_APP_KEY = 'PaoePzIPDpqZRDFfWrAuKIvOXYNehWVPurzAzSnQOcZLHHBcNcXUNEHLPtvtArKfxENnEUkCaojJRWMAjqsuttiHbFiGqhKPvGNjPdeYKsUqTVkOUlmxIMsmVdIPJbum'; // 请替换为你的真实AppKey

	async function chat({
		content,
		session_id,
		visitor_biz_id,
		request_id,
		file_infos,
		streaming_throttle,
		custom_variables,
		system_role,
		incremental,
		search_network,
		model_name,
		stream,
		workflow_status,
		visitor_labels
	} = {}) {
		// 默认参数校验
		if (!content && (!file_infos || file_infos.length === 0)) throw new Error('content 或 file_infos 必须提供');
		if (!session_id) throw new Error('session_id 必填');
		if (!visitor_biz_id) throw new Error('visitor_biz_id 必填');
		const body = {
			content,
			session_id,
			bot_app_key: FIXED_BOT_APP_KEY,
			visitor_biz_id,
			request_id,
			file_infos,
			streaming_throttle,
			custom_variables,
			system_role,
			incremental,
			search_network,
			model_name,
			stream,
			workflow_status,
			visitor_labels
		};
		Object.keys(body).forEach(k => body[k] === undefined && delete body[k]);
		const resp = await fetch('https://wss.lke.cloud.tencent.com/v1/qbot/chat/sse', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
		return resp;
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

