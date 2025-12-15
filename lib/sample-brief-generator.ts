/**
 * Smart Sample Brief Generator
 * Generates contextually relevant briefs based on random brands from our database
 * Now in English with a casual "messy email" style
 */

import { Brand } from "@/types";

// Email-style opening phrases
const EMAIL_OPENINGS = [
  "Hey team!",
  "Hi there,",
  "Quick one for you...",
  "Hope you're doing well!",
  "Hi!",
  "Good morning,",
  "Hey,",
  "Hello!",
  "Hi all,",
];

// Casual transitions and filler phrases
const TRANSITIONS = [
  "So basically,",
  "Long story short,",
  "Here's the deal:",
  "Quick overview:",
  "Just to give you some context,",
  "Anyway,",
  "So yeah,",
  "Ok so,",
];

const CLOSINGS = [
  "Let me know if you need anything else!",
  "Happy to jump on a call to discuss.",
  "Thoughts?",
  "Does this make sense?",
  "Let me know what you think!",
  "Looking forward to hearing your ideas.",
  "Thanks in advance!",
  "Cheers!",
  "Talk soon,",
  "Reach out if you have questions!",
];

// Campaign templates based on industry (now in English)
const CAMPAIGN_TEMPLATES = {
  "Fashion & Retail": {
    products: ["new spring/summer collection", "sustainable clothing line", "designer collaboration", "exclusive capsule collection"],
    objectives: [
      "get the word out about our new collection launch",
      "position the brand as a leader in sustainable fashion",
      "reach around 2M impressions on social",
      "boost online sales by 30% or so",
      "drive qualified traffic to our ecommerce site"
    ],
    contentThemes: [
      "seasonal lookbook and styling tips kind of content",
      "unboxing and haul videos of the new collection",
      "OOTD posts and versatile outfit combos",
      "BTS of the design process if possible",
      "styling for different occasions (casual, work, going out etc)"
    ],
    hashtags: ["#NewCollection", "#FashionStyle", "#OOTD", "#SustainableFashion"]
  },
  "Sports & Fitness": {
    products: ["new sports equipment", "technical apparel line", "running shoes", "fitness collection"],
    objectives: [
      "increase brand awareness in the fitness space",
      "position products as THE reference for sports performance",
      "create motivational/aspirational content",
      "boost sales of the new line by 40%",
      "reach an active community of 1.5M+ people"
    ],
    contentThemes: [
      "workout routines featuring our products",
      "fitness challenges and transformation content",
      "nutrition and recovery tips",
      "athlete/fitness lifestyle content",
      "motivation and personal improvement stuff"
    ],
    hashtags: ["#FitnessMotivation", "#ActiveLifestyle", "#TrainHard", "#SportsPerformance"]
  },
  "Food & Beverage": {
    products: ["new gourmet product line", "premium beverage launch", "recipe collection", "organic products"],
    objectives: [
      "generate awareness for our new product",
      "position brand as premium/healthy option",
      "increase trial and repeat purchase",
      "create aspirational food content",
      "reach foodies and food lovers audience"
    ],
    contentThemes: [
      "creative recipes using our products",
      "moments of enjoyment & consumption occasions",
      "unboxing and tasting content",
      "pairings and gourmet combinations",
      "BTS of the production if interesting"
    ],
    hashtags: ["#Foodie", "#GourmetLife", "#FoodLovers", "#DeliciousMoments"]
  },
  "Beauty & Cosmetics": {
    products: ["new skincare line", "makeup collection", "innovative facial treatment", "exclusive fragrances"],
    objectives: [
      "launch new beauty product line",
      "position as premium/accessible beauty brand",
      "create tutorials and usage demos",
      "increase engagement with beauty community",
      "boost online conversion by 35%"
    ],
    contentThemes: [
      "skincare routines and makeup tutorials",
      "before & after + real results",
      "beauty tips and pro tricks",
      "GRWM and complete looks",
      "honest reviews and first impressions"
    ],
    hashtags: ["#BeautyRoutine", "#SkincareObsessed", "#MakeupTutorial", "#GlowUp"]
  },
  "Technology & Electronics": {
    products: ["new smartphone", "innovative gadget", "tech accessories", "smart home device"],
    objectives: [
      "generate buzz around tech launch",
      "demo features and benefits of the product",
      "position as innovative brand",
      "get authentic reviews and unboxings",
      "reach early adopters and tech enthusiasts"
    ],
    contentThemes: [
      "unboxing and first impressions",
      "technical reviews and comparisons",
      "daily life use cases",
      "tips and tricks to get the most out of the device",
      "tech ecosystem integration"
    ],
    hashtags: ["#TechReview", "#Innovation", "#TechLife", "#Gadgets"]
  },
  "Home & Decor": {
    products: ["new decor collection", "furniture line", "home textiles", "organization items"],
    objectives: [
      "inspire people to refresh their spaces",
      "position as accessible/premium design brand",
      "create decoration and styling ideas",
      "drive traffic to physical stores and online",
      "build a community of home decor lovers"
    ],
    contentThemes: [
      "room makeovers and transformations",
      "decoration and organization tips",
      "seasonal decor and trends",
      "DIY projects with our products",
      "home tours and styling"
    ],
    hashtags: ["#HomeDecor", "#InteriorDesign", "#HomeInspo", "#CozyHome"]
  },
  "Automotive": {
    products: ["new vehicle model", "special edition", "car accessories", "maintenance service"],
    objectives: [
      "generate awareness of new model",
      "position differentiating features",
      "create test drive experiences",
      "increase dealership visits",
      "create aspirational lifestyle content"
    ],
    contentThemes: [
      "driving experiences and road trips",
      "vehicle features and technology",
      "lifestyle moments with the car",
      "honest reviews and comparisons",
      "adventures and travel content"
    ],
    hashtags: ["#CarLife", "#DrivingExperience", "#RoadTrip", "#CarReview"]
  }
};

