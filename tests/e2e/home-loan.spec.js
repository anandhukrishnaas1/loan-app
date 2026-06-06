import { test, expect } from '@playwright/test';
import { dismissResumeModal, fillStep1, fillStep2, fillStep3, fillStep4Home, fillStep5, fillStep6, fillStep7Home, fillStep8, fillStep9 } from './helpers.js';

test.describe('Home Loan Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);
    await dismissResumeModal(page);
  });

  test('should include collateral step for home loan', async ({ page }) => {
    await fillStep1(page, 'home');

    // After selecting home loan, progress bar should have 10 steps
    const steps = page.locator('.progress-step');
    await expect(steps).toHaveCount(10);

    // Verify 'Collateral' label is present
    const labels = await page.locator('.progress-step-label').allTextContents();
    expect(labels.join(' ')).toContain('Collateral');
  });

  test('should show extra employment fields for home loan', async ({ page }) => {
    await fillStep1(page, 'home');
    await fillStep2(page);
    await fillStep3(page);

    // Step 4 should have designation and experience fields
    await expect(page.locator('#designation')).toBeVisible();
    await expect(page.locator('#yearsOfExperience')).toBeVisible();
  });

  test('should show correct loan amount range for home loan', async ({ page }) => {
    await fillStep1(page, 'home');
    await fillStep2(page);
    await fillStep3(page);
    await fillStep4Home(page);

    // Step 5: Check slider range
    const slider = page.locator('#loanAmount');
    await expect(slider).toHaveAttribute('min', '500000');
    await expect(slider).toHaveAttribute('max', '50000000');
  });

  test('should complete full home loan flow with property details', async ({ page }) => {
    await fillStep1(page, 'home');
    await fillStep2(page);
    await fillStep3(page);
    await fillStep4Home(page);
    await fillStep5(page, { purpose: 'New Home Purchase' });
    await fillStep6(page);
    await fillStep7Home(page);
    await fillStep8(page);
    await fillStep9(page);

    // Should be on review page
    await expect(page.locator('#step-10')).toBeVisible();
    await expect(page.locator('.score-value')).toBeVisible();
  });
});
