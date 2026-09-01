'use strict';
(function() {
  const html = document.documentElement;

  // 1. Read theme from localStorage or system preference
  function getPreferredTheme() {
    const saved = localStorage.getItem('rk-theme');
    if (saved === 'night' || saved === 'day') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'night';
    }
    return 'day';
  }

  const initialTheme = getPreferredTheme();
  html.setAttribute('data-theme', initialTheme);

  // 2. Function to toggle theme reliably
  function toggleTheme() {
    const current = html.getAttribute('data-theme') || 'day';
    const next = current === 'night' ? 'day' : 'night';
    html.setAttribute('data-theme', next);
    localStorage.setItem('rk-theme', next);
    updateToggleButtons(next);
  }

  function updateToggleButtons(theme) {
    const buttons = document.querySelectorAll('#dnBtn, .dns');
    buttons.forEach(btn => {
      btn.setAttribute('aria-pressed', theme === 'night' ? 'true' : 'false');
    });
  }

  // 3. Attach listeners when DOM is interactive or loaded
  function initThemeControls() {
    const current = html.getAttribute('data-theme') || 'day';
    updateToggleButtons(current);

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#dnBtn, .dns');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        toggleTheme();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeControls);
  } else {
    initThemeControls();
  }

  window.toggleTheme = toggleTheme;
})();
