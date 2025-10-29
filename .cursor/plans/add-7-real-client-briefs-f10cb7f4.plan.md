<!-- f10cb7f4-c23c-400a-91ad-c47df3b96ea0 a85b7541-e3da-4943-ad7b-e52bcd7e685d -->
# Add Real Client Brief Examples to Knowledge Base

## Context

The codebase currently has 1 polished example brief (`examples/brief-the-band-perfume.md`). We need to add 7 **RAW EMAIL EXAMPLES** from `CORROES PROPUESTAS.txt` showing exactly what the team receives daily in their inbox:

**Real-world email characteristics:**

- Conversational greetings ("Hola Gema, ¿Cómo estás? 🙂")
- Information scattered throughout paragraphs (not structured lists)
- Embedded WeTransfer links, Instagram handles, external references
- Follow-up context ("como siempre", references to previous waves)
- Casual business Spanish with emojis and informal tone
- Multiple topics mixed together
- Incomplete information requiring clarification calls
- Email sign-offs and pleasantries

**Parser training needs:**

- Extract signal from noise (ignore greetings, extract business info)
- Parse information from conversational paragraphs
- Handle multi-phase campaigns embedded in prose
- Recognize when info is deliberately missing vs. incomplete
- Spanish agency workflow terminology ("oleada", "contrastar", "PDM")

## Implementation Steps

### 1. Create 7 New Brief Example Files

Create individual markdown files in `/examples/` following the existing structure from `brief-the-band-perfume.md`:

**New Files:**

- `examples/brief-puerto-de-indias.md` - Gin brand, Wave 2, €111.8k, "Tarde con los tuyos" concept, CPM constraints
- `examples/brief-ikea-novedades.md` - New products FY26, €39k, "first times" theme, GenZ/Millennials target
- `examples/brief-pyd-halloween.md` - Perfumes Y Diseño x Operación Triunfo brand integration
- `examples/brief-ikea-grejsimojs.md` - 3-phase playful collection launch (€30k/€50k scenarios)
- `examples/brief-square.md` - B2B fintech, €28k, entrepreneur gastronomy events
- `examples/brief-imagin.md` - Cooking presenters + Marc Márquez collaboration
- `examples/brief-ikea-picasso.md` - Museum partnership, youth housing competition amplification

**Each file structure:**

1. **Original Brief (Spanish)** - Raw email text showing real-world format
2. **Parsed Brief Structure** - Organized extraction in English with all key fields
3. **Key Insights** - Challenges, priorities, red flags specific to this brief
4. **Example JSON Output** - Complete `ClientBrief` object

### 2. Enhance AI Parser Prompt

Update `lib/brief-parser.server.ts` (lines 31-64) to include:

**Add to prompt context:**

- Reference to real-world patterns from the 7 examples
- Handling multi-phase campaigns (teaser/reveal/launch)
- Extracting multiple budget scenarios
- Understanding when information is deliberately missing
- Agency-specific Spanish terms: "oleada" (wave), "contrastar" (confirm), "PDM" (presentation deadline)
- CPM/CPV constraints as brand requirements
- Talent/creator preferences and restrictions

**Key additions:**

```
- Handle multi-phase campaigns: extract each phase with dates/objectives
- Multi-budget scenarios: when "2 scenarios" mentioned, extract both as range
- Missing info is normal: flag incomplete sections, don't fabricate
- CPM/CPV requirements: extract as brandRequirements
- Talent preferences: add to additionalNotes with names/handles
- "oleada" = wave/campaign iteration
- "contrastar" = confirm/validate (means unconfirmed)
```

### 3. Update Documentation

**Update `BRIEF_PARSING.md`:**

- Add section: "Real-World Brief Examples" listing all 8 examples
- Add note about handling incomplete briefs
- Document multi-phase and multi-budget scenario extraction

**Create `examples/README.md`:**

- Index of all brief examples with quick descriptions
- Usage guide for developers
- Pattern taxonomy (single-phase, multi-phase, B2B, etc.)

## Key Patterns These Examples Teach

**Puerto de Indias:**

- Follow-up campaigns with reference to previous waves
- CPM constraints as hard requirements
- Specific creator requests with Instagram handles

**IKEA Novedades:**

- Detailed messaging framework in bullet points
- Store visit requirements (30% in-store filming)
- Quality/price positioning nuances

**PYD Halloween:**

- Event-based campaigns (academy visit)
- Specific creator shortlist with only 2 names
- Mixed deliverables (event attendance + social posts)

**IKEA GREJSIMOJS:**

- 3-phase sophisticated strategy (embargo/reveal/launch)
- Multiple budget scenarios (€30k vs €50k)
- Experiential components (private preview events)

**Square:**

- B2B campaigns targeting business owners
- Geographic distribution requirements
- Industry-specific creator criteria (entrepreneurs)

**Imagin:**

- Collaboration with celebrity (Marc Márquez)
- Need for "transversal" recognizable creators
- Presenter vs guest distinctions

**IKEA Picasso:**

- Institutional partnerships (museums)
- Social cause campaigns (youth housing)
- Landing page traffic as KPI

## Expected Improvements

After implementation:

- Better extraction from unstructured email formats
- Accurate multi-phase campaign parsing
- Proper handling of incomplete information
- Recognition of Spanish agency workflow terminology
- Multi-budget scenario extraction
- Creator constraints and preferences capture

## Files Modified

- `lib/brief-parser.server.ts` - Enhanced prompt
- `BRIEF_PARSING.md` - Added examples section

## Files Created

- 7 new brief example markdown files in `/examples/`
- `examples/README.md` - Brief examples index

### To-dos

- [ ] Create examples/brief-puerto-de-indias.md with full structure (original Spanish, parsed data, insights, JSON)
- [ ] Create examples/brief-ikea-novedades.md with messaging framework and store visit requirements
- [ ] Create examples/brief-pyd-halloween.md with event-based deliverables and specific creator list
- [ ] Create examples/brief-ikea-grejsimojs.md with 3-phase strategy and dual budget scenarios
- [ ] Create examples/brief-square.md with B2B focus and geographic distribution requirements
- [ ] Create examples/brief-imagin.md with celebrity collaboration and presenter distinctions
- [ ] Create examples/brief-ikea-picasso.md with institutional partnership and social cause focus
- [ ] Update lib/brief-parser.server.ts prompt with multi-phase, multi-budget, and Spanish agency term handling
- [ ] Create examples/README.md indexing all 8 brief examples with pattern taxonomy
- [ ] Update BRIEF_PARSING.md with Real-World Examples section and incomplete brief handling