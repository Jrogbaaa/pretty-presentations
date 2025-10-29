# Brief Document Parsing Feature

## Overview

The Look After You platform now includes intelligent brief document parsing. Simply paste any unstructured brief text (in English, Spanish, or mixed languages), and AI will automatically extract all relevant information and pre-fill the form.

## How It Works

### 1. Upload Your Brief

On the home page, you'll see a **"Upload Brief Document"** section at the top. This allows you to:
- Paste unstructured brief text directly
- Load a sample brief to test the feature
- See real-time analysis of brief completeness

### 2. AI Analysis

As you type or paste, the system analyzes the brief for:
- ✓ **Client Information** - Brand name and company
- ✓ **Budget** - Campaign budget in euros
- ✓ **Target Demographics** - Audience information
- ✓ **Timeline** - Campaign dates and deadlines

A completion percentage shows how complete your brief is.

### 3. Parse & Auto-Fill

Click **"Parse Brief & Auto-Fill Form"** and the AI will:
1. Extract all structured data from the text
2. Auto-fill the entire brief form below
3. Show a success message with key extracted info
4. Allow you to review and adjust before generating

### 4. Generate Presentation

Review the auto-filled form, make any adjustments, and click **"Generate Presentation"** as usual.

## Supported Formats

The parser works with:
- **Spanish briefs** - Full support for Spanish terminology
- **English briefs** - Standard format
- **Mixed language** - Combination of Spanish and English
- **Various structures** - Bullet points, paragraphs, lists, etc.
- **Email formats** - Real inbox emails with greetings, sign-offs, and conversational flow
- **Incomplete briefs** - Handles missing information gracefully (doesn't fabricate)
- **Multi-phase campaigns** - Extracts complex strategies with multiple phases and timelines

## Real-World Brief Examples

We've trained the AI parser on **8 real client email examples** showing exactly what gets copy-pasted from your inbox daily:

### Example Types Available

1. **The Band Perfume Launch** - Standard structured brief with music/lifestyle focus
2. **Puerto de Indias Wave 2** - Follow-up campaign with CPM constraints and spirits category restrictions
3. **IKEA Novedades FY26** - Detailed messaging framework with in-store filming requirements
4. **PYD Halloween x OT** - Event-based brand integration with incomplete information
5. **IKEA GREJSIMOJS** - Complex 3-phase strategy with dual budget scenarios and embargo
6. **Square B2B Events** - Business-to-business campaign with geographic distribution needs
7. **Imagin + Marc Márquez** - Mid-process addition with celebrity partnership dependency
8. **IKEA Museo Picasso** - Social cause campaign with institutional partnership

📁 **See all examples:** [`examples/` directory](examples/)

### What These Examples Teach the Parser

**Email Characteristics:**
- Conversational greetings ("Hola Gema, ¿Cómo estás? 🙂")
- Information scattered throughout paragraphs (not neat sections)
- External links (WeTransfer, Instagram handles, TikTok profiles)
- References to previous campaigns, meetings, and team members
- Incomplete information requiring follow-up (normal, not an error)
- Emojis, informal language, casual Spanish business communication

**Complex Patterns:**
- **Multi-phase campaigns:** Extract Phase 1/2/3 with distinct strategies and timelines
- **Budget scenarios:** Handle "€30k OR €50k" and "€39k + €5k boost" formats
- **Hard constraints:** CPM limits (€20 max), in-store filming percentages (30% minimum)
- **Geographic requirements:** Distribute across Madrid, Barcelona, Sevilla, Valencia
- **Category restrictions:** Alcohol/spirits, B2B vs B2C identification
- **Creator mentions:** Specific names, Instagram handles, rejected options ("X said no")
- **Event components:** Physical attendance vs social amplification only
- **Embargo dates:** Can't show products until X date (Phase 1 constraints)

**Spanish Agency Terms:**
- **oleada** = wave/campaign iteration
- **contrastar** = confirm/validate (means unconfirmed)
- **PDM** = presentation deadline
- **PTE** = pending/to be confirmed
- **porfi** = por favor (please, informal)

### Handling Incomplete Information

The parser now **acknowledges gaps** instead of fabricating:
- Budget "not confirmed" → Sets to 0, notes in additionalNotes
- Timeline "probably October" or "dates TBD" → Notes uncertainty
- "Brief pending" or "details coming" → Extracts what exists, flags incompleteness

This is **real-world normal** - clients often send preliminary info before full details are ready.

## Example: Spanish Brief

```
Presupuesto: 75k€
Territorio: Música y Lifestyle
Target: mujeres y hombres 25-65+
Periodo: octubre
Objetivo: Awareness y cobertura es un lanzamiento
```

**Extracts to:**
- Budget: €75,000
- Content Themes: Music, Lifestyle
- Target: Men and Women 25-65+
- Timeline: October
- Goals: Awareness and coverage for product launch

## Terminology Mapping

The AI understands both English and Spanish terms:

| Spanish | English |
|---------|---------|
| Presupuesto | Budget |
| Territorio | Territory / Content Themes |
| Target | Target Audience |
| Periodo | Timeline / Period |
| Objetivo | Objective / Goal |
| KPI | KPI / Metrics |

## Features

### Real-time Completeness Check

As you paste or type your brief, the system shows:
- Which key sections are detected
- Overall completeness percentage
- Visual progress bar

### Sample Brief Available

Click **"Load Sample"** to see a real example brief (The Band Perfume Launch) and test the parsing feature.

### Error Handling

If the AI cannot parse your brief:
- You'll see a clear error message
- You can edit the text and try again
- You can always fill the form manually

## Technical Details

### AI Model

Uses **Firebase Vertex AI** with **Gemini 1.5 Flash** for:
- Natural language understanding
- Multi-language support
- Structured data extraction
- Context understanding

### Extraction Process

1. **Text Analysis** - Identifies key sections and terminology
2. **Data Extraction** - Pulls out specific values (budget, dates, etc.)
3. **Validation** - Ensures required fields are present
4. **Formatting** - Converts to structured ClientBrief format
5. **Default Inference** - Suggests platforms based on target audience if not specified

### Privacy & Security

- Brief text is processed via Firebase Vertex AI
- No brief data is stored permanently
- All parsing happens in real-time
- Form data remains in your browser session

## Best Practices

### For Best Results:

1. **Include Key Information**:
   - Client/brand name
   - Budget amount
   - Target audience details
   - Campaign goals
   - Timeline/deadlines

2. **Be Specific**:
   - Use numbers for budgets (e.g., "75k€" or "€75,000")
   - Specify age ranges (e.g., "25-35" or "25-65+")
   - List platforms if known
   - Include any brand requirements

3. **Any Format Works**:
   - Bullet points ✓
   - Paragraphs ✓
   - Lists ✓
   - Mixed formatting ✓

### What to Avoid:

- Extremely short briefs (< 50 characters)
- Briefs without any client or budget info
- Pure narrative without specific details

## Example Workflow

### Before (Manual Entry):
1. Read brief document
2. Open platform
3. Manually type each field
4. Copy/paste campaign goals one by one
5. 10-15 minutes of data entry

### After (AI Parsing):
1. Copy brief text
2. Paste into upload box
3. Click "Parse Brief"
4. Review auto-filled form
5. 30 seconds to 1 minute

**Time Saved: 10-14 minutes per brief!**

## Integration with Other Features

The parsed brief seamlessly integrates with:
- **Influencer Matching** - Uses extracted demographics and budget
- **AI Content Generation** - Leverages all brief details
- **Slide Generation** - Incorporates requirements and themes
- **Budget Calculator** - Works with extracted budget amount

## Troubleshooting

### Brief Not Parsing Correctly?

**Issue**: AI extracts wrong information
- **Solution**: Make key terms more explicit (add labels like "Budget:", "Target:", etc.)

**Issue**: Some fields are empty
- **Solution**: Add missing information to the brief text and re-parse

**Issue**: Parsing takes too long
- **Solution**: Check internet connection; Firebase Vertex AI requires connectivity

**Issue**: Parser returns error
- **Solution**: Try reformatting brief with clearer structure, or fill form manually

### Form Pre-fills But Values Are Wrong?

You can edit any field in the form before generating. The AI parsing is meant to save time, not replace human review.

## Future Enhancements

Coming soon:
- **PDF Upload** - Upload brief PDFs directly
- **Word Document Support** - Parse .docx files
- **Email Integration** - Forward briefs via email
- **Template Detection** - Recognize specific client templates
- **Multi-brief Processing** - Parse multiple briefs at once
- **Learning System** - Improve parsing based on corrections

## Feedback

This is an initial version of the brief parsing feature. We're continuously improving it based on real-world usage.

If you encounter any issues or have suggestions, please contact the development team.

---

**Built with Firebase Vertex AI & Gemini 1.5 Flash**

Last Updated: October 29, 2025 (Enhanced with 7 real-world email brief examples)
