// 配置
const API_BASE_URL = 'http://localhost:5000/api'; // 开发环境
// const API_BASE_URL = 'https://你的域名.com/api'; // 生产环境

// 全局状态
let currentUser = null;
let sessionId = null;

// 导航栏交互
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    checkLoginStatus();
    
    // 移动端菜单切换
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // 关闭移动端菜单当点击菜单项
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
    
    // 导航栏滚动效果
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.padding = '10px 0';
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.padding = '15px 0';
            navbar.style.boxShadow = 'none';
        }
    });
    
    // 平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 工作流程步骤交互
    const steps = document.querySelectorAll('.step');
    const stepDetails = document.querySelectorAll('.step-detail');
    
    steps.forEach(step => {
        step.addEventListener('click', function() {
            const stepNumber = this.getAttribute('data-step');
            
            // 更新步骤激活状态
            steps.forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            
            // 显示对应的步骤详情
            stepDetails.forEach(detail => {
                detail.classList.add('hidden');
                if (detail.id === `step-detail-${stepNumber}`) {
                    detail.classList.remove('hidden');
                }
            });
        });
    });
    
    // 功能卡片悬停效果增强
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.zIndex = '1';
        });
    });
    
    // 初始化事件监听器
    initEventListeners();
    
    // 页面加载动画
    initPageAnimations();

    // 统一登出 / 主题切换按钮事件委托
    document.body.addEventListener('click', async (e)=>{
        const target = e.target.closest('[data-action]');
        if(!target) return;
        const action = target.getAttribute('data-action');
        if(action === 'logout'){
            await performLogout({ reopenLogin: true });
        } else if(action === 'toggle-theme'){
            toggleTheme();
        }
    });
    // 初始化主题 (从 localStorage 恢复)
    const savedTheme = localStorage.getItem('lf_theme');
    if(savedTheme === 'dark'){ document.documentElement.classList.add('dark-mode'); }

    // 初始化全局登录弹窗关闭逻辑（跨页面健壮性）
    initGlobalLoginModal();
});

// ==================== API 调用函数 ====================

// === 已抽取到 FlowLawAPI (api.js) 的接口封装轻量包装层 ===
async function login(username, password){
    try { showLoading('登录中...'); const result = await FlowLawAPI.login(username, password);
        if(result.success){ sessionId = result.session_id; currentUser = result.user; updateUIAfterLogin(); showMessage('登录成功！','success'); }
        else { showMessage(result.message||'登录失败','error'); }
    } catch(e){ console.error('登录错误:', e); showMessage('网络错误，请检查后端服务是否启动','error'); } finally { hideLoading(); }
}

/**
 * 文件上传功能
 */
async function uploadFile(file){
    try { showLoading('上传文件中...'); const result = await FlowLawAPI.uploadFile(file);
        if(result.success){ showMessage('文件上传成功！','success'); return result; }
        showMessage(result.message||'上传失败','error'); return null;
    } catch(e){ console.error('上传错误:', e); showMessage('上传失败，请检查网络连接','error'); return null; } finally { hideLoading(); }
}

/**
 * 与腾讯云Agent对话
 */
async function chatWithAgent(message){
    if(!sessionId){ showMessage('请先登录','error'); return null; }
    try { showLoading('AI分析中...'); const result = await FlowLawAPI.chat(message, sessionId);
        if(result.success){ return result.response; }
        showMessage(result.message||'对话失败','error'); return null;
    } catch(e){ console.error('对话错误:', e); showMessage('网络错误，请重试','error'); return null; } finally { hideLoading(); }
}

/**
 * 文件扫描功能
 */
async function scanFile(filename){
    if(!sessionId){ showMessage('请先登录','error'); return null; }
    try { showLoading('扫描文件中...'); const result = await FlowLawAPI.scan(filename, sessionId);
        if(result.success){ showMessage('文件扫描完成！','success'); return result.scan_result; }
        showMessage(result.message||'扫描失败','error'); return null;
    } catch(e){ console.error('扫描错误:', e); showMessage('扫描失败，请重试','error'); return null; } finally { hideLoading(); }
}

