// 提取自 agent.html 的主脚本逻辑
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const chatInput = document.getElementById('chat-input');
const sendMessageButton = document.getElementById('send-message');
const chatMessages = document.getElementById('chat-messages');
const statusIndicator = document.getElementById('status-indicator');
const charCount = document.getElementById('char-count');
const clearChatButton = document.getElementById('clear-chat');
const historyToggleButton = document.getElementById('history-toggle');
const historyModal = document.getElementById('history-modal');
const closeHistoryButton = document.getElementById('close-history');
const settingsToggleButton = document.getElementById('settings-toggle');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsButton = document.getElementById('close-settings');
const suggestions = document.getElementById('suggestions');
const questionItems = document.querySelectorAll('.question-item');
const voiceInputButton = document.getElementById('voice-input');
const uploadFileButton = document.getElementById('upload-file');
// 产品审查相关元素
const productUrlInput = document.getElementById('productUrlInput');
const fetchProductBtn = document.getElementById('fetchProductBtn');
const auditProductBtn = document.getElementById('auditProductBtn');
const productInfoPanel = document.getElementById('product-info-panel');
const productImage = document.getElementById('productImage');
const productTitleEl = document.getElementById('productTitle');
const productDescEl = document.getElementById('productDesc');
const productMetaEl = document.getElementById('productMeta');
const auditResultWrap = document.getElementById('product-audit-result');
const auditRawText = document.getElementById('auditRawText');
const auditMd = document.getElementById('auditMd');
const auditMarkets = document.getElementById('auditMarkets');
// 功能卡片相关
const promptTemplates = document.querySelectorAll('.prompt-template');

let currentConversation = [];
let canvas, particles = [];

