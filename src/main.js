/**
 * Main Application - Loan Application Form
 * State management, step orchestration, auto-save integration
 */

import './styles/index.css';
import './styles/components.css';
import './styles/steps.css';
import './styles/animations.css';

import { createProgressBar, updateProgressBar } from './components/progress-bar.js';
import { showToast } from './components/toast.js';
import { showModal } from './components/modal.js';
import { createSaveIndicator, debouncedSave, loadSavedState, hasSavedState, getTimeSinceLastSave, clearSavedState } from './utils/autosave.js';

import { renderStep1, validateStep1 } from './steps/step1-loan-type.js';
import { renderStep2, validateStep2 } from './steps/step2-personal-info.js';
import { renderStep3, validateStep3 } from './steps/step3-contact-address.js';
import { renderStep4, validateStep4 } from './steps/step4-employment.js';
import { renderStep5, validateStep5 } from './steps/step5-loan-details.js';
import { renderStep6, validateStep6 } from './steps/step6-financial.js';
import { renderStep7, validateStep7, shouldShowStep7 } from './steps/step7-collateral.js';
import { renderStep8, validateStep8 } from './steps/step8-documents.js';
import { renderStep9, validateStep9 } from './steps/step9-signature.js';
import { renderStep10, validateStep10 } from './steps/step10-review.js';

// ---- Step Definitions ----
const ALL_STEPS = [
  { key: 'loanType', label: 'Loan Type', shortLabel: 'Type', render: renderStep1, validate: validateStep1 },
  { key: 'personalInfo', label: 'Personal Info', shortLabel: 'Personal', render: renderStep2, validate: validateStep2 },
  { key: 'contact', label: 'Contact & Address', shortLabel: 'Address', render: renderStep3, validate: validateStep3 },
  { key: 'employment', label: 'Employment', shortLabel: 'Work', render: renderStep4, validate: validateStep4 },
  { key: 'loanDetails', label: 'Loan Details', shortLabel: 'Loan', render: renderStep5, validate: validateStep5 },
  { key: 'financial', label: 'Financial Info', shortLabel: 'Finance', render: renderStep6, validate: validateStep6 },
  { key: 'collateral', label: 'Collateral', shortLabel: 'Collateral', render: renderStep7, validate: validateStep7, conditional: true },
  { key: 'documents', label: 'Documents', shortLabel: 'Docs', render: renderStep8, validate: validateStep8 },
  { key: 'signature', label: 'E-Signature', shortLabel: 'Sign', render: renderStep9, validate: validateStep9 },
  { key: 'review', label: 'Review & Submit', shortLabel: 'Review', render: renderStep10, validate: validateStep10 },
];

// ---- Application State ----
let state = {
  currentStep: 0,
  loanType: '',
  // Step 2
  fullName: '', dob: '', gender: '', maritalStatus: '',
  panNumber: '', panVerified: false, panName: '',
  aadhaarNumber: '', aadhaarVerified: false,
  // Step 3
  email: '', phone: '', street: '', landmark: '',
  pincode: '', city: '', district: '', state: '',
  residenceType: '', yearsAtAddress: '',
  // Step 4
  employmentType: '', companyName: '', monthlyIncome: '',
  designation: '', yearsOfExperience: '',
  businessName: '', businessType: '', registrationNumber: '',
  yearsInBusiness: '', annualTurnover: '', gstNumber: '',
  // Step 5
  loanAmount: 0, loanTenure: 0, loanPurpose: '',
  estimatedEMI: 0, estimatedInterest: 0, interestRate: 0,
  // Step 6
  existingLoans: [], totalObligations: 0,
  creditScore: '', bankName: '', accountNumber: '',
  ifscCode: '', accountType: '',
  // Step 7
  propertyType: '', propertyLocation: '', propertyValue: '',
  propertyAge: '', ownershipStatus: '',
  collateralType: '', collateralDescription: '', collateralValue: '',
  // Step 8
  uploadedDocs: {},
  // Step 9
  signatureData: null, termsAgreed: false, signatureDate: '',
};

let submitted = false;
let progressBarEl = null;

