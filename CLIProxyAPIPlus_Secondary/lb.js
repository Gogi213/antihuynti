const http = require('http');

const targets = [
    'http://localhost:8317',
    'http://localhost:8318'
];

let currentIndex = 0;

const server = http.createServer((req, res) => {
    const target = targets[currentIndex];
    currentIndex = (currentIndex + 1) % targets.length;

    console.log(`[LB] ${req.method} ${req.url} -> ${target}`);

    const proxyReq = http.request(target + req.url, {
        method: req.method,
        headers: req.headers,
        agent: false
    }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        console.error(`[LB] Error proxying to ${target}:`, err.message);
        res.statusCode = 502;
        res.end('Bad Gateway');
    });

    req.pipe(proxyReq);
});

const PORT = 8319;
server.listen(PORT, () => {
    console.log(`Load Balancer running on port ${PORT}`);
    console.log(`Targets: ${targets.join(', ')}`);
});