// ================== 模拟问答映射（用于试用录制，无需后端） ==================
// 通过关键词数组部分匹配，不输出“模拟”字样。
const mockQAMap = [
  {
    keys: ['泰国','出口','智能家居','分销商','质量责任','售后','GlobalTech'],
    answer: `在与泰国分销商签订智能家居设备经销/供货合同时，质量责任与售后条款建议包含：\n\n【核心法律参考】\n1. 泰国《消费者保护法》与《产品责任法》(Product Liability Act B.E.2551) 对缺陷产品造成的人身与财产损害采用严格责任。\n2. 电子电气设备需符合 TISI (Thai Industrial Standards Institute) 相关强制性标准，部分智能设备可能涉及 NBTC 通信许可。\n3. 保修声明应避免绝对性用语（"终身保用"），并明确合理使用范围与排除条款。\n\n【合同条款要点】\n• 质量保证：约定交付时的合格标准、检测程序、可引用 TISI/IEC/安全认证指标。\n• 缺陷处理时限：设置发现后通知期 (例如 30 日) 与补救期 (例如 15–30 日)，并区分可修复与需更换情形。\n• 备件与售后：定义备件最低库存或由谁承担国际运费；明确远程诊断与现场支持触发条件。\n• 质量追责层级：区分制造缺陷、运输风险、分销商不当储存，各自的责任承担方式。\n• 召回与通报：若设备存在安全隐患，分销商须协助向消费者与主管机关发布通知，明确费用分担与数据收集合规处理。\n• 责任限额：可对间接及后果性损失进行排除，但须保留对造成人身伤害/故意或重大过失的法定责任豁免。\n• 法规更新协同：约定因泰国监管更新（安全标签、电源适配要求）导致的改版与成本分担机制。\n\n【语言与文档】\n• 保修卡与使用说明建议同时提供泰语版本，提高本地消费者理解与投诉风险控制。\n• 明确售后联络渠道（电话/LINE/邮件）与响应时间 SLA。\n\n【风险缓解建议】\n1. 在交付前进行抽样或第三方检验，留存报告。\n2. 建立序列号/批次追踪，简化潜在召回。\n3. 约定分销商月度质量/退货数据反馈格式，便于趋势分析。\n4. 对 IoT 类设备增加固件更新与安全补丁服务承诺范围。`
  },
  {
    keys: ['泰国','数据保护','分销商','客户','联系信息','市场分析'],
    answer: `涉及泰国客户联系信息处理时需关注《泰国个人数据保护法》(PDPA B.E.2562)：\n\n【适用判断】\n• 若泰国分销商向你方提供本地自然人数据（邮箱/电话），你方在决定处理目的与方式时即构成“数据控制者”或与其共同控制。\n\n【核心要求】\n1. 处理基础：使用于市场分析/直销，优先取得有效同意或进行合法权益评估 (Legitimate Interest Assessment)。\n2. 告知义务：需在首次收集/接收数据后合理时间内向数据主体提供隐私告知（目的、数据类别、跨境传输、保留期限、权利）。\n3. 跨境传输：向泰国外（例如传回总部所在国）传输时需确保接收国具备充分标准或采用合同保障条款/组织性措施。\n4. 目的限制：仅用于已声明分析与分层，不得二次用于不相关推送。\n5. 数据最小化与保留：定义保留时限（例如 12 个月滚动评估后匿名化）。\n6. 安全措施：采用访问控制、分级授权、脱敏/散列化处理邮箱与电话用于统计。\n7. 数据主体权利：支持访问、更正、撤回同意、删除与反对直销。\n\n【操作建议】\n• 与分销商签署附属的数据处理/共享附录 (Data Sharing Addendum)。\n• 建立来源标记字段（source=TH_distributor_2025Q1）。\n• 审查是否包含未成年人数据，必要时单独同意与家长授权。\n• 生成保留与删除计划（季度清理 + 匿名化报表）。`
  },
  {
    keys: ['德国','诉讼时效','技术合作','合同','选择德国法','纠纷','欧盟'],
    answer: `德国法下普通合同请求的基础诉讼时效通常为 3 年：\n\n【起算机制】\n• 自权利人知悉或应当知悉权利受侵害及义务人之年末 (知悉当年 12月31日开始计时)，到第 3 个历年年末届满。\n\n【较长时效】\n• 10 年：不以知悉为要件的部分请求（如所有权返还、特定侵权）。\n• 30 年：涉及故意侵害生命、身体、健康或自由，或已生效判决、调解确定的请求。\n\n【欧盟与德国差异】\n• 欧盟层面并无统一全部民事普通请求时效，实际适用成员国国内法；合同选择德国法即按德国民法典 (BGB) 相关条款。\n\n【合同实践建议】\n1. 在商业合作中可设定内部通知/索赔期限（如缺陷通知 30/60 天）与合同内责任期限（不应低于法定最低保障）。\n2. 明确知识产权保证/保密义务的存续期（例如保密 5 年，IP 侵权索赔亦可能适用 3 年普通时效但建议保留延伸条款）。\n3. 对关键保证条款避免通过“缩短时效”方式规避不可排除的法定权利。\n4. 若存在持续性义务（维护/升级服务），重新计算违约行为发生的起算点。`
  },
  {
    keys: ['overseas','marketing','campaign','coupons','europe','email','database','china','issues'],
    answer: `Sending promotional coupons to users in Europe raises several compliance points under GDPR:\n\n1. Lawful Basis: Direct marketing typically relies on consent or legitimate interests. If relying on legitimate interests, conduct and document an LIA (impact on user expectations, balancing test, opt-out mechanism).\n2. Data Source & Transparency: If emails were collected for account operations only, repurpose for marketing requires updated notice + clear unsubscribe link for each message.\n3. Cross-Border Transfer: Storing/processing EU user data solely in China triggers international transfer concerns. Implement SCCs (2021 version) or other safeguards; assess Chinese legal environment impact (DTIA).\n4. Minimisation: Export only fields necessary for segmentation (e.g., hashed email for matching, country code, preference flags), avoid full profile dump.\n5. Frequency & Throttling: Define a contact policy (e.g., max 2 marketing emails / 14 days) to mitigate spam complaints.\n6. Logging & Evidence: Maintain consent records / preference changes; store suppression list separately and secure.\n7. DPIA Trigger: If large-scale profiling or combining data sets for behavioural targeting, run a DPIA before launch.\n\nRecommendation: Prepare a one-page compliance checklist (lawful basis, SCCs, unsubscribe, suppression workflow, logging). Avoid “silent export” from production DB; use a curated marketing dataset. Fines and reputational risk exist even for first campaign.`
  },
  {
    keys: ['small scale','few hundred','risk high','test','emails','send','try'],
    answer: `Even a pilot sending a few hundred emails can expose compliance risk:\n\n【为什么风险仍在】\n• GDPR 没有“测试豁免”；单封未经正当法律基础的直销即可能构成违规。\n• 小规模仍可能引发投诉 (Data Subject Complaint) → 监管调查。\n• 缺少审计轨迹 (consent log / suppression list) 时难以证明合规性。\n\n【建议做法】\n1. 先完成最小合规清单：合法基础确认 + 退订机制 + 传输保障。\n2. 建立 unsubscribe & bounce 处理逻辑，避免继续触达拒绝用户。\n3. 对测试人群打标签 (segment=test_cohort_q1)，独立存储便于后续删除。\n4. 发送前运行脚本排除已退订或投诉账号。\n5. 保留邮件样本文档（日期、主题、CTA 链接）用于事后审查。\n\n结论：不要“先发再说”，应“先验证后发送”。`
  },
  {
    keys: ['隐私政策','太长','用户友好','阅读','agree','用户','改进'],
    answer: `隐私政策可通过“分层 + 结构化 + 可行操作”方式提升可读性：\n\n【分层展示】\n1. 第一层：概览卡片（收集哪些类别 + 核心用途 + 用户三项主要权利）简短 6–8 行。\n2. 第二层：详细章节（收集来源、处理目的、法律基础、第三方共享、保留期限、跨境传输、安全措施、权利行使流程）。\n3. 第三层：可下载/版本历史 (变更摘要 + 生效日期)。\n\n【语言与排版】\n• 使用表格列出“数据类别–用途–法律基础–保留期”。\n• 避免堆砌法律术语，用行动动词与示例（例如：用于“向您发送订单状态邮件”）。\n• 添加锚点 + 展开折叠组件减少滚动。\n\n【交互增强】\n• 引入图标分类：账户信息、交易、分析、定位、营销。\n• 权利操作按钮：一键打开“下载数据”或“删除请求”表单（邮件模板预填）。\n• 提供搜索框与 FAQ 快捷入口。\n\n【合规要点提醒】\n1. 明确跨境传输路径与保障机制。\n2. 标注自动化决策与画像是否存在。\n3. 对未成年人条款单独分节。\n4. 显示上次更新日期与下次评审计划 (例如 每半年审核)。\n\n【实施步骤建议】\n• 起草“数据用途矩阵”内部对齐 → 生成公开版表格。\n• 进行可读性测试 (Flesch/字数统计) → 调整句子长度。\n• 发布前法律审查 + 安全团队核对技术控制描述。`
  }
  ,{
    keys: ['产品链接','合规','初步','审查','核心信息','风险','抓取'],
    answer: `以下为基于产品链接（假设为一款“儿童智能定位手表 GPS+心率监测”页面）进行的结构化信息抓取与初步合规要点归纳：\n\n【核心信息提炼】\n• 标题：儿童智能定位健康监测手表（4G / GPS / 心率 / SOS）\n• 主图：设备主体（彩色硅胶腕带 + 正面触控屏），应避免展示未获授权的卡通形象。\n• 主要功能：实时定位、电子围栏提醒、心率与步数监测、课堂静音模式、紧急 SOS 呼叫、IP67 级防水。\n• 材质：医用级或食品级硅胶腕带 + ABS/PC 外壳 + 钢化玻璃/强化塑料屏幕（需说明低致敏性与耐汗腐蚀）。\n• 适用人群：6–12 岁儿童及其监护人（定位与健康数据面向监护人查看）。\n\n【潜在合规风险分类】\n1. 安全认证：\n   - 欧盟：需玩具 / 儿童智能设备安全要求 + CE（低电压 LVD / EMCD / RED 若含蜂窝与蓝牙）+ RoHS。\n   - 美国：FCC（射频）+ CPSIA（含铅、邻苯限值）+ 若声称健康功能需 FDA 软件/医疗器械边界评估。\n   - 电池：锂电池运输 UN38.3 与 IEC 62133；需标注充电与使用安全警示。\n2. 环保材料：\n   - 硅胶与塑料需符合 RoHS/REACH 限用物质；若宣传“食品级”需具备相应测试报告。\n   - 腕带皮肤接触部位避免镍释放（EN 1811 测试）。\n   - 包装是否使用可回收材料（纸浆标识 / 无过度塑封）。\n3. 知识产权：\n   - 外观设计与 UI 图标需自行检索专利/外观（避免与已注册儿童手表造型近似度过高）。\n   - 品牌商标在目标市场（EUIPO / USPTO / 中国商标网）注册状态。\n   - 若集成第三方定位 / 健康算法 SDK，需确认源码许可与再分发条款。\n4. 目标市场准入：\n   - 数据与隐私：儿童定位与健康数据 → GDPR / COPPA / 中国《未成年人保护法》《个人信息保护法》；应最小化采集并提供监护人同意 + 单独隐私分层说明。\n   - 无线模块：各国频段许可（例如欧盟 RED 技术文档 + 美国频谱测试报告）。\n   - SOS 功能若接入公共应急通道需额外审批（部分国家不能假借紧急号码）。\n\n【改进与减缓建议】\n• 建立“儿童模式”数据分类：定位（高敏感）与运动指标（中敏感）分离存储与访问控制。\n• 默认关闭持续心率高频采集，采用事件/阈值触发，降低隐私与电池消耗。\n• 在包装与电子说明中增加安全与监护提示（示例：“本设备非医疗器械，不用于诊断”）。\n• 准备合规文档包：技术文件 (Technical File) + 风险评估 + 使用说明多语言版（含欧盟 24 个月保修条款）。\n• 对所有平台营销素材运行商标与外观重复检测（内部清单 + 第三方图像相似度扫描）。\n\n【下一步可问】\n可以继续询问：\n1. “如何编写该儿童手表的欧盟 CE 技术文件目录？”\n2. “针对儿童定位功能 GDPR 合规需要哪些额外控制点？”\n3. “心率功能是否触发医疗器械监管边界？”`
  }
];

