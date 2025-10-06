import type { Slide } from "@/types";
import { DonutChart, AnimatedNumber } from "@/components/charts";

interface RecommendedScenarioSlideProps {
  slide: Slide;
  onEdit?: (field: string, value: string) => void;
}

const RecommendedScenarioSlide = ({ slide, onEdit }: RecommendedScenarioSlideProps) => {
  const recommendedScenario = slide.content.customData?.recommendedScenario;

  return (
    <div
      className="w-full h-full flex flex-col p-16"
      style={{
        backgroundColor: slide.design.backgroundColor,
        color: slide.design.textColor,
        fontFamily: slide.design.fontFamily,
      }}
    >
      {/* Header */}
      <div className="mb-12">
        <div 
          className="inline-block px-4 py-2 text-sm font-bold uppercase tracking-wider rounded mb-4"
          style={{ backgroundColor: slide.design.accentColor + "30", color: slide.design.accentColor }}
        >
          Recommended
        </div>
        <h1 className="text-6xl font-black">{slide.content.title || slide.title}</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-2 gap-8">
        {/* Left Column - Description & Mix */}
        <div className="space-y-8">
          {slide.content.body && (
            <div className="text-2xl leading-relaxed opacity-90">
              {String(slide.content.body)}
            </div>
          )}

          {/* Influencer Mix */}
          {recommendedScenario && typeof recommendedScenario === 'object' && 'influencerMix' in recommendedScenario && (
            <div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: slide.design.accentColor }}>
                Influencer Mix
              </h3>
              <div className="space-y-3">
                {Array.isArray(recommendedScenario.influencerMix) && recommendedScenario.influencerMix.map((mix: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: slide.design.accentColor + "15" }}>
                    <span className="text-xl font-medium">{String(mix.type || 'Type')}</span>
                    <span className="text-2xl font-bold" style={{ color: slide.design.accentColor }}>
                      {String(mix.count || mix.percentage || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Metrics */}
        <div className="space-y-6">
          {/* Key Numbers */}
          {recommendedScenario && typeof recommendedScenario === 'object' && (
            <>
              {'impressions' in recommendedScenario && (
                <div className="p-8 rounded-2xl" style={{ backgroundColor: slide.design.accentColor + "20" }}>
                  <div className="text-5xl font-black mb-2" style={{ color: slide.design.accentColor }}>
                    <AnimatedNumber 
                      value={typeof recommendedScenario.impressions === 'string' 
                        ? parseFloat(recommendedScenario.impressions.replace(/[^0-9.]/g, '')) 
                        : recommendedScenario.impressions as number
                      }
                      suffix={String(recommendedScenario.impressions).includes('M') ? 'M' : ''}
                      decimals={String(recommendedScenario.impressions).includes('.') ? 1 : 0}
                    />
                  </div>
                  <div className="text-xl opacity-70">Total Impressions</div>
                </div>
              )}

              {'budget' in recommendedScenario && (
                <div className="p-8 rounded-2xl" style={{ backgroundColor: slide.design.accentColor + "20" }}>
                  <div className="text-5xl font-black mb-2" style={{ color: slide.design.accentColor }}>
                    {String(recommendedScenario.budget)}
                  </div>
                  <div className="text-xl opacity-70">Budget</div>
                </div>
              )}

              {'cpm' in recommendedScenario && (
                <div className="p-8 rounded-2xl" style={{ backgroundColor: slide.design.accentColor + "20" }}>
                  <div className="text-5xl font-black mb-2" style={{ color: slide.design.accentColor }}>
                    {String(recommendedScenario.cpm)}
                  </div>
                  <div className="text-xl opacity-70">CPM</div>
                </div>
              )}
            </>
          )}

          {/* Budget Breakdown Donut Chart */}
          {slide.content.customData?.budgetBreakdown && slide.content.customData.budgetBreakdown.length > 0 && (
            <div className="mt-6">
              <h4 className="text-2xl font-bold mb-4">Budget Allocation</h4>
              <DonutChart
                data={slide.content.customData.budgetBreakdown}
                height={300}
                innerRadius={60}
                outerRadius={100}
                centerLabel="Total"
                centerValue={slide.content.customData.totalBudget 
                  ? `€${(slide.content.customData.totalBudget / 1000).toFixed(0)}K`
                  : undefined
                }
              />
            </div>
          )}

          {/* Content Plan */}
          {recommendedScenario && typeof recommendedScenario === 'object' && 'contentPlan' in recommendedScenario && (
            <div className="p-6 rounded-xl" style={{ backgroundColor: slide.design.accentColor + "10" }}>
              <h4 className="text-xl font-bold mb-3">Content Plan</h4>
              <div className="text-lg opacity-90">
                {String(recommendedScenario.contentPlan)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8 opacity-60 text-lg">
        <div className="flex justify-between">
          <span>Look After You</span>
          <span>Recommended Scenario</span>
        </div>
      </div>
    </div>
  );
};

export default RecommendedScenarioSlide;
