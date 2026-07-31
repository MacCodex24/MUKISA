/* ===================================================
   Mac Applic International School — main.js
=================================================== */

// ── Sticky header + active nav on scroll ──────────
const header = document.querySelector('header');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav ul li a');

window.addEventListener('scroll', () => {
  // Sticky shadow
  header.classList.toggle('scrolled', window.scrollY > 60);

  // Back-to-top button
  document.querySelector('.to-top').classList.toggle('visible', window.scrollY > 300);

  // Active nav link
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 90) current = sec.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
});

// ── Mobile hamburger ──────────────────────────────
const hamburger = document.querySelector('.hamburger');
const nav       = document.querySelector('nav');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  nav.classList.toggle('open');
});

// Close nav when a link is clicked
navLinks.forEach(a => a.addEventListener('click', () => {
  hamburger.classList.remove('open');
  nav.classList.remove('open');
}));

// ── Dark / Light theme toggle ─────────────────────
const themeBtn = document.querySelector('.theme-toggle');

function applyTheme(dark) {
  document.body.classList.toggle('dark', dark);
  themeBtn.textContent = dark ? '☀️' : '🌙';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}

themeBtn.addEventListener('click', () => {
  applyTheme(!document.body.classList.contains('dark'));
});

// Restore saved preference
applyTheme(localStorage.getItem('theme') === 'dark');

// ── Scroll-reveal animations ─────────────────────
const reveals = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

reveals.forEach(el => observer.observe(el));

// ── Animated counters ─────────────────────────────
function animateCounter(el, target, duration = 1800) {
  let start = 0;
  const step = Math.ceil(target / (duration / 16));
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { start = target; clearInterval(timer); }
    el.textContent = start.toLocaleString() + (el.dataset.suffix || '');
  }, 16);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.stat .num').forEach(el => {
        animateCounter(el, parseInt(el.dataset.target));
      });
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

const statsBar = document.querySelector('.stats-bar');
if (statsBar) statsObserver.observe(statsBar);

// ── Lightbox for gallery ──────────────────────────
const lightbox   = document.querySelector('.lightbox');
const lbImg      = lightbox ? lightbox.querySelector('img') : null;
const lbCaption  = lightbox ? lightbox.querySelector('.lb-caption') : null;
const closeBtn   = lightbox ? lightbox.querySelector('.close-lb') : null;

document.querySelectorAll('.gallery-item img').forEach(img => {
  img.addEventListener('click', () => {
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    if (lbCaption) lbCaption.textContent = img.closest('.gallery-item')?.dataset.label || img.alt;
    lightbox.classList.add('open');
  });
});

if (closeBtn) closeBtn.addEventListener('click', () => lightbox.classList.remove('open'));
if (lightbox) lightbox.addEventListener('click', e => {
  if (e.target === lightbox) lightbox.classList.remove('open');
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && lightbox) lightbox.classList.remove('open');
});

// ── Gallery filter ────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.gallery-item').forEach(item => {
      const match = filter === 'all' || item.dataset.category === filter;
      item.style.display = match ? '' : 'none';
    });
  });
});

// ── Contact form (AJAX to /send-message) ──────────
const form       = document.querySelector('#contactForm');
const formStatus = document.querySelector('.form-status');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name:    form.querySelector('input[type="text"]').value.trim(),
      email:   form.querySelector('input[type="email"]').value.trim(),
      subject: form.querySelector('input[id="cf-subject"]')?.value.trim() || '',
      message: form.querySelector('textarea').value.trim()
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      const res = await fetch('/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      formStatus.className = 'form-status ' + (res.ok ? 'success' : 'error');
      formStatus.textContent = json.message;
      if (res.ok) form.reset();
    } catch {
      formStatus.className = 'form-status error';
      formStatus.textContent = 'Server error. Please try again later.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message 📨';
    }
  });
}

