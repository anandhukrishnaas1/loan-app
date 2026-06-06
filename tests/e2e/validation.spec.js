import { test, expect } from '@playwright/test';
import { dismissResumeModal, clickRadio } from './helpers.js';

test.describe('Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);
    await dismissResumeModal(page);
  });

  test('should prevent advancing without selecting loan type', async ({ page }) => {
    await page.click('#next-btn');
    await page.waitForTimeout(300);

    // Should still be on step 1
    await expect(page.locator('#step-1')).toBeVisible();

    // Should show error toast
    await expect(page.locator('.toast.error')).toBeVisible();
  });

  test('should show validation errors on step 2', async ({ page }) => {
    // Select loan type
    await page.click('#loan-card-personal');
    await page.click('#next-btn');
    await page.waitForTimeout(400);

    // Try to advance without filling fields
    await page.click('#next-btn');
    await page.waitForTimeout(300);

    // Should still be on step 2
    await expect(page.locator('#step-2')).toBeVisible();
    await expect(page.locator('.toast.error')).toBeVisible();
  });

  test('should validate PAN format', async ({ page }) => {
    await page.click('#loan-card-personal');
    await page.click('#next-btn');
    await page.waitForTimeout(400);

    // Enter invalid PAN
    await page.fill('#panNumber', 'INVALID');
    await page.click('#verify-pan-btn');
    await page.waitForTimeout(300);

    // Should show error
    const panError = page.locator('#panNumber-error');
    await expect(panError).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.click('#loan-card-personal');
    await page.click('#next-btn');
    await page.waitForTimeout(400);

    // Fill step 2 minimally and go to step 3
    await page.fill('#fullName', 'Test User');
    await page.fill('#dob', '1990-01-01');
    await clickRadio(page, 'gender', 'male');
    await page.selectOption('#maritalStatus', 'single');
    await page.fill('#panNumber', 'ABCDE1234F');
    await page.click('#verify-pan-btn');
    await page.waitForTimeout(2000);
    await page.fill('#aadhaarNumber', '123456789012');
    await page.click('#verify-aadhaar-btn');
    await page.waitForTimeout(2500);

    // Fill OTP
    const otpInputs = page.locator('.otp-input');
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill(String(i + 1));
    }
    await page.click('text=Verify OTP');
    await page.waitForTimeout(2000);

    await page.click('#next-btn');
    await page.waitForTimeout(400);

    // Step 3: Enter invalid email
    await page.fill('#email', 'not-an-email');
    await page.locator('#email').blur();
    await page.waitForTimeout(300);

    // Check email validation
    await expect(page.locator('#email')).toHaveClass(/is-invalid/);
  });

  test('should validate phone number format', async ({ page }) => {
    await page.click('#loan-card-personal');
    await page.click('#next-btn');
    await page.waitForTimeout(400);

    // Quick fill step 2 (same as above)
    await page.fill('#fullName', 'Test User');
    await page.fill('#dob', '1990-01-01');
    await clickRadio(page, 'gender', 'male');
    await page.selectOption('#maritalStatus', 'single');
    await page.fill('#panNumber', 'ABCDE1234F');
    await page.click('#verify-pan-btn');
    await page.waitForTimeout(2000);
    await page.fill('#aadhaarNumber', '123456789012');
    await page.click('#verify-aadhaar-btn');
    await page.waitForTimeout(2500);
    const otpInputs = page.locator('.otp-input');
    for (let i = 0; i < 6; i++) await otpInputs.nth(i).fill(String(i + 1));
    await page.click('text=Verify OTP');
    await page.waitForTimeout(2000);
    await page.click('#next-btn');
    await page.waitForTimeout(400);

    // Enter invalid phone
    await page.fill('#phone', '12345');
    await page.locator('#phone').blur();
    await page.waitForTimeout(300);

    await expect(page.locator('#phone')).toHaveClass(/is-invalid/);
  });
});
