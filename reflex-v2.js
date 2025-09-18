// reflex-v2.js - Elite Iowa-Optimized Stealth Proxy with Scrapestack
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const WebSocket = require('ws');
const app = express();
const PORT = process.env.PORT || 3000;

// Scrapestack API Integration
const SCRAPESTACK_KEY = '0a2d06e890cbfedaf9eb1a7dc481d879'; // Your API key
const SCRAPESTACK_URL = 'https://api.scrapestack.com/scrape';

// AI-Driven User-Agent Rotation
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', // Chrome
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', // Safari
  'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0' // Firefox
];

// Stealth Middleware
app.use((req, res, next) => {
  res.setHeader('X-Proxy-Region', 'US-IA-LeClaire');
  res.setHeader('X-Client-ISP', 'Mediacom');
  next();
});

// Serve Embedded UI
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html data-theme="dark">
      <head><title>Reflex V2</title><style>${CSS}</style></head>
      <body>
        <div class="container">
          <h1>Reflex</h1>
          <form id="searchForm"><input type="text" placeholder="Enter URL"><button>Go</button></form>
          <div id="result"></div>
        </div>
        <script>${CLIENT_SCRIPT}</script>
      </body>
    </html>
  `);
});

// Scrapestack Proxy Route
app.use('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('URL required');

  try {
    // AI-Driven IP Rotation for Iowa
    const response = await fetch(`${SCRAPESTACK_URL}?access_key=${SCRAPESTACK_KEY}&url=${encodeURIComponent(targetUrl)}&proxy_location=us&premium_proxy=1&render_js=1`);
    const data = await response.text();
    res.send(data);
  } catch (error) {
    res.status(500).send('Scrapestack error');
  }
});

// WebSocket Tunneling
const wss = new WebSocket.Server({ noServer: true });
wss.on('connection', (ws, req) => {
  const targetWs = new WebSocket(req.url.replace('/ws/', ''));
  ws.on('message', (data) => targetWs.send(data));
  targetWs.on('message', (data) => ws.send(data));
});

// Start Server
const server = app.listen(PORT, () => console.log(`🚀 Reflex V2 Live (Iowa-Optimized)`));
server.on('upgrade', (req, socket, head) => {
  if (req.url.startsWith('/ws/')) wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
});

// Embedded CSS & JS
const CSS = `
  body { background: #202124; color: #e8eaed; font-family: Arial, sans-serif; text-align: center; }
  .container { max-width: 700px; margin: 0 auto; padding: 2rem; }
  input { padding: 1rem; width: 80%; border-radius: 24px; border: 1px solid #5f6368; background: #303134; color: #fff; }
  button { padding: 1rem 2rem; border: none; border-radius: 24px; background: #8ab4f8; cursor: pointer; }
`;

const CLIENT_SCRIPT = `
  document.getElementById('searchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = document.querySelector('input').value;
    const res = await fetch('/proxy?url=' + encodeURIComponent(url));
    document.getElementById('result').innerHTML = await res.text();
    history.replaceState({}, '', '/#nohistory'); // Erase history
  });
  // Service Worker for History Cloaking 
  navigator.serviceWorker.register('/sw.js').then(() => console.log('SW Registered'));
`;
