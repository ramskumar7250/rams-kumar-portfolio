'use strict';
(function() {
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const statusEl = document.getElementById('formStatus');
    const submitBtn = document.getElementById('formSubmitBtn');
    const TARGET_PHONE = '917250671023'; // Target WhatsApp: +91 7250 671023

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = form.elements['name'] ? form.elements['name'].value.trim() : '';
      const email = form.elements['email'] ? form.elements['email'].value.trim() : '';
      const phone = form.elements['phone'] ? form.elements['phone'].value.trim() : '';
      const projectType = form.elements['projectType'] ? form.elements['projectType'].value : 'General Inquiry';
      const budget = form.elements['budget'] ? form.elements['budget'].value : 'Not specified';
      const message = form.elements['message'] ? form.elements['message'].value.trim() : '';

      if (!name || !email || !message) {
        showStatus('Please fill in all required fields (Name, Email, Message).', 'error');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Preparing WhatsApp message...';
      }

      // Build formatted inquiry text
      const waText = `New Portfolio Inquiry\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nProject Type: ${projectType}\nBudget: ${budget || 'Not specified'}\nMessage: ${message}\n\nSource: RAM'S.KUMAR Portfolio`;
      const encodedWaUrl = `https://wa.me/${TARGET_PHONE}?text=${encodeURIComponent(waText)}`;

      // Also dispatch to backend server if available
      try {
        fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, projectType, budget, message })
        }).catch(() => {});
      } catch (err) {}

      showStatus('Opening WhatsApp to send your inquiry directly to Ram Kumar Rai...', 'success');

      setTimeout(() => {
        window.open(encodedWaUrl, '_blank', 'noopener,noreferrer');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send via WhatsApp';
        }
      }, 700);
    });

    function showStatus(text, type) {
      if (!statusEl) return;
      statusEl.textContent = text;
      statusEl.className = 'form-status ' + type;
      statusEl.style.display = 'block';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
  } else {
    initContactForm();
  }
})();
