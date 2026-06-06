/**
 * Validation Module
 * Provides per-field validators and cross-step validation logic
 */

export const validators = {
  required(value, fieldName = 'This field') {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },

  email(value) {
    if (!value) return null;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(value)) return 'Please enter a valid email address';
    return null;
  },

  phone(value) {
    if (!value) return null;
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 10) return 'Phone number must be 10 digits';
    if (!/^[6-9]/.test(cleaned)) return 'Phone must start with 6, 7, 8 or 9';
    return null;
  },

  pan(value) {
    if (!value) return null;
    const re = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (!re.test(value.toUpperCase())) return 'Invalid PAN format (e.g., ABCDE1234F)';
    return null;
  },

  aadhaar(value) {
    if (!value) return null;
    const cleaned = value.replace(/\s/g, '');
    if (cleaned.length !== 12) return 'Aadhaar must be 12 digits';
    if (!/^\d{12}$/.test(cleaned)) return 'Aadhaar must contain only digits';
    return null;
  },

  pincode(value) {
    if (!value) return null;
    if (!/^\d{6}$/.test(value)) return 'Pincode must be 6 digits';
    return null;
  },

  ifsc(value) {
    if (!value) return null;
    const re = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!re.test(value.toUpperCase())) return 'Invalid IFSC format (e.g., SBIN0001234)';
    return null;
  },

  minValue(value, min, fieldName = 'Value') {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num < min) return `${fieldName} must be at least ${min}`;
    return null;
  },

  maxValue(value, max, fieldName = 'Value') {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num) || num > max) return `${fieldName} must not exceed ${max}`;
    return null;
  },

  minLength(value, len, fieldName = 'This field') {
    if (!value) return null;
    if (value.length < len) return `${fieldName} must be at least ${len} characters`;
    return null;
  },

  maxLength(value, len, fieldName = 'This field') {
    if (!value) return null;
    if (value.length > len) return `${fieldName} must not exceed ${len} characters`;
    return null;
  },

  number(value, fieldName = 'This field') {
    if (!value) return null;
    if (isNaN(parseFloat(value))) return `${fieldName} must be a number`;
    return null;
  },

  accountNumber(value) {
    if (!value) return null;
    if (!/^\d{9,18}$/.test(value)) return 'Account number must be 9-18 digits';
    return null;
  },

  dob(value) {
    if (!value) return null;
    const date = new Date(value);
    const now = new Date();
    const age = Math.floor((now - date) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 18) return 'Applicant must be at least 18 years old';
    if (age > 80) return 'Please enter a valid date of birth';
    return null;
  },

  gst(value) {
    if (!value) return null;
    const re = /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/;
    if (!re.test(value.toUpperCase())) return 'Invalid GST format';
    return null;
  }
};

/**
 * Validate a single field and return the error message or null
 */
export function validateField(value, rules) {
  for (const rule of rules) {
    if (typeof rule === 'function') {
      const error = rule(value);
      if (error) return error;
    } else if (typeof rule === 'object' && rule.validator) {
      const error = rule.validator(value, ...( rule.args || []));
      if (error) return error;
    }
  }
  return null;
}

/**
 * Validate multiple fields at once
 * @param {Object} fields - { fieldName: { value, rules } }
 * @returns {Object} - { fieldName: errorMessage | null }
 */
export function validateFields(fields) {
  const errors = {};
  let hasErrors = false;
  for (const [name, config] of Object.entries(fields)) {
    const error = validateField(config.value, config.rules);
    if (error) {
      errors[name] = error;
      hasErrors = true;
    }
  }
  return { errors, hasErrors };
}

/**
 * Apply validation state to a form input element
 */
export function applyValidationState(inputEl, error) {
  const errorEl = inputEl.closest('.form-group')?.querySelector('.form-error');
  const successEl = inputEl.closest('.form-group')?.querySelector('.form-success');

  inputEl.classList.remove('is-valid', 'is-invalid');

  if (error) {
    inputEl.classList.add('is-invalid');
    if (errorEl) {
      errorEl.textContent = error;
      errorEl.classList.add('visible');
    }
    if (successEl) successEl.classList.remove('visible');
  } else if (inputEl.value) {
    inputEl.classList.add('is-valid');
    if (errorEl) errorEl.classList.remove('visible');
    if (successEl) successEl.classList.add('visible');
  } else {
    if (errorEl) errorEl.classList.remove('visible');
    if (successEl) successEl.classList.remove('visible');
  }
}

/**
 * Cross-step validation: Check income-to-loan ratio
 */
export function validateIncomeToLoanRatio(state) {
  const monthlyIncome = parseFloat(state.monthlyIncome || state.annualTurnover / 12 || 0);
  const loanAmount = parseFloat(state.loanAmount || 0);
  const tenure = parseFloat(state.loanTenure || 12);
  const existingObligations = parseFloat(state.totalObligations || 0);

  if (!monthlyIncome || !loanAmount) return null;

  const emi = calculateEMI(loanAmount, 10.5, tenure);
  const totalObligations = existingObligations + emi;
  const ratio = totalObligations / monthlyIncome;

  if (ratio > 0.6) {
    return 'Your total monthly obligations (including this loan EMI) exceed 60% of your income. This may affect approval.';
  }
  return null;
}

/**
 * EMI Calculation helper
 */
export function calculateEMI(principal, annualRate, tenureMonths) {
  if (!principal || !annualRate || !tenureMonths) return 0;
  const r = annualRate / 12 / 100;
  const n = tenureMonths;
  const emi = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
}

/**
 * Format currency in Indian style (₹)
 */
export function formatCurrency(amount) {
  if (!amount && amount !== 0) return '₹0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0';

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(num);
}

/**
 * Format large numbers with lakhs/crores
 */
export function formatAmountShort(amount) {
  if (!amount) return '₹0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num}`;
}

/**
 * Setup real-time validation on a form input
 */
export function setupRealtimeValidation(inputEl, rules) {
  let touched = false;

  inputEl.addEventListener('blur', () => {
    touched = true;
    const error = validateField(inputEl.value, rules);
    applyValidationState(inputEl, error);
  });

  inputEl.addEventListener('input', () => {
    if (touched) {
      const error = validateField(inputEl.value, rules);
      applyValidationState(inputEl, error);
    }
  });
}
