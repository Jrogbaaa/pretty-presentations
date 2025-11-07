/**
 * Automated Evaluation Script for Complex Brief Parsing
 * 
 * Tests the end-to-end system against 5 real client briefs
 */

import { parseBriefDocument } from '../lib/brief-parser-openai.server';
import * as fs from 'fs';
import * as path from 'path';

interface EvalResult {
  test: string;
  passed: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  extractedData: any;
  duration: number;
}

interface TestCase {
  briefFile: string;
  description: string;
  expectedFields: Record<string, any>;
  constraints?: string[];
}

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => {
    if (current === null || current === undefined) return undefined;
    return current[key];
  }, obj);
};

const compareValues = (actual: any, expected: any, tolerance = 0.1): boolean => {
  // Handle null/undefined
  if (expected === null || expected === undefined) {
    return actual === expected;
  }

  // Handle numbers with tolerance
  if (typeof expected === 'number' && typeof actual === 'number') {
    return Math.abs(actual - expected) <= tolerance;
  }

  // Handle objects (deep comparison)
  if (typeof expected === 'object' && !Array.isArray(expected)) {
    if (typeof actual !== 'object' || actual === null) return false;
    return Object.keys(expected).every(key =>
      compareValues(actual[key], expected[key], tolerance)
    );
  }

  // Handle arrays
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) return false;
    // For arrays, just check length and basic structure
    return actual.length === expected.length;
  }

  // Handle strings (case-insensitive partial match)
  if (typeof expected === 'string' && typeof actual === 'string') {
    return actual.toLowerCase().includes(expected.toLowerCase());
  }

  // Default: strict equality
  return actual === expected;
};

