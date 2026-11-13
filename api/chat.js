const https = require('https');

// 1. UPDATED KNOWLEDGE BASE (इसमें आपकी सारी नई और एडवांस्ड स्किल्स/प्रोजेक्ट्स डाल दिए गए हैं)
const PORTFOLIO_KNOWLEDGE = `
Identity & Positioning:
- Name: Ram Kumar Rai / RAM'S.KUMAR
- Professional Roles: Web Developer, UI/UX Designer, AI Automation Expert, Digital Creator
- Location: India
- Contact Email: marva.app@gmail.com
- Contact WhatsApp: +91 7250671023
- Direct Website: https://rams-kumar.vercel.app
- Philosophy: "Design with intention. Build with technology. Create with purpose."

Background & Journey:
- Foundation: Sales & Marketing, B2B sales, client relations, consumer psychology.
- Transition: Advanced digital design, modern web development, and AI-driven business solutions.
- Present: RAM'S.KUMAR — Specializing in building high-end, commission-free direct booking platforms, custom AI assistants, and premium digital experiences for international clients.

Skills (Authentic ratings & Tech Stack):
- Web Development: React, Next.js, HTML, CSS, JavaScript, Vercel Deployment (Experienced)
- UI/UX & No-Code: Figma, Framer, Custom Code Components, Responsive Luxury Design (Experienced)
- AI & Automation: Groq API, Google Gemini API, n8n workflows, WhatsApp API Integration (Experienced)
- Applications: Flutter, Firebase (Working Knowledge)

Confirmed Real Projects & Client Work:
1. Ocean View Agat Marina B&B (Guam) — Designed a luxury direct-booking portal with 'Stay & Sail' packages, secure payment UI (Stripe/PayPal), and direct WhatsApp concierge to bypass 9.8% OTA commissions.
2. Mer Passion Menton (France) — Digital structuring and rental catalog integration for a premium boat rental agency.
3. Koshi Pouch Packing Machinery — B2B industrial packaging machinery sales and field-service portal.
4. MARBHA (Marva) — A culturally sensitive marriage marketplace concept with human dignity at its core.
5. AI Calculator & Custom AI Agents — Built interactive AI tools and chat agents deployed on Vercel using Groq/Gemini APIs.
6. UdaanPlay, NotesCrush, RAM's.Mart, MithilaArtShop — Clean, purpose-driven UI/UX concepts.

Services Provided:
1. High-End Web Development — Premium hospitality, B2B, and e-commerce websites.
2. Direct Booking Systems — Commission-free portals integrated with Stripe/PayPal and WhatsApp.
3. AI Integrations — Custom AI chat agents and automated business workflows.
4. UI/UX Design — Purposeful, beautiful interfaces with Framer and Figma.

STRICT AUTHENTICITY RULES:
- Never fabricate clients, awards, or fake statistics.
- Always direct users to contact Ram via email (marva.app@gmail.com) or WhatsApp (+91 7250671023) for inquiries and collaborations.
`;

// 2. UPDATED FALLBACK LOGIC
function getAuthenticFallback(query) {
  const q = (query || '').toLowerCase();
  if (q.includes('project') || q.includes('work') || q.includes('case') || q.includes('guam') || q.includes('france') || q.includes('marbha')) {
    return "Ram Kumar's recent work includes luxury direct-booking portals for Ocean View Agat Marina (Guam), boat rental structuring for Mer Passion (France), Koshi Pouch Packing Machinery (B2B), and custom UI/UX projects like MARBHA, UdaanPlay, and AI Agents.";
  }
  if (q.includes('skill') || q.includes('tech') || q.includes('stack') || q.includes('react') || q.includes('framer') || q.includes('ai')) {
    return "Ram specializes in React, Next.js, Framer, Figma, UI/UX Design, and AI Automations (Groq/Gemini APIs, WhatsApp direct booking integrations).";
  }
  if (q.includes('service') || q.includes('offer') || q.includes('hire') || q.includes('build')) {
    return "Ram builds premium commission-free booking websites, custom AI assistants, automated business workflows, and high-end UI/UX designs for international clients.";
  }
  if (q.includes('contact') || q.includes('email') || q.includes('whatsapp') || q.includes('phone')) {
    return "You can reach Ram Kumar Rai directly via email at marva.app@gmail.com or on WhatsApp at +91 7250671023.";
  }
  return "I am RAM'S AI Assistant. I can answer questions about Ram Kumar Rai's premium web development services, recent projects (like hospitality booking platforms and AI tools), and his technical skills (React, Framer, AI integrations). How can I help you today?";
}

function callGroqApi(apiKey, messages, modelName = 'qwen/qwen3.8-27b') {
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

    const apiKey = (
      process.env.GROQ_API_KEY ||
      process.env.GROQ_KEY ||
      process.env.GROQ_API_TOKEN ||
      process.env.GROQ_TOKEN ||
      ''
    ).trim();

    if (apiKey) {
      // 3. UPDATED SYSTEM PROMPT (यह तय करेगा कि एजेंट क्लाइंट से कैसे बात करेगा)
      const messages = [
        {
          role: 'system',
          content: `You are the official AI Assistant for RAM'S.KUMAR (Ram Kumar Rai), a highly skilled Web Developer, UI/UX Designer, and AI Automation Expert based in India.
          
Your role is to assist visitors, potential clients, and business owners in exploring Ram Kumar's portfolio with a highly professional, luxurious, and solution-oriented tone.

Core Instructions & Interaction Guidelines:
1. Positioning: Present Ram as an expert who solves real business problems (e.g., bypassing OTA commissions like Booking.com/Airbnb, creating direct booking systems, integrating secure payments, and automating workflows with AI).
2. Tone: Elegant, concise, confident, and highly helpful. Treat every visitor as a potential premium client.
3. Accuracy: Answer strictly using confirmed facts from the knowledge base below. Do not invent clients, tools, or statistics.
4. Call to Action: For any serious project inquiries, collaborations, or custom development requests, warmly guide the user to contact Ram directly via WhatsApp (+91 7250671023) or Email (marva.app@gmail.com).
5. If asked about unconfirmed details, politely state that it is not part of Ram's official public portfolio, but encourage them to contact Ram for custom inquiries.

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

    const fallback = getAuthenticFallback(userMessage);
    res.status(200).json({ reply: fallback });
  } catch (err) {
    console.error('[CHAT ENDPOINT ERROR]', err);
    res.status(500).json({ error: 'Internal server error while processing chat request.' });
  }
};
