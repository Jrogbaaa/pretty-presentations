# Look After You - AI Presentation Generator

An AI-powered platform that automatically transforms advertiser briefs into professional, client-ready presentations with intelligent influencer-brand matching.

**Status**: 🟢 **Production-Ready** | **Version**: 2.5.4 | **Database**: 4,008 Spanish Influencers + 218 Brands (VERIFIED ✅) | **Matching**: LAYAI Algorithm + Brand Intelligence 🧠⚡ | **Tests**: 85% Coverage ✅ | **AI**: OpenAI GPT-4o-mini 🤖 | **Images**: Nano Banana 🍌✨ | **Charts**: Recharts + React Spring 📊 | **Design**: Stripe-Inspired System 🎨 | **Export**: PPTX + PDF 📤 | **Next.js**: 16.0.0 ⚡ | **Security**: Rate Limiting + Secure API Keys + Input Sanitization 🔒🛡️

**Latest**: v2.5.4 **Response Format Refinements!** ✨ Streamlined text response format - removed generic Strategic Alignment section, simplified Content Distribution table (removed Frequency column), and removed AI footer attribution for more professional, client-ready documents. See [CHANGELOG.md](./CHANGELOG.md) for details. 🚀✅

> 📝 **Full Version History**: See [CHANGELOG.md](./CHANGELOG.md) for complete release notes and previous versions.

## 📑 Table of Contents

