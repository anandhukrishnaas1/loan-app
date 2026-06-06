import { test, expect } from '@playwright/test';
import { dismissResumeModal, fillStep1, fillStep2, fillStep3, fillStep4Personal, fillStep5, fillStep6, fillStep8 } from './helpers.js';

test.describe('E-Signature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);
    await dismissResumeModal(page);

    // Navigate to step 9 (signature)
    await fillStep1(page, 'personal');
    await fillStep2(page);
    await fillStep3(page);
    await fillStep4Personal(page);
    await fillStep5(page);
    await fillStep6(page);
    await fillStep8(page);
  });

  test('should display signature canvas', async ({ page }) => {
    await expect(page.locator('#step-9')).toBeVisible();
    await expect(page.locator('#signature-canvas')).toBeVisible();
    await expect(page.locator('.terms-box')).toBeVisible();
  });

  test('should draw on signature canvas', async ({ page }) => {
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

    // Placeholder should be hidden
    const placeholder = page.locator('.signature-placeholder');
    await expect(placeholder).toHaveCSS('opacity', '0');
  });

  test('should clear signature', async ({ page }) => {
    const canvas = page.locator('#signature-canvas');
    const box = await canvas.boundingBox();

    // Draw
    await page.mouse.move(box.x + 50, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 200, box.y + box.height / 2, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    // Clear
    await page.click('text=✕ Clear');
    await page.waitForTimeout(300);

    // Placeholder should be visible again
    const placeholder = page.locator('.signature-placeholder');
    await expect(placeholder).toHaveCSS('opacity', '1');
  });

  test('should block next without signature and terms agreement', async ({ page }) => {
    // Try to advance without signing or agreeing
    await page.click('#next-btn');
    await page.waitForTimeout(300);

    // Should still be on step 9
    await expect(page.locator('#step-9')).toBeVisible();
    await expect(page.locator('.toast.error')).toBeVisible();
  });

  test('should block next with signature but no terms agreement', async ({ page }) => {
    const canvas = page.locator('#signature-canvas');
    const box = await canvas.boundingBox();

    // Draw
    await page.mouse.move(box.x + 50, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 200, box.y + box.height / 2, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    // Don't agree to terms, try to advance
    await page.click('#next-btn');
    await page.waitForTimeout(300);

    // Should still be on step 9
    await expect(page.locator('#step-9')).toBeVisible();
  });

  test('should show today\'s date', async ({ page }) => {
    const today = new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
    await expect(page.locator('#signature-date')).toContainText(today);
  });
});