function normalizeMsg(msg){
  return msg.toLowerCase().replace(/[\s\n\r]+/g,' ').replace(/[,，。.!?？:：]/g,'');
}

function findMockAnswer(input){
  const norm = normalizeMsg(input);
  for(const item of mockQAMap){
    const hit = item.keys.every(k=> norm.includes(k.toLowerCase()));
    if(hit) return item.answer;
  }
  // 允许部分匹配：>=2 关键词命中返回
  for(const item of mockQAMap){
    let count = 0;
    item.keys.forEach(k=>{ if(norm.includes(k.toLowerCase())) count++; });
    if(count >= Math.min(2, item.keys.length)) return item.answer;
  }
  return null;
}

// 移动端菜单切换
mobileMenuButton.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
});

// 输入框字符计数
chatInput.addEventListener('input', () => {
  const count = chatInput.value.length;
  charCount.textContent = count;
  if (count > 0) suggestions.classList.remove('hidden'); 
  else suggestions.classList.add('hidden');
  if (count > 500) { 
    chatInput.value = chatInput.value.substring(0, 500); 
    charCount.textContent = 500; 
  }
});

// 发送消息
function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;
  addMessage('user', message);
  chatInput.value = ''; 
  charCount.textContent = '0'; 
  suggestions.classList.add('hidden');
  showTypingIndicator();
  
  // 粒子效果：消息发送时粒子向聊天框聚集
  triggerParticleRipple();

  // 优先匹配本地模拟问答（试用录制）
  const mockAns = findMockAnswer(message);
  if(mockAns){
    setTimeout(()=>{ removeTypingIndicator(); streamResponse(mockAns); }, 500);
    return; // 不调用后端
  }

  // 调用后端真实接口 (占位)
  const sessionId = localStorage.getItem('lf_session_id');
  if(!sessionId){
    setTimeout(()=>{ 
      removeTypingIndicator(); 
      streamResponse('请先在首页登录以启用真实AI对话功能。'); 
    }, 600);
    return;
  }
  
  fetch('http://localhost:5000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id: sessionId })
  })
    .then(r=>r.json())
    .then(data=>{
      removeTypingIndicator();
      if(data.success){
        const resp = data.response;
        let cleaned = (resp.text || '[无文本内容]').replace(/占位|模拟/g,'').replace(/\[无文本内容\]/,'');
        streamResponse(cleaned);
        if(resp.suggestions && resp.suggestions.length){
          streamResponse('建议: ' + resp.suggestions.join(' | '));
        }
      } else {
        streamResponse(data.message || '对话失败');
      }
    })
    .catch(err=>{ 
      removeTypingIndicator(); 
      streamResponse('网络错误或后端未启动: ' + err.message); 
    });
}

