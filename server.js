const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const BASE_PATH = __dirname;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url.split('?')[0] === '/api/chat') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 10000) req.destroy();
    });
    req.on('end', () => {
      try {
        const { query } = JSON.parse(body || '{}');
        if (!query || !String(query).trim()) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify({ error: 'Query message is required.' }));
        }
        const message = String(query).trim();
        let responseText = 'Follow instructions from official local emergency managers. For immediate danger, call 112 or use the ApdaSetu SOS report.';
        if (/shelter|safe area|evacuat/i.test(message)) {
          responseText = 'Open the Shelter Map in your citizen dashboard to view verified shelter locations, live vacancy, facilities, and safe routes. Do not travel through flooded or blocked roads.';
        } else if (/flood|water|rain/i.test(message)) {
          responseText = 'Flood safety alert: move to higher ground, avoid roads near low-lying drains, never walk or drive through floodwater, and switch off electricity only if it is safe.';
        } else if (/hospital|medical|doctor|injur|ambulance/i.test(message)) {
          responseText = 'For urgent medical help, call 108. Keep the injured person safe and still, share your location, and do not move someone with suspected head, neck, or spine injuries unless they face immediate danger.';
        }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ query: message, response: responseText, timestamp: new Date().toISOString(), source: 'ApdaSetu Emergency KB' }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Please send a valid chat message.' }));
      }
    });
    return;
  }
  const cleanUrl = req.url.split('?')[0];
  let filePath = path.join(BASE_PATH, cleanUrl === '/' ? 'index.html' : cleanUrl);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('404 Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✓ ApdaSetu Server started on http://localhost:${PORT}/`);
  console.log(`  Open your browser to: http://localhost:${PORT}/\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n✗ Port ${PORT} is already in use. Try another port or kill the process using it.\n`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
