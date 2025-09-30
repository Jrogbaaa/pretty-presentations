# 🎨 Presentation Template System

## Overview

The Look After You platform now features a sophisticated template system that automatically styles presentations based on campaign type, brand, and content. Choose from professional templates inspired by real agency work.

## Available Templates

### 1. **Look After You Standard** (Default)
**ID**: `default`

**Best For**: General campaigns, versatile presentations, multi-industry clients

**Style**:
- **Mood**: Professional, modern, versatile
- **Colors**: Blue (#3B82F6), Purple (#8B5CF6), Green accents
- **Typography**: Clean sans-serif (Inter)
- **Layout**: Balanced, clear hierarchy

**Use When**:
- General influencer campaigns
- Multi-category briefs
- Professional B2B presentations
- When no specific style is required

---

### 2. **Red Bull Event Experiential** 🏃‍♂️
**ID**: `red-bull-event`

**Best For**: Events, activations, sports campaigns, experiential marketing

**Style**:
- **Mood**: Energetic, adrenaline, urban-sports, high-energy
- **Colors**: Deep blue (#001489), Metallic silver (#8A8D8F), Red Bull yellow (#FFC906)
- **Typography**: Bold sans-serif, all-caps headers, dynamic overlays
- **Imagery**: Full-bleed action photography, event mockups, diagrams
- **Layout**: Modular, grid-heavy, storyboard-style

**Slide Features**:
- Hero overlay covers with action photography
- 4-column grid briefing layouts
- Timeline-based event flow visualizations
- Blueprint-style venue renders
- Phase-based storytelling

**Auto-Selected When Brief Contains**:
- "event", "experience", "activation"
- "sports", "concert", "festival", "tournament"
- Action-oriented language
- Physical venue mentions

**Real-World Example**: Sky Ball rooftop football event with VR gaming, DJ afterparty

---

### 3. **Scalpers Lifestyle Product Launch** 💎
**ID**: `scalpers-lifestyle`

**Best For**: Fashion, luxury, premium products, lifestyle launches, perfumes

**Style**:
- **Mood**: Premium, fashion-forward, rebellious rock-band energy
- **Colors**: Black (#000000), Leather brown (#4A3728), Purple stage light (#A78BFA)
- **Typography**: Serif + sans-serif mix, editorial, sharp kerning
- **Imagery**: High-contrast portraits, monochrome, moody backstage photography
- **Layout**: Editorial splits, minimal, influencer-focused

**Slide Features**:
- Monochrome lifestyle cover photos
- Two-column key numbers display
- Quote-block creative concepts (multiple variations)
- Clean influencer profile rows with stats
- Budget table with CPM calculations
- Minimal closing with product focus

**Auto-Selected When Brief Contains**:
- "fashion", "lifestyle", "luxury", "premium"
- "perfume", "fragrance", "style"
- "music", "band", "concert"
- Aspirational language

**Real-World Example**: "The Band" perfume launch with influencer band archetypes

---

## How Templates Work

### 1. **Auto-Recommendation**

The AI analyzes your brief and automatically recommends the best template:

```typescript
recommendTemplate(
  campaignGoals,  // "Launch premium perfume"
  contentThemes,  // ["Fashion", "Music", "Lifestyle"]
  clientName      // "Scalpers"
)
// Returns: "scalpers-lifestyle"
```

### 2. **Manual Selection**

Users can override the recommendation in the brief form:

```
🎨 Presentation Template
┌─────────────────────────────────────┐
│ ✓ Scalpers Lifestyle Product Launch │
│   Premium, fashion-forward...        │
│   [Color palette preview]            │
└─────────────────────────────────────┘
```

### 3. **Template Application**

Once selected, the template controls:
- **Color Palette**: Background, text, accent colors
- **Typography**: Heading and body fonts, styles
- **Slide Layouts**: Cover style, content grids, talent displays
- **Design Elements**: Overlays, spacing, visual hierarchy

---

## Template Comparison

| Feature | Default | Red Bull Event | Scalpers Lifestyle |
|---------|---------|----------------|-------------------|
| **Cover Style** | Hero centered | Hero overlay | Minimal monochrome |
| **Color Mood** | Professional blue | Energetic dark blue | Premium black |
| **Typography** | Clean sans-serif | Bold all-caps | Serif + sans mix |
| **Talent Layout** | Grid cards | Grid cards | Profile rows |
| **Content Style** | Split columns | Modular grids | Editorial splits |
| **Imagery** | Balanced | Action-heavy | High-contrast portraits |
| **Best For** | General | Events/Sports | Fashion/Luxury |

---

## Template Structure Details

### Cover Slide Variations

**Default**:
```
┌────────────────────┐
│   Campaign Title   │
│   Client Name      │
│   Date             │
│   LAY Logo →       │
└────────────────────┘
```

**Red Bull Event**:
```
┌────────────────────┐
│ [HERO ACTION PHOTO]│
│   SKY BALL ⚽      │
│   Logo →           │
└────────────────────┘
```

**Scalpers Lifestyle**:
```
┌────────────────────┐
│[MONOCHROME PORTRAIT│
│    THE BAND        │
│  Scalpers Logo  →  │
└────────────────────┘
```

### Briefing Slide Variations

**Default**: Simple bullet list
**Red Bull**: 4-column grid with icons
**Scalpers**: Two-column key numbers

### Creative Strategy

**Default**: 1 slide with bullets
**Red Bull**: 1 concept slide with photo overlay
**Scalpers**: 3 slides with different creative approaches

---

## Using Templates in Code

### Get Template

```typescript
import { getTemplate } from "@/types/templates";

const template = getTemplate("red-bull-event");

console.log(template.colorPalette.primary); // "#001489"
console.log(template.typography.headingFont); // "Inter, sans-serif"
```

### Recommend Template

```typescript
import { recommendTemplate } from "@/types/templates";

const templateId = recommendTemplate(
  ["Launch event", "Sports activation"],
  ["Urban", "Energy", "Competition"],
  "Red Bull"
);
// Returns: "red-bull-event"
```

### Apply to Slides

```typescript
import { generateTemplateSlides } from "@/lib/template-slide-generator";
import { getTemplate } from "@/types/templates";

const template = getTemplate("scalpers-lifestyle");
const slides = await generateTemplateSlides(
  brief,
  influencers,
  content,
  template
);
```

---

## Customization Guidelines

### Adding New Templates

1. **Define Template Style** in `types/templates.ts`:

```typescript
export const MY_TEMPLATE: TemplateStyle = {
  id: "my-template",
  name: "My Template Name",
  description: "When to use this template",
  mood: "Describe the mood and energy",
  colorPalette: {
    primary: "#HEXCODE",
    secondary: "#HEXCODE",
    accent: "#HEXCODE",
    background: "#HEXCODE",
    text: "#HEXCODE",
    textLight: "#HEXCODE",
  },
  typography: {
    headingFont: "Font Name, fallback",
    bodyFont: "Font Name, fallback",
    headingStyle: "bold" | "light" | "serif" | "display",
    bodyStyle: "clean" | "editorial" | "modern",
  },
  imagery: {
    style: "Describe photo style",
    composition: "Describe layout approach",
    treatment: "Describe visual treatment",
  },
  slideLayouts: {
    cover: "hero-overlay",
    content: "grid",
    talent: "grid-cards",
  },
};
```

2. **Add to Registry**:

```typescript
export const TEMPLATES: Record<TemplateId, TemplateStyle> = {
  default: DEFAULT_TEMPLATE,
  "red-bull-event": RED_BULL_EVENT_TEMPLATE,
  "scalpers-lifestyle": SCALPERS_LIFESTYLE_TEMPLATE,
  "my-template": MY_TEMPLATE, // Add here
};
```

3. **Update Recommendation Logic** in `recommendTemplate()`:

```typescript
if (allText.includes("keyword1") || allText.includes("keyword2")) {
  return "my-template";
}
```

4. **Customize Slide Generation** in `template-slide-generator.ts`:

Add template-specific logic in slide creation functions:

```typescript
if (template.id === "my-template") {
  // Custom slide generation
}
```

---

## Best Practices

### When to Use Each Template

**Use Default When**:
✅ Client has no strong brand identity  
✅ Multi-category campaigns  
✅ Conservative/corporate clients  
✅ Quick turnaround needed  

**Use Red Bull Event When**:
✅ Physical events or activations  
✅ Sports/energy/action campaigns  
✅ Need timeline/phase visualizations  
✅ Venue-based experiences  
✅ Youth/urban target audience  

**Use Scalpers Lifestyle When**:
✅ Fashion or luxury products  
✅ Lifestyle/aspirational brands  
✅ Music/entertainment tie-ins  
✅ Premium product launches  
✅ Influencer-as-talent positioning  

### Template Selection Tips

1. **Let AI Recommend First**: The algorithm is trained on keywords
2. **Override When Necessary**: Manual selection available
3. **Consider Client Brand**: Match template mood to client identity
4. **Think About Content**: Photo-heavy campaigns suit Red Bull style
5. **Budget Matters**: Scalpers template highlights costs prominently

---

## Technical Details

### File Structure

```
types/
└── templates.ts          # Template definitions & logic

lib/
└── template-slide-generator.ts  # Template-aware slide generation

components/
└── BriefForm.tsx        # Template selection UI
```

### Template Properties

Each template includes:
- **Color Palette** (6 colors): Primary, secondary, accent, background, text, text-light
- **Typography** (4 properties): Heading font, body font, heading style, body style
- **Imagery** (3 guidelines): Style, composition, treatment
- **Slide Layouts** (3 types): Cover, content, talent

### Integration Points

Templates affect:
1. **Slide Generation**: Layout and content structure
2. **Color Schemes**: All slide backgrounds and text
3. **Typography**: Font choices and weights
4. **Component Rendering**: Layout variations in slide components

---

## Future Enhancements

### Planned Features
- [ ] Custom template builder
- [ ] Client-specific template library
- [ ] Template variations (light/dark modes)
- [ ] Template preview before generation
- [ ] Slide-level template mixing
- [ ] Brand guideline import

### Coming Soon
- **More Templates**: Tech startup, Non-profit, Corporate, E-commerce
- **Template Themes**: Seasonal variations, cultural adaptations
- **Smart Components**: Template-aware layout engine

---

## FAQ

**Q: Can I change templates after generation?**  
A: Not currently, but this is a planned feature. You'll need to regenerate the presentation.

**Q: What if my campaign doesn't fit any template?**  
A: Use the Default template - it's designed to work for any campaign type.

**Q: Can I customize colors within a template?**  
A: Not yet, but brand color customization is coming soon.

**Q: How does the AI choose the template?**  
A: It analyzes campaign goals, content themes, and client name for keywords that match template characteristics.

**Q: Can I save my own templates?**  
A: Not yet, but a custom template builder is in development.

---

## Examples

### Red Bull Event Brief → Template Match

**Brief Keywords**: "event", "activation", "sports", "rooftop"  
**AI Recommendation**: ✅ Red Bull Event  
**Result**: Energetic, timeline-based, action-packed presentation  

### Scalpers Perfume Brief → Template Match

**Brief Keywords**: "perfume", "lifestyle", "music", "premium"  
**AI Recommendation**: ✅ Scalpers Lifestyle  
**Result**: Editorial, influencer-focused, budget-detailed presentation  

### General Campaign Brief → Template Match

**Brief Keywords**: "awareness", "engagement", "social media"  
**AI Recommendation**: ✅ Default  
**Result**: Clean, professional, versatile presentation  

---

**Template System Version**: 1.0.0  
**Last Updated**: September 30, 2025  
**Maintained by**: Look After You Development Team
