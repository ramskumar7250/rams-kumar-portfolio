'use strict';
(function() {
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const isTouch = () => window.matchMedia('(pointer:coarse)').matches;

  // Year
  const yrEl = document.getElementById('yr');
  if (yrEl) yrEl.textContent = new Date().getFullYear();

  // Touch class
  if (isTouch()) document.body.classList.add('touch');

  // Header scroll hide/show and shrink
  const hdr = document.getElementById('hdr');
  if (hdr) {
    let prevY = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > 40) {
        hdr.classList.add('scrolled');
      } else {
        hdr.classList.remove('scrolled');
      }

      if (y < 80) {
        hdr.classList.remove('hide');
      } else if (y > prevY + 6) {
        hdr.classList.add('hide');
      } else if (y < prevY - 6) {
        hdr.classList.remove('hide');
      }
      prevY = y;
    }, { passive: true });
  }

  // Active nav link based on page
  const page = document.documentElement.getAttribute('data-page');
  if (page) {
    $$('.nav-links a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === page + '.html' || (page === 'index' && (href === 'index.html' || href === './' || href === '/'))) {
        a.classList.add('active');
      }
    });
  }

  // Mobile menu open / close
  const hamBtn = document.getElementById('hamBtn');
  const mobMenu = document.getElementById('mobMenu');
  if (hamBtn && mobMenu) {
    let menuOpen = false;
    function openMenu() {
      menuOpen = true;
      mobMenu.classList.add('open');
      hamBtn.classList.add('open');
      hamBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      menuOpen = false;
      mobMenu.classList.remove('open');
      hamBtn.classList.remove('open');
      hamBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    window.closeMenu = closeMenu;
    hamBtn.addEventListener('click', () => menuOpen ? closeMenu() : openMenu());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuOpen) closeMenu();
    });
  }

  // FAQ Accordion
  $$('.faq-question').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const item = btn.closest('.faq-item');
      if (!item) return;
      const isOpen = item.classList.contains('open');

      // Close all other items
      $$('.faq-item').forEach(el => {
        if (el !== item) {
          el.classList.remove('open');
          const q = el.querySelector('.faq-question');
          if (q) q.setAttribute('aria-expanded', 'false');
          const ic = el.querySelector('.faq-icon');
          if (ic) ic.textContent = '+';
        }
      });

      // Toggle current item
      const icon = item.querySelector('.faq-icon');
      if (isOpen) {
        item.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        if (icon) icon.textContent = '+';
      } else {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        if (icon) icon.textContent = '−';
      }
    });
  });

  // Console signature
  console.log('%cRAM\'S.KUMAR%c\nRam Kumar Rai — Web Developer & UI/UX Designer\nDesigned with authentic intention.', 'background:#4D0E13;color:#EEE4DA;padding:6px 14px;border-radius:4px;font-size:13px;font-weight:700;', 'color:#C8A49F;font-size:11px;');
})();
