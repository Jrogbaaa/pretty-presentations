# Presenton Integration Testing Guide

This document outlines the testing procedures for the Presenton Docker integration.

## Test Checklist

### ✅ Phase 1: Docker Setup Testing

- [ ] **Docker Installation Check**
  ```bash
  docker --version
  docker info
  ```
  - Expected: Docker version displayed, daemon running

- [ ] **Environment Variables**
  - [ ] `.env.local` contains `OPENAI_API_KEY`
  - [ ] `.env.local` contains `PEXELS_API_KEY`
  - [ ] `.env.local` contains `NEXT_PUBLIC_ENABLE_PRESENTON=true`
  - [ ] `.env.local` contains `PRESENTON_API_URL=http://localhost:5001`

- [ ] **Start Presenton Container**
  ```bash
  ./scripts/presenton-docker.sh start
  ```
  - Expected: Container starts, health check passes, shows "Presenton is ready"

- [ ] **Verify Container Running**
  ```bash
  ./scripts/presenton-docker.sh status
  ```
  - Expected: Shows "Presenton is running", health: healthy

- [ ] **Check Logs**
  ```bash
  ./scripts/presenton-docker.sh logs
  ```
  - Expected: No errors, server listening on port 80

### ✅ Phase 2: API Integration Testing

- [ ] **Health Endpoint**
  ```bash
  curl http://localhost:5001/health
  ```
  - Expected: HTTP 200, healthy response

- [ ] **API Health Check from Application**
  ```bash
  curl http://localhost:3000/api/presenton/health
  ```
  - Expected: `{"status": "healthy", "available": true}`

- [ ] **Test Basic Generation (Optional)**
  ```bash
  curl -X POST http://localhost:5001/api/v1/ppt/presentation/generate \
    -H "Content-Type: application/json" \
    -d '{
      "content": "Test presentation about AI",
      "n_slides": 3,
      "language": "English",
      "template": "general",
      "export_as": "pptx"
    }'
  ```
  - Expected: Returns `presentation_id`, `path`, `edit_path`

### ✅ Phase 3: UI Integration Testing

- [ ] **Start Development Server**
  ```bash
  npm run dev
  ```
  - Navigate to http://localhost:3000

- [ ] **Check Engine Selector Appears**
  - Fill brief form
  - Scroll to "Presentation Engine" section
  - Verify two options visible:
    - ✅ Standard Generator
    - ✅ Presenton (AI-Enhanced)

- [ ] **Check Presenton Status Indicator**
  - Look at top-right of Presenton option
  - Expected: Green checkmark + "Online" (if container running)
  - If container stopped: Red X + "Offline"

- [ ] **Status Updates**
  - Stop Presenton: `./scripts/presenton-docker.sh stop`
  - Wait 5-10 seconds
  - UI should show "Offline" (updates every 30 seconds)
  - Start Presenton: `./scripts/presenton-docker.sh start`
  - Wait for startup + 30 seconds
  - UI should show "Online"

### ✅ Phase 4: End-to-End Flow Testing

#### Test 1: Standard Generator (Baseline)

- [ ] Fill brief form with sample data
- [ ] Select "Standard Generator"
- [ ] Click "Generate Presentation"
- [ ] Verify:
  - Processing overlay appears
  - Brand intelligence lookup works
  - Influencer matching works
  - Presentation generates successfully
  - Navigate to editor
  - **Record time taken:** _____  seconds

#### Test 2: Presenton Generator (Happy Path)

- [ ] Ensure Presenton is running (`./scripts/presenton-docker.sh status`)
- [ ] Fill brief form with sample data (same as Test 1)
- [ ] Select "Presenton (AI-Enhanced)"
- [ ] Click "Generate Presentation"
- [ ] Check browser console for logs:
  - "🚀 Using Presenton engine..."
  - "🔍 Matching influencers..."
  - "🎨 Generating with Presenton..."
  - "✅ Presenton generation successful!"
- [ ] Verify alert message shows:
  - "Presentation generated successfully with Presenton!"
  - Presentation ID displayed
- [ ] **Record time taken:** _____ seconds

#### Test 3: Presenton Unavailable (Fallback)

- [ ] Stop Presenton: `./scripts/presenton-docker.sh stop`
- [ ] Fill brief form with sample data
- [ ] Select "Presenton (AI-Enhanced)"
- [ ] Click "Generate Presentation"
- [ ] Check browser console for logs:
  - "🚀 Using Presenton engine..."
  - "⚠️ Presenton not available, falling back to standard generator"
  - "🎯 Using standard generator..."
- [ ] Verify:
  - Warning message appears (Presenton not available)
  - Falls back to standard generator
  - Presentation still generates successfully
  - Navigate to editor

#### Test 4: Presenton Generation Error (Graceful Degradation)

- [ ] Start Presenton with invalid API key:
  ```bash
  # Edit .env.local
  OPENAI_API_KEY=invalid_key
  # Restart Presenton
  ./scripts/presenton-docker.sh restart
  ```
