#!/bin/bash

# Generate Vercel Environment Variable Values
# This script extracts all Firebase Admin values in the correct format for Vercel

set -e

echo "=================================================="
echo "🔑 Vercel Environment Variable Values Generator"
echo "=================================================="
echo ""

cd "$(dirname "$0")/.."

if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local file not found"
  exit 1
fi

echo "✅ Found .env.local"
echo ""
echo "=================================================="
echo "📋 COPY THESE VALUES TO VERCEL"
echo "=================================================="
echo ""

# Extract each value
echo "1️⃣  FIREBASE_ADMIN_PROJECT_ID"
echo "─────────────────────────────────────"
PROJECT_ID=$(grep "^FIREBASE_ADMIN_PROJECT_ID=" .env.local | sed 's/FIREBASE_ADMIN_PROJECT_ID=//')
echo "$PROJECT_ID"
echo ""

echo "2️⃣  FIREBASE_ADMIN_CLIENT_EMAIL"
echo "─────────────────────────────────────"
CLIENT_EMAIL=$(grep "^FIREBASE_ADMIN_CLIENT_EMAIL=" .env.local | sed 's/FIREBASE_ADMIN_CLIENT_EMAIL=//')
echo "$CLIENT_EMAIL"
echo ""

echo "3️⃣  FIREBASE_ADMIN_PRIVATE_KEY (Standard Format)"
echo "─────────────────────────────────────"
echo "⚠️  This format often fails in Vercel UI. Try Method A first, then Method B if it fails."
echo ""
PRIVATE_KEY=$(grep "^FIREBASE_ADMIN_PRIVATE_KEY=" .env.local | sed 's/FIREBASE_ADMIN_PRIVATE_KEY=//')
echo "$PRIVATE_KEY"
echo ""

echo "4️⃣  FIREBASE_ADMIN_PRIVATE_KEY_BASE64 (Alternative Format - RECOMMENDED)"
echo "─────────────────────────────────────"
echo "✅ This format is 100% reliable and avoids all formatting issues."
echo "Use this if the standard format keeps failing."
echo ""
BASE64_KEY=$(echo "$PRIVATE_KEY" | sed 's/^"//' | sed 's/"$//' | base64 | tr -d '\n')
echo "$BASE64_KEY"
echo ""

echo "=================================================="
echo "📝 INSTRUCTIONS FOR VERCEL"
echo "=================================================="
echo ""
echo "METHOD A: Standard Format (Try this first)"
echo "───────────────────────────────────────────────"
echo "1. Go to: https://vercel.com/[username]/pretty-presentations/settings/environment-variables"
echo "2. Find or add: FIREBASE_ADMIN_PRIVATE_KEY"
echo "3. Copy the value from section 3️⃣  above"
echo "4. Paste it EXACTLY as shown (including quotes)"
echo "5. Select: Production, Preview, Development"
echo "6. Save and redeploy"
echo ""
echo "METHOD B: Base64 Format (Use if Method A fails)"
echo "───────────────────────────────────────────────"
echo "1. Go to: https://vercel.com/[username]/pretty-presentations/settings/environment-variables"
echo "2. Add NEW variable: FIREBASE_ADMIN_PRIVATE_KEY_BASE64"
echo "3. Copy the value from section 4️⃣  above"
echo "4. Paste it (NO quotes needed for base64)"
echo "5. Select: Production, Preview, Development"
echo "6. Rename lib/firebase-admin-base64.ts to lib/firebase-admin.ts (backup old one)"
echo "7. Save and redeploy"
echo ""

echo "=================================================="
echo "🧪 TESTING"
echo "=================================================="
echo ""
echo "After updating Vercel:"
echo "1. Wait for deployment to finish"
echo "2. Visit: https://your-app.vercel.app/api/debug-firebase"
echo "3. Check the diagnostic output"
echo "4. Look for 'overallStatus': 'PASS'"
echo ""
echo "If status is FAIL, read the recommendations in the output"
echo ""

echo "=================================================="
echo "✅ COMPLETE ENVIRONMENT VARIABLE LIST"
echo "=================================================="
echo ""
echo "Make sure ALL of these are set in Vercel:"
echo ""

# Extract all env vars
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  if [[ "$key" =~ ^#.*$ ]] || [[ -z "$key" ]]; then
    continue
  fi
  # Show key with check box
  echo "[ ] $key"
done < <(grep -v '^#' .env.local | grep -v '^$')

echo ""
echo "=================================================="
echo "Done! Copy the values above to Vercel."
echo "=================================================="

