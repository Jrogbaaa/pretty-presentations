import { test, expect } from '@playwright/test';

test.describe('Full Presentation Flow', () => {
  test('complete flow from brief to presentation', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('📸 Screenshot 1: Homepage');
    await page.screenshot({ 
      path: 'test-results/flow-01-homepage.png', 
      fullPage: true 
    });

    // Scroll to brief upload section
    await page.evaluate(() => {
      document.querySelector('#brief-section')?.scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(1000);

    console.log('📸 Screenshot 2: Brief Section');
    await page.screenshot({ 
      path: 'test-results/flow-02-brief-section.png', 
      fullPage: true 
    });

    // Load sample brief
    const loadSampleButton = page.getByText(/load sample|try sample/i);
    if (await loadSampleButton.isVisible()) {
      await loadSampleButton.click();
      await page.waitForTimeout(500);
      
      console.log('📸 Screenshot 3: Sample Loaded');
      await page.screenshot({ 
        path: 'test-results/flow-03-sample-loaded.png', 
        fullPage: true 
      });
    }

    // Parse the brief
    const parseButton = page.getByRole('button', { name: /parse|analyze/i });
    if (await parseButton.isVisible()) {
      console.log('⏳ Parsing brief with AI...');
      await parseButton.click();

      // Wait for parsing to complete
      await page.waitForTimeout(10000); // AI processing takes ~8-10 seconds

      console.log('📸 Screenshot 4: After Parsing');
      await page.screenshot({ 
        path: 'test-results/flow-04-after-parsing.png', 
        fullPage: true 
      });
    }

    // Scroll down to see the form
    await page.evaluate(() => {
      window.scrollBy(0, 500);
    });
    await page.waitForTimeout(500);

    console.log('📸 Screenshot 5: Form Filled');
    await page.screenshot({ 
      path: 'test-results/flow-05-form-filled.png', 
      fullPage: true 
    });

    // Click "Generate Presentation" button
    const generateButton = page.getByRole('button', { name: /generate presentation/i });
    if (await generateButton.isVisible()) {
      console.log('🎨 Generating presentation...');
      await generateButton.click();

      // Wait for loading overlay to appear
      const loadingOverlay = page.locator('text=Generating Your Presentation');
      await loadingOverlay.waitFor({ state: 'visible', timeout: 5000 });
      console.log('⏳ AI processing started...');

      // Wait for loading to complete (look for overlay to disappear or error message)
      await Promise.race([
        loadingOverlay.waitFor({ state: 'hidden', timeout: 90000 }),
        page.locator('[role="alert"]').filter({ hasText: /.+/ }).waitFor({ state: 'visible', timeout: 90000 })
      ]).catch(() => {
        console.log('⚠️ Loading timeout or error occurred');
      });

      // Check for error messages with actual content
      const errorAlert = page.locator('[role="alert"]').filter({ hasText: /.+/ }).first();
      if (await errorAlert.isVisible({ timeout: 1000 }).catch(() => false)) {
        const errorText = await errorAlert.textContent();
        console.error('❌ Error during generation:', errorText);
        
        // Take screenshot for debugging
        await page.screenshot({ 
          path: 'test-results/flow-ERROR-state.png', 
          fullPage: true 
        });
        
        throw new Error(`Generation failed: ${errorText}`);
      }

      console.log('✅ AI processing completed, waiting for navigation...');

      // Now wait for navigation with longer timeout
      await page.waitForURL(/\/editor\/\d+/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log('📸 Screenshot 6: Presentation Editor');
      await page.screenshot({ 
        path: 'test-results/flow-06-editor.png', 
        fullPage: true 
      });

      // Take screenshot of first slide
      await page.waitForTimeout(1000);
      console.log('📸 Screenshot 7: First Slide');
      await page.screenshot({ 
        path: 'test-results/flow-07-first-slide.png', 
        fullPage: false 
      });

      // Try to navigate to next slide if possible
      const nextButton = page.getByRole('button', { name: /next/i }).first();
      if (await nextButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await nextButton.click();
        await page.waitForTimeout(500);
        
        console.log('📸 Screenshot 8: Second Slide');
        await page.screenshot({ 
          path: 'test-results/flow-08-second-slide.png', 
          fullPage: false 
        });
      }

      // Check for slide thumbnails/navigation
      const slideNav = page.locator('[class*="slide"]').first();
      if (await slideNav.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log('📸 Screenshot 9: Full Editor View');
        await page.screenshot({ 
          path: 'test-results/flow-09-full-editor.png', 
          fullPage: true 
        });
      }

      console.log('✅ Full flow test completed successfully!');
    } else {
      console.log('⚠️  Generate button not found');
    }
  });
});

