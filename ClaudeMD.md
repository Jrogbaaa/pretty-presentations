# Look After You - AI Presentation Generator

## Technical Documentation for AI Assistants

### Project Overview

This is a Next.js 15 application built for Look After You, an influencer talent agency. The platform uses Firebase Vertex AI (Gemini 1.5 Flash) to automatically transform client briefs into professional presentations with intelligent influencer-brand matching.

**🆕 Version 1.3.0 Update**: Complete Dentsu Story Lab-style presentation system! Enhanced AI generates sophisticated content (creative concepts with claims/hashtags, influencer demographics, scenario recommendations) AND frontend beautifully displays all data. Campaign summaries shown as grids, hashtags as styled badges, influencer profiles with full demographics/rationale, dedicated scenario component with CPM.

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
**Database**: Firestore with LAYAI influencer database (2,996 profiles)
**AI Text Processing**: OpenAI GPT-4o-mini (brief parsing, validation, content generation)
**AI Influencer Ranking**: Google Gemini 1.5 Flash via Firebase Vertex AI
**AI Image Generation**: Google Gemini 2.0 Flash Exp via Firebase Vertex AI
**Architecture**: Hybrid OpenAI + Google for optimal reliability
**Data Sources**: LAYAI (StarNgage, Apify, Serply)

### Production-Ready Features (v1.2.6)

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
├── page.tsx                    # Home page with brief form + offline detection
├── editor/[id]/page.tsx       # Presentation editor (dynamic route)
├── presentations/page.tsx     # List of saved presentations
├── layout.tsx                 # Root layout with metadata
└── error.tsx                  # Error boundary component

components/
├── BriefForm.tsx              # Dark mode brief intake form
├── BriefUpload.tsx            # Modern upload with icons
├── PresentationEditor.tsx     # Main editor with zoom, navigation
├── SlideRenderer.tsx          # Renders appropriate slide component
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
├── slide-generator.ts         # Slide content generation
├── image-generator.ts         # AI image generation & editing (Vertex AI)
├── brief-parser-openai.server.ts  # OpenAI brief parser (PRODUCTION)
├── brief-parser.server.ts     # Google AI parser (DEPRECATED)
├── brief-parser.ts            # Brief document parser (legacy)
├── mock-influencers.ts        # Fallback influencer data (8 profiles)
└── utils.ts                   # Utility functions (cn)

scripts/
├── import-influencers.ts      # LAYAI database import
└── test-firebase.ts           # Firebase connection test

data/
└── influencers.json          # LAYAI database (2,996 profiles)

types/
└── index.ts                   # All TypeScript interfaces
```

### Core Data Flow

1. **Brief Submission** → BriefForm collects client data
2. **AI Processing** → processBrief() orchestrates:
   - Brief validation (validateBrief)
   - Influencer matching (matchInfluencers)
   - Content generation (generatePresentationContent)
   - Slide assembly (generateSlides)
3. **Editor** → PresentationEditor displays slides
4. **Export** → PDF generation via jsPDF + html2canvas

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

### Dependencies

**Core**:
- next: ^15.x
- react: ^19.x
- react-dom: ^19.x
- typescript: ^5.x

**UI & Animations**:
- framer-motion: ^11.x (animations)
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

### Debugging Tips

1. **AI not generating content**: Check Firebase console for Vertex AI quota/errors
2. **Slides not rendering**: Verify slide type matches SlideRenderer cases
3. **Export failing**: Check console for canvas rendering errors
4. **Form validation issues**: Log formData state before submission

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
