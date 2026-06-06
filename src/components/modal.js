/**
 * Modal Component
 * Accessible modal dialogs with focus trapping
 */

let activeModal = null;

/**
 * Show a modal dialog
 * @param {Object} config
 * @param {string} config.title
 * @param {string} config.body - HTML content
 * @param {Array} config.actions - [{label, className, onClick}]
 * @param {boolean} config.closeable - Allow backdrop click to close
 * @returns {Object} - { element, close }
 */
export function showModal(config) {
  const { title, body, actions = [], closeable = true, onClose } = config;

  // Close existing modal
  if (activeModal) closeModal();

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'modal-title');

  let html = `<h3 class="modal-title" id="modal-title">${title}</h3>`;
  html += `<div class="modal-body">${body}</div>`;

  if (actions.length > 0) {
    html += `<div class="modal-actions">`;
    actions.forEach((action, i) => {
      html += `<button class="btn ${action.className || 'btn-secondary'}" id="modal-action-${i}">${action.label}</button>`;
    });
    html += `</div>`;
  }

  modal.innerHTML = html;
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  // Trigger animation
  requestAnimationFrame(() => {
    backdrop.classList.add('active');
  });

  // Bind action handlers
  actions.forEach((action, i) => {
    const btn = modal.querySelector(`#modal-action-${i}`);
    if (btn) {
      btn.addEventListener('click', () => {
        if (action.onClick) action.onClick();
        if (action.autoClose !== false) closeModal();
      });
    }
  });

  // Backdrop click
  if (closeable) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });
  }

  // Escape key
  const escHandler = (e) => {
    if (e.key === 'Escape' && closeable) closeModal();
  };
  document.addEventListener('keydown', escHandler);

  // Focus first button
  const firstBtn = modal.querySelector('.btn');
  if (firstBtn) setTimeout(() => firstBtn.focus(), 100);

  function closeModal() {
    document.removeEventListener('keydown', escHandler);
    backdrop.classList.remove('active');
    setTimeout(() => {
      backdrop.remove();
      activeModal = null;
      if (onClose) onClose();
    }, 200);
  }

  activeModal = { element: backdrop, close: closeModal, modal };

  return activeModal;
}

/**
 * Show a confirmation dialog
 */
export function showConfirm(title, message, onConfirm, onCancel) {
  return showModal({
    title,
    body: `<p>${message}</p>`,
    actions: [
      {
        label: 'Cancel',
        className: 'btn-secondary',
        onClick: onCancel,
      },
      {
        label: 'Confirm',
        className: 'btn-primary',
        onClick: onConfirm,
      },
    ],
  });
}

/**
 * Show OTP verification modal
 */
export function showOTPModal(maskedPhone, onVerify) {
  const modalInstance = showModal({
    title: '🔐 Aadhaar OTP Verification',
    body: `
      <p>An OTP has been sent to <strong>${maskedPhone}</strong></p>
      <div class="otp-inputs" id="otp-inputs">
        <input type="text" class="otp-input" maxlength="1" data-index="0" inputmode="numeric" aria-label="OTP digit 1">
        <input type="text" class="otp-input" maxlength="1" data-index="1" inputmode="numeric" aria-label="OTP digit 2">
        <input type="text" class="otp-input" maxlength="1" data-index="2" inputmode="numeric" aria-label="OTP digit 3">
        <input type="text" class="otp-input" maxlength="1" data-index="3" inputmode="numeric" aria-label="OTP digit 4">
        <input type="text" class="otp-input" maxlength="1" data-index="4" inputmode="numeric" aria-label="OTP digit 5">
        <input type="text" class="otp-input" maxlength="1" data-index="5" inputmode="numeric" aria-label="OTP digit 6">
      </div>
      <p style="text-align:center; font-size: 0.75rem; color: var(--text-tertiary);">Enter any 6-digit code for simulation</p>
    `,
    actions: [
      { label: 'Cancel', className: 'btn-secondary' },
      {
        label: 'Verify OTP',
        className: 'btn-primary',
        autoClose: false,
        onClick: () => {
          const inputs = document.querySelectorAll('#otp-inputs .otp-input');
          const otp = Array.from(inputs).map(i => i.value).join('');
          if (otp.length === 6) {
            onVerify(otp);
            modalInstance.close();
          }
        },
      },
    ],
    closeable: true,
  });

  // Setup OTP input behavior
  setTimeout(() => {
    const inputs = document.querySelectorAll('#otp-inputs .otp-input');
    inputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '');
        e.target.value = val;
        if (val && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && index > 0) {
          inputs[index - 1].focus();
        }
      });

      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        pasted.split('').forEach((char, i) => {
          if (inputs[i]) inputs[i].value = char;
        });
        const lastFilled = Math.min(pasted.length, 6) - 1;
        if (inputs[lastFilled]) inputs[lastFilled].focus();
      });
    });

    if (inputs[0]) inputs[0].focus();
  }, 200);

  return modalInstance;
}
