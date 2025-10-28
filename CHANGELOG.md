# Changelog

All notable changes to Pretty Presentations will be documented in this file.

## [2.4.4] - 2025-10-28

### 🐛 TypeScript Build Fixes

#### Fixed Vercel Deployment Errors (6 Total)

**Fix #1: Chart Examples Type Error**
- **FIXED:** TypeScript type error in `CHART_EXAMPLES.tsx`
  - Made `value` field optional in `TrendDataItem` interface
  - Updated interface: `value?: number` (was `value: number`)
  - Removed explicit `undefined` values from growth data examples
  - Chart component now properly handles optional values for projected-only data points

**Fix #2: Platform Type Error**
- **FIXED:** TypeScript type error in `app/api/generate-text-response/route.ts`
  - Imported `Platform` type from `@/types`
  - Added type predicate to filter function: `platform is Platform`
  - Changed `validPlatforms` to `Platform[]` type
  - Cast `validPlatforms` to `readonly string[]` in `includes()` check
  - Now correctly returns `Platform[]` instead of `string[]`

**Fix #3: ClientBrief Type Error in Image Generation**
- **FIXED:** TypeScript type error in `app/api/images/generate/route.ts`
  - Created separate `ImageGenerationBrief` interface for image generation
  - Separates concerns: validation schema uses `budget: string`, ClientBrief uses `budget: number`
  - Updated `SlideImageOptions.brief` to use `ImageGenerationBrief`
  - Updated `createPromptForSlide` to handle optional fields
  - Added fallback values: `contentThemes` → "modern business", `platformPreferences` → "digital media"
  - Removed invalid type cast in route handler
  - Image generation now works with simplified, correctly-typed brief schema

**Fix #4: Metric Value Type Error in PowerPoint Export**
- **FIXED:** TypeScript type error in `app/editor/[id]/page.tsx`
  - Convert `metric.value` (type: `string | number`) to string using `String()`
  - `pptxSlide.addText` expects `text` as `string | undefined`
  - Ensures PowerPoint export works with both numeric and string metric values
  - Maintains backward compatibility with existing data

- **FILES CHANGED:**
  - `components/charts/LineChartTrend.tsx` - Updated interface
  - `CHART_EXAMPLES.tsx` - Cleaned up data structure
  - `app/api/generate-text-response/route.ts` - Fixed platform type assertion
  - `lib/replicate-image-service.ts` - Created ImageGenerationBrief interface
  - `app/api/images/generate/route.ts` - Removed invalid cast
  - `app/editor/[id]/page.tsx` - Convert metric values to string
- **DOCUMENTATION ADDED:**
  - `VERCEL_ENV_SETUP.md` - Complete environment variables guide
  - `MISSING_ENV_VARS.md` - List of 13 missing Vercel env vars
  - `BUILD_FIX_SUMMARY.md` - Summary of all TypeScript fixes
  - `FINAL_BUILD_STATUS.md` - Complete build status summary
  - `QUICK_DEPLOYMENT_STATUS.md` - Quick reference card
- **RESULT:** All TypeScript compilation errors resolved ✅

---

## [2.4.3] - 2025-10-28

### 🎨 Text Visibility & PDF Export Complete

