import { test, expect } from '@playwright/test';

test.describe('Text Response Generation', () => {
  test('complete flow from brief to text response', async ({ page }) => {
    // Set a longer timeout for this test as it involves AI processing
    test.setTimeout(120000);

    console.log('🚀 Starting text response generation test...');
    
    // Navigate to homepage
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('📸 Screenshot 1: Homepage loaded');
    await page.screenshot({ 
      path: 'test-results/text-01-homepage.png', 
      fullPage: true 
    });

    // Scroll to brief section
    await page.evaluate(() => {
      document.querySelector('#brief-section')?.scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(1000);

    console.log('📸 Screenshot 2: Brief Section visible');
    await page.screenshot({ 
      path: 'test-results/text-02-brief-section.png', 
      fullPage: true 
    });

    // Load sample brief
    console.log('📝 Loading sample brief...');
    const loadSampleButton = page.getByRole('button', { name: /random sample/i });
    await expect(loadSampleButton).toBeVisible({ timeout: 5000 });
    await loadSampleButton.click();
    await page.waitForTimeout(1000);
    
    console.log('📸 Screenshot 3: Sample loaded');
    await page.screenshot({ 
      path: 'test-results/text-03-sample-loaded.png', 
      fullPage: true 
    });

    // Check if we need to parse the brief first
    const parseButton = page.getByRole('button', { name: /parse brief|analyze brief/i });
    if (await parseButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('🔍 Parsing brief with AI...');
      await parseButton.click();

      // Wait for parsing to complete (AI processing)
      await page.waitForTimeout(15000); // 15 seconds for AI parsing

      console.log('📸 Screenshot 4: After parsing');
      await page.screenshot({ 
        path: 'test-results/text-04-after-parsing.png', 
        fullPage: true 
      });

      // Check for parse errors
      const errorAlert = page.locator('[role="alert"]').filter({ hasText: /.+/ }).first();
      if (await errorAlert.isVisible({ timeout: 1000 }).catch(() => false)) {
        const errorText = await errorAlert.textContent();
        console.error('❌ Error during parsing:', errorText);
        await page.screenshot({ 
          path: 'test-results/text-ERROR-parsing.png', 
          fullPage: true 
        });
        throw new Error(`Parsing failed: ${errorText}`);
      }
    }

    // Scroll to see the form and buttons
    await page.evaluate(() => {
      window.scrollBy(0, 500);
    });
    await page.waitForTimeout(1000);

    console.log('📸 Screenshot 5: Form area visible');
    await page.screenshot({ 
      path: 'test-results/text-05-form-visible.png', 
      fullPage: true 
    });

    // Look for "Create Text Response" or "Generate Text Response" button
    console.log('🔍 Looking for text response button...');
    
    // Try multiple possible button texts
    const textResponseButton = page.getByRole('button', { 
      name: /create text response|generate text response|text response|influencer recommendations/i 
    });
    
    await expect(textResponseButton).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Found text response button');
    await page.screenshot({ 
      path: 'test-results/text-06-button-found.png', 
      fullPage: true 
    });

    // Click the text response button
    console.log('🎯 Clicking text response button...');
    await textResponseButton.click();

    // Wait for processing to start
    await page.waitForTimeout(2000);

    console.log('📸 Screenshot 7: Processing started');
    await page.screenshot({ 
      path: 'test-results/text-07-processing-started.png', 
      fullPage: true 
    });

    // Look for loading indicator
    const loadingIndicator = page.locator('text=/generating|processing|creating/i').first();
    if (await loadingIndicator.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('⏳ AI processing in progress...');
      
      // Wait for loading to complete (up to 60 seconds)
      await loadingIndicator.waitFor({ state: 'hidden', timeout: 60000 }).catch(() => {
        console.log('⚠️ Loading indicator did not disappear within timeout');
      });
    }

    await page.waitForTimeout(2000);

    console.log('📸 Screenshot 8: After processing');
    await page.screenshot({ 
      path: 'test-results/text-08-after-processing.png', 
      fullPage: true 
    });

    // Check for errors
    const errorAlert = page.locator('[role="alert"]').filter({ hasText: /.+/ }).first();
    if (await errorAlert.isVisible({ timeout: 1000 }).catch(() => false)) {
      const errorText = await errorAlert.textContent();
      console.error('❌ Error during text response generation:', errorText);
      
      await page.screenshot({ 
        path: 'test-results/text-ERROR-generation.png', 
        fullPage: true 
      });
      
      throw new Error(`Text response generation failed: ${errorText}`);
    }

    // Wait for navigation to response page
    console.log('⏳ Waiting for navigation to response page...');
    
    try {
      await page.waitForURL(/\/response\//, { timeout: 15000 });
      console.log('✅ Navigated to response page');
    } catch (navError) {
      console.error('❌ Failed to navigate to response page');
      await page.screenshot({ 
        path: 'test-results/text-ERROR-no-navigation.png', 
        fullPage: true 
      });
      throw new Error('Did not navigate to response page');
    }

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('📸 Screenshot 9: Response page loaded');
    await page.screenshot({ 
      path: 'test-results/text-09-response-page.png', 
      fullPage: true 
    });

    // Check for content on response page
    console.log('🔍 Checking response page content...');
    
    // Look for markdown content
    const markdownContent = page.locator('article, .prose, [class*="markdown"]').first();
    if (await markdownContent.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ Markdown content found');
      
      // Check for key elements in the response
      const hasHeading = await page.locator('h1, h2').first().isVisible({ timeout: 2000 }).catch(() => false);
      const hasText = await page.locator('p').first().isVisible({ timeout: 2000 }).catch(() => false);
      
      console.log(`- Has heading: ${hasHeading}`);
      console.log(`- Has text: ${hasText}`);
      
      if (!hasHeading || !hasText) {
        console.warn('⚠️ Response page is missing expected content');
      }
    } else {
      console.error('❌ No markdown content found on response page');
      await page.screenshot({ 
        path: 'test-results/text-ERROR-no-content.png', 
        fullPage: true 
      });
      throw new Error('Response page is missing content');
    }

    // Scroll through the response
    await page.evaluate(() => {
      window.scrollBy(0, 500);
    });
    await page.waitForTimeout(500);

    console.log('📸 Screenshot 10: Response content (scrolled)');
    await page.screenshot({ 
      path: 'test-results/text-10-response-scrolled.png', 
      fullPage: false 
    });

    // Take a full page screenshot
    console.log('📸 Screenshot 11: Full response page');
    await page.screenshot({ 
      path: 'test-results/text-11-response-fullpage.png', 
      fullPage: true 
    });

    // Check for action buttons (download, copy, etc.)
    const downloadButton = page.getByRole('button', { name: /download/i });
    const copyButton = page.getByRole('button', { name: /copy/i });
    
    const hasDownload = await downloadButton.isVisible({ timeout: 2000 }).catch(() => false);
    const hasCopy = await copyButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    console.log(`- Has download button: ${hasDownload}`);
    console.log(`- Has copy button: ${hasCopy}`);

    // Test copy functionality if available
    if (hasCopy) {
      console.log('📋 Testing copy functionality...');
      await copyButton.click();
      await page.waitForTimeout(1000);
      
      console.log('📸 Screenshot 12: After copy');
      await page.screenshot({ 
        path: 'test-results/text-12-after-copy.png', 
        fullPage: false 
      });
    }

    console.log('✅ Text response generation test completed successfully!');
    
    // Final assertion
    expect(await page.url()).toMatch(/\/response\//);
  });
});

