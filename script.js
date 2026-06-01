/* ═══════════════════════════════════════════════════════
   CINEMATIC PORTFOLIO ENGINE — Performance Optimized
   ═══════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // ─── SINGLE RAF SCROLL LOOP ───────────────────────
    let scrollCallbacks = [];
    let scrollTicking = false;
    function onScroll() {
        if (!scrollTicking) {
            scrollTicking = true;
            requestAnimationFrame(() => {
                const sy = window.scrollY;
                const vh = window.innerHeight;
                for (let i = 0; i < scrollCallbacks.length; i++) scrollCallbacks[i](sy, vh);
                scrollTicking = false;
            });
        }
    }
    window.addEventListener('scroll', onScroll, {passive: true});

    // ─── CUSTOM CURSOR ────────────────────────────────
    const cursor = document.getElementById('cursor');
    const cursorLabel = document.getElementById('cursorLabel');
    const glow = document.getElementById('cursorGlow');
    let mx = 0, my = 0, cx = 0, cy = 0;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, {passive: true});

    (function cursorLoop() {
        cx += (mx - cx) * 0.15;
        cy += (my - cy) * 0.15;
        if (cursor) cursor.style.transform = `translate3d(${cx}px,${cy}px,0)`;
        if (glow) glow.style.transform = `translate3d(${mx - 300}px,${my - 300}px,0)`;
        requestAnimationFrame(cursorLoop);
    })();

    // Cursor states via event delegation
    document.addEventListener('mouseover', e => {
        const el = e.target.closest('a, button, .blog-card, .case__link, .contact__channel, .nav__link, .skill-item');
        if (!el || !cursor) return;
        cursor.classList.add('cursor--hover');
        const label = el.dataset.cursor || '';
        if (label && cursorLabel) { cursorLabel.textContent = label; cursor.classList.add('cursor--labeled'); }
    }, {passive: true});

    document.addEventListener('mouseout', e => {
        const el = e.target.closest('a, button, .blog-card, .case__link, .contact__channel, .nav__link, .skill-item');
        if (!el || !cursor) return;
        cursor.classList.remove('cursor--hover', 'cursor--labeled');
        if (cursorLabel) cursorLabel.textContent = '';
    }, {passive: true});

    document.addEventListener('mousedown', () => cursor?.classList.add('cursor--click'), {passive: true});
    document.addEventListener('mouseup', () => cursor?.classList.remove('cursor--click'), {passive: true});

    // ─── RIPPLE EFFECT (delegated) ────────────────────
    document.addEventListener('click', e => {
        const el = e.target.closest('.nav__cta, .resume__btn, .contact__submit, .blog-card__link, .case__link, .fab-menu__trigger, .fab-menu__btn');
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const size = Math.max(rect.width, rect.height) * 2;
        ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px;`;
        el.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });

    // ─── PHOTO STACK ──────────────────────────────────
    const photoStack = document.getElementById('photoStack');
    if (photoStack) {
        const cards = Array.from(photoStack.querySelectorAll('.photo-stack__card'));
        const total = cards.length;
        const VISIBLE = Math.min(4, total);
        let order = cards.map((_, i) => i);
        let isAnimating = false;
        const rotations = [-2.5, 1.8, -1.2];

        function layoutStack() {
            for (let i = 0; i < cards.length; i++) {
                const card = cards[i];
                const depth = order.indexOf(i);
                if (depth < VISIBLE) {
                    const scale = 1 - depth * 0.04;
                    const translateY = depth * 8;
                    const rotate = depth === 0 ? 0 : rotations[i];
                    card.style.transform = `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`;
                    card.style.opacity = depth === 0 ? 1 : Math.max(0.4, 1 - depth * 0.2);
                    card.style.zIndex = total - depth;
                    card.style.pointerEvents = depth === 0 ? 'auto' : 'none';
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                    card.style.zIndex = 0;
                }
            }
        }

        layoutStack();

        photoStack.addEventListener('click', () => {
            if (isAnimating) return;
            isAnimating = true;
            const frontIdx = order[0];
            const frontCard = cards[frontIdx];
            frontCard.classList.add('photo-stack__card--departing');
            frontCard.style.transform = `translateX(80%) translateY(-20px) rotate(8deg) scale(0.92)`;
            frontCard.style.opacity = '0';
            setTimeout(() => {
                frontCard.classList.remove('photo-stack__card--departing');
                order.push(order.shift());
                layoutStack();
                isAnimating = false;
            }, 600);
        });
    }

    // ─── SPOTLIGHT ON CARDS (delegated mousemove) ─────
    const spotlightSelector = '.stat-card,.timeline__card,.blog-card,.contact__channel,.case__visual';
    document.querySelectorAll(spotlightSelector).forEach(el => el.classList.add('spotlight'));

    document.addEventListener('mousemove', e => {
        const el = e.target.closest(spotlightSelector);
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
        el.style.setProperty('--spot', '1');
    }, {passive: true});

    document.addEventListener('mouseout', e => {
        const el = e.target.closest(spotlightSelector);
        if (el) el.style.setProperty('--spot', '0');
    }, {passive: true});

    // ─── TILT + MAGNETIC (combined, delegated) ────────
    const tiltSelector = '.case__visual,.resume__paper,.blog-card--featured';
    const magneticSelector = '.nav__cta,.resume__btn,.contact__submit,.hero__socials a,.theme-toggle,.fab-menu__trigger';

    document.addEventListener('mousemove', e => {
        // Tilt
        const tiltEl = e.target.closest(tiltSelector);
        if (tiltEl) {
            const r = tiltEl.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            tiltEl.style.transform = `perspective(900px) rotateX(${y * -5}deg) rotateY(${x * 5}deg) scale3d(1.015,1.015,1)`;
        }
        // Magnetic
        const magEl = e.target.closest(magneticSelector);
        if (magEl) {
            const r = magEl.getBoundingClientRect();
            magEl.style.transform = `translate3d(${(e.clientX - r.left - r.width/2) * 0.2}px,${(e.clientY - r.top - r.height/2) * 0.2}px,0)`;
        }
    }, {passive: true});

    document.addEventListener('mouseleave', e => {
        const tiltEl = e.target.closest(tiltSelector);
        if (tiltEl) { tiltEl.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)'; tiltEl.style.transform = ''; setTimeout(() => tiltEl.style.transition = '', 600); }
        const magEl = e.target.closest(magneticSelector);
        if (magEl) { magEl.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)'; magEl.style.transform = ''; setTimeout(() => magEl.style.transition = '', 400); }
    }, true);

    // ─── TEXT SCRAMBLE ON HOVER ────────────────────────
    document.querySelectorAll('.case__title, .blog-card h3').forEach(el => {
        const original = el.textContent;
        const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        let interval;
        el.addEventListener('mouseenter', () => {
            let iter = 0;
            clearInterval(interval);
            interval = setInterval(() => {
                el.textContent = original.split('').map((c, i) => {
                    if (i < iter) return original[i];
                    return c === ' ' ? ' ' : chars[(Math.random() * chars.length) | 0];
                }).join('');
                iter += 1.5;
                if (iter >= original.length) { clearInterval(interval); el.textContent = original; }
            }, 25);
        });
        el.addEventListener('mouseleave', () => { clearInterval(interval); el.textContent = original; });
    });

    // ─── NAVIGATION ───────────────────────────────────
    const nav = document.getElementById('nav');
    const menuBtn = document.getElementById('menuBtn');
    const navLinksEl = document.getElementById('navLinks');
    const btt = document.createElement('button');
    btt.className = 'back-to-top'; btt.innerHTML = '<i class="fas fa-chevron-up"></i>'; btt.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(btt);
    btt.addEventListener('click', () => scrollTo({top: 0, behavior: 'smooth'}));

    const progBar = document.createElement('div');
    progBar.className = 'page-progress'; document.body.appendChild(progBar);

    const tlProg = document.getElementById('timelineProgress');
    const tl = document.querySelector('.timeline');

    // Register all scroll work in the unified loop
    scrollCallbacks.push((sy, vh) => {
        // Nav scroll state
        nav.classList.toggle('nav--scrolled', sy > 50);
        btt.classList.toggle('visible', sy > 600);

        // Page progress
        const max = document.documentElement.scrollHeight - vh;
        progBar.style.width = max > 0 ? (sy / max * 100) + '%' : '0%';

        // Active nav link
        const checkY = sy + 200;
        document.querySelectorAll('section[id]').forEach(s => {
            const link = document.querySelector(`.nav__link[data-section="${s.id}"]`);
            if (link) link.classList.toggle('nav__link--active', checkY >= s.offsetTop && checkY < s.offsetTop + s.offsetHeight);
        });

        // Timeline progress
        if (tl && tlProg) {
            const r = tl.getBoundingClientRect();
            if (r.top < vh && r.bottom > 0) tlProg.style.height = Math.min(Math.max((vh - r.top) / (r.height + vh * 0.4), 0), 1) * 100 + '%';
        }
    });

    menuBtn.addEventListener('click', () => navLinksEl.classList.toggle('active'));
    document.querySelectorAll('.nav__link').forEach(l => l.addEventListener('click', () => navLinksEl.classList.remove('active')));

    // ─── SECTION DOTS ─────────────────────────────────
    const sectionDots = document.querySelectorAll('.section-dots__dot');
    const dotSections = ['hero', 'about', 'journey', 'projects', 'skills', 'blog', 'contact'];

    scrollCallbacks.push((sy, vh) => {
        const checkY = sy + vh / 3;
        let current = 'hero';
        for (let i = 0; i < dotSections.length; i++) {
            const el = document.getElementById(dotSections[i]);
            if (el && el.offsetTop <= checkY) current = dotSections[i];
        }
        sectionDots.forEach(dot => dot.classList.toggle('active', dot.dataset.section === current));
    });

    // ─── ACTIVE NAV UNDERLINE ─────────────────────────
    const allNavLinks = document.querySelectorAll('.nav__link');
    scrollCallbacks.push((sy) => {
        const checkY = sy + 200;
        let current = '';
        document.querySelectorAll('section[id]').forEach(section => {
            if (section.offsetTop <= checkY) current = section.id;
        });
        allNavLinks.forEach(link => link.classList.toggle('active', link.dataset.section === current));
    });

    // ─── PARALLAX (hero + photo stack) ────────────────
    if (window.innerWidth > 768) {
        const hc = document.querySelector('.hero__content');
        const hv = document.querySelector('.hero__visual');
        const parallaxEls = document.querySelectorAll('.photo-stack, .case__visual img');

        scrollCallbacks.push((sy, vh) => {
            if (sy < vh) {
                if (hc) hc.style.transform = `translate3d(0,${sy * 0.12}px,0)`;
                if (hv) hv.style.transform = `translate3d(0,${sy * 0.06}px,0)`;
            }
            parallaxEls.forEach(el => {
                const rect = el.getBoundingClientRect();
                const center = rect.top + rect.height / 2 - vh / 2;
                el.style.setProperty('--parallax', (center * 0.03) + 'px');
            });
        });
    }

    // ─── SCROLL VELOCITY INDICATOR ────────────────────
    const velocityLine = document.createElement('div');
    velocityLine.className = 'velocity-line';
    document.body.appendChild(velocityLine);
    let lastScrollY = window.scrollY, velocity = 0;

    scrollCallbacks.push((sy) => {
        const newV = Math.abs(sy - lastScrollY);
        velocity += (newV - velocity) * 0.3;
        lastScrollY = sy;
        const scale = Math.min(velocity / 50, 1);
        velocityLine.style.transform = `scaleX(${scale})`;
        velocityLine.classList.toggle('active', scale > 0.02);
    });

    // ─── PARTICLES ────────────────────────────────────
    const pCont = document.getElementById('particles');
    if (pCont && innerWidth > 600) {
        const frag = document.createDocumentFragment();
        for (let i = 0; i < 20; i++) {
            const d = document.createElement('div');
            d.className = 'particle';
            d.style.cssText = `width:${Math.random()*2.5+1}px;height:${Math.random()*2.5+1}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--dx:${(Math.random()-.5)*120}px;--dy:${-(Math.random()*100+50)}px;--dur:${Math.random()*14+8}s;--delay:${Math.random()*-20}s;--alpha:${Math.random()*0.25+0.1};`;
            frag.appendChild(d);
        }
        pCont.appendChild(frag);
    }

    // ─── HERO CANVAS ──────────────────────────────────
    const canvas = document.getElementById('heroCanvas');
    if (canvas && innerWidth > 768) {
        const ctx = canvas.getContext('2d');
        let W, H, nodes = [], running = true;

        function resize() {
            const r = canvas.parentElement.getBoundingClientRect();
            const dpr = Math.min(devicePixelRatio, 2);
            W = r.width; H = r.height;
            canvas.width = W * dpr; canvas.height = H * dpr;
            canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            nodes = Array.from({length: 40}, () => ({x: Math.random()*W, y: Math.random()*H, vx: (Math.random()-.5)*0.25, vy: (Math.random()-.5)*0.25, r: Math.random()*1.5+0.7}));
        }

        let mouseOnCanvas = {x: -1000, y: -1000};
        canvas.parentElement.addEventListener('mousemove', e => {
            const r = canvas.parentElement.getBoundingClientRect();
            mouseOnCanvas.x = e.clientX - r.left;
            mouseOnCanvas.y = e.clientY - r.top;
        }, {passive: true});

        function draw() {
            if (!running) return;
            ctx.clearRect(0, 0, W, H);
            for (const n of nodes) {
                const ddx = n.x - mouseOnCanvas.x, ddy = n.y - mouseOnCanvas.y;
                const dist = Math.hypot(ddx, ddy);
                if (dist < 150 && dist > 0) {
                    const force = (150 - dist) / 150 * 0.5;
                    n.vx += (ddx / dist) * force;
                    n.vy += (ddy / dist) * force;
                }
                n.vx *= 0.98; n.vy *= 0.98;
                n.x += n.vx; n.y += n.vy;
                if (n.x < 0 || n.x > W) n.vx *= -1;
                if (n.y < 0 || n.y > H) n.vy *= -1;
            }
            for (let i = 0; i < nodes.length; i++) for (let j = i+1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, d = Math.hypot(dx, dy);
                if (d < 100) { ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.strokeStyle = `rgba(34,211,238,${(1-d/100)*0.1})`; ctx.lineWidth = 0.5; ctx.stroke(); }
            }
            for (const n of nodes) { ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 6.28); ctx.fillStyle = 'rgba(34,211,238,0.35)'; ctx.fill(); }
            requestAnimationFrame(draw);
        }

        resize(); draw();
        addEventListener('resize', resize);
        new IntersectionObserver(([e]) => { running = e.isIntersecting; if (running) draw(); }).observe(canvas.parentElement);
    }

    // ─── ROTATING TEXT ────────────────────────────────
    const rw = document.getElementById('rotatingWord');
    if (rw) {
        const words = ['raw data', 'complexity', 'patterns', 'noise', 'questions'];
        let wi = 0;
        setInterval(() => {
            rw.classList.add('hero__title-word--out');
            setTimeout(() => {
                wi = (wi + 1) % words.length;
                rw.textContent = words[wi];
                rw.classList.remove('hero__title-word--out');
            }, 300);
        }, 3000);
    }

    // ─── COUNTERS ─────────────────────────────────────
    function animateCounters(root) {
        (root || document).querySelectorAll('[data-count]:not([data-done])').forEach(el => {
            el.dataset.done = '1';
            const t = +el.dataset.count, s = el.dataset.suffix || '', st = performance.now();
            (function tick(now) {
                const p = Math.min((now - st) / 1800, 1);
                el.textContent = Math.floor((1 - Math.pow(1 - p, 4)) * t) + s;
                p < 1 ? requestAnimationFrame(tick) : (el.textContent = t + s);
            })(st);
        });
    }

    // ─── RADAR CHART ──────────────────────────────────
    let radarDone = false;
    function drawRadar() {
        if (radarDone) return;
        const c = document.getElementById('skillsRadar');
        if (!c) return; radarDone = true;
        const ctx2 = c.getContext('2d'), size = 350, dpr = Math.min(devicePixelRatio, 2);
        c.width = size*dpr; c.height = size*dpr; c.style.width = size+'px'; c.style.height = size+'px'; ctx2.scale(dpr, dpr);
        const cx2 = size/2, cy2 = size/2, mR = size*0.38;
        const labels = ['Python', 'SQL', 'Power BI', 'ML/AI', 'C++', 'Data Viz'];
        const vals = [0.9, 0.85, 0.92, 0.8, 0.75, 0.85];
        const n = 6, step = Math.PI*2/n;
        let prog = 0;
        (function frame() {
            prog = Math.min(prog + 0.022, 1); const e = 1 - Math.pow(1 - prog, 3);
            ctx2.clearRect(0, 0, size, size);
            for (let r = 1; r <= 4; r++) { const rad = (r/4)*mR; ctx2.beginPath(); for (let i = 0; i <= n; i++) { const a = i*step - Math.PI/2, px = cx2+rad*Math.cos(a), py = cy2+rad*Math.sin(a); i ? ctx2.lineTo(px, py) : ctx2.moveTo(px, py); } ctx2.closePath(); ctx2.strokeStyle = 'rgba(255,255,255,0.04)'; ctx2.lineWidth = 1; ctx2.stroke(); }
            for (let i = 0; i < n; i++) { const a = i*step - Math.PI/2; ctx2.beginPath(); ctx2.moveTo(cx2, cy2); ctx2.lineTo(cx2+mR*Math.cos(a), cy2+mR*Math.sin(a)); ctx2.strokeStyle = 'rgba(255,255,255,0.025)'; ctx2.stroke(); }
            ctx2.beginPath(); for (let i = 0; i <= n; i++) { const idx = i%n, a = idx*step - Math.PI/2, r2 = vals[idx]*mR*e, px = cx2+r2*Math.cos(a), py = cy2+r2*Math.sin(a); i ? ctx2.lineTo(px, py) : ctx2.moveTo(px, py); } ctx2.closePath();
            const g = ctx2.createLinearGradient(0, 0, size, size); g.addColorStop(0, 'rgba(34,211,238,0.15)'); g.addColorStop(1, 'rgba(99,102,241,0.06)'); ctx2.fillStyle = g; ctx2.fill(); ctx2.strokeStyle = 'rgba(34,211,238,0.5)'; ctx2.lineWidth = 2; ctx2.stroke();
            for (let i = 0; i < n; i++) { const a = i*step - Math.PI/2, r2 = vals[i]*mR*e, px = cx2+r2*Math.cos(a), py = cy2+r2*Math.sin(a); ctx2.beginPath(); ctx2.arc(px, py, 4, 0, 6.28); ctx2.fillStyle = '#22d3ee'; ctx2.fill(); ctx2.beginPath(); ctx2.arc(px, py, 8, 0, 6.28); ctx2.fillStyle = 'rgba(34,211,238,0.12)'; ctx2.fill(); }
            ctx2.font = '11px Inter,sans-serif'; ctx2.textAlign = 'center'; ctx2.textBaseline = 'middle'; ctx2.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-2').trim() || '#9898a8';
            for (let i = 0; i < n; i++) { const a = i*step - Math.PI/2; ctx2.fillText(labels[i], cx2+(mR+24)*Math.cos(a), cy2+(mR+24)*Math.sin(a)); }
            if (prog < 1) requestAnimationFrame(frame);
        })();
    }

    // ─── SCROLL OBSERVER (reveal + counters) ──────────
    const obs = new IntersectionObserver(entries => {
        for (const e of entries) {
            if (!e.isIntersecting) continue;
            e.target.classList.add('visible');
            if (e.target.closest('.skills') || e.target.matches('.skills')) { drawRadar(); animateSkillBars(); }
            if (e.target.matches('[data-count]') || e.target.closest('.hero') || e.target.closest('.resume')) animateCounters(e.target.closest('section') || document);
        }
    }, {threshold: 0.1, rootMargin: '0px 0px -30px 0px'});

    '.stat-card,.timeline__item,.case,.blog-card,.skill-item__fill,[data-count],.skills,.resume'.split(',').forEach(s => document.querySelectorAll(s).forEach(el => obs.observe(el)));

    document.querySelectorAll('.stat-card').forEach((c, i) => c.style.transitionDelay = i * 0.12 + 's');
    document.querySelectorAll('.timeline__item').forEach((c, i) => c.style.transitionDelay = i * 0.1 + 's');
    document.querySelectorAll('.blog-card').forEach((c, i) => c.style.transitionDelay = i * 0.08 + 's');

    function animateSkillBars() {
        document.querySelectorAll('.skill-item__fill:not(.visible)').forEach(f => { f.style.setProperty('--target-width', f.dataset.width); f.classList.add('visible'); });
    }

    // ─── SECTION REVEAL ───────────────────────────────
    const sObs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; } }), {threshold: 0.04});
    document.querySelectorAll('section').forEach(s => { s.style.cssText = 'opacity:0;transform:translateY(30px);transition:opacity 0.8s cubic-bezier(0.16,1,0.3,1),transform 0.8s cubic-bezier(0.16,1,0.3,1)'; sObs.observe(s); });
    const hero = document.getElementById('hero'); if (hero) { hero.style.opacity = '1'; hero.style.transform = 'none'; }

    // ─── STAGGER REVEAL ───────────────────────────────
    document.querySelectorAll('.hero__metrics, .hero__socials, .about__stats').forEach(el => el.classList.add('stagger-reveal'));
    const revealObserver = new IntersectionObserver(entries => {
        for (const entry of entries) {
            if (entry.isIntersecting) { entry.target.classList.add('revealed'); revealObserver.unobserve(entry.target); }
        }
    }, {threshold: 0.2});
    document.querySelectorAll('.stagger-reveal').forEach(el => revealObserver.observe(el));

    // ─── ARTICLE MODAL ────────────────────────────────
    const modal = document.getElementById('articleModal');
    const modalContent = document.getElementById('articleContent');

    window.openArticle = id => {
        const tmpl = document.getElementById('tmpl-' + id);
        if (!tmpl || !modal || !modalContent) return;
        modalContent.innerHTML = tmpl.innerHTML;
        const container = modal.querySelector('.article-modal__container');
        if (container) container.scrollTop = 0;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => animateCounters(modalContent), 300);
    };

    window.closeArticle = () => { modal?.classList.remove('active'); document.body.style.overflow = ''; };
    addEventListener('keydown', e => { if (e.key === 'Escape' && modal?.classList.contains('active')) closeArticle(); });

    // ─── CONTACT FORM ─────────────────────────────────
    const form = document.getElementById('contactForm');
    if (form) form.addEventListener('submit', e => {
        e.preventDefault();
        const btn = form.querySelector('.contact__submit'), orig = btn.innerHTML;
        btn.innerHTML = '<span>Sent!</span> <i class="fas fa-check"></i>';
        btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
        showToast('Message sent successfully!');
        setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; form.reset(); }, 2500);
    });

    // ─── SMOOTH SCROLL ────────────────────────────────
    document.addEventListener('click', e => {
        const a = e.target.closest('a[href^="#"]');
        if (!a) return;
        const t = document.querySelector(a.getAttribute('href'));
        if (t) { e.preventDefault(); scrollTo({top: t.offsetTop - 80, behavior: 'smooth'}); }
    });

    // ─── FAB MENU ─────────────────────────────────────
    const fab = document.getElementById('fabMenu');
    const fabTrigger = document.getElementById('fabTrigger');
    if (fabTrigger && fab) {
        fabTrigger.addEventListener('click', () => fab.classList.toggle('open'));
        document.addEventListener('click', e => { if (!fab.contains(e.target)) fab.classList.remove('open'); });
    }

    // ─── TOAST NOTIFICATIONS ──────────────────────────
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    let toastTimeout;

    window.showToast = function(msg) {
        if (!toast || !toastMsg) return;
        toastMsg.textContent = msg;
        toast.classList.add('visible');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => toast.classList.remove('visible'), 5000);
    };

    // ─── KEYBOARD SHORTCUTS ───────────────────────────
    addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        switch (e.key) {
            case '1': scrollToSection('about'); break;
            case '2': scrollToSection('journey'); break;
            case '3': scrollToSection('projects'); break;
            case '4': scrollToSection('skills'); break;
            case '5': scrollToSection('blog'); break;
            case '6': scrollToSection('resume'); break;
            case '7': scrollToSection('contact'); break;
            case 't': case 'T':
                if (!e.ctrlKey && !e.metaKey) { document.getElementById('themeToggle')?.click(); showToast('Theme toggled'); }
                break;
        }
    });

    function scrollToSection(id) {
        const el = document.getElementById(id);
        if (el) { scrollTo({top: el.offsetTop - 80, behavior: 'smooth'}); showToast(`Navigated to ${id}`); }
    }

    // ─── THEME TOGGLE ─────────────────────────────────
    const toggle = document.getElementById('themeToggle');
    if (localStorage.getItem('portfolio-theme') === 'light') document.documentElement.setAttribute('data-theme', 'light');

    toggle?.addEventListener('click', () => {
        document.body.classList.add('theme-transitioning');
        const light = document.documentElement.getAttribute('data-theme') === 'light';
        if (light) { document.documentElement.removeAttribute('data-theme'); localStorage.setItem('portfolio-theme', 'dark'); }
        else { document.documentElement.setAttribute('data-theme', 'light'); localStorage.setItem('portfolio-theme', 'light'); }
        radarDone = false; drawRadar();
        setTimeout(() => document.body.classList.remove('theme-transitioning'), 500);
    });

    // ─── BACKGROUND MUSIC ───────────────────────────
    const musicToggle = document.getElementById('musicToggle');
    const musicSlider = document.getElementById('musicVolume');
    const bgMusic = new Audio('assets/background music.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.7;

    let musicPlaying = false;

    musicToggle?.addEventListener('click', () => {
        if (musicPlaying) {
            bgMusic.pause();
            musicToggle.classList.remove('playing');
            musicPlaying = false;
        } else {
            bgMusic.play().then(() => {
                musicToggle.classList.add('playing');
                musicPlaying = true;
            }).catch(() => {});
        }
    });

    if (musicSlider) {
        musicSlider.value = bgMusic.volume * 100;
        musicSlider.addEventListener('input', () => {
            bgMusic.volume = musicSlider.value / 100;
        });
    }

    // ─── LANGUAGE TOGGLE (EN/VI) ─────────────────────
    const i18n = {
        vi: {
            'nav.about': 'Giới thiệu',
            'nav.journey': 'Hành trình',
            'nav.projects': 'Dự án',
            'nav.skills': 'Kỹ năng',
            'nav.blog': 'Blog',
            'nav.contact': 'Liên hệ',
            'nav.cv': 'Tải CV',
            'hero.badge': 'Sẵn sàng cho cơ hội mới',
            'hero.subtitle': 'Data Analyst & ML Engineer xây dựng mô hình dự đoán và dashboard tương tác phục vụ ra quyết định thực tế. Sống tại Hà Nội, Việt Nam.',
            'hero.metric1': 'Dự án hoàn thành',
            'hero.metric2': '$ Dữ liệu phân tích',
            'hero.metric3': 'Bản ghi xử lý',
            'hero.scroll': 'Cuộn để khám phá',
            'about.tag': '01 / Giới thiệu',
            'about.title': 'Giao điểm giữa<br><em>kinh tế</em> & <em>công nghệ</em>',
            'about.lead': 'Tôi không chỉ phân tích con số — tôi khám phá câu chuyện đằng sau dữ liệu và chuyển hóa chúng thành quyết định chiến lược.',
            'about.p1': 'Với nền tảng <strong>Khoa học Máy tính</strong> từ trường THPT Chuyên Vinh (GPA 9.3/10) và hiện đang học <strong>Kinh tế Quốc tế</strong> tại Đại học Ngoại thương, tôi kết hợp chiều sâu kỹ thuật với tư duy kinh doanh.',
            'about.p2': 'Phương pháp của tôi kết hợp thống kê chặt chẽ với kể chuyện trực quan — vì insight không truyền đạt được thì cũng vô nghĩa.',
            'journey.tag': '02 / Hành trình',
            'journey.title': 'Dòng thời gian<br><em>phát triển</em> & <em>cột mốc</em>',
            'projects.tag': '03 / Dự án',
            'projects.title': 'Phân tích chuyên sâu<br>các bài toán <em>thực tế</em>',
            'skills.tag': '04 / Kỹ năng',
            'skills.title': 'Công cụ & công nghệ<br>tôi <em>sử dụng</em>',
            'blog.tag': '05 / Blog',
            'blog.title': 'Kiến thức từ<br>dự án <em>thực tế</em>',
            'resume.tag': '06 / Hồ sơ',
            'resume.title': 'CV <em>tương tác</em>',
            'contact.tag': '07 / Liên hệ',
            'contact.title': 'Hãy cùng xây dựng<br>điều gì đó <em>tuyệt vời</em>'
        },
        en: {
            'nav.about': 'About',
            'nav.journey': 'Journey',
            'nav.projects': 'Case Studies',
            'nav.skills': 'Skills',
            'nav.blog': 'Blog',
            'nav.contact': 'Contact',
            'nav.cv': 'Download CV',
            'hero.badge': 'Available for opportunities',
            'hero.subtitle': 'Data Analyst & ML Engineer building predictive models and interactive dashboards that drive real decisions. Based in Hanoi, Vietnam.',
            'hero.metric1': 'Projects Shipped',
            'hero.metric2': '$ Data Analyzed',
            'hero.metric3': 'Records Processed',
            'hero.scroll': 'Scroll to explore',
            'about.tag': '01 / About',
            'about.title': 'The intersection of<br><em>economics</em> & <em>technology</em>',
            'about.lead': "I don't just analyze numbers — I uncover the stories they tell and translate them into strategic decisions.",
            'about.p1': 'With a foundation in <strong>Computer Science</strong> from Vinh Gifted High School (GPA 9.3/10) and currently studying <strong>International Economics</strong> at Foreign Trade University, I bring a rare blend of technical depth and business acumen.',
            'about.p2': "My approach combines rigorous statistical methods with clear visual storytelling — because insights that can't be communicated are insights wasted.",
            'journey.tag': '02 / Journey',
            'journey.title': 'A timeline of<br><em>growth</em> & <em>milestones</em>',
            'projects.tag': '03 / Case Studies',
            'projects.title': 'Deep dives into<br><em>real</em> problems solved',
            'skills.tag': '04 / Skills',
            'skills.title': 'Tools & technologies<br>I <em>work with</em>',
            'blog.tag': '05 / Blog',
            'blog.title': 'Insights from<br><em>real</em> projects',
            'resume.tag': '06 / Resume',
            'resume.title': 'Interactive <em>CV</em>',
            'contact.tag': '07 / Contact',
            'contact.title': "Let's build<br>something <em>together</em>"
        }
    };

    let currentLang = localStorage.getItem('portfolio-lang') || 'en';
    const langBtns = document.querySelectorAll('.lang-switch__btn');

    function applyLanguage(lang) {
        const dict = i18n[lang];
        if (!dict) return;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (dict[key]) {
                if (el.dataset.i18nHtml) el.innerHTML = dict[key];
                else el.textContent = dict[key];
            }
        });
        langBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
        document.documentElement.lang = lang;
        localStorage.setItem('portfolio-lang', lang);
        currentLang = lang;
    }

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            if (lang === currentLang) return;
            applyLanguage(lang);
            showToast(lang === 'vi' ? 'Đã chuyển sang Tiếng Việt' : 'Switched to English');
        });
    });

    if (currentLang !== 'en') applyLanguage(currentLang);

    // ─── TYPING SUBTITLE ──────────────────────────────
    const sub = document.querySelector('.hero__subtitle');
    if (sub && innerWidth > 768) {
        const txt = sub.textContent; sub.textContent = '';
        let i = 0;
        setTimeout(function type() { if (i < txt.length) { sub.textContent += txt[i++]; setTimeout(type, 16); } }, 1400);
    }

    // ─── DOUBLE-CLICK EASTER EGG ──────────────────────
    document.querySelector('.nav__logo')?.addEventListener('dblclick', () => {
        document.body.style.transition = 'filter 0.5s';
        document.body.style.filter = 'hue-rotate(180deg)';
        showToast('Easter egg! Double-click again to reset');
        setTimeout(() => { document.body.style.filter = ''; setTimeout(() => document.body.style.transition = '', 500); }, 2000);
    });

    // ─── COPY EMAIL ON CLICK ──────────────────────────
    document.addEventListener('click', e => {
        const el = e.target.closest('a[href^="mailto:"]');
        if (!el) return;
        e.preventDefault();
        const email = el.href.replace('mailto:', '');
        navigator.clipboard.writeText(email).then(() => showToast('Email copied to clipboard!')).catch(() => { window.location.href = el.href; });
    });

    // ─── HOVER SOUND (lightweight) ────────────────────
    let audioCtx, audioBuffer;
    function playTick() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.frequency.value = 4200;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.012, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
        osc.start(); osc.stop(audioCtx.currentTime + 0.04);
    }
    document.addEventListener('mouseover', e => {
        if (e.target.closest('.nav__link, .fab-menu__btn, .hero__socials a')) playTick();
    }, {passive: true});

    // ─── STARS BACKGROUND ─────────────────────────────
    const starsCanvas = document.getElementById('starsCanvas');
    if (starsCanvas) {
        const sCtx = starsCanvas.getContext('2d');
        let sW, sH, stars = [], shootingStars = [];
        const STAR_COUNT = 200;
        const SHOOTING_INTERVAL = 4000;

        function resizeStars() {
            const dpr = Math.min(devicePixelRatio, 2);
            sW = window.innerWidth;
            sH = window.innerHeight;
            starsCanvas.width = sW * dpr;
            starsCanvas.height = sH * dpr;
            sCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function initStars() {
            stars = [];
            for (let i = 0; i < STAR_COUNT; i++) {
                stars.push({
                    x: Math.random() * sW,
                    y: Math.random() * sH,
                    r: Math.random() * 1.2 + 0.3,
                    alpha: Math.random() * 0.8 + 0.2,
                    twinkleSpeed: Math.random() * 0.02 + 0.005,
                    twinkleOffset: Math.random() * Math.PI * 2,
                    drift: (Math.random() - 0.5) * 0.05
                });
            }
        }

        function spawnShootingStar() {
            shootingStars.push({
                x: Math.random() * sW * 0.8,
                y: Math.random() * sH * 0.3,
                len: Math.random() * 80 + 40,
                speed: Math.random() * 8 + 6,
                angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
                alpha: 1,
                life: 0
            });
        }

        let lastShoot = 0;
        function drawStars(time) {
            sCtx.clearRect(0, 0, sW, sH);

            for (const s of stars) {
                const twinkle = Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.4 + 0.6;
                sCtx.beginPath();
                sCtx.arc(s.x, s.y, s.r, 0, 6.28);
                sCtx.fillStyle = `rgba(255,255,255,${s.alpha * twinkle})`;
                sCtx.fill();
                s.y += s.drift;
                if (s.y > sH) s.y = 0;
                if (s.y < 0) s.y = sH;
            }

            if (time - lastShoot > SHOOTING_INTERVAL) {
                spawnShootingStar();
                lastShoot = time;
            }

            for (let i = shootingStars.length - 1; i >= 0; i--) {
                const ss = shootingStars[i];
                ss.life++;
                ss.x += Math.cos(ss.angle) * ss.speed;
                ss.y += Math.sin(ss.angle) * ss.speed;
                ss.alpha -= 0.015;

                if (ss.alpha <= 0) { shootingStars.splice(i, 1); continue; }

                const tailX = ss.x - Math.cos(ss.angle) * ss.len;
                const tailY = ss.y - Math.sin(ss.angle) * ss.len;
                const grad = sCtx.createLinearGradient(tailX, tailY, ss.x, ss.y);
                grad.addColorStop(0, `rgba(255,255,255,0)`);
                grad.addColorStop(1, `rgba(200,220,255,${ss.alpha})`);
                sCtx.beginPath();
                sCtx.moveTo(tailX, tailY);
                sCtx.lineTo(ss.x, ss.y);
                sCtx.strokeStyle = grad;
                sCtx.lineWidth = 1.5;
                sCtx.stroke();

                sCtx.beginPath();
                sCtx.arc(ss.x, ss.y, 2, 0, 6.28);
                sCtx.fillStyle = `rgba(220,240,255,${ss.alpha})`;
                sCtx.fill();
            }

            requestAnimationFrame(drawStars);
        }

        resizeStars();
        initStars();
        requestAnimationFrame(drawStars);
        window.addEventListener('resize', () => { resizeStars(); initStars(); });
    }

    // ─── PRELOADER ────────────────────────────────────
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => preloader?.classList.add('preloader--done'), 1600);
    });

    // ─── INIT ─────────────────────────────────────────
    onScroll();

    setTimeout(() => {
        showToast('Press 1–7 to navigate sections • T to toggle theme');
    }, 4000);

})();
