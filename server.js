/**
 * Mac Applic International School — Express Server
 * Run:  node server.js
 * Then open:  http://localhost:3000
 */

const express  = require('express');
const path     = require('path');
const fs       = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Simple in-memory session store ────────────────
const sessions = new Set();
function genToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Default admin credentials (change in production!)
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

// ── Middleware ────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser (manual, no extra deps)
function parseCookies(req) {
  const map = {};
  const header = req.headers.cookie;
  if (!header) return map;
  header.split(';').forEach(c => {
    const [k, ...v] = c.trim().split('=');
    map[k.trim()] = decodeURIComponent(v.join('='));
  });
  return map;
}

// Auth middleware
function requireAuth(req, res, next) {
  const cookies = parseCookies(req);
  if (sessions.has(cookies.adminToken)) return next();
  res.status(401).json({ message: 'Unauthorized. Please log in.' });
}

// Serve static files from root (main website)
app.use(express.static(path.join(__dirname)));

// ── ADMIN ROUTES ──────────────────────────────────

// Login page
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

// Dashboard page
app.get('/admin/dashboard', (req, res) => {
  const cookies = parseCookies(req);
  if (!sessions.has(cookies.adminToken)) {
    return res.redirect('/admin/login');
  }
  res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

// Login API
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required.' });
  }
  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }
  const token = genToken();
  sessions.add(token);
  // Set cookie (httpOnly, 8-hour expiry)
  const expires = new Date(Date.now() + 8 * 60 * 60 * 1000).toUTCString();
  res.setHeader('Set-Cookie', `adminToken=${token}; Path=/; HttpOnly; Expires=${expires}`);
  res.json({ message: 'Login successful.' });
});

// Logout API
app.post('/admin/logout', (req, res) => {
  const cookies = parseCookies(req);
  sessions.delete(cookies.adminToken);
  res.setHeader('Set-Cookie', 'adminToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  res.json({ message: 'Logged out.' });
});

// Auth check
app.get('/admin/check-auth', (req, res) => {
  const cookies = parseCookies(req);
  if (sessions.has(cookies.adminToken)) {
    res.json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

// View messages (protected)
app.get('/admin/messages', requireAuth, (req, res) => {
  const logPath = path.join(__dirname, 'messages.json');
  if (!fs.existsSync(logPath)) return res.json([]);
  try {
    const data = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Could not read messages.' });
  }
});

// ── WEBSITE ROUTES ────────────────────────────────

// Home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Contact form
app.post('/send-message', (req, res) => {
  const { name, email, message, subject } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }
  const logPath = path.join(__dirname, 'messages.json');
  let messages  = [];
  if (fs.existsSync(logPath)) {
    try { messages = JSON.parse(fs.readFileSync(logPath, 'utf8')); } catch {}
  }
  messages.push({ name, email, subject: subject || '', message, receivedAt: new Date().toISOString() });
  fs.writeFileSync(logPath, JSON.stringify(messages, null, 2), 'utf8');
  console.log(`[MSG] From: ${name} <${email}>`);
  res.status(200).json({ message: `Thank you, ${name}! Your message has been received.` });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html><html><head><title>404</title><link rel="stylesheet" href="/mac.css"></head>
    <body style="display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:1rem;font-family:sans-serif">
      <h1 style="color:#1a3c6e;font-size:4rem;margin:0">404</h1>
      <p>Page not found.</p>
      <a href="/" style="background:#1a3c6e;color:#fff;padding:.7rem 1.5rem;border-radius:8px;text-decoration:none;font-weight:700">← Go Home</a>
    </body></html>`);
});

// ── Start ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎓  Mac Applic International School server running`);
  console.log(`    → http://localhost:${PORT}`);
  console.log(`    Admin: http://localhost:${PORT}/admin/login`);
  console.log(`    Login: ${ADMIN_USER} / ${ADMIN_PASS}\n`);
});