// 添加消息到聊天窗口
function addMessage(role, content, save = true) {
  const now = new Date();
  const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  const dateString = `今天 ${timeString}`;
  const messageDiv = document.createElement('div');
  messageDiv.className = role === 'user' ? 'flex items-start justify-end' : 'flex items-start';
  messageDiv.classList.add('agent-msg-enter');
  
  if (role === 'user') {
    messageDiv.innerHTML = `
      <div class="bg-secondary bg-opacity-20 rounded-lg p-3 max-w-[80%]">
        <p>${content}</p>
        <div class="mt-1 text-xs text-light text-opacity-50 text-right"><span>${dateString}</span></div>
      </div>
      <div class="w-8 h-8 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center ml-2 flex-shrink-0">
        <i class="fa fa-user text-secondary"></i>
      </div>`;
  } else {
    messageDiv.innerHTML = `
      <div class="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
        <img src="../shared/assets/icon/robot.jpg" alt="AI Assistant" class="w-full h-full object-cover">
      </div>
      <div class="bg-white bg-opacity-10 rounded-lg p-3 max-w-[80%]">
        <p>${content}</p>
        <div class="mt-1 text-xs text-light text-opacity-50"><span>${dateString}</span></div>
      </div>`;
  }
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  if (save) { 
    currentConversation.push({ role, content, timestamp: now.toISOString() }); 
    saveConversation(); 
  }
}

// 显示正在输入指示器
function showTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.id = 'typing-indicator';
  typingDiv.className = 'flex items-start';
  typingDiv.innerHTML = `
    <div class="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
      <img src="../shared/assets/icon/robot.jpg" alt="AI Assistant" class="w-full h-full object-cover">
    </div>
    <div class="bg-white bg-opacity-10 rounded-lg p-3">
      <p class="typing-text">正在思考</p>
    </div>`;
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  let dotCount = 0;
  const typingText = typingDiv.querySelector('.typing-text');
  const typingInterval = setInterval(() => { 
    dotCount = (dotCount + 1) % 4; 
    typingText.textContent = '正在思考' + '.'.repeat(dotCount); 
  }, 500);
  typingDiv.dataset.intervalId = typingInterval;
}

// 移除正在输入指示器
function removeTypingIndicator() {
  const typingIndicator = document.getElementById('typing-indicator');
  if (typingIndicator) { 
    clearInterval(parseInt(typingIndicator.dataset.intervalId)); 
    typingIndicator.remove(); 
  }
}

// 流式显示响应
function streamResponse(text) {
  const responseId = 'stream-response-' + Date.now();
  const timeId = 'stream-time-' + Date.now();
  const responseDiv = document.createElement('div');
  responseDiv.className = 'flex items-start';
  responseDiv.classList.add('agent-msg-enter');
  responseDiv.innerHTML = `
    <div class="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
      <img src="../shared/assets/icon/robot.jpg" alt="AI Assistant" class="w-full h-full object-cover">
    </div>
    <div class="bg-white bg-opacity-10 rounded-lg p-3 max-w-[80%]">
      <p id="${responseId}"></p>
      <div class="mt-1 text-xs text-light text-opacity-50"><span id="${timeId}">今天 ${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')}</span></div>
    </div>`;
    
  chatMessages.appendChild(responseDiv); 
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  const streamResponseElement = document.getElementById(responseId); 
  let index = 0; 
  const typingSpeed = 20;
  
  (function typeNextCharacter(){ 
    if (index < text.length) { 
      streamResponseElement.textContent += text.charAt(index); 
      index++; 
      chatMessages.scrollTop = chatMessages.scrollHeight; 
      setTimeout(typeNextCharacter, typingSpeed); 
    } else { 
      currentConversation.push({ 
        role: 'assistant', 
        content: text, 
        timestamp: new Date().toISOString() 
      }); 
      saveConversation(); 
    } 
  })();
}

// 保存对话历史
function saveConversation() {
  if (currentConversation.length === 0) return;
  const conversation = { 
    id: 'conv_' + Date.now(), 
    title: currentConversation[0].content.substring(0, 20) + (currentConversation[0].content.length > 20 ? '...' : ''), 
    timestamp: new Date().toISOString(), 
    messages: [...currentConversation] 
  };
  const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
  history.push(conversation);
  localStorage.setItem('chatHistory', JSON.stringify(history));
  updateHistoryList();
}

// 更新历史列表
function updateHistoryList() {
  const historyItems = document.querySelectorAll('.history-item');
  if (historyItems.length === 0) return;
  const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
  if (history.length === 0) return;
  
  const latestConversation = history[history.length - 1];
  const latestHistoryItem = historyItems[0];
  latestHistoryItem.querySelector('h4').textContent = latestConversation.title;
  latestHistoryItem.querySelector('p').textContent = latestConversation.messages[0].content.substring(0, 50) + (latestConversation.messages[0].content.length > 50 ? '...' : '');
  
  const date = new Date(latestConversation.timestamp); 
  const today = new Date(); 
  const yesterday = new Date(today); 
  yesterday.setDate(yesterday.getDate() - 1);
  
  let dateString;
  if (date.toDateString() === today.toDateString()) 
    dateString = `今天 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  else if (date.toDateString() === yesterday.toDateString()) 
    dateString = `昨天 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  else 
    dateString = `${date.getFullYear()}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getDate().toString().padStart(2,'0')}`;
    
  latestHistoryItem.querySelector('span').textContent = dateString;
}

// 清除聊天记录
clearChatButton.addEventListener('click', () => {
  if (!confirm('确定要清除当前聊天记录吗？')) return;
  chatMessages.innerHTML = ''; 
  currentConversation = [];
  addMessage('assistant', '您好！我是智能合规问答机器人，可以为您提供实时合规咨询和问题解答。请问有什么可以帮助您的？', false);
});

// 历史记录模态框控制
historyToggleButton.addEventListener('click', () => historyModal.classList.remove('hidden'));
closeHistoryButton.addEventListener('click', () => historyModal.classList.add('hidden'));

// 设置模态框控制
settingsToggleButton.addEventListener('click', () => settingsModal.classList.remove('hidden'));
closeSettingsButton.addEventListener('click', () => settingsModal.classList.add('hidden'));