// ==================== UI 更新函数 ====================

/**
 * 检查登录状态并更新UI
 */
function checkLoginStatus() {
    // 从本地存储恢复会话（可选功能）
    const savedSession = localStorage.getItem('userSession');
    if (savedSession) {
        try {
            const sessionData = JSON.parse(savedSession);
            sessionId = sessionData.sessionId;
            currentUser = sessionData.user;
            updateUIAfterLogin();
        } catch (e) {
            console.log('无有效会话');
        }
    }
}

/**
 * 登录后更新UI
 */
function updateUIAfterLogin() {
    // 显示用户信息
    const userInfoElement = document.getElementById('userInfo');
    const loginSection = document.getElementById('loginSection');
    const userSection = document.getElementById('userSection');
    
    if (userInfoElement && currentUser) {
        userInfoElement.textContent = `欢迎，${currentUser.name}`;
    }
    
    if (loginSection) loginSection.style.display = 'none';
    if (userSection) userSection.style.display = 'block';
    
    // 保存会话到本地存储
    if (sessionId && currentUser) {
        localStorage.setItem('userSession', JSON.stringify({
            sessionId: sessionId,
            user: currentUser
        }));
    }
}

/**
 * 登出功能
 */
function logout() {
    sessionId = null;
    currentUser = null;
    localStorage.removeItem('userSession');
    
    const loginSection = document.getElementById('loginSection');
    const userSection = document.getElementById('userSection');
    
    if (loginSection) loginSection.style.display = 'block';
    if (userSection) userSection.style.display = 'none';
    
    showMessage('已退出登录', 'info');
}

// ==================== 统一登出实现 ====================
async function performLogout({ reopenLogin=false }={}){
    const storedSession = localStorage.getItem('lf_session_id');
    if(storedSession){
        try {
            const r = await FlowLawAPI.logout(storedSession);
            console.log('[logout api]', r.success ? 'success' : 'fail');
        } catch(err){ console.warn('后端登出失败(忽略)', err); }
    }
    localStorage.removeItem('lf_session_id');
    localStorage.removeItem('lf_user_name');
    sessionId=null; currentUser=null;
    // 尝试更新首页 UI（若存在）
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) logoutBtn.style.display='none';
    const loginTriggers = document.querySelectorAll('.login-trigger');
    if(loginTriggers){ loginTriggers.forEach(btn=>{ btn.textContent='登录'; btn.removeAttribute('data-logged-in'); }); }
    showMessage('已退出登录', 'info');
    if(reopenLogin){
        const loginModal = document.getElementById('loginSection');
        if(loginModal){ loginModal.classList.add('active'); document.body.style.overflow='hidden'; }
    }
}

// ==================== 主题切换 ====================
function toggleTheme(){
    const root = document.documentElement;
    const isDark = root.classList.toggle('dark-mode');
    localStorage.setItem('lf_theme', isDark ? 'dark' : 'light');
    showMessage(isDark ? '已切换到深色模式' : '已切换到浅色模式', 'success');
}

// 暴露给其他页面
window.performLogout = performLogout;
window.toggleTheme = toggleTheme;

// ==================== 登录弹窗全局辅助 ====================
function initGlobalLoginModal(){
    const modal = document.getElementById('loginSection');
    if(!modal) return;
    // 若内部关闭按钮不存在则跳过（首页已有脚本绑定，这里只做兜底）
    if(!modal.dataset._globalBound){
        modal.addEventListener('click', (e)=>{ if(e.target === modal) closeLoginModal(); });
        document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && modal.classList.contains('active')) closeLoginModal(); });
        modal.dataset._globalBound = '1';
    }
}

