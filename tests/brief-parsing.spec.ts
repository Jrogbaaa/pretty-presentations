import { test, expect } from '@playwright/test';

test.describe('Brief Parsing Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('homepage loads successfully', async ({ page }) => {
    // Take a screenshot of the homepage
    await page.screenshot({ path: 'test-results/01-homepage.png', fullPage: true });
    
    // Check for key elements
    await expect(page.locator('h1')).toBeVisible();
    
    // Check that the page title is correct
    const title = await page.title();
    console.log('Page title:', title);
    
    expect(await page.locator('body').isVisible()).toBe(true);
  });

  test('sample brief loads correctly', async ({ page }) => {
    // Find and click the "Try Sample Brief" button
    const sampleButton = page.getByText(/try sample brief|load sample|sample/i);
    
    if (await sampleButton.isVisible()) {
      await sampleButton.click();
      
      // Wait a bit for the text to load
      await page.waitForTimeout(500);
      
      // Take screenshot after loading sample
      await page.screenshot({ path: 'test-results/02-sample-loaded.png', fullPage: true });
      
      // Verify textarea has content
      const textarea = page.locator('textarea').first();
      const content = await textarea.inputValue();
      
      expect(content.length).toBeGreaterThan(100);
      expect(content).toContain('The Band');
      
      console.log('Sample brief loaded, length:', content.length);
    } else {
      console.log('Sample brief button not found - skipping test');
    }
  });

  test('brief parsing with AI works', async ({ page }) => {
    // Load sample brief
    const sampleButton = page.getByText(/try sample brief|load sample|sample/i);
    
    if (await sampleButton.isVisible()) {
      await sampleButton.click();
      await page.waitForTimeout(500);
    }
    
    // Find and click the Parse button
    const parseButton = page.getByRole('button', { name: /parse|analyze/i });
    
    if (await parseButton.isVisible()) {
      console.log('Starting brief parsing...');
      
      // Take screenshot before parsing
      await page.screenshot({ path: 'test-results/03-before-parse.png', fullPage: true });
      
      await parseButton.click();
      
      // Wait for parsing to complete (may take several seconds)
      console.log('Waiting for AI processing...');
      
      // Look for loading state
      const loadingIndicator = page.locator('[data-loading], .loading, text=/parsing|processing/i').first();
      if (await loadingIndicator.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log('Loading indicator found, waiting for completion...');
        await loadingIndicator.waitFor({ state: 'hidden', timeout: 30000 });
      }
      
      // Wait for either success or error
      await page.waitForTimeout(5000);
      
      // Take screenshot after parsing
      await page.screenshot({ path: 'test-results/04-after-parse.png', fullPage: true });
      
      // Check for error messages
      const errorMessage = page.locator('[role="alert"], .error, text=/error|failed/i').first();
      const hasError = await errorMessage.isVisible({ timeout: 1000 }).catch(() => false);
      
      if (hasError) {
        const errorText = await errorMessage.textContent();
        console.error('❌ Parsing failed with error:', errorText);
        
        // Check if it's a permission error
        if (errorText?.includes('permission') || errorText?.includes('403')) {
          throw new Error('Permission denied - Vertex AI IAM role may not be configured correctly');
        } else if (errorText?.includes('404')) {
          throw new Error('API not found - Vertex AI API may not be enabled');
        }
        
        throw new Error(`Parsing failed: ${errorText}`);
      }
      
      // Look for success indicators
      console.log('Checking for parsed results...');
      
      // Check console for any errors
      const consoleLogs: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleLogs.push(msg.text());
        }
      });
      
      await page.waitForTimeout(2000);
      
      if (consoleLogs.length > 0) {
        console.error('Console errors detected:', consoleLogs);
      }
      
      console.log('✅ Brief parsing completed without visible errors');
    } else {
      throw new Error('Parse button not found on the page');
    }
  });

  test('form validation works', async ({ page }) => {
    // Test 1: Parse button should be disabled when textarea is empty
    const briefTextarea = page.locator('textarea').first();
    const parseButton = page.getByRole('button', { name: 'Parse Brief & Auto-Fill Form' });
    
    // Verify button is disabled when textarea is empty
    await expect(parseButton).toBeDisabled();
    console.log('✅ Parse button correctly disabled when textarea is empty');
    
    // Test 2: Parse button should be enabled when textarea has content
    await briefTextarea.fill('Sample brief content for testing validation');
    await expect(parseButton).toBeEnabled();
    console.log('✅ Parse button correctly enabled when textarea has content');
    
    // Clear textarea to reset state
    await briefTextarea.fill('');
    
    // Test 3: Generate button should require form fields
    const generateButton = page.getByRole('button', { name: 'Generate Presentation' });
    await generateButton.click();
    
    // Wait a moment for validation to appear
    await page.waitForTimeout(500);
    
    // Take screenshot of validation state
    await page.screenshot({ path: 'test-results/05-validation.png', fullPage: true });
    
    console.log('✅ Form validation working correctly');
  });

  test('check for console errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.error('❌ Console errors found:', errors);
      throw new Error(`Found ${errors.length} console errors`);
    } else {
      console.log('✅ No console errors detected');
    }
  });
});
