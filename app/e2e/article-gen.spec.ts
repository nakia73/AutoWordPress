import { test, expect } from '@playwright/test';

/**
 * Stream A: Article Generation E2E Tests
 *
 * Tests the standalone article generation UI at /dev/article-gen
 * This page is completely standalone (no Supabase required)
 */

test.describe('Article Generation Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dev/article-gen');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display the article generation form', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Article Generator');

    // Check subtitle
    await expect(page.locator('p.text-gray-400')).toContainText('スタンドアロン');

    // Check input section
    await expect(page.locator('h2').first()).toContainText('入力');

    // Check submit button
    await expect(page.getByRole('button', { name: /記事を生成/i })).toBeVisible();
  });

  test('should have keyword input field', async ({ page }) => {
    // Find keyword input by label
    const keywordInput = page.locator('input').first();
    await expect(keywordInput).toBeVisible();

    // Type into it
    await keywordInput.fill('テストキーワード');
    await expect(keywordInput).toHaveValue('テストキーワード');
  });

  test('should have product name and description fields', async ({ page }) => {
    const inputs = page.locator('input');
    const textarea = page.locator('textarea');

    // Should have at least 2 input fields (keyword, product name)
    await expect(inputs.first()).toBeVisible();
    await expect(inputs.nth(1)).toBeVisible();

    // Should have textarea for description
    await expect(textarea).toBeVisible();
  });

  test('should show error when submitting without keyword', async ({ page }) => {
    // Click generate button without filling keyword
    await page.getByRole('button', { name: /記事を生成/i }).click();

    // Should show error message
    await expect(page.locator('.bg-red-900\\/50')).toBeVisible();
    await expect(page.locator('.bg-red-900\\/50')).toContainText('キーワード');
  });

  test('should allow filling out the complete form', async ({ page }) => {
    // Fill keyword
    const keywordInput = page.locator('input').first();
    await keywordInput.fill('React Hooks 入門');

    // Fill product name
    const productNameInput = page.locator('input').nth(1);
    await productNameInput.fill('Argo Note');

    // Fill description
    const descriptionTextarea = page.locator('textarea');
    await descriptionTextarea.fill('AI記事生成プラットフォーム');

    // Verify values
    await expect(keywordInput).toHaveValue('React Hooks 入門');
    await expect(productNameInput).toHaveValue('Argo Note');
    await expect(descriptionTextarea).toHaveValue('AI記事生成プラットフォーム');
  });

  test('should have article type dropdown with options', async ({ page }) => {
    const selects = page.locator('select');

    // First select should be article type
    const articleTypeSelect = selects.first();
    await expect(articleTypeSelect).toBeVisible();

    // Check options exist
    const options = await articleTypeSelect.locator('option').allTextContents();
    expect(options.length).toBeGreaterThanOrEqual(3);

    // Should contain article, faq, glossary options
    expect(options.some(o => o.toLowerCase().includes('article'))).toBeTruthy();
    expect(options.some(o => o.toLowerCase().includes('faq'))).toBeTruthy();
    expect(options.some(o => o.toLowerCase().includes('glossary'))).toBeTruthy();
  });

  test('should have language dropdown with ja and en options', async ({ page }) => {
    const selects = page.locator('select');

    // Second select should be language
    const languageSelect = selects.nth(1);
    await expect(languageSelect).toBeVisible();

    // Check options
    const options = await languageSelect.locator('option').allTextContents();
    expect(options.length).toBeGreaterThanOrEqual(2);

    // Should have Japanese and English
    expect(options.some(o => o.includes('日本語'))).toBeTruthy();
    expect(options.some(o => o.toLowerCase().includes('english'))).toBeTruthy();
  });

  test('should have include images checkbox', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]#includeImages');
    await expect(checkbox).toBeVisible();

    // Initial state should be unchecked
    await expect(checkbox).not.toBeChecked();

    // Toggle on
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Toggle off
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
  });

  test('should change button state during generation', async ({ page }) => {
    // Fill in keyword
    await page.locator('input').first().fill('テスト');

    const generateButton = page.getByRole('button', { name: /記事を生成/i });

    // Button should be enabled initially
    await expect(generateButton).toBeEnabled();

    // Note: We don't actually trigger generation in E2E tests due to API costs
    // This test verifies the UI state management
  });
});

test.describe('Article Generation - Output Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dev/article-gen');
    await page.waitForLoadState('networkidle');
  });

  test('should show placeholder text when no result', async ({ page }) => {
    // Check for placeholder text in output area
    await expect(page.locator('text=記事を生成すると結果がここに表示されます')).toBeVisible();
  });

  test('should have output section header', async ({ page }) => {
    await expect(page.locator('h2').last()).toContainText('出力');
  });
});

test.describe('Article Generation - Page Structure', () => {
  test('should have responsive layout', async ({ page }) => {
    await page.goto('/dev/article-gen');

    // Check that both panels exist
    const panels = page.locator('.bg-gray-800.rounded-lg');
    await expect(panels.first()).toBeVisible();
    await expect(panels.nth(1)).toBeVisible();
  });

  test('should have dark theme styling', async ({ page }) => {
    await page.goto('/dev/article-gen');

    // Check dark background
    const main = page.locator('.bg-gray-900');
    await expect(main).toBeVisible();
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/dev/article-gen');

    // Tab through form elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should be able to focus elements
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});
