import { test, expect } from '@playwright/test';
import { dismissResumeModal, fillStep1, fillStep2, fillStep3, fillStep4Business, fillStep5, fillStep6, fillStep7Business, fillStep8, fillStep9 } from './helpers.js';

test.describe('Business Loan Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);
    await dismissResumeModal(page);
  });

  test('should show business-specific employment fields', async ({ page }) => {
    await fillStep1(page, 'business');
    await fillStep2(page);
    await fillStep3(page);

    // Step 4 should have business-specific fields
    await expect(page.locator('#businessName')).toBeVisible();
    await expect(page.locator('#businessType')).toBeVisible();
    await expect(page.locator('#yearsInBusiness')).toBeVisible();
    await expect(page.locator('#annualTurnover')).toBeVisible();

    // Should NOT have salaried fields
    await expect(page.locator('#companyName')).not.toBeVisible();
    await expect(page.locator('#designation')).not.toBeVisible();
  });

  test('should include collateral step for business loan', async ({ page }) => {
    await fillStep1(page, 'business');

    const steps = page.locator('.progress-step');
    await expect(steps).toHaveCount(10);
  });

  test('should show correct loan purposes for business loan', async ({ page }) => {
    await fillStep1(page, 'business');
    await fillStep2(page);
    await fillStep3(page);
    await fillStep4Business(page);

    // Step 5: Check purpose options
    const options = page.locator('#loanPurpose option');
    const texts = await options.allTextContents();
    expect(texts.join(' ')).toContain('Working Capital');
    expect(texts.join(' ')).toContain('Equipment Purchase');
  });

  test('should complete full business loan flow', async ({ page }) => {
    await fillStep1(page, 'business');
    await fillStep2(page);
    await fillStep3(page);
    await fillStep4Business(page);
    await fillStep5(page, { purpose: 'Working Capital' });
    await fillStep6(page);
    await fillStep7Business(page);
    await fillStep8(page);
    await fillStep9(page);

    // Should be on review page
    await expect(page.locator('#step-10')).toBeVisible();
  });
});
