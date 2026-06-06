import { test, expect } from '@playwright/test';
import { dismissResumeModal, fillStep1, fillStep2, fillStep3, fillStep4Personal, fillStep5, fillStep6 } from './helpers.js';

test.describe('Document Upload', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);
    await dismissResumeModal(page);

    // Navigate to step 8 (documents)
    await fillStep1(page, 'personal');
    await fillStep2(page);
    await fillStep3(page);
    await fillStep4Personal(page);
    await fillStep5(page);
    await fillStep6(page);
    // Personal loan skips step 7
  });

  test('should display document upload area', async ({ page }) => {
    await expect(page.locator('#step-8')).toBeVisible();
    await expect(page.locator('.upload-zone').first()).toBeVisible();
    await expect(page.locator('.doc-checklist')).toBeVisible();
  });

  test('should show required documents for personal loan', async ({ page }) => {
    // Personal loan has: PAN, Aadhaar, Photo, Bank Statements
    await expect(page.locator('.doc-checklist-item')).toHaveCount(4);
  });

  test('should upload a file and show preview', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();

    // Create a test PNG
    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    await fileInput.setInputFiles({
      name: 'test-pan.png',
      mimeType: 'image/png',
      buffer: buffer,
    });

    await page.waitForTimeout(1000);

    // Preview should appear
    await expect(page.locator('.upload-preview-item').first()).toBeVisible();
    await expect(page.locator('.upload-preview-name').first()).toContainText('test-pan.png');
  });

  test('should remove uploaded file', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();

    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    await fileInput.setInputFiles({
      name: 'to-remove.png',
      mimeType: 'image/png',
      buffer: buffer,
    });

    await page.waitForTimeout(1000);

    // Hover and click remove
    const previewItem = page.locator('.upload-preview-item').first();
    await previewItem.hover();
    await previewItem.locator('.upload-preview-remove').click({ force: true });

    await page.waitForTimeout(300);

    // Preview should be gone
    await expect(page.locator('.upload-preview-item')).toHaveCount(0);
  });

  test('should block next without any uploads', async ({ page }) => {
    // Try to advance without uploading
    await page.click('#next-btn');
    await page.waitForTimeout(300);

    // Should still be on step 8
    await expect(page.locator('#step-8')).toBeVisible();
    await expect(page.locator('.toast.error')).toBeVisible();
  });
});
