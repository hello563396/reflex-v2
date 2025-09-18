import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { WebSocketServer } from 'ws';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// Scrapestack API Integration
const SCRAPESTACK_KEY = process.env.SCRAPESTACK_KEY || '0a2d06e890cbfedaf9eb1a7dc481d879';
const SCRAPESTACK_URL = 'https://api.scrapestack.com/scrape';

// Iowa-Optimized Residential IPs (Scrapestack Geotargeting)
const IOWA_PROXIES = [
  'us-il.proxy.scrapestack.com',
  'us-ia.proxy.scrapestack.com',
  'us-wi.proxy.scrapestack.com'
];

// Stealth Headers for iBoss Evasion
app.use((req, res, next) => {
  res.setHeader('X-Proxy-Region', 'US-IA-LeClaire');
  res.setHeader('X-Client-ISP', 'Mediacom');
  res.setHeader('X-Forwarded-For', IOWA_PROXIES[Math.floor(Math.random() * IOWA_PROXIES.length)]);
  next();
});

// Serve Embedded UI
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html data-theme="dark">
      <head>
        <title>Reflex V2</title>
        <style>${CSS}</style>
      </head>
      <body>
        <div class="container">
          <h1>Reflex</h1>
          <form id="searchForm">
            <input type="text" placeholder="Enter URL" autocomplete="off">
            <button>Go</button>
          </form>
          <div id="result"></div>
        </div>
        <script>${CLIENT_SCRIPT}</script>
      </body>
    </html>
  `);
});

// Scrapestack Proxy Route (AI-Powered Rotation)
app.use('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('URL required');

  try {
    const response = await fetch(`${SCRAPESTACK_URL}?access_key=${SCRAPESTACK_KEY}&url=${encodeURIComponent(targetUrl)}&proxy_location=us&premium_proxy=true&render_js=1`);
    const data = await response.text();
    res.send(data);
  } catch (error) {
    res.status(500).send('Scrapestack error: ' + error.message);
  }
});

// WebSocket Tunneling for Real-Time Evasion (FIXED CONSTRUCTOR)
const wss = new WebSocketServer({ noServer: true });
wss.on('connection', (ws, req) => {
  const targetUrl = req.url.replace('/ws/', '');
  const targetWs = new WebSocket(targetUrl);
  ws.on('message', (data) => targetWs.send(data));
  targetWs.on('message', (data) => ws.send(data));
});

// Server Initialization
const server = app.listen(PORT, () => console.log(`🚀 Reflex V2 Live (Iowa-Optimized)`));
server.on('upgrade', (req, socket, head) => {
  if (req.url.startsWith('/ws/')) {
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
  }
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
    history.replaceState({}, '', '/#nohistory');
  });
  
  // Advanced history cloaking
  navigator.serviceWorker.register('/sw.js').then(() => console.log('SW Registered'));
  window.addEventListener('beforeunload', () => {
    sessionStorage.clear();
    indexedDB.databases().then(dbs => {
      dbs.forEach(db => indexedDB.deleteDatabase(db.name));
    });
  });
`;
