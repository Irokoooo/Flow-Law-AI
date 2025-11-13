// Tailwind 配置（来源于原HTML内联脚本）
// 注意：此配置在CDN模式下运行，需在tailwind脚本加载后执行，可保持原执行顺序
try {
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          primary: '#2C5AA0',
          secondary: '#1D3B67',
          accent: '#FFC107',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444'
        },
        boxShadow: {
          card: '0 4px 12px rgba(0,0,0,0.04)',
          hover: '0 8px 24px rgba(0,0,0,0.08)'
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'PingFang SC', 'Microsoft YaHei', 'Arial', 'sans-serif']
        }
      }
    }
  };
} catch (e) {
  console.warn('Tailwind config 设置失败 (加载顺序可能导致)，不影响页面基础功能。');
}

// 页面交互逻辑
window.addEventListener('DOMContentLoaded', () => {
  // 移动端菜单展开/收起
  const mobileMenuBtn = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileMenu.classList.add('hidden');
      }
    });
  }

  // 热点弹窗数据与事件
  const compliancePanel = document.getElementById('compliance-panel');
  const panelCountry = document.getElementById('panel-country');
  const panelRisk = document.getElementById('panel-risk');
  const panelUpdates = document.getElementById('panel-updates');
  const panelIndustries = document.getElementById('panel-industries');
  const panelNews = document.getElementById('panel-news');
  const panelOverview = document.getElementById('panel-overview');
  const panelActions = document.getElementById('panel-actions');
  const closePanelBtn = document.getElementById('close-panel');

  // 新的热点数据结构：增加 overview 与 actions 建议
  const hotspotData = {
    '英国': {
      risk:'高风险', riskClass:'text-danger', updates:14, industries:'金融、数据安全',
      overview:'英国近期针对金融科技数据处理与加密资产开展更严格的报告与透明度要求，FCA 加强对第三方云服务使用的审查。',
      news:'《金融服务与市场法案》部分条款过渡期即将结束，强制报告节点临近。',
      actions:[
        '梳理加密资产分类与适用牌照边界',
        '补充云服务风险评估文档与供应商审查清单',
        '准备即将到期的临时许可续期材料'
      ]
    },
    '德国': {
      risk:'中风险', riskClass:'text-warning', updates:7, industries:'制造、能源、数据安全',
      overview:'德国围绕工业数据共享与新能源补贴展开修订，强调工业平台数据互操作与安全日志可靠性。',
      news:'新能源补贴在线申报流程增加额外审计字段。',
      actions:[
        '核对新能源业务合规指标填写完整度',
        '评估工业数据网关日志保留策略 (≥12个月)',
        '对合作制造伙伴新增数据共享条款'
      ]
    },
    '欧盟': {
      risk:'高风险', riskClass:'text-danger', updates:21, industries:'科技、平台、数据安全',
      overview:'《数字服务法案》(DSA) 与 《数字市场法案》(DMA) 在平台责任、广告透明度和数据接口开放方面进入执行强化期。',
      news:'多家大型平台被要求补充未成年人保护与违规内容处置流程。',
      actions:[
        '盘点广告投放透明度信息披露字段',
        '补充非法内容快速下架响应 SLA',
        '审查算法推荐的风险评估报告更新频率'
      ]
    },
    '美国': {
      risk:'低风险', riskClass:'text-success', updates:9, industries:'金融、科技、合规服务',
      overview:'联邦层面暂无大范围突发性强制新规，SEC 针对数字资产分类细化，数据隐私州法差异仍需跟踪。',
      news:'SEC 发布补充问答澄清代币分类适用测试。',
      actions:[
        '梳理产品是否涉及证券属性特征 (Howey Test)',
        '评估州级隐私法合规差异 (CPRA/VDPA)',
        '准备统一的数字资产风险披露模板'
      ]
    },
    '中国': {
      risk:'中风险', riskClass:'text-warning', updates:12, industries:'数据安全、跨境传输',
      overview:'数据分级分类与出境评估持续落实，重点关注个人敏感数据与重要数据界定。',
      news:'《网络数据安全管理条例》发布征求稿后企业反馈期结束，正式版筹备中。',
      actions:[
        '完成数据清单与分级标注 (结构化/非结构化)',
        '评估是否触发个人信息出境安全评估',
        '建立数据最小化与定期脱敏流程'
      ]
    },
    '新加坡': {
      risk:'高风险', riskClass:'text-danger', updates:10, industries:'数据安全、金融',
      overview:'PDPA 修订强化数据泄露通报与自动化决策透明度，金融领域对外包和云合规继续加码。',
      news:'个人数据保护委员会公布多起泄露处罚判例，强调响应时间。',
      actions:[
        '校准数据泄露内部通报 ≤72h 流程',
        '补全自动化决策解释权文档段落',
        '外包合同中加入退出与可移植性条款'
      ]
    },
    '中国香港': {
      risk:'低风险', riskClass:'text-success', updates:4, industries:'金融、数据处理',
      overview:'整体监管平稳，重点仍在反洗钱与客户尽调 (CDD) 的执行一致性与实时监控。',
      news:'金管局发布关于虚拟资产交易平台 AML 指引补充说明。',
      actions:[
        '检查 KYC / CDD 周期化复审记录',
        '更新虚拟资产涉险监控规则参数',
        '确认第三方身份验证供应商 SLA'
      ]
    },
    '澳大利亚': {
      risk:'中风险', riskClass:'text-warning', updates:6, industries:'能源、数据合规',
      overview:'隐私法改革讨论持续，能源与关键基础设施网络安全要求递进式加强。',
      news:'隐私法现代化建议报告进入下一阶段咨询。',
      actions:[
        '评估关键基础设施资产分类与事件响应预案',
        '梳理隐私声明是否满足重新同意与访问权',
        '补充第三方安全测试频率 (渗透/扫描)'
      ]
    }
  };

  // ===== 弹窗贴靠热点定位逻辑 =====
  function positionPanel(pin){
    if(!compliancePanel || !pin) return;
    const map = document.getElementById('hotspot-map');
    if(!map) return;
    if(getComputedStyle(map).position === 'static'){ map.style.position = 'relative'; }

    compliancePanel.classList.remove('hidden');
    compliancePanel.classList.remove('appear');
    compliancePanel.style.visibility = 'hidden';
    compliancePanel.style.left = '0px';
    compliancePanel.style.top = '0px';

    const mapRect = map.getBoundingClientRect();
    const pinRect = pin.getBoundingClientRect();
    const panelRect = compliancePanel.getBoundingClientRect();
    const centerX = pinRect.left - mapRect.left + pinRect.width / 2;
    const centerY = pinRect.top - mapRect.top + pinRect.height / 2;
    const margin = 16;
    const offset = 20;

    const placements = [
      { arrow: 'left', x: centerX + offset, y: centerY - panelRect.height / 2 },   // 面板显示在热点右侧
      { arrow: 'right', x: centerX - panelRect.width - offset, y: centerY - panelRect.height / 2 }, // 面板在热点左侧
      { arrow: 'top', x: centerX - panelRect.width / 2, y: centerY + offset },     // 面板在热点下方
      { arrow: 'bottom', x: centerX - panelRect.width / 2, y: centerY - panelRect.height - offset } // 面板在热点上方
    ];

    const fits = placements.find(pos =>
      pos.x >= margin &&
      pos.y >= margin &&
      pos.x + panelRect.width <= mapRect.width - margin &&
      pos.y + panelRect.height <= mapRect.height - margin
    );

    let chosen = fits || placements[0];
    // 若默认方案超出边界则进行裁剪
    chosen = {
      arrow: chosen.arrow,
      x: Math.min(Math.max(chosen.x, margin), Math.max(margin, mapRect.width - panelRect.width - margin)),
      y: Math.min(Math.max(chosen.y, margin), Math.max(margin, mapRect.height - panelRect.height - margin))
    };

    compliancePanel.style.left = chosen.x + 'px';
    compliancePanel.style.top = chosen.y + 'px';
    compliancePanel.setAttribute('data-arrow', chosen.arrow);

    const arrowEl = compliancePanel.querySelector('.panel-arrow');
    if(arrowEl){
      const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
      const relativeX = centerX - chosen.x;
      const relativeY = centerY - chosen.y;
      const arrowMargin = margin + 4; // 避免箭头贴到圆角
      if(chosen.arrow === 'left' || chosen.arrow === 'right'){
        const yPos = clamp(relativeY, arrowMargin, panelRect.height - arrowMargin) - 8;
        arrowEl.style.setProperty('--arrow-y', yPos + 'px');
        arrowEl.style.setProperty('--arrow-x', 'calc(50% - 8px)');
      } else {
        const xPos = clamp(relativeX, arrowMargin, panelRect.width - arrowMargin) - 8;
        arrowEl.style.setProperty('--arrow-x', xPos + 'px');
        arrowEl.style.setProperty('--arrow-y', 'calc(50% - 8px)');
      }
    }

    compliancePanel.style.visibility = 'visible';
    void compliancePanel.offsetWidth; // 触发重绘以重新播放动画
    compliancePanel.classList.add('appear');
  }
  function showPanel(country, pinEl) {
    if (!compliancePanel) return;
    const data = hotspotData[country];
    if (!data) return;
    panelCountry.textContent = country;
    panelRisk.textContent = data.risk;
    panelRisk.className = 'font-medium text-lg mt-1 ' + data.riskClass;
    panelUpdates.textContent = data.updates + ' 条';
    panelIndustries.textContent = data.industries;
    panelNews.textContent = data.news;
    if(panelOverview) panelOverview.textContent = data.overview || '';
    if(panelActions){
      panelActions.innerHTML='';
      (data.actions || []).forEach(a=>{ const li=document.createElement('li'); li.textContent=a; panelActions.appendChild(li); });
    }
  positionPanel(pinEl);
  }

  // 添加点击与键盘交互
  const hotspotElements = Array.from(document.querySelectorAll('#hotspot-map [data-country]'));
  hotspotElements.forEach(el => {
    el.addEventListener('click', () => { showPanel(el.getAttribute('data-country'), el); });
    el.addEventListener('keydown', (e)=>{
      if(e.key==='Enter' || e.key===' ') { e.preventDefault(); showPanel(el.getAttribute('data-country'), el); }
    });
  });
  // 方向键循环聚焦
  document.addEventListener('keydown', (e)=>{
    if(!hotspotElements.length) return;
    const active = document.activeElement;
    const idx = hotspotElements.indexOf(active);
    if(e.key==='ArrowRight' || e.key==='ArrowDown'){
      const n = hotspotElements[(idx+1) % hotspotElements.length]; n.focus(); e.preventDefault();
    } else if(e.key==='ArrowLeft' || e.key==='ArrowUp'){
      const p = hotspotElements[(idx-1+hotspotElements.length) % hotspotElements.length]; p.focus(); e.preventDefault();
    }
  });

  // 点击其它区域隐藏弹窗
  document.addEventListener('click', (e)=>{
    if(!compliancePanel) return;
    if(compliancePanel.classList.contains('hidden')) return;
    const isHotspot = e.target.closest('[data-country]');
    const insidePanel = e.target.closest('#compliance-panel');
    if(!isHotspot && !insidePanel){
      compliancePanel.classList.add('hidden');
      compliancePanel.classList.remove('appear');
    }
  });

  if (closePanelBtn) {
    closePanelBtn.addEventListener('click', () => {
      compliancePanel.classList.add('hidden');
      compliancePanel.classList.remove('appear');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      compliancePanel.classList.add('hidden');
      compliancePanel.classList.remove('appear');
    }
  });

  // ======= 动态拉取合规新闻与趋势（占位真实接口） =======
  fetch('/api/compliance_news').then(r=>r.json()).then(data=>{
    if(!data.success) return;
    // 在“最新合规动态”块若存在静态列表则不覆盖，仅在后面追加动态内容
    const containerInsertPoint = document.querySelector('.space-y-4');
    if(containerInsertPoint){
      const header = document.createElement('div');
      header.className='text-sm text-gray-500';
      header.textContent='[实时抓取] 最新合规动态';
      containerInsertPoint.prepend(header);
      data.items.slice(0,5).forEach(item=>{
        const block = document.createElement('div');
        block.className='border-b border-gray-100 pb-4';
        block.innerHTML=`<div class='flex justify-between items-start'>
          <div>
            <span class='badge badge-info mb-1'>实时</span>
            <h3 class='text-lg font-medium text-gray-800'>${item.title}</h3>
            <p class='text-gray-600 text-sm mt-1'>${item.source || ''}</p>
          </div>
          <span class='text-gray-400 text-sm'>${item.published_at || ''}</span>
        </div>
        <p class='text-gray-600 mt-2'>${item.summary || ''}</p>
        <div class='mt-2'><a href='${item.url}' target='_blank' class='text-primary text-sm hover:underline'>阅读全文</a></div>`;
        containerInsertPoint.appendChild(block);
      });
    }
  }).catch(err=>console.warn('新闻抓取失败',err));

  // 拉取政策趋势（基础结构化数据）
  function loadTrends(params={}){
    const qs = new URLSearchParams(params).toString();
    fetch('/api/policy_trends' + (qs?('?' + qs):''))
      .then(r=>r.json())
      .then(data=>{
        if(!data.success) return;
        const trendBox = document.querySelector('.h-[300px]');
        if(trendBox){
          trendBox.innerHTML = '';
          const meta = document.createElement('div');
          meta.className='text-xs text-gray-500 mb-2';
          meta.textContent='筛选结果：' + data.total + ' 项';
          trendBox.appendChild(meta);
          if(data.total===0){ trendBox.innerHTML += '<div class="text-sm text-gray-400">没有匹配的数据</div>'; return; }
          const list = document.createElement('ul'); list.className='mt-1 text-sm text-gray-700 space-y-1';
          data.items.slice(0,12).forEach(it=>{ const li=document.createElement('li'); li.innerHTML=`<span class='font-medium'>${it.region}</span> · ${it.category} · ${it.title}`; list.appendChild(li); });
          trendBox.appendChild(list);
        }
      }).catch(err=>console.warn('趋势抓取失败',err));
  }

  // 初始加载
  loadTrends();

  // ===== 随机趋势 & 行业分布图（占位演示） =====
  function randomTrendData(){
    const months=['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
    return months.map(()=>Math.round(30+Math.random()*70));
  }
  function randomIndustryData(){
    const inds=['金融','电商','医疗','制造','能源','数据安全'];
    return inds.map(name=>({name,value:Math.round(10+Math.random()*40)}));
  }
  function renderCharts(){
    const trendDom=document.getElementById('trendChart');
    const industryDom=document.getElementById('industryChart');
    if(trendDom){
      const ecTrend=echarts.init(trendDom); 
      ecTrend.setOption({
        title:{text:'政策更新强度 (月度)', left:'center', textStyle:{fontSize:14}},
        tooltip:{trigger:'axis'},
        xAxis:{type:'category', data:['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']},
        yAxis:{type:'value'},
        grid:{left:40,right:20,top:50,bottom:30},
        series:[{name:'更新条数', type:'line', smooth:true, areaStyle:{opacity:0.25}, data:randomTrendData(), color:'#2C5AA0'}]
      });
    }
    if(industryDom){
      const ecInd=echarts.init(industryDom);
      ecInd.setOption({
        title:{text:'行业政策占比', left:'center', textStyle:{fontSize:14}},
        tooltip:{trigger:'item'},
        legend:{bottom:0},
        series:[{type:'pie', radius:['30%','65%'], data:randomIndustryData(),
          label:{formatter:'{b}: {d}%'},
          itemStyle:{shadowBlur:12, shadowColor:'rgba(0,0,0,0.15)'}
        }]
      });
    }
  }
  renderCharts();

  // 筛选交互：地区 select + 行业复选框 + 关键词 + 重置按钮
  const regionSelect = document.querySelector('select');
  const industryCheckboxes = Array.from(document.querySelectorAll('[id^="industry-"]'));
  const searchInput = document.querySelector('input[placeholder="输入关键词搜索..."]');
  const filterBtn = document.querySelector('.btn-primary.flex-1');
  const resetBtn = document.querySelector('.btn-outline.flex-1');

  function collectFilters(){
    const region = regionSelect ? regionSelect.value : 'all';
    const categories = industryCheckboxes.filter(c=>c.checked).map(c=>c.nextElementSibling.textContent.trim());
    const search = (searchInput && searchInput.value.trim()) || '';
    const params = {};
    if(region && region !== 'all') params.region = region;
    if(categories.length) params.category = categories.join(',');
    if(search) params.search = search;
    return params;
  }

  if(filterBtn){
    filterBtn.addEventListener('click', ()=>{ loadTrends(collectFilters()); });
  }
  if(resetBtn){
    resetBtn.addEventListener('click', ()=>{
      if(regionSelect) regionSelect.value='all';
      industryCheckboxes.forEach(c=>c.checked=false);
      if(searchInput) searchInput.value='';
      loadTrends();
    });
  }

  // ====== 世界地图 (ECharts) 热点渲染 ======
  // 已回退为静态地图展示，保留面板功能（可由热点按钮触发）
  // ====== 粒子与扫描特效 ======
  // 粒子背景函数提前定义，避免调用顺序导致未定义错误
  function initRadarParticles(){
    const canvas = document.getElementById('radarParticles'); if(!canvas) return;
    const ctx = canvas.getContext('2d');
    function resize(){ canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; }
    window.addEventListener('resize', resize); resize();
    const COUNT = 110; const particles = Array.from({length:COUNT}).map(()=>({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      r: Math.random()*2 + 0.6,
      vx: (Math.random()-0.5)*0.25,
      vy: (Math.random()-0.5)*0.25,
      a: Math.random()*0.6 + 0.25,
      hue: 200 + Math.random()*60
    }));
    function draw(){
      ctx.clearRect(0,0,canvas.width, canvas.height);
      particles.forEach(p=>{
        p.x += p.vx; p.y += p.vy;
        if(p.x < -10) p.x = canvas.width+10; if(p.x>canvas.width+10) p.x=-10;
        if(p.y < -10) p.y = canvas.height+10; if(p.y>canvas.height+10) p.y=-10;
        ctx.beginPath();
        const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3);
        g.addColorStop(0, `hsla(${p.hue},70%,70%,${p.a})`);
        g.addColorStop(1, `hsla(${p.hue},70%,40%,0)`);
        ctx.fillStyle = g; ctx.arc(p.x,p.y,p.r*3,0,Math.PI*2); ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }
  initRadarParticles();
  // 动态调节扫描速度（可扩展性能开关）
  function adjustScan(){
    const scan = document.getElementById('radar-scan');
    if(!scan) return; const hour = new Date().getHours();
    const dur = (hour % 2 === 0) ? 9 : 12; scan.style.animationDuration = dur + 's';
  }
  adjustScan();
  setInterval(adjustScan, 60000);

  // ====== 快速统计与迷你风险环图 ======
  const statMonthly = document.getElementById('statMonthly');
  const statHigh = document.getElementById('statHigh');
  const statCountries = document.getElementById('statCountries');
  if(statMonthly){
    // 简单随机占位，后续可由后端真实数据返回
    const monthly = 180 + Math.floor(Math.random()*90);
    const high = 20 + Math.floor(Math.random()*15);
    const countries = 35 + Math.floor(Math.random()*12);
    statMonthly.textContent = monthly;
    statHigh.textContent = high;
    statCountries.textContent = countries;
    const mini = document.getElementById('riskMiniChart');
    if(mini){
      const miniChart = echarts.init(mini);
      miniChart.setOption({
        tooltip:{trigger:'item'},
        legend:{bottom:0, textStyle:{fontSize:10}},
        series:[{
          type:'pie', radius:['45%','75%'],
          avoidLabelOverlap:true,
            label:{ formatter:'{b}: {d}%', fontSize:10 },
            data:[
              {value: high, name:'高风险'},
              {value: Math.max(1, Math.round(monthly*0.35)), name:'中风险'},
              {value: Math.max(1, Math.round(monthly*0.65 - high)), name:'低风险'}
            ],
            itemStyle:{ borderColor:'#fff', borderWidth:1 }
        }]
      });

      // 粒子背景初始化
      window.addEventListener('resize', ()=>miniChart.resize());
    }
  }

  // ====== 数字瀑布 ======
  // 数字瀑布由 /api/stats 的 monthly_updates 数值驱动（拆分为数字列）
  const regCascade = document.getElementById('regCascade');
  let cascadeBase = 0;
  function buildCascade(total){
    if(!regCascade) return; regCascade.innerHTML='';
    const str = String(total);
    const COLUMN_COUNT = 12; // 保持丰富度，剩余列填充随机
    for(let c=0;c<COLUMN_COUNT;c++){
      const col = document.createElement('div'); col.className='col';
      const digits = document.createElement('div'); digits.className='digits';
      if(c%4===1) digits.classList.add('delay-1');
      if(c%4===2) digits.classList.add('delay-2');
      if(c%4===3) digits.classList.add('delay-3');
      if(c%5===0) digits.classList.add('delay-4');
      let txt='';
      const baseDigit = str[c] ? parseInt(str[c]) : Math.floor(Math.random()*10);
      for(let i=0;i<40;i++) txt += ((baseDigit + i) % 10) + '\n';
      digits.textContent = txt;
      col.appendChild(digits); regCascade.appendChild(col);
    }
    cascadeBase = total;
  }
  fetch('/api/stats').then(r=>r.json()).then(d=>{ if(d.success){ const v=d.data; buildCascade(v.monthly_updates); if(statMonthly) statMonthly.textContent=v.monthly_updates; if(statHigh) statHigh.textContent=v.high_risk; if(statCountries) statCountries.textContent=v.countries_monitored; startCascadeJitter(); }}).catch(()=>{ buildCascade(245); startCascadeJitter(); });

  // 轻微随机扰动：周期性调整各列滚动速度与基底展示的数字，录屏更生动
  function startCascadeJitter(){
    if(!regCascade) return;
    setInterval(()=>{
      const cols = regCascade.querySelectorAll('.col .digits');
      cols.forEach((d,i)=>{
        if(Math.random()<0.35){
          // 调整动画时长形成速度差异
          const newDur = 5 + Math.random()*3; d.style.animationDuration = newDur + 's';
        }
        if(Math.random()<0.18){
          // 重新生成部分列数字，基于 cascadeBase 轻微偏移
          const offset = Math.floor(Math.random()*5);
          const baseDigit = parseInt(String(cascadeBase)[i]) || Math.floor(Math.random()*10);
          let txt='';
          for(let k=0;k<40;k++) txt += ((baseDigit + offset + k) % 10) + '\n';
          d.textContent = txt;
        }
      });
    }, 4200);
  }
});