// ── Smooth back-to-top ────────────────────────────
document.querySelector('.to-top')?.addEventListener('click', e => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ============================================================
   EMBEDDED ADMIN SYSTEM
============================================================ */

// ── Open/Close Login Modal ────────────────────────
const adminOverlay     = document.getElementById('adminOverlay');
const adminNavBtn      = document.getElementById('adminNavBtn');
const adminFooterBtn   = document.getElementById('adminFooterBtn');
const adminModalClose  = document.getElementById('adminModalClose');
const adminAlert       = document.getElementById('adminAlert');

function openAdminLogin() {
  adminOverlay.classList.add('open');
}

function closeAdminLogin() {
  adminOverlay.classList.remove('open');
  adminAlert.className = 'admin-alert';
  adminAlert.textContent = '';
}

adminNavBtn?.addEventListener('click', (e) => { e.preventDefault(); openAdminLogin(); });
adminFooterBtn?.addEventListener('click', (e) => { e.preventDefault(); openAdminLogin(); });
adminModalClose?.addEventListener('click', closeAdminLogin);

// Close modal on overlay click
adminOverlay?.addEventListener('click', (e) => {
  if (e.target === adminOverlay) closeAdminLogin();
});

// ── Password Toggle ────────────────────────────────
const admPass = document.getElementById('adm-pass');
const admPwToggle = document.getElementById('admPwToggle');

admPwToggle?.addEventListener('click', () => {
  const isText = admPass.type === 'text';
  admPass.type = isText ? 'password' : 'text';
  admPwToggle.textContent = isText ? '👁️' : '🙈';
});

// ── Login ──────────────────────────────────────────
const admUser = document.getElementById('adm-user');
const admLoginBtn = document.getElementById('admLoginBtn');
const admBtnTxt = document.getElementById('admBtnTxt');
const admSpin = document.getElementById('admSpin');
const adminDash = document.getElementById('adminDash');

function showAdminAlert(msg, type = 'error') {
  adminAlert.textContent = msg;
  adminAlert.className = 'admin-alert ' + type;
}

async function adminLogin() {
  const username = admUser.value.trim();
  const password = admPass.value;

  if (!username || !password) {
    showAdminAlert('Please enter both username and password.');
    return;
  }

  admBtnTxt.textContent = 'Signing in…';
  admSpin.style.display = 'inline-block';
  admLoginBtn.disabled = true;

  try {
    const res = await fetch('/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (res.ok) {
      showAdminAlert('Login successful!', 'success');
      setTimeout(() => {
        closeAdminLogin();
        adminDash.classList.add('open');
        document.body.style.overflow = 'hidden';
        loadAdminData();
      }, 600);
    } else {
      showAdminAlert(data.message || 'Invalid credentials.');
    }
  } catch {
    showAdminAlert('Could not connect to the server.');
  } finally {
    admBtnTxt.textContent = 'Sign In';
    admSpin.style.display = 'none';
    admLoginBtn.disabled = false;
  }
}

admLoginBtn?.addEventListener('click', adminLogin);
admPass?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') adminLogin();
});

// ── Dashboard Navigation ───────────────────────────
const admNavItems  = document.querySelectorAll('.adm-nav-item');
const admPanels    = document.querySelectorAll('.adm-panel');
const admPageTitle = document.getElementById('admPageTitle');

function showAdmPanel(id) {
  admPanels.forEach(p => p.classList.toggle('active', p.id === 'adm-panel-' + id));
  admNavItems.forEach(n => n.classList.toggle('active', n.dataset.panel === id));
  if (admPageTitle) admPageTitle.textContent = id.charAt(0).toUpperCase() + id.slice(1);
}

admNavItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    showAdmPanel(item.dataset.panel);
  });
});

// Nav links inside panels (e.g. "View All →" in overview)
document.querySelectorAll('.adm-nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    showAdmPanel(link.dataset.panel);
  });
});

// Sidebar toggle
const admSidebar = document.getElementById('admSidebar');
document.getElementById('admSidebarToggle')?.addEventListener('click', () => {
  admSidebar.classList.toggle('collapsed');
});

// Close Dashboard
document.getElementById('admCloseDash')?.addEventListener('click', () => {
  adminDash.classList.remove('open');
  document.body.style.overflow = '';
});

// Logout
document.getElementById('admLogout')?.addEventListener('click', async (e) => {
  e.preventDefault();
  await fetch('/admin/logout', { method: 'POST' });
  adminDash.classList.remove('open');
  document.body.style.overflow = '';
});

