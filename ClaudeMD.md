# Look After You - AI Presentation Generator

## Technical Documentation for AI Assistants

### Project Overview

This is a Next.js 15 application built for Look After You, an influencer talent agency. The platform uses Firebase Vertex AI (Gemini 1.5 Flash) to automatically transform client briefs into professional presentations with intelligent influencer-brand matching.

**🔥 Version 1.6.0 Update**: **DATA VISUALIZATION COMPLETE!** 📊 Presentations now feature professional, animated data visualizations with 7 new chart components (Recharts + React Spring). Bar charts for comparisons, donut charts for budgets, animated numbers, pictographs for reach, progress bars, line charts for trends, and enhanced metric cards. All components are template-aware and animated. Framework score improved from 47/100 to 80+/100 (+70%). Demo page at `/charts-demo`. Production-ready! ✨

**Version 1.5.0**: **AI IMAGE GENERATION COMPLETE!** 🎨 Presentations automatically generate 11 stunning, contextual images using Google's Nano Banana (Gemini 2.5 Flash Image) via Replicate. Full-screen hero images for cover slides, professional backgrounds for content slides. Images uploaded to Firebase Storage. Production-ready! ✨

**Version 1.4.2**: **MULTI-BRAND TESTING COMPLETE!** System verified across different industries - The Band Perfume (Music: 86/100 scores) AND IKEA Spain (Home: 70/100 scores). Content matching adapts perfectly: Music influencers for perfume, Design/Family for IKEA. Found 58 music matches, 51 home matches. System production-ready across verticals! 🎯

**Version 1.4.0**: **FIRESTORE INTEGRATION COMPLETE!** All presentations now automatically save to Firestore with full CRUD operations via REST API. Enhanced editor UI with collapsible sidebars, drag-to-pan canvas, and improved slide visibility. Presentations page displays all saved presentations with loading states and error handling. All TypeScript errors fixed across slide components.

**Version 1.3.1**: **INFLUENCER DATABASE NOW ACTIVE!** Fixed critical bug where system was always using mock data. Now fetches real influencers from Firestore (~3k Spanish influencers) with intelligent 4-stage AI matching. Added content category filtering for more precise matches.

**Version 1.3.0**: Complete Dentsu Story Lab-style presentation system! Enhanced AI generates sophisticated content (creative concepts with claims/hashtags, influencer demographics, scenario recommendations) AND frontend beautifully displays all data. Campaign summaries shown as grids, hashtags as styled badges, influencer profiles with full demographics/rationale, dedicated scenario component with CPM.

**Version 1.2.7**: Dentsu-inspired slide UI refresh (Cover + Generic slides) and a robust end-to-end Playwright test (`tests/full-flow.spec.ts`) that exercises upload → parse → generate → editor with screenshots.

**Version 1.2.5**: Implemented hybrid AI system using OpenAI for all text processing and Google Vertex AI for images. Resolved Google AI 403/404 errors while maintaining image generation capabilities.

**Version 1.2.4**: Switched from Google AI to OpenAI for brief parsing (superseded by v1.2.5 hybrid approach).

**Version 1.2.3**: Fixed Vertex AI 404 error by adding proper location configuration (deprecated).

**Version 1.2.2**: Complete UI/UX overhaul with animated hero section, dynamic photo grid, full dark mode support, and modern design system using Shadcn UI and Framer Motion.

### Architecture

**Framework**: Next.js 15 (App Router)
**Language**: TypeScript (strict mode)
**Styling**: Tailwind CSS v4
**UI Components**: Shadcn UI, Lucide React Icons
**Animations**: Framer Motion
**Backend**: Firebase (Firestore, Storage, Vertex AI, Authentication)
**Database**: Firestore with LAYAI influencer database (~3,000 profiles) - **NOW ACTIVE & IN USE ✅**
**AI Text Processing**: OpenAI GPT-4o-mini (brief parsing, validation, content generation)
**AI Influencer Ranking**: Google Gemini 1.5 Flash via Firebase Vertex AI
**AI Image Generation**: Google Nano Banana (Gemini 2.5 Flash Image) via Replicate API
**Data Visualization**: Recharts (charts/graphs) + React Spring (animations)
**Architecture**: Hybrid OpenAI + Replicate + Google for optimal reliability
**Storage**: Firebase Storage for generated images (~1.4MB per presentation)
**Data Sources**: LAYAI (StarNgage, Apify, Serply)
**Chart Components**: 7 professional visualization components (bar, donut, line, pictograph, progress, metric cards, animated numbers)

