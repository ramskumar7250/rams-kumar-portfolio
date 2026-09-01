const https = require('https');
const http = require('http');

const WHATSAPP_TARGET = process.env.WHATSAPP_TARGET_PHONE || '+917250671023';

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

    const name = (data.name || '').trim();
    const email = (data.email || '').trim();
    const phone = (data.phone || '').trim();
    const projectType = (data.projectType || 'General Inquiry').trim();
    const budget = (data.budget || 'Not specified').trim();
    const message = (data.message || '').trim();
    const time = new Date().toISOString();

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, email, and message are required.' });
      return;
    }

    const whatsappMessage = `NEW PORTFOLIO INQUIRY\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nProject Type: ${projectType}\nBudget: ${budget}\nMessage: ${message}\nTime: ${time}`;

    console.log('=== [CONTACT INQUIRY RECEIVED] ===');
    console.log(whatsappMessage);
    console.log('==================================');

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

    res.status(200).json({
      success: true,
      message: 'Thank you. Your message has been received.',
      timestamp: time
    });
  } catch (err) {
    res.status(400).json({ error: 'Invalid request payload.' });
  }
};
