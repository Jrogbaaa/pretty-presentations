/**
 * Comprehensive Test Suite for OpenAI Integration
 * Tests all features added/changed in the session
 */

import { parseBriefDocument } from '@/lib/brief-parser-openai.server';
import { matchInfluencersServer } from '@/lib/influencer-matcher.server';
import { generateBrandSuggestions, identifyBrandCategory } from '@/lib/brand-matcher';
import type { ClientBrief } from '@/types';

// Test data
const testBriefs = {
  nike: `Client: Nike
Budget: €25,000
Campaign Goals: Launch new running shoe line, increase brand awareness among fitness enthusiasts, drive online sales
Target Audience: 18-35 years old, all genders, interested in fitness, running, and healthy lifestyle
Platforms: Instagram, TikTok, YouTube
Timeline: March-April 2025
Requirements: Authentic content, focus on performance and innovation, must show actual product usage`,

  starbucks: `Client: Starbucks
Budget: €15,000
Goals: Promote new seasonal menu, drive foot traffic to stores, increase social media engagement
Target: 25-40 years, coffee lovers, urban professionals
Platforms: Instagram, TikTok
Timeline: Q1 2025`,

  complex: `Client: IKEA
Budget: €50,000
This is a multi-phase campaign for our new GREJSIMOJS kitchen line.

Phase 1 (€20,000): Teaser content with 5 macro influencers
Phase 2 (€30,000): Launch event with 10 micro influencers

Target: Homeowners aged 25-45, interested in home decor and DIY
Platforms: Instagram, YouTube, TikTok
Timeline: February-April 2025
Requirements: Must show actual product usage, family-friendly content`,
};

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

/**
 * Test 1: Brief Parsing with OpenAI
 */
