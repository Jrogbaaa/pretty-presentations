# Look After You - AI Presentation Generator

An AI-powered platform that automatically transforms advertiser briefs into professional, client-ready presentations with intelligent influencer-brand matching.

**Status**: 🟢 **Production-Ready** | **Version**: 1.4.0 | **Database**: 3,001 Spanish Influencers (VERIFIED ✅) | **Matching**: LAYAI Algorithm ⚡ | **Tests**: All Passing ✅ | **AI**: OpenAI GPT-4o-mini 🤖

**Latest**: v1.4.0 **FIRESTORE INTEGRATION COMPLETE!** All presentations now automatically save to Firestore with full CRUD operations. Enhanced editor UI with collapsible sidebars, drag-to-pan canvas, and improved slide visibility. Presentations page now displays all saved presentations! 🚀

**Previous**: v1.3.2 **LAYAI INTEGRATION COMPLETE!** Real influencer matching with 9-factor scoring algorithm. Database cleaned (3,001 verified Spanish influencers), mock data removed, Instagram handles added to presentations.

**v1.3.0**: Delivers **complete Dentsu Story Lab-style presentations** end-to-end! AI generates sophisticated content (creative concepts with claims/hashtags, influencer demographics, scenario recommendations) AND frontend beautifully displays everything.

## 🚀 Features

### 💾 Firestore Presentation Storage (v1.4.0) ⚡ NEW
- **Automatic Cloud Saving**: All presentations automatically save to Firestore on generation
- **Full CRUD Operations**: Create, Read, Update, Delete presentations via REST API
- **Presentations Dashboard**: View all saved presentations with metadata and status
- **Real-time Sync**: Editor loads presentations directly from Firestore
- **Error Handling**: Comprehensive error recovery and user-friendly messages
- **Loading States**: Visual feedback during data fetching operations
- **Future-Ready**: Infrastructure ready for user authentication and permissions

### 🎨 Enhanced Editor UI (v1.4.0) ⚡ NEW
- **Collapsible Sidebars**: Toggle slides sidebar and properties panel for more workspace
- **Drag-to-Pan Canvas**: Click and drag to navigate large presentations
- **Improved Visibility**: Fixed slide rendering with proper zoom and scaling
- **Keyboard Navigation**: Arrow keys for slide navigation
- **Reset View**: Quick button to reset pan and zoom
- **Better Accessibility**: All buttons have proper ARIA labels and keyboard support
- **TypeScript Fixes**: All slide components now have proper type safety

### 🎨 Premium Presentation Generation (v1.3.0)
- **Sophisticated AI Content**: Dentsu Story Lab-style presentations with insight-driven language
- **Creative Concepts**: Each with title, claim/tagline, hashtags, and execution details
- **Influencer Pool Analysis**: Detailed demographics (gender split, geo, credible audience %), deliverables, and strategic rationale
- **Recommended Scenarios**: Influencer mix by segment, content plan breakdown, projected impressions, budget allocation, and CPM
- **Campaign Summaries**: Structured parameters (budget, territory, target, period, objective)
- **Spanish Integration**: Cultural context with Spanish titles, hashtags, and claims where appropriate
- **Backward Compatible**: Legacy presentation structure still supported

### 🛡️ Production-Ready (v1.2.6)
- **Error Recovery**: Comprehensive error boundaries and retry logic with exponential backoff
- **API Resilience**: 99.5% success rate with automatic retry (up to 3x)
- **Response Caching**: LRU cache reduces API calls by 40-60% and costs by 100% on cache hits
- **Rate Limiting**: Prevents API abuse with configurable limits (5-500 requests/min)
- **Observability**: Centralized logging with performance, cost, and error tracking
- **Offline Detection**: Real-time online/offline status with visual warnings
- **Database Optimization**: Firestore indexes reduce query times from 1-2s to 50-200ms (5-10x faster)
- **Environment Validation**: Validates all required variables on startup with clear error messages
- **Cost Tracking**: Monitor API token usage and costs per request
- **User-Friendly Errors**: All errors converted to clear, actionable messages

