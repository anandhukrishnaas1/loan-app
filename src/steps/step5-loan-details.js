/**
 * Step 5: Loan Details
 * Loan amount slider, tenure, purpose, and live EMI calculator
 */

import { calculateEMI, formatCurrency, formatAmountShort, validators } from '../utils/validation.js';

const LOAN_CONFIG = {
  personal: { minAmount: 50000, maxAmount: 4000000, minTenure: 12, maxTenure: 60, defaultRate: 12.5 },
  home: { minAmount: 500000, maxAmount: 50000000, minTenure: 12, maxTenure: 360, defaultRate: 8.5 },
  business: { minAmount: 100000, maxAmount: 20000000, minTenure: 12, maxTenure: 84, defaultRate: 14.0 },
};

const PURPOSES = {
  personal: ['Medical Emergency', 'Education', 'Wedding', 'Travel', 'Home Renovation', 'Debt Consolidation', 'Other'],
  home: ['New Home Purchase', 'Under Construction', 'Home Renovation', 'Plot Purchase', 'Balance Transfer', 'Top-up Loan'],
  business: ['Working Capital', 'Equipment Purchase', 'Business Expansion', 'Inventory', 'Office Setup', 'Other'],
};

export function renderStep5(state, onUpdate) {
  const container = document.createElement('div');
  container.className = 'step-content';
  container.id = 'step-5';

  const loanType = state.loanType || 'personal';
  const config = LOAN_CONFIG[loanType];
  const purposes = PURPOSES[loanType];

  const currentAmount = state.loanAmount || config.minAmount;
  const currentTenure = state.loanTenure || config.minTenure;
  const emi = calculateEMI(currentAmount, config.defaultRate, currentTenure);
  const totalPayable = emi * currentTenure;
  const totalInterest = totalPayable - currentAmount;

  container.innerHTML = `
    <div class="step-header">
      <h2 class="step-title">Loan Details</h2>
      <p class="step-description">Configure your loan amount, tenure, and purpose. The EMI calculator updates in real-time.</p>
    </div>

    <div class="glass-card">
      <!-- Loan Amount Slider -->
      <div class="slider-section">
        <div class="slider-header">
          <label class="form-label">Loan Amount <span class="required">*</span></label>
        </div>
        <div class="range-value" id="amount-display">${formatCurrency(currentAmount)}</div>
        <div class="range-container">
          <input type="range" class="form-range" id="loanAmount"
            min="${config.minAmount}" max="${config.maxAmount}"
            step="${loanType === 'home' ? 100000 : loanType === 'business' ? 50000 : 10000}"
            value="${currentAmount}">
          <div class="range-labels">
            <span>${formatAmountShort(config.minAmount)}</span>
            <span>${formatAmountShort(config.maxAmount)}</span>
          </div>
        </div>
        <!-- Manual input -->
        <div class="form-group mt-md">
          <div class="input-group">
            <span class="input-addon">₹</span>
            <input type="text" class="form-input" id="loanAmountInput"
              placeholder="Or enter amount" inputmode="numeric"
              value="${currentAmount}">
          </div>
        </div>
      </div>

      <!-- Tenure Slider -->
      <div class="slider-section">
        <div class="slider-header">
          <label class="form-label">Loan Tenure <span class="required">*</span></label>
        </div>
        <div class="range-value" id="tenure-display">${currentTenure} months ${currentTenure >= 12 ? `(${(currentTenure / 12).toFixed(1)} years)` : ''}</div>
        <div class="range-container">
          <input type="range" class="form-range" id="loanTenure"
            min="${config.minTenure}" max="${config.maxTenure}"
            step="${loanType === 'home' ? 12 : 6}"
            value="${currentTenure}">
          <div class="range-labels">
            <span>${config.minTenure} months</span>
            <span>${config.maxTenure} months${config.maxTenure >= 12 ? ` (${config.maxTenure / 12}y)` : ''}</span>
          </div>
        </div>
      </div>

      <!-- Purpose -->
      <div class="form-group">
        <label class="form-label" for="loanPurpose">Purpose of Loan <span class="required">*</span></label>
        <select class="form-select" id="loanPurpose" name="loanPurpose">
          <option value="">Select Purpose</option>
          ${purposes.map(p => `<option value="${p}" ${state.loanPurpose === p ? 'selected' : ''}>${p}</option>`).join('')}
        </select>
        <div class="form-error" id="loanPurpose-error"></div>
      </div>

      <!-- EMI Calculator Display -->
      <div class="emi-display" id="emi-display">
        <div class="emi-display-item">
          <span class="emi-display-label">Monthly EMI</span>
          <span class="emi-display-value" id="emi-value">${formatCurrency(emi)}</span>
        </div>
        <div class="emi-display-item">
          <span class="emi-display-label">Total Interest</span>
          <span class="emi-display-value" id="interest-value">${formatCurrency(totalInterest)}</span>
        </div>
        <div class="emi-display-item">
          <span class="emi-display-label">Total Payable</span>
          <span class="emi-display-value" id="total-value">${formatCurrency(totalPayable)}</span>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const amountSlider = container.querySelector('#loanAmount');
    const amountInput = container.querySelector('#loanAmountInput');
    const amountDisplay = container.querySelector('#amount-display');
    const tenureSlider = container.querySelector('#loanTenure');
    const tenureDisplay = container.querySelector('#tenure-display');
    const purposeSelect = container.querySelector('#loanPurpose');

    function updateEMI() {
      const amount = parseInt(amountSlider.value);
      const tenure = parseInt(tenureSlider.value);
      const rate = config.defaultRate;

      const emi = calculateEMI(amount, rate, tenure);
      const total = emi * tenure;
      const interest = total - amount;

      container.querySelector('#emi-value').textContent = formatCurrency(emi);
      container.querySelector('#interest-value').textContent = formatCurrency(interest);
      container.querySelector('#total-value').textContent = formatCurrency(total);

      onUpdate('estimatedEMI', emi);
      onUpdate('estimatedInterest', interest);
      onUpdate('interestRate', rate);
    }

    // Slider range fill styling
    function updateSliderFill(slider) {
      const min = parseFloat(slider.min);
      const max = parseFloat(slider.max);
      const val = parseFloat(slider.value);
      const percent = ((val - min) / (max - min)) * 100;
      slider.style.background = `linear-gradient(to right, #667eea ${percent}%, rgba(255,255,255,0.1) ${percent}%)`;
    }

    amountSlider.addEventListener('input', () => {
      const val = parseInt(amountSlider.value);
      amountDisplay.textContent = formatCurrency(val);
      amountInput.value = val;
      onUpdate('loanAmount', val);
      updateEMI();
      updateSliderFill(amountSlider);
    });

    amountInput.addEventListener('input', () => {
      let val = parseInt(amountInput.value.replace(/[^\d]/g, ''));
      if (isNaN(val)) val = config.minAmount;
      val = Math.max(config.minAmount, Math.min(config.maxAmount, val));
      amountSlider.value = val;
      amountDisplay.textContent = formatCurrency(val);
      onUpdate('loanAmount', val);
      updateEMI();
      updateSliderFill(amountSlider);
    });

    tenureSlider.addEventListener('input', () => {
      const val = parseInt(tenureSlider.value);
      tenureDisplay.textContent = `${val} months${val >= 12 ? ` (${(val / 12).toFixed(1)} years)` : ''}`;
      onUpdate('loanTenure', val);
      updateEMI();
      updateSliderFill(tenureSlider);
    });

    purposeSelect.addEventListener('change', () => {
      onUpdate('loanPurpose', purposeSelect.value);
    });

    // Init slider fills
    updateSliderFill(amountSlider);
    updateSliderFill(tenureSlider);
    
    // Initialize default state
    if (!state.loanAmount) onUpdate('loanAmount', config.minAmount);
    if (!state.loanTenure) onUpdate('loanTenure', config.minTenure);
  }, 0);

  return container;
}

export function validateStep5(state) {
  const errors = {};
  let valid = true;

  if (!state.loanAmount) { errors.loanAmount = 'Loan amount is required'; valid = false; }
  if (!state.loanTenure) { errors.loanTenure = 'Loan tenure is required'; valid = false; }
  if (!state.loanPurpose) { errors.loanPurpose = 'Loan purpose is required'; valid = false; }

  return { valid, errors };
}