const PLATFORMS = ["Instagram", "TikTok", "YouTube"];
const LOCATIONS = ["Madrid, Barcelona, Valencia area mainly", "all of Spain", "major Spanish cities"];
const TIMELINES = [
  "launching next month, campaign runs about 3 weeks",
  "starting ASAP, 4 weeks duration",
  "Q1 launch, 2 month campaign",
  "kicking off Q1, 6 week campaign window"
];

/**
 * Get industry category (simplified to match campaign templates)
 */
const getIndustryCategory = (industry: string): keyof typeof CAMPAIGN_TEMPLATES => {
  const industryLower = industry.toLowerCase();
  
  if (industryLower.includes("fashion") || industryLower.includes("retail") || industryLower.includes("clothing")) {
    return "Fashion & Retail";
  }
  if (industryLower.includes("sport") || industryLower.includes("fitness") || industryLower.includes("athletic")) {
    return "Sports & Fitness";
  }
  if (industryLower.includes("food") || industryLower.includes("beverage") || industryLower.includes("restaurant") || industryLower.includes("grocery")) {
    return "Food & Beverage";
  }
  if (industryLower.includes("beauty") || industryLower.includes("cosmetic") || industryLower.includes("skincare")) {
    return "Beauty & Cosmetics";
  }
  if (industryLower.includes("tech") || industryLower.includes("electronic") || industryLower.includes("software")) {
    return "Technology & Electronics";
  }
  if (industryLower.includes("home") || industryLower.includes("decor") || industryLower.includes("furniture")) {
    return "Home & Decor";
  }
  if (industryLower.includes("automotive") || industryLower.includes("car")) {
    return "Automotive";
  }
  
  // Default to Fashion & Retail
  return "Fashion & Retail";
};

/**
 * Load all brands from CSV
 */
export const loadBrandsFromCSV = async (): Promise<Brand[]> => {
  try {
    const response = await fetch('/data/brands.csv');
    const csvText = await response.text();
    
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    const brands: Brand[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length < 7) continue;
      
      brands.push({
        name: values[0].replace(/^"|"$/g, ''),
        industry: values[1].replace(/^"|"$/g, ''),
        description: values[2].replace(/^"|"$/g, ''),
        targetAge: values[3].replace(/^"|"$/g, ''),
        targetGender: values[4].replace(/^"|"$/g, ''),
        targetInterests: values[5].replace(/^"|"$/g, '').split(',').map(s => s.trim()),
        contentThemes: values[6].replace(/^"|"$/g, '').split(',').map(s => s.trim())
      });
    }
    
    return brands;
  } catch (error) {
    console.error('Error loading brands from CSV:', error);
    return [];
  }
};

/**
 * Helper to pick random item from array
 */
const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Generate a random sample brief based on a random brand from database
 * Now generates casual, email-style briefs in English
 */