- [ ] Fill brief form
- [ ] Select "Presenton (AI-Enhanced)"
- [ ] Click "Generate Presentation"
- [ ] Verify:
  - Error caught and logged
  - Error message shows
  - Falls back to standard generator
  - Presentation still generates

### ✅ Phase 5: Data Transformation Testing

- [ ] **Brief-to-Presenton Adapter**
  - Create test brief with:
    - Client name: "Nike"
    - Campaign goals: ["Increase brand awareness", "Drive sales"]
    - Budget: €50,000
    - Platforms: Instagram, TikTok
    - Content themes: ["Athletic performance", "Motivation"]
  - Verify formatted content includes:
    - Executive summary
    - Campaign objectives (numbered list)
    - Target audience section
    - Platform strategy
    - Content themes

- [ ] **Influencer Data Mapping**
  - Test with 3 influencers:
    - 1 macro (>500K followers)
    - 1 mid-tier (100K-500K)
    - 1 micro (<100K)
  - Verify output includes:
    - Influencers grouped by tier
    - Each has: name, handle, followers, engagement, platform
    - Rationale included
    - Cost estimates included

### ✅ Phase 6: Management Scripts Testing

- [ ] **Start Script**
  ```bash
  ./scripts/presenton-docker.sh start
  ```
  - Checks Docker installed ✓
  - Checks .env.local exists ✓
  - Pulls image (first time) ✓
  - Starts container ✓
  - Waits for health check ✓
  - Shows success message ✓

- [ ] **Stop Script**
  ```bash
  ./scripts/presenton-docker.sh stop
  ```
  - Stops container gracefully ✓
  - Shows success message ✓

- [ ] **Status Script**
  ```bash
  ./scripts/presenton-docker.sh status
  ```
  - Shows running/stopped status ✓
  - Shows health status ✓
  - Shows access URL ✓

- [ ] **Logs Script**
  ```bash
  ./scripts/presenton-docker.sh logs
  ```
  - Follows logs in real-time ✓
  - Can exit with Ctrl+C ✓

- [ ] **Restart Script**
  ```bash
  ./scripts/presenton-docker.sh restart
  ```
  - Stops then starts container ✓
  - Both operations complete successfully ✓

- [ ] **Pull Script**
  ```bash
  ./scripts/presenton-docker.sh pull
  ```
  - Downloads latest image ✓
  - Shows success message with restart instructions ✓

### ✅ Phase 7: Error Handling Testing

- [ ] **Docker Not Running**
  - Stop Docker Desktop
  - Run `./scripts/presenton-docker.sh start`
  - Expected: Clear error message, instructions to start Docker

- [ ] **Missing Environment Variables**
  - Remove `OPENAI_API_KEY` from `.env.local`
  - Run `./scripts/presenton-docker.sh start`
  - Expected: Error message about missing key

- [ ] **Port Conflict**
  - Start another service on port 5001
  - Run `./scripts/presenton-docker.sh start`
  - Expected: Docker error about port in use

- [ ] **Network Issues**
  - Disconnect from internet
  - Try to generate with Presenton
  - Expected: Network error, fallback to standard (which should also fail)

### ✅ Phase 8: Performance Testing

| Metric | Standard Generator | Presenton | Notes |
|--------|-------------------|-----------|-------|
| Generation time | _____ sec | _____ sec | |
| Cost per presentation | $0.08-0.14 | $0.02 | |
| Memory usage | _____ MB | _____ MB | Check Docker stats |
| Startup time | N/A | _____ sec | First time container start |

### ✅ Phase 9: Documentation Testing

- [ ] README.md updated with Presenton section
- [ ] PRESENTON_INTEGRATION.md exists and is complete
- [ ] env.example includes Presenton variables
- [ ] Table of contents includes Presenton
- [ ] All links work (test clicking through)

### ✅ Phase 10: Code Quality

- [ ] No TypeScript errors:
  ```bash
  npm run build
  ```

- [ ] No linting errors:
  ```bash
  npm run lint
  ```

- [ ] All imports resolve correctly

- [ ] No console errors in browser (除了 expected logs)

## Test Results Summary

### Passed Tests
- [ ] All Phase 1-10 tests completed
- [ ] No blocking issues found
- [ ] Fallback behavior works correctly
- [ ] Documentation is complete and accurate

### Issues Found

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| | | | |

### Performance Metrics

**Average Generation Times:**
- Standard Generator: _____ seconds
- Presenton: _____ seconds

**Cost Savings:**
- Per presentation: $_____ (___% reduction)
- Per 100 presentations: $_____ savings/month

### Recommendations

- [ ] Ready for production use
- [ ] Needs minor fixes (list below)
- [ ] Needs major work (list below)

**Notes:**

---

## Quick Test Commands

```bash
# Full test sequence
./scripts/presenton-docker.sh start
./scripts/presenton-docker.sh status
npm run dev
# Test in browser
./scripts/presenton-docker.sh logs
./scripts/presenton-docker.sh stop
```

## Automated Testing (Future)

Consider adding:
- [ ] Unit tests for adapter functions
- [ ] Integration tests for API calls
- [ ] E2E tests with Playwright
- [ ] Performance benchmarks
- [ ] Load testing for concurrent generations