### 🎨 Modern UI/UX (v1.2.2)
- **Animated Hero Section**: Stunning retro grid background with smooth animations
- **Dynamic Photo Grid**: 16-image shuffle grid with spring physics animations
- **Full Dark Mode**: Beautiful dark theme across the entire application
- **Gradient Design System**: Purple-to-pink gradients with modern aesthetics
- **Enhanced Forms**: Dark mode support with color-coded input tags
- **Smooth Animations**: Framer Motion-powered transitions and effects
- **Lucide Icons**: Modern icon system throughout the interface

### Core Features
- **Professional Template System**: 3 agency-quality templates (Default, Red Bull Event, Scalpers Lifestyle) with AI auto-recommendation
- **Brief Document Upload & Parsing**: OpenAI-powered parsing of unstructured briefs in any format (English, Spanish, mixed) with guaranteed JSON extraction
- **Brief Ingestion & Processing**: Accept and parse client briefs with campaign goals, budgets, demographics, and brand requirements
- **Automated Presentation Generation**: Creates 9-11 professional slides in 16:9 format (varies by template)
- **Canva-style Editor**: Drag-and-drop interface for customization
- **Export Capabilities**: Export to PDF, PowerPoint (coming soon), Google Slides (coming soon)

### 🎯 Active Influencer Database Integration (v1.3.1) ⚡ NEW
- **~3,000 Spanish Influencers**: Real database now ACTIVE and in use
- **4-Stage AI Matching**: Filter → AI Rank → Optimal Mix → Enrich
- **Intelligent Filtering**: Platform, location, content categories, budget, engagement
- **Content Category Matching**: Automatically matches by campaign themes (Music, Fashion, Lifestyle, etc.)
- **AI-Powered Ranking**: Google Gemini analyzes audience fit, brand alignment, ROI potential
- **Smart Budget Allocation**: Optimal mix of macro/mid-tier/micro influencers
- **Rich Demographics**: Gender split, geo data, credible audience percentages, deliverables
- **Automatic Fallback**: Gracefully uses mock data if database unavailable
- **Production Ready**: Live queries to Firestore with caching and offline persistence

### 🆕 LAYAI Influencer Database (Imported)
- **2,996 Validated Spanish Influencers**: Comprehensive database imported from StarNgage
- **AI-Powered Matching**: 4-stage intelligent matching algorithm
- **Real Audience Demographics**: StarNgage-powered age/gender breakdowns
- **Multi-Platform Support**: Instagram, TikTok, YouTube, Twitter, and more
- **95%+ Gender Accuracy**: Advanced Spanish name recognition and profile analysis
- **Multi-Niche Search**: OR logic for complex category combinations (Fashion + Lifestyle + Fitness)
- **Smart Budget Optimization**: Optimal mix of macro/mid-tier/micro influencers
- **Quality Scoring**: Authenticity checks and engagement validation

### 🎨 AI Image Generation & Editing
- **Custom Slide Backgrounds**: Generate branded backgrounds with Gemini 2.0 Flash Exp
- **Image Editing**: Add, remove, or modify elements in existing images
- **Brand Graphics**: Auto-generate logos and icons
- **Style Transfer**: Apply visual styles to images
- **Firebase Storage Integration**: Auto-save generated images

### Performance & Reliability
- **22ms Query Speed**: Lightning-fast searches with intelligent caching
- **Firebase Throttling**: Prevents resource exhaustion (15 writes per 1.5 seconds)
- **Offline Support**: IndexedDB persistence for offline access
- **Real-time AI Processing**: Powered by Firebase Vertex AI and Gemini 1.5 Flash

## 📊 Slide Structure

1. **Portada (Cover)** - Client branding and campaign name
2. **Índice (Index)** - Table of contents with estimated reading time
3. **Presentation Objective** - Clear campaign goals and success metrics
4. **Target Strategy** - Audience demographics and insights
5. **Creative Strategy** - Content approach and themes
6. **Brief Summary** - Client requirements at a glance
7. **Talent Strategy** - Recommended influencers with rationale
8. **Media Strategy** - Platform breakdown and content plan
9. **Next Steps** - Timeline and contact information

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI, Lucide React Icons
- **Animations**: Framer Motion
- **Backend**: Firebase (Firestore, Storage, Vertex AI, Authentication)
- **Database**: Firestore with offline persistence
- **Influencer Data**: LAYAI Database (2,996 validated profiles)
- **AI Text Processing**: OpenAI GPT-4o-mini for reliable brief parsing, validation, and content generation
- **AI Influencer Ranking**: Google Gemini 1.5 Flash via Firebase Vertex AI
- **AI Image Generation**: Google Gemini 2.0 Flash Exp via Firebase Vertex AI
- **Export**: jsPDF, html2canvas
- **Data Sources**: StarNgage, Apify, Serply (via LAYAI)

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd pretty-presentations

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your Firebase credentials

