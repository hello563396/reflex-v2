import express from 'express';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const app = express();
const PORT = process.env.PORT || 3000;

// Elite Iowa military proxy pool
const IOWA_PROXIES = [
    '208.108.118.42:3128', '216.164.58.134:8080', 
    '97.88.83.206:3128', '104.139.118.78:8080',
    '192.159.117.42:3128', '208.108.118.43:3128'
];

const STEALTH_USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

app.use(express.static('public'));

// Main page
app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/public/index.html');
});

// Elite proxy handler - FIXED ALL ISSUES
app.get('/browse', async (req, res) => {
    try {
        let targetUrl = req.query.url;
        
        if (!targetUrl) return res.redirect('/');

        // Ensure proper URL format
        if (!targetUrl.startsWith('http')) {
            targetUrl = 'https://' + targetUrl;
        }

        // Validate URL
        try {
            new URL(targetUrl);
        } catch {
            return res.redirect('/');
        }

        const proxyConfig = {
            method: 'GET',
            headers: {
                'User-Agent': STEALTH_USER_AGENTS[Math.floor(Math.random() * STEALTH_USER_AGENTS.length)],
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'X-Forwarded-For': IOWA_PROXIES[Math.floor(Math.random() * IOWA_PROXIES.length)].split(':')[0],
                'X-Real-IP': IOWA_PROXIES[Math.floor(Math.random() * IOWA_PROXIES.length)].split(':')[0]
            },
            timeout: 15000
        };

        const response = await fetch(targetUrl, proxyConfig);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const contentType = response.headers.get('content-type') || '';
        const buffer = await response.arrayBuffer();
        
        // Handle different content types
        if (contentType.includes('text/html')) {
            const html = new TextDecoder().decode(buffer);
            const $ = cheerio.load(html);
            
            // Fix relative URLs
            $('a[href]').each((_, el) => {
                const href = $(el).attr('href');
                if (href && !href.startsWith('http') && !href.startsWith('//')) {
                    $(el).attr('href', `/browse?url=${encodeURIComponent(new URL(href, targetUrl).href)}`);
                }
            });

            $('img[src]').each((_, el) => {
                const src = $(el).attr('src');
                if (src && !src.startsWith('http') && !src.startsWith('//')) {
                    $(el).attr('src', `/proxy-asset?url=${encodeURIComponent(new URL(src, targetUrl).href)}`);
                }
            });

            $('link[href]').each((_, el) => {
                const href = $(el).attr('href');
                if (href && !href.startsWith('http') && !href.startsWith('//')) {
                    $(el).attr('href', `/proxy-asset?url=${encodeURIComponent(new URL(href, targetUrl).href)}`);
                }
            });

            $('script[src]').each((_, el) => {
                const src = $(el).attr('src');
                if (src && !src.startsWith('http') && !src.startsWith('//')) {
                    $(el).attr('src', `/proxy-asset?url=${encodeURIComponent(new URL(src, targetUrl).href)}`);
                }
            });

            const modifiedHtml = $.html();
            
            res.set('Content-Type', 'text/html');
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <base href="${targetUrl}">
                    <style>
                        body { margin: 0; padding: 0; }
                        .reflex-bar {
                            position: fixed;
                            top: 0;
                            left: 0;
                            right: 0;
                            background: rgba(0,0,0,0.8);
                            color: white;
                            padding: 10px;
                            z-index: 10000;
                            display: flex;
                            align-items: center;
                        }
                        .reflex-url {
                            background: rgba(255,255,255,0.2);
                            padding: 5px 10px;
                            border-radius: 3px;
                            margin: 0 10px;
                            flex: 1;
                        }
                        .reflex-back {
                            background: #8ab4f8;
                            color: black;
                            padding: 5px 10px;
                            border-radius: 3px;
                            text-decoration: none;
                            margin-right: 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="reflex-bar">
                        <a href="/" class="reflex-back">← Reflex</a>
                        <div class="reflex-url">${targetUrl}</div>
                    </div>
                    <div style="margin-top: 50px;">
                        ${modifiedHtml}
                    </div>
                </body>
                </html>
            `);
        } else {
            // Handle other content types (images, CSS, JS)
            res.set('Content-Type', contentType);
            res.send(Buffer.from(buffer));
        }

    } catch (error) {
        console.error('Proxy error:', error);
        res.redirect('/?error=Unable to load content');
    }
});

// Asset proxy for images/CSS/JS
app.get('/proxy-asset', async (req, res) => {
    try {
        const targetUrl = req.query.url;
        if (!targetUrl) return res.status(400).send('Invalid URL');

        const proxyConfig = {
            method: 'GET',
            headers: {
                'User-Agent': STEALTH_USER_AGENTS[Math.floor(Math.random() * STEALTH_USER_AGENTS.length)],
                'Accept': '*/*',
                'X-Forwarded-For': IOWA_PROXIES[Math.floor(Math.random() * IOWA_PROXIES.length)].split(':')[0]
            },
            timeout: 10000
        };

        const response = await fetch(targetUrl, proxyConfig);
        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'application/octet-stream';

        res.set('Content-Type', contentType);
        res.send(Buffer.from(buffer));

    } catch (error) {
        res.status(500).send('Asset load failed');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Reflex Military Browser active on port ${PORT}`);
});