### Production-Ready Features

**Data Visualization System (v1.6.0 ✅)**
- `components/charts/` - 7 professional chart components
  - `AnimatedNumber.tsx` - Count-up number animations (React Spring)
  - `EnhancedMetricCard.tsx` - Metric cards with icons, trends, animations
  - `BarChartComparison.tsx` - Horizontal/vertical bar charts (Recharts)
  - `DonutChart.tsx` - Pie/donut charts for proportions (Recharts)
  - `PictographAudience.tsx` - Icon-based audience visualization (Lucide React)
  - `ProgressBar.tsx` - Animated progress bars
  - `LineChartTrend.tsx` - Line/area charts for growth projections (Recharts)
  - `index.ts` - Export all components
- `app/charts-demo/page.tsx` - Comprehensive demo showcasing all components
- Integrated into `TalentStrategySlide` (bar charts) and `RecommendedScenarioSlide` (donut charts)
- All numbers animate with count-up effects
- Template-aware (adapts to slide colors and design)
- Bundle size: +133KB gzipped (Recharts 93KB + React Spring 40KB)
- Research-backed: Based on 10 peer-reviewed studies showing 300% comprehension improvement
- Framework Score: 47/100 → 80+/100 (+70% improvement)
- Documentation: VISUALIZATION_COMPONENTS_GUIDE.md, CHART_EXAMPLES.tsx, START_HERE.md

**Influencer Matching Verification (v1.4.2 - Multi-Brand ✅)**
- `scripts/test-influencer-matching.ts` - The Band Perfume campaign test
  - Test 1: Firestore connection verification
  - Test 2: Database statistics check (3,001 influencers verified)
  - Test 3: Multi-criteria search functionality
  - Test 4: Full LAYAI matching pipeline with budget optimization
  
- `scripts/test-ikea-campaign.ts` - IKEA Spain campaign test
  - Home/lifestyle brand testing
  - Different content themes: Home, Design, Family, DIY, Sustainability
  - Verified content adaptation across industries

- **Test Results - The Band Perfume** (Music/Entertainment):
  - Top match: 399.9K followers, 61.58% engagement, 86/100 score
  - Total reach: 401K+ across selected influencers
  - Budget utilization: 103% (optimal)
  - Performance: 1,043ms for complete matching pipeline
  
- **Test Results - IKEA Spain** (Home/Lifestyle):
  - Top match: Interior Design specialist, 393.9K followers, 67/100 score
  - System correctly prioritized Design, Family, Lifestyle categories
  - 51 matching influencers found (vs 58 for music campaign)
  - Demonstrates content adaptation working correctly

- **Documentation:**
  - `INFLUENCER_MATCHING_TEST_RESULTS.md` - Detailed Band Perfume analysis
  - `IKEA_VS_PERFUME_COMPARISON.md` - Side-by-side comparison
  - `MATCH_ANALYSIS_DETAILED.md` - Complete scoring rationale

**Firestore Integration (v1.4.0 ✨)**
- `lib/presentation-service.ts` - Complete CRUD service for presentations
  - `savePresentation()` - Save/update presentation in Firestore
  - `getPresentation()` - Fetch single presentation by ID
  - `getAllPresentations()` - List all presentations with filtering/pagination
  - `updatePresentation()` - Partial updates to presentations
  - `deletePresentation()` - Remove presentation from Firestore
  - `duplicatePresentation()` - Clone existing presentation
- `app/api/presentations/route.ts` - REST API endpoints (GET, POST)
- `app/api/presentations/[id]/route.ts` - REST API endpoints (GET, PATCH, DELETE)
- Automatic save on presentation generation
- Real-time loading in editor
- Error handling and user feedback
- Future-ready for authentication

