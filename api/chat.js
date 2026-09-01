const https = require('https');

const PORTFOLIO_KNOWLEDGE = `
Identity & Positioning:
- Name: Ram Kumar Rai / RAM'S.KUMAR
- Professional Roles: Web Developer, UI/UX Designer, Digital Creator
- Location: India
- Contact Email: marva.app@gmail.com
- Contact WhatsApp: +91 7250671023
- Direct Website: https://rams-kumar.vercel.app
- Philosophy: "Design with intention. Build with technology. Create with purpose."

Background & Journey:
- Foundation: Sales & Marketing, B2B sales, client relations, lead generation, consumer psychology and human decision-making.
- Transition: Digital design and web development — building interfaces and web applications that serve real human needs.
- Present: RAM'S.KUMAR — combining business insight with modern design and technology to create thoughtful digital experiences.

Skills (Authentic ratings):
- Web: HTML (Experienced), CSS (Experienced), JavaScript (Working Knowledge), React (Working Knowledge), Responsive Design (Experienced), Git (Working Knowledge)
- Design: UI/UX Design (Experienced), Figma (Working Knowledge), Visual Design (Experienced), Graphics (Working Knowledge), Prototyping (Working Knowledge), Design Systems (Exploring)
- Applications: Flutter (Working Knowledge), Firebase (Working Knowledge), Web Applications (Working Knowledge)
- Digital: Social Media (Experienced), Content Creation (Experienced), Digital Marketing (Working Knowledge), SEO (Working Knowledge)

Confirmed Real Projects:
1. UdaanPlay — A digital streaming and content discovery platform concept with clean, immersive UX.
2. NotesCrush / RAM'S.EDITION — A curated notes and knowledge organisation platform.
3. RAM'S.brainrun — An interactive digital product focused on cognitive and productivity workflows.
4. MARBHA — A marriage marketplace concept designed with cultural sensitivity and human dignity at its core.
5. RAM's.Mart — Clean, purposeful e-commerce web interface concept.
6. MithilaArtShop — Cultural marketplace celebrating traditional Mithila art.
Additional mentions: BayView Hotel demo, AI Calculator, Ram's.Udaan.

Services Provided:
1. Web Development — Clean, responsive websites, landing pages, and frontend architectures.
2. UI/UX Design — Purposeful, intuitive interfaces and Figma design systems.
3. Web Applications — Functional web apps with modern UX and clean data flow.
4. Digital Product Design — End-to-end product design from concept to prototype.
5. Graphics & Visual Design — Editorial brand assets and digital visuals.
6. Digital Solutions — Strategy combining design, technology, and business thinking.

STRICT AUTHENTICITY RULES:
- Never fabricate clients, companies, revenue, awards, testimonials, years of experience, or fake statistics.
- Direct users to contact Ram via email (marva.app@gmail.com) or WhatsApp (+91 7250671023) for inquiries and collaborations.
`;

function getAuthenticFallback(query) {
  const q = (query || '').toLowerCase();
  if (q.includes('project') || q.includes('work') || q.includes('case') || q.includes('udaan') || q.includes('marbha') || q.includes('notescrush') || q.includes('brainrun') || q.includes('mart') || q.includes('mithila')) {
    return "Ram Kumar's confirmed projects include UdaanPlay (content streaming UX concept), NotesCrush / RAM'S.EDITION (knowledge platform), RAM'S.brainrun (interactive cognitive tools), MARBHA (dignified marriage marketplace concept), RAM's.Mart (e-commerce), and MithilaArtShop (cultural marketplace).";
  }
  if (q.includes('skill') || q.includes('tech') || q.includes('stack') || q.includes('react') || q.includes('figma') || q.includes('css') || q.includes('html') || q.includes('tool')) {
    return "Ram specializes in Web Development (HTML, CSS, JavaScript, React, Responsive Design), UI/UX & Visual Design (Figma, Design Systems, Prototyping), Application Development (Flutter, Firebase), and Digital Creation.";
  }
  if (q.includes('service') || q.includes('offer') || q.includes('hire') || q.includes('help') || q.includes('build')) {
    return "Ram provides services in Web Development, UI/UX Design, Web Applications, Digital Product Design, Graphics & Visual Design, and Digital Solutions.";
  }
  if (q.includes('contact') || q.includes('email') || q.includes('whatsapp') || q.includes('reach') || q.includes('message') || q.includes('talk') || q.includes('phone')) {
    return "You can reach Ram Kumar Rai directly via email at marva.app@gmail.com or on WhatsApp at +91 7250671023. You can also submit the contact form on this site.";
  }
  if (q.includes('who') || q.includes('about') || q.includes('ram') || q.includes('background') || q.includes('experience') || q.includes('role')) {
    return "Ram Kumar Rai (RAM'S.KUMAR) is a Web Developer, UI/UX Designer, and Digital Creator based in India. His foundation in sales, marketing, and human decision-making informs his approach to building clean, purposeful digital products.";
  }
  return "I am RAM'S AI Assistant. I can answer questions about Ram Kumar Rai's background, web development and UI/UX design skills, confirmed projects (UdaanPlay, MARBHA, NotesCrush, BrainRun, RAM's.Mart, MithilaArtShop), and contact details.";
}