// 点击外部关闭模态框
window.addEventListener('click', (e) => { 
  if (e.target === historyModal) historyModal.classList.add('hidden'); 
  if (e.target === settingsModal) settingsModal.classList.add('hidden'); 
});

// 常用问题点击填充
questionItems.forEach(item => { 
  item.addEventListener('click', () => { 
    chatInput.value = item.querySelector('p').textContent; 
    sendMessage(); 
  }); 
});

// 建议项点击填充
document.querySelectorAll('.suggestion-item').forEach(item => { 
  item.addEventListener('click', () => { 
    chatInput.value = item.textContent; 
    sendMessage(); 
  }); 
});

// 语音输入模拟
voiceInputButton.addEventListener('click', () => {
  voiceInputButton.classList.add('text-secondary');
  statusIndicator.textContent = '正在聆听...';
  
  setTimeout(() => {
    voiceInputButton.classList.remove('text-secondary');
    statusIndicator.textContent = '已连接到AI助手';
    chatInput.value = '什么是数据合规？';
    sendMessage();
  }, 2000);
});

// 文件上传模拟
uploadFileButton.addEventListener('click', () => {
  const fileInput = document.createElement('input');
  fileInput.type = 'file'; 
  fileInput.accept = '.pdf,.doc,.docx';
  
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length === 0) return;
    const fileName = e.target.files[0].name;
    statusIndicator.textContent = `正在上传并分析 ${fileName}...`;
    
    setTimeout(() => {
      statusIndicator.textContent = '已连接到AI助手';
      addMessage('user', `[上传文件] ${fileName}`);
      
      setTimeout(() => { 
        showTypingIndicator(); 
        setTimeout(() => { 
          removeTypingIndicator(); 
          streamResponse(`我已分析了您上传的文件 "${fileName}"。该文件主要涉及数据安全管理规范，其中需要注意的合规要点包括：1. 数据分类分级标准；2. 访问控制机制；3. 数据加密要求；4. 安全审计流程；5. 数据备份策略。您是否需要针对其中某一点进行详细咨询？`); 
        }, 1000); 
      }, 500);
    }, 2000);
  });
  
  fileInput.click();
});

// 历史对话加载
document.querySelectorAll('.history-item').forEach(item => { 
  item.addEventListener('click', () => {
    const title = item.querySelector('h4').textContent;
    const preview = item.querySelector('p').textContent;
    
    if (!confirm(`确定要加载对话"${title}"吗？这将清除当前聊天记录。`)) return;
    
    chatMessages.innerHTML = ''; 
    currentConversation = [];
    addMessage('user', preview, false);
    
    setTimeout(() => { 
      addMessage('assistant', '这是历史对话的回复内容。您可以继续这个话题，或者提出新的问题。', false); 
    }, 500);
    
    historyModal.classList.add('hidden');
  }); 
});

// 发送消息事件绑定
sendMessageButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => { 
  if (e.key === 'Enter') sendMessage(); 
});

// 初始化连接状态
function initSSE() {
  statusIndicator.textContent = '正在连接到AI助手...';
  
  setTimeout(() => { 
    statusIndicator.textContent = '已连接到AI助手'; 
    
    setTimeout(() => { 
      const systemMessage = document.createElement('div'); 
      systemMessage.className = 'text-center text-xs text-light text-opacity-50 my-2'; 
      systemMessage.textContent = '欢迎使用智能合规问答机器人，我们已更新了最新的法规数据库'; 
      chatMessages.appendChild(systemMessage); 
    }, 3000); 
  }, 1000);
}

// 视差交互效果
document.addEventListener('mousemove', (e)=>{
  const cx = window.innerWidth/2; 
  const cy = window.innerHeight/2;
  const dx = (e.clientX - cx)/cx; 
  const dy = (e.clientY - cy)/cy;
  
  const shell = document.querySelector('.agent-chat-shell');
  if(shell){ 
    shell.style.transform = `translate3d(${dx*8}px,${dy*6}px,0)`; 
  }
  
  if(canvas){ 
    canvas.style.transform = `translate3d(${dx*12}px,${dy*10}px,0)`; 
  }
});

// 样例问题点击快速填充
document.addEventListener('click', (e)=>{
  const sq = e.target.closest('.sample-q');
  if(sq){
    const q = sq.getAttribute('data-q');
    const input = document.getElementById('chat-input');
    if(input){ 
      input.value = q; 
      sendMessage(); 
    }
  }
});

// 功能卡片prompt模板点击填充
promptTemplates.forEach(template => {
  template.addEventListener('click', () => {
    const prompt = template.getAttribute('data-prompt');
    chatInput.value = prompt;
    chatInput.focus();
    
    // 卡片点击时的粒子效果
    const rect = template.getBoundingClientRect();
    triggerParticleBurst(rect.left + rect.width/2, rect.top + rect.height/2);
  });
});

// 可复制推荐 Prompt 逻辑
document.querySelectorAll('.function-card-copy').forEach(copyEl => {
  copyEl.addEventListener('click', () => {
    const text = copyEl.getAttribute('data-copy') || '';
    const full = text.trim();
    if(!full) return;
    try {
      navigator.clipboard.writeText(full).then(()=>{
        copyEl.classList.add('copied');
        copyEl.textContent = '已复制，可粘贴完善内容';
        setTimeout(()=>{
          copyEl.classList.remove('copied');
          copyEl.textContent = '复制推荐 Prompt';
        },1800);
      });
    } catch(e){
      // 回退方案
      const ta = document.createElement('textarea');
      ta.value = full; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      copyEl.classList.add('copied');
      copyEl.textContent = '已复制（兼容模式）';
      setTimeout(()=>{
        copyEl.classList.remove('copied');
        copyEl.textContent = '复制推荐 Prompt';
      },1800);
    }
  });
});