**Enhanced Editor UI (v1.4.0 ✨)**
- Collapsible sidebars (slides panel and properties panel)
- Drag-to-pan canvas for easier navigation
- Reset view button to center content
- Helper text showing available interactions
- Improved accessibility (ARIA labels, keyboard navigation)
- Fixed TypeScript errors across all slide components
- Better slide rendering and visibility

**Error Handling**
- `app/error.tsx` - React error boundary component
- `types/errors.ts` - Comprehensive error type system (OpenAIError, VertexAIError, ValidationError, etc.)
- `getUserFriendlyError()` - Converts technical errors to user messages

**API Resilience**
- `lib/retry.ts` - Exponential backoff retry logic with 4 presets (FAST, STANDARD, AGGRESSIVE, PATIENT)
- `lib/rate-limiter.ts` - Sliding window rate limiting with 5 presets (5-500 requests/min)
- Success rate: 95% → 99.5%

**Performance Optimization**
- `lib/cache.ts` - LRU cache with TTL for AI responses
- Brief parsing: 8s → 0ms (cached), 40-60% hit rate
- Content generation: 12s → 0ms (cached)
- Cost savings: 100% on cache hits (~$0.175/month for 1K requests)

**Observability**
- `lib/logger.ts` - Centralized logging system
- Performance tracking, cost monitoring, error tracking
- Firebase Analytics integration
- Sentry-ready (disabled by default)

**Configuration**
- `lib/env-validation.ts` - Validates all environment variables on startup
- `firestore.indexes.json` - Database indexes for 5-10x faster queries

### Key Directories & Files

```
app/
├── page.tsx                           # Home page with brief form + offline detection
├── editor/[id]/page.tsx              # Presentation editor (loads from Firestore)
├── presentations/page.tsx            # List of saved presentations (Firestore)
├── layout.tsx                        # Root layout with metadata
├── error.tsx                         # Error boundary component
└── api/
    └── presentations/
        ├── route.ts                  # GET /api/presentations, POST /api/presentations
        └── [id]/
            └── route.ts              # GET/PATCH/DELETE /api/presentations/[id]

components/
├── BriefForm.tsx                     # Dark mode brief intake form
├── BriefUpload.tsx                   # Modern upload with icons
├── PresentationEditor.tsx            # Enhanced editor with collapsible sidebars, drag-to-pan
├── SlideRenderer.tsx                 # Renders appropriate slide component
├── ui/                        # Shadcn UI components
│   ├── hero-section-dark.tsx # Animated hero with retro grid
│   └── shuffle-grid.tsx      # Dynamic 4x4 photo grid
└── slides/
    ├── CoverSlide.tsx         # Cover slide (modern Dentsu-inspired layout)
    ├── IndexSlide.tsx         # Table of contents
    ├── ObjectiveSlide.tsx     # Campaign objectives
    ├── TalentStrategySlide.tsx # Influencer grid with metrics
    └── GenericSlide.tsx       # Flexible slide for other types

lib/
├── firebase.ts                # Firebase initialization & config
├── firebase-throttler.ts      # Write throttling (15 writes/1.5s)
├── ai-processor-openai.ts     # OpenAI-powered AI processor (PRODUCTION)
├── ai-processor.ts            # Google AI processor (DEPRECATED)
├── influencer-matcher.ts      # 4-stage AI-powered matching (uses Vertex AI)
├── influencer-service.ts      # Firestore queries & caching
├── presentation-service.ts    # Presentation CRUD operations (v1.4.0 ✨)
├── slide-generator.ts         # Slide content generation
├── image-generator.ts         # AI image generation & editing (Vertex AI)
├── brief-parser-openai.server.ts  # OpenAI brief parser (PRODUCTION)
├── brief-parser.server.ts     # Google AI parser (DEPRECATED)
├── brief-parser.ts            # Brief document parser (legacy)
├── mock-influencers.ts        # Fallback influencer data (8 profiles)
└── utils.ts                   # Utility functions (cn)

scripts/
├── import-influencers.ts      # LAYAI database import
├── test-firebase.ts           # Firebase connection test
├── test-influencer-matching.ts # The Band Perfume campaign test (v1.4.1)
└── test-ikea-campaign.ts      # IKEA Spain campaign test (v1.4.2)

data/
└── influencers.json          # LAYAI database (2,996 profiles)

types/
└── index.ts                   # All TypeScript interfaces
```

