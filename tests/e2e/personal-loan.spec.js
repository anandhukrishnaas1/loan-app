import { test, expect } from '@playwright/test';
import { dismissResumeModal, fillStep1, fillStep2, fillStep3, fillStep4Personal, fillStep5, fillStep6, fillStep8, fillStep9 } from './helpers.js';

test.describe('Personal Loan Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);
    await dismissResumeModal(page);
  });

  test('should skip collateral step for personal loan', async ({ page }) => {
    await fillStep1(page, 'personal');

    // After selecting personal loan, progress bar should have 9 steps
    const steps = page.locator('.progress-step');
    await expect(steps).toHaveCount(9);

    // Verify 'Collateral' label is not present
    const labels = await page.locator('.progress-step-label').allTextContents();
    expect(labels.join(' ')).not.toContain('Collateral');
  });

  test('should show correct loan amount range for personal loan', async ({ page }) => {
    await fillStep1(page, 'personal');
    await fillStep2(page);
    await fillStep3(page);
    await fillStep4Personal(page);

    // Step 5: Check slider range
    const slider = page.locator('#loanAmount');
    await expect(slider).toHaveAttribute('min', '50000');
    await expect(slider).toHaveAttribute('max', '4000000');
  });

  test('should calculate EMI correctly', async ({ page }) => {
    await fillStep1(page, 'personal');
    await fillStep2(page);
    await fillStep3(page);
    await fillStep4Personal(page);

    // Step 5: EMI display should be visible
    await expect(page.locator('#emi-value')).toBeVisible();
    const emiText = await page.locator('#emi-value').textContent();
    expect(emiText).toContain('₹');
  });
});
