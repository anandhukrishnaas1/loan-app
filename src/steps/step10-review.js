/**
 * Step 10: Review & Submit
 * Pre-approval summary with eligibility score
 */

import { formatCurrency, calculateEMI, validateIncomeToLoanRatio } from '../utils/validation.js';
import { showConfirm } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { clearSavedState } from '../utils/autosave.js';

/**
 * Calculate pre-approval eligibility score
 */
function calculateEligibility(state) {
  let score = 0;
  let maxScore = 100;
  const factors = [];

  // Credit score (30 points max)
  const creditMap = { '750-900': 30, '650-750': 22, '500-650': 12, '300-500': 5, 'unknown': 15 };
  const creditPoints = creditMap[state.creditScore] || 10;
  score += creditPoints;
  factors.push({ label: 'Credit Score', points: creditPoints, max: 30 });

  // Income stability (20 points)
  const income = parseFloat(state.monthlyIncome) || 0;
  let incomePoints = 0;
  if (income >= 100000) incomePoints = 20;
  else if (income >= 50000) incomePoints = 16;
  else if (income >= 30000) incomePoints = 12;
  else if (income >= 20000) incomePoints = 8;
  else incomePoints = 4;
  score += incomePoints;
  factors.push({ label: 'Income Level', points: incomePoints, max: 20 });

  // Debt-to-income ratio (20 points)
  const obligations = parseFloat(state.totalObligations) || 0;
  const dti = income > 0 ? obligations / income : 0;
  let dtiPoints = 0;
  if (dti < 0.2) dtiPoints = 20;
  else if (dti < 0.3) dtiPoints = 16;
  else if (dti < 0.4) dtiPoints = 12;
  else if (dti < 0.5) dtiPoints = 8;
  else dtiPoints = 4;
  score += dtiPoints;
  factors.push({ label: 'Debt-to-Income', points: dtiPoints, max: 20 });

  // Employment/Business stability (15 points)
  let expYears = state.yearsOfExperience || state.yearsInBusiness || '';
  let expPoints = 0;
  if (expYears === '10+' || expYears === '10-20' || expYears === '20+') expPoints = 15;
  else if (expYears === '5-10') expPoints = 12;
  else if (expYears === '3-5') expPoints = 9;
  else if (expYears === '1-3') expPoints = 6;
  else expPoints = 3;
  score += expPoints;
  factors.push({ label: 'Experience/Stability', points: expPoints, max: 15 });

  // Document completion (15 points)
  const docsUploaded = Object.values(state.uploadedDocs || {}).reduce((sum, files) => sum + (files?.length || 0), 0);
  let docPoints = Math.min(15, docsUploaded * 3);
  score += docPoints;
  factors.push({ label: 'Documents', points: docPoints, max: 15 });

  // Risk assessment
  let risk = 'High';
  let riskColor = '#f5576c';
  if (score >= 75) { risk = 'Low'; riskColor = '#43e97b'; }
  else if (score >= 50) { risk = 'Medium'; riskColor = '#fee140'; }

  // Estimated interest rate
  let rateMin, rateMax;
  if (state.loanType === 'home') { rateMin = 7.5; rateMax = 9.5; }
  else if (state.loanType === 'business') { rateMin = 12; rateMax = 18; }
  else { rateMin = 10.5; rateMax = 16; }

  // Adjust rates based on score
  const adjustment = (100 - score) / 100 * 3;
  rateMin = Math.round((rateMin + adjustment) * 10) / 10;
  rateMax = Math.round((rateMax + adjustment) * 10) / 10;

  // Max eligible amount
  const maxEligible = income > 0 ? Math.round(income * 60 * (score / 100)) : 0;

  return {
    score,
    maxScore,
    risk,
    riskColor,
    rateMin,
    rateMax,
    maxEligible,
    factors,
    emi: calculateEMI(state.loanAmount || 0, (rateMin + rateMax) / 2, state.loanTenure || 12),
  };
}

