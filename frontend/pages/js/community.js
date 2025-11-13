// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化英雄区动画
    initCommunityHero();
    
    // 处理图片加载
    handleImageLoading();
    
    // 初始化滚动动画
    initScrollAnimations();
    
    // 初始化导航栏滚动效果
    initNavbarScroll();
    
    // 初始化按钮交互效果
    initButtonEffects();
});

// 英雄区背景动画：网络节点缓慢浮动 + 视差光斑
function initCommunityHero() {
    const cvs = document.getElementById('communityHeroCanvas');
    if (!cvs) return;
    
    const ctx = cvs.getContext('2d');
    
    // 响应窗口大小调整
    function resize() {
        cvs.width = cvs.clientWidth;
        cvs.height = cvs.clientHeight;
    }
    
    window.addEventListener('resize', resize);
    resize();
    
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const NODE_COUNT = prefersReduced ? 25 : 55;
    const nodes = [];
    
    // 创建节点
    for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
            x: Math.random() * cvs.width,
            y: Math.random() * cvs.height,
            vx: (-0.5 + Math.random()) * 0.3,
            vy: (-0.5 + Math.random()) * 0.3,
            r: 1 + Math.random() * 1.8,
            hue: 200 + Math.random() * 40,
            pulse: Math.random() * 2 // 脉冲效果参数
        });
    }
    
    let rafId = null;
    let running = true;
    
    // 动画循环
    function tick() {
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        
        // 更新脉冲效果
        nodes.forEach(n => {
            n.pulse = (n.pulse + 0.02) % 2;
        });
        
        // 绘制连接线
        for (let i = 0; i < nodes.length; i++) {
            const a = nodes[i];
            for (let j = i + 1; j < nodes.length; j++) {
                const b = nodes[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 130) {
                    // 连接线随节点脉冲变化透明度
                    const pulseFactor = 0.5 + 0.5 * Math.sin(a.pulse * Math.PI);
                    ctx.strokeStyle = `hsla(${(a.hue + b.hue) / 2}, 70%, 65%, ${(0.12 - (dist / 130) * 0.1) * pulseFactor})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }
        
        // 绘制节点
        nodes.forEach(n => {
            // 更新位置
            n.x += n.vx;
            n.y += n.vy;
            
            // 边界检测
            if (n.x < 0 || n.x > cvs.width) n.vx *= -1;
            if (n.y < 0 || n.y > cvs.height) n.vy *= -1;
            
            // 节点脉冲效果
            const pulseSize = n.r * (1 + 0.3 * Math.sin(n.pulse * Math.PI));
            
            // 绘制节点光晕
            ctx.beginPath();
            ctx.fillStyle = `hsla(${n.hue}, 80%, 70%, 0.2)`;
            ctx.arc(n.x, n.y, pulseSize * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // 绘制节点本身
            ctx.beginPath();
            ctx.fillStyle = `hsla(${n.hue}, 80%, 70%, 0.7)`;
            ctx.arc(n.x, n.y, pulseSize, 0, Math.PI * 2);
            ctx.fill();
        });
        
        if (running) rafId = requestAnimationFrame(tick);
    }
    
    tick();
    
    // 页面可见性变化时暂停/恢复动画
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
        } else {
            if (!running) {
                running = true;
                tick();
            }
        }
    });
}

// 处理图片加载
function handleImageLoading() {
    const heroImage = document.querySelector('.hero-visual img');
    
    if (heroImage) {
        // 添加加载类
        heroImage.classList.add('loading');
        
        // 图片加载成功
        heroImage.addEventListener('load', function() {
            this.classList.remove('loading');
            // 添加淡入效果
            this.style.opacity = '0';
            setTimeout(() => {
                this.style.opacity = '1';
            }, 50);
        });
        
        // 图片加载失败时使用默认图
        heroImage.addEventListener('error', function() {
            this.src = 'https://picsum.photos/800/600?random=1';
            this.classList.remove('loading');
        });
        
        // 检查图片是否已缓存
        if (heroImage.complete) {
            heroImage.classList.remove('loading');
        }
    }
    
    // 处理所有用户头像图片
    const avatarImages = document.querySelectorAll('img[alt="用户头像"], img[alt="专家头像"], img[alt="演讲嘉宾"]');
    avatarImages.forEach(img => {
        img.addEventListener('error', function() {
            // 使用默认头像
            this.src = `https://picsum.photos/seed/${this.alt}/200/200`;
        });
    });
}

// 初始化滚动动画
function initScrollAnimations() {
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.window-section, .community-stats, .community-cta, .shadow-card');
        
        elements.forEach((el, index) => {
            const rect = el.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
            
            if (isVisible) {
                // 错开动画时间，创建层次感
                setTimeout(() => {
                    el.classList.add('fade-in');
                }, index * 100);
            }
        });
    };
    
    // 初始检查
    animateOnScroll();
    
    // 滚动时检查
    window.addEventListener('scroll', animateOnScroll);
}

// 初始化导航栏滚动效果
function initNavbarScroll() {
    const header = document.querySelector('header');
    
    const updateNavbar = function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    // 初始检查
    updateNavbar();
    
    // 滚动时更新
    window.addEventListener('scroll', updateNavbar);
}

// 初始化按钮交互效果
function initButtonEffects() {
    const buttons = document.querySelectorAll('button, a[href="#"]:not(.lang-option)');
    
    buttons.forEach(btn => {
        // 添加鼠标按下效果
        btn.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.96)';
        });
        
        // 鼠标释放或离开时恢复
        const restoreState = function() {
            this.style.transform = '';
        };
        
        btn.addEventListener('mouseup', restoreState);
        btn.addEventListener('mouseleave', restoreState);
        btn.addEventListener('blur', restoreState);
    });
}

// 添加平滑滚动到锚点
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // 移动端菜单关闭（如果有）
            const mobileMenu = document.querySelector('.mobile-menu');
            if (mobileMenu && mobileMenu.classList.contains('open')) {
                mobileMenu.classList.remove('open');
            }
        }
    });
});