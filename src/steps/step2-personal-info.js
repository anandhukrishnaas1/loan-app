/**
 * Step 2: Personal Information
 * PAN & Aadhaar verification with simulation
 */

import { validators, setupRealtimeValidation, validateField, applyValidationState } from '../utils/validation.js';
import { verifyPAN, sendAadhaarOTP, verifyAadhaarOTP, formatPAN, formatAadhaar } from '../utils/pan-aadhaar.js';
import { showOTPModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

export function renderStep2(state, onUpdate) {
  const container = document.createElement('div');
  container.className = 'step-content';
  container.id = 'step-2';

  container.innerHTML = `
    <div class="step-header">
      <h2 class="step-title">Personal Information</h2>
      <p class="step-description">Please provide your identity details. PAN and Aadhaar verification is required to proceed.</p>
    </div>

    <div class="glass-card">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="fullName">Full Name <span class="required">*</span></label>
          <input type="text" class="form-input" id="fullName" name="fullName"
            placeholder="As per PAN card" autocomplete="name"
            value="${state.fullName || ''}" required>
          <div class="form-error" id="fullName-error"></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="dob">Date of Birth <span class="required">*</span></label>
          <input type="date" class="form-input" id="dob" name="dob"
            value="${state.dob || ''}" max="${new Date().toISOString().split('T')[0]}" required>
          <div class="form-error" id="dob-error"></div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Gender <span class="required">*</span></label>
          <div class="radio-group" id="gender-group">
            <label class="radio-option ${state.gender === 'male' ? 'selected' : ''}">
              <input type="radio" name="gender" value="male" ${state.gender === 'male' ? 'checked' : ''}>
              <span class="radio-dot"></span>
              Male
            </label>
            <label class="radio-option ${state.gender === 'female' ? 'selected' : ''}">
              <input type="radio" name="gender" value="female" ${state.gender === 'female' ? 'checked' : ''}>
              <span class="radio-dot"></span>
              Female
            </label>
            <label class="radio-option ${state.gender === 'other' ? 'selected' : ''}">
              <input type="radio" name="gender" value="other" ${state.gender === 'other' ? 'checked' : ''}>
              <span class="radio-dot"></span>
              Other
            </label>
          </div>
          <div class="form-error" id="gender-error"></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="maritalStatus">Marital Status <span class="required">*</span></label>
          <select class="form-select" id="maritalStatus" name="maritalStatus">
            <option value="">Select</option>
            <option value="single" ${state.maritalStatus === 'single' ? 'selected' : ''}>Single</option>
            <option value="married" ${state.maritalStatus === 'married' ? 'selected' : ''}>Married</option>
            <option value="divorced" ${state.maritalStatus === 'divorced' ? 'selected' : ''}>Divorced</option>
            <option value="widowed" ${state.maritalStatus === 'widowed' ? 'selected' : ''}>Widowed</option>
          </select>
          <div class="form-error" id="maritalStatus-error"></div>
        </div>
      </div>

      <!-- PAN Verification -->
      <div class="form-group">
        <label class="form-label" for="panNumber">PAN Number <span class="required">*</span></label>
        <div class="verification-row">
          <div class="form-group" style="margin-bottom:0">
            <input type="text" class="form-input" id="panNumber" name="panNumber"
              placeholder="ABCDE1234F" maxlength="10"
              value="${state.panNumber || ''}" style="text-transform:uppercase">
            <div class="form-error" id="panNumber-error"></div>
          </div>
          <div class="verify-btn-container">
            <button type="button" class="btn btn-sm btn-secondary" id="verify-pan-btn"
              ${state.panVerified ? 'disabled' : ''}>
              ${state.panVerified ? '✓ Verified' : 'Verify PAN'}
            </button>
          </div>
        </div>
        <div class="verify-status ${state.panVerified ? 'verified' : ''}" id="pan-status">
          ${state.panVerified ? '<span class="verified-badge">PAN Verified</span>' : ''}
        </div>
      </div>

      <!-- Aadhaar Verification -->
      <div class="form-group">
        <label class="form-label" for="aadhaarNumber">Aadhaar Number <span class="required">*</span></label>
        <div class="verification-row">
          <div class="form-group" style="margin-bottom:0">
            <input type="text" class="form-input" id="aadhaarNumber" name="aadhaarNumber"
              placeholder="XXXX XXXX XXXX" maxlength="14"
              value="${state.aadhaarNumber || ''}" inputmode="numeric">
            <div class="form-error" id="aadhaarNumber-error"></div>
          </div>
          <div class="verify-btn-container">
            <button type="button" class="btn btn-sm btn-secondary" id="verify-aadhaar-btn"
              ${state.aadhaarVerified ? 'disabled' : ''}>
              ${state.aadhaarVerified ? '✓ Verified' : 'Send OTP'}
            </button>
          </div>
        </div>
        <div class="verify-status ${state.aadhaarVerified ? 'verified' : ''}" id="aadhaar-status">
          ${state.aadhaarVerified ? '<span class="verified-badge">Aadhaar Verified</span>' : ''}
        </div>
      </div>
    </div>
  `;

  // Bind events after render
  setTimeout(() => {
    const fullName = container.querySelector('#fullName');
    const dob = container.querySelector('#dob');
    const maritalStatus = container.querySelector('#maritalStatus');
    const panInput = container.querySelector('#panNumber');
    const aadhaarInput = container.querySelector('#aadhaarNumber');

    // Real-time validation
    setupRealtimeValidation(fullName, [v => validators.required(v, 'Full name'), v => validators.minLength(v, 3, 'Name')]);
    setupRealtimeValidation(dob, [v => validators.required(v, 'Date of birth'), validators.dob]);
    setupRealtimeValidation(maritalStatus, [v => validators.required(v, 'Marital status')]);

    // State updates
    [fullName, dob, maritalStatus].forEach(el => {
      el.addEventListener('input', () => onUpdate(el.name || el.id, el.value));
      el.addEventListener('change', () => onUpdate(el.name || el.id, el.value));
    });

    // PAN formatting
    panInput.addEventListener('input', () => {
      panInput.value = formatPAN(panInput.value);
      onUpdate('panNumber', panInput.value);
    });

    // Aadhaar formatting
    aadhaarInput.addEventListener('input', () => {
      aadhaarInput.value = formatAadhaar(aadhaarInput.value);
      onUpdate('aadhaarNumber', aadhaarInput.value);
    });

    // Gender radio
    container.querySelectorAll('input[name="gender"]').forEach(radio => {
      radio.addEventListener('change', () => {
        container.querySelectorAll('.radio-option').forEach(opt => opt.classList.remove('selected'));
        radio.closest('.radio-option').classList.add('selected');
        onUpdate('gender', radio.value);
      });
    });

    // PAN Verify
    container.querySelector('#verify-pan-btn').addEventListener('click', async () => {
      const btn = container.querySelector('#verify-pan-btn');
      const status = container.querySelector('#pan-status');
      const panVal = panInput.value.trim();

      const error = validators.pan(panVal);
      if (error) {
        applyValidationState(panInput, error);
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner spinner-sm"></span> Verifying...';
      status.className = 'verify-status verifying';
      status.textContent = 'Verifying PAN...';

      const result = await verifyPAN(panVal);

      if (result.success) {
        btn.textContent = '✓ Verified';
        status.className = 'verify-status verified';
        status.innerHTML = `<span class="verified-badge">PAN Verified</span> <span style="margin-left:8px;color:var(--text-secondary);font-size:0.8rem">Name: ${result.name}</span>`;
        panInput.classList.add('is-valid');
        panInput.classList.remove('is-invalid');
        onUpdate('panVerified', true);
        onUpdate('panName', result.name);
        showToast('success', 'PAN Verified', `Name: ${result.name}`);
      } else {
        btn.disabled = false;
        btn.textContent = 'Verify PAN';
        status.className = 'verify-status failed';
        status.textContent = result.error;
        onUpdate('panVerified', false);
        showToast('error', 'Verification Failed', result.error);
      }
    });

    // Aadhaar Verify
    container.querySelector('#verify-aadhaar-btn').addEventListener('click', async () => {
      const btn = container.querySelector('#verify-aadhaar-btn');
      const status = container.querySelector('#aadhaar-status');
      const aadhaarVal = aadhaarInput.value.replace(/\s/g, '');

      const error = validators.aadhaar(aadhaarVal);
      if (error) {
        applyValidationState(aadhaarInput, error);
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner spinner-sm"></span> Sending OTP...';
      status.className = 'verify-status verifying';
      status.textContent = 'Sending OTP...';

      const result = await sendAadhaarOTP(aadhaarVal);

      if (result.success) {
        status.textContent = '';
        showOTPModal(result.message.split('ending in ')[1] || '****', async (otp) => {
          status.className = 'verify-status verifying';
          status.textContent = 'Verifying OTP...';

          const verifyResult = await verifyAadhaarOTP(otp, result.transactionId);

          if (verifyResult.success) {
            btn.textContent = '✓ Verified';
            status.className = 'verify-status verified';
            status.innerHTML = '<span class="verified-badge">Aadhaar Verified</span>';
            aadhaarInput.classList.add('is-valid');
            aadhaarInput.classList.remove('is-invalid');
            onUpdate('aadhaarVerified', true);
            showToast('success', 'Aadhaar Verified', verifyResult.message);
          } else {
            btn.disabled = false;
            btn.textContent = 'Send OTP';
            status.className = 'verify-status failed';
            status.textContent = verifyResult.error;
            showToast('error', 'Verification Failed', verifyResult.error);
          }
        });

        btn.disabled = false;
        btn.textContent = 'Send OTP';
      } else {
        btn.disabled = false;
        btn.textContent = 'Send OTP';
        status.className = 'verify-status failed';
        status.textContent = result.error;
      }
    });
  }, 0);

  return container;
}

export function validateStep2(state) {
  const errors = {};
  let valid = true;

  if (!state.fullName?.trim()) { errors.fullName = 'Full name is required'; valid = false; }
  if (!state.dob) { errors.dob = 'Date of birth is required'; valid = false; }
  else { const e = validators.dob(state.dob); if (e) { errors.dob = e; valid = false; } }
  if (!state.gender) { errors.gender = 'Gender is required'; valid = false; }
  if (!state.maritalStatus) { errors.maritalStatus = 'Marital status is required'; valid = false; }
  if (!state.panNumber) { errors.panNumber = 'PAN number is required'; valid = false; }
  else { const e = validators.pan(state.panNumber); if (e) { errors.panNumber = e; valid = false; } }
  if (!state.panVerified) { errors.panNumber = errors.panNumber || 'Please verify your PAN'; valid = false; }
  if (!state.aadhaarNumber) { errors.aadhaarNumber = 'Aadhaar number is required'; valid = false; }
  else { const e = validators.aadhaar(state.aadhaarNumber.replace(/\s/g, '')); if (e) { errors.aadhaarNumber = e; valid = false; } }
  if (!state.aadhaarVerified) { errors.aadhaarNumber = errors.aadhaarNumber || 'Please verify your Aadhaar'; valid = false; }

  return { valid, errors };
}
