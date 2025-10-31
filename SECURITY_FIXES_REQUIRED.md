# 🔴 CRITICAL SECURITY FIXES REQUIRED

**Date:** October 31, 2025  
**Priority:** URGENT - Fix before production deployment

---

## 🔴 Issue 1: API Key Exposure (CRITICAL)

### Problem
Server-side code is using `NEXT_PUBLIC_GOOGLE_AI_API_KEY`, which exposes the API key to all website visitors through the client-side JavaScript bundle.

### Files Affected
```
lib/brand-matcher.ts (line 7)
lib/brand-service.ts (line 7)
lib/influencer-matcher.server.ts (line 12)
```

### Fix Required

**Step 1:** Add non-public environment variable
```bash
# Add to .env.local (NO NEXT_PUBLIC_ prefix)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

**Step 2:** Update server-side files

```typescript
// ❌ BEFORE (lib/brand-matcher.ts line 7)
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || '');

// ✅ AFTER
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
```

**Step 3:** Apply same fix to these files:
- `lib/brand-service.ts`
- `lib/influencer-matcher.server.ts`

**Step 4:** Keep `NEXT_PUBLIC_GOOGLE_AI_API_KEY` ONLY for client-side Firebase usage in:
- `lib/firebase.ts` (client SDK - this is okay)

---

## 🔴 Issue 2: Missing Rate Limiting (CRITICAL)

### Problem
The text response API (`/api/generate-text-response`) has no rate limiting. An attacker could spam expensive GPT-4o calls ($0.10-0.50 per request).

### Fix Required

Add rate limiting to `app/api/generate-text-response/route.ts`:

```typescript
import { RateLimiter, getClientIdentifier } from '@/lib/rate-limiter';

// Add at top of file
const textResponseLimiter = new RateLimiter({
  windowMs: 60000,  // 1 minute
  maxRequests: 5    // 5 requests per minute (expensive operation)
});

export async function POST(request: NextRequest) {
  // Add rate limit check BEFORE processing
  const clientId = getClientIdentifier(request);
  const rateLimitResult = textResponseLimiter.checkLimit(clientId);
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded. Please try again later.',
        resetTime: rateLimitResult.resetTime
      },
      { status: 429 }
    );
  }
  
  // ... rest of existing code
  const rawInput = await request.json();
  // etc.
}
```

---

## 🔴 Issue 3: Missing Environment Variable Documentation (MEDIUM)

### Problem
`OPENAI_API_KEY` is used in the code but not documented in `env.example`.

### Fix Required

Add to `env.example` (around line 35):

```bash
# OpenAI Configuration (for response generation)
OPENAI_API_KEY=your_openai_api_key_here
```

---

## ⚠️ Issue 4: Firestore Rules Need Hardening (MEDIUM)

### Problem
Production database has overly permissive rules:
```javascript
// Current (development-friendly but insecure)
match /influencers/{influencerId} {
  allow read: if true; // Anyone can read
  allow write: if false;
}

match /responses/{responseId} {
  allow read, write: if true; // Anyone can read/write
}
```

### Fix Required

Update `firestore.rules` for production:

```javascript
match /influencers/{influencerId} {
  allow read: if request.auth != null; // Require authentication
  allow write: if false; // Only admin via Firebase Admin SDK
}

match /responses/{responseId} {
  allow read: if isAuthenticated() && 
    resource.data.createdBy == request.auth.uid; // Only owner can read
  allow create: if isAuthenticated();
  allow update, delete: if isAuthenticated() && 
    resource.data.createdBy == request.auth.uid; // Only owner can modify
}
```

**Deploy rules:**
```bash
firebase deploy --only firestore:rules
```

---

## Testing Checklist

After implementing fixes, verify:

- [ ] API key is NOT visible in browser DevTools → Network tab
- [ ] Text response API returns 429 after 5 requests per minute
- [ ] `env.example` includes `OPENAI_API_KEY`
- [ ] Firestore rules reject unauthenticated reads (if authentication is enabled)
- [ ] All existing functionality still works

---

## Deployment Order

1. **Local Testing** - Test all fixes in development environment
2. **Update Environment Variables** - Add `GOOGLE_AI_API_KEY` to production env
3. **Deploy Code** - Deploy fixed code to production
4. **Deploy Firestore Rules** - Update Firestore security rules
5. **Monitor** - Watch logs for rate limit hits and auth errors

---

**Questions?** Review the full analysis in `CODE_REVIEW_TEXT_RESPONSE_SYSTEM.md`

