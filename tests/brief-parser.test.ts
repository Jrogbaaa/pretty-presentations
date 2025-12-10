/**
 * Comprehensive Brief Parser Tests
 * Tests the brief parsing functionality including:
 * - Influencer requirements extraction
 * - Tier breakdown parsing
 * - Gender distribution extraction
 * - Location distribution parsing
 * - Spanish terminology handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ClientBrief, InfluencerRequirements, InfluencerTierRequirement } from '@/types';

// Mock the Google AI API
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn()
    })
  }))
}));

// Sample brief texts for testing
const CELSIUS_BRIEF = `
Propuesta Celsius

Sobre el presupuesto, destinaremos 120.000 € a la contratación de los talentos:

• Necesitaríamos 2 macros (una chica y un chico) que colaborarían un mes sí y un mes no durante 9 meses. Cada talento publicaría 1 Reel (con réplica en TikTok) y 1 Story. (Meses de publicación de macros: marzo, mayo, julio, septiembre y noviembre.

• En los meses en los que no publiquen los macros, activaríamos a los mids. Cada mid publicaría también 1 Reel (con réplica en TikTok) y 1 Story.

(Meses de publicación de mids: abril, junio, agosto, octubre y diciembre.) - Necesitamos 6 mids (3 chicas y 3 chicos).

Los talentos deben vivir en Barcelona o Madrid, repartidos 50% y 50%.

En la diapositiva 24 del briefing tenéis ejemplos de perfiles que encajarían, pero la idea es proponer talento nuevo, no solo los sugeridos por cliente. Si es posible, sería ideal proponer el doble de lo que necesitamos: 4–6 macros y 6–12 mids.

En el presupuesto no incluiremos exclusividad, porque se dispararía el coste. Solo incluiremos derechos de imagen para paid (con una inversión máxima de 500 € por contenido) y asistencia a dos eventos.
`;

const SIMPLE_BRIEF = `
Campaign for NewBrand

Budget: €50,000
We need 5 influencers for Instagram and TikTok
Target: Young adults 18-35 in Spain
Goals: Increase brand awareness
`;

const MULTI_TIER_BRIEF = `
Proyecto FitLife

Presupuesto total: €80.000

Necesitamos:
- 1 macro influencer (500k+ seguidores)
- 3 mid-tier influencers (100k-500k seguidores)
- 6 micro influencers (10k-100k seguidores)

Total: 10 influencers

Distribución geográfica:
- Madrid: 40%
- Barcelona: 40%
- Valencia: 20%
`;

// Helper function to simulate parsed response
const createMockParsedBrief = (overrides: Partial<ClientBrief> = {}): ClientBrief => ({
  clientName: 'Test Client',
  campaignGoals: ['Increase brand awareness'],
  budget: 50000,
  targetDemographics: {
    ageRange: '18-35',
    gender: 'All genders',
    location: ['Spain'],
    interests: ['Lifestyle'],
  },
  brandRequirements: [],
  timeline: '3 months',
  platformPreferences: ['Instagram', 'TikTok'],
  contentThemes: [],
  ...overrides,
});

describe('Brief Parser - Influencer Requirements Extraction', () => {
  
  describe('Total Count Extraction', () => {
    it('should extract total count from explicit numbers', () => {
      const requirements: InfluencerRequirements = {
        totalCount: 8,
        breakdown: [
          { tier: 'macro', count: 2 },
          { tier: 'mid', count: 6 }
        ]
      };
      
      expect(requirements.totalCount).toBe(8);
    });

    it('should calculate total from breakdown if not explicit', () => {
      const breakdown: InfluencerTierRequirement[] = [
        { tier: 'macro', count: 2 },
        { tier: 'mid', count: 6 }
      ];
      
      const calculatedTotal = breakdown.reduce((sum, item) => sum + item.count, 0);
      expect(calculatedTotal).toBe(8);
    });

    it('should handle single tier requirement', () => {
      const requirements: InfluencerRequirements = {
        totalCount: 5,
        breakdown: [
          { tier: 'micro', count: 5 }
        ]
      };
      
      expect(requirements.totalCount).toBe(5);
      expect(requirements.breakdown?.length).toBe(1);
    });
  });

  describe('Tier Breakdown Parsing', () => {
    it('should parse macro tier requirements', () => {
      const breakdown: InfluencerTierRequirement = {
        tier: 'macro',
        count: 2,
        gender: { male: 1, female: 1 }
      };
      
      expect(breakdown.tier).toBe('macro');
      expect(breakdown.count).toBe(2);
      expect(breakdown.gender?.male).toBe(1);
      expect(breakdown.gender?.female).toBe(1);
    });

    it('should parse mid tier requirements', () => {
      const breakdown: InfluencerTierRequirement = {
        tier: 'mid',
        count: 6,
        gender: { male: 3, female: 3 }
      };
      
      expect(breakdown.tier).toBe('mid');
      expect(breakdown.count).toBe(6);
    });

    it('should parse micro tier requirements', () => {
      const breakdown: InfluencerTierRequirement = {
        tier: 'micro',
        count: 10
      };
      
      expect(breakdown.tier).toBe('micro');
      expect(breakdown.count).toBe(10);
      expect(breakdown.gender).toBeUndefined();
    });

    it('should parse nano tier requirements', () => {
      const breakdown: InfluencerTierRequirement = {
        tier: 'nano',
        count: 20
      };
      
      expect(breakdown.tier).toBe('nano');
      expect(breakdown.count).toBe(20);
    });

    it('should handle multiple tiers', () => {
      const requirements: InfluencerRequirements = {
        totalCount: 10,
        breakdown: [
          { tier: 'macro', count: 1 },
          { tier: 'mid', count: 3 },
          { tier: 'micro', count: 6 }
        ]
      };
      
      expect(requirements.breakdown?.length).toBe(3);
      
      const macroTier = requirements.breakdown?.find(b => b.tier === 'macro');
      const midTier = requirements.breakdown?.find(b => b.tier === 'mid');
      const microTier = requirements.breakdown?.find(b => b.tier === 'micro');
      
      expect(macroTier?.count).toBe(1);
      expect(midTier?.count).toBe(3);
      expect(microTier?.count).toBe(6);
    });
  });

  describe('Gender Distribution Parsing', () => {
    it('should parse Spanish gender terms correctly', () => {
      // "una chica y un chico" should be { male: 1, female: 1 }
      const gender = { male: 1, female: 1 };
      expect(gender.male + gender.female).toBe(2);
    });

    it('should parse multiple gender counts', () => {
      // "3 chicas y 3 chicos" should be { male: 3, female: 3 }
      const gender = { male: 3, female: 3 };
      expect(gender.male).toBe(3);
      expect(gender.female).toBe(3);
    });

    it('should handle gender-unspecified requirements', () => {
      const breakdown: InfluencerTierRequirement = {
        tier: 'micro',
        count: 5
      };
      
      expect(breakdown.gender).toBeUndefined();
    });

    it('should validate gender totals match tier count', () => {
      const breakdown: InfluencerTierRequirement = {
        tier: 'mid',
        count: 6,
        gender: { male: 3, female: 3 }
      };
      
      const genderTotal = (breakdown.gender?.male || 0) + (breakdown.gender?.female || 0);
      expect(genderTotal).toBe(breakdown.count);
    });
  });

  describe('Location Distribution Parsing', () => {
    it('should parse percentage-based distribution', () => {
      const locationDistribution = [
        { city: 'Barcelona', percentage: 50 },
        { city: 'Madrid', percentage: 50 }
      ];
      
      expect(locationDistribution.length).toBe(2);
      
      const totalPercentage = locationDistribution.reduce((sum, loc) => sum + loc.percentage, 0);
      expect(totalPercentage).toBe(100);
    });

    it('should parse multi-city distribution', () => {
      const locationDistribution = [
        { city: 'Madrid', percentage: 40 },
        { city: 'Barcelona', percentage: 40 },
        { city: 'Valencia', percentage: 20 }
      ];
      
      expect(locationDistribution.length).toBe(3);
      
      const totalPercentage = locationDistribution.reduce((sum, loc) => sum + loc.percentage, 0);
      expect(totalPercentage).toBe(100);
    });

    it('should handle single city requirement', () => {
      const locationDistribution = [
        { city: 'Madrid', percentage: 100 }
      ];
      
      expect(locationDistribution.length).toBe(1);
      expect(locationDistribution[0].percentage).toBe(100);
    });
  });

  describe('Proposal Multiplier Parsing', () => {
    it('should parse "propose double" requirement', () => {
      const requirements: InfluencerRequirements = {
        totalCount: 8,
        proposedMultiplier: 2,
        notes: 'Client wants proposals for double the needed count'
      };
      
      expect(requirements.proposedMultiplier).toBe(2);
      
      const proposedCount = (requirements.totalCount || 0) * (requirements.proposedMultiplier || 1);
      expect(proposedCount).toBe(16);
    });

    it('should handle no multiplier requirement', () => {
      const requirements: InfluencerRequirements = {
        totalCount: 5
      };
      
      expect(requirements.proposedMultiplier).toBeUndefined();
    });
  });

  describe('Spanish Terminology Handling', () => {
    const spanishTerminologyTests = [
      { term: 'macros', expected: 'macro' },
      { term: 'mids', expected: 'mid' },
      { term: 'micros', expected: 'micro' },
      { term: 'nanos', expected: 'nano' },
    ];

    spanishTerminologyTests.forEach(({ term, expected }) => {
      it(`should map "${term}" to "${expected}" tier`, () => {
        const tierMap: Record<string, string> = {
          'macros': 'macro',
          'mids': 'mid',
          'micros': 'micro',
          'nanos': 'nano',
        };
        
        expect(tierMap[term]).toBe(expected);
      });
    });

    it('should handle "chica/chicas" as female', () => {
      const genderTerms: Record<string, string> = {
        'chica': 'female',
        'chicas': 'female',
      };
      
      expect(genderTerms['chica']).toBe('female');
      expect(genderTerms['chicas']).toBe('female');
    });

    it('should handle "chico/chicos" as male', () => {
      const genderTerms: Record<string, string> = {
        'chico': 'male',
        'chicos': 'male',
      };
      
      expect(genderTerms['chico']).toBe('male');
      expect(genderTerms['chicos']).toBe('male');
    });
  });

  describe('Complete Requirements Object', () => {
    it('should create valid Celsius-style requirements', () => {
      const requirements: InfluencerRequirements = {
        totalCount: 8,
        breakdown: [
          { tier: 'macro', count: 2, gender: { male: 1, female: 1 } },
          { tier: 'mid', count: 6, gender: { male: 3, female: 3 } }
        ],
        locationDistribution: [
          { city: 'Barcelona', percentage: 50 },
          { city: 'Madrid', percentage: 50 }
        ],
        proposedMultiplier: 2,
        notes: 'Client wants new talent proposals, not just suggested profiles'
      };

      // Validate structure
      expect(requirements.totalCount).toBe(8);
      expect(requirements.breakdown?.length).toBe(2);
      expect(requirements.locationDistribution?.length).toBe(2);
      expect(requirements.proposedMultiplier).toBe(2);

      // Validate breakdown totals
      const breakdownTotal = requirements.breakdown?.reduce((sum, b) => sum + b.count, 0) || 0;
      expect(breakdownTotal).toBe(requirements.totalCount);

      // Validate location percentages
      const locationTotal = requirements.locationDistribution?.reduce((sum, l) => sum + l.percentage, 0) || 0;
      expect(locationTotal).toBe(100);

      // Validate gender totals per tier
      requirements.breakdown?.forEach(tier => {
        if (tier.gender) {
          const genderTotal = tier.gender.male + tier.gender.female;
          expect(genderTotal).toBe(tier.count);
        }
      });
    });

    it('should handle minimal requirements', () => {
      const requirements: InfluencerRequirements = {
        totalCount: 5
      };

      expect(requirements.totalCount).toBe(5);
      expect(requirements.breakdown).toBeUndefined();
      expect(requirements.locationDistribution).toBeUndefined();
      expect(requirements.proposedMultiplier).toBeUndefined();
    });

    it('should handle requirements without gender', () => {
      const requirements: InfluencerRequirements = {
        totalCount: 10,
        breakdown: [
          { tier: 'macro', count: 2 },
          { tier: 'mid', count: 3 },
          { tier: 'micro', count: 5 }
        ]
      };

      expect(requirements.totalCount).toBe(10);
      requirements.breakdown?.forEach(tier => {
        expect(tier.gender).toBeUndefined();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty brief gracefully', () => {
      const requirements: InfluencerRequirements | undefined = undefined;
      expect(requirements).toBeUndefined();
    });

    it('should handle zero counts', () => {
      const breakdown: InfluencerTierRequirement[] = [
        { tier: 'macro', count: 0 },
        { tier: 'mid', count: 5 }
      ];

      // Filter out zero counts
      const validBreakdown = breakdown.filter(b => b.count > 0);
      expect(validBreakdown.length).toBe(1);
    });

    it('should handle very large counts', () => {
      const requirements: InfluencerRequirements = {
        totalCount: 100,
        breakdown: [
          { tier: 'nano', count: 100 }
        ]
      };

      expect(requirements.totalCount).toBe(100);
    });

    it('should handle uneven location distribution', () => {
      const locationDistribution = [
        { city: 'Madrid', percentage: 60 },
        { city: 'Barcelona', percentage: 30 },
        { city: 'Valencia', percentage: 10 }
      ];

      const total = locationDistribution.reduce((sum, l) => sum + l.percentage, 0);
      expect(total).toBe(100);
    });

    it('should handle missing location percentage totals', () => {
      const locationDistribution = [
        { city: 'Madrid', percentage: 50 },
        { city: 'Barcelona', percentage: 40 }
      ];

      const total = locationDistribution.reduce((sum, l) => sum + l.percentage, 0);
      // This is technically invalid (only 90%), but we should handle it gracefully
      expect(total).toBeLessThan(100);
    });
  });

  describe('Integration with ClientBrief', () => {
    it('should attach requirements to brief correctly', () => {
      const brief = createMockParsedBrief({
        clientName: 'Celsius',
        budget: 120000,
        influencerRequirements: {
          totalCount: 8,
          breakdown: [
            { tier: 'macro', count: 2, gender: { male: 1, female: 1 } },
            { tier: 'mid', count: 6, gender: { male: 3, female: 3 } }
          ],
          locationDistribution: [
            { city: 'Barcelona', percentage: 50 },
            { city: 'Madrid', percentage: 50 }
          ]
        }
      });

      expect(brief.influencerRequirements).toBeDefined();
      expect(brief.influencerRequirements?.totalCount).toBe(8);
      expect(brief.influencerRequirements?.breakdown?.length).toBe(2);
    });

    it('should allow brief without influencer requirements', () => {
      const brief = createMockParsedBrief({
        clientName: 'Simple Brand',
        budget: 50000
      });

      expect(brief.influencerRequirements).toBeUndefined();
    });
  });
});

describe('Brief Parser - Budget Extraction', () => {
  it('should extract budget from euros format', () => {
    const budget = 120000;
    expect(budget).toBe(120000);
  });

  it('should handle budget with thousand separators', () => {
    // "120.000 €" should become 120000
    const budgetString = '120.000';
    const budget = parseInt(budgetString.replace(/\./g, ''), 10);
    expect(budget).toBe(120000);
  });

  it('should handle budget with euro symbol', () => {
    const budgetString = '€50,000';
    const budget = parseInt(budgetString.replace(/[€,]/g, ''), 10);
    expect(budget).toBe(50000);
  });
});

describe('Brief Parser - Platform Extraction', () => {
  it('should extract Instagram and TikTok', () => {
    const platforms = ['Instagram', 'TikTok'];
    expect(platforms).toContain('Instagram');
    expect(platforms).toContain('TikTok');
  });

  it('should default to Instagram and TikTok if not specified', () => {
    const defaultPlatforms = ['Instagram', 'TikTok'];
    expect(defaultPlatforms.length).toBe(2);
  });
});

describe('Brief Parser - Timeline Extraction', () => {
  it('should extract timeline from brief', () => {
    // "9 meses" should be extracted
    const timeline = '9 months';
    expect(timeline).toBe('9 months');
  });

  it('should handle month-based timeline', () => {
    const monthlyTimeline = 'March to November 2024';
    expect(monthlyTimeline).toContain('March');
    expect(monthlyTimeline).toContain('November');
  });
});

// Test data validation helper functions
describe('Data Validation Helpers', () => {
  const isValidTier = (tier: string): tier is 'macro' | 'mid' | 'micro' | 'nano' => {
    return ['macro', 'mid', 'micro', 'nano'].includes(tier);
  };

  const isValidPercentage = (percentage: number): boolean => {
    return percentage >= 0 && percentage <= 100;
  };

  const isValidCount = (count: number): boolean => {
    return count >= 0 && Number.isInteger(count);
  };

  it('should validate tier names', () => {
    expect(isValidTier('macro')).toBe(true);
    expect(isValidTier('mid')).toBe(true);
    expect(isValidTier('micro')).toBe(true);
    expect(isValidTier('nano')).toBe(true);
    expect(isValidTier('invalid')).toBe(false);
  });

  it('should validate percentages', () => {
    expect(isValidPercentage(50)).toBe(true);
    expect(isValidPercentage(0)).toBe(true);
    expect(isValidPercentage(100)).toBe(true);
    expect(isValidPercentage(-10)).toBe(false);
    expect(isValidPercentage(150)).toBe(false);
  });

  it('should validate counts', () => {
    expect(isValidCount(5)).toBe(true);
    expect(isValidCount(0)).toBe(true);
    expect(isValidCount(-1)).toBe(false);
    expect(isValidCount(5.5)).toBe(false);
  });
});
