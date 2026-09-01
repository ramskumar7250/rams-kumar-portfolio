'use strict';
(function() {
  const btn = document.getElementById('aiBtn');
  const drawer = document.getElementById('aiDrawer');
  const closeBtn = document.getElementById('aiCloseBtn');
  const sendBtn = document.getElementById('aiSendBtn');
  const input = document.getElementById('aiInput');
  const messagesContainer = document.getElementById('aiMessages');
  const chips = document.querySelectorAll('.ai-chip');

  if (!btn || !drawer) return;

  let isOpen = false;
  let history = [];

  function toggleDrawer() {
    isOpen = !isOpen;
    if (isOpen) {
      drawer.classList.add('open');
      btn.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      if (input) input.focus();
    } else {
      drawer.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDrawer();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isOpen = true;
      toggleDrawer();
    });
  }

  document.addEventListener('click', (e) => {
    if (isOpen && !drawer.contains(e.target) && !btn.contains(e.target)) {
      isOpen = true;
      toggleDrawer();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      isOpen = true;
      toggleDrawer();
    }
  });

  function appendMessage(text, sender = 'bot') {
    if (!messagesContainer) return;
    const msg = document.createElement('div');
    msg.className = 'ai-msg ' + sender;
    msg.textContent = text;
    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  async function handleSend(text) {
    const query = text || (input ? input.value.trim() : '');
    if (!query) return;

    if (input) input.value = '';
    appendMessage(query, 'user');
    history.push({ role: 'user', content: query });

    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'ai-msg bot';
    typing.textContent = 'Thinking...';
    if (messagesContainer) {
      messagesContainer.appendChild(typing);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, history })
      });

      if (typing.parentNode) typing.parentNode.removeChild(typing);

      if (res.ok) {
        const data = await res.json();
        const reply = data.reply || "I'm here to assist with information about Ram Kumar's work.";
        appendMessage(reply, 'bot');
        history.push({ role: 'assistant', content: reply });
      } else {
        appendFallback(query);
      }
    } catch (err) {
      if (typing.parentNode) typing.parentNode.removeChild(typing);
      appendFallback(query);
    }
  }

  function appendFallback(query) {
    const q = query.toLowerCase();
    let reply = "Ram Kumar Rai (RAM'S.KUMAR) is a Web Developer, UI/UX Designer, and Digital Creator. You can contact him at marva.app@gmail.com or WhatsApp +91 7250671023.";
    if (q.includes('project') || q.includes('work')) {
      reply = "Ram's confirmed projects include UdaanPlay (streaming UX concept), NotesCrush / RAM'S.EDITION, RAM'S.brainrun, MARBHA (dignified marriage marketplace concept), RAM's.Mart, and MithilaArtShop.";
    } else if (q.includes('skill') || q.includes('stack')) {
      reply = "Ram specializes in HTML, CSS, JavaScript, React, Responsive Design, UI/UX Design (Figma), Flutter, and Firebase.";
    } else if (q.includes('contact') || q.includes('email') || q.includes('whatsapp')) {
      reply = "Direct Contact: Email marva.app@gmail.com | WhatsApp +91 7250671023.";
    }
    appendMessage(reply, 'bot');
    history.push({ role: 'assistant', content: reply });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', () => handleSend());
  }

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
    });
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      handleSend(chip.textContent.trim());
    });
  });
})();
