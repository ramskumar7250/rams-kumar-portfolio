const https = require('https');

// 1. आपका पूरा पोर्टफोलियो डेटा और प्रॉम्प्ट
const PORTFOLIO_KNOWLEDGE = `
Identity & Positioning:
- Name: Ram Kumar Rai / RAM'S.KUMAR
- Professional Roles: Web Developer, UI/UX Designer, AI Automation Expert, Digital Creator
- Location: India
- Contact Email: marva.app@gmail.com
- Contact WhatsApp: +91 7250671023
- Direct Website: https://rams-kumar.vercel.app

Background & Journey:
- Foundation: Sales & Marketing, B2B sales, client relations, consumer psychology.
- Transition: Advanced digital design, modern web development, and AI-driven business solutions.
- Present: RAM'S.KUMAR — Specializing in building high-end, commission-free direct booking platforms, custom AI assistants, and premium digital experiences for international clients.

Skills (Authentic ratings & Tech Stack):
- Web Development: React, Next.js, HTML, CSS, JavaScript, Vercel Deployment (Experienced)
- UI/UX & No-Code: Figma, Framer, Custom Code Components, Responsive Luxury Design (Experienced)
- AI & Automation: n8n workflows, WhatsApp API Integration (Experienced)
- Applications: Flutter, Firebase (Working Knowledge)

Confirmed Real Projects & Client Work:
1. Ocean View Agat Marina B&B (Guam) — Designed a luxury direct-booking portal with 'Stay & Sail' packages, secure payment UI (Stripe/PayPal), and direct WhatsApp concierge to bypass 9.8% OTA commissions.
2. Mer Passion Menton (France) — Digital structuring and rental catalog integration for a premium boat rental agency.
3. Koshi Pouch Packing Machinery — B2B industrial packaging machinery sales and field-service portal.
4. MARBHA (Marva) — A culturally sensitive marriage marketplace concept with human dignity at its core.
5. AI Calculator & Custom AI Agents — Built interactive AI tools and chat agents deployed on Vercel.
6. UdaanPlay, NotesCrush, RAM's.Mart, MithilaArtShop — Clean, purpose-driven UI/UX concepts.

STRICT AUTHENTICITY RULES:
- Never fabricate clients, awards, or fake statistics.
- Always direct users to contact Ram via email (marva.app@gmail.com) or WhatsApp (+91 7250671023) for inquiries and collaborations.
`;

const SYSTEM_PROMPT = `You are the official AI Assistant for RAM'S.KUMAR (Ram Kumar Rai). 
Your tone must be elegant, concise, confident, and highly helpful. Treat every visitor as a potential premium client. Answer strictly using confirmed facts from the knowledge base. For serious inquiries, guide them to WhatsApp (+91 7250671023) or Email.

Official Knowledge Base:
${PORTFOLIO_KNOWLEDGE}`;

// 2. डायरेक्ट आपके लाइव लिंक (ram-ai-agent.vercel.app) को कॉल करने वाला फंक्शन
function callMyLiveAgent(userMessage, chatHistory) {
  return new Promise((resolve, reject) => {
    
    // आपके प्रॉम्प्ट को हिस्ट्री में 'system' की तरह जोड़ दिया, ताकि आपका एजेंट इसे समझ ले
    const fullHistory = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...chatHistory
    ];

    const payload = JSON.stringify({
      message: userMessage,
      history: fullHistory
    });

    const options = {
      hostname: 'ram-ai-agent.vercel.app/api/chat',
      path: '/', 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
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
            // आपका एजेंट जो 'reply' भेजता है, उसे सीधा पकड़ लिया
            const content = parsed.reply || parsed.response || parsed.choices?.[0]?.message?.content;
            if (content) {
              resolve(content.trim());
            } else {
              reject(new Error('No readable reply received from your live agent'));
            }
          } else {
            reject(new Error(`Live Agent returned HTTP ${res.statusCode}: ${data}`));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Live Agent request timed out'));
    });

    req.on('error', err => {
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

// JSON Parser
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

// 3. MAIN HANDLER
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
    
    // History format
    const history = Array.isArray(data.history) ? data.history.map(h => ({
      role: h.role === 'user' ? 'user' : 'assistant',
      content: String(h.content || '').slice(0, 500)
    })).slice(-6) : [];

    if (!userMessage) {
      res.status(400).json({ error: 'Message cannot be empty.' });
      return;
    }

    try {
      // सीधा आपके वर्किंग लिंक को कॉल
      const reply = await callMyLiveAgent(userMessage, history);
      res.status(200).json({ reply });
    } catch (apiErr) {
      console.error('[LIVE AGENT ERROR]', apiErr.message);
      // फॉलबैक मेसेज
      res.status(200).json({ reply: "Hello! I am RAM'S AI Assistant. I can help you with details about his Web Development services, UI/UX design, or recent projects like the Guam Booking Portal. For direct inquiries, please contact +91 7250671023 on WhatsApp." });
    }

  } catch (err) {
    console.error('[ENDPOINT ERROR]', err);
    res.status(500).json({ error: 'Internal server error while processing request.' });
  }
};
