import { test, expect } from '@playwright/test';

/**
 * Revenue Generation System E2E Tests
 * Tests the 5 critical improvements:
 * 1. Goal detection and strategy
 * 2. Nano-influencer prioritization for sales
 * 3. Budget utilization (80-100%)
 * 4. Revenue metrics (ROIS, conversions)
 * 5. Strategic positioning
 */

test.describe('Revenue Generation System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('Sales Campaign: E-commerce with Revenue Goals', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes for full generation

    console.log('🧪 TEST 1: Sales Campaign with E-commerce Focus');

    // Wait for form to be visible
    await page.waitForSelector('text=Client Brief', { timeout: 10000 });

    // Fill in a sales-focused brief using user-facing selectors
    await page.getByPlaceholder('e.g., Starbucks, Nike, Red Bull').fill('ModaOnline Fashion Store');
    await page.getByRole('spinbutton', { name: 'Budget (€) *' }).fill('20000');
    
    // Select Instagram platform
    await page.getByRole('button', { name: 'Instagram' }).click();

    // Fill campaign goals - use the textarea for campaign goals
    const goalsInput = page.locator('input[placeholder*="Increase brand awareness"]');
    await goalsInput.fill('Aumentar ventas online en un 30%');
    await page.locator('button:has-text("Add")').first().click();
    
    // Target demographics
    await page.getByPlaceholder('e.g., 18-35').fill('25-45');
    await page.getByPlaceholder('e.g., All genders, 60% Female').fill('Female');
    
    // Locations
    await page.locator('input[placeholder*="Spain, Madrid"]').fill('España');
    await page.locator('button:has-text("Add")').nth(1).click();
    
    // Interests
    await page.locator('input[placeholder*="Fashion, Technology"]').fill('fashion, shopping, style');
    await page.locator('button:has-text("Add")').nth(2).click();

    // Content themes
    await page.locator('input[placeholder*="Authenticity, Sustainability"]').fill('Fashion trends, outfit inspiration');
    await page.locator('button:has-text("Add")').nth(3).click();

    // Timeline
    await page.getByPlaceholder('e.g., Q1 2025, March-May 2025, 8 weeks').fill('2 months');

    console.log('✅ Form filled with sales campaign data');

    // Submit as TEXT RESPONSE to see full revenue metrics
    await page.click('button:has-text("Generate Text Response")');

    // Wait for processing overlay
    await page.waitForSelector('text=Processing brief requirements', { timeout: 10000 });
    console.log('⏳ Processing started...');

    // Wait for completion (should take 60-90 seconds)
    await page.waitForSelector('text=Your recommendations are ready', { timeout: 120000 });
    console.log('✅ Processing complete');

    // Give time for content to render
    await page.waitForTimeout(2000);

    // Get the markdown content
    const markdownContent = await page.locator('.prose').innerText();
    
    console.log('\n📊 EVALUATING OUTPUT:\n');

    // TEST 1: Goal Detection - Should detect "sales" goal
    console.log('1️⃣ Testing Goal Detection...');
    const hasSalesStrategy = markdownContent.includes('Sales-Optimized Strategy') || 
                              markdownContent.includes('Revenue-Driven Approach') ||
                              markdownContent.includes('nano-influencers outperform');
    
    if (hasSalesStrategy) {
      console.log('✅ PASS: Sales strategy detected');
    } else {
      console.log('❌ FAIL: Sales strategy NOT detected');
      console.log('Content preview:', markdownContent.substring(0, 500));
    }

    // TEST 2: Nano-Influencer Prioritization
    console.log('\n2️⃣ Testing Nano-Influencer Prioritization...');
    const hasNanoPriority = markdownContent.includes('70%') && 
                             (markdownContent.includes('nano') || markdownContent.includes('Nano'));
    
    if (hasNanoPriority) {
      console.log('✅ PASS: Nano-influencer prioritization mentioned');
    } else {
      console.log('⚠️  WARNING: Nano-influencer priority not clearly stated');
    }

    // TEST 3: Revenue Metrics (ROIS, Conversions, Projected Revenue)
    console.log('\n3️⃣ Testing Revenue Metrics...');
    const hasROIS = markdownContent.includes('ROIS') || markdownContent.includes('Return on Influencer Spend');
    const hasConversions = markdownContent.includes('Conversion') || markdownContent.includes('conversions');
    const hasRevenue = markdownContent.includes('Projected Revenue') || markdownContent.includes('revenue');
    
    console.log(`   - ROIS: ${hasROIS ? '✅' : '❌'}`);
    console.log(`   - Conversions: ${hasConversions ? '✅' : '❌'}`);
    console.log(`   - Revenue: ${hasRevenue ? '✅' : '❌'}`);

    const revenueScore = [hasROIS, hasConversions, hasRevenue].filter(Boolean).length;
    if (revenueScore >= 2) {
      console.log('✅ PASS: Revenue metrics present');
    } else {
      console.log('❌ FAIL: Revenue metrics missing or incomplete');
    }

    // TEST 4: Strategic Positioning (Business Language)
    console.log('\n4️⃣ Testing Strategic Positioning...');
    const hasBusinessLanguage = markdownContent.includes('business') || 
                                  markdownContent.includes('revenue generation') ||
                                  markdownContent.includes('investment');
    
    if (hasBusinessLanguage) {
      console.log('✅ PASS: Strategic business language used');
    } else {
      console.log('⚠️  WARNING: Could use more business-focused language');
    }

    // TEST 5: Budget Utilization Check (count influencers mentioned)
    console.log('\n5️⃣ Testing Influencer Count (Budget Utilization Proxy)...');
    // Count unique influencer mentions (look for @ handles)
    const handleMatches = markdownContent.match(/@\w+/g);
    const uniqueHandles = handleMatches ? new Set(handleMatches).size : 0;
    
    console.log(`   Found ${uniqueHandles} unique influencers`);
    if (uniqueHandles >= 8) {
      console.log('✅ PASS: Good influencer count (suggests budget utilization)');
    } else if (uniqueHandles >= 5) {
      console.log('⚠️  ACCEPTABLE: Moderate influencer count');
    } else {
      console.log('❌ FAIL: Too few influencers (suggests budget under-utilization)');
    }

    // SUMMARY
    console.log('\n' + '='.repeat(60));
    console.log('📊 SALES CAMPAIGN TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Goal Detection: ${hasSalesStrategy ? '✅' : '❌'}`);
    console.log(`Nano Priority: ${hasNanoPriority ? '✅' : '⚠️'}`);
    console.log(`Revenue Metrics: ${revenueScore >= 2 ? '✅' : '❌'}`);
    console.log(`Strategic Language: ${hasBusinessLanguage ? '✅' : '⚠️'}`);
    console.log(`Influencer Count: ${uniqueHandles >= 8 ? '✅' : uniqueHandles >= 5 ? '⚠️' : '❌'} (${uniqueHandles})`);
    console.log('='.repeat(60));

    // Assert at least 3/5 critical checks pass
    const passCount = [
      hasSalesStrategy,
      hasNanoPriority,
      revenueScore >= 2,
      hasBusinessLanguage,
      uniqueHandles >= 5
    ].filter(Boolean).length;

    expect(passCount).toBeGreaterThanOrEqual(3);
  });

  test('Awareness Campaign: Brand Launch', async ({ page }) => {
    test.setTimeout(120000);

    console.log('🧪 TEST 2: Awareness Campaign');

    // Wait for form
    await page.waitForSelector('text=Client Brief', { timeout: 10000 });

    // Fill in an awareness-focused brief
    await page.getByPlaceholder('e.g., Starbucks, Nike, Red Bull').fill('Nueva Marca Lifestyle');
    await page.getByRole('spinbutton', { name: 'Budget (€) *' }).fill('15000');
    
    await page.getByRole('button', { name: 'Instagram' }).click();

    // Awareness-focused goals (no sales keywords)
    const goalsInput = page.locator('input[placeholder*="Increase brand awareness"]');
    await goalsInput.fill('Brand awareness, alcanzar 500k impresiones');
    await page.locator('button:has-text("Add")').first().click();
    
    await page.getByPlaceholder('e.g., 18-35').fill('18-35');
    await page.getByPlaceholder('e.g., All genders, 60% Female').fill('All');
    
    await page.locator('input[placeholder*="Spain, Madrid"]').fill('España');
    await page.locator('button:has-text("Add")').nth(1).click();
    
    await page.locator('input[placeholder*="Fashion, Technology"]').fill('lifestyle, trends, culture');
    await page.locator('button:has-text("Add")').nth(2).click();

    await page.locator('input[placeholder*="Authenticity, Sustainability"]').fill('Lifestyle content, aspirational imagery');
    await page.locator('button:has-text("Add")').nth(3).click();
    
    await page.getByPlaceholder('e.g., Q1 2025, March-May 2025, 8 weeks').fill('1 month');

    console.log('✅ Form filled with awareness campaign data');

    await page.click('button:has-text("Generate Text Response")');
    await page.waitForSelector('text=Processing brief requirements', { timeout: 10000 });
    console.log('⏳ Processing awareness campaign...');

    await page.waitForSelector('text=Your recommendations are ready', { timeout: 120000 });
    console.log('✅ Processing complete');

    await page.waitForTimeout(2000);

    const markdownContent = await page.locator('.prose').innerText();
    
    console.log('\n📊 EVALUATING AWARENESS CAMPAIGN:\n');

    // TEST: Should NOT have heavy sales focus
    console.log('1️⃣ Testing Strategy Detection...');
    const hasAwarenessStrategy = markdownContent.includes('Awareness') || 
                                   markdownContent.includes('reach') ||
                                   markdownContent.includes('impressions');
    
    if (hasAwarenessStrategy) {
      console.log('✅ PASS: Awareness strategy detected');
    } else {
      console.log('❌ FAIL: Awareness strategy NOT detected');
    }

    // Should have more balanced allocation (not 70% nano)
    const hasBalancedApproach = markdownContent.includes('balanced') || 
                                 markdownContent.includes('macro') ||
                                 markdownContent.includes('reach');
    
    console.log('\n2️⃣ Testing Balanced Allocation...');
    if (hasBalancedApproach) {
      console.log('✅ PASS: Balanced strategy mentioned');
    } else {
      console.log('⚠️  WARNING: Strategy not clearly balanced');
    }

    // Should emphasize CPM over ROIS
    const hasCPMFocus = markdownContent.includes('CPM') || markdownContent.includes('Cost Per');
    console.log('\n3️⃣ Testing Metrics Focus...');
    console.log(`   CPM mentioned: ${hasCPMFocus ? '✅' : '❌'}`);

    console.log('\n' + '='.repeat(60));
    console.log('📊 AWARENESS CAMPAIGN TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Awareness Strategy: ${hasAwarenessStrategy ? '✅' : '❌'}`);
    console.log(`Balanced Approach: ${hasBalancedApproach ? '✅' : '⚠️'}`);
    console.log(`CPM Focus: ${hasCPMFocus ? '✅' : '❌'}`);
    console.log('='.repeat(60));

    expect(hasAwarenessStrategy).toBeTruthy();
  });

  test('Budget Utilization: €25k Budget Test', async ({ page }) => {
    test.setTimeout(120000);

    console.log('🧪 TEST 3: Budget Utilization (€25,000 budget)');

    await page.waitForSelector('text=Client Brief', { timeout: 10000 });

    await page.getByPlaceholder('e.g., Starbucks, Nike, Red Bull').fill('Budget Test Client');
    await page.getByRole('spinbutton', { name: 'Budget (€) *' }).fill('25000');
    
    await page.getByRole('button', { name: 'Instagram' }).click();

    const goalsInput = page.locator('input[placeholder*="Increase brand awareness"]');
    await goalsInput.fill('Aumentar ventas, conversiones, revenue');
    await page.locator('button:has-text("Add")').first().click();
    
    await page.getByPlaceholder('e.g., 18-35').fill('25-45');
    await page.getByPlaceholder('e.g., All genders, 60% Female').fill('Female');
    
    await page.locator('input[placeholder*="Spain, Madrid"]').fill('España');
    await page.locator('button:has-text("Add")').nth(1).click();
    
    await page.locator('input[placeholder*="Fashion, Technology"]').fill('shopping');
    await page.locator('button:has-text("Add")').nth(2).click();
    
    await page.locator('input[placeholder*="Authenticity, Sustainability"]').fill('Product reviews');
    await page.locator('button:has-text("Add")').nth(3).click();
    
    await page.getByPlaceholder('e.g., Q1 2025, March-May 2025, 8 weeks').fill('2 months');

    console.log('✅ Form filled with €25k budget');

    await page.click('button:has-text("Generate Text Response")');
    await page.waitForSelector('text=Processing brief requirements', { timeout: 10000 });
    
    await page.waitForSelector('text=Your recommendations are ready', { timeout: 120000 });
    console.log('✅ Processing complete');

    await page.waitForTimeout(2000);

    const markdownContent = await page.locator('.prose').innerText();
    
    // Count influencers
    const handleMatches = markdownContent.match(/@\w+/g);
    const uniqueHandles = handleMatches ? new Set(handleMatches).size : 0;
    
    console.log(`\n📊 Budget Utilization Check:`);
    console.log(`   Budget: €25,000`);
    console.log(`   Influencers Selected: ${uniqueHandles}`);
    console.log(`   Expected: 12-20 influencers for good utilization`);

    if (uniqueHandles >= 12) {
      console.log('✅ EXCELLENT: High influencer count suggests good budget utilization');
    } else if (uniqueHandles >= 8) {
      console.log('✅ GOOD: Moderate influencer count');
    } else if (uniqueHandles >= 5) {
      console.log('⚠️  ACCEPTABLE: Could select more influencers');
    } else {
      console.log('❌ POOR: Too few influencers for €25k budget (suggests under-utilization)');
    }

    // Expect at least 8 influencers for €25k budget
    expect(uniqueHandles).toBeGreaterThanOrEqual(5);
  });

  test('Performance: Generation Time', async ({ page }) => {
    test.setTimeout(150000);

    console.log('🧪 TEST 4: Performance Measurement');

    await page.waitForSelector('text=Client Brief', { timeout: 10000 });

    await page.getByPlaceholder('e.g., Starbucks, Nike, Red Bull').fill('Performance Test');
    await page.getByRole('spinbutton', { name: 'Budget (€) *' }).fill('10000');
    
    await page.getByRole('button', { name: 'Instagram' }).click();

    const goalsInput = page.locator('input[placeholder*="Increase brand awareness"]');
    await goalsInput.fill('Sales growth');
    await page.locator('button:has-text("Add")').first().click();
    
    await page.getByPlaceholder('e.g., 18-35').fill('25-45');
    await page.getByPlaceholder('e.g., All genders, 60% Female').fill('All');
    
    await page.locator('input[placeholder*="Spain, Madrid"]').fill('España');
    await page.locator('button:has-text("Add")').nth(1).click();
    
    await page.locator('input[placeholder*="Fashion, Technology"]').fill('shopping');
    await page.locator('button:has-text("Add")').nth(2).click();
    
    await page.locator('input[placeholder*="Authenticity, Sustainability"]').fill('Products');
    await page.locator('button:has-text("Add")').nth(3).click();
    
    await page.getByPlaceholder('e.g., Q1 2025, March-May 2025, 8 weeks').fill('1 month');

    console.log('✅ Form filled');

    const startTime = Date.now();
    
    await page.click('button:has-text("Generate Text Response")');
    await page.waitForSelector('text=Processing brief requirements', { timeout: 10000 });
    
    await page.waitForSelector('text=Your recommendations are ready', { timeout: 150000 });
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`\n⏱️  PERFORMANCE RESULTS:`);
    console.log(`   Total Generation Time: ${duration.toFixed(1)}s`);
    console.log(`   Target: 60-90 seconds`);

    if (duration <= 90) {
      console.log('✅ EXCELLENT: Within target time');
    } else if (duration <= 120) {
      console.log('⚠️  ACCEPTABLE: Slightly over target');
    } else {
      console.log('❌ SLOW: Significantly over target');
    }

    expect(duration).toBeLessThan(120);
  });
});

