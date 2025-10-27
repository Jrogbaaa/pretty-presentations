# Pretty Presentations

A Next.js presentation builder with AI-powered slide generation and influencer database management.

## Project Structure

### 📊 Influencer Database
- **`scraper/`** - StarNgage web scraper tools
  - Browser console scripts for extracting influencer data
  - CSV combiner for merging multiple datasets
  - Successfully scraped 1000 influencers (ranks 3001-4000)
  - See `scraper/README.md` for detailed documentation

### 🎨 Presentation Tools
- **`components/`** - React components for presentation editing
  - `PresentationEditor.tsx` - Main editor interface
  - `NanoBananaPanel.tsx` - Custom panel component
  - `slides/` - Individual slide components (CoverSlide, etc.)

### 🔧 Utilities
- **`hooks/`** - Custom React hooks
  - `useImageGeneration.ts` - AI image generation hook
- **`lib/`** - Utility libraries
  - `error-tracker.ts` - Error tracking
  - `image-cache-service.ts` - Image caching
  - `rate-limiter.ts` - API rate limiting
  - `validation-schemas.ts` - Data validation
- **`types/`** - TypeScript type definitions

### 🌐 API Routes
- **`app/api/`** - Next.js API routes
  - `images/generate/` - AI image generation endpoint
  - `images/edit/` - Image editing endpoint

## Key Features

### Influencer Database Scraper
✅ **Automated Web Scraping**
- Browser console scripts bypass Cloudflare protection
- Automatic pagination through multiple pages
- Real-time progress tracking

✅ **Data Quality**
- Clean extraction of names, handles, followers, engagement rates
- Automatic duplicate removal
- Sorted by ranking

✅ **CSV Management**
- Individual page exports
- Master CSV combiner
- Compatible with existing database format

## Getting Started

### Prerequisites
- Node.js 18+
- Modern web browser (Chrome, Firefox, Safari)
- Python 3 (for CSV combining)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Using the Influencer Scraper

1. Navigate to `scraper/` directory
2. Read `scraper/README.md` for detailed instructions
3. Run browser console scripts to extract data
4. Use Python script to combine results

## Documentation

- **Scraper Documentation:** See `scraper/README.md`
- **Quick Reference:** See `QUICK_REFERENCE.md`
- **Influencer Recommendations:** See `CALZEDONIA_INFLUENCER_RECOMMENDATIONS.md`

## Technologies Used

- **Frontend:** Next.js, React, TypeScript
- **Styling:** Tailwind CSS (assumed)
- **Data Extraction:** Browser JavaScript, Python CSV processing
- **API:** Next.js API routes

## Recent Updates

### October 2025
- ✅ Built StarNgage web scraper
- ✅ Extracted 1000 influencers (ranks 3001-4000)
- ✅ Created CSV combiner script
- ✅ Comprehensive documentation

## Contributing

This is a private project. For questions or issues, contact the project owner.

## License

Private/Proprietary