function callGroqApi(apiKey, messages, modelName = 'llama-3.3-70b-versatile') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: modelName,
      messages,
      temperature: 0.5,
      max_tokens: 400
    });

    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': 'RAMS-KUMAR-Portfolio/2.0'
      },
      timeout: 15000
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.message?.content;
            if (content) {
              resolve(content.trim());
            } else {
              reject(new Error('Empty content in Groq response'));
            }
          } else {
            console.error(`[GROQ API ERROR ${res.statusCode}]`, data);
            reject(new Error(`Groq API returned HTTP ${res.statusCode}: ${data}`));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Groq API request timed out'));
    });

    req.on('error', err => {
      console.error('[GROQ REQUEST ERROR]', err.message);
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

async function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (req.body && typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return {}; }
  }
  return new Promise(resolve => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 50000) req.destroy();
    });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); } catch (e) { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const data = await parseJsonBody(req);
    const userMessage = (data.message || '').trim();
    const history = Array.isArray(data.history) ? data.history.slice(-6) : [];

    if (!userMessage) {
      res.status(400).json({ error: 'Message cannot be empty.' });
      return;
    }

    // Read API key fresh from process.env on every request
    const apiKey = (
      process.env.GROQ_API_KEY ||
      process.env.GROQ_KEY ||
      process.env.GROQ_API_TOKEN ||
      process.env.GROQ_TOKEN ||
      ''
    ).trim();

    if (apiKey) {
      const messages = [
        {
          role: 'system',
          content: `You are the official AI Assistant for RAM'S.KUMAR (Ram Kumar Rai), a Web Developer, UI/UX Designer, and Digital Creator based in India.
Your role is to assist visitors in exploring Ram Kumar's portfolio, background, real projects, skills, and contact details with an elegant, concise, and luxurious tone.

Strict Rules:
- Answer accurately and concisely using confirmed facts from the knowledge base below.
- If asked to verify API status or say a phrase, comply politely.
- NEVER invent clients, awards, revenue, statistics, fake project results, companies, or fake certifications.
- If asked about something unconfirmed, politely clarify that it is not listed in Ram's official portfolio.
- Encourage serious inquiries to email marva.app@gmail.com or WhatsApp +91 7250671023.

Official Knowledge Base:
${PORTFOLIO_KNOWLEDGE}`
        },
        ...history.map(h => ({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: String(h.content || '').slice(0, 500)
        })),
        { role: 'user', content: userMessage.slice(0, 500) }
      ];

      try {
        const reply = await callGroqApi(apiKey, messages, 'llama-3.3-70b-versatile');
        res.status(200).json({ reply });
        return;
      } catch (groqErr) {
        console.warn('[GROQ PRIMARY MODEL FAILED, RETRYING WITH llama-3.1-8b-instant]', groqErr.message);
        try {
          const fallbackReply = await callGroqApi(apiKey, messages, 'llama-3.1-8b-instant');
          res.status(200).json({ reply: fallbackReply });
          return;
        } catch (retryErr) {
          console.error('[GROQ RETRY FAILED]', retryErr.message);
          const fallback = getAuthenticFallback(userMessage);
          res.status(200).json({ reply: fallback });
          return;
        }
      }
    }

    // When no API key is configured, return grounded portfolio knowledge
    const fallback = getAuthenticFallback(userMessage);
    res.status(200).json({ reply: fallback });
  } catch (err) {
    console.error('[CHAT ENDPOINT ERROR]', err);
    res.status(500).json({ error: 'Internal server error while processing chat request.' });
  }
};
