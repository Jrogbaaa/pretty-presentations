# Brands Database & Matching System

## Overview

The brands database system provides intelligent brand-to-influencer matching using AI-powered similarity detection. Similar to the LAYAI influencer matching system, it enhances campaign planning by automatically identifying brand characteristics and suggesting relevant influencers.

---

## How It Works

### 1. **Brands Database (`/data/brands.csv`)**

A comprehensive CSV database of **120+ brands** operating in Spain across multiple industries:

- **Fashion & Retail**: Zara, Mango, Bershka, Pull & Bear, Massimo Dutti, Desigual, H&M, Primark, etc.
- **Food & Grocery**: Mercadona, Carrefour, Lidl, DIA, Eroski, Aldi, etc.
- **Sports & Fitness**: Nike, Adidas, Decathlon, etc.
- **Beauty & Cosmetics**: Sephora, Douglas, Druni, etc.
- **Home & Decor**: Zara Home, Ikea, Leroy Merlin, etc.
- **Electronics**: MediaMarkt, Worten, Fnac, etc.
- **Food & Restaurant**: Telepizza, Vips, 100 Montaditos, Starbucks, McDonald's, etc.
- **Financial Services**: Banco Santander, BBVA, CaixaBank, etc.
- **Telecommunications**: Telefónica (Movistar), Orange, Vodafone, etc.
- **Automotive**: Seat, Renault, Toyota, BMW, Mercedes-Benz, etc.
- **And many more...**

#### Brand Data Structure

Each brand entry includes:

```csv
name,industry,description,target_age,target_gender,target_interests,content_themes
Nike,Sports & Fitness,"Athletic brand, performance products...",16-45,Mixed,"Sports,Fitness,Fashion","Athletic performance,Innovation,Street style"
```

**Fields:**
- `name`: Brand name
- `industry`: Industry/category
- `description`: Brand identity and positioning
- `target_age`: Target demographic age range
- `target_gender`: Male, Female, or Mixed
- `target_interests`: Comma-separated interests (e.g., Fashion, Sports, Technology)
- `content_themes`: Comma-separated content themes (e.g., Performance, Lifestyle, Innovation)

---

## AI-Powered Matching Logic

### **Scenario 1: Known Brand (Direct Match)**

```
Brief: Client = "Nike"
  ↓
Database Lookup → ✅ Nike found
  ↓
Extract Profile:
  - Industry: Sports & Fitness
  - Interests: Sports, Fitness, Fashion, Performance
  - Themes: Athletic performance, Innovation, Street style
  ↓
Match fitness influencers with athletic content
```

**Example:**
```typescript
// Input
clientName: "Nike"

// Output
Brand Found: Nike (100% match)
Industry: Sports & Fitness
Recommended Influencers: Fitness creators, athletic lifestyle influencers
Suggested Content: Athletic performance, sports motivation, product reviews
```

---

### **Scenario 2: Unknown Brand (Similarity Match)**

```
Brief: Client = "Jeff's Fitness Company" (not in database)
  ↓
AI Analysis → "Similar to Nike, Adidas, Under Armour"
  ↓
Find similar brands in database (90% confidence)
  ↓
Use Nike/Adidas profiles for matching
  ↓
Match fitness influencers (same as Nike would get)
```

**Example:**
```typescript
// Input
clientName: "Jeff's Fitness Company"

// Output
Brand Not Found Directly
AI Identified: 90% confident - Sports & Fitness industry
Similar Brands: Nike (95% match), Adidas (92% match), Decathlon (88% match)
Using Nike's profile for influencer matching
Recommended Influencers: Fitness creators, athletic lifestyle influencers
```

---

## Integration with Influencer Matching

The brand intelligence system seamlessly integrates with the existing LAYAI-based influencer matching:

### Flow

```
1. Client Brief Submitted
   ↓
2. Brand Lookup (brand-service.ts)
   ├─ Exact match? → Use brand profile
   └─ No match? → AI similarity search
   ↓
3. Enhance Brief (brand-matcher.ts)
   - Add brand target interests
   - Add brand content themes
   - Add brand context to brief
   ↓
4. Influencer Matching (influencer-matcher.ts)
   - Uses enhanced brief
   - Filters by brand-aligned interests
   - Ranks using LAYAI + brand intelligence
   ↓
5. Return Selected Influencers
   + Brand-specific suggestions
```

---

## Key Features

### 1. **Automatic Brand Enhancement**

When you create a brief with `clientName: "Nike"`, the system:
- ✅ Looks up Nike in the database
- ✅ Extracts brand profile (industry, interests, themes)
- ✅ Enhances the brief with brand intelligence
- ✅ Uses enhanced data for influencer matching

### 2. **AI Similarity Detection**

