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
    primary: path.resolve(__dirname, '../CLIProxyAPIPlus')
};

const PORTS = {
    primary: 8317
};

// Process Store
const processes = {
    primary: null
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
    const authDir = path.join(home, '.cli-proxy-api');

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
    const authDir = path.join(home, '.cli-proxy-api');

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

    const pActive = !!processes.primary;
    const pAuth = getAuthInfo('primary');

    res.json({
        primary: { active: pActive, user: pAuth }
    });
});

app.post('/api/action', (req, res) => {
    const { id, action } = req.body;
    if (id !== 'primary') return res.status(400).send('Invalid ID');

    if (action === 'start') startProcess(id);
    if (action === 'stop') { /* ... */ }
    if (action === 'login') loginProcess(id);
    if (action === 'logout') logoutProcess(id);

    res.json({ success: true });
});

// Start everything
function init() {
    startProcess('primary');

    app.listen(PORT, () => {
        console.log(`[UI] Dashboard running at http://localhost:${PORT}`);
    });
}

init();
