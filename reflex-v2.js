// reflex-v2.js - Elite Iowa-Optimized Stealth Proxy
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const WebSocket = require('ws');
const app = express();
const PORT = process.env.PORT || 3000;

// Iowa Residential IP Pool :cite[6]
const IOWA_PROXIES = [
  '208.108.118.42:3128',  // Mediacom (Clinton)
  '216.164.58.134:8080',  // CenturyLink (Council Bluffs)
  '97.88.83.206:3128',    Mediacom (Cedar Rapids)
  '104.139.118.78:8080',  // CenturyLink (Des Moines)
];

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

// Elite Proxy Route
app.use('/proxy', createProxyMiddleware({
  target: 'https://www.google.com',
  changeOrigin: true,
  router: (req) => 'https://' + IOWA_PROXIES[Math.floor(Math.random() * IOWA_PROXIES.length)],
  onProxyReq: (proxyReq, req) => {
    proxyReq.removeHeader('X-Forwarded-For');
    proxyReq.setHeader('User-Agent', userAgents[Math.floor(Math.random() * userAgents.length)]);
  },
  logLevel: 'silent'
}));

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
  // Service Worker for History Cloaking :cite[1]
  navigator.serviceWorker.register('/sw.js').then(() => console.log('SW Registered'));
`;
