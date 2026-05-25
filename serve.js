const http = require('http');
const fs = require('fs');
const path = require('path');
const mimes = { '.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon','.svg':'image/svg+xml','.json':'application/json','.ico':'image/x-icon' };
http.createServer((req, res) => {
    let file = req.url === '/' ? '/index.html' : decodeURIComponent(req.url);
    file = path.join('.', file);
    fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not Found'); return; }
        const ext = path.extname(file);
        res.writeHead(200, { 'Content-Type': mimes[ext] || 'text/plain' });
        res.end(data);
    });
}).listen(8080, () => console.log('Server: http://localhost:8080'));
