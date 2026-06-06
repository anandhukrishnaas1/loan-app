import { test, expect } from '@playwright/test';
import { dismissResumeModal, fillStep1 } from './helpers.js';

test.describe('Auto-save & Resume', () => {
  test('should save progress and show resume modal on reload', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);
    await dismissResumeModal(page);

    // Fill step 1
    await page.click('#loan-card-personal');
    await page.click('#next-btn');
    await page.waitForTimeout(600);

    // Fill some fields in step 2
    await page.fill('#fullName', 'Autosave Test User');
    await page.waitForTimeout(800); // Wait for debounced save

    // Verify data is in localStorage
    const hasData = await page.evaluate(() => {
      return localStorage.getItem('loan_app_state') !== null;
    });
    expect(hasData).toBe(true);

    // Reload
    await page.reload();
    await page.waitForTimeout(500);

    // Should show resume modal
    await expect(page.locator('text=Resume Application?')).toBeVisible();
  });

  test('should resume from saved step', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);
    await dismissResumeModal(page);

    // Fill step 1 and go to step 2
    await page.click('#loan-card-personal');
    await page.click('#next-btn');
    await page.waitForTimeout(400);

    // Fill name
    await page.fill('#fullName', 'Resume Test');
    await page.waitForTimeout(1500); // Wait for debounce

    // Reload and resume
    await page.reload();
    await page.waitForTimeout(500);

    // Click "Resume" button
    await page.click('.modal-actions button:has-text("Resume")');
    await page.waitForTimeout(500);

    // Should be back on step 2 with name filled
    await expect(page.locator('#fullName')).toHaveValue('Resume Test');
  });

  test('should clear saved data on Start Fresh', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);
    await dismissResumeModal(page);

    // Save some data
    await page.click('#loan-card-home');
    await page.waitForTimeout(800);

    // Reload
    await page.reload();
    await page.waitForTimeout(500);

    // Click Start Fresh
    await page.click('text=Start Fresh');
    await page.waitForTimeout(300);

    // LocalStorage should be cleared
    const hasData = await page.evaluate(() => {
      return localStorage.getItem('loan_app_state') !== null;
    });
    expect(hasData).toBe(false);
  });
});