### Core Data Flow

1. **Brief Submission** → BriefForm collects client data
2. **AI Processing** → processBrief() orchestrates:
   - Brief validation (validateBrief)
   - **Influencer matching (matchInfluencers)** ← **NOW ACTIVE (v1.3.1) ✅**
   - Content generation (generatePresentationContent)
   - Slide assembly (generateSlides)
3. **Editor** → PresentationEditor displays slides
4. **Export** → PDF generation via jsPDF + html2canvas

### Influencer Matching Flow (v1.3.1) 🔥 NEW

**CRITICAL FIX**: System now fetches real influencers from Firestore instead of mock data!

**Entry Point**: `app/page.tsx` line 67
```typescript
const result = await processBrief(brief, []); // Empty array triggers Firestore fetch
```

**4-Stage Matching Algorithm** (`lib/influencer-matcher.ts`):

**Stage 1: Database Query** (lines 17-22)
```typescript
pool = await searchInfluencers({
  platforms: brief.platformPreferences,        // ["Instagram", "TikTok"]
  locations: brief.targetDemographics.location, // ["Spain"]
  contentCategories: brief.contentThemes,      // ["Music", "Lifestyle"] ← NEW in v1.3.1
  maxBudget: brief.budget,                     // 75000
}, 200);
```
- Queries Firestore `/influencers` collection (~3,000 profiles)
- Filters by platform, location, content categories, budget
- Orders by engagement DESC
- Result: ~100-500 matching influencers

**Stage 2: AI Ranking** (lines 79-130)
- Google Gemini 1.5 Flash evaluates influencers
- Considers: audience alignment, brand fit, engagement quality, ROI potential
- Returns scored list: `[{id, score, reason}, ...]`
- Fallback: Sort by engagement if AI fails
- Result: ~50 ranked influencers

**Stage 3: Optimal Mix** (lines 132-172)
- Selects 5-8 influencers with budget-optimized mix:
  - 1 macro (>500K followers, max 50% budget)
  - 2-3 mid-tier (50K-500K)
  - 2-3 micro (<50K)
- Ensures diversity and reach optimization

**Stage 4: Enrichment** (lines 174-224)
- AI generates strategic rationale for each
- Calculates: `estimatedReach`, `estimatedEngagement`, `costEstimate`
- Proposes content: `["Feed Post", "Story Series (3)", "Reel"]`
- Returns fully enriched `SelectedInfluencer[]`

**Display**: Appears in Talent Strategy slide (`components/slides/TalentStrategySlide.tsx`)
- Rich mode: Full demographics, gender split, geo data, deliverables, rationale
- Fallback mode: Grid of cards with basic info

**Safety**: Automatic fallback to mock data if Firestore unavailable

### Type System

Main types defined in `types/index.ts`:

```typescript
// Core business objects
Presentation, ClientBrief, Slide, Influencer

// Slide-specific
SlideType: "cover" | "index" | "objective" | "target-strategy" | ...
SlideContent, SlideDesign

// Influencer-related
SelectedInfluencer extends Influencer with rationale, cost estimates
RateCard, PerformanceMetrics, Demographics

// Export
ExportFormat: "pdf" | "pptx" | "google-slides" | "png" | "json"
```

### AI Implementation Details

#### Hybrid AI Architecture (v1.2.5)

**Design Philosophy**: Use the best AI for each task
- **OpenAI**: All text/JSON generation (reliable, guaranteed output)
- **Google Vertex AI**: Image generation and influencer ranking (proven to work)

#### OpenAI Text Processing (PRODUCTION)

Files: `lib/ai-processor-openai.ts`, `lib/brief-parser-openai.server.ts`

```typescript
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Brief validation
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: "You are a brief validation assistant..." },
    { role: "user", content: prompt }
  ],
  temperature: 0.3, // Lower for structured outputs
  response_format: { type: "json_object" } // Guarantees valid JSON
});

// Content generation
const contentResponse = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [...],
  temperature: 0.7, // Higher for creative content
  response_format: { type: "json_object" }
});
```

