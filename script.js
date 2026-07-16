/* ==========================================================================
   PREMIUM PORTFOLIO — SCRIPT
   Vanilla JS only. Organized by feature. Each block is self-contained
   and guarded so the page still works if an element is missing.
   ========================================================================== */

const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --------------------------------------------------------------------------
   1. CUSTOM CURSOR (dot + glow ring, follows mouse, scales on hover)
   -------------------------------------------------------------------------- */
(function cursor() {
  if (isTouch) return;
  const dot = document.getElementById('cursorDot');
  const glow = document.getElementById('cursorGlow');
  if (!dot || !glow) return;

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let glowX = mouseX, glowY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  // Glow trails slightly behind the dot for a soft "glow" feel
  function raf() {
    glowX += (mouseX - glowX) * 0.16;
    glowY += (mouseY - glowY) * 0.16;
    glow.style.left = glowX + 'px';
    glow.style.top = glowY + 'px';
    requestAnimationFrame(raf);
  }
  raf();

  // Hover states: scale cursor up on interactive elements
  const hoverTargets = document.querySelectorAll('a, button, .tilt-card, input, textarea');
  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Invert cursor color on dark sections (hero is now a black section too)
  const darkSections = document.querySelectorAll('.hero, .work, .contact, .footer');
  const darkObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) document.body.classList.add('cursor-dark');
    });
  }, { threshold: 0.4 });
  darkSections.forEach((s) => darkObserver.observe(s));

  const lightObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) document.body.classList.remove('cursor-dark');
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.about, .skills, .services, .testimonials, .timeline, .dev-projects')
    .forEach((s) => lightObserver.observe(s));
})();

/* --------------------------------------------------------------------------
   2. SCROLL PROGRESS BAR
   -------------------------------------------------------------------------- */
(function scrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  function update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* --------------------------------------------------------------------------
   3. STICKY NAV: background on scroll + active section indicator
   -------------------------------------------------------------------------- */
(function nav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  const links = document.querySelectorAll('.nav-links a[data-section]');
  const sections = Array.from(links).map((l) => document.getElementById(l.dataset.section)).filter(Boolean);

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const link = document.querySelector(`.nav-links a[data-section="${entry.target.id}"]`);
      if (!link) return;
      if (entry.isIntersecting) {
        links.forEach((l) => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  sections.forEach((s) => navObserver.observe(s));

  // Mobile burger toggle (simple show/hide of a full-screen menu built on the fly)
  const burger = document.getElementById('navBurger');
  const navLinksEl = document.getElementById('navLinks');
  if (burger && navLinksEl) {
    burger.addEventListener('click', () => {
      const open = navLinksEl.classList.toggle('mobile-open');
      burger.classList.toggle('open', open);
      if (open) {
        Object.assign(navLinksEl.style, {
          display: 'flex', position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: '#FFFFFF', zIndex: '850', fontSize: '1.4rem', gap: '2rem',
        });
      } else {
        navLinksEl.removeAttribute('style');
      }
    });
    navLinksEl.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
      navLinksEl.classList.remove('mobile-open');
      navLinksEl.removeAttribute('style');
      burger.classList.remove('open');
    }));
  }
})();

/* --------------------------------------------------------------------------
   4. SCROLL REVEAL (fade/slide up + line reveal) via IntersectionObserver
   -------------------------------------------------------------------------- */
(function scrollReveal() {
  const targets = document.querySelectorAll('.reveal-up, .reveal-line, .timeline-item');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings that enter around the same time
        setTimeout(() => entry.target.classList.add('in-view'), i * 40);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

  targets.forEach((t) => observer.observe(t));
})();

/* --------------------------------------------------------------------------
   5. ANIMATED COUNTER (stats: Years / Projects / Clients)
   -------------------------------------------------------------------------- */
(function counters() {
  const nums = document.querySelectorAll('.stat-number[data-count]');
  if (!nums.length) return;

  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1600;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  nums.forEach((n) => observer.observe(n));
})();

/* --------------------------------------------------------------------------
   6. SKILL BARS (animate width when visible)
   -------------------------------------------------------------------------- */
(function skillBars() {
  const bars = document.querySelectorAll('.skill-fill[data-level]');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const level = entry.target.dataset.level;
        requestAnimationFrame(() => { entry.target.style.width = level + '%'; });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  bars.forEach((b) => observer.observe(b));
})();

