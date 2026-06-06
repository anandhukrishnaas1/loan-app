/**
 * Auto-save Module
 * Handles saving form state to localStorage and restoring on page load
 */

const STORAGE_KEY = 'loan_app_state';
const STORAGE_VERSION = 1;
let saveTimeout = null;
let indicatorTimeout = null;

/**
 * Save form state to localStorage (debounced)
 */
export function debouncedSave(state, delay = 500) {
  clearTimeout(saveTimeout);
  showSaveIndicator('saving');

  saveTimeout = setTimeout(() => {
    try {
      const saveData = {
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        currentStep: state.currentStep,
        data: { ...state },
      };

      // Remove non-serializable items (file blobs)
      delete saveData.data.uploadedFiles;
      // Keep file metadata only
      if (state.uploadedFilesMeta) {
        saveData.data.uploadedFilesMeta = state.uploadedFilesMeta;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
      showSaveIndicator('saved');
    } catch (e) {
      console.warn('Auto-save failed:', e);
      showSaveIndicator('error');
    }
  }, delay);
}

/**
 * Load saved state from localStorage
 * @returns {Object|null} - Saved state or null if none exists
 */
export function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const saved = JSON.parse(raw);
    if (saved.version !== STORAGE_VERSION) {
      clearSavedState();
      return null;
    }

    // Check if save is less than 7 days old
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - saved.timestamp > maxAge) {
      clearSavedState();
      return null;
    }

    return saved;
  } catch (e) {
    console.warn('Failed to load saved state:', e);
    return null;
  }
}

/**
 * Clear saved state
 */
export function clearSavedState() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if there's a saved state to resume
 */
export function hasSavedState() {
  return loadSavedState() !== null;
}

/**
 * Get human-readable time since last save
 */
export function getTimeSinceLastSave() {
  const saved = loadSavedState();
  if (!saved) return null;

  const diff = Date.now() - saved.timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

/**
 * Show auto-save indicator
 */
function showSaveIndicator(status) {
  const indicator = document.getElementById('autosave-indicator');
  if (!indicator) return;

  indicator.classList.remove('saving', 'saved');
  indicator.classList.add('visible', status);

  const textEl = indicator.querySelector('.autosave-text');
  if (textEl) {
    switch (status) {
      case 'saving':
        textEl.textContent = 'Saving...';
        break;
      case 'saved':
        textEl.textContent = 'Saved';
        break;
      case 'error':
        textEl.textContent = 'Save failed';
        break;
    }
  }

  clearTimeout(indicatorTimeout);
  if (status === 'saved') {
    indicatorTimeout = setTimeout(() => {
      indicator.classList.remove('visible');
    }, 2000);
  }
}

/**
 * Create the auto-save indicator DOM element
 */
export function createSaveIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'autosave-indicator';
  indicator.className = 'autosave-indicator';
  indicator.innerHTML = `
    <span class="autosave-dot"></span>
    <span class="autosave-text">Saved</span>
  `;
  document.body.appendChild(indicator);
  return indicator;
}