// Dashboard dark mode (reuses same themeBtn toggle applied earlier; just sync icon)
const admThemeBtn = document.querySelector('.adm-theme-btn');
if (admThemeBtn) {
  admThemeBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
  admThemeBtn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    admThemeBtn.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

// Today date
const admToday = document.getElementById('admToday');
if (admToday) {
  admToday.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

// Init welcome time
const initTime = document.getElementById('initTime');
if (initTime) initTime.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

// ── Load Messages ──────────────────────────────────
async function loadAdminData() {
  try {
    const res  = await fetch('/admin/messages');
    if (!res.ok) return;
    const msgs = await res.json();
    const count = msgs.length;

    // Update badges
    const badge = document.getElementById('admMsgBadge');
    const kpi   = document.getElementById('kpiMsgs');
    const notif = document.getElementById('admNotifCount');
    if (badge) badge.textContent = count;
    if (kpi)   kpi.textContent   = count;
    if (notif) notif.textContent = count;

    // Recent messages in overview
    renderRecentMsgs(msgs.slice(-5).reverse());
    // Full list
    renderMsgList(msgs.slice().reverse());
  } catch { /* offline / no server */ }
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function renderRecentMsgs(msgs) {
  const el = document.getElementById('admRecentMsgs');
  if (!el) return;
  if (!msgs.length) { el.innerHTML = '<p class="adm-loading">No messages yet.</p>'; return; }
  el.innerHTML = msgs.map(m => `
    <div class="adm-msg-card unread">
      <div class="adm-msg-card-head">
        <div><div class="adm-mc-name">${escHtml(m.name)}</div><div class="adm-mc-email">${escHtml(m.email)}</div></div>
        <div class="adm-mc-date">${fmtDate(m.receivedAt)}</div>
      </div>
      <div class="adm-mc-body">${escHtml(m.message.slice(0, 90))}${m.message.length > 90 ? '…' : ''}</div>
    </div>`).join('');
}

function renderMsgList(msgs) {
  const el = document.getElementById('admMsgList');
  if (!el) return;
  if (!msgs.length) { el.innerHTML = '<p class="adm-loading">No messages yet.</p>'; return; }
  el.innerHTML = msgs.map(m => `
    <div class="adm-msg-card">
      <div class="adm-msg-card-head">
        <div>
          <div class="adm-mc-name">${escHtml(m.name)}</div>
          <div class="adm-mc-email">${escHtml(m.email)}</div>
          ${m.subject ? `<div class="adm-mc-subj">Re: ${escHtml(m.subject)}</div>` : ''}
        </div>
        <div class="adm-mc-date">${fmtDate(m.receivedAt)}</div>
      </div>
      <div class="adm-mc-body">${escHtml(m.message)}</div>
    </div>`).join('');
}

// Message search
document.getElementById('admMsgSearch')?.addEventListener('input', async (e) => {
  const q = e.target.value.toLowerCase();
  const res = await fetch('/admin/messages');
  if (!res.ok) return;
  const msgs = await res.json();
  renderMsgList(msgs.filter(m =>
    m.name.toLowerCase().includes(q) ||
    m.email.toLowerCase().includes(q) ||
    m.message.toLowerCase().includes(q)
  ).reverse());
});

// Refresh button
document.getElementById('admRefresh')?.addEventListener('click', loadAdminData);

// ── Chat System ────────────────────────────────────
const admChatMsgs  = document.getElementById('admChatMsgs');
const admChatInput = document.getElementById('admChatInput');
const admSendBtn   = document.getElementById('admSendBtn');
const admEmojiBtn  = document.getElementById('admEmojiBtn');
const admEmojiPicker = document.getElementById('admEmojiPicker');
const admClearChat = document.getElementById('admClearChat');

let admChatHistory = JSON.parse(localStorage.getItem('admChatHistory') || '{}');
let admActiveChannel = 'general';

function getT() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function appendAdmMsg(text, type = 'sent') {
  const div = document.createElement('div');
  div.className = 'adm-msg ' + type;
  const avHtml = type === 'sent'
    ? '<div class="adm-msg-av" style="background:#f5a623;font-size:0.7rem">AD</div>'
    : '<div class="adm-msg-av">🤖</div>';
  div.innerHTML = `${avHtml}<div class="adm-bubble"><p>${escHtml(text)}</p><time>${getT()}</time></div>`;
  admChatMsgs.appendChild(div);
  admChatMsgs.scrollTop = admChatMsgs.scrollHeight;

  if (!admChatHistory[admActiveChannel]) admChatHistory[admActiveChannel] = [];
  admChatHistory[admActiveChannel].push({ text, type });
  localStorage.setItem('admChatHistory', JSON.stringify(admChatHistory));

  // Update active chats KPI
  const activeCount = Object.keys(admChatHistory).filter(k => admChatHistory[k].length > 0).length;
  const kpiChats = document.getElementById('kpiChats');
  if (kpiChats) kpiChats.textContent = activeCount;
}

function sendAdmMsg() {
  const text = admChatInput.value.trim();
  if (!text) return;
  admChatInput.value = '';
  admChatInput.style.height = 'auto';
  appendAdmMsg(text, 'sent');
  admEmojiPicker.classList.remove('open');

  // Auto-reply
  const replies = [
    'Thank you for your message. We will respond shortly.',
    'Noted! The relevant team has been informed.',
    'Hello! How can we assist you today?',
    'Your request has been received. Expect a reply within 24 hours.',
    'Great, we\'ll pass this to the department concerned.'
  ];
  setTimeout(() => {
    appendAdmMsg(replies[Math.floor(Math.random() * replies.length)], 'recv');
  }, 1100);
}

admSendBtn?.addEventListener('click', sendAdmMsg);

admChatInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAdmMsg(); }
});
admChatInput?.addEventListener('input', () => {
  admChatInput.style.height = 'auto';
  admChatInput.style.height = Math.min(admChatInput.scrollHeight, 100) + 'px';
});

