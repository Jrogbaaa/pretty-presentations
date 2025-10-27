/**
 * Environment variable validation
 * Ensures all required environment variables are set before the app starts
 */

interface EnvValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Required environment variables for the application
 */
const REQUIRED_ENV_VARS = {
  // OpenAI (for text processing)
  openai: ['OPENAI_API_KEY'],
  
  // Firebase (for Vertex AI, Firestore, etc.)
  firebase: [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ],
  
  // Vertex AI
  vertexAI: [
    'NEXT_PUBLIC_VERTEX_AI_LOCATION',
    'NEXT_PUBLIC_VERTEX_AI_MODEL'
  ]
} as const;

/**
 * Optional environment variables (will show warnings if missing)
 */
const OPTIONAL_ENV_VARS = {
  firebase: [
    'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
    'NEXT_PUBLIC_FIREBASE_DATABASE_URL'
  ],
  
  vertexAI: [
    'NEXT_PUBLIC_VERTEX_AI_IMAGE_MODEL',
    'NEXT_PUBLIC_ENABLE_IMAGE_GENERATION'
  ],
  
  firebaseAdmin: [
    'FIREBASE_ADMIN_PROJECT_ID',
    'FIREBASE_ADMIN_CLIENT_EMAIL',
    'FIREBASE_ADMIN_PRIVATE_KEY'
  ]
} as const;

/**
 * Get environment variable value
 */
const getEnvVar = (key: string): string | undefined => {
  return process.env[key];
};

/**
 * Check if an environment variable is set
 */
const isEnvVarSet = (key: string): boolean => {
  const value = getEnvVar(key);
  return value !== undefined && value !== '';
};

/**
 * Validate a specific group of environment variables
 */
const validateGroup = (
  groupName: string,
  variables: readonly string[]
): { missing: string[]; valid: string[] } => {
  const missing: string[] = [];
  const valid: string[] = [];
  
  for (const varName of variables) {
    if (isEnvVarSet(varName)) {
      valid.push(varName);
    } else {
      missing.push(varName);
    }
  }
  
  return { missing, valid };
};

/**
 * Validate all required environment variables
 */
export const validateEnv = (): EnvValidationResult => {
  const allMissing: string[] = [];
  const allWarnings: string[] = [];
  
  // Validate required variables
  for (const [groupName, variables] of Object.entries(REQUIRED_ENV_VARS)) {
    const { missing } = validateGroup(groupName, variables);
    
    if (missing.length > 0) {
      allMissing.push(...missing);
      console.error(`❌ Missing required ${groupName} environment variables:`, missing);
    }
  }
  
  // Check optional variables (warnings only)
  for (const [groupName, variables] of Object.entries(OPTIONAL_ENV_VARS)) {
    const { missing } = validateGroup(groupName, variables);
    
    if (missing.length > 0) {
      allWarnings.push(...missing);
      console.warn(`⚠️  Missing optional ${groupName} environment variables:`, missing);
    }
  }
  
  const isValid = allMissing.length === 0;
  
  if (isValid) {
    console.log('✅ All required environment variables are set');
  } else {
    console.error('❌ Environment validation failed');
  }
  
  return {
    isValid,
    missing: allMissing,
    warnings: allWarnings
  };
};

/**
 * Validate environment and throw error if invalid
 */
export const validateEnvOrThrow = (): void => {
  const result = validateEnv();
  
  if (!result.isValid) {
    const missingVars = result.missing.join(', ');
    throw new Error(
      `Missing required environment variables: ${missingVars}\n\n` +
      'Please check your .env.local file and ensure all required variables are set.\n' +
      'See env.example for reference.'
    );
  }
};

/**
 * Get environment configuration status
 */
export const getEnvStatus = () => {
  const openaiStatus = validateGroup('openai', REQUIRED_ENV_VARS.openai);
  const firebaseStatus = validateGroup('firebase', REQUIRED_ENV_VARS.firebase);
  const vertexAIStatus = validateGroup('vertexAI', REQUIRED_ENV_VARS.vertexAI);
  
  return {
    openai: {
      configured: openaiStatus.missing.length === 0,
      missing: openaiStatus.missing
    },
    firebase: {
      configured: firebaseStatus.missing.length === 0,
      missing: firebaseStatus.missing
    },
    vertexAI: {
      configured: vertexAIStatus.missing.length === 0,
      missing: vertexAIStatus.missing
    },
    allConfigured: 
      openaiStatus.missing.length === 0 &&
      firebaseStatus.missing.length === 0 &&
      vertexAIStatus.missing.length === 0
  };
};

/**
 * Print environment status to console
 */
export const printEnvStatus = (): void => {
  console.log('\n📋 Environment Configuration Status\n');
  
  const status = getEnvStatus();
  
  console.log(`OpenAI: ${status.openai.configured ? '✅' : '❌'}`);
  if (!status.openai.configured) {
    console.log(`  Missing: ${status.openai.missing.join(', ')}`);
  }
  
  console.log(`Firebase: ${status.firebase.configured ? '✅' : '❌'}`);
  if (!status.firebase.configured) {
    console.log(`  Missing: ${status.firebase.missing.join(', ')}`);
  }
  
  console.log(`Vertex AI: ${status.vertexAI.configured ? '✅' : '❌'}`);
  if (!status.vertexAI.configured) {
    console.log(`  Missing: ${status.vertexAI.missing.join(', ')}`);
  }
  
  console.log('');
  
  if (status.allConfigured) {
    console.log('✅ All services configured correctly\n');
  } else {
    console.log('❌ Some services are not configured. Check .env.local file\n');
  }
};

/**
 * Validate specific service environment variables
 */
export const validateServiceEnv = (
  service: 'openai' | 'firebase' | 'vertexAI'
): boolean => {
  const variables = REQUIRED_ENV_VARS[service];
  const { missing } = validateGroup(service, variables);
  return missing.length === 0;
};

/**
 * Get helpful error message for missing environment variables
 */
export const getEnvSetupInstructions = (missingVars: string[]): string => {
  const instructions: string[] = [
    '🔧 Environment Setup Instructions\n',
    '1. Copy env.example to .env.local:',
    '   cp env.example .env.local\n',
    '2. Set the following missing variables:\n'
  ];
  
  missingVars.forEach(varName => {
    if (varName === 'OPENAI_API_KEY') {
      instructions.push(`   ${varName}=<your-key>`);
      instructions.push('   Get one at: https://platform.openai.com/api-keys\n');
    } else if (varName.startsWith('NEXT_PUBLIC_FIREBASE_')) {
      instructions.push(`   ${varName}=<your-value>`);
      instructions.push('   Get from: Firebase Console > Project Settings\n');
    } else if (varName.startsWith('NEXT_PUBLIC_VERTEX_')) {
      instructions.push(`   ${varName}=<your-value>`);
      if (varName === 'NEXT_PUBLIC_VERTEX_AI_LOCATION') {
        instructions.push('   Recommended: us-central1\n');
      } else if (varName === 'NEXT_PUBLIC_VERTEX_AI_MODEL') {
        instructions.push('   Recommended: gemini-1.5-flash\n');
      }
    } else {
      instructions.push(`   ${varName}=<your-value>\n`);
    }
  });
  
  instructions.push('\n3. Restart your development server\n');
  
  return instructions.join('\n');
};

/**
 * Check if running in production
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Check if running in development
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Check if running in test environment
 */
export const isTest = (): boolean => {
  return process.env.NODE_ENV === 'test';
};