// 初始化背景粒子
function initParticles() {
  const bgCanvas = document.getElementById('bgParticles');
  if (!bgCanvas) return;

  canvas = bgCanvas;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // 创建圆点粒子（带透明度渐变与呼吸效果）
  const palette = ['#3b82f6', '#6366f1', '#38bdf8', '#7c3aed'];
  particles = Array.from({ length: 120 }).map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    rBase: Math.random() * 2.2 + 0.8,
    r: 0,
    pulse: Math.random() * Math.PI * 2,
    speedX: (Math.random() - 0.5) * 0.3,
    speedY: (Math.random() - 0.5) * 0.3,
    color: palette[Math.floor(Math.random() * palette.length)],
    alpha: Math.random() * 0.4 + 0.25,
    alphaDir: Math.random() > 0.5 ? 1 : -1
  }));

  function drawParticle(p) {
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    gradient.addColorStop(0, `${p.color}AA`); // 中心高亮
    gradient.addColorStop(0.6, `${p.color}55`);
    gradient.addColorStop(1, `${p.color}00`); // 外部透明
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      // 位置更新
      p.x += p.speedX;
      p.y += p.speedY;

      // 边界回弹
      if (p.x < -20) p.x = canvas.width + 20;
      if (p.x > canvas.width + 20) p.x = -20;
      if (p.y < -20) p.y = canvas.height + 20;
      if (p.y > canvas.height + 20) p.y = -20;

      // 呼吸半径
      p.r = p.rBase + Math.sin(p.pulse) * 0.6;
      p.pulse += 0.01 + (p.rBase * 0.002);

      // 透明度渐变（往复）
      p.alpha += p.alphaDir * 0.005;
      if (p.alpha > 0.65) p.alphaDir = -1;
      if (p.alpha < 0.25) p.alphaDir = 1;

      drawParticle(p);
    });

    requestAnimationFrame(animate);
  }

  animate();
}

// 触发粒子涟漪效果
function triggerParticleRipple() {
  const chatBox = document.querySelector('#chat-messages');
  if (!chatBox || !particles.length) return;
  
  const rect = chatBox.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const canvasRect = canvas.getBoundingClientRect();
  
  // 转换为canvas坐标
  const targetX = centerX - canvasRect.left;
  const targetY = centerY - canvasRect.top;
  
  // 粒子向目标点移动
  particles.forEach(particle => {
    const dx = targetX - particle.x;
    const dy = targetY - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 300) {
      const force = (1 - distance / 300) * 0.8;
      particle.speedX += (dx / distance) * force;
      particle.speedY += (dy / distance) * force;
    }
  });
}

// 触发粒子爆发效果
function triggerParticleBurst(x, y) {
  if (!canvas) return;
  
  const canvasRect = canvas.getBoundingClientRect();
  const burstX = x - canvasRect.left;
  const burstY = y - canvasRect.top;
  
  // 创建临时粒子
  for (let i = 0; i < 20; i++) {
    particles.push({
      x: burstX,
      y: burstY,
      radius: Math.random() * 2 + 1,
      color: ['#4285f4', '#7c3aed', '#38bdf8'][Math.floor(Math.random() * 3)],
      speedX: (Math.random() - 0.5) * 4,
      speedY: (Math.random() - 0.5) * 4,
      alpha: 0.8,
      temporary: true,
      life: 60
    });
  }
}

