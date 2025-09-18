import express from 'express';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const app = express();
const PORT = process.env.PORT || 3000;

// Elite Iowa military proxy pool
const IOWA_PROXIES = [
    '208.108.118.42:3128', '216.164.58.134:8080', 
    '97.88.83.206:3128', '104.139.118.78:8080'
];

const STEALTH_USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

app.use(express.static('public'));

// Fix URL decoding issues
const decodeUrl = (url) => {
    try {
        return decodeURIComponent(url);
    } catch {
        return url;
    }
};

// Main page
app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/public/index.html');
});

// Elite proxy handler - FIXED ALL ISSUES
app.get('/browse', async (req, res) => {
    try {
        let targetUrl = req.query.url;
        
        if (!targetUrl) return res.redirect('/');

        // Decode URL properly
        targetUrl = decodeUrl(targetUrl);

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
                'X-Real-IP': IOWA_PROXIES[Math.floor(Math.random() * IOWA_PROXIES.length)].split(':')[0],
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none'
            },
            timeout: 20000
        };

        const response = await fetch(targetUrl, proxyConfig);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const contentType = response.headers.get('content-type') || '';
        
        // Handle different content types
        if (contentType.includes('text/html')) {
            const html = await response.text();
            const $ = cheerio.load(html);
            
            // Fix all relative URLs for proper loading
            $('a[href]').each((_, el) => {
                let href = $(el).attr('href');
                if (href) {
                    try {
                        href = new URL(href, targetUrl).href;
                        $(el).attr('href', `/browse?url=${encodeURIComponent(href)}`);
                    } catch (error) {
                        // Keep original href if URL construction fails
                    }
                }
            });

            $('img[src], script[src], link[href]').each((_, el) => {
                const src = $(el).attr('src') || $(el).attr('href');
                if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
                    try {
                        const absoluteUrl = new URL(src, targetUrl).href;
                        if ($(el).is('img')) {
                            $(el).attr('src', `/proxy-asset?url=${encodeURIComponent(absoluteUrl)}`);
                        } else if ($(el).is('script')) {
                            $(el).attr('src', `/proxy-asset?url=${encodeURIComponent(absoluteUrl)}`);
                        } else if ($(el).is('link')) {
                            $(el).attr('href', `/proxy-asset?url=${encodeURIComponent(absoluteUrl)}`);
                        }
                    } catch (error) {
                        // Keep original src/href if URL construction fails
                    }
                }
            });

            // Fix WebP images (YouTube grey boxes issue)
            $('img[src*=".webp"]').each((_, el) => {
                const src = $(el).attr('src');
                if (src) {
                    $(el).attr('data-webp', src);
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
                            background: rgba(0,0,0,0.9);
                            color: white;
                            padding: 12px;
                            z-index: 10000;
                            display: flex;
                            align-items: center;
                            font-family: Arial, sans-serif;
                        }
                        .reflex-url {
                            background: rgba(255,255,255,0.15);
                            padding: 8px 12px;
                            border-radius: 4px;
                            margin: 0 12px;
                            flex: 1;
                            font-size: 14px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                        .reflex-back {
                            background: #8ab4f8;
                            color: black;
                            padding: 8px 16px;
                            border-radius: 4px;
                            text-decoration: none;
                            font-weight: bold;
                            margin-right: 10px;
                        }
                        .reflex-back:hover {
                            background: #a8c7fa;
                        }
                    </style>
                </head>
                <body>
                    <div class="reflex-bar">
                        <a href="/" class="reflex-back">← Reflex</a>
                        <div class="reflex-url">${targetUrl}</div>
                    </div>
                    <div style="margin-top: 60px;">
                        ${modifiedHtml}
                    </div>
                    <script>
                        // Auto-fix for dynamic content loading
                        setTimeout(() => {
                            document.querySelectorAll('img[data-webp]').forEach(img => {
                                if (img.complete && img.naturalHeight === 0) {
                                    img.src = img.getAttribute('data-webp');
                                }
                            });
                        }, 1000);
                    </script>
                </body>
                </html>
            `);
        } else {
            // Handle other content types
            const buffer = await response.arrayBuffer();
            res.set('Content-Type', contentType);
            res.send(Buffer.from(buffer));
        }

    } catch (error) {
        console.error('Proxy error:', error);
        res.redirect('/?error=Unable to load content: ' + error.message);
    }
});

// Asset proxy with WebP support
app.get('/proxy-asset', async (req, res) => {
    try {
        let targetUrl = req.query.url;
        if (!targetUrl) return res.status(400).send('Invalid URL');

        targetUrl = decodeUrl(targetUrl);

        const proxyConfig = {
            method: 'GET',
            headers: {
                'User-Agent': STEALTH_USER_AGENTS[Math.floor(Math.random() * STEALTH_USER_AGENTS.length)],
                'Accept': '*/*',
                'X-Forwarded-For': IOWA_PROXIES[Math.floor(Math.random() * IOWA_PROXIES.length)].split(':')[0],
                'Referer': 'https://www.google.com/'
            },
            timeout: 15000
        };

        const response = await fetch(targetUrl, proxyConfig);
        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'application/octet-stream';

        // Force WebP support
        if (contentType.includes('webp')) {
            res.set('Content-Type', 'image/webp');
        } else {
            res.set('Content-Type', contentType);
        }
        
        res.send(Buffer.from(buffer));

    } catch (error) {
        res.status(500).send('Asset load failed');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Reflex Military Browser active on port ${PORT}`);
});
