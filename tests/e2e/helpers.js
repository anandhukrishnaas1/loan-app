/**
 * E2E Test Helpers
 * Shared utilities for filling form steps in tests
 */

/**
 * Dismiss the resume modal if it appears
 */
export async function dismissResumeModal(page) {
  const startFreshBtn = page.locator('text=Start Fresh');
  if (await startFreshBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await startFreshBtn.click();
    await page.waitForTimeout(300);
  }
}

export async function clickRadio(page, name, value) {
  await page.evaluate(({ n, v }) => {
    const input = document.querySelector(`input[name="${n}"][value="${v}"]`);
    if (input && input.parentElement) {
      input.parentElement.click();
    }
  }, { n: name, v: value });
}

/**
 * Step 1: Select loan type
 */
export async function fillStep1(page, loanType = 'personal') {
  await page.click(`#loan-card-${loanType}`);
  await page.click('#next-btn');
  await page.waitForTimeout(400);
}

/**
 * Step 2: Fill personal info with PAN & Aadhaar verification
 */
export async function fillStep2(page, options = {}) {
  const {
    name = 'Rajesh Kumar',
    dob = '1990-05-15',
    gender = 'male',
    maritalStatus = 'married',
    pan = 'ABCDE1234F',
    aadhaar = '123456789012',
  } = options;

  await page.fill('#fullName', name);
  await page.fill('#dob', dob);
  await clickRadio(page, 'gender', gender);
  await page.selectOption('#maritalStatus', maritalStatus);

  // PAN verification
  await page.fill('#panNumber', pan);
  await page.click('#verify-pan-btn');
  await page.waitForSelector('.verified-badge', { timeout: 5000 });

  // Aadhaar verification
  await page.fill('#aadhaarNumber', aadhaar);
  await page.click('#verify-aadhaar-btn');
  await page.waitForTimeout(2500); // Wait for OTP modal

  // Fill OTP
  const otpInputs = page.locator('.otp-input');
  const digits = '123456';
  for (let i = 0; i < 6; i++) {
    await otpInputs.nth(i).fill(digits[i]);
  }
  await page.click('text=Verify OTP');
  await page.waitForTimeout(2000); // Wait for verification

  await page.click('#next-btn');
  await page.waitForTimeout(400);
}

/**
 * Step 3: Fill contact & address
 */
export async function fillStep3(page, options = {}) {
  const {
    email = 'rajesh@example.com',
    phone = '9876543210',
    street = '123 MG Road, Sector 5',
    pincode = '110001',
    residenceType = 'own',
    yearsAtAddress = '3-5',
  } = options;

  await page.fill('#email', email);
  await page.fill('#phone', phone);
  await page.fill('#street', street);
  await page.fill('#pincode', pincode);
  await page.waitForTimeout(1500); // Wait for autocomplete

  await clickRadio(page, 'residenceType', residenceType);
  await page.selectOption('#yearsAtAddress', yearsAtAddress);

  await page.click('#next-btn');
  await page.waitForTimeout(400);
}

/**
 * Step 4: Fill employment details
 */
export async function fillStep4Personal(page, options = {}) {
  const {
    employmentType = 'salaried',
    company = 'Tech Corp India',
    income = '75000',
  } = options;

  await clickRadio(page, 'employmentType', employmentType);
  await page.fill('#companyName', company);
  await page.fill('#monthlyIncome', income);

  await page.click('#next-btn');
  await page.waitForTimeout(400);
}

export async function fillStep4Home(page, options = {}) {
  const {
    employmentType = 'salaried',
    company = 'Tech Corp India',
    income = '150000',
    designation = 'Senior Manager',
    experience = '5-10',
  } = options;

  await clickRadio(page, 'employmentType', employmentType);
  await page.fill('#companyName', company);
  await page.fill('#monthlyIncome', income);
  await page.fill('#designation', designation);
  await page.selectOption('#yearsOfExperience', experience);

  await page.click('#next-btn');
  await page.waitForTimeout(400);
}