#### Pure Black/White Text Colors
- **FIXED:** Maximum contrast text visibility in all modes
  - **Light Mode**: Pure black (#000000) text on white background
  - **Dark Mode**: Pure white (#FFFFFF) text on dark background
- **APPLIED TO:** All text elements for consistency
  - Headings (h1, h2, h3, h4): Pure black/white
  - Paragraphs: Pure black/white
  - Lists: Pure black/white
  - Tables: Pure black/white text
  - Strong/Bold: Pure black/white
  - Blockquotes: Pure black/white
- **RESULT:** Perfect visibility in both browser and PDF exports
- **NO MORE:** Faded or low-contrast text (rgb(31 41 55))

#### PDF Export Restored
- **RESTORED:** Professional PDF export functionality
  - One-click "Export PDF" button (was "Download MD")
  - Uses jsPDF + html2canvas for high-quality rendering
  - White background (#ffffff) ensures text shows in PDFs
  - Multi-page support for long responses
  - File naming: `ClientName-influencer-recommendations.pdf`
- **FALLBACK:** Graceful markdown download if PDF generation fails

#### Markdown Rendering Fixed
- **FIXED:** OpenAI markdown wrappers stripped properly
  - Removes ` ```markdown ` and ` ``` ` code block wrappers
  - No more raw markdown syntax (##, **, etc.) showing in UI
  - Clean content passed to ReactMarkdown
- **IMPROVED:** Content cleaning in `markdown-response-generator.server.ts`

#### Random Sample Brief Generator Fixed
- **FIXED:** Generates new brand briefs every time
  - Moved `brands.csv` from `data/` to `public/data/brands.csv`
  - Force-added to Git (was being ignored)
  - CSV now accessible to client-side fetch requests
  - 218 brands available for diverse test scenarios
- **VERIFIED:** Console logs show successful brand loading

#### Files Changed
- `app/response/[id]/response-styles.css` - Pure black/white colors with !important
- `app/response/[id]/page.tsx` - PDF export restored, white background for print
- `lib/markdown-response-generator.server.ts` - Strip markdown code block wrappers
- `public/data/brands.csv` - Moved from data/ and force-added to Git
- `components/BriefUpload.tsx` - Uses generateRandomSampleBrief correctly

### 🐛 Bug Fixes
- Fixed text visibility in both light and dark modes
- Fixed PDF export showing invisible text
- Fixed random sample always showing "The Band" brief
- Fixed markdown syntax appearing in rendered output
- Fixed brands.csv 404 error in browser console

### 📚 Documentation
- **ADDED:** `API_USAGE_EXPLAINED.md` - Clarifies OpenAI vs database usage
- **UPDATED:** README.md - Version 2.4.3 with text visibility fixes
- **UPDATED:** CHANGELOG.md - Complete fix history

---

## [2.4.2] - 2025-10-28

### 🎨 Project Consolidation & Formatting Improvements

#### Project Structure Cleanup
- **MERGED:** Consolidated duplicate `pretty-presentations` subdirectory into main project
- **REMOVED:** Deleted redundant subdirectory to eliminate confusion
- **UNIFIED:** Single codebase structure for easier maintenance
- All files synced and merged properly (app/, components/, lib/, types/)
- No functionality lost in the merge

#### Text Response Formatting Fixes
- **FIXED:** White background box on response pages (now transparent)
- **FIXED:** HTML tables now render properly instead of showing raw markup
  - Added `rehype-raw` plugin to ReactMarkdown
  - Tables display with proper borders, styling, and colors
- **IMPROVED:** Text contrast in both light and dark modes
  - Light mode: Darker text (rgb(17 24 39)) for better readability
  - Dark mode: Lighter text (rgb(243 244 246)) for better visibility
- **ADDED:** Custom CSS typography system (`response-styles.css`)
  - Large, readable font sizes
  - Proper heading hierarchy
  - Beautiful table styling with hover effects
  - Gradient headers for visual appeal

#### Export Changes
- **CHANGED:** Text response export from PDF to Markdown download
  - Simpler, faster download
  - "Download MD" button instead of "Export PDF"
  - Better compatibility across platforms

#### Documentation
- **ADDED:** `TEXT_RESPONSE_FORMATTING_FIXES.md` - Complete formatting fix documentation
- **ADDED:** `PROJECT_MERGE_COMPLETE.md` - Merge process documentation
- **ADDED:** `CLEANUP_COMPLETE.md` - Project cleanup summary

#### Files Changed
- `app/response/[id]/page.tsx` - Updated with rehypeRaw, transparent background, custom CSS
- `app/response/[id]/response-styles.css` - New custom typography system
- `app/page.tsx` - Updated to use proper API route for text generation
- `app/api/generate-text-response/route.ts` - Proper server-side generation
- `components/BriefUpload.tsx` - Latest version synced
- `components/ProcessingOverlay.tsx` - Added to main project

### 🐛 Bug Fixes
- Fixed markdown rendering showing raw syntax (**, ##, etc.)
- Fixed emojis not displaying properly in responses
- Fixed blockquote text visibility issues
- Fixed client/server boundary violations in text generation

## [2.4.1] - 2025-10-27

### 🔒 Security & Quality Improvements

#### Input Sanitization
- **ADDED:** Comprehensive input sanitization for API routes
- Protection against XSS attacks (removes dangerous characters: `<`, `>`, `{`, `}`, `\`)
- Length limits on all text fields (prevents DoS)
- Array size limits (prevents memory attacks)
- Budget validation (0-10M range)
- Platform whitelist validation
- Type checking for all inputs

#### Error Message Security
- **IMPROVED:** Error messages no longer leak internal details
- Safe, user-friendly error messages for all failure cases
- API keys and internal paths never exposed
- Stack traces not sent to client
- Specific error types logged internally only

#### Accessibility Enhancements
- **ADDED:** ARIA labels to processing overlay modal
- Added `role="dialog"` and `aria-modal="true"`
- Added `aria-labelledby` and `aria-describedby` for screen readers
- Dynamic content based on processing mode (presentation vs text)
- Better keyboard navigation support

#### Bug Fixes
- **FIXED:** Missing `processingMode` state variable causing runtime error
- Processing overlay now correctly shows different messages for text vs presentation mode
- State management properly initialized in both handlers

#### Test Coverage Improvements
- **ENHANCED:** Playwright tests now verify table rendering
- Tests check for raw HTML tags vs rendered tables
- Content quality validation (length, required sections)
- Better error detection and debugging screenshots
- Comprehensive assertions for all critical features

### 📚 Documentation
- **ADDED:** `CODE_REVIEW_FIXES.md` - Complete summary of all security and quality improvements
- Updated inline comments and JSDoc annotations
- Enhanced error message documentation

---

## [2.4.0] - 2025-10-27

### ✨ Major Features Added

#### Text Response Generation
- **NEW:** Complete text-based influencer recommendation reports
- Generates comprehensive markdown documents with influencer analysis
- Uses same matching logic as presentation generation
- Proper API route architecture (client/server separation)

#### PDF Export Functionality
- **NEW:** Export text responses as formatted PDFs
- One-click PDF generation with preserved styling
- Replaces markdown download with professional PDF output

### 🔧 Critical Fixes

#### HTML Rendering in Text Responses
- **FIXED:** HTML tables now render properly (not as raw text)
- Added `rehype-raw` plugin for HTML parsing in markdown
- Custom ReactMarkdown components with inline styles
- Tables display with proper borders and formatting

#### Text Visibility Issues
- **FIXED:** Blockquote text now visible (was light on light)
- Enhanced text contrast in all markdown elements
- Improved font weights for better readability

#### Client/Server Architecture
- **FIXED:** Proper Next.js client/server boundary separation
- Created `/api/generate-text-response` route
- Eliminated server-only function imports in client components

### 🚀 Performance Improvements
- Updated to Next.js 16.0.0 (latest)
- Updated React to 19.2.0
- Clean build process with cache management

### 📦 Dependencies Added
- `rehype-raw@7.0.0` - HTML parsing for markdown
- `jspdf@latest` - PDF generation
- `html2pdf.js` - HTML to PDF conversion
- `@playwright/test@1.56.1` - E2E testing

### 🎨 UI/UX Enhancements
- Professional markdown rendering with Tailwind prose classes
- Responsive design for text response pages
- Copy to clipboard functionality
- Download/Export with proper file naming

### 🧪 Testing
- Created comprehensive Playwright test suite
- E2E tests for text response generation
- Automated screenshot capture for debugging

### 📝 Documentation
- `TEXT_RESPONSE_FIXES.md` - Complete fix guide
- `RENDERING_FIX_GUIDE.md` - Browser caching solutions  
- `FINAL_TEXT_RESPONSE_FIXES.md` - Technical deep dive
- Updated testing instructions

### 🐛 Known Issues
- Google AI 403 errors for brand suggestions (non-blocking, can be ignored)
- Old responses generated before fixes won't benefit from new rendering

---

## [2.3.0] - Previous Release

### Features
- Influencer matching with LAYAI scoring algorithm
- Brand intelligence integration (218+ brands database)
- Firebase integration for data persistence
- Real-time influencer database (3,000+ Spanish influencers)
- Template system for presentation styles
- OpenAI integration for brief parsing

### Core Functionality
- Brief parsing from text documents
- AI-powered influencer matching
- Presentation generation with slides
- Image generation for slides
- Export to various formats

---

## Release Notes

### Upgrade Path from 2.3.0 to 2.4.0

1. Pull latest changes from repository
2. Run `npm install` to install new dependencies
3. Clear `.next` cache: `rm -rf .next`
4. Restart dev server: `npm run dev`
5. Clear browser cache for localhost
6. Generate new text responses to see fixes

### Breaking Changes

None. All existing functionality remains compatible.

### Migration Notes

- Text responses generated before 2.4.0 may display formatting issues
- Regenerate old responses to apply new rendering fixes
- PDF export is available for all responses (new and old)

---

## Version History

- **2.4.0** - Text Response Generation & PDF Export (Current)
- **2.3.0** - Brand Intelligence & LAYAI Matching
- **2.2.0** - Template System Implementation
- **2.1.0** - Real Data Integration
- **2.0.0** - Firebase & Firestore Integration
- **1.0.0** - Initial Release