// Three.js 粒子球（低多边形律动）
(function initThreeSphere(){
  const canvasEl = document.getElementById('agentThreeCanvas');
  if(!canvasEl || !window.THREE) return;
  
  const renderer = new THREE.WebGLRenderer({ 
    canvas: canvasEl, 
    alpha: true, 
    antialias: true 
  });
  
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
  camera.position.z = 230;
  
  // 响应式调整
  function resize(){ 
    const w = canvasEl.clientWidth;
    const h = canvasEl.clientHeight; 
    renderer.setSize(w, h, false); 
    camera.aspect = w/h; 
    camera.updateProjectionMatrix(); 
    if(composer) composer.setSize(w, h); 
  }
  
  window.addEventListener('resize', resize);

  // 创建流动线条和发光圆点组合粒子系统
  const particleCount = 500;
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  
  // 初始化粒子位置和速度
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    // 在球体范围内分布
    const radius = 100 + Math.random() * 50;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);
    
    // 随机速度
    velocities[i3] = (Math.random() - 0.5) * 0.3;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.3;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.3;
  }
  
  // 创建粒子几何体
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  // 创建粒子材质
  const material = new THREE.PointsMaterial({
    size: 2.5,
    transparent: true,
    opacity: 0.8,
    color: 0x818cf8,
    sizeAttenuation: true
  });
  
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
  
  // 创建连接线
  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = new Float32Array(particleCount * 2 * 3); // 每个粒子最多连接2个其他粒子
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x60a5fa,
    transparent: true,
    opacity: 0.2,
    linewidth: 1
  });
  
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  // 后处理
  let composer = null, bloomPass = null;
  
  async function setupPost(){
    try {
      const [{EffectComposer}, {RenderPass}, {UnrealBloomPass}, {FXAAShader}] = await Promise.all([
        import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js'),
        import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/RenderPass.js'),
        import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js'),
        import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/shaders/FXAAShader.js')
      ]);
      
      composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(canvasEl.clientWidth, canvasEl.clientHeight), 
        0.75, 0.55, 0.015
      );
      
      const fxaaPass = new THREE.ShaderPass(FXAAShader);
      fxaaPass.material.uniforms['resolution'].value.set(
        1/canvasEl.clientWidth, 
        1/canvasEl.clientHeight
      );
      
      composer.addPass(renderPass); 
      composer.addPass(bloomPass); 
      composer.addPass(fxaaPass);
    } catch(e) {
      console.warn('后处理模块加载失败，使用基本渲染', e);
    }
  }
  
  setupPost();

  // 物理碰撞检测
  function checkCollisions() {
    const positions = particles.geometry.attributes.position.array;
    const particleSize = 5;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const x1 = positions[i3];
      const y1 = positions[i3 + 1];
      const z1 = positions[i3 + 2];
      
      for (let j = i + 1; j < particleCount; j++) {
        const j3 = j * 3;
        const x2 = positions[j3];
        const y2 = positions[j3 + 1];
        const z2 = positions[j3 + 2];
        
        // 计算距离
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dz = z2 - z1;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        // 碰撞检测
        if (distance < particleSize * 2) {
          // 简单的弹性碰撞
          const nx = dx / distance;
          const ny = dy / distance;
          const nz = dz / distance;
          
          const v1x = velocities[i3];
          const v1y = velocities[i3 + 1];
          const v1z = velocities[i3 + 2];
          
          const v2x = velocities[j3];
          const v2y = velocities[j3 + 1];
          const v2z = velocities[j3 + 2];
          
          // 计算相对速度
          const dvx = v2x - v1x;
          const dvy = v2y - v1y;
          const dvz = v2z - v1z;
          
          // 计算速度在法线方向的投影
          const vn = dvx * nx + dvy * ny + dvz * nz;
          
          // 如果粒子正在远离，不处理碰撞
          if (vn > 0) continue;
          
          // 应用碰撞响应（假设质量相同）
          const impulse = 2 * vn / 2; // 除以总质量（假设质量均为1）
          
          velocities[i3] += impulse * nx;
          velocities[i3 + 1] += impulse * ny;
          velocities[i3 + 2] += impulse * nz;
          
          velocities[j3] -= impulse * nx;
          velocities[j3 + 1] -= impulse * ny;
          velocities[j3 + 2] -= impulse * nz;
        }
      }
    }
  }

  // 更新连接线
  function updateLines() {
    const positions = particles.geometry.attributes.position.array;
    const linePositions = lines.geometry.attributes.position.array;
    let lineIndex = 0;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const x1 = positions[i3];
      const y1 = positions[i3 + 1];
      const z1 = positions[i3 + 2];
      
      let connections = 0;
      
      // 寻找附近的粒子建立连接
      for (let j = 0; j < particleCount; j++) {
        if (i === j) continue;
        
        const j3 = j * 3;
        const x2 = positions[j3];
        const y2 = positions[j3 + 1];
        const z2 = positions[j3 + 2];
        
        const distance = Math.sqrt(
          (x2 - x1) **2 + 
          (y2 - y1)** 2 + 
          (z2 - z1) ** 2
        );
        
        if (distance < 40 && connections < 2) {
          linePositions[lineIndex * 6] = x1;
          linePositions[lineIndex * 6 + 1] = y1;
          linePositions[lineIndex * 6 + 2] = z1;
          linePositions[lineIndex * 6 + 3] = x2;
          linePositions[lineIndex * 6 + 4] = y2;
          linePositions[lineIndex * 6 + 5] = z2;
          
          lineIndex++;
          connections++;
        }
      }
    }
    
    lines.geometry.attributes.position.needsUpdate = true;
  }

  // 鼠标引力效果
  let mouseX = 0, mouseY = 0;
  
  document.addEventListener('mousemove', (e) => {
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    
    mouseX = (e.clientX - windowHalfX) * 0.1;
    mouseY = (e.clientY - windowHalfY) * 0.1;
  });

  // 动画循环
  let t = 0;
  resize();
  
  function animate(){
    requestAnimationFrame(animate);
    t += 0.016;
    
    // 更新粒子位置
    const positions = particles.geometry.attributes.position.array;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // 应用速度
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];
      
      // 边界约束（保持在球体范围内）
      const radius = Math.sqrt(
        positions[i3] **2 + 
        positions[i3 + 1]** 2 + 
        positions[i3 + 2] ** 2
      );
      
      if (radius > 150) {
        // 反弹效果
        const scale = 150 / radius;
        positions[i3] *= scale;
        positions[i3 + 1] *= scale;
        positions[i3 + 2] *= scale;
        
        velocities[i3] *= -0.5;
        velocities[i3 + 1] *= -0.5;
        velocities[i3 + 2] *= -0.5;
      }
      
      // 应用鼠标引力
      const dx = mouseX - positions[i3];
      const dy = -mouseY - positions[i3 + 1]; // Y轴反向
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 200) {
        const force = (1 - distance / 200) * 0.02;
        velocities[i3] += (dx / distance) * force;
        velocities[i3 + 1] += (dy / distance) * force;
      }
      
      // 阻尼效果（减速）
      velocities[i3] *= 0.98;
      velocities[i3 + 1] *= 0.98;
      velocities[i3 + 2] *= 0.98;
    }
    
    // 检查碰撞
    checkCollisions();
    
    // 更新连接线
    updateLines();
    
    // 更新几何体
    particles.geometry.attributes.position.needsUpdate = true;
    
    // 渲染
    if(composer){ 
      composer.render(); 
    } else { 
      renderer.render(scene, camera); 
    }
  }
  
  animate();
})();

// 产品信息与审查占位逻辑
function showToast(msg){ 
  console.log('[toast]', msg); 
  // 可以实现一个浮动提示框
}