async function testBriefParsing() {
  console.log('\n📝 Test 1: Brief Parsing (OpenAI Integration)');
  console.log('═'.repeat(60));

  for (const [name, briefText] of Object.entries(testBriefs)) {
    const start = Date.now();
    try {
      const parsed = await parseBriefDocument(briefText);
      const duration = Date.now() - start;

      const checks = {
        hasClient: !!parsed.clientName,
        hasBudget: parsed.budget > 0,
        hasGoals: parsed.campaignGoals.length > 0,
        hasPlatforms: parsed.platformPreferences.length > 0,
        hasDemographics: !!parsed.targetDemographics,
      };

      const allPassed = Object.values(checks).every(v => v);

      results.push({
        name: `Brief Parsing: ${name}`,
        passed: allPassed,
        duration,
        details: {
          client: parsed.clientName,
          budget: parsed.budget,
          goals: parsed.campaignGoals.length,
          platforms: parsed.platformPreferences.length,
          checks,
        },
      });

      console.log(`\n✓ ${name.toUpperCase()}`);
      console.log(`  Client: ${parsed.clientName}`);
      console.log(`  Budget: €${parsed.budget.toLocaleString()}`);
      console.log(`  Goals: ${parsed.campaignGoals.length}`);
      console.log(`  Platforms: ${parsed.platformPreferences.join(', ')}`);
      console.log(`  Duration: ${duration}ms`);
      console.log(`  Status: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);
    } catch (error) {
      const duration = Date.now() - start;
      results.push({
        name: `Brief Parsing: ${name}`,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error),
      });
      console.log(`\n✗ ${name.toUpperCase()}`);
      console.log(`  Status: ❌ FAILED`);
      console.log(`  Error: ${error}`);
    }
  }
}

/**
 * Test 2: Graceful Degradation (Partial Data Handling)
 */
async function testGracefulDegradation() {
  console.log('\n\n🛡️  Test 2: Graceful Degradation');
  console.log('═'.repeat(60));

  const incompleteBrief = `Client: TestBrand
Budget: €10,000
Goals: Increase awareness
Note: Missing many fields intentionally`;

  const start = Date.now();
  try {
    const parsed = await parseBriefDocument(incompleteBrief);
    const duration = Date.now() - start;

    // Should parse successfully even with minimal data
    const passed = !!parsed.clientName && parsed.budget > 0;

    results.push({
      name: 'Graceful Degradation',
      passed,
      duration,
      details: {
        client: parsed.clientName,
        budget: parsed.budget,
        hasOptionalFields: {
          timeline: !!parsed.timeline,
          demographics: !!parsed.targetDemographics,
          platforms: parsed.platformPreferences.length > 0,
        },
      },
    });

    console.log(`\n✓ Incomplete Brief Handling`);
    console.log(`  Client: ${parsed.clientName}`);
    console.log(`  Budget: €${parsed.budget}`);
    console.log(`  Optional Fields Present: ${Object.values({
      timeline: !!parsed.timeline,
      demographics: !!parsed.targetDemographics,
      platforms: parsed.platformPreferences.length > 0,
    }).filter(Boolean).length}/3`);
    console.log(`  Duration: ${duration}ms`);
    console.log(`  Status: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  } catch (error) {
    const duration = Date.now() - start;
    results.push({
      name: 'Graceful Degradation',
      passed: false,
      duration,
      error: error instanceof Error ? error.message : String(error),
    });
    console.log(`\n✗ Graceful Degradation`);
    console.log(`  Status: ❌ FAILED`);
    console.log(`  Error: ${error}`);
  }
}

/**
 * Test 3: OpenAI Fallback Strategy
 */
async function testOpenAIFallbacks() {
  console.log('\n\n🔄 Test 3: OpenAI Fallback Strategy');
  console.log('═'.repeat(60));

  // Test with invalid API key to trigger fallbacks
  const originalKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = 'invalid_key_for_testing';

  const start = Date.now();
  try {
    // This should use fallback logic
    const result = await identifyBrandCategory('Nike', 'Sports brand');
    const duration = Date.now() - start;

    // Fallback should return default values
    const passed = result.industry === 'Unknown' && result.confidence === 0;

    results.push({
      name: 'OpenAI Fallbacks',
      passed,
      duration,
      details: result,
    });

    console.log(`\n✓ Fallback Behavior`);
    console.log(`  Industry: ${result.industry}`);
    console.log(`  Confidence: ${result.confidence}`);
    console.log(`  Duration: ${duration}ms`);
    console.log(`  Status: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  } catch (error) {
    const duration = Date.now() - start;
    results.push({
      name: 'OpenAI Fallbacks',
      passed: false,
      duration,
      error: error instanceof Error ? error.message : String(error),
    });
    console.log(`\n✗ Fallback Behavior`);
    console.log(`  Status: ❌ FAILED`);
    console.log(`  Error: ${error}`);
  } finally {
    // Restore original key
    process.env.OPENAI_API_KEY = originalKey;
  }
}

/**
 * Test 4: Multi-Phase Campaign Detection
 */
async function testMultiPhaseDetection() {
  console.log('\n\n🔀 Test 4: Multi-Phase Campaign Detection');
  console.log('═'.repeat(60));

  const start = Date.now();
  try {
    const parsed = await parseBriefDocument(testBriefs.complex);
    const duration = Date.now() - start;

    const checks = {
      isMultiPhase: parsed.isMultiPhase === true,
      hasPhases: Array.isArray(parsed.phases) && parsed.phases.length > 0,
      phasesHaveBudget: parsed.phases?.every(p => p.budgetPercentage > 0) ?? false,
    };

    const allPassed = Object.values(checks).every(v => v);

    results.push({
      name: 'Multi-Phase Detection',
      passed: allPassed,
      duration,
      details: {
        isMultiPhase: parsed.isMultiPhase,
        phaseCount: parsed.phases?.length ?? 0,
        phases: parsed.phases?.map(p => ({
          name: p.phaseName,
          budget: p.budgetPercentage,
        })),
        checks,
      },
    });

    console.log(`\n✓ Complex Brief Parsing`);
    console.log(`  Is Multi-Phase: ${parsed.isMultiPhase ? 'Yes' : 'No'}`);
    console.log(`  Phases Detected: ${parsed.phases?.length ?? 0}`);
    if (parsed.phases && parsed.phases.length > 0) {
      parsed.phases.forEach((phase, i) => {
        console.log(`    Phase ${i + 1}: ${phase.phaseName} (${phase.budgetPercentage}% of budget)`);
      });
    }
    console.log(`  Duration: ${duration}ms`);
    console.log(`  Status: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);
  } catch (error) {
    const duration = Date.now() - start;
    results.push({
      name: 'Multi-Phase Detection',
      passed: false,
      duration,
      error: error instanceof Error ? error.message : String(error),
    });
    console.log(`\n✗ Multi-Phase Detection`);
    console.log(`  Status: ❌ FAILED`);
    console.log(`  Error: ${error}`);
  }
}

/**
 * Generate Summary Report
 */
function generateSummary() {
  console.log('\n\n' + '═'.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(60));

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / total;

  console.log(`\nTotal Tests: ${total}`);
  console.log(`✅ Passed: ${passed} (${((passed / total) * 100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${failed} (${((failed / total) * 100).toFixed(1)}%)`);
  console.log(`⏱️  Average Duration: ${avgDuration.toFixed(0)}ms`);

  if (failed > 0) {
    console.log(`\n❌ Failed Tests:`);
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}`);
      if (r.error) {
        console.log(`    Error: ${r.error}`);
      }
    });
  }

  console.log('\n' + '═'.repeat(60));
  console.log(passed === total ? '🎉 ALL TESTS PASSED!' : '⚠️  SOME TESTS FAILED');
  console.log('═'.repeat(60) + '\n');

  return { total, passed, failed, success: passed === total };
}

/**
 * Main Test Runner
 */
async function runTests() {
  console.log('\n🚀 Starting OpenAI Integration Test Suite');
  console.log('═'.repeat(60));
  console.log('Testing all features added/changed in this session:');
  console.log('  ✓ Brief parsing with OpenAI');
  console.log('  ✓ Graceful degradation');
  console.log('  ✓ OpenAI fallback strategy');
  console.log('  ✓ Multi-phase campaign detection');
  console.log('═'.repeat(60));

  try {
    await testBriefParsing();
    await testGracefulDegradation();
    await testOpenAIFallbacks();
    await testMultiPhaseDetection();

    const summary = generateSummary();
    process.exit(summary.success ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Fatal test error:', error);
    process.exit(1);
  }
}

// Run tests
runTests().catch(console.error);

