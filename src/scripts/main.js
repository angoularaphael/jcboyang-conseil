document.addEventListener('DOMContentLoaded', () => {
  /* --- Custom Cursor --- */
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (dot && ring && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; });
    (function loop() { rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15; ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; requestAnimationFrame(loop); })();
    document.querySelectorAll('a,button,input,textarea,select,.gallery-item,.service-card,.faq-item,.testimonial-card,.pain-card').forEach(el => {
      el.addEventListener('mouseenter', () => { dot.style.width = '14px'; dot.style.height = '14px'; dot.style.background = 'rgba(212,167,98,0.5)'; ring.style.width = '50px'; ring.style.height = '50px'; ring.style.opacity = '0.3'; });
      el.addEventListener('mouseleave', () => { dot.style.width = '8px'; dot.style.height = '8px'; dot.style.background = '#d4a762'; ring.style.width = '36px'; ring.style.height = '36px'; ring.style.opacity = '0.5'; });
    });
  }

  /* --- Header scroll --- */
  const header = document.getElementById('header');
  const backToTop = document.getElementById('backToTop');
  const stickyCta = document.getElementById('stickyCta');
  const isHome = window.location.pathname === '/' || window.location.pathname === '';
  function onScroll() {
    const y = window.scrollY;
    if (header) {
      if (y > 80 || !isHome) { header.style.background = 'rgba(11,31,58,0.95)'; header.style.backdropFilter = 'blur(20px)'; header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'; header.style.paddingTop = '10px'; header.style.paddingBottom = '10px'; }
      else { header.style.background = 'transparent'; header.style.backdropFilter = 'none'; header.style.boxShadow = 'none'; header.style.paddingTop = ''; header.style.paddingBottom = ''; }
    }
    if (backToTop) { const show = y > 500; backToTop.style.opacity = show ? '1' : '0'; backToTop.style.visibility = show ? 'visible' : 'hidden'; backToTop.style.transform = show ? 'translateY(0)' : 'translateY(20px)'; }
    if (stickyCta) stickyCta.style.transform = y > 600 ? 'translateY(0)' : 'translateY(100%)';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* --- Mobile nav --- */
  const toggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const burger1 = document.getElementById('burger1');
  const burger2 = document.getElementById('burger2');
  const burger3 = document.getElementById('burger3');
  let menuOpen = false;

  function openMobileMenu() {
    menuOpen = true;
    mobileMenu.style.opacity = '1'; mobileMenu.style.visibility = 'visible';
    if (burger1) { burger1.style.transform = 'rotate(45deg) translate(4px, 4px)'; }
    if (burger2) { burger2.style.opacity = '0'; }
    if (burger3) { burger3.style.transform = 'rotate(-45deg) translate(4px, -4px)'; }
    document.body.style.overflow = 'hidden';
    toggle.setAttribute('aria-expanded', 'true');
  }
  function closeMobileMenu() {
    menuOpen = false;
    mobileMenu.style.opacity = '0'; mobileMenu.style.visibility = 'hidden';
    if (burger1) { burger1.style.transform = ''; }
    if (burger2) { burger2.style.opacity = '1'; }
    if (burger3) { burger3.style.transform = ''; }
    document.body.style.overflow = '';
    toggle.setAttribute('aria-expanded', 'false');
  }

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => { menuOpen ? closeMobileMenu() : openMobileMenu(); });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));
  }

  /* --- Active nav on scroll --- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  function updateNav() {
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur = s.id; });
    navLinks.forEach(l => { const active = l.getAttribute('href') === '#' + cur; l.style.color = active ? '#d4a762' : ''; });
  }
  window.addEventListener('scroll', updateNav, { passive: true });

  /* --- Counter animation --- */
  let counted = false;
  function animateCounters() {
    if (counted) return; counted = true;
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = +el.dataset.count, dur = 2000, step = target / (dur / 16);
      let cur = 0;
      (function tick() { cur += step; if (cur >= target) { el.textContent = target; return; } el.textContent = Math.floor(cur); requestAnimationFrame(tick); })();
    });
  }

  /* --- Scroll animations --- */
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = e.target.dataset.delay || 0;
        setTimeout(() => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0) translateX(0) scale(1)'; }, +delay);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-animate]').forEach(el => {
    const type = el.dataset.animate;
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    if (type === 'fade-up') el.style.transform = 'translateY(30px)';
    else if (type === 'fade-down') el.style.transform = 'translateY(-30px)';
    else if (type === 'fade-right') el.style.transform = 'translateX(-40px)';
    else if (type === 'fade-left') el.style.transform = 'translateX(40px)';
    else if (type === 'zoom-in') el.style.transform = 'scale(0.9)';
    obs.observe(el);
  });

  /* Counter observer */
  const heroStats = document.querySelector('[data-count]');
  if (heroStats) {
    new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) animateCounters(); }), { threshold: 0.5 }).observe(heroStats.parentElement.parentElement);
  }

  /* --- FAQ Accordion --- */
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-question').addEventListener('click', () => {
      const active = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => { i.classList.remove('active'); i.querySelector('.faq-answer').style.maxHeight = '0'; i.querySelector('.faq-chevron').style.transform = ''; i.querySelector('.faq-question').setAttribute('aria-expanded', 'false'); });
      if (!active) { item.classList.add('active'); item.querySelector('.faq-answer').style.maxHeight = '300px'; item.querySelector('.faq-chevron').style.transform = 'rotate(180deg)'; item.querySelector('.faq-question').setAttribute('aria-expanded', 'true'); }
    });
  });

  /* --- Gallery Filter --- */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => { b.classList.remove('bg-gold', 'text-navy'); b.classList.add('border', 'border-gold/30', 'text-white/50'); });
      btn.classList.add('bg-gold', 'text-navy'); btn.classList.remove('border', 'border-gold/30', 'text-white/50');
      const f = btn.dataset.filter;
      document.querySelectorAll('.gallery-item').forEach(item => { item.style.display = (f === 'all' || item.dataset.category === f) ? '' : 'none'; });
    });
  });

  /* --- Lightbox --- */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  let lbItems = [], lbIdx = 0;
  let lbOpen = false;
  function openLB(idx) { lbItems = Array.from(document.querySelectorAll('.gallery-item')).filter(i => i.style.display !== 'none').map(i => i.querySelector('img').src); lbIdx = idx; lbImg.src = lbItems[lbIdx]; lb.style.opacity = '1'; lb.style.visibility = 'visible'; lbOpen = true; document.body.style.overflow = 'hidden'; }
  function closeLB() { lb.style.opacity = '0'; lb.style.visibility = 'hidden'; lbOpen = false; document.body.style.overflow = ''; }
  document.querySelectorAll('.gallery-item').forEach((item, i) => item.addEventListener('click', () => { const vis = Array.from(document.querySelectorAll('.gallery-item')).filter(x => x.style.display !== 'none'); openLB(vis.indexOf(item)); }));
  if (lb) {
    lb.querySelector('.lightbox-close').addEventListener('click', closeLB);
    lb.querySelector('.lightbox-prev').addEventListener('click', () => { lbIdx = (lbIdx - 1 + lbItems.length) % lbItems.length; lbImg.src = lbItems[lbIdx]; });
    lb.querySelector('.lightbox-next').addEventListener('click', () => { lbIdx = (lbIdx + 1) % lbItems.length; lbImg.src = lbItems[lbIdx]; });
    lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
    document.addEventListener('keydown', e => { if (!lbOpen) return; if (e.key === 'Escape') closeLB(); if (e.key === 'ArrowLeft') { lbIdx = (lbIdx - 1 + lbItems.length) % lbItems.length; lbImg.src = lbItems[lbIdx]; } if (e.key === 'ArrowRight') { lbIdx = (lbIdx + 1) % lbItems.length; lbImg.src = lbItems[lbIdx]; } });
  }

  /* --- Contact Form --- */
  const form = document.getElementById('contactForm');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const phone = form.querySelector('#phone').value.trim();
    if (!name || !email || !phone) { alert('Veuillez remplir les champs obligatoires.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Email invalide.'); return; }
    const btn = form.querySelector('button[type="submit"]');
    btn.innerHTML = '<span>Demande envoyée !</span>'; btn.style.background = '#22c55e';
    setTimeout(() => { btn.innerHTML = '<span>Réserver mon audit gratuit</span>'; btn.style.background = ''; form.reset(); }, 3500);
  });

  /* --- Smooth scroll --- */
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', function (e) { e.preventDefault(); const t = document.querySelector(this.getAttribute('href')); if (t) t.scrollIntoView({ behavior: 'smooth' }); }));
});
