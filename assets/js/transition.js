'use strict';
(function(){
  const overlay = document.getElementById('pt-overlay');
  if (!overlay) return;
  // Ensure overlay is dismissed cleanly on load
  if (overlay.classList.contains('pt-in')) {
    overlay.classList.remove('pt-in');
  }
  overlay.style.transform = 'translateY(-100%)';
})();
