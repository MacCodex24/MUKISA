/* ===== Admin Dashboard JS ===== */

// ── Auth guard ────────────────────────────────────
(async () => {
  try {
    const res = await fetch('/admin/check-auth');
    if (!res.ok) { window.location.href = '/admin/login'; return; }
  } catch {
    window.location.href = '/admin/login';
  }
})();

// ── Sidebar toggle ────────────────────────────────
const sidebar     = document.getElementById('sidebar');
const dashMain    = document.getElementById('dashMain');
const sidebarToggle = document.getElementById('sidebarToggle');

sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  sidebar.classList.toggle('open');
});

// ── Panel navigation ──────────────────────────────
const navItems = document.querySelectorAll('.nav-item');
const panels   = document.querySelectorAll('.panel');
const dashTitle = document.getElementById('dashTitle');

function showPanel(id) {
  panels.forEach(p => p.classList.toggle('active', p.id === 'panel-' + id));
  navItems.forEach(n => n.classList.toggle('active', n.dataset.panel === id));
  dashTitle.textContent = id.charAt(0).toUpperCase() + id.slice(1);
  history.replaceState(null, '', '#' + id);
}

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    showPanel(item.dataset.panel);
    if (window.innerWidth < 680) sidebar.classList.remove('open');
  });
});

// Dashboard nav links inside panels
document.querySelectorAll('.dash-nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    showPanel(link.dataset.panel);
  });
});

// Load panel from hash
const hash = location.hash.slice(1);
if (hash) showPanel(hash);

// ── Dark mode toggle ──────────────────────────────
const themeBtn = document.querySelector('.dash-theme-toggle');
function applyTheme(dark) {
  document.body.classList.toggle('dark', dark);
  themeBtn.textContent = dark ? '☀️' : '🌙';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}
themeBtn.addEventListener('click', () => applyTheme(!document.body.classList.contains('dark')));
applyTheme(localStorage.getItem('theme') === 'dark');

// ── Today date ────────────────────────────────────
const todayEl = document.getElementById('todayDate');
if (todayEl) {
  todayEl.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ── Load messages ─────────────────────────────────
async function loadMessages() {
  try {
    const res  = await fetch('/admin/messages');
    const msgs = await res.json();

    // Update badges
    const count = msgs.length;
    document.getElementById('msgBadge').textContent = count;
    document.getElementById('kpi-messages').textContent = count;
    document.getElementById('notifCount').textContent  = count;

    // Recent messages widget (overview)
    const recentEl = document.getElementById('recentMessages');
    if (recentEl) {
      if (!msgs.length) { recentEl.innerHTML = '<p class="loading">No messages yet.</p>'; return; }
      recentEl.innerHTML = msgs.slice(-5).reverse().map(m => `
        <div class="msg-card unread">
          <div class="msg-card-header">
            <div><div class="msg-card-name">${escHtml(m.name)}</div>
            <div class="msg-card-email">${escHtml(m.email)}</div></div>
            <div class="msg-card-date">${formatDate(m.receivedAt)}</div>
          </div>
          <div class="msg-card-body">${escHtml(m.message.slice(0, 100))}${m.message.length > 100 ? '…' : ''}</div>
        </div>`).join('');
    }

    // Full messages panel
    renderMessages(msgs);
  } catch (err) {
    console.error('Could not load messages:', err);
  }
}

function renderMessages(msgs) {
  const listEl = document.getElementById('messagesList');
  if (!listEl) return;
  if (!msgs.length) { listEl.innerHTML = '<p class="loading">No messages yet.</p>'; return; }
  listEl.innerHTML = msgs.slice().reverse().map(m => `
    <div class="msg-card">
      <div class="msg-card-header">
        <div>
          <div class="msg-card-name">${escHtml(m.name)}</div>
          <div class="msg-card-email">${escHtml(m.email)}</div>
          ${m.subject ? `<div class="msg-card-subject">Re: ${escHtml(m.subject)}</div>` : ''}
        </div>
        <div class="msg-card-date">${formatDate(m.receivedAt)}</div>
      </div>
      <div class="msg-card-body">${escHtml(m.message)}</div>
    </div>`).join('');
}

// Message search
const msgSearch = document.getElementById('msgSearch');
if (msgSearch) {
  msgSearch.addEventListener('input', async () => {
    const q = msgSearch.value.toLowerCase();
    const res = await fetch('/admin/messages');
    const msgs = await res.json();
    const filtered = msgs.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q)
    );
    renderMessages(filtered);
  });
}

document.getElementById('refreshMsgs')?.addEventListener('click', loadMessages);

loadMessages();

