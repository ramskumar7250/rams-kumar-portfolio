const https = require('https');

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

const PORTFOLIO_KNOWLEDGE = `
Identity & Positioning:
- Name: Ram Kumar Rai / RAM'S.KUMAR
- Professional Roles: Web Developer, UI/UX Designer, Digital Creator
- Location: India
- Contact Email: marva.app@gmail.com
- Contact WhatsApp: +91 7250671023
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
1. Web Development — Clean, responsive websites and landing pages.
2. UI/UX Design — Purposeful, intuitive interfaces.
3. Web Applications — Functional web apps with modern UX.
4. Digital Product Design — End-to-end product design from concept to prototype.
5. Graphics & Visual Design — Editorial brand assets and digital visuals.
6. Digital Solutions — Strategy combining design, technology, and business thinking.

STRICT AUTHENTICITY RULES:
- Never fabricate clients, companies, revenue, awards, testimonials, years of experience, or fake statistics.
- Direct users to contact Ram via email (marva.app@gmail.com) or WhatsApp (+91 7250671023) for inquiries and collaborations.
`;

function getAuthenticFallback(query) {
  const q = (query || '').toLowerCase();
  if (q.includes('who') || q.includes('about') || q.includes('ram')) {
    return "Ram Kumar Rai (RAM'S.KUMAR) is a Web Developer, UI/UX Designer, and Digital Creator. His foundation in sales, marketing, and human decision-making informs his approach to building clean, purposeful digital products.";
  }
  if (q.includes('project') || q.includes('work') || q.includes('udaan') || q.includes('marbha') || q.includes('notescrush')) {
    return "Ram Kumar's confirmed projects include UdaanPlay (content streaming UX concept), NotesCrush / RAM'S.EDITION (knowledge platform), RAM'S.brainrun (interactive cognitive tools), MARBHA (dignified marriage marketplace concept), RAM's.Mart (e-commerce), and MithilaArtShop (cultural marketplace).";
  }
  if (q.includes('skill') || q.includes('tech') || q.includes('stack') || q.includes('react') || q.includes('figma')) {
    return "Ram works across Web Development (HTML, CSS, JavaScript, React, Responsive Design), UI/UX & Visual Design (Figma, Design Systems, Prototyping), Application Development (Flutter, Firebase), and Digital Creation.";
  }
  if (q.includes('service') || q.includes('offer') || q.includes('hire') || q.includes('help')) {
    return "Ram provides services in Web Development, UI/UX Design, Web Applications, Digital Product Design, Graphics & Visual Design, and Digital Solutions.";
  }
  if (q.includes('contact') || q.includes('email') || q.includes('whatsapp') || q.includes('reach') || q.includes('hire')) {
    return "You can reach Ram Kumar Rai directly via email at marva.app@gmail.com or on WhatsApp at +91 7250671023. You can also submit the contact form on this site.";
  }
  return "I'm RAM'S AI Assistant. I can tell you about Ram Kumar Rai's background, web development and UI/UX design skills, confirmed projects (UdaanPlay, MARBHA, NotesCrush, etc.), and contact details.";
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    let data = req.body;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch (e) { data = {}; }
    }
    data = data || {};

    const userMessage = (data.message || '').trim();
    const history = Array.isArray(data.history) ? data.history.slice(-6) : [];

    if (!userMessage) {
      res.status(400).json({ error: 'Message cannot be empty.' });
      return;
    }

    if (GROQ_API_KEY) {
      const messages = [
        {
          role: 'system',
          content: `You are the official AI Assistant for RAM'S.KUMAR (Ram Kumar Rai), a Web Developer, UI/UX Designer, and Digital Creator based in India.
Your role is to assist visitors in exploring Ram Kumar's portfolio, background, real projects, skills, and contact details with an elegant, concise, and luxurious tone.

Strict Rules:
- Answer ONLY using confirmed facts from the knowledge base below.
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

      const payload = JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.5,
        max_tokens: 350
      });

      const groqReq = https.request({
        hostname: 'api.groq.com',
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Length': Buffer.byteLength(payload)
        }
      }, groqRes => {
        let groqData = '';
        groqRes.on('data', chunk => groqData += chunk);
        groqRes.on('end', () => {
          try {
            if (groqRes.statusCode >= 200 && groqRes.statusCode < 300) {
              const parsed = JSON.parse(groqData);
              const reply = parsed.choices?.[0]?.message?.content || "I'm here to help you learn more about Ram Kumar Rai's work and projects. Feel free to ask!";
              res.status(200).json({ reply });
            } else {
              const fallback = getAuthenticFallback(userMessage);
              res.status(200).json({ reply: fallback });
            }
          } catch (e) {
            const fallback = getAuthenticFallback(userMessage);
            res.status(200).json({ reply: fallback });
          }
        });
      });

      groqReq.on('error', err => {
        const fallback = getAuthenticFallback(userMessage);
        res.status(200).json({ reply: fallback });
      });

      groqReq.write(payload);
      groqReq.end();
      return;
    }

    const reply = getAuthenticFallback(userMessage);
    res.status(200).json({ reply });
  } catch (err) {
    res.status(400).json({ error: 'Invalid chat request.' });
  }
};
