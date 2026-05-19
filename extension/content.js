/**
 * content.js — runs on every page
 * Listens for text highlight, shows floating save button.
 * ALL API calls are routed through background.js to avoid CORS issues.
 */

let floatingBtn = null;
let currentSelection = null;

// ── Listen for highlight ────────────────────────────────────────────────────

document.addEventListener('mouseup', (e) => {
  // Ignore clicks inside our own floating button
  if (floatingBtn && floatingBtn.contains(e.target)) return;

  const selection = window.getSelection();
  const text = selection?.toString().trim();

  if (!text || text.length < 2) {
    removeFloatingBtn();
    return;
  }

  const anchorNode = selection.anchorNode;
  const parentEl = anchorNode?.parentElement;

  currentSelection = {
    text,
    sentence: getSentenceContext(anchorNode, text),
    paragraph: parentEl?.closest('p')?.innerText?.trim() ?? null,
    sourceUrl: window.location.href,
    sourceTitle: document.title,
  };

  showFloatingBtn(e.clientX, e.clientY);
});

document.addEventListener('mousedown', (e) => {
  if (floatingBtn && !floatingBtn.contains(e.target)) {
    removeFloatingBtn();
  }
});

// ── Floating save button ────────────────────────────────────────────────────

function showFloatingBtn(x, y) {
  removeFloatingBtn();

  floatingBtn = document.createElement('div');
  floatingBtn.id = 'learnclip-btn';
  floatingBtn.innerHTML = `
    <button class="lc-save-btn" title="Save to LearnClip">
      📌 Save
    </button>
  `;

  const btnX = Math.min(x + 8, window.innerWidth - 120);
  const btnY = Math.max(y - 40, 8);
  floatingBtn.style.cssText = `
    position: fixed;
    left: ${btnX}px;
    top: ${btnY}px;
    z-index: 2147483647;
  `;

  floatingBtn.querySelector('.lc-save-btn').addEventListener('click', onSaveClick);
  document.body.appendChild(floatingBtn);
}

function removeFloatingBtn() {
  if (floatingBtn) {
    floatingBtn.remove();
    floatingBtn = null;
  }
}

// ── Save flow ───────────────────────────────────────────────────────────────

async function onSaveClick() {
  if (!currentSelection) return;

  // Check auth status via background (no CORS issue there)
  const { isLoggedIn } = await sendToBackground({ type: 'GET_AUTH_STATUS' });
  if (!isLoggedIn) {
    showToast('Please log in at LearnClip first', 'error');
    removeFloatingBtn();
    return;
  }

  const btn = floatingBtn?.querySelector('.lc-save-btn');
  if (btn) { btn.textContent = '⏳ Saving...'; btn.disabled = true; }

  try {
    // Step 1: suggest category via background (avoids CORS)
    const { category } = await sendToBackground({
      type: 'API_SUGGEST_CATEGORY',
      text: currentSelection.text,
    });

    // Step 2: save via background (avoids CORS)
    const result = await sendToBackground({
      type: 'API_SAVE',
      payload: {
        text: currentSelection.text,
        sentence: currentSelection.sentence,
        paragraph: currentSelection.paragraph,
        sourceUrl: currentSelection.sourceUrl,
        sourceTitle: currentSelection.sourceTitle,
        category,
      },
    });

    if (result.error === 'not_logged_in') {
      showToast('Please log in at LearnClip first', 'error');
    } else if (result.error === 'limit_reached') {
      showToast(result.message ?? 'Monthly limit reached. Upgrade to Pro.', 'error');
    } else if (!result.ok) {
      showToast('Save failed. Try again.', 'error');
    } else {
      showToast(`✅ Saved as "${category}"`, 'success');
    }
  } catch (err) {
    console.error('[LearnClip] Save failed:', err);
    showToast('Save failed. Check your connection.', 'error');
  } finally {
    removeFloatingBtn();
    currentSelection = null;
  }
}

// ── Message helper ──────────────────────────────────────────────────────────

function sendToBackground(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[LearnClip]', chrome.runtime.lastError.message);
        resolve({});
      } else {
        resolve(response ?? {});
      }
    });
  });
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getSentenceContext(anchorNode, selectedText) {
  try {
    const fullText = anchorNode?.textContent ?? '';
    const sentences = fullText.split(/(?<=[.!?])\s+/);
    const containing = sentences.find((s) => s.includes(selectedText));
    return containing?.trim() ?? null;
  } catch {
    return null;
  }
}

function showToast(message, type = 'success') {
  const existing = document.getElementById('learnclip-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'learnclip-toast';
  toast.className = `lc-toast lc-toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}