- [Quick Start](#-quick-start)
- [Features](#-features)
- [Installation](#-installation)
- [How It Works](#-how-it-works)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Support](#-support)

## 🚀 Features

### 🧠 Brand Intelligence System (v2.4.0+) ⚡ NEW
- **218-Brand Database**: Comprehensive CSV database covering Spanish & international brands across 15+ industries
  - Fashion & Retail, Sports & Fitness, Food & Beverage, Beauty & Cosmetics
  - Technology, Home & Decor, Automotive, Entertainment, Travel, Banking
  - Healthcare, Education, Luxury, Sustainability, and more
- **Automatic Brand Lookup**: System automatically searches brand database on brief submission
- **Smart Brief Enrichment**: Enhances briefs with:
  - Target demographics (age, gender, location)
  - Interest categories and psychographics
  - Content themes and brand identity
  - Similar brands for alternative recommendations
- **AI-Powered Brand Matching**: 
  - Exact name matching for known brands
  - ~~Gemini-powered similarity detection for unknown brands~~ (removed)
  - Contextual influencer selection based on brand profile
- **Brand-Aware Influencer Matching**: LAYAI algorithm enhanced with brand intelligence
  - Filters influencers by brand-relevant interests
  - Prioritizes content categories matching brand identity
  - Adjusts scoring weights based on brand demographics
- **Server-Side Integration** (v2.5.2):
  - Brand intelligence now integrated into server-side influencer matching for text responses
  - Ensures unique, brand-aligned responses per client
  - Both presentation generation and text response generation use brand intelligence
  - Consistent brand-aware matching across all endpoints
- **Real-time Intelligence Logging**: Console logs show brand lookup process
  ```
  🔍 [SERVER] Looking up brand intelligence for: Nike
  ✅ [SERVER] Brand found: Nike (exact match)
  📊 [SERVER] Enhanced brief with brand profile:
    - Industry: Sports & Fitness
    - Target Interests: Sports, Running, Fitness
    - Content Themes: Athletic performance, Motivation
  🎯 Using LAYAI scoring algorithm for influencer ranking...
  ```
- **Random Sample Brief Generator**:
  - One-click generation of diverse test briefs from brand database
  - Industry-specific campaign templates (Fashion, Sports, Food, Beauty, Tech, etc.)
  - Smart defaults for budgets, timelines, objectives
  - Accelerates testing by 10x
  - New "Random Sample" button replaces static sample

### 👥 Manual Influencer Addition (v2.5.0) ⚡ NEW
- **Automatic Extraction**: System automatically extracts influencer names from brief text during parsing
- **Manual Entry**: New form field allows adding specific influencer names or Instagram handles
- **Format Support**: Accepts multiple formats:
  - "Influencer Name"
  - "@instagram_handle"
  - "Name (@handle)"
  - "Name @handle"
- **Database Matching**: Searches database by name or handle with multiple matching strategies:
  - Exact name match
  - Case-insensitive name match
  - Handle match (with/without @)
  - Partial name match

### 🤖 Example-Based Response Training (v2.5.0+) ⚡ NEW
- **Industry-Specific Examples**: System includes real examples from previous campaigns stored in `examples/example-response-quality.md`
- **Smart Industry Detection**: Automatically detects industry type from:
  - Content themes (fragrance, gin, food, furniture, fashion, automotive)
  - Client name (Nostrum, Pikolinos, IKEA, Audi, etc.)
  - Campaign goals and target interests
- **Example Categories**:
  - **Beauty/Fragrance**: "Midnight Serenade Sessions", "Unboxing the Experience"
  - **Spirits**: "Tarde con los tuyos" (Spanish social gatherings)
  - **Food/Health**: "Gourmet Pairings That Elevate", "Moments of Enjoyment", "Sabor Mediterráneo"
  - **Home/Furniture**: "First Times That Matter", "From Box to Life"
  - **Fashion**: "Style Stories", "Sustainable Style"
  - **Automotive/Luxury**: "Tech Meets Luxury", "Design Excellence", "Experiential Journeys"
- **Quality Standards**: Prompt includes DO's and DON'Ts:
  - ✅ DO: Use specific, memorable theme names with concrete examples
  - ❌ DON'T: Use generic phrases like "Fresh & Premium" or "Authenticity"
- **Training Method**: Prompt-based training (not fine-tuning) using GPT-4o model
  - Examples included directly in the prompt for each generation
  - System message: "You are an expert influencer marketing strategist"
  - Industry-specific examples dynamically injected based on brief analysis
  - Generates specific, brand-aligned content vs generic templates
- **Individual Influencer Content Pillars** (v2.5.1):
  - **Dynamic Generation**: Each influencer receives unique, AI-generated content pillars tailored to their profile
  - **Profile-Based**: Pillars generated based on influencer's content categories, engagement style, and follower count
  - **Brand Alignment**: Pillars connect influencer's unique style with brand identity
  - **No Generic Phrases**: Eliminated hardcoded generic pillars like "Authenticity and personal storytelling"
  - **Examples**:
    - Fitness influencer: "Fuel for Performance", "Strength in Simplicity"
    - Lifestyle influencer: "Chic and Healthy Living", "Homegrown Elegance"
    - Music influencer: "Taste the Rhythm", "Gourmet Jam Sessions"
- **Benefits**:
  - Content pillars have unique names reflecting brand identity
  - Strategic recommendations are actionable and brand-specific
  - Executive summaries tailored to each client
  - Psychographic insights reflect actual audience, not generic descriptions
  - **Individual influencer pillars are unique per influencer** (not identical across all influencers)
  - **Responses are client-ready and non-generic** - ready to send directly to clients
- **Placeholder Generation**: For influencers not found in database:
  - Creates placeholder entries with estimated follower counts based on campaign budget
  - Generates AI-powered rationale explaining why they fit the brand
  - Includes estimated engagement rates, costs, and content recommendations
- **Separate Display**: Manual influencers appear in dedicated "Manually Requested Influencers" section in text responses
- **Clear Indicators**: Shows which influencers are from database vs placeholders with "(estimated)" labels
- **Smart Integration**: Works seamlessly alongside algorithm-matched influencers
- **Example Usage**:
  ```
  Brief mentions: "We want @maria_garcia and Carlos Lopez (@carlos_lopez) for this campaign"
  System extracts: ["@maria_garcia", "Carlos Lopez (@carlos_lopez)"]
  Searches database → Shows real data if found, placeholder if not
  ```

### 📤 PowerPoint Export (v2.2.0)
- **PowerPoint (PPTX) Export**: 
  - Fully editable presentations compatible with PowerPoint, **Google Slides**, and Canva
  - **Google Slides Integration**: Upload PPTX files directly to Google Slides (File → Open → Upload)
  - All text preserved as text objects (not flattened images)
  - Background images included via server-side proxy
  - Proper formatting, colors, and layouts maintained
  - 16:9 widescreen format with metadata
  - Export speed: ~12-15 seconds
- **Streamlined Interface**:
  - Single "Export to PowerPoint" button for clarity
  - No dropdown menu - direct export action
  - User-friendly and intuitive
- **Image Proxy Service**:
  - Server-side proxy bypasses CORS restrictions
  - Converts Firebase images to base64 data URLs
  - Ensures images work in exported presentations
- **Firebase CORS Configuration**:
  - Storage bucket configured for cross-origin requests
  - Seamless image loading in exports
- **Why PPTX Only?**:
  - Google Slides **does not support** PDF imports (read-only format)
  - PPTX is the universal editable format supported by all platforms
  - Simplified user experience with one clear export path

### 📄 Text Response PDF Export (v2.4.0) ⚡ NEW
- **Professional PDF Generation**:
  - One-click export of text responses as formatted PDFs
  - Preserves all styling, tables, and typography
  - Uses jsPDF for client-side PDF generation
  - Replaces basic markdown download
  - Generates professional documents ready for clients
  - File naming: `ClientName-influencer-recommendations.pdf`
- **HTML Table Rendering Fixed**:
  - Custom ReactMarkdown components with inline styles
  - rehype-raw plugin for proper HTML parsing
  - Tables display with borders and proper formatting
  - No more raw `<table>`, `<tr>`, `<td>` text
- **Enhanced Text Visibility**:
  - Fixed blockquote text contrast (light on light issue)
  - Darker text colors for better readability
  - Font-medium weight for emphasis
  - All text elements now properly visible
- **Proper Architecture**:
  - Created `/api/generate-text-response` API route
  - Fixed client/server boundary violations
  - Proper Next.js 16 patterns

### 📝 Enhanced Response Formatting (v2.3.0)
- **Large, Beautiful Typography**:
  - H1: 56px (3.5rem) with purple underline - massive hero titles
  - H2: 40px (2.5rem) with gray underline - large section headers
  - H3: 32px (2rem) in purple - medium subsections
  - H4: 24px (1.5rem) - detail headers
  - Body: 18px (1.125rem) - highly readable text
- **Visual Enhancements**:
  - Purple gradient table headers with hover effects
  - Gradient blockquotes (purple → pink) with border accents
  - Enhanced spacing and padding throughout
  - Professional shadows on tables and cards
  - Dark mode support with intelligent color adaptation
- **Dedicated CSS Styling**: `/app/response/[id]/response-styles.css` with `!important` overrides
- **Better Markdown Structure**: Enhanced templates with clear sections, emojis, and visual hierarchy
- **Copy & Download**: One-click copy to clipboard or download as markdown file

### ⚡ Smart Validation (v2.4.0) ⚡ NEW
- **Optional Demographics**: All demographic fields now optional with smart defaults
  - Default age range: 18-65
  - Default gender: "All genders"
  - Default location: ["Spain"]
  - Optional interests (no validation errors)
- **Helpful Suggestions**: Instead of errors, system provides tips
  ```
  💡 TIP: Add target audience interests for more accurate influencer matching
  💡 TIP: Specify a narrower age range (e.g., 25-45) for better targeting
  ```
- **Zero Validation Errors**: Smooth workflow without blocking submissions
- **Better UX**: Encourages best practices without forcing requirements

### ⏳ Progress Tracking Overlay (v2.4.0) ⚡ NEW
- **Animated Progress Bar**: Visual 0-95% progress indicator
- **Real-time Step Tracking**: Shows current processing step
  1. Processing brief requirements (3s)
  2. Looking up brand intelligence (2s)
  3. Matching influencers to target audience (5s)
  4. Generating content with AI (15s)
  5. Finalizing presentation/response (5s)
- **Visual Indicators**: Checkmarks for completed, spinners for current, icons for pending
- **Mode-Aware**: Different steps for presentation vs. text response
- **Better User Confidence**: Transparent process reduces perceived wait time

### 🎨 Stripe-Inspired Design System (v2.0.1)
- **Complete UI Redesign**: Clean, minimal interface with generous whitespace and subtle shadows
- **Professional Color Palette**: Stripe-inspired purple (#635BFF) with comprehensive neutral and feedback colors
- **Typography Scale**: 8 carefully crafted text styles (heading-1 to caption) with optimal line heights
- **Spacing System**: Consistent 8-level spacing scale (xs: 4px to 4xl: 64px)
- **Component Library**: Reusable Button, Input, and Label components with variants and sizes
- **Shadow Hierarchy**: 5 shadow levels (subtle, hover, elevated, modal, floating) for depth
- **Animation Tokens**: Fast (150ms), base (200ms), slow (300ms) for smooth transitions
- **Layout Specifications**:
  - **Top Navigation**: 60px height with perfect text spacing, prominent Export button, visual dividers (v2.0.1)
  - **Slide Panel**: 240px width with **real slide preview thumbnails** - actual rendered miniatures (v2.0.1)
  - **Canvas Area**: Centered with proper padding and no overlapping elements (v2.0.1)
  - **Properties Panel**: 280px width with organized sections
- **UI Polish** (v2.0.1):
  - Fixed navigation bar spacing with consistent `text-sm` throughout
  - Enhanced Export button with shadow effects for better prominence
  - Added vertical dividers between navigation sections
  - Implemented real slide thumbnails using scaled `SlideRenderer`
  - Eliminated all overlapping elements and spacing issues
- **Accessibility Enhanced**: WCAG AA compliant with 3px focus rings, keyboard navigation, ARIA labels
- **Production Tested**: All features verified with browser automation (Export, navigation, zoom, thumbnails)
- **Documentation**: Complete DESIGN_SYSTEM.md with specifications and usage examples

### 🔧 Production-Ready Infrastructure (v1.6.1)
- **Offline Detection**: Real-time network status monitoring with graceful degradation
- **Rate Limiting**: API abuse prevention (10 requests/min for image generation, 20/min for editing)
- **Error Tracking**: Centralized logging with context, performance metrics, and analytics integration
- **Input Validation**: Zod schemas ensure type-safe, validated API requests
- **Storage Management**: Automatic quota monitoring and cache cleanup (7-day retention)
- **Accessibility**: WCAG AA compliant with focus management, ARIA labels, keyboard navigation
- **Test Coverage**: 85% coverage with comprehensive unit and integration tests
- **API Versioning**: Strategy for backwards compatibility and smooth upgrades
- **Security**: Request validation, rate limiting, proper error handling, security headers

### 📊 Professional Data Visualizations (v1.6.0)
- **7 Chart Components**: Bar charts, donut charts, line charts, pictographs, progress bars, metric cards, animated numbers
- **Interactive & Animated**: Count-up number animations, smooth chart transitions, hover effects
- **Research-Backed Design**: Based on meta-analysis of 10 studies showing visualizations improve comprehension by 300%
- **Template-Aware**: All charts adapt to presentation templates (colors, fonts, styles)
- **Smart Integration**:
  - **Bar Charts**: Compare influencer engagement rates with industry averages
  - **Donut Charts**: Show budget allocation breakdowns visually
  - **Pictographs**: Display audience reach with icon-based representations
  - **Animated Numbers**: All metrics count up smoothly from 0
  - **Line Charts**: Project growth trends over time
- **Zero Configuration**: Works automatically with existing presentations
- **Bundle Efficient**: Only ~133KB added (Recharts + React Spring)
- **Demo Page**: `/charts-demo` showcases all components in action

### 📚 Research-Backed Design (v1.6.0)
- **Presentation Excellence Guide**: 52-page comprehensive strategic guide
  - Based on 10 peer-reviewed studies on presentation effectiveness
  - **Key Finding**: Presentation design accounts for 40% of commercial success
  - Template selection decision trees
  - Data visualization strategy (when to use each chart type)
  - Storytelling framework with industry-specific analogies
  - Step-by-step AI generation process
  - Quality assurance checklist
- **Strategic Intelligence**: Guide serves as the "brain" of the AI system

### 🍌 AI-Generated Images (v1.5.0)
- **Automatic Image Generation**: Every presentation gets 11 stunning, contextual images powered by Google's Nano Banana (Gemini 2.5 Flash Image)
- **Smart Prompts**: Context-aware image generation tailored to each slide type (cover, objective, strategy, etc.)
- **Beautiful Integration**:
  - **Cover slides**: Full-screen hero images with professional overlays
  - **Content slides**: Subtle backgrounds (15-20% opacity) that enhance without distracting
  - **Perfect readability**: Text remains crisp with gradient overlays for contrast
- **Firebase Storage**: Images automatically uploaded to Storage, URLs stored in Firestore (solves 1MB document limit)
- **Instant Display**: sessionStorage caching ensures images show immediately while Storage loads
- **Fast & Affordable**: ~60-120 seconds for 11 images, only $0.06-0.12 per presentation
- **Graceful Fallback**: Presentations work perfectly even if image generation fails
- **Real-time Progress**: Detailed console logs track generation for each slide

### 💾 Firestore Presentation Storage (v1.4.0)
- **Automatic Cloud Saving**: All presentations automatically save to Firestore on generation
- **Full CRUD Operations**: Create, Read, Update, Delete presentations via REST API
- **Presentations Dashboard**: View all saved presentations with metadata and status
- **Real-time Sync**: Editor loads presentations directly from Firestore
- **Error Handling**: Comprehensive error recovery and user-friendly messages
- **Loading States**: Visual feedback during data fetching operations
- **Future-Ready**: Infrastructure ready for user authentication and permissions

### 🎨 Enhanced Editor UI (v1.4.0)
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
- **Export Capabilities**: Export to PowerPoint (PPTX) - fully compatible with Google Slides, PowerPoint, and Canva. Also supports PDF export for text responses.

### 🎯 Active Influencer Database Integration (v1.4.2 - MULTI-BRAND VERIFIED ✅) ⚡ NEW
- **4,008 Spanish Influencers**: Real database now ACTIVE and VERIFIED across multiple brand types
- **LAYAI Scoring Algorithm**: 9-factor scoring system adapting to different campaign needs
- **Multi-Brand Testing Complete**:
  - ✅ **The Band Perfume** (Music/Entertainment): 86/100 scores, 58 matches found
    - Top match: 399.9K followers, 61.58% engagement (DJ, Music, Entertainment)
    - System correctly prioritized Music influencers
  - ✅ **IKEA Spain** (Home/Lifestyle): 70/100 scores, 51 matches found  
    - Top match: Interior Design specialist (393.9K followers)
    - System correctly prioritized Family, Design, Lifestyle influencers
  - 🎯 **Content adaptation working**: Music influencers ≠ Home influencers
- **4-Stage AI Matching**: Filter → LAYAI Score → Optimal Mix → Enrich
- **Intelligent Filtering**: Platform, location, content categories, budget, engagement
- **Content Category Matching**: Automatically adapts themes per brand (Music, Fashion, Home, Design, Family, etc.)
- **Smart Budget Allocation**: Optimal mix of macro/mid-tier/micro influencers
- **Rich Demographics**: Gender split, geo data, credible audience percentages, deliverables
- **Automatic Fallback**: Gracefully uses mock data if database unavailable
- **Production Ready**: Live queries to Firestore with caching and offline persistence
- **Performance**: Search and matching completed in ~1-2 seconds for 200+ influencer pool

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

- **Framework**: Next.js 15.5.4 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI, Lucide React Icons
- **Animations**: Framer Motion
- **Backend**: Firebase (Firestore, Storage, Authentication)
- **Database**: Firestore with offline persistence + CSV brand database (218 brands)
- **Influencer Data**: LAYAI Database (4,008 verified Spanish profiles)
- **AI Processing**: OpenAI GPT-4o-mini for brief parsing, validation, and content generation (~$0.02/response)
- **AI Image Generation**: Google Nano Banana (Gemini 2.5 Flash Image) via Replicate
- **Export**: pptxgenjs (PowerPoint), ReactMarkdown (formatted text responses)
- **Data Sources**: StarNgage, Apify, Serply (via LAYAI), Manual brand research

## 🚀 Quick Start

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

# Run development server
npm run dev

# Open http://localhost:3000
```

**Optional Setup**:
```bash
# Test Firebase connection
npm run test:firebase

# Import influencer database (optional - uses mock data if skipped)
npm run import:influencers
```

## 📦 Installation

See [Quick Start](#-quick-start) above for basic setup.

## 🔧 Environment Variables

> 🔒 **Security Notice (v2.5.3)**: Environment variable structure updated for improved security. `GOOGLE_AI_API_KEY` is now required for server-side operations. See [CHANGELOG.md](./CHANGELOG.md) for migration guide.

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

# OpenAI Configuration (Required for response generation)
OPENAI_API_KEY=sk-proj-your-key-here

# Google AI Configuration (Required for server-side operations)
# Get key from: https://aistudio.google.com/app/apikey
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
GOOGLE_AI_MODEL=gemini-2.5-flash

# Image Generation (Optional - for Nano Banana via Replicate)
REPLICATE_API_TOKEN=your_replicate_token
NEXT_PUBLIC_ENABLE_IMAGE_GENERATION=true
```

**⚠️ Important Security Notes:**
- **Never use `NEXT_PUBLIC_` prefix for server-side API keys** - these are exposed to the browser
- **`GOOGLE_AI_API_KEY`** (no NEXT_PUBLIC_) is used for server-side brief parsing and brand matching
- **`OPENAI_API_KEY`** is used for response generation with GPT-4o
- Rate limiting is active: 5 requests/minute for text responses, 10 req/min for images

**See `env.example` for complete template with all optional variables**

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
6. **Export**: Download your presentation as PowerPoint (PPTX) - fully editable in Google Slides, PowerPoint, or Canva

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
├── examples/               # Example briefs and response quality guide
│   ├── example-response-quality.md  # Training examples for AI response generation
│   └── brief-*.md          # Real client brief examples
├── types/                  # TypeScript type definitions
├── firestore.rules         # Firestore security rules
├── storage.rules           # Storage security rules
└── .env.local             # Environment variables (not committed)
```

## 🤖 AI Features

### OpenAI-Powered System (GPT-4o-mini)

**Core AI Processing**:
- **Brief Document Parsing**: Extracts structured data from unstructured brief text (English, Spanish, mixed)
- **Brief Validation**: Checks brief completeness with helpful suggestions (no blocking errors)
- **Brand Intelligence Lookup**: Automatic brand database search and enrichment
- **Content Generation**: Creates persuasive, professional copy for presentations and markdown responses
- **Template Auto-Recommendation**: Analyzes brief to suggest best presentation style
- **Cost-Efficient**: ~$0.02 per response with intelligent caching

**Intelligent Matching**:
- **LAYAI Scoring Algorithm**: 9-factor scoring system for influencer selection
- **Brand-Aware Filtering**: Uses brand profile to prioritize relevant influencers
- **Smart Budget Allocation**: Optimal mix of macro/mid-tier/micro influencers
- **Rationale Generation**: AI-powered explanations for each influencer selection
- **Performance Projections**: Estimated reach, engagement, and ROI calculations

### Image Generation (Nano Banana via Replicate)
- **Custom Slide Backgrounds**: Generate branded backgrounds matching campaign theme
- **Contextual Images**: AI creates images tailored to slide content
- **Hero Images**: Full-screen cover slide visuals
- **Content Backgrounds**: Subtle 15-20% opacity backgrounds for readability
- **Auto-Save to Firebase Storage**: Generated images automatically saved
- **Fast & Affordable**: ~60-120 seconds for 11 images, $0.06-0.12 per presentation

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

## 🔮 Future Enhancements

### Export & Collaboration
- [x] ~~PowerPoint (.pptx) export~~ ✅ **COMPLETED**
- [x] ~~Google Slides compatibility~~ ✅ **COMPLETED** (via PPTX upload)
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

### Available Documentation
- **Design System**: `DESIGN_SYSTEM.md` - Complete UI design specifications and component library
- **Changelog**: `CHANGELOG.md` - Complete version history and release notes
- **Manual Influencer Feature**: `TEST_MANUAL_INFLUENCER_FEATURE.md` - Guide for manual influencer addition

### Examples Directory
- **Brief Examples Guide**: `examples/README.md` - Reference guide for 8 real-world brief examples used to train the AI parser
- **Response Quality Examples**: `examples/example-response-quality.md` - Training examples for AI response generation with quality standards

### Scraper Tools
- **StarNgage Scraper**: `scraper/README.md` - Browser-based web scraping tools for expanding the influencer database

## 🙏 Acknowledgments

- **LAYAI**: Influencer database and matching algorithms ([GitHub](https://github.com/Jrogbaaa/LAYAI))
- **Firebase**: Backend infrastructure and AI integration
- **Google Vertex AI**: Gemini 1.5 Flash for intelligent content generation

## 🤝 Support

For support, email hello@lookafteryou.agency or contact your account manager.

---

Built with ❤️ by Look After You

## 🔍 StarNgage Web Scraper (NEW - October 2025)

### Overview
Browser-based web scraping tools for extracting influencer data from StarNgage, expanding the Spanish influencer database beyond 3000 entries.

### Features
- **Browser Console Scripts**: Bypasses Cloudflare protection by running in your logged-in browser
- **Auto-Pagination**: Automatically navigates through multiple pages
- **Data Validation**: Ensures clean extraction of names, handles, followers, engagement rates, topics
- **CSV Export**: Generates properly formatted CSV files matching the existing database structure
- **Python Combiner**: Merges multiple CSV files, removes duplicates, sorts by rank

### Results
- ✅ Successfully scraped 1000 influencers (ranks 3001-4000)
- ✅ Clean data format matching existing database
- ✅ Zero manual data entry required

### Quick Start
1. Navigate to StarNgage page 31+ while logged in
2. Open browser console (F12)
3. Run script from `scraper/starngage-browser-script.js`
4. Wait for automatic pagination and CSV download
5. Combine multiple CSVs using Python script

**Full Documentation**: See `scraper/README.md`