// Emoji picker
admEmojiBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  admEmojiPicker.classList.toggle('open');
});
admEmojiPicker?.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', () => {
    admChatInput.value += btn.textContent;
    admChatInput.focus();
    admEmojiPicker.classList.remove('open');
  });
});
document.addEventListener('click', () => admEmojiPicker?.classList.remove('open'));

// Clear chat
admClearChat?.addEventListener('click', () => {
  if (!confirm('Clear all messages in this channel?')) return;
  admChatMsgs.innerHTML = `<div class="adm-date-sep">Today</div>
    <div class="adm-msg recv"><div class="adm-msg-av">🤖</div>
    <div class="adm-bubble"><p>Chat cleared.</p><time>${getT()}</time></div></div>`;
  delete admChatHistory[admActiveChannel];
  localStorage.setItem('admChatHistory', JSON.stringify(admChatHistory));
});

// Switch channels
document.querySelectorAll('.adm-ch').forEach(ch => {
  ch.addEventListener('click', () => {
    document.querySelectorAll('.adm-ch').forEach(c => c.classList.remove('active'));
    ch.classList.add('active');
    admActiveChannel = ch.dataset.ch;

    const title = ch.dataset.title;
    const sub   = ch.dataset.sub;
    document.getElementById('chatTitle').textContent = title;
    document.getElementById('chatSub').textContent   = sub;
    document.getElementById('chatAvatar').style.background = ch.querySelector('.adm-ch-av').style.background;
    document.getElementById('chatAvatar').textContent      = ch.querySelector('.adm-ch-av').textContent;

    // Reload history for this channel
    admChatMsgs.innerHTML = '<div class="adm-date-sep">Today</div>';
    const hist = admChatHistory[admActiveChannel] || [];
    if (!hist.length) {
      appendAdmMsg('No messages yet in this channel.', 'recv');
    } else {
      hist.forEach(m => appendAdmMsg(m.text, m.type));
    }

    // Remove unread badge
    const badge = ch.querySelector('.adm-unread');
    if (badge) badge.remove();
  });
});

// Channel search
document.querySelector('.adm-ch-search')?.addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('.adm-ch').forEach(ch => {
    const name = ch.querySelector('strong').textContent.toLowerCase();
    ch.style.display = name.includes(q) ? '' : 'none';
  });
});

// ── Teacher management ─────────────────────────────
document.getElementById('admAddTeacher')?.addEventListener('click', () => {
  alert('Add Teacher feature: this will open a form to add a new teacher profile.');
});

document.querySelectorAll('.adm-btn-edit').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.closest('.adm-tc').querySelector('h4').textContent;
    alert(`Edit profile for ${name} — coming soon!`);
  });
});

document.querySelectorAll('.adm-btn-del').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.adm-tc');
    const name = card.querySelector('h4').textContent;
    if (confirm(`Remove ${name} from the teacher list?`)) card.remove();
  });
});

// ── Settings ───────────────────────────────────────
document.getElementById('admPwForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Password update will be available in the next release.');
});
