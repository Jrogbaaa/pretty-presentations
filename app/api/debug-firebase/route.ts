import { NextResponse } from 'next/server';

/**
 * Diagnostic route to test Firebase Admin connection
 * Visit: https://your-vercel-app.vercel.app/api/debug-firebase
 * 
 * This will show you EXACTLY what's wrong with the Firebase Admin setup
 */
export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'local',
    tests: {},
  };

  try {
    // Test 1: Check environment variables exist
    diagnostics.tests.envVarsExist = {
      FIREBASE_ADMIN_PROJECT_ID: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
      FIREBASE_ADMIN_CLIENT_EMAIL: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      FIREBASE_ADMIN_PRIVATE_KEY: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
      FIREBASE_ADMIN_PRIVATE_KEY_BASE64: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    };

    // Test 2: Check private key format
    if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
      diagnostics.tests.privateKeyFormat = {
        length: key.length,
        startsWithQuote: key.startsWith('"'),
        endsWithQuote: key.endsWith('"'),
        startsWithBegin: key.includes('-----BEGIN PRIVATE KEY-----'),
        endsWithEnd: key.includes('-----END PRIVATE KEY-----'),
        hasEscapedNewlines: key.includes('\\n'),
        hasActualNewlines: key.includes('\n') && !key.includes('\\n'),
        firstChars: key.substring(0, 50),
        lastChars: key.substring(key.length - 50),
      };
    } else {
      diagnostics.tests.privateKeyFormat = 'PRIVATE_KEY_MISSING';
    }

    // Test 3: Check env var values (sanitized)
    diagnostics.tests.envVarValues = {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || 'MISSING',
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL
        ? process.env.FIREBASE_ADMIN_CLIENT_EMAIL.substring(0, 20) + '...'
        : 'MISSING',
    };

    // Test 4: Try to initialize Firebase Admin
    try {
      const { adminDb } = await import('@/lib/firebase-admin');
      diagnostics.tests.firebaseAdminInit = {
        success: true,
        message: 'Firebase Admin initialized successfully',
      };

      // Test 5: Try to connect to Firestore
      try {
        const testQuery = await adminDb.collection('influencers').limit(1).get();
        diagnostics.tests.firestoreConnection = {
          success: true,
          documentsFound: testQuery.size,
          message: `Successfully fetched ${testQuery.size} document(s)`,
        };
      } catch (firestoreError) {
        diagnostics.tests.firestoreConnection = {
          success: false,
          error: firestoreError instanceof Error ? firestoreError.message : 'Unknown error',
          stack: firestoreError instanceof Error ? firestoreError.stack : undefined,
        };
      }
    } catch (initError) {
      diagnostics.tests.firebaseAdminInit = {
        success: false,
        error: initError instanceof Error ? initError.message : 'Unknown error',
        stack: initError instanceof Error ? initError.stack : undefined,
      };
    }

    // Overall status
    const allTestsPassed = 
      diagnostics.tests.envVarsExist.FIREBASE_ADMIN_PROJECT_ID &&
      diagnostics.tests.envVarsExist.FIREBASE_ADMIN_CLIENT_EMAIL &&
      (diagnostics.tests.envVarsExist.FIREBASE_ADMIN_PRIVATE_KEY || 
       diagnostics.tests.envVarsExist.FIREBASE_ADMIN_PRIVATE_KEY_BASE64) &&
      diagnostics.tests.firebaseAdminInit?.success &&
      diagnostics.tests.firestoreConnection?.success;

    diagnostics.overallStatus = allTestsPassed ? 'PASS' : 'FAIL';

    // Recommendations
    diagnostics.recommendations = [];
    
    if (!diagnostics.tests.envVarsExist.FIREBASE_ADMIN_PRIVATE_KEY && 
        !diagnostics.tests.envVarsExist.FIREBASE_ADMIN_PRIVATE_KEY_BASE64) {
      diagnostics.recommendations.push(
        'CRITICAL: FIREBASE_ADMIN_PRIVATE_KEY is missing. Add it to Vercel environment variables.'
      );
    }
    
    if (diagnostics.tests.privateKeyFormat?.hasActualNewlines && 
        !diagnostics.tests.privateKeyFormat?.hasEscapedNewlines) {
      diagnostics.recommendations.push(
        'CRITICAL: Private key has actual newlines instead of escaped \\n characters. This causes the DECODER error. Use the base64 method to fix this.'
      );
    }
    
    if (!diagnostics.tests.firebaseAdminInit?.success) {
      diagnostics.recommendations.push(
        'Firebase Admin failed to initialize. Check the error message above for details.'
      );
    }
    
    if (diagnostics.tests.firebaseAdminInit?.success && 
        !diagnostics.tests.firestoreConnection?.success) {
      diagnostics.recommendations.push(
        'Firebase Admin initialized but Firestore connection failed. Check Firestore security rules and service account permissions.'
      );
    }

    if (diagnostics.recommendations.length === 0) {
      diagnostics.recommendations.push('All tests passed! Firebase Admin is working correctly.');
    }

    return NextResponse.json(diagnostics, { 
      status: allTestsPassed ? 200 : 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    return NextResponse.json({
      overallStatus: 'CRITICAL_FAILURE',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      diagnostics,
    }, { status: 500 });
  }
}

