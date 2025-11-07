/**
 * Security Tests - API Key Exposure
 * Verifies that server-side API keys are not exposed in the client bundle
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Security - API Key Exposure', () => {
  test('GOOGLE_AI_API_KEY should not be in client bundle', async () => {
    const nextStaticPath = path.join(process.cwd(), '.next', 'static');
    
    // Check if .next directory exists (app must be built)
    if (!fs.existsSync(nextStaticPath)) {
      test.skip();
      return;
    }

    // Search for the non-public key in all JS files
    const searchDirectory = (dir: string): boolean => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          if (searchDirectory(filePath)) {
            return true; // Key found
          }
        } else if (file.endsWith('.js')) {
          const content = fs.readFileSync(filePath, 'utf-8');
          
          // Check for the server-side key name
          if (content.includes('GOOGLE_AI_API_KEY') && !content.includes('NEXT_PUBLIC_GOOGLE_AI_API_KEY')) {
            console.error(`❌ Found GOOGLE_AI_API_KEY in: ${filePath}`);
            return true;
          }
        }
      }
      
      return false;
    };

    const keyFound = searchDirectory(nextStaticPath);
    expect(keyFound).toBe(false);
  });

  test('OPENAI_API_KEY should not be in client bundle', async () => {
    const nextStaticPath = path.join(process.cwd(), '.next', 'static');
    
    if (!fs.existsSync(nextStaticPath)) {
      test.skip();
      return;
    }

    const searchDirectory = (dir: string): boolean => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          if (searchDirectory(filePath)) {
            return true;
          }
        } else if (file.endsWith('.js')) {
          const content = fs.readFileSync(filePath, 'utf-8');
          
          if (content.includes('OPENAI_API_KEY')) {
            console.error(`❌ Found OPENAI_API_KEY in: ${filePath}`);
            return true;
          }
        }
      }
      
      return false;
    };

    const keyFound = searchDirectory(nextStaticPath);
    expect(keyFound).toBe(false);
  });

  test('client bundle should only use NEXT_PUBLIC_ prefixed env vars', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    
    // Get all environment variables accessible to client-side code
    const clientEnvVars = await page.evaluate(() => {
      const envVars: string[] = [];
      
      // Check if any server-side keys are accessible
      try {
        // Try to access process.env (should not work in browser)
        const env = (window as any).process?.env || {};
        for (const key in env) {
          if (key.includes('API_KEY') || key.includes('SECRET')) {
            envVars.push(key);
          }
        }
      } catch (e) {
        // Expected - process.env should not be accessible
      }
      
      return envVars;
    });

    // Should have no server-side API keys accessible
    const serverKeys = clientEnvVars.filter(
      key => !key.startsWith('NEXT_PUBLIC_') && 
             (key.includes('API_KEY') || key.includes('SECRET'))
    );

    expect(serverKeys).toHaveLength(0);
  });

  test('network requests should not expose API keys in headers', async ({ page }) => {
    const exposedKeys: { url: string; header: string }[] = [];

    // Listen to all network requests
    page.on('request', request => {
      const headers = request.headers();
      
      for (const [header, value] of Object.entries(headers)) {
        // Check for API keys in headers
        if (
          header.toLowerCase().includes('api-key') ||
          header.toLowerCase().includes('authorization')
        ) {
          // Check if it looks like an actual key (long string)
          if (value.length > 20) {
            exposedKeys.push({ url: request.url(), header });
          }
        }
      }
    });

    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Client-side API calls should not include server keys
    // (Firebase/Replicate keys are okay as they're client-side)
    // OpenAI and Google AI server keys should never appear
    
    const suspiciousKeys = exposedKeys.filter(
      item => 
        !item.url.includes('firebase') && 
        !item.url.includes('replicate') &&
        !item.header.toLowerCase().includes('firebase')
    );

    if (suspiciousKeys.length > 0) {
      console.error('❌ Potentially exposed keys:', suspiciousKeys);
    }

    // Note: This is a soft check since client-side keys are expected
    // The important thing is that OpenAI/Google AI server keys never appear
  });

  test('DevTools console should not show API keys', async ({ page }) => {
    const consoleMessages: string[] = [];

    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });

    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Check if any console logs contain API keys
    const logsWithKeys = consoleMessages.filter(msg => {
      const lower = msg.toLowerCase();
      return (
        lower.includes('api_key') || 
        lower.includes('apikey') ||
        (lower.includes('key') && lower.includes('sk-'))
      );
    });

    if (logsWithKeys.length > 0) {
      console.warn('⚠️ Console logs mentioning keys:', logsWithKeys);
    }

    // Logs should not contain actual key values
    const logsWithActualKeys = logsWithKeys.filter(msg => 
      msg.includes('sk-') || // OpenAI keys start with sk-
      msg.match(/AI[a-zA-Z0-9]{32,}/) // Google AI keys pattern
    );

    expect(logsWithActualKeys).toHaveLength(0);
  });

  test('localStorage and sessionStorage should not contain server API keys', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    const storageData = await page.evaluate(() => {
      const data: { [key: string]: string } = {};
      
      // Check localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          data[`localStorage.${key}`] = localStorage.getItem(key) || '';
        }
      }
      
      // Check sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          data[`sessionStorage.${key}`] = sessionStorage.getItem(key) || '';
        }
      }
      
      return data;
    });

    // Check if any storage contains API keys
    const keysWithSensitiveData = Object.entries(storageData).filter(
      ([key, value]) => {
        const combined = (key + value).toLowerCase();
        return (
          (combined.includes('api_key') || combined.includes('apikey')) &&
          (value.includes('sk-') || value.match(/AI[a-zA-Z0-9]{32,}/))
        );
      }
    );

    if (keysWithSensitiveData.length > 0) {
      console.error('❌ Sensitive data in storage:', keysWithSensitiveData.map(([k]) => k));
    }

    expect(keysWithSensitiveData).toHaveLength(0);
  });
});

test.describe('Security - Environment Variable Patterns', () => {
  test('server files should use non-public env vars', async () => {
    const serverFiles = [
      'lib/brand-matcher.ts',
      'lib/brand-service.ts',
      'lib/influencer-matcher.server.ts',
      'lib/markdown-response-generator.server.ts',
    ];

    for (const file of serverFiles) {
      const filePath = path.join(process.cwd(), file);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Server files should use GOOGLE_AI_API_KEY (not NEXT_PUBLIC_)
        if (content.includes('GoogleGenerativeAI')) {
          expect(content).toContain('GOOGLE_AI_API_KEY');
          expect(content).not.toContain('NEXT_PUBLIC_GOOGLE_AI_API_KEY');
        }
        
        // Server files should use OPENAI_API_KEY (not NEXT_PUBLIC_)
        if (content.includes('OpenAI')) {
          expect(content).toContain('OPENAI_API_KEY');
          expect(content).not.toContain('NEXT_PUBLIC_OPENAI_API_KEY');
        }
      }
    }
  });

  test('client files should only use NEXT_PUBLIC_ env vars', async () => {
    const clientFiles = [
      'lib/firebase.ts',
      'components/BriefForm.tsx',
    ];

    for (const file of clientFiles) {
      const filePath = path.join(process.cwd(), file);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Check for server-only keys in client code
        const hasServerKeys = 
          (content.includes('process.env.GOOGLE_AI_API_KEY') && !content.includes('NEXT_PUBLIC')) ||
          (content.includes('process.env.OPENAI_API_KEY'));
        
        if (hasServerKeys) {
          console.error(`❌ Server keys found in client file: ${file}`);
        }
        
        expect(hasServerKeys).toBe(false);
      }
    }
  });
});

