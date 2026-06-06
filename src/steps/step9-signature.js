/**
 * Step 9: E-Signature
 * Terms and conditions, signature canvas, agreement checkbox
 */

import { createSignaturePad } from '../components/signature-pad.js';

export function renderStep9(state, onUpdate) {
  const container = document.createElement('div');
  container.className = 'step-content';
  container.id = 'step-9';

  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  container.innerHTML = `
    <div class="step-header">
      <h2 class="step-title">E-Signature & Agreement</h2>
      <p class="step-description">Review the terms and conditions, then sign below to authorize your application.</p>
    </div>

    <div class="glass-card">
      <h4 style="margin-bottom: var(--space-md)">Terms and Conditions</h4>

      <div class="terms-box" id="terms-box">
        <h4>1. Loan Application Terms</h4>
        <p>By submitting this loan application, I hereby declare that all information provided is true, correct, and complete to the best of my knowledge. I understand that any false or misleading information may result in the rejection of my application or termination of any approved loan.</p>

        <h4>2. Consent for Verification</h4>
        <p>I authorize the lending institution to verify the information provided in this application, including but not limited to employment details, income, credit history, and identity documents. I consent to the institution making inquiries with credit bureaus, employers, banks, and other relevant third parties.</p>

        <h4>3. Credit Bureau Authorization</h4>
        <p>I authorize the institution to obtain my credit report from any credit information company (CIBIL, Equifax, Experian, CRIF High Mark) for the purpose of evaluating my loan application. I understand that this inquiry will be recorded on my credit report.</p>

        <h4>4. Data Privacy</h4>
        <p>I acknowledge that my personal information will be processed in accordance with applicable data protection laws. The institution may use my data for the purpose of loan processing, risk assessment, and regulatory compliance. My data will be securely stored and will not be shared with unauthorized third parties.</p>

        <h4>5. Repayment Obligations</h4>
        <p>I understand that upon approval, I am legally obligated to repay the loan amount along with applicable interest as per the agreed schedule. Failure to make timely payments may result in penalties, legal action, and negative impact on my credit score.</p>

        <h4>6. Pre-closure and Foreclosure</h4>
        <p>I understand the pre-closure charges, if any, as communicated by the institution. I may prepay the loan subject to the terms specified in the loan agreement.</p>

        <h4>7. Communication Consent</h4>
        <p>I consent to receive communications regarding my loan application via email, SMS, phone calls, and postal mail at the contact details provided in this application.</p>

        <h4>8. Declaration</h4>
        <p>I declare that I am not involved in any legal proceedings, bankruptcy, or insolvency and that there are no pending litigations that may affect my ability to repay the loan.</p>
      </div>

      <div class="signature-section">
        <h4 style="margin-bottom: var(--space-md)">Your Signature</h4>
        <div id="signature-pad-container"></div>
      </div>

      <div style="margin-top: var(--space-xl)">
        <label class="checkbox-option ${state.termsAgreed ? 'checked' : ''}" id="terms-checkbox-label">
          <input type="checkbox" id="termsAgreed" name="termsAgreed" ${state.termsAgreed ? 'checked' : ''}>
          <span class="check-box"></span>
          <span>I have read and agree to the Terms and Conditions, Privacy Policy, and authorize the credit bureau check.</span>
        </label>
        <div class="form-error" id="termsAgreed-error"></div>
      </div>

      <div class="signature-date">
        <span>Date:</span>
        <strong id="signature-date">${today}</strong>
      </div>
    </div>
  `;

  setTimeout(() => {
    const padContainer = container.querySelector('#signature-pad-container');
    const signaturePad = createSignaturePad({
      onChange: (dataUrl) => {
        onUpdate('signatureData', dataUrl);
      },
    });
    padContainer.appendChild(signaturePad);
    signaturePad.init();

    // Load existing signature if resuming
    if (state.signatureData) {
      signaturePad.loadFromDataUrl(state.signatureData);
    }

    // Terms checkbox
    const checkbox = container.querySelector('#termsAgreed');
    const checkboxLabel = container.querySelector('#terms-checkbox-label');
    checkbox.addEventListener('change', () => {
      onUpdate('termsAgreed', checkbox.checked);
      if (checkbox.checked) {
        checkboxLabel.classList.add('checked');
      } else {
        checkboxLabel.classList.remove('checked');
      }
    });

    onUpdate('signatureDate', today);
  }, 0);

  return container;
}

export function validateStep9(state) {
  const errors = {};
  let valid = true;

  if (!state.signatureData) {
    errors.signature = 'Please provide your signature';
    valid = false;
  }
  if (!state.termsAgreed) {
    errors.termsAgreed = 'You must agree to the terms and conditions';
    valid = false;
  }

  return { valid, errors };
}
