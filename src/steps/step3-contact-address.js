/**
 * Step 3: Contact & Address
 * With pincode-based autocomplete
 */

import { validators, setupRealtimeValidation } from '../utils/validation.js';
import { lookupPincode, getPincodeSuggestions, INDIAN_STATES } from '../utils/address-autocomplete.js';
import { showToast } from '../components/toast.js';

export function renderStep3(state, onUpdate) {
  const container = document.createElement('div');
  container.className = 'step-content';
  container.id = 'step-3';

  const stateOptions = INDIAN_STATES.map(s =>
    `<option value="${s}" ${state.state === s ? 'selected' : ''}>${s}</option>`
  ).join('');

  container.innerHTML = `
    <div class="step-header">
      <h2 class="step-title">Contact & Address</h2>
      <p class="step-description">Provide your contact information and current residential address.</p>
    </div>

    <div class="glass-card">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="email">Email Address <span class="required">*</span></label>
          <input type="email" class="form-input" id="email" name="email"
            placeholder="your.email@example.com" autocomplete="email"
            value="${state.email || ''}">
          <div class="form-error" id="email-error"></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="phone">Mobile Number <span class="required">*</span></label>
          <div class="input-group">
            <span class="input-addon">+91</span>
            <input type="tel" class="form-input" id="phone" name="phone"
              placeholder="9876543210" maxlength="10" inputmode="numeric"
              autocomplete="tel-national" value="${state.phone || ''}">
          </div>
          <div class="form-error" id="phone-error"></div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="street">Street Address <span class="required">*</span></label>
        <textarea class="form-textarea" id="street" name="street" rows="2"
          placeholder="House/Flat No., Building, Street" autocomplete="street-address"
          style="min-height:70px">${state.street || ''}</textarea>
        <div class="form-error" id="street-error"></div>
      </div>

      <div class="form-group">
        <label class="form-label" for="landmark">Landmark</label>
        <input type="text" class="form-input" id="landmark" name="landmark"
          placeholder="Near..." value="${state.landmark || ''}">
      </div>

      <div class="form-row">
        <div class="form-group" style="position:relative">
          <label class="form-label" for="pincode">Pincode <span class="required">*</span></label>
          <input type="text" class="form-input" id="pincode" name="pincode"
            placeholder="6-digit pincode" maxlength="6" inputmode="numeric"
            autocomplete="postal-code" value="${state.pincode || ''}">
          <div class="form-error" id="pincode-error"></div>
          <div class="form-success" id="pincode-success"></div>
          <div class="autocomplete-dropdown" id="pincode-dropdown" style="display:none"></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="city">City <span class="required">*</span></label>
          <input type="text" class="form-input" id="city" name="city"
            placeholder="City" value="${state.city || ''}">
          <div class="form-error" id="city-error"></div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="district">District</label>
          <input type="text" class="form-input" id="district" name="district"
            placeholder="District" value="${state.district || ''}">
        </div>
        <div class="form-group">
          <label class="form-label" for="state">State <span class="required">*</span></label>
          <select class="form-select" id="state" name="state">
            <option value="">Select State</option>
            ${stateOptions}
          </select>
          <div class="form-error" id="state-error"></div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Residence Type <span class="required">*</span></label>
          <div class="radio-group" id="residenceType-group">
            ${['Own', 'Rented', 'Family'].map(type => `
              <label class="radio-option ${state.residenceType === type.toLowerCase() ? 'selected' : ''}">
                <input type="radio" name="residenceType" value="${type.toLowerCase()}"
                  ${state.residenceType === type.toLowerCase() ? 'checked' : ''}>
                <span class="radio-dot"></span>
                ${type}
              </label>
            `).join('')}
          </div>
          <div class="form-error" id="residenceType-error"></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="yearsAtAddress">Years at Current Address <span class="required">*</span></label>
          <select class="form-select" id="yearsAtAddress" name="yearsAtAddress">
            <option value="">Select</option>
            <option value="<1" ${state.yearsAtAddress === '<1' ? 'selected' : ''}>Less than 1 year</option>
            <option value="1-3" ${state.yearsAtAddress === '1-3' ? 'selected' : ''}>1-3 years</option>
            <option value="3-5" ${state.yearsAtAddress === '3-5' ? 'selected' : ''}>3-5 years</option>
            <option value="5-10" ${state.yearsAtAddress === '5-10' ? 'selected' : ''}>5-10 years</option>
            <option value="10+" ${state.yearsAtAddress === '10+' ? 'selected' : ''}>10+ years</option>
          </select>
          <div class="form-error" id="yearsAtAddress-error"></div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const inputs = ['email', 'phone', 'street', 'landmark', 'pincode', 'city', 'district', 'state', 'yearsAtAddress'];
    inputs.forEach(id => {
      const el = container.querySelector(`#${id}`);
      if (el) {
        el.addEventListener('input', () => onUpdate(id, el.value));
        el.addEventListener('change', () => onUpdate(id, el.value));
      }
    });

    // Validation
    setupRealtimeValidation(container.querySelector('#email'), [v => validators.required(v, 'Email'), validators.email]);
    setupRealtimeValidation(container.querySelector('#phone'), [v => validators.required(v, 'Phone'), validators.phone]);
    setupRealtimeValidation(container.querySelector('#street'), [v => validators.required(v, 'Street address')]);
    setupRealtimeValidation(container.querySelector('#pincode'), [v => validators.required(v, 'Pincode'), validators.pincode]);
    setupRealtimeValidation(container.querySelector('#city'), [v => validators.required(v, 'City')]);

    // Phone input: numbers only
    const phoneEl = container.querySelector('#phone');
    phoneEl.addEventListener('input', () => {
      phoneEl.value = phoneEl.value.replace(/\D/g, '').slice(0, 10);
      onUpdate('phone', phoneEl.value);
    });

    // Pincode autocomplete
    const pincodeEl = container.querySelector('#pincode');
    const dropdown = container.querySelector('#pincode-dropdown');

    pincodeEl.addEventListener('input', async () => {
      const val = pincodeEl.value.replace(/\D/g, '').slice(0, 6);
      pincodeEl.value = val;
      onUpdate('pincode', val);

      if (val.length >= 3 && val.length < 6) {
        const suggestions = getPincodeSuggestions(val);
        if (suggestions.length > 0) {
          dropdown.style.display = 'block';
          dropdown.innerHTML = suggestions.map(s => `
            <div class="autocomplete-item" data-pincode="${s.pincode}">
              <div class="autocomplete-item-primary">${s.pincode}</div>
              <div class="autocomplete-item-secondary">${s.city}, ${s.district}, ${s.state}</div>
            </div>
          `).join('');

          dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('click', () => {
              pincodeEl.value = item.dataset.pincode;
              onUpdate('pincode', item.dataset.pincode);
              dropdown.style.display = 'none';
              fillAddressFromPincode(item.dataset.pincode);
            });
          });
        } else {
          dropdown.style.display = 'none';
        }
      } else if (val.length === 6) {
        dropdown.style.display = 'none';
        fillAddressFromPincode(val);
      } else {
        dropdown.style.display = 'none';
      }
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#pincode') && !e.target.closest('#pincode-dropdown')) {
        dropdown.style.display = 'none';
      }
    });

    async function fillAddressFromPincode(pincode) {
      const result = await lookupPincode(pincode);
      if (result.success) {
        const cityEl = container.querySelector('#city');
        const stateEl = container.querySelector('#state');
        const districtEl = container.querySelector('#district');

        cityEl.value = result.city;
        stateEl.value = result.state;
        districtEl.value = result.district;

        onUpdate('city', result.city);
        onUpdate('state', result.state);
        onUpdate('district', result.district);

        cityEl.classList.add('is-valid');
        stateEl.classList.add('is-valid');

        showToast('info', 'Address Auto-filled', `${result.city}, ${result.state}`);
      }
    }

    // Radio
    container.querySelectorAll('input[name="residenceType"]').forEach(radio => {
      radio.addEventListener('change', () => {
        container.querySelectorAll('#residenceType-group .radio-option').forEach(o => o.classList.remove('selected'));
        radio.closest('.radio-option').classList.add('selected');
        onUpdate('residenceType', radio.value);
      });
    });
  }, 0);

  return container;
}

export function validateStep3(state) {
  const errors = {};
  let valid = true;

  if (!state.email?.trim()) { errors.email = 'Email is required'; valid = false; }
  else { const e = validators.email(state.email); if (e) { errors.email = e; valid = false; } }
  if (!state.phone?.trim()) { errors.phone = 'Phone number is required'; valid = false; }
  else { const e = validators.phone(state.phone); if (e) { errors.phone = e; valid = false; } }
  if (!state.street?.trim()) { errors.street = 'Street address is required'; valid = false; }
  if (!state.pincode?.trim()) { errors.pincode = 'Pincode is required'; valid = false; }
  else { const e = validators.pincode(state.pincode); if (e) { errors.pincode = e; valid = false; } }
  if (!state.city?.trim()) { errors.city = 'City is required'; valid = false; }
  if (!state.state) { errors.state = 'State is required'; valid = false; }
  if (!state.residenceType) { errors.residenceType = 'Residence type is required'; valid = false; }
  if (!state.yearsAtAddress) { errors.yearsAtAddress = 'Years at address is required'; valid = false; }

  return { valid, errors };
}