For unknown brands like "Jeff's Fitness Company":
- 🤖 AI analyzes the brand name and context
- 🔍 Searches database for similar brands
- 📊 Returns top 5 similar brands with match scores
- ✅ Uses the best match's profile for recommendations

### 3. **Multi-Criteria Matching**

Brands are matched based on:
- **Industry alignment**: Fashion brand → Fashion influencers
- **Target demographics**: Age, gender, interests
- **Content themes**: Brand messaging alignment
- **Previous collaborations**: Influencers who've worked with similar brands

### 4. **Brand Intelligence Suggestions**

AI generates actionable suggestions like:
- "Focus on micro-influencers (10K-100K) for authentic fitness content"
- "Prioritize influencers with demonstrated athletic performance content"
- "Consider influencers who've successfully promoted Nike or Adidas"
- "Align content with themes: motivation, performance, lifestyle integration"

---

## Usage Examples

### Example 1: Known Brand (Zara)

```typescript
const brief = {
  clientName: "Zara",
  campaignGoals: ["Brand Awareness"],
  budget: 15000,
  targetDemographics: {
    ageRange: "18-35",
    gender: "Female",
    location: ["Spain"],
    interests: ["Fashion"]
  },
  platformPreferences: ["Instagram"],
  contentThemes: []  // Will be enhanced by brand profile
};

// System automatically:
// ✅ Finds Zara in database
// ✅ Adds interests: Fashion, Shopping, Trends, Style
// ✅ Adds themes: Style inspiration, Affordable luxury, Fashion-forward
// ✅ Matches fashion influencers who align with Zara's brand identity
```

### Example 2: Unknown Brand (Jeff's Fitness Company)

```typescript
const brief = {
  clientName: "Jeff's Fitness Company",
  campaignGoals: ["Product Launch"],
  budget: 10000,
  targetDemographics: {
    ageRange: "20-40",
    gender: "Mixed",
    location: ["Spain"],
    interests: []  // Empty - let AI figure it out
  },
  platformPreferences: ["Instagram", "TikTok"],
  contentThemes: []
};

// System automatically:
// 🤖 AI identifies: 95% confidence - Sports & Fitness industry
// 🔍 Finds similar brands: Nike (95% match), Adidas (92% match)
// ✅ Uses Nike's profile
// ✅ Adds interests: Sports, Fitness, Performance, Lifestyle
// ✅ Adds themes: Athletic performance, Motivation, Innovation
// ✅ Matches fitness influencers
```

### Example 3: New Industry Brand (Tech Startup)

```typescript
const brief = {
  clientName: "TechFlow Solutions",  // Not in database
  campaignGoals: ["B2B Lead Generation"],
  budget: 25000,
  targetDemographics: {
    ageRange: "25-45",
    gender: "Mixed",
    location: ["Spain"],
    interests: ["Technology", "Business"]
  },
  platformPreferences: ["LinkedIn"],
  contentThemes: ["Innovation", "Digital Transformation"]
};

// System automatically:
// 🤖 AI classifies: 88% confidence - Technology/B2B industry
// 🔍 Finds similar: Tech brands in database
// ✅ Suggests business & tech influencers
// ✅ Recommends LinkedIn-focused creators
// ⚠️  Provides suggestions to add "TechFlow Solutions" to database
```

---

## Technical Implementation

### Files Structure

```
/data/
  └─ brands.csv               # 120+ brands database

/lib/
  ├─ brand-service.ts         # Load & search brands
  ├─ brand-matcher.ts         # AI matching & suggestions
  └─ influencer-matcher.ts    # Integrated brand intelligence

/types/
  └─ index.ts                 # Brand TypeScript interfaces
```

### Core Functions

#### `brand-service.ts`

```typescript
// Load all brands from CSV
loadBrands(): Promise<Brand[]>

// Exact name search
searchBrandByName(name: string): Promise<Brand | null>

// AI-powered similarity search
findSimilarBrands(name: string, context?: string): Promise<BrandProfile[]>

// Get brand profile (exact or similar)
getBrandProfile(name: string, context?: string): Promise<BrandProfile | null>

// Search by industry
getBrandsByIndustry(industry: string): Promise<Brand[]>
```

#### `brand-matcher.ts`

```typescript
// Main matching function
matchBrandToInfluencers(
  brandName: string,
  brief: ClientBrief,
  influencerPool: SelectedInfluencer[]
): Promise<{
  brandProfile: BrandProfile | null;
  enhancedBrief: ClientBrief;
  suggestions: string[];
}>

// AI category identification for unknown brands
identifyBrandCategory(
  brandName: string,
  context?: string
): Promise<{
  industry: string;
  suggestedInterests: string[];
  confidence: number;
}>

// Brand intelligence summary
getBrandIntelligenceSummary(
  brandName: string,
  brief: ClientBrief
): Promise<{
  brandFound: boolean;
  brandProfile: BrandProfile | null;
  matchQuality: 'exact' | 'similar' | 'none';
  recommendations: string[];
}>
```