function openLoginModal(){
    const modal = document.getElementById('loginSection');
    if(!modal) return;
    modal.classList.add('active');
    document.body.style.overflow='hidden';
    // 居中保证
    modal.style.display='flex';
    modal.style.alignItems='center';
    modal.style.justifyContent='center';
}

function closeLoginModal(){
    const modal = document.getElementById('loginSection');
    if(!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow='';
}

window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;

// ==================== 事件监听器初始化 ====================

function initEventListeners() {
    // 登录表单提交
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (username && password) {
                await login(username, password);
            }
        });
    }
    
    // 文件上传
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    
    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', function() {
            if (!sessionId) {
                showMessage('请先登录', 'error');
                return;
            }
            
            if (fileInput.files.length === 0) {
                showMessage('请选择文件', 'error');
                return;
            }
            
            const file = fileInput.files[0];
            handleFileUpload(file);
        });
    }
    
    // 聊天功能
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    
    if (sendBtn && chatInput) {
        sendBtn.addEventListener('click', async function() {
            const message = chatInput.value.trim();
            if (!message) return;
            
            if (!sessionId) {
                showMessage('请先登录', 'error');
                return;
            }
            
            await handleChat(message);
            chatInput.value = '';
        });
        
        // 回车发送
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendBtn.click();
            }
        });
    }
    
    // 登出按钮
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // 扫描按钮
    const scanBtn = document.getElementById('scanBtn');
    if (scanBtn) {
        scanBtn.addEventListener('click', async function() {
            const filename = document.getElementById('selectedFile').textContent;
            if (!filename || filename === '未选择文件') {
                showMessage('请先上传文件', 'error');
                return;
            }
            
            const scanResult = await scanFile(filename);
            if (scanResult) {
                displayScanResult(scanResult);
            }
        });
    }
}

// ==================== 业务逻辑处理函数 ====================

async function handleFileUpload(file) {
    // 检查文件类型和大小
    const validTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.some(type => file.name.toLowerCase().endsWith(type))) {
        showMessage('不支持的文件类型', 'error');
        return;
    }
    
    if (file.size > maxSize) {
        showMessage('文件大小不能超过10MB', 'error');
        return;
    }
    
    const result = await uploadFile(file);
    if (result) {
        // 更新UI显示文件名
        const fileNameElement = document.getElementById('selectedFile');
        if (fileNameElement) {
            fileNameElement.textContent = result.filename;
            fileNameElement.style.color = '#4CAF50';
        }
    }
}

async function handleChat(message) {
    const chatContainer = document.getElementById('chatContainer');
    
    // 添加用户消息
    addMessageToChat('user', message);
    
    // 获取AI回复
    const response = await chatWithAgent(message);
    if (response) {
        addMessageToChat('assistant', response.text);
        
        // 显示建议（如果有）
        if (response.suggestions) {
            displaySuggestions(response.suggestions);
        }
    }
}

