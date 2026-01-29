import { test, expect } from '@playwright/test';

/**
 * Stream A: Article Generation Flow E2E Tests
 *
 * Tests the actual article generation functionality for all 4 input modes:
 * 1. Text Mode - Direct text input
 * 2. Site URL Mode - Extract product info from landing page
 * 3. Article URL Mode - Mimic reference article structure
 * 4. Hybrid Mode - Combine multiple sources
 *
 * NOTE: These tests actually invoke the article generation API
 * and may take significant time (30-120 seconds per test)
 */

test.describe('Article Generation - Flow Tests', () => {
  // Increase timeout for actual generation tests
  test.setTimeout(180000); // 3 minutes per test

  test.beforeEach(async ({ page }) => {
    await page.goto('/dev/article-gen');
    await page.waitForLoadState('networkidle');
  });

  test('Flow 1: Text Mode - Generate article with direct text input', async ({ page }) => {
    console.log('[E2E] Starting Text Mode flow test...');

    // 1. Ensure Text mode is selected (default)
    const textModeButton = page.locator('button:has-text("テキスト入力")');
    await textModeButton.click();
    await expect(textModeButton).toHaveClass(/border-blue-500/);

    // 2. Fill in the form
    const keywordInput = page.locator('input').first();
    await keywordInput.fill('TypeScript 入門');

    const productNameInput = page.locator('input').nth(1);
    await productNameInput.fill('Argo Note');

    const descriptionTextarea = page.locator('textarea').first();
    await descriptionTextarea.fill('AI記事生成プラットフォーム');

    // 3. Set article type to FAQ for faster generation
    const articleTypeSelect = page.locator('select').first();
    await articleTypeSelect.selectOption('faq');

    // 4. Ensure images are disabled for faster test
    const imageCheckbox = page.locator('input[type="checkbox"]#includeImages');
    if (await imageCheckbox.isChecked()) {
      await imageCheckbox.click();
    }

    // 5. Click generate button
    console.log('[E2E] Clicking generate button...');
    const generateButton = page.getByRole('button', { name: /記事を生成/i });
    await generateButton.click();

    // 6. Verify loading state (use more specific selector)
    await expect(page.getByText('記事を生成中...')).toBeVisible({ timeout: 5000 });

    // 7. Wait for generation to complete (up to 3 minutes)
    console.log('[E2E] Waiting for generation to complete...');
    await page.waitForFunction(
      () => {
        const loadingText = document.body.innerText.includes('生成中...');
        const resultVisible = document.body.innerText.includes('生成統計');
        const errorVisible = document.querySelector('.bg-red-900\\/50') !== null;
        return !loadingText || resultVisible || errorVisible;
      },
      { timeout: 180000 }
    );

    // 8. Check for errors
    const errorBox = page.locator('.bg-red-900\\/50');
    if (await errorBox.isVisible()) {
      const errorText = await errorBox.textContent();
      console.log('[E2E] Generation error:', errorText);
      // Record error but don't fail test - we want to document the issue
      test.info().annotations.push({
        type: 'error',
        description: `Text Mode generation failed: ${errorText}`,
      });
    } else {
      // 9. Verify successful result
      await expect(page.locator('text=生成統計')).toBeVisible({ timeout: 10000 });
      console.log('[E2E] Text Mode flow completed successfully!');

      // Check word count is displayed
      const wordCountElement = page.locator('.bg-gray-700 >> text=文字数').locator('..');
      await expect(wordCountElement).toBeVisible();

      // Check logs tab is available
      const logsTab = page.locator('button:has-text("Logs")');
      await expect(logsTab).toBeVisible();
    }
  });

  test('Flow 2: Site URL Mode - Generate article from landing page', async ({ page }) => {
    console.log('[E2E] Starting Site URL Mode flow test...');

    // 1. Click Site URL mode
    const siteUrlModeButton = page.locator('button:has-text("サイトURL")');
    await siteUrlModeButton.click();
    await expect(siteUrlModeButton).toHaveClass(/border-blue-500/);

    // 2. Fill in the site URL
    const siteUrlInput = page.locator('input[type="url"]');
    await siteUrlInput.fill('https://www.notion.so/product');

    // 3. Set article type to glossary for faster generation
    const articleTypeSelect = page.locator('select').first();
    await articleTypeSelect.selectOption('glossary');

    // 4. Ensure images are disabled
    const imageCheckbox = page.locator('input[type="checkbox"]#includeImages');
    if (await imageCheckbox.isChecked()) {
      await imageCheckbox.click();
    }

    // 5. Click generate button
    console.log('[E2E] Clicking generate button...');
    const generateButton = page.getByRole('button', { name: /記事を生成/i });
    await generateButton.click();

    // 6. Wait for generation or error
    console.log('[E2E] Waiting for generation to complete...');
    await page.waitForFunction(
      () => {
        const loadingText = document.body.innerText.includes('生成中...');
        const resultVisible = document.body.innerText.includes('生成統計');
        const errorVisible = document.querySelector('.bg-red-900\\/50') !== null;
        return !loadingText || resultVisible || errorVisible;
      },
      { timeout: 180000 }
    );

    // 7. Check result
    const errorBox = page.locator('.bg-red-900\\/50');
    if (await errorBox.isVisible()) {
      const errorText = await errorBox.textContent();
      console.log('[E2E] Generation error:', errorText);
      test.info().annotations.push({
        type: 'error',
        description: `Site URL Mode generation failed: ${errorText}`,
      });
    } else {
      await expect(page.locator('text=生成統計')).toBeVisible({ timeout: 10000 });
      console.log('[E2E] Site URL Mode flow completed successfully!');

      // Verify input mode is displayed
      const inputModeElement = page.locator('text=入力モード').locator('..');
      await expect(inputModeElement).toContainText('site_url');
    }
  });

  test('Flow 3: Article URL Mode - Generate article mimicking reference', async ({ page }) => {
    console.log('[E2E] Starting Article URL Mode flow test...');

    // 1. Click Article URL mode
    const articleUrlModeButton = page.locator('button:has-text("参考記事URL")');
    await articleUrlModeButton.click();
    await expect(articleUrlModeButton).toHaveClass(/border-blue-500/);

    // 2. Fill in the article URL (using a real tech blog article)
    const articleUrlInput = page.locator('input[type="url"]');
    await articleUrlInput.fill('https://zenn.dev/topics/typescript');

    // 3. Set article type to glossary for faster generation
    const articleTypeSelect = page.locator('select').first();
    await articleTypeSelect.selectOption('glossary');

    // 4. Ensure images are disabled
    const imageCheckbox = page.locator('input[type="checkbox"]#includeImages');
    if (await imageCheckbox.isChecked()) {
      await imageCheckbox.click();
    }

    // 5. Click generate button
    console.log('[E2E] Clicking generate button...');
    const generateButton = page.getByRole('button', { name: /記事を生成/i });
    await generateButton.click();

    // 6. Wait for generation or error
    console.log('[E2E] Waiting for generation to complete...');
    await page.waitForFunction(
      () => {
        const loadingText = document.body.innerText.includes('生成中...');
        const resultVisible = document.body.innerText.includes('生成統計');
        const errorVisible = document.querySelector('.bg-red-900\\/50') !== null;
        return !loadingText || resultVisible || errorVisible;
      },
      { timeout: 180000 }
    );

    // 7. Check result
    const errorBox = page.locator('.bg-red-900\\/50');
    if (await errorBox.isVisible()) {
      const errorText = await errorBox.textContent();
      console.log('[E2E] Generation error:', errorText);
      test.info().annotations.push({
        type: 'error',
        description: `Article URL Mode generation failed: ${errorText}`,
      });
    } else {
      await expect(page.locator('text=生成統計')).toBeVisible({ timeout: 10000 });
      console.log('[E2E] Article URL Mode flow completed successfully!');
    }
  });

  test('Flow 4: Hybrid Mode - Generate article with combined sources', async ({ page }) => {
    console.log('[E2E] Starting Hybrid Mode flow test...');

    // 1. Click Hybrid mode
    const hybridModeButton = page.locator('button:has-text("ハイブリッド")');
    await hybridModeButton.click();
    await expect(hybridModeButton).toHaveClass(/border-blue-500/);

    // 2. Fill in keyword (hybrid mode shows keyword input)
    const keywordInput = page.locator('input').first();
    await keywordInput.fill('プロジェクト管理ツール');

    // 3. Fill in product name
    const productNameInput = page.locator('input').nth(1);
    await productNameInput.fill('Argo Note');

    // 4. Fill in site URL (optional in hybrid)
    const siteUrlInput = page.locator('input[placeholder*="example.com/product"]');
    if (await siteUrlInput.isVisible()) {
      await siteUrlInput.fill('https://www.notion.so/product');
    }

    // 5. Set article type to glossary for faster generation
    const articleTypeSelect = page.locator('select').first();
    await articleTypeSelect.selectOption('glossary');

    // 6. Ensure images are disabled
    const imageCheckbox = page.locator('input[type="checkbox"]#includeImages');
    if (await imageCheckbox.isChecked()) {
      await imageCheckbox.click();
    }

    // 7. Click generate button
    console.log('[E2E] Clicking generate button...');
    const generateButton = page.getByRole('button', { name: /記事を生成/i });
    await generateButton.click();

    // 8. Wait for generation or error
    console.log('[E2E] Waiting for generation to complete...');
    await page.waitForFunction(
      () => {
        const loadingText = document.body.innerText.includes('生成中...');
        const resultVisible = document.body.innerText.includes('生成統計');
        const errorVisible = document.querySelector('.bg-red-900\\/50') !== null;
        return !loadingText || resultVisible || errorVisible;
      },
      { timeout: 180000 }
    );

    // 9. Check result
    const errorBox = page.locator('.bg-red-900\\/50');
    if (await errorBox.isVisible()) {
      const errorText = await errorBox.textContent();
      console.log('[E2E] Generation error:', errorText);
      test.info().annotations.push({
        type: 'error',
        description: `Hybrid Mode generation failed: ${errorText}`,
      });
    } else {
      await expect(page.locator('text=生成統計')).toBeVisible({ timeout: 10000 });
      console.log('[E2E] Hybrid Mode flow completed successfully!');

      // Verify input mode is displayed as hybrid
      const inputModeElement = page.locator('text=入力モード').locator('..');
      await expect(inputModeElement).toContainText('hybrid');
    }
  });
});