---

## Adding New Brands

To add a new brand to the database:

1. Open `/data/brands.csv`
2. Add a new row with the brand information:

```csv
BrandName,Industry,Description,Target_Age,Target_Gender,Interests,Themes
```

3. Example:

```csv
Glovo,Food Delivery & Technology,"On-demand delivery app, food and groceries, quick service, urban focus",18-45,Mixed,"Food,Technology,Convenience,Urban lifestyle","Quick delivery,Urban living,Convenience,Food discovery"
```

4. Save the file
5. The brand will be automatically available on next page load (CSV is loaded at runtime)

---

## Benefits

### For Campaign Planning

- ✅ **Faster Brief Creation**: Auto-fill brand interests and themes
- ✅ **Better Matches**: Influencers aligned with brand identity
- ✅ **Unknown Brands**: AI finds similar brands for guidance
- ✅ **Industry Insights**: Automatic classification and suggestions

### For Reporting

- 📊 **Brand Intelligence**: Show brand profile in presentations
- 💡 **Strategic Recommendations**: AI-generated campaign suggestions
- 🎯 **Match Quality**: Transparency on exact vs similar matches
- 📈 **Data-Driven**: Backed by comprehensive brand database

### For Scalability

- 🚀 **Easy to Extend**: Add brands via simple CSV updates
- 🤖 **AI-Powered**: Handles unknown brands automatically
- 🔄 **Consistent Logic**: Works across all campaign types
- 📚 **Knowledge Base**: Grows with each brand addition

---

## Future Enhancements

### Planned Features

1. **Brand Collaboration History**
   - Track which influencers worked with which brands
   - Success metrics and ROI data
   - Preferred influencer types per brand

2. **Seasonal Brand Data**
   - Different themes for different seasons
   - Holiday-specific recommendations
   - Event-driven suggestions

3. **Competitive Analysis**
   - Brand vs competitor influencer strategies
   - Market share insights
   - Differentiation recommendations

4. **Brand Sentiment**
   - Track brand reputation metrics
   - Influencer-brand fit scoring
   - Risk assessment for brand partnerships

5. **Auto-Update System**
   - Web scraping for new brands
   - Automated profile generation
   - Regular database updates

---

## Best Practices

### When Creating Briefs

1. **Always include `clientName`**: Even if unsure, let AI classify it
2. **Provide context**: Add `additionalNotes` about the brand
3. **Let system enhance**: Start with basic interests, let brand data fill gaps
4. **Review suggestions**: Check AI-generated brand recommendations

### When Adding Brands

1. **Be specific in description**: Include brand positioning, values, USPs
2. **Accurate demographics**: Match brand's actual target audience
3. **Multiple interests**: List 4-6 relevant interests
4. **Clear themes**: 3-5 content themes that represent the brand

### When Using Unknown Brands

1. **Provide brief context**: Help AI classify correctly
2. **Review similar brands**: Check if AI's suggestions make sense
3. **Consider adding**: If recurring client, add to database
4. **Use suggestions**: AI recommendations are based on similar brands

---

## Troubleshooting

### Brand Not Found

**Problem**: Brand not in database, no similar matches
**Solution**:
1. Check spelling of `clientName`
2. Add more context in `additionalNotes`
3. Manually specify interests and themes in brief
4. Add brand to `/data/brands.csv` for future

### Wrong Similar Brand

**Problem**: AI suggests incorrect similar brand
**Solution**:
1. Provide more context about the brand in brief
2. Manually override interests/themes in brief
3. Add correct brand to database
4. Report issue for AI model tuning

### Missing Interests/Themes

**Problem**: Brand profile seems incomplete
**Solution**:
1. Edit `/data/brands.csv` to add more details
2. Reload the page to refresh cache
3. Check if CSV format is correct (no missing commas)

---

## Performance

- **Brand Lookup**: ~5ms (in-memory cache)
- **AI Similarity Search**: ~2-3s (Gemini API)
- **Brief Enhancement**: ~10ms (data merging)
- **Total Overhead**: ~3-5s per brief (only on first match)

---

## Credits

This brands database and matching system is built upon the foundation of:
- **LAYAI**: https://github.com/Jrogbaaa/LAYAI
- **Gemini AI**: Google Generative AI for similarity detection
- **Spanish Market Data**: Compiled from public sources and business directories

---

**🎯 Ready to use! The system automatically enhances every brief with brand intelligence.**

For questions or suggestions, see: `/QUICK_REFERENCE.md`

