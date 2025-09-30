# Look After You - AI Presentation Generator

An AI-powered platform that automatically transforms advertiser briefs into professional, client-ready presentations with intelligent influencer-brand matching.

## 🚀 Features

- **Professional Template System** (NEW!): 3 agency-quality templates (Default, Red Bull Event, Scalpers Lifestyle) with auto-recommendation
- **Brief Document Upload & Parsing**: Upload unstructured briefs in any format (English, Spanish, mixed) and automatically extract all key information
- **Brief Ingestion & Processing**: Accept and parse client briefs with campaign goals, budgets, demographics, and brand requirements
- **Intelligent Influencer Matching**: AI-powered matching algorithm using Spanish influencer database
- **Automated Presentation Generation**: Creates 9-11 professional slides in 16:9 format (varies by template)
- **Canva-style Editor**: Drag-and-drop interface for customization
- **Real-time AI Processing**: Powered by Firebase Vertex AI and Gemini 1.5 Flash
- **Export Capabilities**: Export to PDF, PowerPoint (coming soon), Google Slides (coming soon)

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
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Storage, Vertex AI)
- **AI**: Google Gemini 1.5 Flash via Firebase Vertex AI
- **Export**: jsPDF, html2canvas

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd pretty-presentations

# Install dependencies
npm install

# Set up environment variables
# Copy .env.local.example to .env.local and fill in your Firebase credentials
```

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_VERTEX_AI_LOCATION=us-central1
NEXT_PUBLIC_VERTEX_AI_MODEL=gemini-1.5-flash
```

## 🚀 Getting Started

```bash
# Run the development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

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
│   ├── page.tsx             # Home page with brief form
│   ├── editor/[id]/         # Presentation editor
│   ├── presentations/       # Presentations list
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── BriefForm.tsx       # Brief input form
│   ├── BriefUpload.tsx     # Brief document upload & parsing
│   ├── PresentationEditor.tsx
│   ├── SlideRenderer.tsx
│   └── slides/             # Individual slide components
├── lib/                    # Utility functions
│   ├── firebase.ts         # Firebase configuration
│   ├── ai-processor.ts     # AI processing logic
│   ├── brief-parser.ts     # Brief document parser
│   ├── influencer-matcher.ts
│   ├── slide-generator.ts
│   └── mock-influencers.ts # Sample influencer data
├── examples/               # Example briefs
│   └── brief-the-band-perfume.md
├── types/                  # TypeScript type definitions
└── .env.local             # Environment variables
```

## 🤖 AI Features

- **Template Auto-Recommendation**: AI analyzes brief to suggest best presentation style (Event, Lifestyle, or Default)
- **Brief Document Parsing**: Extracts structured data from unstructured brief text (English, Spanish, mixed)
- **Brief Validation**: Automatically checks brief completeness and flags missing information
- **Smart Matching**: AI analyzes influencer profiles, engagement rates, and audience demographics
- **Content Generation**: Creates persuasive, professional copy for each slide
- **Rationale Generation**: Explains why each influencer was selected
- **Budget Optimization**: Selects optimal mix of macro/micro/nano influencers

## 🎨 Customization

The presentation editor allows you to:
- Navigate between slides
- Zoom in/out for detailed editing
- View slide properties and content
- Export to various formats
- Save presentations for later editing

## 📈 Influencer Matching Algorithm

The platform considers:
- Platform alignment
- Audience demographics and location
- Engagement rates (minimum 2%)
- Budget feasibility
- Content categories
- Previous brand partnerships
- Performance metrics

## 🔮 Future Enhancements

- [ ] PowerPoint (.pptx) export
- [ ] Google Slides export
- [ ] Real-time collaboration
- [ ] Version history and rollback
- [ ] Asset library integration
- [ ] Background image generation with AI
- [ ] A/B testing of talent combinations
- [ ] Integration with LAYAI influencer database
- [ ] Drag-and-drop slide editing
- [ ] Custom brand color palettes

## 📄 License

Proprietary - Look After You Talent Agency

## 🤝 Support

For support, email hello@lookafteryou.agency or contact your account manager.

---

Built with ❤️ by Look After You