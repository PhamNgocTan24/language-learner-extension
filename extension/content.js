/**
 * content.js - runs on every page.
 * Listens for text highlight, then shows a LearnClip save confirmation panel.
 */

const CATEGORIES = ['Vocabulary', 'Phrase', 'Grammar', 'Idiom'];

let floatingBtn = null;
let confirmationPanel = null;
let currentSelection = null;
let savedText = '';
let selectedCategory = 'Vocabulary';

document.addEventListener('mouseup', (e) => {
  if (floatingBtn && floatingBtn.contains(e.target)) return;
  if (confirmationPanel && confirmationPanel.contains(e.target)) return;

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
    sentence: getSentenceContext(anchorNode, text) ?? '',
    paragraph: parentEl?.closest('p')?.innerText?.trim() ?? '',
    sourceUrl: window.location.href,
    sourceTitle: document.title,
  };

  showFloatingBtn(e.clientX, e.clientY);
});

document.addEventListener('mousedown', (e) => {
  if (floatingBtn && !floatingBtn.contains(e.target)) {
    removeFloatingBtn();
  }
  if (confirmationPanel && !confirmationPanel.contains(e.target)) {
    removeConfirmationPanel();
  }
});

function showFloatingBtn(x, y) {
  removeFloatingBtn();

  floatingBtn = document.createElement('div');
  floatingBtn.id = 'learnclip-btn';
  floatingBtn.innerHTML = `
    <button class="lc-save-btn" title="Save to LearnClip">
      Save
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

  floatingBtn.querySelector('.lc-save-btn').addEventListener('click', openSavePanel);
  document.body.appendChild(floatingBtn);
}

function removeFloatingBtn() {
  if (floatingBtn) {
    floatingBtn.remove();
    floatingBtn = null;
  }
}

function removeConfirmationPanel() {
  if (confirmationPanel) {
    confirmationPanel.remove();
    confirmationPanel = null;
  }
}

async function openSavePanel() {
  if (!currentSelection) return;

  const { isLoggedIn, error } = await sendToBackground({ type: 'GET_AUTH_STATUS' });
  if (error === 'extension_context_invalidated') {
    showToast('Extension was reloaded. Refresh this page and try again.', 'error');
    removeFloatingBtn();
    return;
  }

  if (!isLoggedIn) {
    showToast('Please log in at LearnClip first', 'error');
    removeFloatingBtn();
    return;
  }

  const rect = floatingBtn?.getBoundingClientRect();
  const x = rect?.left ?? window.innerWidth / 2;
  const y = rect?.bottom ?? 80;
  removeFloatingBtn();

  savedText = currentSelection.text;
  selectedCategory = 'Vocabulary';
  renderConfirmationPanel(x, y, true, null);

  const suggestion = await sendToBackground({
    type: 'API_SUGGEST_SAVE',
    text: currentSelection.text,
    sentence: currentSelection.sentence,
    paragraph: currentSelection.paragraph,
  });

  if (!confirmationPanel) return;
  selectedCategory = CATEGORIES.includes(suggestion.category) ? suggestion.category : 'Vocabulary';
  renderConfirmationPanel(x, y, false, suggestion.suggest_correct_word ?? null);
}

function renderConfirmationPanel(x, y, loading, suggestCorrectWord) {
  removeConfirmationPanel();

  confirmationPanel = document.createElement('div');
  confirmationPanel.id = 'learnclip-confirm';

  const panelX = Math.min(x, window.innerWidth - 340);
  const panelY = Math.min(y + 8, window.innerHeight - 260);
  const correctedText = normalizeSuggestion(suggestCorrectWord);
  const contextText =
    currentSelection?.sentence || currentSelection?.paragraph || currentSelection?.text || savedText;

  confirmationPanel.style.cssText = `
    position: fixed;
    left: ${Math.max(panelX, 8)}px;
    top: ${Math.max(panelY, 8)}px;
    z-index: 2147483647;
  `;

  confirmationPanel.innerHTML = `
    <div class="lc-confirm-card">
      <div class="lc-confirm-header">
        <span class="lc-logo-mark" aria-hidden="true"></span>
        <span class="lc-confirm-title">LearnClip</span>
      </div>
      <div class="lc-divider"></div>

      <div class="lc-highlight-block">
        <div class="lc-edit-wrap">
          <input class="lc-highlight-input" type="text" value="${escapeHtml(savedText)}" />
          <span class="lc-edit-icon" aria-hidden="true">✎</span>
        </div>
        ${
          correctedText
            ? `
        <button class="lc-suggestion-chip" type="button">
          <span class="lc-suggestion-icon" aria-hidden="true">💡</span>
          ${escapeHtml(correctedText)}
        </button>
      `
            : ''
        }
        <p class="lc-context">${renderContextSnippet(
          contextText,
          currentSelection?.text ?? savedText,
          savedText,
        )}</p>
      </div>

      <label class="lc-label">Category ${loading ? '<span class="lc-loading">suggesting...</span>' : ''}</label>
      <div class="lc-category-row">
        ${CATEGORIES.map(
          (cat) => `
          <button type="button" class="lc-category-chip ${cat === selectedCategory ? 'is-active' : ''}" data-category="${cat}">
            ${cat}
          </button>
        `,
        ).join('')}
      </div>
      <div class="lc-actions">
        <button class="lc-confirm-save-btn" type="button">Save</button>
      </div>
    </div>
  `;

  const input = confirmationPanel.querySelector('.lc-highlight-input');
  input.addEventListener('input', (event) => {
    savedText = event.target.value;
    renderConfirmationPanel(x, y, false, suggestCorrectWord);
  });
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);

  const suggestionButton = confirmationPanel.querySelector('.lc-suggestion-chip');
  if (suggestionButton) {
    suggestionButton.addEventListener('click', () => {
      savedText = correctedText;
      renderConfirmationPanel(x, y, false, suggestCorrectWord);
    });
  }

  confirmationPanel.querySelectorAll('.lc-category-chip').forEach((button) => {
    button.addEventListener('click', () => {
      selectedCategory = button.dataset.category;
      renderConfirmationPanel(x, y, false, suggestCorrectWord);
    });
  });
  confirmationPanel.querySelector('.lc-confirm-save-btn').addEventListener('click', confirmSave);

  document.body.appendChild(confirmationPanel);
}

async function confirmSave() {
  if (!currentSelection) return;

  const btn = confirmationPanel?.querySelector('.lc-confirm-save-btn');
  if (btn) {
    btn.textContent = 'Saving...';
    btn.disabled = true;
  }

  try {
    const result = await sendToBackground({
      type: 'API_SAVE',
      payload: {
        text: savedText.trim(),
        sentence: currentSelection.sentence,
        paragraph: currentSelection.paragraph,
        sourceUrl: currentSelection.sourceUrl,
        sourceTitle: currentSelection.sourceTitle,
        category: selectedCategory,
      },
    });

    if (result.error === 'not_logged_in') {
      showToast('Please log in at LearnClip first', 'error');
    } else if (result.error === 'limit_reached') {
      showToast(result.message ?? 'Monthly limit reached. Upgrade to Pro.', 'error');
    } else if (!result.ok) {
      showToast('Save failed. Try again.', 'error');
    } else {
      showToast(`Saved as "${selectedCategory}"`, 'success');
    }
  } catch (err) {
    console.error('[LearnClip] Save failed:', err);
    showToast('Save failed. Check your connection.', 'error');
  } finally {
    removeConfirmationPanel();
    currentSelection = null;
  }
}

function sendToBackground(message) {
  return new Promise((resolve) => {
    if (!globalThis.chrome?.runtime?.id) {
      resolve({ ok: false, error: 'extension_context_invalidated' });
      return;
    }

    try {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[LearnClip]', chrome.runtime.lastError.message);
          resolve({ ok: false, error: 'extension_context_invalidated' });
        } else {
          resolve(response ?? {});
        }
      });
    } catch (err) {
      console.error('[LearnClip] Failed to message extension background:', err);
      resolve({ ok: false, error: 'extension_context_invalidated' });
    }
  });
}

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

function normalizeSuggestion(value) {
  const suggestion = String(value ?? '').trim();
  if (!suggestion) return null;
  if (suggestion.toLowerCase() === savedText.trim().toLowerCase()) return null;
  return suggestion;
}

function renderContextSnippet(context, highlightedText, fallbackText) {
  const text = String(context ?? '').trim();
  const highlight = String(highlightedText ?? '').trim();
  const fallback = String(fallbackText ?? '').trim();

  if (!text || !highlight) {
    return `...<span class="lc-context-highlight">${escapeHtml(highlight || fallback || text)}</span>...`;
  }

  const index = text.toLowerCase().indexOf(highlight.toLowerCase());
  if (index === -1) {
    const fallbackIndex = fallback ? text.toLowerCase().indexOf(fallback.toLowerCase()) : -1;
    if (fallbackIndex === -1) {
      return `...<span class="lc-context-highlight">${escapeHtml(highlight)}</span>...`;
    }

    return renderContextSnippet(text, fallback, '');
  }

  const beforeStart = Math.max(index - 28, 0);
  const afterEnd = Math.min(index + highlight.length + 28, text.length);
  const before = text.slice(beforeStart, index);
  const match = text.slice(index, index + highlight.length);
  const after = text.slice(index + highlight.length, afterEnd);
  const prefix = beforeStart > 0 ? '...' : '';
  const suffix = afterEnd < text.length ? '...' : '';

  return `${prefix}${escapeHtml(before)}<span class="lc-context-highlight">${escapeHtml(match)}</span>${escapeHtml(after)}${suffix}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
