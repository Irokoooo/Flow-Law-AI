// 子页面导航交互
document.addEventListener('DOMContentLoaded', function() {
    // 移动端菜单切换
    const hamburger = document.querySelector('.sub-hamburger');
    const navMenu = document.querySelector('.sub-nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    // 图片轮播功能
document.addEventListener('DOMContentLoaded', function() {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  let currentSlide = 0;
  let slideInterval;

  // 切换到指定幻灯片
  function goToSlide(n) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = (n + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  // 下一张幻灯片
  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  // 开始自动轮播
  function startSlideShow() {
    slideInterval = setInterval(nextSlide, 5000);
  }

  // 停止自动轮播
  function stopSlideShow() {
    clearInterval(slideInterval);
  }

  // 事件监听器
  prevBtn.addEventListener('click', function() {
    stopSlideShow();
    goToSlide(currentSlide - 1);
    startSlideShow();
  });

  nextBtn.addEventListener('click', function() {
    stopSlideShow();
    nextSlide();
    startSlideShow();
  });

  // 点击指示点切换
  dots.forEach((dot, index) => {
    dot.addEventListener('click', function() {
      stopSlideShow();
      goToSlide(index);
      startSlideShow();
    });
  });

  // 鼠标悬停暂停
  const carousel = document.querySelector('.hero-carousel');
  carousel.addEventListener('mouseenter', stopSlideShow);
  carousel.addEventListener('mouseleave', startSlideShow);

  // 开始轮播
  startSlideShow();
});
    // 平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') return;
            
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // 更新导航菜单活动状态
                if (this.classList.contains('sub-nav-link')) {
                    document.querySelectorAll('.sub-nav-link').forEach(link => {
                        link.classList.remove('active');
                    });
                    this.classList.add('active');
                }
            }
        });
    });
    
    // 标签页切换
    const tabButtons = document.querySelectorAll('.sub-tab-btn');
    const tabPanes = document.querySelectorAll('.sub-tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // 更新按钮状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 更新内容面板
            tabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            
            // 激活当前标签页的第一个审查重点
            const activeTab = document.getElementById(tabId);
            if (activeTab) {
                const firstReviewItem = activeTab.querySelector('.sub-review-list li:first-child');
                if (firstReviewItem) {
                    firstReviewItem.click();
                }
            }
        });
    });
    
    // 审查侧边栏导航
    const reviewItems = document.querySelectorAll('.sub-review-list li');
    const reviewDetails = document.querySelectorAll('.sub-review-detail');
    
    reviewItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            
            // 更新活动状态
            reviewItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // 显示对应内容
            reviewDetails.forEach(detail => detail.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
        });
    });
    
    // 文件上传交互
    const uploadContainer = document.querySelector('.sub-upload-container');
    const fileInput = document.getElementById('contract-upload');
    
    if (uploadContainer && fileInput) {
        uploadContainer.addEventListener('click', function() {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', async function() {
            if (this.files.length > 0) {
                const file = this.files[0];
                const sessionId = localStorage.getItem('lf_session_id');
                if(!sessionId){
                    alert('请先在首页登录再进行合同审核');
                    return;
                }
                // Step1: 上传
                uploadContainer.innerHTML = `
                    <div class="sub-upload-icon" style="color:#3182ce;">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    <h3>正在上传: ${file.name}</h3>
                    <p>请稍候...</p>
                    <div class="sub-upload-status">
                        <div class="sub-upload-progress">
                            <div class="sub-upload-progress-bar" style="width: 35%;"></div>
                        </div>
                        <p>上传中...</p>
                    </div>`;
                let uploadResp;
                try { uploadResp = await FlowLawAPI.uploadFile(file); } catch(e){
                    uploadContainer.innerHTML = `<p style='color:#c53030'>上传失败: ${e.message}</p>`; return; }
                if(!uploadResp.success){ uploadContainer.innerHTML = `<p style='color:#c53030'>上传失败: ${uploadResp.message||'未知错误'}</p>`; return; }
                const filename = uploadResp.filename;
                // Step2: 审核
                uploadContainer.innerHTML = `
                    <div class="sub-upload-icon" style="color:#38a169;">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <h3>${file.name}</h3>
                    <p>上传成功，正在审核合同内容...</p>
                    <div class="sub-upload-status">
                        <div class="sub-upload-progress">
                            <div class="sub-upload-progress-bar" style="width: 70%;"></div>
                        </div>
                        <p>分析中...</p>
                    </div>`;
                let auditResp;
                try { auditResp = await FlowLawAPI.auditContract(filename, sessionId); } catch(e){
                    uploadContainer.innerHTML = `<p style='color:#c53030'>审核调用失败: ${e.message}</p>`; return; }
                if(!auditResp.success){ uploadContainer.innerHTML = `<p style='color:#c53030'>审核失败: ${auditResp.message||'未知错误'}</p>`; return; }
                const audit = auditResp.audit;
                const riskText = audit.text || '未返回审核文本';
                uploadContainer.innerHTML = `
                    <div class="sub-upload-icon" style="color:#38a169;">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3>${file.name}</h3>
                    <p>审核完成</p>
                    <div class="sub-upload-result" style="max-height:220px;overflow:auto;text-align:left;font-size:0.85rem;line-height:1.4;border:1px solid #e2e8f0;padding:10px;border-radius:6px;background:#f7fafc">${riskText.replace(/\n/g,'<br>')}</div>
                    <div class="sub-upload-status">
                        <div class="sub-upload-progress">
                            <div class="sub-upload-progress-bar" style="width: 100%;background:#38a169"></div>
                        </div>
                        <p style="color:#38a169">分析完成</p>
                    </div>`;
                window.location.hash = '#review-section';
            }
        });
        
        // 拖拽上传效果
        uploadContainer.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = '#4f76c4';
            this.style.background = '#f7fafc';
        });
        
        uploadContainer.addEventListener('dragleave', function() {
            this.style.borderColor = '#cbd5e0';
            this.style.background = 'white';
        });
        
        uploadContainer.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = '#cbd5e0';
            this.style.background = 'white';
            
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                const changeEvent = new Event('change');
                fileInput.dispatchEvent(changeEvent);
            }
        });
    }
    
    // AI上传区域交互
    const aiUploadBox = document.querySelector('.sub-ai-upload-box');
    const aiUploadBtn = document.querySelector('.sub-ai-upload-btn');
    
    if (aiUploadBox && aiUploadBtn) {
        aiUploadBtn.addEventListener('click', function() {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.multiple = true;
            fileInput.accept = '.pdf,.doc,.docx';
            fileInput.click();
            
            fileInput.addEventListener('change', function() {
                if (this.files.length > 0) {
                    const fileCount = this.files.length;
                    aiUploadBox.innerHTML = `
                        <div class="sub-upload-icon" style="color: #38a169;">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h3>已选择 ${fileCount} 个文件</h3>
                        <p>开始训练AI模型...</p>
                    `;
                    
                    // 模拟训练过程
                    let progress = 0;
                    const progressInterval = setInterval(() => {
                        progress += 5;
                        document.querySelector('.sub-progress-fill').style.width = `${progress}%`;
                        document.querySelector('.sub-ai-progress p').textContent = 
                            `已学习: ${progress}% - 预计剩余时间: ${Math.floor((100 - progress) / 5)}分钟`;
                        
                        if (progress >= 100) {
                            clearInterval(progressInterval);
                            aiUploadBox.innerHTML = `
                                <div class="sub-upload-icon" style="color: #38a169;">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <h3>模型训练完成</h3>
                                <p>AI已成功学习您提供的合同模式</p>
                                <button class="sub-ai-upload-btn">查看模型详情</button>
                            `;
                        }
                    }, 1000);
                }
            });
        });
        
        // 拖拽上传效果
        aiUploadBox.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = '#4f76c4';
            this.style.background = '#f7fafc';
        });
        
        aiUploadBox.addEventListener('dragleave', function() {
            this.style.borderColor = '#cbd5e0';
            this.style.background = 'white';
        });
        
        aiUploadBox.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = '#cbd5e0';
            this.style.background = 'white';
            
            if (e.dataTransfer.files.length > 0) {
                const clickEvent = new Event('click');
                aiUploadBtn.dispatchEvent(clickEvent);
            }
        });
    }
    
    // 风险评估仪表盘动画
    const riskIndicator = document.querySelector('.sub-risk-indicator');
    if (riskIndicator) {
        let direction = 1;
        let position = 30;
        
        setInterval(() => {
            position += direction * 5;
            
            if (position > 70 || position < 10) {
                direction *= -1;
            }
            
            riskIndicator.style.left = `${position}%`;
        }, 1000);
    }
    
    // 页面滚动时更新导航状态 + 添加滚动视觉类
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('.sub-section');
        const navLinks = document.querySelectorAll('.sub-nav-link');
        const subNavbar = document.querySelector('.sub-navbar');
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                currentSection = '#' + section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentSection) {
                link.classList.add('active');
            }
        });
        if (subNavbar) {
            if (window.scrollY > 50) { subNavbar.classList.add('scrolled'); } else { subNavbar.classList.remove('scrolled'); }
        }
    });
    
    // 初始化所有标签页的第一个审查重点
    tabPanes.forEach(pane => {
        const firstReviewItem = pane.querySelector('.sub-review-list li:first-child');
        if (firstReviewItem) {
            firstReviewItem.classList.add('active');
            const targetId = firstReviewItem.getAttribute('data-target');
            if (targetId) {
                const targetDetail = pane.querySelector(`#${targetId}`);
                if (targetDetail) {
                    targetDetail.classList.add('active');
                }
            }
        }
    });
});