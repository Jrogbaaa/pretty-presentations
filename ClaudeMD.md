# Look After You - AI Presentation Generator

## Technical Documentation for AI Assistants

### Project Overview

This is a Next.js 15 application built for Look After You, an influencer talent agency. The platform uses Firebase Vertex AI (Gemini 1.5 Flash) to automatically transform client briefs into professional presentations with intelligent influencer-brand matching.

**🆕 Version 1.2.0 Update**: Now with AI image generation & editing capabilities using Gemini 2.0 Flash Exp, plus LAYAI database (2,996 validated Spanish influencers) and production-ready Firebase infrastructure.

### Architecture

**Framework**: Next.js 15 (App Router)
**Language**: TypeScript (strict mode)
**Styling**: Tailwind CSS
**Backend**: Firebase (Firestore, Storage, Vertex AI, Authentication)
**Database**: Firestore with LAYAI influencer database (2,996 profiles)
**AI Text Model**: Google Gemini 1.5 Flash via Firebase Vertex AI
**AI Image Model**: Google Gemini 2.0 Flash Exp via Firebase Vertex AI
**Data Sources**: LAYAI (StarNgage, Apify, Serply)

### Key Directories & Files

```
app/
├── page.tsx                    # Home page with brief form
├── editor/[id]/page.tsx       # Presentation editor (dynamic route)
├── presentations/page.tsx     # List of saved presentations
└── layout.tsx                 # Root layout with metadata

components/
├── BriefForm.tsx              # Multi-step brief intake form
├── PresentationEditor.tsx     # Main editor with zoom, navigation
├── SlideRenderer.tsx          # Renders appropriate slide component
└── slides/
    ├── CoverSlide.tsx         # Cover slide (dark theme)
    ├── IndexSlide.tsx         # Table of contents
    ├── ObjectiveSlide.tsx     # Campaign objectives
    ├── TalentStrategySlide.tsx # Influencer grid with metrics
    └── GenericSlide.tsx       # Flexible slide for other types

lib/
├── firebase.ts                # Firebase initialization & config
├── firebase-throttler.ts      # Write throttling (15 writes/1.5s)
├── ai-processor.ts            # Main AI orchestration
├── influencer-matcher.ts      # 4-stage AI-powered matching
├── influencer-service.ts      # Firestore queries & caching
├── slide-generator.ts         # Slide content generation
├── image-generator.ts         # AI image generation & editing
└── mock-influencers.ts        # Fallback influencer data (8 profiles)

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

#### Firebase Vertex AI Setup

File: `lib/firebase.ts`

```typescript
import { getVertexAI, getGenerativeModel } from "firebase/vertexai";

const vertexAI = getVertexAI(app);
const model = getGenerativeModel(vertexAI, {
  model: "gemini-1.5-flash"
});
```

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

### Components

#### BriefForm Component

**Features**:
- Multi-input with add/remove for arrays
- Platform toggle buttons
- Demographics sub-form
- Real-time validation
- Submit → generates presentation

**State Management**:
- Local state for form data
- Temporary states for input fields
- Array operations (add/remove tags)

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

**Tailwind CSS** with utility classes:
- Responsive breakpoints: `md:`, `lg:`
- State variants: `hover:`, `focus:`, `disabled:`
- Color system: gray, blue, purple, green, red, yellow
- Spacing scale: p-*, m-*, gap-*

**Custom Styles**:
- Inline styles for dynamic colors from `SlideDesign`
- Gradient backgrounds for CTAs
- Shadow utilities for depth

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
- react: ^18.x
- react-dom: ^18.x
- typescript: ^5.x

**Firebase**:
- firebase: ^11.x (includes Vertex AI SDK)

**Utilities**:
- jspdf: ^2.x
- html2canvas: ^1.x

**Dev**:
- tailwindcss: ^3.x
- eslint: ^8.x
- @types/node, @types/react

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

---

**Last Updated**: September 30, 2025
**Version**: 1.0.0
**Maintainer**: Look After You Development Team