export async function fillStep4Business(page, options = {}) {
  const {
    businessName = 'Kumar Enterprises',
    businessType = 'pvtLtd',
    yearsInBusiness = '5-10',
    turnover = '5000000',
    income = '200000',
  } = options;

  await page.fill('#businessName', businessName);
  await page.selectOption('#businessType', businessType);
  await page.selectOption('#yearsInBusiness', yearsInBusiness);
  await page.fill('#annualTurnover', turnover);
  await page.fill('#monthlyIncome', income);

  await page.click('#next-btn');
  await page.waitForTimeout(400);
}

/**
 * Step 5: Fill loan details
 */
export async function fillStep5(page, options = {}) {
  const { purpose = 'Medical Emergency' } = options;

  // Sliders will have default values, just select purpose
  await page.selectOption('#loanPurpose', purpose);

  await page.click('#next-btn');
  await page.waitForTimeout(400);
}

/**
 * Step 6: Fill financial info
 */
export async function fillStep6(page, options = {}) {
  const {
    creditScore = '750-900',
    bankName = 'State Bank of India',
    accountNumber = '1234567890123',
    ifsc = 'SBIN0001234',
    accountType = 'savings',
  } = options;

  await page.selectOption('#creditScore', creditScore);
  await page.fill('#bankName', bankName);
  await page.fill('#accountNumber', accountNumber);
  await page.fill('#ifscCode', ifsc);
  await page.selectOption('#accountType', accountType);

  await page.click('#next-btn');
  await page.waitForTimeout(400);
}

/**
 * Step 7: Fill collateral (Home loan)
 */
export async function fillStep7Home(page, options = {}) {
  const {
    propertyType = 'apartment',
    location = '42 Palm Beach Road, Navi Mumbai, MH 400076',
    value = '8000000',
    ownership = 'to-be-purchased',
  } = options;

  await page.selectOption('#propertyType', propertyType);
  await page.fill('#propertyLocation', location);
  await page.fill('#propertyValue', value);
  await clickRadio(page, 'ownershipStatus', ownership);

  await page.click('#next-btn');
  await page.waitForTimeout(400);
}

/**
 * Step 7: Fill collateral (Business loan)
 */
export async function fillStep7Business(page, options = {}) {
  const {
    collateralType = 'property',
    description = 'Commercial office space in Andheri',
    value = '5000000',
  } = options;

  await page.selectOption('#collateralType', collateralType);
  await page.fill('#collateralDescription', description);
  await page.fill('#collateralValue', value);

  await page.click('#next-btn');
  await page.waitForTimeout(400);
}

/**
 * Step 8: Upload a test document
 */
export async function fillStep8(page) {
  // Create a simple test file and upload
  const fileInput = page.locator('input[type="file"]').first();

  // Create a 1x1 pixel PNG as test file
  const buffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  await fileInput.setInputFiles({
    name: 'test-document.png',
    mimeType: 'image/png',
    buffer: buffer,
  });

  await page.waitForTimeout(1000); // Wait for compression

  await page.click('#next-btn');
  await page.waitForTimeout(400);
}

/**
 * Step 9: Sign and agree
 */
export async function fillStep9(page) {
  // Draw signature
  const canvas = page.locator('#signature-canvas');
  await canvas.scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    const canvas = document.getElementById('signature-canvas');
    const rect = canvas.getBoundingClientRect();
    canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: rect.left + 50, clientY: rect.top + 50 }));
    canvas.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: rect.left + 150, clientY: rect.top + 50 }));
    canvas.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: rect.left + 150, clientY: rect.top + 50 }));
  });

  await page.waitForTimeout(300);

  // Agree to terms
  await page.evaluate(() => {
    const cb = document.getElementById('termsAgreed');
    if (cb) { cb.checked = true; cb.dispatchEvent(new Event('change')); }
  });

  await page.click('#next-btn');
  await page.waitForTimeout(400);
}
