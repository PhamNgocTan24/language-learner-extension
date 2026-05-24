/**
 * background.js — Manifest V3 service worker
 * All API calls are routed through here to avoid CORS issues in content scripts.
 *
 * Token delivery: watches for the OAuth callback URL and extracts tokens
 * directly — no sendMessage timing issues.
 */

importScripts('config.js');

const CONFIG = globalThis.LEARNCLIP_CONFIG;
const API_BASE = CONFIG.apiBaseUrl;
const CALLBACK_ORIGIN = CONFIG.frontendUrl;

// ── Watch OAuth callback tab for tokens ───────────────────────────────────────
// This fires whenever ANY tab navigates, including the OAuth redirect.
// We extract tokens from the URL directly — reliable, no sendMessage needed.

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!tab.url) return;

  try {
    const url = new URL(tab.url);
    if (
      url.origin === CALLBACK_ORIGIN &&
      url.pathname === '/auth/callback' &&
      url.searchParams.has('accessToken')
    ) {
      const accessToken = url.searchParams.get('accessToken');
      const refreshToken = url.searchParams.get('refreshToken');
      if (!accessToken || !refreshToken) return;

      const tokenExpiry = Date.now() + 14 * 60 * 1000;
      chrome.storage.local.set({ accessToken, refreshToken, tokenExpiry }, () => {
        console.log('[LearnClip] Tokens captured from OAuth callback tab');
      });
    }
  } catch {
    // ignore malformed URLs
  }
});

// ── Unified message handler ──────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // Route to the correct async handler and keep the channel open with return true
  handleMessage(message, sendResponse);
  return true; // MUST be synchronous return true — keeps channel open
});

async function handleMessage(message, sendResponse) {
  try {
    switch (message.type) {
      case 'AUTH_TOKENS': {
        const { accessToken, refreshToken } = message;
        const tokenExpiry = Date.now() + 14 * 60 * 1000; // 14 min
        await chromeSet({ accessToken, refreshToken, tokenExpiry });
        console.log('[LearnClip] Tokens stored');
        sendResponse({ ok: true });
        break;
      }

      case 'GET_AUTH_STATUS': {
        const result = await chromeGet(['accessToken', 'tokenExpiry']);
        const isLoggedIn = !!(
          result.accessToken &&
          result.tokenExpiry &&
          Date.now() < result.tokenExpiry
        );
        sendResponse({ isLoggedIn });
        break;
      }

      case 'LOGOUT': {
        await chromeRemove(['accessToken', 'refreshToken', 'tokenExpiry']);
        sendResponse({ ok: true });
        break;
      }

      case 'REFRESH_TOKEN': {
        const ok = await refreshAccessToken();
        sendResponse({ ok });
        break;
      }

      case 'API_SUGGEST_CATEGORY': {
        const token = await getToken();
        if (!token) {
          sendResponse({ category: 'Vocabulary' });
          break;
        }

        try {
          const res = await fetch(`${API_BASE}/saves/suggest-category`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ text: message.text }),
          });
          const data = res.ok ? await res.json() : {};
          sendResponse({ category: data.category ?? 'Vocabulary' });
        } catch {
          sendResponse({ category: 'Vocabulary' });
        }
        break;
      }

      case 'API_SUGGEST_SAVE': {
        const token = await getToken();
        if (!token) {
          sendResponse({ category: 'Vocabulary', suggest_correct_word: null });
          break;
        }

        try {
          const res = await fetch(`${API_BASE}/saves/suggest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              text: message.text,
              sentence: message.sentence ?? '',
              paragraph: message.paragraph ?? '',
            }),
          });
          const data = res.ok ? await res.json() : {};
          sendResponse({
            category: data.category ?? 'Vocabulary',
            suggest_correct_word: data.suggest_correct_word ?? null,
          });
        } catch {
          sendResponse({ category: 'Vocabulary', suggest_correct_word: null });
        }
        break;
      }

      case 'API_SAVE': {
        const token = await getToken();
        if (!token) {
          sendResponse({ ok: false, error: 'not_logged_in' });
          break;
        }

        try {
          const res = await fetch(`${API_BASE}/saves`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(message.payload),
          });
          if (res.status === 403) {
            const data = await res.json().catch(() => ({}));
            sendResponse({ ok: false, error: 'limit_reached', message: data.message });
          } else if (!res.ok) {
            sendResponse({ ok: false, error: `api_${res.status}` });
          } else {
            sendResponse({ ok: true });
          }
        } catch (err) {
          console.error('[LearnClip] API_SAVE error:', err);
          sendResponse({ ok: false, error: 'network_error' });
        }
        break;
      }

      case 'API_GET_ME': {
        const token = await getToken();
        if (!token) {
          sendResponse({ user: null });
          break;
        }

        try {
          const res = await fetch(`${API_BASE}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const user = res.ok ? await res.json() : null;
          sendResponse({ user });
        } catch {
          sendResponse({ user: null });
        }
        break;
      }

      case 'API_GET_STATS': {
        const token = await getToken();
        if (!token) {
          sendResponse({ stats: null });
          break;
        }

        try {
          const res = await fetch(`${API_BASE}/users/me/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const stats = res.ok ? await res.json() : null;
          sendResponse({ stats });
        } catch {
          sendResponse({ stats: null });
        }
        break;
      }

      default:
        sendResponse({});
    }
  } catch (err) {
    console.error('[LearnClip] handleMessage error:', err);
    sendResponse({ ok: false, error: 'internal_error' });
  }
}

// ── Token helpers ─────────────────────────────────────────────────────────────

async function getToken() {
  const result = await chromeGet(['accessToken', 'tokenExpiry']);
  const { accessToken, tokenExpiry } = result;
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) return accessToken;
  // Try refresh
  const refreshed = await refreshAccessToken();
  if (refreshed) {
    const r2 = await chromeGet(['accessToken']);
    return r2.accessToken ?? null;
  }
  return null;
}

async function refreshAccessToken() {
  const result = await chromeGet(['refreshToken']);
  if (!result.refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: result.refreshToken }),
    });
    if (!res.ok) return false;
    const { accessToken } = await res.json();
    const tokenExpiry = Date.now() + 14 * 60 * 1000;
    await chromeSet({ accessToken, tokenExpiry });
    return true;
  } catch {
    return false;
  }
}

// ── chrome.storage promise wrappers ──────────────────────────────────────────

function chromeGet(keys) {
  return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
}

function chromeSet(items) {
  return new Promise((resolve) => chrome.storage.local.set(items, resolve));
}

function chromeRemove(keys) {
  return new Promise((resolve) => chrome.storage.local.remove(keys, resolve));
}
