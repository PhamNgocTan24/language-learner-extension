/**
 * popup.js — controls the extension popup UI
 */

const FRONTEND_URL = 'http://localhost:3001';
const API_AUTH_URL = 'http://localhost:3000/auth/google';

const viewLogout = document.getElementById('view-logout');
const viewLogin = document.getElementById('view-login');
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');
const btnDashboard = document.getElementById('btn-dashboard');
const userEmail = document.getElementById('user-email');
const userLevel = document.getElementById('user-level');
const statSaves = document.getElementById('stat-saves');
const statAccuracy = document.getElementById('stat-accuracy');

// Set login URL
btnLogin.href = API_AUTH_URL;
btnDashboard.href = `${FRONTEND_URL}/dashboard`;

// ── Init ─────────────────────────────────────────────────────────────────────

async function init() {
  const { isLoggedIn } = await sendMessage({ type: 'GET_AUTH_STATUS' });

  if (isLoggedIn) {
    showLoggedIn();
    await loadUserData();
  } else {
    showLoggedOut();
  }
}

function showLoggedIn() {
  viewLogout.classList.add('hidden');    // hide "logged out" view
  viewLogin.classList.remove('hidden');  // show "logged in" view
}

function showLoggedOut() {
  viewLogin.classList.add('hidden');     // hide "logged in" view
  viewLogout.classList.remove('hidden'); // show "logged out" view
}

async function loadUserData() {
  try {
    const [{ user: me }, { stats }] = await Promise.all([
      sendMessage({ type: 'API_GET_ME' }),
      sendMessage({ type: 'API_GET_STATS' }),
    ]);

    if (me) {
      userEmail.textContent = me.email ?? '—';
      userLevel.textContent = me.level ?? 'B1';
    }

    if (stats) {
      statAccuracy.textContent = stats.accuracy != null ? `${stats.accuracy}%` : '—';
    }

    statSaves.textContent = '—';
  } catch (err) {
    console.error('[LearnClip popup] Failed to load user data:', err);
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────

btnLogout.addEventListener('click', async () => {
  await sendMessage({ type: 'LOGOUT' });
  showLoggedOut();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function sendMessage(msg) {
  return new Promise((resolve) => chrome.runtime.sendMessage(msg, resolve));
}

init();