function addMessageToChat(sender, message) {
    const chatContainer = document.getElementById('chatContainer');
    if (!chatContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${sender}`;
    messageElement.innerHTML = `
        <div class="message-bubble">
            <div class="message-content">${message}</div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        </div>
    `;
    
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function displaySuggestions(suggestions) {
    const suggestionsContainer = document.getElementById('suggestionsContainer');
    if (!suggestionsContainer) return;
    
    suggestionsContainer.innerHTML = '';
    suggestions.forEach(suggestion => {
        const button = document.createElement('button');
        button.className = 'suggestion-btn';
        button.textContent = suggestion;
        button.onclick = () => {
            document.getElementById('chatInput').value = suggestion;
            document.getElementById('sendBtn').click();
        };
        suggestionsContainer.appendChild(button);
    });
}

function displayScanResult(scanResult) {
    const resultContainer = document.getElementById('scanResult');
    if (!resultContainer) return;
    
    resultContainer.innerHTML = `
        <div class="scan-result-card">
            <h4>扫描结果: ${scanResult.filename}</h4>
            <div class="status ${scanResult.status}">
                状态: ${scanResult.status === 'safe' ? '安全' : '存在风险'}
            </div>
            <div class="scan-details">
                <p>恶意软件扫描: ${scanResult.scan_details.malware_scan}</p>
                <p>敏感信息: ${scanResult.scan_details.sensitive_info}</p>
                <p>文件完整性: ${scanResult.scan_details.file_integrity}</p>
            </div>
            ${scanResult.recommendations ? `
                <div class="recommendations">
                    <strong>建议:</strong>
                    <ul>
                        ${scanResult.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;
}

// ==================== 工具函数 ====================

function showMessage(message, type = 'info') {
    // 创建或显示消息提示
    let messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'messageContainer';
        messageContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
        `;
        document.body.appendChild(messageContainer);
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    messageElement.style.cssText = `
        padding: 12px 20px;
        margin: 5px 0;
        border-radius: 4px;
        color: white;
        background: ${type === 'success' ? '#4CAF50' : 
                    type === 'error' ? '#f44336' : 
                    type === 'warning' ? '#ff9800' : '#2196F3'};
    `;
    
    messageContainer.appendChild(messageElement);
    
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

function showLoading(message = '处理中...') {
    let loading = document.getElementById('loadingOverlay');
    if (!loading) {
        loading = document.createElement('div');
        loading.id = 'loadingOverlay';
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
            font-size: 18px;
        `;
        document.body.appendChild(loading);
    }
    
    loading.innerHTML = `
        <div style="text-align: center;">
            <div class="spinner"></div>
            <div>${message}</div>
        </div>
    `;
    loading.style.display = 'flex';
}

function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) {
        loading.style.display = 'none';
    }
}

// ==================== 动画相关代码（保留原有动画） ====================

function initPageAnimations() {
    // 世界地图背景动画增强
    const worldMapBg = document.querySelector('.world-map-bg');
    if (worldMapBg) {
        document.addEventListener('mousemove', function(e) {
            if (window.innerWidth > 768) {
                const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
                const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
                worldMapBg.style.transform = `scale(1.05) translate(${xAxis}px, ${yAxis}px)`;
            }
        });
        
        document.addEventListener('mouseleave', function() {
            worldMapBg.style.transform = 'scale(1.05) translateX(0)';
        });
    }
    
    // 其他动画效果（保留原有代码）
    // ... [原有的动画代码保持不变] ...
}

// 添加必要的CSS样式
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    .chat-message {
        margin: 10px 0;
        display: flex;
    }
    
    .chat-message.user {
        justify-content: flex-end;
    }
    
    .chat-message.assistant {
        justify-content: flex-start;
    }
    
    .message-bubble {
        max-width: 70%;
        padding: 10px 15px;
        border-radius: 18px;
        background: #f1f1f1;
    }
    
    .chat-message.user .message-bubble {
        background: #007bff;
        color: white;
    }
    
    .message-time {
        font-size: 0.8em;
        opacity: 0.7;
        margin-top: 5px;
    }
    
    .suggestion-btn {
        margin: 5px;
        padding: 5px 10px;
        border: 1px solid #ddd;
        border-radius: 15px;
        background: white;
        cursor: pointer;
    }
    
    .suggestion-btn:hover {
        background: #f5f5f5;
    }
    
    .scan-result-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        margin: 10px 0;
    }
    
    .status.safe {
        color: #4CAF50;
        font-weight: bold;
    }
    
    .status.risk {
        color: #f44336;
        font-weight: bold;
    }
    
    .spinner {
        border: 3px solid #f3f3f3;
        border-top: 3px solid #3498db;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: spin 1s linear infinite;
        margin: 0 auto 10px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .hidden {
        display: none !important;
    }
`;
document.head.appendChild(dynamicStyles);