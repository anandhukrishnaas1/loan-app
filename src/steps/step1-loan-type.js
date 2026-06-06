/**
 * Step 1: Loan Type Selection
 */

export function renderStep1(state, onUpdate) {
  const container = document.createElement('div');
  container.className = 'step-content';
  container.id = 'step-1';

  container.innerHTML = `
    <div class="step-header">
      <h2 class="step-title">Choose Your Loan Type</h2>
      <p class="step-description">Select the type of loan that best fits your needs. Each loan type has different requirements and benefits.</p>
    </div>

    <div class="loan-type-grid">
      <div class="loan-type-card ${state.loanType === 'personal' ? 'selected' : ''}" data-type="personal" id="loan-card-personal">
        <span class="loan-type-icon">🏦</span>
        <h3 class="loan-type-name">Personal Loan</h3>
        <p class="loan-type-range">₹50,000 – ₹40,00,000</p>
        <ul class="loan-type-features">
          <li>No collateral required</li>
          <li>Quick disbursement</li>
          <li>Flexible usage</li>
          <li>Tenure: 12-60 months</li>
        </ul>
      </div>

      <div class="loan-type-card ${state.loanType === 'home' ? 'selected' : ''}" data-type="home" id="loan-card-home">
        <span class="loan-type-icon">🏠</span>
        <h3 class="loan-type-name">Home Loan</h3>
        <p class="loan-type-range">₹5,00,000 – ₹5,00,00,000</p>
        <ul class="loan-type-features">
          <li>Low interest rates</li>
          <li>Tax benefits available</li>
          <li>Property as collateral</li>
          <li>Tenure: up to 30 years</li>
        </ul>
      </div>

      <div class="loan-type-card ${state.loanType === 'business' ? 'selected' : ''}" data-type="business" id="loan-card-business">
        <span class="loan-type-icon">💼</span>
        <h3 class="loan-type-name">Business Loan</h3>
        <p class="loan-type-range">₹1,00,000 – ₹2,00,00,000</p>
        <ul class="loan-type-features">
          <li>Working capital support</li>
          <li>Equipment financing</li>
          <li>Business expansion</li>
          <li>Tenure: 12-84 months</li>
        </ul>
      </div>
    </div>
  `;

  // Card selection
  container.querySelectorAll('.loan-type-card').forEach((card) => {
    card.addEventListener('click', () => {
      container.querySelectorAll('.loan-type-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      onUpdate('loanType', card.dataset.type);
    });
  });

  return container;
}

export function validateStep1(state) {
  if (!state.loanType) {
    return { valid: false, errors: { loanType: 'Please select a loan type' } };
  }
  return { valid: true, errors: {} };
}