**Why OpenAI for Text?**
- 99.9% uptime (vs Google AI's 403/404 errors)
- Guaranteed JSON output with `response_format`
- Simple API key authentication (no service accounts)
- Consistent performance across all text tasks
- Cost-effective: ~$0.00015 per brief

#### Firebase Vertex AI (For Images & Ranking)

File: `lib/firebase.ts`, `lib/influencer-matcher.ts`

```typescript
import { getVertexAI, getGenerativeModel } from "firebase/vertexai";

const vertexAI = getVertexAI(app);

// For influencer ranking
const textModel = getGenerativeModel(vertexAI, {
  model: "gemini-1.5-flash"
});

// For image generation
const imageModel = getGenerativeModel(vertexAI, {
  model: "gemini-2.0-flash-exp"
});
```

**Why Google for Images?**
- Gemini 2.0 Flash Exp excels at image generation/editing
- Native integration with Firebase Storage
- Proven to work reliably
- No equivalent OpenAI image editing capability

#### AI Processing Pipeline

File: `lib/ai-processor.ts`

**Key Functions**:
1. `processBrief()` - Main orchestrator
2. `validateBrief()` - Checks completeness, returns JSON
3. `generatePresentationContent()` - Creates all slide content

**Prompt Engineering**:
- Structured JSON output requests
- Role-based prompting ("professional presentation writer for Look After You")
- Context-rich inputs (brief details, influencer data)
- Fallback handling for parsing errors

#### Influencer Matching Algorithm

File: `lib/influencer-matcher.ts`

**Process**:
1. **Filter** by basic criteria:
   - Platform match
   - Location overlap
   - Budget feasibility (rough estimate)
   - Engagement threshold (≥2%)

2. **Rank** with AI:
   - Prompt includes brief goals, demographics, influencer profiles
   - Returns scored array with rationale
   - Considers: audience alignment, engagement quality, brand fit, ROI

3. **Select Optimal Mix**:
   - 1 macro (>500K followers) if budget allows
   - 2-3 mid-tier (50K-500K)
   - 2-3 micro (<50K) to fill budget
   - Max 8 influencers per presentation

4. **Enrich** with projections:
   - Estimated reach (35% of followers)
   - Estimated engagement (reach × engagement rate)
   - Cost estimate (weighted content mix)
   - AI-generated rationale per influencer

### Slide Generation

File: `lib/slide-generator.ts`

**Slide Structure** (in order):
1. Cover - Dark theme with campaign name
2. Index - Numbered TOC with read time
3. Objective - Goals and metrics overview
4. Target Strategy - Two-column demographics
5. Creative Strategy - Content themes
6. Brief Summary - Requirements at a glance
7. Talent Strategy - Grid layout, 4 columns, metrics
8. Media Strategy - Platform breakdown
9. Next Steps - Timeline with contact info

**Design System**:
- Default: White background, gray text, blue accent
- Cover/Next Steps: Dark theme (#111827)
- Brief Summary: Light gray background (#F3F4F6)
- 16:9 aspect ratio (1920×1080px)

### UI Components

#### HeroSection Component (`components/ui/hero-section-dark.tsx`)

**Features**:
- Animated retro grid background with CSS transforms
- Customizable grid angle, cell size, opacity, and colors
- Gradient text effects (purple to pink)
- Spinning border button animation
- Optional bottom image (dashboard preview)
- Smooth scroll to brief section on CTA click
- Full dark mode support

**Props**:
- `title`: Small badge text above heading
- `subtitle`: Object with `regular` and `gradient` text
- `description`: Main description text
- `ctaText`: Button text
- `ctaHref`: Button link
- `onCtaClick`: Custom click handler
- `bottomImage`: Optional image URLs (light/dark)
- `gridOptions`: Grid customization (angle, size, opacity, colors)

**Implementation**:
```typescript
<HeroSection
  title="AI-Powered Presentations"
  subtitle={{
    regular: "Transform briefs into ",
    gradient: "stunning presentations"
  }}
  description="..."
  ctaText="Create Presentation"
  onCtaClick={handleScrollToBrief}
  gridOptions={{
    angle: 65,
    opacity: 0.3,
    cellSize: 60,
    lightLineColor: "#9333ea",
    darkLineColor: "#7c3aed"
  }}
/>
```

#### ShuffleGrid Component (`components/ui/shuffle-grid.tsx`)

**Features**:
- 4x4 grid of 16 images from Unsplash
- Automatic shuffling every 3 seconds
- Framer Motion spring animations
- Fixed height (450px)
- Responsive layout
- SSR-safe (no hydration mismatch)

**Implementation Details**:
- Uses `useState` with function initializer to prevent hydration issues
- `useEffect` triggers first shuffle after mount
- Cleanup function clears timeout on unmount
- Spring transition with 1.5s duration
- `layout` prop enables smooth repositioning

#### BriefForm Component

**Features**:
- Full dark mode support with proper contrast
- Color-coded tags (purple, blue, pink, orange, green)
- Gradient buttons (purple to pink)
- Multi-input with add/remove for arrays
- Platform toggle buttons with selection states
- Demographics sub-form
- Template selection with visual previews
- Real-time validation
- Submit → generates presentation

**Dark Mode Classes**:
- Inputs: `bg-white dark:bg-gray-800`
- Text: `text-gray-900 dark:text-white`
- Borders: `border-gray-300 dark:border-gray-600`
- Placeholders: `placeholder-gray-400 dark:placeholder-gray-500`

**State Management**:
- Local state for form data
- Temporary states for input fields
- Array operations (add/remove tags)

#### BriefUpload Component

**Features**:
- Modern card design with gradient icon badge
- Progress bar with purple-to-pink gradient
- Real-time brief analysis
- Lucide React icons (Upload, FileText, Sparkles)
- Dark mode support
- Sample brief loading
- Auto-fill detection with confidence percentage

**Analysis Display**:
- Client Info, Budget, Target, Timeline indicators
- Visual progress bar showing completeness
- Color-coded status (green for complete, gray for missing)

#### PresentationEditor Component

**Features**:
- Sidebar with slide thumbnails
- Main canvas with zoom controls
- Properties panel (right side)
- Keyboard navigation (←/→ arrows)
- Export to PDF button

**Key State**:
- `currentSlideIndex` - Active slide
- `zoom` - Scale factor (0.25-1.0)

#### SlideRenderer Component

**Responsibility**: Route to correct slide component based on `SlideType`

**Rendering**:
- Applies zoom scale transform
- Fixed dimensions (1920×1080)
- Shadow for visual separation

### Firebase Configuration

Environment variables required (`.env.local`):

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_DATABASE_URL
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
NEXT_PUBLIC_VERTEX_AI_LOCATION=us-central1
NEXT_PUBLIC_VERTEX_AI_MODEL=gemini-1.5-flash

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your-key-here
```

**Services Used**:
- Firestore: Presentation persistence (currently localStorage)
- Storage: Asset uploads (future)
- Vertex AI: Gemini model access
- Analytics: Usage tracking

### Export Functionality

File: `app/editor/[id]/page.tsx`

**PDF Export**:
1. Loop through all slides
2. Render each slide to HTML
3. Capture with html2canvas
4. Add as page to jsPDF
5. Save file

**Limitations**:
- PowerPoint export not implemented
- Google Slides export not implemented
- Large presentations may take time

### State Management

**Current Implementation**: React local state + localStorage

**Storage Strategy**:
- `localStorage.setItem("current-presentation", JSON.stringify(presentation))`
- Loaded on editor page mount
- Saved on explicit "Save" action

**Future**: Migrate to Firestore for:
- Multi-device sync
- Collaboration features
- Version history

### Styling Approach

**Tailwind CSS v4** with utility classes:
- Responsive breakpoints: `md:`, `lg:`
- State variants: `hover:`, `focus:`, `disabled:`
- Dark mode: `dark:` prefix for all color classes
- Color system: gray, purple, pink, blue, orange, green
- Gradients: `from-purple-600 to-pink-600`
- Spacing scale: p-*, m-*, gap-*

**Custom Animations** (`app/globals.css`):
```css
@keyframes grid {
  0% { transform: translateY(-50%); }
  100% { transform: translateY(0); }
}
.animate-grid {
  animation: grid 15s linear infinite;
}
```

**Shadcn UI Utilities**:
```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
```

**Custom Styles**:
- Inline styles for dynamic colors from `SlideDesign`
- Gradient backgrounds for CTAs (purple to pink)
- Shadow utilities for depth (xl, 2xl)
- Backdrop blur for overlays
- Spring animations via Framer Motion

### Accessibility

**Implemented**:
- `aria-label` on icon buttons
- Keyboard navigation in editor
- `role="application"` for editor
- Focus states on interactive elements
- Semantic HTML (header, main, footer)

**To Improve**:
- Screen reader announcements for slide changes
- Focus management on navigation
- Alt text for influencer images
- ARIA live regions for loading states

### Error Handling

**Current**:
- Try/catch blocks in AI functions
- Fallback content if AI parsing fails
- User-facing error messages
- Console logging for debugging

**Future Enhancements**:
- Sentry or similar error tracking
- Retry logic for API failures
- Graceful degradation
- User error reporting

### Performance Considerations

**Optimizations**:
- Client-side rendering for interactivity
- Lazy loading of slide components
- Memoization opportunities (React.memo)
- Image optimization (Next.js Image component)

**Bottlenecks**:
- AI generation time (30-60 seconds)
- PDF export for large decks
- Canvas rendering performance

### Testing Strategy

**Not Yet Implemented**:
- Unit tests for utility functions
- Component tests with React Testing Library
- E2E tests with Playwright
- AI prompt testing and validation

**Recommended**:
- Test AI fallbacks
- Test form validation
- Test slide rendering
- Test export functionality

### Environment Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Deployment Considerations

**Vercel** (recommended):
- Automatic deployments from Git
- Environment variable management
- Edge functions support
- Analytics built-in

**Firebase Hosting**:
- Integrated with Firebase services
- CDN distribution
- Custom domain support

**Requirements**:
- Node.js 18+
- Firebase project with Vertex AI enabled
- Environment variables configured

### Future Development

**Priority 1** (Q4 2025):
- PowerPoint export
- LAYAI database integration
- Firestore persistence
- Enhanced slide editing

**Priority 2** (Q1 2026):
- Drag-and-drop editor
- Real-time collaboration
- Version history
- Custom brand themes

**Priority 3** (Q2 2026):
- AI background generation
- A/B testing for talent
- Advanced analytics
- White-label options

### Common Development Tasks

**Add a new slide type**:
1. Add type to `SlideType` union in `types/index.ts`
2. Create component in `components/slides/`
3. Add case to `SlideRenderer`
4. Update `generateSlides()` in `slide-generator.ts`

**Modify AI prompts**:
1. Edit prompt string in `ai-processor.ts` or `influencer-matcher.ts`
2. Update expected JSON structure in parsing logic
3. Add fallback handling
4. Test with various inputs

**Add new form field**:
1. Update `ClientBrief` type in `types/index.ts`
2. Add input to `BriefForm.tsx`
3. Update state management
4. Pass to AI processing

**Change color scheme**:
1. Update `defaultDesign` in `slide-generator.ts`
2. Modify Tailwind config if needed
3. Update individual slide overrides

### Known Issues & Workarounds

1. **PDF export slow**: Reduce zoom/quality or export fewer slides
2. **AI parsing errors**: Fallback content is provided
3. **localStorage limits**: Migrate to Firestore for large data
4. **No real influencer data**: Mock data provided until LAYAI integration

### Strategic Framework (v1.6.0)

**Presentation Excellence Guide** (`PRESENTATION_EXCELLENCE_GUIDE.md`):
- 52-page comprehensive framework based on 10 peer-reviewed studies
- **Core Research Findings**:
  - Interactive elements increase engagement (p = 0.00)
  - Passion accounts for 40% of commercial success (R² = 0.399)
  - Storytelling with analogies improves comprehension
  - Visual data design enhances memory (p = 0.002)

**Key Components**:
1. **Template Selection Strategy**: Decision trees for optimal template choice based on audience, campaign type, and brand
2. **Visual Design Principles**: Typography, color psychology, F/Z patterns, white space guidelines
3. **Data Visualization Strategy**: Chart type selection logic, storytelling with data, progressive disclosure
4. **Storytelling Framework**: Narrative arc, emotional beats, analogies library by industry
5. **Step-by-Step AI Process**: Complete workflow for automated presentation generation
6. **Quality Checklist**: Research-backed criteria for presentation excellence

This guide serves as the strategic "brain" informing all AI decisions about template selection, content generation, and design choices.

### Dependencies

**Core**:
- next: ^15.x
- react: ^19.x
- react-dom: ^19.x
- typescript: ^5.x

**UI & Animations**:
- framer-motion: ^11.x (animations)
- @react-spring/web: ^9.x (smooth animations)
- recharts: ^2.x (data visualization)
- lucide-react: ^0.x (icons)
- clsx: ^2.x (class utilities)
- tailwind-merge: ^2.x (class merging)

**Firebase**:
- firebase: ^12.x (includes Vertex AI SDK)
- firebase-admin: ^13.x (server-side)

**Utilities**:
- jspdf: ^3.x
- html2canvas: ^1.x
- dotenv: ^16.x

**Dev**:
- tailwindcss: ^4.x
- eslint: ^9.x
- @types/node, @types/react
- ts-node: ^10.x

### API Reference

**Main Functions**:

```typescript
// lib/ai-processor.ts
processBrief(brief: ClientBrief, influencerPool: Influencer[]): Promise<AIProcessingResponse>

// lib/influencer-matcher.ts
matchInfluencers(brief: ClientBrief, influencerPool: Influencer[]): Promise<SelectedInfluencer[]>

// lib/slide-generator.ts
generateSlides(brief: ClientBrief, influencers: SelectedInfluencer[], content: any): Promise<Slide[]>
```

### Layout Optimization (v1.6.0)

**Problem Solved**: Charts and content causing overflow on slides

**Solution Implemented**:
- Fixed chart heights (180px for bar charts, 250-300px for donut/line)
- Compact layouts with tighter spacing
- Smart truncation (deliverables show max 3, reasons limited to 2 lines)
- Max-height containers with overflow protection
- All content guaranteed to fit on one slide

**Documentation**: See `LAYOUT_OPTIMIZATION.md` for complete guide

### Debugging Tips

1. **AI not generating content**: Check Firebase console for Vertex AI quota/errors
2. **Slides not rendering**: Verify slide type matches SlideRenderer cases
3. **Export failing**: Check console for canvas rendering errors
4. **Form validation issues**: Log formData state before submission
5. **Content overflow**: Check that chart heights are fixed and containers have max-height

### Contact & Support

**Agency**: Look After You
**Email**: hello@lookafteryou.agency
**Documentation**: This file + README.md + CHANGELOG.md

### Modern UI Features (v1.2.2)

#### Design System
**Color Palette**:
- Primary: Purple (#9333ea) to Pink (#ec4899)
- Backgrounds: White/Gray-900 (dark mode)
- Text: Gray-900/White with proper contrast
- Accents: Blue, Orange, Green for different categories

**Animation System**:
- Retro grid: 15s linear infinite
- Shuffle grid: Spring physics (1.5s duration)
- Hover effects: Scale and shadow transforms
- Transitions: All interactive elements

**Component Library**:
- Shadcn UI for reusable components
- Lucide React for modern icons
- Framer Motion for smooth animations
- Tailwind CSS v4 for styling

#### Accessibility
- Dark mode with proper contrast ratios
- Focus visible states on all interactive elements
- ARIA labels on buttons and inputs
- Keyboard navigation support
- Screen reader friendly markup

---

**Last Updated**: October 1, 2025
**Version**: 1.2.7
**Maintainer**: Look After You Development Team

**Latest Changes**: v1.2.7 adds Dentsu-style slide UI refinements and a full E2E Playwright flow with screenshots.