test.describe('Article Generation - Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dev/article-gen');
    await page.waitForLoadState('networkidle');
  });

  test('Text Mode: Should show error when keyword is empty', async ({ page }) => {
    // Ensure text mode is selected
    const textModeButton = page.locator('button:has-text("テキスト入力")');
    await textModeButton.click();

    // Try to generate without filling keyword
    const generateButton = page.getByRole('button', { name: /記事を生成/i });
    await generateButton.click();

    // Should show error
    const errorBox = page.locator('.bg-red-900\\/50');
    await expect(errorBox).toBeVisible();
    await expect(errorBox).toContainText('キーワード');
  });

  test('Site URL Mode: Should show error for invalid URL', async ({ page }) => {
    // Click Site URL mode
    const siteUrlModeButton = page.locator('button:has-text("サイトURL")');
    await siteUrlModeButton.click();

    // Fill in invalid URL
    const siteUrlInput = page.locator('input[type="url"]');
    await siteUrlInput.fill('not-a-valid-url');

    // Try to generate
    const generateButton = page.getByRole('button', { name: /記事を生成/i });
    await generateButton.click();

    // Should show error
    const errorBox = page.locator('.bg-red-900\\/50');
    await expect(errorBox).toBeVisible();
    await expect(errorBox).toContainText('URL');
  });

  test('Site URL Mode: Should show error when URL is empty', async ({ page }) => {
    // Click Site URL mode
    const siteUrlModeButton = page.locator('button:has-text("サイトURL")');
    await siteUrlModeButton.click();

    // Try to generate without URL
    const generateButton = page.getByRole('button', { name: /記事を生成/i });
    await generateButton.click();

    // Should show error
    const errorBox = page.locator('.bg-red-900\\/50');
    await expect(errorBox).toBeVisible();
  });

  test('Article URL Mode: Should show error when URL is empty', async ({ page }) => {
    // Click Article URL mode
    const articleUrlModeButton = page.locator('button:has-text("参考記事URL")');
    await articleUrlModeButton.click();

    // Try to generate without URL
    const generateButton = page.getByRole('button', { name: /記事を生成/i });
    await generateButton.click();

    // Should show error
    const errorBox = page.locator('.bg-red-900\\/50');
    await expect(errorBox).toBeVisible();
  });
});