export function renderStep10(state, onUpdate, onSubmit) {
  const container = document.createElement('div');
  container.className = 'step-content';
  container.id = 'step-10';

  const eligibility = calculateEligibility(state);
  const loanTypeLabel = { personal: 'Personal Loan', home: 'Home Loan', business: 'Business Loan' }[state.loanType] || '';

  // Cross-step validation warning
  const ratioWarning = validateIncomeToLoanRatio(state);

  container.innerHTML = `
    <div class="step-header">
      <h2 class="step-title">Review & Pre-Approval Summary</h2>
      <p class="step-description">Review your application details and check your pre-approval eligibility.</p>
    </div>

    <!-- Pre-Approval Score -->
    <div class="glass-card">
      <div class="approval-score">
        <div class="score-circle" style="--score-percent: ${eligibility.score}%; --score-color: ${eligibility.riskColor}">
          <span class="score-value text-gradient">${eligibility.score}</span>
          <span class="score-label">Eligibility Score</span>
        </div>

        <div class="score-details">
          <div class="score-detail-item">
            <span class="score-detail-value" style="color: ${eligibility.riskColor}">${eligibility.risk} Risk</span>
            <span class="score-detail-label">Risk Category</span>
          </div>
          <div class="score-detail-item">
            <span class="score-detail-value">${eligibility.rateMin}% – ${eligibility.rateMax}%</span>
            <span class="score-detail-label">Est. Interest Rate</span>
          </div>
          <div class="score-detail-item">
            <span class="score-detail-value">${formatCurrency(eligibility.maxEligible)}</span>
            <span class="score-detail-label">Max Eligible Amount</span>
          </div>
          <div class="score-detail-item">
            <span class="score-detail-value">${formatCurrency(eligibility.emi)}</span>
            <span class="score-detail-label">Est. Monthly EMI</span>
          </div>
        </div>
      </div>

      ${ratioWarning ? `
        <div style="margin-top:var(--space-lg);padding:var(--space-md);background:rgba(254,225,64,0.1);border:1px solid rgba(254,225,64,0.3);border-radius:var(--radius-md);font-size:var(--font-size-sm);color:var(--color-warning)">
          ⚠️ ${ratioWarning}
        </div>
      ` : ''}
    </div>

    <!-- Application Details -->
    <div class="mt-xl">
      ${createReviewSection('🏦 Loan Details', [
        ['Loan Type', loanTypeLabel],
        ['Loan Amount', formatCurrency(state.loanAmount)],
        ['Tenure', `${state.loanTenure} months`],
        ['Purpose', state.loanPurpose],
      ], 0)}

      ${createReviewSection('👤 Personal Information', [
        ['Full Name', state.fullName],
        ['Date of Birth', state.dob ? new Date(state.dob).toLocaleDateString('en-IN') : ''],
        ['Gender', state.gender ? state.gender.charAt(0).toUpperCase() + state.gender.slice(1) : ''],
        ['Marital Status', state.maritalStatus ? state.maritalStatus.charAt(0).toUpperCase() + state.maritalStatus.slice(1) : ''],
        ['PAN', state.panNumber + (state.panVerified ? ' ✓' : '')],
        ['Aadhaar', state.aadhaarNumber + (state.aadhaarVerified ? ' ✓' : '')],
      ], 1)}

      ${createReviewSection('📍 Contact & Address', [
        ['Email', state.email],
        ['Phone', '+91 ' + (state.phone || '')],
        ['Address', [state.street, state.landmark, state.city, state.district, state.state, state.pincode].filter(Boolean).join(', ')],
        ['Residence Type', state.residenceType ? state.residenceType.charAt(0).toUpperCase() + state.residenceType.slice(1) : ''],
      ], 2)}

      ${createReviewSection(state.loanType === 'business' ? '💼 Business Details' : '💼 Employment', (
        state.loanType === 'business' ? [
          ['Business Name', state.businessName],
          ['Business Type', state.businessType],
          ['Years in Business', state.yearsInBusiness],
          ['Annual Turnover', formatCurrency(state.annualTurnover)],
          ['Monthly Income', formatCurrency(state.monthlyIncome)],
        ] : [
          ['Employment Type', state.employmentType],
          ['Company', state.companyName],
          ['Monthly Income', formatCurrency(state.monthlyIncome)],
          ...(state.designation ? [['Designation', state.designation]] : []),
          ...(state.yearsOfExperience ? [['Experience', state.yearsOfExperience]] : []),
        ]
      ), 3)}

      ${createReviewSection('🏛 Financial Details', [
        ['Credit Score', state.creditScore],
        ['Existing Obligations', formatCurrency(state.totalObligations)],
        ['Bank', state.bankName],
        ['Account Type', state.accountType ? state.accountType.charAt(0).toUpperCase() + state.accountType.slice(1) : ''],
      ], 5)}

      ${(state.loanType === 'home' || state.loanType === 'business') ? createReviewSection(
        state.loanType === 'home' ? '🏠 Property Details' : '📋 Collateral',
        state.loanType === 'home' ? [
          ['Property Type', state.propertyType],
          ['Location', state.propertyLocation],
          ['Value', formatCurrency(state.propertyValue)],
          ['Ownership', state.ownershipStatus],
        ] : [
          ['Collateral Type', state.collateralType],
          ['Description', state.collateralDescription || 'N/A'],
          ['Value', state.collateralValue ? formatCurrency(state.collateralValue) : 'N/A'],
        ], 6
      ) : ''}

      ${createReviewSection('📄 Documents', [
        ['Files Uploaded', Object.values(state.uploadedDocs || {}).reduce((sum, files) => sum + (files?.length || 0), 0) + ' document(s)'],
      ], 7)}

      ${createReviewSection('✍️ E-Signature', [
        ['Terms Agreed', state.termsAgreed ? 'Yes ✓' : 'No'],
        ['Signed On', state.signatureDate || ''],
        ['Signature', state.signatureData ? '✓ Captured' : 'Not provided'],
      ], 8)}
    </div>

    <!-- Submit Button -->
    <div class="text-center mt-xl">
      <button type="button" class="btn btn-lg btn-success" id="submit-application-btn">
        🚀 Submit Application
      </button>
    </div>
  `;

  setTimeout(() => {
    // Edit buttons navigate to steps
    container.querySelectorAll('.review-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const stepIndex = parseInt(btn.dataset.step);
        if (onUpdate && typeof onUpdate === 'function') {
          onUpdate('__navigateToStep', stepIndex);
        }
      });
    });

    // Collapsible sections
    container.querySelectorAll('.review-section-header').forEach(header => {
      header.addEventListener('click', () => {
        header.closest('.review-section').classList.toggle('open');
      });
    });

    // Open first section
    const firstSection = container.querySelector('.review-section');
    if (firstSection) firstSection.classList.add('open');

    // Submit
    container.querySelector('#submit-application-btn').addEventListener('click', () => {
      showConfirm(
        'Submit Application',
        'Are you sure you want to submit your loan application? You will not be able to edit after submission.',
        () => {
          clearSavedState();
          showToast('success', 'Application Submitted!', 'Your reference number will appear shortly.');
          if (onSubmit) onSubmit();
        }
      );
    });
  }, 0);

  return container;
}

function createReviewSection(title, fields, stepIndex) {
  const rows = fields.map(([label, value]) => `
    <div class="review-field">
      <span class="review-field-label">${label}</span>
      <span class="review-field-value">${value || 'Not provided'}</span>
    </div>
  `).join('');

  return `
    <div class="review-section">
      <div class="review-section-header">
        <span class="review-section-title">${title}</span>
        <div style="display:flex;align-items:center;gap:var(--space-md)">
          <button type="button" class="review-edit-btn" data-step="${stepIndex}">Edit</button>
          <span class="review-section-toggle">▾</span>
        </div>
      </div>
      <div class="review-section-body">
        <div class="review-section-content">${rows}</div>
      </div>
    </div>
  `;
}

export function validateStep10(state) {
  return { valid: true, errors: {} };
}