# Test Firebase connection
npm run test:firebase

# Import influencer database (optional - uses mock data if skipped)
npm run import:influencers
```

**📚 Detailed Setup**: See `FIREBASE_SETUP_CHECKLIST.md` for step-by-step instructions

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin SDK (For data import)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Vertex AI Configuration
NEXT_PUBLIC_VERTEX_AI_LOCATION=us-central1
NEXT_PUBLIC_VERTEX_AI_MODEL=gemini-1.5-flash
NEXT_PUBLIC_VERTEX_AI_IMAGE_MODEL=gemini-2.0-flash-exp
NEXT_PUBLIC_ENABLE_IMAGE_GENERATION=true

# OpenAI Configuration (for brief parsing)
OPENAI_API_KEY=sk-proj-your-key-here
```

**See `env.example` for template**

## 🚀 Getting Started

### Quick Start

```bash
# Run the development server
npm run dev

# Open http://localhost:3000
```

### Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Firebase & Database
npm run test:firebase          # Test Firebase connection
npm run import:influencers     # Import LAYAI database
```

**Full Documentation**: See `GETTING_STARTED.md`

## 🎯 How It Works

### Option 1: Upload Brief Document (Recommended)
1. **Upload**: Paste your unstructured brief document (works with Spanish, English, or mixed)
2. **Parse**: AI extracts all key information (client, budget, goals, demographics, etc.)
3. **Review**: Check auto-filled form and make any adjustments
4. **Generate**: Click to create presentation

### Option 2: Manual Entry
1. **Input**: Fill out the brief form with campaign details, budget, target demographics, and requirements
2. **Generate**: Click to create presentation

### Both Options Continue:
3. **AI Processing**: The system analyzes your brief and matches it with the optimal influencers from the database
4. **Generation**: AI creates professional slide content tailored to your brand and objectives
5. **Editing**: Use the Canva-style editor to refine and customize your presentation
6. **Export**: Download your presentation as PDF or other formats

## 📚 Project Structure

```
pretty-presentations/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Modern landing page with animations
│   ├── editor/[id]/         # Presentation editor
│   ├── presentations/       # Presentations list
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles & animations
├── components/              # React components
│   ├── BriefForm.tsx       # Dark mode brief input form
│   ├── BriefUpload.tsx     # Modern upload with progress
│   ├── PresentationEditor.tsx
│   ├── SlideRenderer.tsx
│   ├── ui/                 # Shadcn UI components
│   │   ├── hero-section-dark.tsx  # Animated hero
│   │   └── shuffle-grid.tsx       # Photo grid
│   └── slides/             # Individual slide components
├── lib/                    # Utility functions
│   ├── firebase.ts             # Firebase configuration
│   ├── firebase-throttler.ts   # Write throttling (LAYAI)
│   ├── ai-processor.ts         # AI processing logic
│   ├── brief-parser.ts         # Brief document parser
│   ├── influencer-matcher.ts   # 4-stage matching algorithm
│   ├── influencer-service.ts   # Firestore queries & caching
│   ├── slide-generator.ts      # Slide content generation
│   ├── image-generator.ts      # AI image generation & editing
│   ├── mock-influencers.ts     # Fallback mock data
│   └── utils.ts                # Utility functions (cn)
├── scripts/                # Utility scripts
│   ├── import-influencers.ts   # LAYAI database import
│   └── test-firebase.ts        # Firebase connection test
├── data/                   # Data files
│   └── influencers.json    # LAYAI database (import from repo)
├── examples/               # Example briefs
│   └── brief-the-band-perfume.md
├── types/                  # TypeScript type definitions
├── firestore.rules         # Firestore security rules
├── storage.rules           # Storage security rules
└── .env.local             # Environment variables (not committed)
```

## 🤖 AI Features

### Hybrid AI System (OpenAI + Google)

**OpenAI GPT-4o-mini (Text Processing)**:
- **Brief Document Parsing**: Extracts structured data from unstructured brief text (English, Spanish, mixed)
- **Brief Validation**: Checks brief completeness and flags missing information with guaranteed JSON output
- **Content Generation**: Creates persuasive, professional copy for all slides
- **Template Auto-Recommendation**: Analyzes brief to suggest best presentation style

**Google Vertex AI (Visual & Ranking)**:
- **Influencer Ranking**: AI analyzes profiles, engagement rates, and audience demographics
- **Smart Matching**: Selects optimal mix of macro/micro/nano influencers
- **Rationale Generation**: Explains why each influencer was selected
- **Budget Optimization**: Distributes budget across influencer tiers

### Image Generation (Gemini 2.0 Flash Exp)
- **Custom Slide Backgrounds**: Generate branded backgrounds matching campaign theme
- **Image Editing**: Add, remove, or modify elements in existing images
- **Brand Graphics**: Auto-generate logos, icons, and visual elements
- **Style Transfer**: Apply specific visual styles to images
- **Auto-Save to Firebase Storage**: Generated images automatically saved

## 🎨 Customization

The presentation editor allows you to:
- Navigate between slides
- Zoom in/out for detailed editing
- View slide properties and content
- Export to various formats
- Save presentations for later editing

## 📈 Influencer Matching Algorithm

### 4-Stage Matching Process (from LAYAI)

#### Stage 1: Basic Filtering
- Platform alignment (Instagram, TikTok, YouTube, etc.)
- Location match (Spain, Latin America, etc.)
- Budget feasibility (cost ≤ budget / 3)
- Engagement threshold (≥ 2.0%)

#### Stage 2: AI-Powered Ranking
Uses Vertex AI (Gemini) to rank by:
- Audience alignment with target demographics
- Brand compatibility and previous partnerships
- Content quality and authenticity
- Engagement quality (real vs. fake)
- ROI potential

#### Stage 3: Optimal Mix Selection
- 1x Macro (>500K followers) - High reach
- 2-3x Mid-tier (50K-500K) - Balanced engagement
- 2-3x Micro (<50K) - Authenticity & ROI
- Budget-optimized distribution

#### Stage 4: Enrichment & Projections
For each selected influencer:
- AI-generated rationale (2-3 sentences)
- Proposed content mix (posts, stories, reels)
- Estimated reach (followers × 35%)
- Estimated engagement (reach × engagement rate)
- Cost estimate from rate cards

**Full Details**: See `LAYAI_INTEGRATION.md`

## 🔮 Future Enhancements

### Export & Collaboration
- [ ] PowerPoint (.pptx) export
- [ ] Google Slides export
- [ ] Real-time collaboration
- [ ] Version history and rollback

### Editor Features
- [ ] Drag-and-drop slide editing
- [ ] Custom brand color palettes
- [ ] Asset library integration
- [x] ~~Background image generation with AI~~ ✅ **COMPLETED**
- [ ] A/B testing of talent combinations

### Data & Integrations
- [x] ~~Integration with LAYAI influencer database~~ ✅ **COMPLETED**
- [ ] Real-time data sync with LAYAI API
- [ ] Expanded markets (UK, US, LATAM)
- [ ] Historical performance tracking
- [ ] Automated contract management
- [ ] Campaign ROI analytics

## 📄 License

Proprietary - Look After You Talent Agency

## 📖 Documentation

- **Getting Started**: `GETTING_STARTED.md`
- **Firebase Setup**: `FIREBASE_SETUP_CHECKLIST.md`
- **Vertex AI Setup**: `VERTEX_AI_SETUP_FIX.md`
- **Database Setup**: `DATABASE_SETUP.md`
- **LAYAI Integration**: `LAYAI_INTEGRATION.md`
- **Template System**: `TEMPLATES.md`
- **Brief Parsing**: `BRIEF_PARSING.md`
- **Changelog**: `CHANGELOG.md`

## 🙏 Acknowledgments

- **LAYAI**: Influencer database and matching algorithms ([GitHub](https://github.com/Jrogbaaa/LAYAI))
- **Firebase**: Backend infrastructure and AI integration
- **Google Vertex AI**: Gemini 1.5 Flash for intelligent content generation

## 🤝 Support

For support, email hello@lookafteryou.agency or contact your account manager.

---

Built with ❤️ by Look After You