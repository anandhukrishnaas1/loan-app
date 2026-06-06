/**
 * Step 6: Financial Information
 * Existing loans, obligations, bank details, credit score
 */

import { validators, setupRealtimeValidation, formatCurrency } from '../utils/validation.js';

export function renderStep6(state, onUpdate) {
  const container = document.createElement('div');
  container.className = 'step-content';
  container.id = 'step-6';

  // Existing loans rows
  const existingLoans = state.existingLoans || [];

  container.innerHTML = `
    <div class="step-header">
      <h2 class="step-title">Financial Information</h2>
      <p class="step-description">Provide details about your existing financial commitments and bank account.</p>
    </div>

    <div class="glass-card">
      <!-- Existing Loans -->
      <div class="form-group">
        <label class="form-label">Existing Loans / EMIs</label>
        <div class="dynamic-rows" id="existing-loans">
          ${existingLoans.map((loan, i) => createLoanRowHTML(loan, i)).join('')}
        </div>
        <button type="button" class="add-row-btn mt-md" id="add-loan-btn">
          <span>+</span> Add Existing Loan
        </button>
      </div>

      <!-- Total Obligations -->
      <div class="form-group">
        <label class="form-label">Total Monthly Obligations</label>
        <div class="range-value" id="obligations-total" style="font-size:1.25rem; text-align:left">
          ${formatCurrency(state.totalObligations || 0)}
        </div>
        ${state.monthlyIncome ? `
          <div style="font-size:0.75rem; color:var(--text-tertiary); margin-top:4px">
            ${((state.totalObligations || 0) / state.monthlyIncome * 100).toFixed(1)}% of monthly income
          </div>
        ` : ''}
      </div>

      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:var(--space-xl) 0">

      <!-- Credit Score -->
      <div class="form-group">
        <label class="form-label" for="creditScore">Self-Declared Credit Score Range <span class="required">*</span></label>
        <select class="form-select" id="creditScore" name="creditScore">
          <option value="">Select Range</option>
          <option value="300-500" ${state.creditScore === '300-500' ? 'selected' : ''}>300-500 (Poor)</option>
          <option value="500-650" ${state.creditScore === '500-650' ? 'selected' : ''}>500-650 (Below Average)</option>
          <option value="650-750" ${state.creditScore === '650-750' ? 'selected' : ''}>650-750 (Good)</option>
          <option value="750-900" ${state.creditScore === '750-900' ? 'selected' : ''}>750-900 (Excellent)</option>
          <option value="unknown" ${state.creditScore === 'unknown' ? 'selected' : ''}>Don't Know</option>
        </select>
        <div class="form-error" id="creditScore-error"></div>
      </div>

      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:var(--space-xl) 0">

      <!-- Bank Account Details -->
      <h4 style="margin-bottom:var(--space-lg)">Bank Account Details</h4>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="bankName">Bank Name <span class="required">*</span></label>
          <input type="text" class="form-input" id="bankName" name="bankName"
            placeholder="e.g. State Bank of India" value="${state.bankName || ''}">
          <div class="form-error" id="bankName-error"></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="accountNumber">Account Number <span class="required">*</span></label>
          <input type="text" class="form-input" id="accountNumber" name="accountNumber"
            placeholder="9-18 digit account number" inputmode="numeric" maxlength="18"
            value="${state.accountNumber || ''}">
          <div class="form-error" id="accountNumber-error"></div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="ifscCode">IFSC Code <span class="required">*</span></label>
          <input type="text" class="form-input" id="ifscCode" name="ifscCode"
            placeholder="SBIN0001234" maxlength="11" style="text-transform:uppercase"
            value="${state.ifscCode || ''}">
          <div class="form-error" id="ifscCode-error"></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="accountType">Account Type <span class="required">*</span></label>
          <select class="form-select" id="accountType" name="accountType">
            <option value="">Select</option>
            <option value="savings" ${state.accountType === 'savings' ? 'selected' : ''}>Savings</option>
            <option value="current" ${state.accountType === 'current' ? 'selected' : ''}>Current</option>
          </select>
          <div class="form-error" id="accountType-error"></div>
        </div>
      </div>
    </div>
  `;

  function createLoanRowHTML(loan = {}, index) {
    return `
      <div class="dynamic-row" data-index="${index}">
        <div class="form-group" style="margin-bottom:0">
          <label class="form-label" style="font-size:0.65rem">Loan Type</label>
          <select class="form-select loan-type-select" style="padding:0.5rem">
            <option value="">Select</option>
            <option value="personal" ${loan.type === 'personal' ? 'selected' : ''}>Personal</option>
            <option value="home" ${loan.type === 'home' ? 'selected' : ''}>Home</option>
            <option value="car" ${loan.type === 'car' ? 'selected' : ''}>Car</option>
            <option value="education" ${loan.type === 'education' ? 'selected' : ''}>Education</option>
            <option value="credit-card" ${loan.type === 'credit-card' ? 'selected' : ''}>Credit Card</option>
            <option value="other" ${loan.type === 'other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom:0">
          <label class="form-label" style="font-size:0.65rem">Monthly EMI (₹)</label>
          <input type="text" class="form-input loan-emi-input" style="padding:0.5rem"
            placeholder="EMI amount" inputmode="numeric" value="${loan.emi || ''}">
        </div>
        <button type="button" class="btn btn-icon btn-danger btn-remove" title="Remove">×</button>
      </div>
    `;
  }

  setTimeout(() => {
    const loansContainer = container.querySelector('#existing-loans');

    // Add loan row
    container.querySelector('#add-loan-btn').addEventListener('click', () => {
      const index = loansContainer.children.length;
      const row = document.createElement('div');
      row.innerHTML = createLoanRowHTML({}, index);
      const newRow = row.firstElementChild;
      loansContainer.appendChild(newRow);
      bindRowEvents(newRow);
      updateObligations();
    });

    // Bind existing rows
    loansContainer.querySelectorAll('.dynamic-row').forEach(bindRowEvents);

    function bindRowEvents(row) {
      row.querySelector('.btn-remove').addEventListener('click', () => {
        row.remove();
        updateObligations();
      });

      row.querySelector('.loan-emi-input').addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^\d]/g, '');
        updateObligations();
      });

      row.querySelector('.loan-type-select').addEventListener('change', updateObligations);
    }

    function updateObligations() {
      const rows = loansContainer.querySelectorAll('.dynamic-row');
      let total = 0;
      const loans = [];

      rows.forEach(row => {
        const type = row.querySelector('.loan-type-select').value;
        const emi = parseInt(row.querySelector('.loan-emi-input').value) || 0;
        total += emi;
        if (type || emi) loans.push({ type, emi });
      });

      onUpdate('existingLoans', loans);
      onUpdate('totalObligations', total);

      const totalEl = container.querySelector('#obligations-total');
      totalEl.textContent = formatCurrency(total);
    }

    // Bank details binding
    const fields = ['creditScore', 'bankName', 'accountNumber', 'ifscCode', 'accountType'];
    fields.forEach(id => {
      const el = container.querySelector(`#${id}`);
      if (el) {
        el.addEventListener('input', () => onUpdate(id, el.value));
        el.addEventListener('change', () => onUpdate(id, el.value));
      }
    });

    // IFSC uppercase
    const ifscEl = container.querySelector('#ifscCode');
    ifscEl.addEventListener('input', () => {
      ifscEl.value = ifscEl.value.toUpperCase();
      onUpdate('ifscCode', ifscEl.value);
    });

    // Account number: digits only
    const accEl = container.querySelector('#accountNumber');
    accEl.addEventListener('input', () => {
      accEl.value = accEl.value.replace(/\D/g, '');
      onUpdate('accountNumber', accEl.value);
    });

    // Validations
    setupRealtimeValidation(container.querySelector('#bankName'), [v => validators.required(v, 'Bank name')]);
    setupRealtimeValidation(accEl, [v => validators.required(v, 'Account number'), validators.accountNumber]);
    setupRealtimeValidation(ifscEl, [v => validators.required(v, 'IFSC code'), validators.ifsc]);
  }, 0);

  return container;
}

export function validateStep6(state) {
  const errors = {};
  let valid = true;

  if (!state.creditScore) { errors.creditScore = 'Credit score range is required'; valid = false; }
  if (!state.bankName?.trim()) { errors.bankName = 'Bank name is required'; valid = false; }
  if (!state.accountNumber) { errors.accountNumber = 'Account number is required'; valid = false; }
  else { const e = validators.accountNumber(state.accountNumber); if (e) { errors.accountNumber = e; valid = false; } }
  if (!state.ifscCode) { errors.ifscCode = 'IFSC code is required'; valid = false; }
  else { const e = validators.ifsc(state.ifscCode); if (e) { errors.ifscCode = e; valid = false; } }
  if (!state.accountType) { errors.accountType = 'Account type is required'; valid = false; }

  return { valid, errors };
}
