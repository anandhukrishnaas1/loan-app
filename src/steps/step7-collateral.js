/**
 * Step 7: Collateral & Property Details
 * Conditional: Only shown for Home and Business loans
 */

import { validators, setupRealtimeValidation, formatCurrency } from '../utils/validation.js';

export function renderStep7(state, onUpdate) {
  const container = document.createElement('div');
  container.className = 'step-content';
  container.id = 'step-7';

  const isHome = state.loanType === 'home';
  const isBusiness = state.loanType === 'business';

  let fieldsHTML = '';

  if (isHome) {
    fieldsHTML = `
      <div class="form-group">
        <label class="form-label" for="propertyType">Property Type <span class="required">*</span></label>
        <select class="form-select" id="propertyType" name="propertyType">
          <option value="">Select</option>
          <option value="apartment" ${state.propertyType === 'apartment' ? 'selected' : ''}>Apartment / Flat</option>
          <option value="independentHouse" ${state.propertyType === 'independentHouse' ? 'selected' : ''}>Independent House</option>
          <option value="villa" ${state.propertyType === 'villa' ? 'selected' : ''}>Villa</option>
          <option value="plot" ${state.propertyType === 'plot' ? 'selected' : ''}>Plot / Land</option>
          <option value="builderFloor" ${state.propertyType === 'builderFloor' ? 'selected' : ''}>Builder Floor</option>
        </select>
        <div class="form-error" id="propertyType-error"></div>
      </div>

      <div class="form-group">
        <label class="form-label" for="propertyLocation">Property Location <span class="required">*</span></label>
        <textarea class="form-textarea" id="propertyLocation" name="propertyLocation"
          placeholder="Full address of the property" style="min-height:70px">${state.propertyLocation || ''}</textarea>
        <div class="form-error" id="propertyLocation-error"></div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="propertyValue">Estimated Property Value (₹) <span class="required">*</span></label>
          <div class="input-group">
            <span class="input-addon">₹</span>
            <input type="text" class="form-input" id="propertyValue" name="propertyValue"
              placeholder="e.g. 5000000" inputmode="numeric"
              value="${state.propertyValue || ''}">
          </div>
          <div class="form-error" id="propertyValue-error"></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="propertyAge">Property Age</label>
          <select class="form-select" id="propertyAge" name="propertyAge">
            <option value="">Select</option>
            <option value="new" ${state.propertyAge === 'new' ? 'selected' : ''}>New Construction</option>
            <option value="underConstruction" ${state.propertyAge === 'underConstruction' ? 'selected' : ''}>Under Construction</option>
            <option value="0-5" ${state.propertyAge === '0-5' ? 'selected' : ''}>0-5 years</option>
            <option value="5-10" ${state.propertyAge === '5-10' ? 'selected' : ''}>5-10 years</option>
            <option value="10-20" ${state.propertyAge === '10-20' ? 'selected' : ''}>10-20 years</option>
            <option value="20+" ${state.propertyAge === '20+' ? 'selected' : ''}>20+ years</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Property Ownership Status <span class="required">*</span></label>
        <div class="radio-group" id="ownershipStatus-group">
          ${['Self-owned', 'Joint', 'To be purchased', 'Family-owned'].map(s => `
            <label class="radio-option ${state.ownershipStatus === s.toLowerCase().replace(/\s/g, '-') ? 'selected' : ''}">
              <input type="radio" name="ownershipStatus" value="${s.toLowerCase().replace(/\s/g, '-')}"
                ${state.ownershipStatus === s.toLowerCase().replace(/\s/g, '-') ? 'checked' : ''}>
              <span class="radio-dot"></span>
              ${s}
            </label>
          `).join('')}
        </div>
        <div class="form-error" id="ownershipStatus-error"></div>
      </div>
    `;
  } else if (isBusiness) {
    fieldsHTML = `
      <div class="form-group">
        <label class="form-label" for="collateralType">Collateral Type <span class="required">*</span></label>
        <select class="form-select" id="collateralType" name="collateralType">
          <option value="">Select</option>
          <option value="property" ${state.collateralType === 'property' ? 'selected' : ''}>Property</option>
          <option value="fixedDeposit" ${state.collateralType === 'fixedDeposit' ? 'selected' : ''}>Fixed Deposit</option>
          <option value="equipment" ${state.collateralType === 'equipment' ? 'selected' : ''}>Equipment / Machinery</option>
          <option value="inventory" ${state.collateralType === 'inventory' ? 'selected' : ''}>Inventory</option>
          <option value="none" ${state.collateralType === 'none' ? 'selected' : ''}>No Collateral (Unsecured)</option>
        </select>
        <div class="form-error" id="collateralType-error"></div>
      </div>

      <div class="form-group" id="collateral-desc-group">
        <label class="form-label" for="collateralDescription">Collateral Description</label>
        <textarea class="form-textarea" id="collateralDescription" name="collateralDescription"
          placeholder="Describe the collateral asset" style="min-height:70px">${state.collateralDescription || ''}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label" for="collateralValue">Estimated Collateral Value (₹)</label>
        <div class="input-group">
          <span class="input-addon">₹</span>
          <input type="text" class="form-input" id="collateralValue" name="collateralValue"
            placeholder="e.g. 2000000" inputmode="numeric"
            value="${state.collateralValue || ''}">
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="step-header">
      <h2 class="step-title">${isHome ? 'Property Details' : 'Collateral Information'}</h2>
      <p class="step-description">${isHome ? 'Provide details about the property you intend to purchase or mortgage.' : 'Provide collateral details if applicable for your business loan.'}</p>
    </div>
    <div class="glass-card">
      ${fieldsHTML}
    </div>
  `;

  setTimeout(() => {
    // Bind inputs
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

    // Number-only fields
    ['propertyValue', 'collateralValue'].forEach(id => {
      const el = container.querySelector(`#${id}`);
      if (el) {
        el.addEventListener('input', () => {
          el.value = el.value.replace(/[^\d]/g, '');
          onUpdate(id, el.value);
        });
      }
    });
  }, 0);

  return container;
}

export function validateStep7(state) {
  const errors = {};
  let valid = true;

  if (state.loanType === 'home') {
    if (!state.propertyType) { errors.propertyType = 'Property type is required'; valid = false; }
    if (!state.propertyLocation?.trim()) { errors.propertyLocation = 'Property location is required'; valid = false; }
    if (!state.propertyValue) { errors.propertyValue = 'Property value is required'; valid = false; }
    if (!state.ownershipStatus) { errors.ownershipStatus = 'Ownership status is required'; valid = false; }
  } else if (state.loanType === 'business') {
    if (!state.collateralType) { errors.collateralType = 'Collateral type is required'; valid = false; }
  }

  return { valid, errors };
}

export function shouldShowStep7(state) {
  return state.loanType === 'home' || state.loanType === 'business';
}