// ---- Get Active Steps (considering conditional step) ----
function getActiveSteps() {
  return ALL_STEPS.filter(step => {
    if (step.conditional && step.key === 'collateral') {
      return shouldShowStep7(state);
    }
    return true;
  });
}

// ---- DOM Elements ----
function getElements() {
  return {
    app: document.getElementById('app'),
    progressContainer: document.getElementById('progress-bar-container'),
    stepContainer: document.getElementById('step-container'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    navigation: document.getElementById('step-navigation'),
  };
}

// ---- Initialize ----
function init() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <header class="app-header">
      <h1 class="app-logo">
        <span class="text-gradient">LoanEase</span>
      </h1>
      <p class="app-subtitle">Smart Loan Application Portal</p>
    </header>

    <div class="app-container">
      <div id="progress-bar-container"></div>
      <div id="step-container" class="step-container"></div>
      <div class="step-navigation" id="step-navigation">
        <button type="button" class="btn btn-secondary" id="prev-btn">
          ← Previous
        </button>
        <div class="nav-spacer"></div>
        <button type="button" class="btn btn-primary" id="next-btn">
          Next →
        </button>
      </div>
    </div>
  `;

  createSaveIndicator();
  renderProgressBar();
  bindNavigation();

  // Check for saved state
  if (hasSavedState()) {
    const timeSince = getTimeSinceLastSave();
    showModal({
      title: '📋 Resume Application?',
      body: `<p>You have an unfinished loan application saved <strong>${timeSince}</strong>. Would you like to continue where you left off?</p>`,
      actions: [
        {
          label: 'Start Fresh',
          className: 'btn-secondary',
          onClick: () => {
            clearSavedState();
            renderCurrentStep();
          },
        },
        {
          label: 'Resume Application',
          className: 'btn-primary',
          onClick: () => {
            const saved = loadSavedState();
            if (saved && saved.data) {
              state = { ...state, ...saved.data };
              state.currentStep = saved.currentStep || 0;
              renderProgressBar();
              renderCurrentStep();
              showToast('info', 'Application Resumed', `Continuing from step ${state.currentStep + 1}`);
            }
          },
        },
      ],
      closeable: false,
    });
  }

  renderCurrentStep();
}

// ---- Render Progress Bar ----
function renderProgressBar() {
  const { progressContainer } = getElements();
  progressContainer.innerHTML = '';

  const activeSteps = getActiveSteps();
  progressBarEl = createProgressBar(activeSteps, state.currentStep, (stepIndex) => {
    if (stepIndex < state.currentStep) {
      state.currentStep = stepIndex;
      renderCurrentStep();
      updateNav();
    }
  });
  progressContainer.appendChild(progressBarEl);
}

// ---- Render Current Step ----
function renderCurrentStep() {
  const { stepContainer } = getElements();
  const activeSteps = getActiveSteps();
  const step = activeSteps[state.currentStep];

  if (!step) return;

  // Clear and render
  stepContainer.innerHTML = '';

  let stepContent;
  if (step.key === 'review') {
    stepContent = step.render(state, handleFieldUpdate, handleSubmit);
  } else {
    stepContent = step.render(state, handleFieldUpdate);
  }

  stepContainer.appendChild(stepContent);

  // Update progress bar
  if (progressBarEl) {
    updateProgressBar(progressBarEl, state.currentStep);
  }

  updateNav();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- Handle Field Updates ----
function handleFieldUpdate(field, value) {
  if (field === '__navigateToStep') {
    state.currentStep = value;
    renderProgressBar();
    renderCurrentStep();
    return;
  }

  state[field] = value;

  // If loan type changes, reset conditional fields & re-render progress bar
  if (field === 'loanType') {
    renderProgressBar();
  }

  // Auto-save
  debouncedSave(state);
}

// ---- Navigation ----
function bindNavigation() {
  const { prevBtn, nextBtn } = getElements();

  prevBtn.addEventListener('click', () => {
    if (state.currentStep > 0) {
      state.currentStep--;
      renderProgressBar();
      renderCurrentStep();
    }
  });

  nextBtn.addEventListener('click', () => {
    const activeSteps = getActiveSteps();
    const step = activeSteps[state.currentStep];

    // Validate current step
    const result = step.validate(state);

    if (!result.valid) {
      // Show errors
      for (const [field, message] of Object.entries(result.errors)) {
        const errorEl = document.getElementById(`${field}-error`);
        if (errorEl) {
          errorEl.textContent = message;
          errorEl.classList.add('visible');
        }

        const inputEl = document.getElementById(field);
        if (inputEl) {
          inputEl.classList.add('is-invalid');
          // Scroll to first error
          if (field === Object.keys(result.errors)[0]) {
            inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }

      showToast('error', 'Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    if (state.currentStep < activeSteps.length - 1) {
      state.currentStep++;
      debouncedSave(state);
      renderProgressBar();
      renderCurrentStep();
    }
  });
}

function updateNav() {
  const { prevBtn, nextBtn, navigation } = getElements();
  const activeSteps = getActiveSteps();

  prevBtn.style.visibility = state.currentStep === 0 ? 'hidden' : 'visible';

  if (submitted) {
    navigation.style.display = 'none';
    return;
  }

  if (state.currentStep === activeSteps.length - 1) {
    nextBtn.style.display = 'none';
  } else {
    nextBtn.style.display = '';
    nextBtn.textContent = 'Next →';
  }
}

// ---- Handle Submit ----
function handleSubmit() {
  submitted = true;
  const { stepContainer, navigation } = getElements();

  navigation.style.display = 'none';

  // Generate reference number
  const refNumber = 'LA' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();

  stepContainer.innerHTML = `
    <div class="success-container" style="animation: card-enter 0.5s ease forwards">
      <div class="success-icon">🎉</div>
      <h2 class="success-title">Application Submitted Successfully!</h2>
      <p class="success-message">
        Your loan application has been received. Our team will review it and contact you within 2-3 business days.
      </p>
      <div class="success-ref" id="ref-number">${refNumber}</div>
      <p style="margin-top: var(--space-md); font-size: var(--font-size-sm); color: var(--text-tertiary)">
        Your Application Reference Number
      </p>
      <button type="button" class="btn btn-primary mt-xl" id="new-application-btn">
        Start New Application
      </button>
    </div>
  `;

  document.getElementById('new-application-btn').addEventListener('click', () => {
    submitted = false;
    state = {
      currentStep: 0, loanType: '',
      fullName: '', dob: '', gender: '', maritalStatus: '',
      panNumber: '', panVerified: false, panName: '',
      aadhaarNumber: '', aadhaarVerified: false,
      email: '', phone: '', street: '', landmark: '',
      pincode: '', city: '', district: '', state: '',
      residenceType: '', yearsAtAddress: '',
      employmentType: '', companyName: '', monthlyIncome: '',
      designation: '', yearsOfExperience: '',
      businessName: '', businessType: '', registrationNumber: '',
      yearsInBusiness: '', annualTurnover: '', gstNumber: '',
      loanAmount: 0, loanTenure: 0, loanPurpose: '',
      estimatedEMI: 0, estimatedInterest: 0, interestRate: 0,
      existingLoans: [], totalObligations: 0,
      creditScore: '', bankName: '', accountNumber: '',
      ifscCode: '', accountType: '',
      propertyType: '', propertyLocation: '', propertyValue: '',
      propertyAge: '', ownershipStatus: '',
      collateralType: '', collateralDescription: '', collateralValue: '',
      uploadedDocs: {},
      signatureData: null, termsAgreed: false, signatureDate: '',
    };
    renderProgressBar();
    renderCurrentStep();
  });

  // Update progress bar to show all complete
  if (progressBarEl) {
    const steps = progressBarEl.querySelectorAll('.progress-step');
    steps.forEach(step => {
      step.classList.remove('active');
      step.classList.add('completed');
    });
    progressBarEl.querySelectorAll('.progress-connector').forEach(c => c.classList.add('completed'));
  }
}

// ---- Start Application ----
document.addEventListener('DOMContentLoaded', init);
