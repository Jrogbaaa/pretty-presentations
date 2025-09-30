# Getting Started with Look After You AI Presentation Generator

## Quick Start

Your AI-powered presentation platform is now ready to use! 🚀

### 1. Start the Development Server

```bash
cd "/Users/JackEllis/Pretty Presentations/pretty-presentations"
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Create Your First Presentation

#### Option A: Upload Brief Document (Faster!)

1. **Paste Brief Text**:
   - Copy any client brief (English, Spanish, or mixed)
   - Paste into the upload box on the home page
   - Watch real-time analysis show completeness
   - Click "Load Sample" to try with The Band Perfume example

2. **Parse & Review**:
   - Click "Parse Brief & Auto-Fill Form"
   - AI extracts all information in 30-60 seconds
   - Review auto-filled form below
   - Make any adjustments needed

3. **Generate**: Click "Generate Presentation"

#### Option B: Manual Entry

1. **Fill out the Brief Form**:
   - Enter client name (e.g., "Starbucks", "Red Bull")
   - Add campaign goals (use the "Add" button or press Enter)
   - Set budget in euros
   - Define target demographics (age, gender, locations, interests)
   - Select platforms (Instagram, TikTok, YouTube, etc.)
   - Add brand requirements and content themes
   - Optional: Add timeline and additional notes

2. **Generate Presentation**:
   - Click "Generate Presentation"
   - AI will process your brief (30-60 seconds)
   - Automatic influencer matching from Spanish database
   - Professional content generation for all 9 slides

3. **Edit & Customize**:
   - Navigate between slides with arrow keys or thumbnails
   - Zoom in/out for detailed viewing
   - Review influencer selections and rationale
   - Check metrics and projections

4. **Export**:
   - Click "Export to PDF" in the editor
   - Download your professional presentation
   - Share with clients

## Project Structure

```
pretty-presentations/
├── app/                      # Next.js pages
│   ├── page.tsx             # Home page with brief form
│   ├── editor/[id]/         # Presentation editor
│   └── presentations/       # Saved presentations list
├── components/              # React components
│   ├── BriefForm.tsx       # Brief input form
│   ├── PresentationEditor.tsx
│   └── slides/             # Individual slide templates
├── lib/                    # Core logic
│   ├── firebase.ts         # Firebase & Vertex AI setup
│   ├── ai-processor.ts     # Main AI orchestration
│   ├── influencer-matcher.ts
│   └── slide-generator.ts
└── types/                  # TypeScript definitions
```

## Features Implemented

### ✅ Core Features
- ✅ **Professional template system** (NEW!) - 3 agency-quality templates with auto-recommendation
- ✅ **Brief document upload & parsing** (NEW!) - Paste any brief, auto-extract info
- ✅ Brief intake form with validation
- ✅ AI-powered brief processing
- ✅ Intelligent influencer matching
- ✅ 9-11 slide professional presentation generation (template-specific)
- ✅ Canva-style editor with zoom controls
- ✅ PDF export functionality
- ✅ Firebase Vertex AI integration (Gemini 1.5 Flash)

### 📊 Slide Types Generated
1. **Portada (Cover)** - Dark theme with branding
2. **Índice (Index)** - Table of contents
3. **Presentation Objective** - Campaign goals
4. **Target Strategy** - Audience demographics
5. **Creative Strategy** - Content approach
6. **Brief Summary** - Requirements overview
7. **Talent Strategy** - Influencer grid with metrics
8. **Media Strategy** - Platform breakdown
9. **Next Steps** - Timeline and contact info

### 🤖 AI Features
- **Template auto-recommendation** - Analyzes brief to suggest best presentation style
- **Brief document parsing** - Extracts structured data from unstructured text (English/Spanish)
- Brief validation and completeness checking
- Intelligent influencer ranking (considers audience alignment, engagement, brand fit)
- Professional copy generation for each slide
- Rationale generation for influencer selections
- Budget-optimized talent mix (macro/micro/nano)
- Reach and engagement projections

## Configuration

### Environment Variables
Your `.env.local` file is already configured with Firebase credentials:
- ✅ Firebase API keys
- ✅ Vertex AI location (us-central1)
- ✅ Gemini model (gemini-1.5-flash)

### Firebase Services Required
- **Vertex AI**: Enabled for AI generation
- **Firestore**: For presentation storage (currently using localStorage)
- **Storage**: For asset uploads (future feature)
- **Analytics**: Usage tracking

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Testing the Platform

### Sample Brief Data

**Option 1: Paste as unstructured text (try the parser!)**
```
Van a contar con un grupo de música para llevar a cabo una serie de conciertos de pop-rock bajo el sello de The band.

Presupuesto: 75k€
Territorio: Música y Lifestyle
Target: mujeres y hombres 25-65+
Periodo: octubre
Objetivo: Awareness y cobertura es un lanzamiento
```

**Option 2: Manual form entry**
```
Client: Starbucks
Goals: Increase brand awareness, Drive foot traffic to stores
Budget: 50000
Age Range: 18-35
Gender: All genders
Locations: Madrid, Barcelona, Valencia
Interests: Coffee, Lifestyle, Food
Platforms: Instagram, TikTok
```

### Expected Output
- 9 professionally designed slides
- 4-6 recommended influencers
- Detailed metrics and projections
- Total reach: ~500K-1M
- Total engagement: ~25K-50K
- Professional rationale for each selection

## Troubleshooting

### Build Issues
- ✅ All TypeScript errors resolved
- ✅ Firebase Vertex AI imports corrected
- ✅ ESLint warnings fixed

### Common Issues

**1. "Module not found" errors**
```bash
npm install
```

**2. Firebase initialization errors**
- Check `.env.local` file exists
- Verify all environment variables are set
- Ensure Vertex AI is enabled in Firebase console

**3. AI generation fails**
- Check Firebase Vertex AI quota
- Verify API keys are correct
- Check console for specific error messages

**4. PDF export slow**
- Normal for large presentations
- Reduce zoom level for faster export
- Consider exporting fewer slides for testing

## Next Steps

### Immediate Enhancements
1. **Connect LAYAI Database**: Replace mock influencers with real Spanish influencer data
2. **Firestore Integration**: Move from localStorage to cloud storage
3. **PowerPoint Export**: Implement .pptx export
4. **Drag-and-Drop Editor**: Add Canva-style editing

### Future Features
- Real-time collaboration
- Version history
- Custom brand themes
- AI background generation
- A/B testing for talent combinations
- Advanced analytics dashboard

## Support

### Documentation
- `README.md` - Full project documentation
- `CHANGELOG.md` - Version history
- `ClaudeMD.md` - Technical documentation for AI assistants
- `TEMPLATES.md` - **NEW**: Complete template system guide
- `BRIEF_PARSING.md` - Complete guide to brief parsing feature
- `examples/brief-the-band-perfume.md` - Real brief example with analysis

### Resources
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Firebase Vertex AI](https://firebase.google.com/docs/vertex-ai)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Contact
- Agency: Look After You
- Email: hello@lookafteryou.agency

---

**Built with ❤️ using Next.js 15, Firebase Vertex AI, and Gemini 1.5 Flash**

Last Updated: September 30, 2025