/* --------------------------------------------------------------------------
   7. MAGNETIC BUTTONS (pull toward cursor within a radius)
   -------------------------------------------------------------------------- */
(function magnetic() {
  if (isTouch || prefersReducedMotion) return;
  const items = document.querySelectorAll('.magnetic');

  items.forEach((el) => {
    let bounds;
    el.addEventListener('mouseenter', () => { bounds = el.getBoundingClientRect(); });
    el.addEventListener('mousemove', (e) => {
      if (!bounds) bounds = el.getBoundingClientRect();
      const relX = e.clientX - bounds.left - bounds.width / 2;
      const relY = e.clientY - bounds.top - bounds.height / 2;
      el.style.transform = `translate(${relX * 0.28}px, ${relY * 0.35}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = 'translate(0,0)'; });
  });
})();

/* --------------------------------------------------------------------------
   8. TILT CARDS (3D perspective tilt following mouse position)
   -------------------------------------------------------------------------- */
(function tilt() {
  if (isTouch || prefersReducedMotion) return;
  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;  // 0-1
      const py = (e.clientY - rect.top) / rect.height;  // 0-1
      const ry = (px - 0.5) * 14; // rotateY
      const rx = (0.5 - py) * 14; // rotateX
      card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
      card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
})();

/* --------------------------------------------------------------------------
   9. PARALLAX FLOATING SHAPES (hero background) — mouse + scroll driven
   -------------------------------------------------------------------------- */
(function parallax() {
  if (prefersReducedMotion) return;
  const shapes = document.querySelectorAll('.floating-shape');
  if (!shapes.length) return;

  let mx = 0, my = 0;
  if (!isTouch) {
    window.addEventListener('mousemove', (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  function apply() {
    const scrollY = window.scrollY;
    shapes.forEach((shape) => {
      const speed = parseFloat(shape.dataset.speed) || 0.3;
      const sx = mx * 22 * speed;
      const sy = my * 22 * speed + scrollY * speed * 0.15;
      shape.style.transform = `translate(${sx}px, ${sy}px) rotate(${scrollY * 0.02 * speed}deg)`;
    });
    requestAnimationFrame(apply);
  }
  requestAnimationFrame(apply);
})();

/* --------------------------------------------------------------------------
   10. TESTIMONIALS SLIDER
   -------------------------------------------------------------------------- */
(function testimonialSlider() {
  const track = document.getElementById('testiTrack');
  const dotsWrap = document.getElementById('testiDots');
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');
  if (!track || !dotsWrap) return;

  const slides = track.children;
  let index = 0;
  let autoTimer;

  for (let i = 0; i < slides.length; i++) {
    const dot = document.createElement('span');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  }
  const dots = dotsWrap.querySelectorAll('.testi-dot');

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle('active', di === index));
    restartAuto();
  }

  function restartAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(index + 1), 6000);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(index - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(index + 1));

  restartAuto();
})();

/* --------------------------------------------------------------------------
   11. TIMELINE PROGRESS LINE (fills as user scrolls through the section)
   -------------------------------------------------------------------------- */
(function timelineFill() {
  const wrap = document.querySelector('.timeline-list');
  const fill = document.getElementById('timelineFill');
  if (!wrap || !fill) return;

  function update() {
    const rect = wrap.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const total = rect.height;
    const visible = Math.min(Math.max(viewportH * 0.6 - rect.top, 0), total);
    const pct = total > 0 ? (visible / total) * 100 : 0;
    fill.style.height = pct + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* --------------------------------------------------------------------------
   12. CONTACT FORM (front-end only demo submission)
   -------------------------------------------------------------------------- */
(function contactForm() {
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  if (!form || !note) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('.form-submit span');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';

    // NOTE: wire this up to your own backend, form service (e.g. Formspree),
    // or mailto: link — this demo just simulates a send.
    setTimeout(() => {
      submitBtn.textContent = originalText;
      note.textContent = 'Thanks — your message has been noted. I\'ll reply soon.';
      form.reset();
    }, 900);
  });
})();

/* --------------------------------------------------------------------------
   13. BACK TO TOP + FOOTER YEAR
   -------------------------------------------------------------------------- */
(function footer() {
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const topBtn = document.getElementById('backToTop');
  if (topBtn) {
    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();

/* --------------------------------------------------------------------------
   14. SMOOTH ANCHOR SCROLL (accounts for fixed nav height)
   -------------------------------------------------------------------------- */
(function anchorScroll() {
  const navHeight = 90;
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
