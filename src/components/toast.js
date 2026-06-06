/**
 * Toast Notification Component
 * Auto-dismissing notifications with stacking
 */

let toastContainer = null;

function ensureContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

/**
 * Show a toast notification
 * @param {'success'|'error'|'info'|'warning'} type
 * @param {string} title
 * @param {string} message
 * @param {number} duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
 */
export function showToast(type, title, message = '', duration = 4000) {
  const container = ensureContainer();

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
    <button class="toast-close" aria-label="Close notification">&times;</button>
  `;

  if (duration > 0) {
    const progress = document.createElement('div');
    progress.className = 'toast-progress';
    progress.style.animationDuration = `${duration}ms`;
    toast.appendChild(progress);
    toast.style.position = 'relative';
  }

  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => removeToast(toast));

  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(() => removeToast(toast), duration);
  }

  // Limit visible toasts
  const toasts = container.querySelectorAll('.toast:not(.removing)');
  if (toasts.length > 5) {
    removeToast(toasts[0]);
  }

  return toast;
}

function removeToast(toast) {
  if (!toast || toast.classList.contains('removing')) return;
  toast.classList.add('removing');
  setTimeout(() => toast.remove(), 300);
}