const runEval = async (
  testCase: TestCase
): Promise<EvalResult> => {
  const startTime = Date.now();
  const result: EvalResult = {
    test: testCase.briefFile,
    passed: false,
    score: 0,
    errors: [],
    warnings: [],
    extractedData: null,
    duration: 0,
  };

  try {
    // Read brief
    const briefPath = path.join(process.cwd(), 'examples', testCase.briefFile);
    const content = fs.readFileSync(briefPath, 'utf-8');
    
    // Extract the original email/brief content (between ## Original Email and next ##)
    const emailMatch = content.match(/## Original Email[^\\n]*\\n\\n([\\s\\S]+?)(?=\\n##|$)/);
    const briefText = emailMatch ? emailMatch[1].trim() : content;

    console.log(`   📄 Brief length: ${briefText.length} characters`);

    // Parse
    console.log(`   🤖 Parsing with OpenAI...`);
    const parsed = await parseBriefDocument(briefText);
    result.extractedData = parsed;

    console.log(`   ✅ Parsed successfully`);

    // Check expected fields
    let correctFields = 0;
    let totalFields = 0;

    for (const [field, expectedValue] of Object.entries(testCase.expectedFields)) {
      totalFields++;
      const actualValue = getNestedValue(parsed, field);

      if (compareValues(actualValue, expectedValue)) {
        correctFields++;
        console.log(`   ✓ ${field}: ${JSON.stringify(actualValue)}`);
      } else {
        const error = `Field "${field}": expected ${JSON.stringify(expectedValue)}, got ${JSON.stringify(actualValue)}`;
        result.errors.push(error);
        console.log(`   ✗ ${error}`);
      }
    }

    // Calculate score
    result.score = (correctFields / totalFields) * 100;
    result.passed = result.score >= 90;

    // Check for warnings (fields that exist but might be unexpected)
    if (parsed.geographicDistribution && !testCase.expectedFields['geographicDistribution.requireDistribution']) {
      result.warnings.push('Geographic distribution extracted but not expected in this brief');
    }
    if (parsed.isMultiPhase && !testCase.expectedFields.isMultiPhase) {
      result.warnings.push('Multi-phase structure extracted but not expected in this brief');
    }

  } catch (error) {
    result.errors.push(`FATAL: ${error instanceof Error ? error.message : String(error)}`);
    console.log(`   ❌ Fatal error: ${error instanceof Error ? error.message : String(error)}`);
  }

  result.duration = Date.now() - startTime;
  return result;
};

const main = async () => {
  console.log('\\n' + '='.repeat(80));
  console.log('🧪 COMPLEX BRIEF PARSING EVALUATION SUITE');
  console.log('='.repeat(80) + '\\n');

  const tests: TestCase[] = [
    {
      briefFile: 'brief-puerto-de-indias.md',
      description: 'CPM Constraint + Follow-Up Campaign (Wave 2)',
      expectedFields: {
        clientName: 'Puerto de Indias',
        budget: 111800,
        'constraints.maxCPM': 20,
        'campaignHistory.isFollowUp': true,
        'campaignHistory.wave': 2,
      },
      constraints: ['Max CPM €20', 'Include manual influencers: Rocío Osorno, María Segarra'],
    },
    {
      briefFile: 'brief-ikea-grejsimojs.md',
      description: 'Multi-Phase (3 phases) + Multi-Budget (2 scenarios)',
      expectedFields: {
        clientName: 'IKEA',
        budget: 30000,
        isMultiPhase: true,
        'phases.length': 3,
        'budgetScenarios.length': 2,
      },
      constraints: ['Phase 1: 20% budget (€6k)', 'Phase 2: 40% budget (€12k)', 'Phase 3: 40% budget (€12k)'],
    },
    {
      briefFile: 'brief-square.md',
      description: 'Geographic Distribution + B2B + Public Speaking',
      expectedFields: {
        clientName: 'Square',
        budget: 28000,
        targetAudienceType: 'B2B',
        'geographicDistribution.requireDistribution': true,
        'geographicDistribution.cities.length': 4,
      },
      constraints: ['Must cover: Madrid, Barcelona, Sevilla, Valencia', 'Require public speaking'],
    },
    {
      briefFile: 'brief-pyd-halloween.md',
      description: 'Event-Based + Dual Deliverables',
      expectedFields: {
        budget: 0,
        'constraints.requireEventAttendance': true,
        'deliverables.length': 2,
      },
      constraints: ['Event attendance required', 'Include @dyanbay'],
    },
    {
      briefFile: 'brief-imagin.md',
      description: 'Mid-Process + Celebrity Partnership',
      expectedFields: {
        clientName: 'Imagin',
        budget: 0,
      },
      constraints: ['Marc Márquez collaboration', 'Manual influencers: Carlos Maldonado, Jordi Cruz, Ale Vicio'],
    },
  ];

  const results: EvalResult[] = [];

  for (let i = 0; i < tests.length; i++) {
    const testCase = tests[i];
    console.log(`\\n${'-'.repeat(80)}`);
    console.log(`📋 TEST ${i + 1}/${tests.length}: ${testCase.description}`);
    console.log(`   File: ${testCase.briefFile}`);
    console.log(`${'-'.repeat(80)}`);
    
    const result = await runEval(testCase);
    results.push(result);

    console.log(`\\n   ⏱️  Duration: ${(result.duration / 1000).toFixed(2)}s`);
    console.log(`   📊 Score: ${result.score.toFixed(1)}% (${result.errors.length} errors)`);
    console.log(`   ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (result.warnings.length > 0) {
      console.log(`\\n   ⚠️  Warnings:`);
      result.warnings.forEach(w => console.log(`      - ${w}`));
    }

    // Small delay to avoid rate limiting
    if (i < tests.length - 1) {
      console.log(`\\n   ⏳ Waiting 2s before next test...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log('\\n' + '='.repeat(80));
  console.log('📊 EVALUATION SUMMARY');
  console.log('='.repeat(80) + '\\n');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / total;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0) / 1000;
  
  console.log(`Tests Passed:   ${passed}/${total} (${((passed/total)*100).toFixed(1)}%)`);
  console.log(`Average Score:  ${avgScore.toFixed(1)}%`);
  console.log(`Total Duration: ${totalDuration.toFixed(2)}s`);
  console.log(`Avg Per Test:   ${(totalDuration/total).toFixed(2)}s`);

  // Detailed results
  console.log(`\\n${'―'.repeat(80)}`);
  console.log('DETAILED RESULTS\\n');
  results.forEach((r, i) => {
    const status = r.passed ? '✅' : '❌';
    console.log(`${status} Test ${i + 1}: ${r.test} (${r.score.toFixed(1)}%)`);
    if (r.errors.length > 0 && r.errors.length <= 3) {
      r.errors.forEach(e => console.log(`     → ${e}`));
    } else if (r.errors.length > 3) {
      console.log(`     → ${r.errors.length} errors (see above for details)`);
    }
  });

  console.log(`\\n${'='.repeat(80)}`);
  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! System is ready for production.');
  } else {
    console.log(`⚠️  ${total - passed} TEST(S) FAILED. Please review errors above.`);
  }
  console.log('='.repeat(80) + '\\n');

  // Write results to file
  const resultsPath = path.join(process.cwd(), 'eval-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { passed, total, avgScore, totalDuration },
    results,
  }, null, 2));
  console.log(`📁 Results saved to: eval-results.json\\n`);
};

main().catch(error => {
  console.error('\\n❌ FATAL ERROR:', error);
  process.exit(1);
});

