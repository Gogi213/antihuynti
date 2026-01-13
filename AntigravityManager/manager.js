const express = require('express');
const httpProxy = require('http-proxy');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');

const app = express();
const proxy = httpProxy.createProxyServer({});
const PORT = 8320; // UI Port
const PROXY_PORT = 8319; // Load Balancer Port

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Configuration
const DIRECTORIES = {
    primary: path.resolve(__dirname, '../CLIProxyAPIPlus'),
    secondary: path.resolve(__dirname, '../CLIProxyAPIPlus_Secondary')
};

const PORTS = {
    primary: 8317,
    secondary: 8318
};

// Process Store
const processes = {
    primary: null,
    secondary: null
};

// Helper: Start Process
function startProcess(id) {
    if (processes[id]) return;

    const dir = DIRECTORIES[id];
    console.log(`[Manager] Starting ${id} in ${dir}...`);

    // We start cmd.exe to keep a handle but run implicitly
    // Using '/c' for fire-and-forget or keep it running? 
    // Ideally we spawn the exe directly to capture stdio.
    const child = spawn('cli-proxy-api-plus.exe', [], {
        cwd: dir,
        stdio: 'ignore', // 'ignore' for detached background, or 'pipe' if we want logs (complex for now)
        detached: false, // Keep attached so they die when manager dies? Or true for persistence?
        // Let's keep false so closing manager closes everything.
        shell: true
    });

    processes[id] = child;
    console.log(`[Manager] ${id} started (PID: ${child.pid})`);

    child.on('close', (code) => {
        console.log(`[Manager] ${id} exited with code ${code}`);
        processes[id] = null;
    });
}

// Helper: Login
function loginProcess(id) {
    const dir = DIRECTORIES[id];
    console.log(`[Manager] Triggering login for ${id}...`);

    // Open a new visible window for login interaction
    spawn('cmd', ['/c', 'start', 'cmd', '/k', 'cli-proxy-api-plus.exe --antigravity-login'], {
        cwd: dir,
        shell: true,
        detached: true
    });
}

const fs = require('fs');
const os = require('os');

// ... (imports remain) ...

// Helper: Get Auth Info
function getAuthInfo(id) {
    const home = os.homedir();
    const authDir = id === 'primary'
        ? path.join(home, '.cli-proxy-api')
        : path.join(home, '.cli-proxy-api-secondary');

    if (!fs.existsSync(authDir)) return null;

    try {
        const files = fs.readdirSync(authDir);
        const authFile = files.find(f => f.startsWith('antigravity-') && f.endsWith('.json'));
        if (authFile) {
            // Extract email from filename: antigravity-user_email_com.json
            const raw = authFile.replace('antigravity-', '').replace('.json', '');
            // Replace last underscore with dot? No, it's user_email_com
            // Antigravity saves as test_strenin_gmail_com. Let's just return it as is or try to format
            return raw.replace(/_/g, '.').replace('.com', '@gmail.com'); // Rough guess, or just return raw
            // Better: read file and look for "account" field if possible?
            // Let's stick to returning the raw filename part or a formatted version if confident.
            // Actually, best to return the filename part for now, it's readable enough.
            return authFile;
        }
    } catch (e) {
        console.error(`[Manager] Error reading auth for ${id}:`, e);
    }
    return null;
}

// Helper: Logout
function logoutProcess(id) {
    console.log(`[Manager] Logging out ${id}...`);
    // 1. Stop process
    if (processes[id]) {
        try {
            spawn('taskkill', ['/pid', processes[id].pid, '/f', '/t']);
        } catch (e) { }
        processes[id] = null;
    }

    // 2. Delete auth file
    const home = os.homedir();
    const authDir = id === 'primary'
        ? path.join(home, '.cli-proxy-api')
        : path.join(home, '.cli-proxy-api-secondary');

    if (fs.existsSync(authDir)) {
        const files = fs.readdirSync(authDir);
        const authFile = files.find(f => f.startsWith('antigravity-') && f.endsWith('.json'));
        if (authFile) {
            fs.unlinkSync(path.join(authDir, authFile));
            console.log(`[Manager] Deleted auth file: ${authFile}`);
        }
    }

    // 3. Restart process (it will be unauthenticated)
    setTimeout(() => startProcess(id), 2000);
}


// API Routes
app.get('/api/status', (req, res) => {
    // Check if process is running (pid check)
    // AND check if auth file exists

    const pActive = !!processes.primary; // Simple check, maybe improve later
    const sActive = !!processes.secondary;

    const pAuth = getAuthInfo('primary');
    const sAuth = getAuthInfo('secondary');

    res.json({
        primary: { active: pActive, user: pAuth },
        secondary: { active: sActive, user: sAuth }
    });
});

app.post('/api/action', (req, res) => {
    const { id, action } = req.body;
    if (!['primary', 'secondary'].includes(id)) return res.status(400).send('Invalid ID');

    if (action === 'start') startProcess(id);
    if (action === 'stop') { /* ... */ } // existing
    if (action === 'login') loginProcess(id);
    if (action === 'logout') logoutProcess(id);

    res.json({ success: true });
});

// Load Balancer (Native HTTP Server for better control than Express for proxying)
const http = require('http');
const targets = [
    `http://localhost:${PORTS.primary}`,
    `http://localhost:${PORTS.secondary}`
];
let currentIndex = 0;

const lbServer = http.createServer((req, res) => {
    const target = targets[currentIndex];
    // Simple round robin
    currentIndex = (currentIndex + 1) % targets.length;

    console.log(`[LB] ${req.method} ${req.url} -> ${target}`);

    proxy.web(req, res, { target }, (e) => {
        console.error(`[LB] Proxy error: ${e.message}`);
        res.statusCode = 502;
        res.end('Bad Gateway / Proxy Error');
    });
});

// Start everything
function init() {
    startProcess('primary');
    startProcess('secondary');

    app.listen(PORT, () => {
        console.log(`[UI] Dashboard running at http://localhost:${PORT}`);
    });

    lbServer.listen(PROXY_PORT, () => {
        console.log(`[LB] Load Balancer running at http://localhost:${PROXY_PORT}`);
    });
}

init();
