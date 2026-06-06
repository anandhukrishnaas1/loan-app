import { test, expect } from '@playwright/test';
import {
  dismissResumeModal, fillStep1, fillStep2, fillStep3,
  fillStep4Personal, fillStep5, fillStep6, fillStep8, fillStep9
} from './helpers.js';

test.describe('Full Application Flow - Personal Loan', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);
    await dismissResumeModal(page);
  });

  test('should complete entire personal loan application', async ({ page }) => {
    // Step 1: Select Personal Loan
    await expect(page.locator('#loan-card-personal')).toBeVisible();
    await fillStep1(page, 'personal');

    // Step 2: Personal Info
    await expect(page.locator('#step-2')).toBeVisible();
    await fillStep2(page);

    // Step 3: Contact & Address
    await expect(page.locator('#step-3')).toBeVisible();
    await fillStep3(page);

    // Step 4: Employment
    await expect(page.locator('#step-4')).toBeVisible();
    await fillStep4Personal(page);

    // Step 5: Loan Details
    await expect(page.locator('#step-5')).toBeVisible();
    await fillStep5(page);

    // Step 6: Financial
    await expect(page.locator('#step-6')).toBeVisible();
    await fillStep6(page);

    // Step 7: Skipped for Personal Loan (goes directly to Documents)

    // Step 8: Documents
    await expect(page.locator('#step-8')).toBeVisible();
    await fillStep8(page);

    // Step 9: Signature
    await expect(page.locator('#step-9')).toBeVisible();
    const canvas = page.locator('#signature-canvas');
    await canvas.scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      const canvas = document.getElementById('signature-canvas');
      const rect = canvas.getBoundingClientRect();
      canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: rect.left + 50, clientY: rect.top + 50 }));
      canvas.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: rect.left + 150, clientY: rect.top + 50 }));
      canvas.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: rect.left + 150, clientY: rect.top + 50 }));
    });
    
    await page.evaluate(() => {
      const cb = document.getElementById('termsAgreed');
      if (cb) { cb.checked = true; cb.dispatchEvent(new Event('change')); }
    });
    await page.click('#next-btn');
    await page.waitForTimeout(1000);

    // Step 10: Review
    await expect(page.locator('#step-10')).toBeVisible();

    // Check eligibility score is visible
    await expect(page.locator('.score-value')).toBeVisible();

    // Submit
    await page.click('#submit-application-btn');
    await page.waitForTimeout(300);

    // Confirm
    await page.click('text=Confirm');
    await page.waitForTimeout(500);

    // Verify success
    await expect(page.locator('.success-container')).toBeVisible();
    await expect(page.locator('#ref-number')).toBeVisible();
  });

  test('should show progress bar with correct steps', async ({ page }) => {
    // For personal loan: 9 steps (collateral skipped)
    await fillStep1(page, 'personal');
    const steps = page.locator('.progress-step');
    await expect(steps).toHaveCount(9); // 10 total minus collateral
  });
});