async function fetchProductInfo(){
  if(!productUrlInput || !productUrlInput.value.trim()) { 
    showToast('请输入链接'); 
    return; 
  }
  
  const sessionId = localStorage.getItem('lf_session_id');
  if(!sessionId){ 
    addMessage('assistant','请先在首页登录以启用产品信息抓取。', false); 
    return; 
  }
  
  addMessage('assistant','正在抓取产品信息...', false);
  
  try{
    // 模拟API请求
    setTimeout(() => {
      // 模拟返回数据
      const mockProduct = {
        title: "智能手环健康监测设备",
        image: "https://picsum.photos/600/400",
        description: "这款智能手环支持心率监测、睡眠分析、运动追踪等功能，续航可达7天，防水等级IP68，兼容iOS和Android系统。",
        meta: "价格: $59.99 | 品牌: HealthFit | 产地: 中国"
      };
      
      // 更新UI
      productImage.src = mockProduct.image;
      productTitleEl.textContent = mockProduct.title;
      productDescEl.textContent = mockProduct.description;
      productMetaEl.textContent = mockProduct.meta;
      
      productInfoPanel.classList.remove('hidden');
      auditResultWrap.classList.add('hidden');
      
      // 更新消息
      removeTypingIndicator();
      streamResponse(`已成功抓取产品信息：${mockProduct.title}。请点击"生成报告"进行合规审查。`);
    }, 1500);
  } catch(err) {
    removeTypingIndicator();
    streamResponse(`抓取产品信息失败：${err.message}`);
  }
}

async function auditProduct(){
  if(!productInfoPanel.classList.contains('hidden') && productTitleEl.textContent) {
    addMessage('assistant',`正在对「${productTitleEl.textContent}」进行合规审查...`, false);
    
    // 模拟API请求
    setTimeout(() => {
      const auditResult = `
        <p><strong>1. 政策合规评估</strong></p>
        <p>• 欧盟：需要符合CE认证和RoHS环保标准</p>
        <p>• 美国：需要FCC认证，儿童使用需符合CPSC标准</p>
        <p>• 中国：需通过CCC认证，医疗功能需额外备案</p>
        
        <p><strong>2. 知识产权审查</strong></p>
        <p>• 商标"HealthFit"已在欧盟和美国注册，存在侵权风险</p>
        <p>• 产品外观设计与现有专利ZL2022XXXXXXXXX相似度78%，需进一步评估</p>
        
        <p><strong>3. 综合判断</strong></p>
        <p>• 不建议直接进入欧盟市场（商标风险）</p>
        <p>• 美国市场需先完成FCC认证</p>
        <p>• 亚洲市场（如日本、韩国）合规风险较低</p>
      `;
      
      const markdownReport = `# 产品合规审查报告
## 基本信息
- 产品名称：${productTitleEl.textContent}
- 审查日期：${new Date().toLocaleDateString()}

## 1. 政策合规评估
- 欧盟：需要符合CE认证和RoHS环保标准
- 美国：需要FCC认证，儿童使用需符合CPSC标准
- 中国：需通过CCC认证，医疗功能需额外备案

## 2. 知识产权审查
- 商标"HealthFit"已在欧盟和美国注册，存在侵权风险
- 产品外观设计与现有专利ZL2022XXXXXXXXX相似度78%，需进一步评估

## 3. 综合判断
- 不建议直接进入欧盟市场（商标风险）
- 美国市场需先完成FCC认证
- 亚洲市场（如日本、韩国）合规风险较低

## 4. 改进建议
1. 更改产品商标名称，避免侵权
2. 调整外观设计，降低专利侵权风险
3. 优先申请目标市场的必要认证
`;

      const recommendedMarkets = "推荐销售地区：日本、韩国、澳大利亚、加拿大（需完成当地认证）";
      
      auditRawText.innerHTML = auditResult;
      auditMd.textContent = markdownReport;
      auditMarkets.textContent = recommendedMarkets;
      
      auditResultWrap.classList.remove('hidden');
      
      // 更新消息
      removeTypingIndicator();
      streamResponse("产品合规审查已完成，结果已显示。包含政策合规评估、知识产权审查和市场建议，您可以查看详细报告。");
    }, 2000);
  } else {
    showToast('请先抓取产品信息');
  }
}

// 绑定产品审查按钮事件
fetchProductBtn.addEventListener('click', fetchProductInfo);
auditProductBtn.addEventListener('click', auditProduct);

// 页面加载完成初始化
window.addEventListener('DOMContentLoaded', () => { 
  initSSE(); 
  initParticles();
  // 平滑滚动导航
  document.querySelectorAll('[data-scroll]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const top = target.getBoundingClientRect().top + window.scrollY - 80; // 预留导航高度
          window.scrollTo({ top, behavior: 'smooth' });
        }
        // 关闭移动菜单
        if (!mobileMenu.classList.contains('hidden')) mobileMenu.classList.add('hidden');
      }
    });
  });
  // 首页交互按钮渐变跳转
  const goHomeBtn = document.getElementById('go-home-btn');
  if(goHomeBtn){
    goHomeBtn.addEventListener('click', ()=>{
      goHomeBtn.disabled = true;
      goHomeBtn.classList.add('animate-pulse');
      setTimeout(()=>{ window.location.href = '../index.html'; }, 280);
    });
  }
  // Hero 轮换文案
  const rotatingEl = document.getElementById('hero-rotating-text');
  if(rotatingEl){
    const texts = JSON.parse(rotatingEl.getAttribute('data-texts')||'[]');
    let idx = 0; let ticking = false;
    function nextText(){
      if(ticking) return; ticking = true;
      rotatingEl.style.opacity = '0';
      setTimeout(()=>{
        idx = (idx+1)%texts.length;
        rotatingEl.textContent = texts[idx];
        rotatingEl.style.opacity = '1';
        ticking = false;
      },350);
    }
    setInterval(nextText, 4200);
  }
  // Orbit 动态轻微偏移随滚动
  const heroWrapper = document.querySelector('.hero-wrapper');
  const orbitDots = document.querySelectorAll('.orbit-dot');
  window.addEventListener('scroll',()=>{
    if(!heroWrapper) return;
    const ratio = Math.min(1, window.scrollY / 300);
    orbitDots.forEach((d,i)=>{
      d.style.transform = `translateY(${ratio * (i+1) * 8}px)`;
      d.style.opacity = String(0.75 - ratio*0.35);
    });
  });
});