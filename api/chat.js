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

// यह वो प्रॉम्प्ट है जो आपके यूनिवर्सल एजेंट को बताएगा कि उसे पोर्टफोलियो के लिए कैसे बात करनी है
const PORTFOLIO_SYSTEM_PROMPT = `You are the official AI Assistant for RAM'S.KUMAR (Ram Kumar Rai). 
Your tone must be elegant, concise, confident, and highly helpful. Treat every visitor as a potential premium client. Answer strictly using confirmed facts from the knowledge base. For serious inquiries, guide them to WhatsApp (+91 7250671023) or Email.

Official Knowledge Base:
${PORTFOLIO_KNOWLEDGE}`;

// JSON पार्सर फंक्शन
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

// मेन API हैंडलर
module.exports = async (req, res) => {
  // CORS Headers (ताकि आपके पोर्टफोलियो का फ्रंटएंड इसे कॉल कर सके)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS रिक्वेस्ट को तुरंत हैंडल करें
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
    const history = Array.isArray(data.history) ? data.history : [];

    if (!userMessage) {
      res.status(400).json({ error: 'Message cannot be empty.' });
      return;
    }

    // यहाँ हम डेटा पैक कर रहे हैं आपके यूनिवर्सल एजेंट (ram-ai-agent) के लिए
    // बिल्कुल वैसे ही जैसे आपने Framer वाले कोड में systemPrompt भेजा था
    const payload = JSON.stringify({
      message: userMessage,
      history: history,
      systemPrompt: PORTFOLIO_SYSTEM_PROMPT 
    });

    const options = {
      hostname: 'https://ram-ai-agent.vercel.app',
      path: '/api/chat', // आपके एजेंट का सही एंडपॉइंट
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 15000
    };

    // रिक्वेस्ट को यूनिवर्सल एजेंट पर भेजें
    const agentReq = https.request(options, agentRes => {
      let responseData = '';
      agentRes.on('data', chunk => responseData += chunk);
      agentRes.on('end', () => {
        try {
          if (agentRes.statusCode >= 200 && agentRes.statusCode < 300) {
            const parsed = JSON.parse(responseData);
            // जो रिप्लाई आपका एजेंट भेजेगा, उसे वापस क्लाइंट को दे देंगे
            res.status(200).json(parsed);
          } else {
            console.error(`[AGENT ERROR ${agentRes.statusCode}]`, responseData);
            res.status(agentRes.statusCode).json({ error: 'Error from Universal AI Agent' });
          }
        } catch (err) {
          console.error('[PARSE ERROR]', err);
          res.status(500).json({ error: 'Failed to parse response from agent' });
        }
      });
    });

    agentReq.on('timeout', () => {
      agentReq.destroy();
      res.status(504).json({ error: 'Agent request timed out' });
    });

    agentReq.on('error', err => {
      console.error('[REQUEST ERROR]', err.message);
      res.status(500).json({ error: 'Failed to connect to agent' });
    });

    // पेलोड राइट करें और रिक्वेस्ट क्लोज करें
    agentReq.write(payload);
    agentReq.end();

  } catch (err) {
    console.error('[ENDPOINT ERROR]', err);
    res.status(500).json({ error: 'Internal server error while processing request.' });
  }
};