export const generateRandomSampleBrief = async (): Promise<string> => {
  const brands = await loadBrandsFromCSV();
  
  if (brands.length === 0) {
    // Fallback to default sample if CSV loading fails
    return generateFallbackBrief();
  }
  
  // Pick random brand
  const randomBrand = brands[Math.floor(Math.random() * brands.length)];
  
  // Get industry category and template
  const industryCategory = getIndustryCategory(randomBrand.industry);
  const template = CAMPAIGN_TEMPLATES[industryCategory];
  
  // Generate random selections
  const product = pickRandom(template.products);
  const objectives = template.objectives
    .sort(() => Math.random() - 0.5)
    .slice(0, 2 + Math.floor(Math.random() * 2)); // 2-3 objectives
  const contentThemes = template.contentThemes
    .sort(() => Math.random() - 0.5)
    .slice(0, 2 + Math.floor(Math.random() * 2)); // 2-3 themes
  const platforms = PLATFORMS.sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 2));
  const location = pickRandom(LOCATIONS);
  const timeline = pickRandom(TIMELINES);
  const budget = pickRandom([15000, 25000, 35000, 50000, 75000, 100000]);
  const hashtag = pickRandom(template.hashtags);
  
  const opening = pickRandom(EMAIL_OPENINGS);
  const transition = pickRandom(TRANSITIONS);
  const closing = pickRandom(CLOSINGS);
  
  // Random name for the "sender"
  const senderNames = ["Sarah", "Mike", "Ana", "Carlos", "Laura", "David", "Elena", "James"];
  const sender = pickRandom(senderNames);
  
  // Build the messy email-style brief
  const briefParts: string[] = [];
  
  // Opening
  briefParts.push(`${opening}\n`);
  
  // Introduction paragraph (messy, run-on sentence style)
  briefParts.push(`${transition} we're working with ${randomBrand.name} on their upcoming campaign for their ${product}. They're in the ${randomBrand.industry.toLowerCase()} space and they're looking to do some influencer marketing.`);
  
  // Budget (mentioned casually)
  briefParts.push(`\nBudget is around €${budget.toLocaleString()} - maybe a bit flexible but that's the ballpark.\n`);
  
  // About the brand (if description exists)
  if (randomBrand.description) {
    briefParts.push(`A bit about them: ${randomBrand.description}\n`);
  }
  
  // Objectives (listed casually)
  briefParts.push(`What they're hoping to achieve:`);
  objectives.forEach((obj, i) => {
    // Mix up formatting - sometimes dash, sometimes number, sometimes just text
    const formats = [`- ${obj}`, `${i + 1}. ${obj}`, `  • ${obj}`];
    briefParts.push(pickRandom(formats));
  });
  
  // Target audience (in a casual paragraph)
  briefParts.push(`\nTarget audience is pretty much ${randomBrand.targetAge} year olds, ${randomBrand.targetGender.toLowerCase()}, based in ${location}. They're into ${randomBrand.targetInterests.slice(0, 3).join(', ')} - that kind of stuff.\n`);
  
  // Content ideas
  briefParts.push(`Content-wise they're thinking:`);
  contentThemes.forEach(theme => {
    briefParts.push(`- ${theme}`);
  });
  
  // Platform and other requirements (all jumbled together)
  briefParts.push(`\nPlatforms: mainly ${platforms.join(' and ')}`);
  briefParts.push(`They want influencers to use ${hashtag} and tag @${randomBrand.name.toLowerCase().replace(/\s+/g, '')} obviously`);
  
  // Timeline
  briefParts.push(`\nTimeline: ${timeline}`);
  
  // Random additional notes (make it feel more email-like)
  const additionalNotes = [
    `Oh and they mentioned they want content that feels authentic, not too salesy.`,
    `PS - they prefer higher quality visuals if possible.`,
    `They did mention they're looking for creators who really align with their brand values.`,
    `Also worth noting - they've worked with influencers before so they know what they want.`,
    `The client is pretty hands-on so expect some back and forth on selections.`,
  ];
  briefParts.push(`\n${pickRandom(additionalNotes)}`);
  
  // Closing
  briefParts.push(`\n${closing}`);
  briefParts.push(`${sender}`);
  
  return briefParts.join('\n');
};

/**
 * Fallback brief if CSV loading fails - now in English email style
 */
const generateFallbackBrief = (): string => {
  return `Hey there!

Quick brief for you - we're working with The Band on their new luxury perfume line launch. Pretty exciting stuff!

Budget: around €50,000

So basically they want to:
- get awareness for the new collection
- position The Band as a premium brand in the luxury perfume space  
- hit around 2M impressions on social
- drive traffic to their ecommerce site

Target is 25-45 year olds, 60% women 40% men, mainly in Spain (Madrid, Barcelona, Valencia area). People who are into fashion, premium lifestyle, beauty, trends etc.

Content ideas they mentioned:
- unboxing and first impressions of the collection
- storytelling around the scent notes
- lifestyle content with the perfume integrated naturally
- special moments (events, dinners, travel)

Platforms: Instagram and TikTok mainly

Timeline: launching next month, campaign runs about 3 weeks

They really want authentic feeling content, not too polished or salesy if you know what I mean.

Let me know what you think!
Sarah`;
};
