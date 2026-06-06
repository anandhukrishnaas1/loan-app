/**
 * Step 4: Employment & Income
 * Conditional fields based on loan type
 */

import { validators, setupRealtimeValidation, formatCurrency } from '../utils/validation.js';

export function renderStep4(state, onUpdate) {
  const container = document.createElement('div');
  container.className = 'step-content';
  container.id = 'step-4';

  const loanType = state.loanType || 'personal';
  const isBusiness = loanType === 'business';

  let fieldsHTML = '';

  if (isBusiness) {
    fieldsHTML = `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="businessName">Business Name <span class="required">*</span></label>
          <input type="text" class="form-input" id="businessName" name="businessName"
            placeholder="Registered business name" value="${state.businessName || ''}">
          <div class="form-error" id="businessName-error"></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="businessType">Business Type <span class="required">*</span></label>
          <select class="form-select" id="businessType" name="businessType">
            <option value="">Select</option>
            <option value="proprietorship" ${state.businessType === 'proprietorship' ? 'selected' : ''}>Proprietorship</option>
            <option value="partnership" ${state.businessType === 'partnership' ? 'selected' : ''}>Partnership</option>
            <option value="pvtLtd" ${state.businessType === 'pvtLtd' ? 'selected' : ''}>Private Limited</option>
            <option value="llp" ${state.businessType === 'llp' ? 'selected' : ''}>LLP</option>
            <option value="other" ${state.businessType === 'other' ? 'selected' : ''}>Other</option>
          </select>
          <div class="form-error" id="businessType-error"></div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="registrationNumber">Registration Number</label>
          <input type="text" class="form-input" id="registrationNumber" name="registrationNumber"
            placeholder="CIN/Registration No." value="${state.registrationNumber || ''}">
        </div>
        <div class="form-group">
          <label class="form-label" for="yearsInBusiness">Years in Business <span class="required">*</span></label>
          <select class="form-select" id="yearsInBusiness" name="yearsInBusiness">
            <option value="">Select</option>
            <option value="<1" ${state.yearsInBusiness === '<1' ? 'selected' : ''}>Less than 1 year</option>
            <option value="1-3" ${state.yearsInBusiness === '1-3' ? 'selected' : ''}>1-3 years</option>
            <option value="3-5" ${state.yearsInBusiness === '3-5' ? 'selected' : ''}>3-5 years</option>
            <option value="5-10" ${state.yearsInBusiness === '5-10' ? 'selected' : ''}>5-10 years</option>
            <option value="10+" ${state.yearsInBusiness === '10+' ? 'selected' : ''}>10+ years</option>
          </select>
          <div class="form-error" id="yearsInBusiness-error"></div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="annualTurnover">Annual Turnover (₹) <span class="required">*</span></label>
          <div class="input-group">
            <span class="input-addon">₹</span>
            <input type="text" class="form-input" id="annualTurnover" name="annualTurnover"
              placeholder="e.g. 5000000" inputmode="numeric"
              value="${state.annualTurnover || ''}">
          </div>
          <div class="form-error" id="annualTurnover-error"></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="monthlyIncome">Monthly Net Profit (₹) <span class="required">*</span></label>
          <div class="input-group">
            <span class="input-addon">₹</span>
            <input type="text" class="form-input" id="monthlyIncome" name="monthlyIncome"
              placeholder="e.g. 150000" inputmode="numeric"
              value="${state.monthlyIncome || ''}">
          </div>
          <div class="form-error" id="monthlyIncome-error"></div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="gstNumber">GST Number</label>
        <input type="text" class="form-input" id="gstNumber" name="gstNumber"
          placeholder="22AAAAA0000A1Z5" maxlength="15" style="text-transform:uppercase"
          value="${state.gstNumber || ''}">
        <div class="form-error" id="gstNumber-error"></div>
      </div>
    `;
  } else {
    const showExtraFields = loanType === 'home';
    fieldsHTML = `
      <div class="form-group">
        <label class="form-label">Employment Type <span class="required">*</span></label>
        <div class="radio-group" id="employmentType-group">
          <label class="radio-option ${state.employmentType === 'salaried' ? 'selected' : ''}">
            <input type="radio" name="employmentType" value="salaried"
              ${state.employmentType === 'salaried' ? 'checked' : ''}>
            <span class="radio-dot"></span>
            Salaried
          </label>
          <label class="radio-option ${state.employmentType === 'selfEmployed' ? 'selected' : ''}">
            <input type="radio" name="employmentType" value="selfEmployed"
              ${state.employmentType === 'selfEmployed' ? 'checked' : ''}>
            <span class="radio-dot"></span>
            Self-Employed
          </label>
          <label class="radio-option ${state.employmentType === 'professional' ? 'selected' : ''}">
            <input type="radio" name="employmentType" value="professional"
              ${state.employmentType === 'professional' ? 'checked' : ''}>
            <span class="radio-dot"></span>
            Professional
          </label>
        </div>
        <div class="form-error" id="employmentType-error"></div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="companyName">Company/Organization <span class="required">*</span></label>
          <input type="text" class="form-input" id="companyName" name="companyName"
            placeholder="Company name" autocomplete="organization"
            value="${state.companyName || ''}">
          <div class="form-error" id="companyName-error"></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="monthlyIncome">Monthly Income (₹) <span class="required">*</span></label>
          <div class="input-group">
            <span class="input-addon">₹</span>
            <input type="text" class="form-input" id="monthlyIncome" name="monthlyIncome"
              placeholder="e.g. 75000" inputmode="numeric"
              value="${state.monthlyIncome || ''}">
          </div>
          <div class="form-error" id="monthlyIncome-error"></div>
        </div>
      </div>

      ${showExtraFields ? `
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="designation">Designation <span class="required">*</span></label>
            <input type="text" class="form-input" id="designation" name="designation"
              placeholder="e.g. Senior Manager" value="${state.designation || ''}">
            <div class="form-error" id="designation-error"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="yearsOfExperience">Total Experience <span class="required">*</span></label>
            <select class="form-select" id="yearsOfExperience" name="yearsOfExperience">
              <option value="">Select</option>
              <option value="<1" ${state.yearsOfExperience === '<1' ? 'selected' : ''}>Less than 1 year</option>
              <option value="1-3" ${state.yearsOfExperience === '1-3' ? 'selected' : ''}>1-3 years</option>
              <option value="3-5" ${state.yearsOfExperience === '3-5' ? 'selected' : ''}>3-5 years</option>
              <option value="5-10" ${state.yearsOfExperience === '5-10' ? 'selected' : ''}>5-10 years</option>
              <option value="10-20" ${state.yearsOfExperience === '10-20' ? 'selected' : ''}>10-20 years</option>
              <option value="20+" ${state.yearsOfExperience === '20+' ? 'selected' : ''}>20+ years</option>
            </select>
            <div class="form-error" id="yearsOfExperience-error"></div>
          </div>
        </div>
      ` : ''}
    `;
  }

  container.innerHTML = `
    <div class="step-header">
      <h2 class="step-title">${isBusiness ? 'Business Information' : 'Employment & Income'}</h2>
      <p class="step-description">${isBusiness ? 'Tell us about your business details and financials.' : 'Provide your employment and income details for eligibility assessment.'}</p>
    </div>
    <div class="glass-card">
      ${fieldsHTML}
    </div>
  `;

  setTimeout(() => {
    // Bind all inputs
    container.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
      const name = el.name || el.id;
      el.addEventListener('input', () => onUpdate(name, el.value));
      el.addEventListener('change', () => onUpdate(name, el.value));
    });

    // Radio buttons
    container.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const group = radio.closest('.radio-group');
        group.querySelectorAll('.radio-option').forEach(o => o.classList.remove('selected'));
        radio.closest('.radio-option').classList.add('selected');
        onUpdate(radio.name, radio.value);
      });
    });

    // Income formatting
    const incomeEl = container.querySelector('#monthlyIncome');
    if (incomeEl) {
      incomeEl.addEventListener('input', () => {
        incomeEl.value = incomeEl.value.replace(/[^\d]/g, '');
        onUpdate('monthlyIncome', incomeEl.value);
      });
      setupRealtimeValidation(incomeEl, [v => validators.required(v, 'Income'), v => validators.number(v, 'Income')]);
    }

    // Turnover
    const turnoverEl = container.querySelector('#annualTurnover');
    if (turnoverEl) {
      turnoverEl.addEventListener('input', () => {
        turnoverEl.value = turnoverEl.value.replace(/[^\d]/g, '');
        onUpdate('annualTurnover', turnoverEl.value);
      });
    }

    // GST
    const gstEl = container.querySelector('#gstNumber');
    if (gstEl) {
      gstEl.addEventListener('input', () => {
        gstEl.value = gstEl.value.toUpperCase();
        onUpdate('gstNumber', gstEl.value);
      });
    }
  }, 0);

  return container;
}

export function validateStep4(state) {
  const errors = {};
  let valid = true;
  const isBusiness = state.loanType === 'business';

  if (isBusiness) {
    if (!state.businessName?.trim()) { errors.businessName = 'Business name is required'; valid = false; }
    if (!state.businessType) { errors.businessType = 'Business type is required'; valid = false; }
    if (!state.yearsInBusiness) { errors.yearsInBusiness = 'Years in business is required'; valid = false; }
    if (!state.annualTurnover) { errors.annualTurnover = 'Annual turnover is required'; valid = false; }
    if (!state.monthlyIncome) { errors.monthlyIncome = 'Monthly net profit is required'; valid = false; }
  } else {
    if (!state.employmentType) { errors.employmentType = 'Employment type is required'; valid = false; }
    if (!state.companyName?.trim()) { errors.companyName = 'Company name is required'; valid = false; }
    if (!state.monthlyIncome) { errors.monthlyIncome = 'Monthly income is required'; valid = false; }
    if (state.loanType === 'home') {
      if (!state.designation?.trim()) { errors.designation = 'Designation is required'; valid = false; }
      if (!state.yearsOfExperience) { errors.yearsOfExperience = 'Experience is required'; valid = false; }
    }
  }

  return { valid, errors };
}
