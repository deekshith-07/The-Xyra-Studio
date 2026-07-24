/* ==========================================================================
   THE XYRA STUDIO — script.js
   Preloader, smooth scroll, GSAP reveals, nav, portfolio filter,
   accordion, testimonial slider, stats counter, form handling.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     Lucide icons
  --------------------------------------------------------------------- */
  if (window.lucide) lucide.createIcons();

  /* ---------------------------------------------------------------------
     Preloader
  --------------------------------------------------------------------- */
  (function preloader() {
    const preloader = document.getElementById('preloader');
    const fill = document.getElementById('preloaderFill');
    const pct = document.getElementById('preloaderPct');
    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 18;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        fill.style.width = progress + '%';
        pct.textContent = '100%';
        setTimeout(() => {
          preloader.classList.add('loaded');
          document.body.style.overflow = '';
          revealOnLoad();
        }, 350);
        return;
      }
      fill.style.width = progress + '%';
      pct.textContent = Math.floor(progress) + '%';
    }, 140);

    document.body.style.overflow = 'hidden';
  })();

  /* ---------------------------------------------------------------------
     Lenis smooth scroll
  --------------------------------------------------------------------- */
  let lenis;
  if (window.Lenis && !prefersReducedMotion) {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ---------------------------------------------------------------------
     Navbar scroll state + active link + mobile menu
  --------------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  /* Highlight the current page in the nav (desktop + mobile) */
  (function setActiveNav() {
    const current = (location.pathname.split('/').pop() || 'index.html');
    document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === current || (current === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  })();

  /* Same-tab fade transition between pages (never opens a new tab) */
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    if (link.target === '_blank') return;
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      const isSamePage = href === (location.pathname.split('/').pop() || 'index.html');
      if (isSamePage || prefersReducedMotion) return;
      e.preventDefault();
      document.body.classList.add('page-leaving');
      setTimeout(() => { window.location.href = href; }, 320);
    });
  });

  const menuBtn = document.getElementById('menuBtn');
  const menuCloseBtn = document.getElementById('menuCloseBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  menuBtn?.addEventListener('click', () => {
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
  menuCloseBtn?.addEventListener('click', closeMobileMenu);
  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));

  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ---------------------------------------------------------------------
     Cursor glow (desktop only)
  --------------------------------------------------------------------- */
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });
  }

  /* ---------------------------------------------------------------------
     Button ripple effect
  --------------------------------------------------------------------- */
  document.querySelectorAll('.btn-primary, .btn-glass, .btn-primary-sm, .btn-glass-sm').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* ---------------------------------------------------------------------
     Scroll reveal (GSAP ScrollTrigger if available, else IntersectionObserver)
  --------------------------------------------------------------------- */
  function initScrollReveal() {
    const targets = document.querySelectorAll('[data-reveal]');
    if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
      gsap.registerPlugin(ScrollTrigger);
      targets.forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, y: 28 },
          {
            opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%' }
          }
        );
      });
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      targets.forEach(el => io.observe(el));
    }
  }

  function revealOnLoad() {
    initScrollReveal();
    initHeroReveal();
    initStatsCounter();
  }

  /* ---------------------------------------------------------------------
     Hero text reveal
  --------------------------------------------------------------------- */
  function initHeroReveal() {
    if (window.gsap && !prefersReducedMotion) {
      gsap.fromTo('.reveal-line span',
        { yPercent: 120 },
        { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.12, delay: 0.15 }
      );
    }
  }

  /* ---------------------------------------------------------------------
     Animated stats counter
  --------------------------------------------------------------------- */
  function initStatsCounter() {
    const counters = document.querySelectorAll('.stat-number');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => io.observe(c));
  }

  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
  }

  /* ---------------------------------------------------------------------
     Portfolio filter
  --------------------------------------------------------------------- */
  const filterGroup = document.getElementById('filterGroup');

  filterGroup?.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    filterGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');

    // Query live (not cached) so this still works after cms.js swaps in admin-managed cards
    document.querySelectorAll('.portfolio-card').forEach(card => {
      const match = filter === 'all' || card.getAttribute('data-category') === filter;
      card.classList.toggle('hide', !match);
    });
  });

  /* ---------------------------------------------------------------------
     FAQ accordion
  --------------------------------------------------------------------- */
  const faqList = document.getElementById('faqList');
  faqList?.addEventListener('click', (e) => {
    const question = e.target.closest('.faq-question');
    if (!question) return;
    const item = question.closest('.faq-item');
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('open');

    faqList.querySelectorAll('.faq-item.open').forEach(openItem => {
      if (openItem !== item) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-answer').style.maxHeight = null;
      }
    });

    if (isOpen) {
      item.classList.remove('open');
      answer.style.maxHeight = null;
    } else {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });

  /* ---------------------------------------------------------------------
     Testimonial slider (Swiper) — only runs if the slider exists on this page
  --------------------------------------------------------------------- */
  if (window.Swiper && document.querySelector('.testimonialSwiper')) {
    new Swiper('.testimonialSwiper', {
      loop: true,
      autoHeight: true,
      spaceBetween: 24,
      autoplay: { delay: 5500, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true }
    });
  }

  /* ---------------------------------------------------------------------
     Contact form (client-side handling — connect to backend/Formspree etc.)
  --------------------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }
    // TODO: wire this up to your form backend (Formspree, GoDaddy email relay, etc.)
    formStatus.classList.remove('hidden');
    contactForm.reset();
    setTimeout(() => formStatus.classList.add('hidden'), 6000);
  });

  const newsletterForm = document.getElementById('newsletterForm');
  newsletterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = newsletterForm.querySelector('input');
    input.value = '';
    input.placeholder = 'Subscribed ✓';
    setTimeout(() => { input.placeholder = 'you@email.com'; }, 3000);
  });

  /* ---------------------------------------------------------------------
     Footer year
  --------------------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     Smooth in-page anchor scrolling for browsers without Lenis
  --------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(target, { offset: -20 });
          } else {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  });

  /* Fallback: if GSAP/Lenis fail to load (offline CDN), still reveal content */
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('revealed'));
    }, 4000);
  });

});