// ── Chat system ───────────────────────────────────
const chatMessages = document.getElementById('chatMessages');
const chatInput    = document.getElementById('chatInput');
const sendBtn      = document.getElementById('sendBtn');
const emojiBtn     = document.getElementById('emojiBtn');
const emojiPicker  = document.getElementById('emojiPicker');
const clearChatBtn = document.getElementById('clearChatBtn');
const contactItems = document.querySelectorAll('.contact-item');
const kpiChats     = document.getElementById('kpi-chats');

let chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '{}');
let activeUser  = 'general';

function getTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function appendMessage(text, type = 'sent', avatar = '🔐') {
  const msg = document.createElement('div');
  msg.className = 'chat-msg ' + type;
  const avatarEl = type === 'sent'
    ? '<div class="msg-avatar" style="background:#f5a623">AD</div>'
    : `<div class="msg-avatar">${avatar}</div>`;
  msg.innerHTML = `
    ${avatarEl}
    <div class="msg-bubble">
      <p>${escHtml(text)}</p>
      <time>${getTime()}</time>
    </div>`;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Save to history
  if (!chatHistory[activeUser]) chatHistory[activeUser] = [];
  chatHistory[activeUser].push({ text, type, time: getTime() });
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));

  // Update active chat count
  const active = Object.keys(chatHistory).filter(k => chatHistory[k].length > 0).length;
  if (kpiChats) kpiChats.textContent = active;
}

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = '';
  chatInput.style.height = 'auto';
  appendMessage(text, 'sent');
  emojiPicker.classList.remove('open');

  // Simulate auto-reply after 1.2s
  setTimeout(() => {
    const replies = [
      'Thank you for your message! We will get back to you shortly.',
      'Noted. The school admin has been notified.',
      'Hello! How can we assist you today?',
      'Your request has been received. Expect a response within 24 hours.',
      'Great, we will pass this along to the relevant department.'
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    appendMessage(reply, 'received', '🤖');
  }, 1200);
}

sendBtn.addEventListener('click', sendMessage);

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
});

// Emoji picker
emojiBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  emojiPicker.classList.toggle('open');
});
emojiPicker.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', () => {
    chatInput.value += btn.textContent;
    chatInput.focus();
    emojiPicker.classList.remove('open');
  });
});
document.addEventListener('click', () => emojiPicker.classList.remove('open'));

// Clear chat
clearChatBtn?.addEventListener('click', () => {
  if (!confirm('Clear all messages in this channel?')) return;
  chatMessages.innerHTML = `<div class="chat-date-divider">Today</div>
    <div class="chat-msg received">
      <div class="msg-avatar">🤖</div>
      <div class="msg-bubble"><p>Chat cleared.</p><time>${getTime()}</time></div>
    </div>`;
  delete chatHistory[activeUser];
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
});

// Switch contact channels
contactItems.forEach(item => {
  item.addEventListener('click', () => {
    contactItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    activeUser = item.dataset.user;
    document.getElementById('chatWindowTitle').textContent = item.querySelector('strong').textContent;
    document.getElementById('chatWindowSub').textContent   = item.querySelector('small').textContent;

    // Load channel history
    chatMessages.innerHTML = `<div class="chat-date-divider">Today</div>`;
    const history = chatHistory[activeUser] || [];
    if (!history.length) {
      const msg = document.createElement('div');
      msg.className = 'chat-msg received';
      msg.innerHTML = `<div class="msg-avatar">🤖</div>
        <div class="msg-bubble"><p>No messages yet in this channel.</p><time>${getTime()}</time></div>`;
      chatMessages.appendChild(msg);
    } else {
      history.forEach(m => appendMessage(m.text, m.type));
    }

    // Remove unread badge
    const badge = item.querySelector('.unread-badge');
    if (badge) badge.remove();
  });
});

// Contact search
document.getElementById('contactSearch')?.addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  contactItems.forEach(item => {
    const name = item.querySelector('strong').textContent.toLowerCase();
    item.style.display = name.includes(q) ? '' : 'none';
  });
});

// ── Logout ────────────────────────────────────────
document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
  e.preventDefault();
  await fetch('/admin/logout', { method: 'POST' });
  window.location.href = '/admin/login';
});

// ── Add teacher modal (stub) ──────────────────────
document.getElementById('addTeacherBtn')?.addEventListener('click', () => {
  alert('Add Teacher feature coming soon! This will open a form to add a new teacher profile.');
});

// ── Teacher edit/delete buttons ───────────────────
document.querySelectorAll('.btn-edit').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.closest('.admin-teacher-card').querySelector('h4').textContent;
    alert(`Edit profile for ${name} — feature coming soon!`);
  });
});
document.querySelectorAll('.btn-del').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.closest('.admin-teacher-card').querySelector('h4').textContent;
    if (confirm(`Remove ${name} from the teacher list?`)) {
      btn.closest('.admin-teacher-card').remove();
    }
  });
});

// ── Password change (stub) ────────────────────────
document.getElementById('changePasswordForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Password update feature coming soon!');
});

// ── Helpers ───────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
