/* ===== Admin Login Page JS ===== */

const loginForm  = document.getElementById('loginForm');
const loginAlert = document.getElementById('loginAlert');
const loginBtn   = document.getElementById('loginBtn');
const loginBtnText = document.getElementById('loginBtnText');
const loginSpinner = document.getElementById('loginSpinner');
const pwToggle   = document.getElementById('pwToggle');
const pwInput    = document.getElementById('password');

// Password visibility toggle
pwToggle.addEventListener('click', () => {
  const isText = pwInput.type === 'text';
  pwInput.type = isText ? 'password' : 'text';
  pwToggle.textContent = isText ? '👁️' : '🙈';
});

// Show alert
function showAlert(msg, type = 'error') {
  loginAlert.textContent = msg;
  loginAlert.className = 'alert ' + type;
}

// Handle submit
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    showAlert('Please enter both username and password.');
    return;
  }

  // Show loading
  loginBtnText.textContent = 'Signing in…';
  loginSpinner.style.display = 'inline-block';
  loginBtn.disabled = true;

  try {
    const res = await fetch('/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (res.ok) {
      showAlert('Login successful! Redirecting…', 'success');
      setTimeout(() => { window.location.href = '/admin/dashboard'; }, 800);
    } else {
      showAlert(data.message || 'Invalid credentials. Please try again.');
    }
  } catch {
    showAlert('Could not connect to the server. Please try again.');
  } finally {
    loginBtnText.textContent = 'Sign In';
    loginSpinner.style.display = 'none';
    loginBtn.disabled = false;
  }
});

// Enter key submits
document.getElementById('password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') loginForm.dispatchEvent(new Event('submit'));
});

// Apply saved theme
if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');
