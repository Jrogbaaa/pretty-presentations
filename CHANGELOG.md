# Changelog

All notable changes to Pretty Presentations will be documented in this file.

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
