/**
 * RAM'S.KUMAR — PORTFOLIO BACKEND SERVER
 * Handles:
 * 1. Static file serving with proper MIME types
 * 2. /api/contact — Secure contact form handler & WhatsApp webhook delivery
 * 3. /api/chat — Secure AI Agent API route using GROQ_API_KEY (never exposed to browser)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables from .env if present
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)?$/);
      if (match && !process.env[match[1]]) {
        let value = match[2] || '';
        value = value.trim().replace(/^['"]|['"]$/g, '');
        process.env[match[1]] = value;
      }
    });
  }
} catch (e) {
  console.log('[ENV] No .env file or parse error, using environment');
}

const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const WHATSAPP_TARGET = process.env.WHATSAPP_TARGET_PHONE || '+917250671023';

// Authentic knowledge base for Ram Kumar Rai
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

// Rate limiting map (in-memory)
const rateLimits = new Map();

function isRateLimited(ip, maxRequests = 30, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimits.get(ip) || { count: 0, resetTime: now + windowMs };
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count += 1;
  }
  rateLimits.set(ip, record);
  return record.count > maxRequests;
}

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=UTF-8'
};

const server = http.createServer((req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── ROUTE: /api/contact ────────────────────────────────────
  if (req.method === 'POST' && req.url === '/api/contact') {
    if (isRateLimited(ip, 10, 60000)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Too many requests. Please try again later.' }));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 50000) req.destroy();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const name = (data.name || '').trim();
        const email = (data.email || '').trim();
        const phone = (data.phone || '').trim();
        const projectType = (data.projectType || 'General Inquiry').trim();
        const budget = (data.budget || 'Not specified').trim();
        const message = (data.message || '').trim();
        const time = new Date().toISOString();

        if (!name || !email || !message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Name, email, and message are required.' }));
          return;
        }

        // Formatted WhatsApp inquiry text according to specification:
        const whatsappMessage = `NEW PORTFOLIO INQUIRY\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nProject Type: ${projectType}\nBudget: ${budget}\nMessage: ${message}\nTime: ${time}`;

        console.log('=== [CONTACT INQUIRY RECEIVED] ===');
        console.log(whatsappMessage);
        console.log('==================================');

        // Optional server-side webhook dispatch (e.g. n8n / WhatsApp Business API / Twilio)
        const webhookUrl = process.env.WHATSAPP_API_URL || process.env.CONTACT_WEBHOOK_URL;
        if (webhookUrl) {
          try {
            const parsedUrl = new URL(webhookUrl);
            const postData = JSON.stringify({
              targetPhone: WHATSAPP_TARGET,
              inquiry: { name, email, phone, projectType, budget, message, time },
              formattedText: whatsappMessage
            });

            const client = parsedUrl.protocol === 'https:' ? https : http;
            const webhookReq = client.request(parsedUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                ...(process.env.WHATSAPP_API_TOKEN ? { 'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}` } : {})
              }
            });
            webhookReq.on('error', err => console.error('[WEBHOOK ERROR]', err.message));
            webhookReq.write(postData);
            webhookReq.end();
          } catch (err) {
            console.error('[WEBHOOK DISPATCH ERROR]', err.message);
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Thank you. Your message has been received.',
          timestamp: time
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request payload.' }));
      }
    });
    return;
  }

  // ── ROUTE: /api/chat ───────────────────────────────────────
  if (req.method === 'POST' && req.url === '/api/chat') {
    if (isRateLimited(ip, 20, 60000)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Too many requests. Please wait a moment.' }));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 50000) req.destroy();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const userMessage = (data.message || '').trim();
        const history = Array.isArray(data.history) ? data.history.slice(-6) : [];

        if (!userMessage) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Message cannot be empty.' }));
          return;
        }

        // If GROQ_API_KEY is configured on server:
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
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ reply }));
                } else {
                  console.error('[GROQ API ERROR]', groqRes.statusCode, groqData);
                  // Intelligent authentic fallback
                  const fallback = getAuthenticFallback(userMessage);
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ reply: fallback }));
                }
              } catch (e) {
                const fallback = getAuthenticFallback(userMessage);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ reply: fallback }));
              }
            });
          });

          groqReq.on('error', err => {
            console.error('[GROQ REQUEST FAILED]', err.message);
            const fallback = getAuthenticFallback(userMessage);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ reply: fallback }));
          });

          groqReq.write(payload);
          groqReq.end();
          return;
        }

        // When GROQ_API_KEY is not yet supplied in .env, respond with high-precision grounded portfolio logic
        const reply = getAuthenticFallback(userMessage);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid chat request.' }));
      }
    });
    return;
  }

  // ── STATIC FILE SERVING ─────────────────────────────────────
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  let filePath = path.join(__dirname, reqPath);

  // Security check against directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  function serveFile(targetPath) {
    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(targetPath).pipe(res);
  }

  function send404() {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
    res.end('<h1>404 — Page Not Found</h1><p><a href="/">Return to RAM\'S.KUMAR Portfolio</a></p>');
  }

  // 1. Direct match check
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      serveFile(filePath);
      return;
    }

    // 2. Clean URL check: try appending .html (e.g. /about -> about.html, /projects/udaanplay -> projects/udaanplay.html)
    const htmlPath = filePath + '.html';
    fs.stat(htmlPath, (errHtml, statsHtml) => {
      if (!errHtml && statsHtml.isFile()) {
        serveFile(htmlPath);
        return;
      }

      // 3. /projects or /projects/ route resolution to projects.html
      if (reqPath === '/projects' || reqPath === '/projects/') {
        const projIndex = path.join(__dirname, 'projects.html');
        fs.stat(projIndex, (errProj, statsProj) => {
          if (!errProj && statsProj.isFile()) {
            serveFile(projIndex);
            return;
          }
          send404();
        });
        return;
      }

      // 4. Directory index resolution (e.g. /projects/ -> /projects/index.html)
      if (!err && stats.isDirectory()) {
        const dirIndex = path.join(filePath, 'index.html');
        fs.stat(dirIndex, (errDir, statsDir) => {
          if (!errDir && statsDir.isFile()) {
            serveFile(dirIndex);
            return;
          }
          send404();
        });
        return;
      }

      // 5. Genuinely nonexistent page
      send404();
    });
  });
});

function getAuthenticFallback(query) {
  const q = query.toLowerCase();
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

server.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  RAM'S.KUMAR Portfolio Server running on port ${PORT}`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  Contact API: POST http://localhost:${PORT}/api/contact`);
  console.log(`  AI Chat API: POST http://localhost:${PORT}/api/chat`);
  console.log(`==================================================`);
});
