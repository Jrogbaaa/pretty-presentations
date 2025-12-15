import type { Slide } from "@/types";
import { DonutChart, AnimatedNumber } from "@/components/charts";

interface RecommendedScenarioSlideProps {
  slide: Slide;
  onEdit?: (field: string, value: string) => void;
}

const RecommendedScenarioSlide = ({ slide, onEdit }: RecommendedScenarioSlideProps) => {
  const recommendedScenario = slide.content.customData?.recommendedScenario as Record<string, unknown> | undefined;

  // Check for corporate brochure style
  const isCorporateBrochure = 
    slide.design.backgroundColor === "#F5F3EB" || 
    slide.design.accentColor === "#2E3F9E" ||
    slide.content.customData?.templateStyle === "corporate-brochure";

  // Corporate Brochure Style - Our Create Work layout
  if (isCorporateBrochure) {
    return (
      <div className="w-full h-full flex relative" style={{ fontFamily: "Inter, sans-serif" }}>
        {/* Left Panel - Cream with stats */}
        <div 
          className="w-1/2 h-full flex flex-col p-16 relative"
          style={{ backgroundColor: "#2E3F9E" }}
        >
          {/* Background image placeholder */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.15' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Section Title */}
          <div className="mb-8 relative z-10">
            <h1 
              className="text-4xl font-bold tracking-tight uppercase mb-4"
              style={{ color: "#FFFFFF", fontFamily: "Georgia, serif" }}
            >
              {slide.content.title || "OUR CREATE WORK"}
            </h1>
            <div 
              className="w-16 h-1"
              style={{ backgroundColor: "#F5F3EB" }}
            />
          </div>

          {/* Content description */}
          <div className="mb-8 relative z-10">
            {slide.content.body && (
              <p 
                className="text-lg leading-relaxed"
                style={{ color: "#F5F3EB" }}
              >
                {String(slide.content.body)}
              </p>
            )}
          </div>

          {/* Big Stats */}
          <div className="flex-1 flex flex-col justify-center relative z-10">
            <div className="space-y-8">
              {/* Large Percentage */}
              <div>
                <div 
                  className="text-8xl font-bold"
                  style={{ color: "#F5F3EB", fontFamily: "Georgia, serif" }}
                >
                  25%
                </div>
                <p className="text-base mt-2 opacity-80" style={{ color: "#F5F3EB" }}>
                  Lorem ipsum dolor sit amet
                </p>
              </div>

              {/* Smaller Stats Row */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/20">
                {[
                  { value: "+15", label: "Lorem ipsum" },
                  { value: "3x", label: "Lorem ipsum" },
                  { value: "98%", label: "Lorem ipsum" },
                ].map((stat, index) => (
                  <div key={index}>
                    <div 
                      className="text-2xl font-bold"
                      style={{ color: "#F5F3EB" }}
                    >
                      {stat.value}
                    </div>
                    <div 
                      className="text-xs uppercase tracking-wider mt-1 opacity-70"
                      style={{ color: "#F5F3EB" }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Cream with content boxes */}
        <div 
          className="w-1/2 h-full flex flex-col p-16 relative"
          style={{ backgroundColor: "#F5F3EB" }}
        >
          {/* Content Boxes Grid */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            {/* Box 1 - Tall */}
            <div 
              className="row-span-2 rounded-lg p-6 flex flex-col relative overflow-hidden"
              style={{ backgroundColor: "rgba(46, 63, 158, 0.08)" }}
            >
              <div className="mb-4">
                <h3 
                  className="text-lg font-bold"
                  style={{ color: "#2E3F9E" }}
                >
                  Lorem ipsum
                </h3>
                <p 
                  className="text-sm mt-2"
                  style={{ color: "#4A4A5A" }}
                >
                  Dolor sit amet consectetur adipiscing elit sed do eiusmod tempor.
                </p>
              </div>
              {/* Placeholder for image */}
              <div 
                className="flex-1 rounded-lg mt-auto flex items-center justify-center"
                style={{ backgroundColor: "rgba(46, 63, 158, 0.1)" }}
              >
                <svg className="w-16 h-16 opacity-30" fill="#2E3F9E" viewBox="0 0 24 24">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
              </div>
            </div>

            {/* Box 2 */}
            <div 
              className="rounded-lg p-6"
              style={{ backgroundColor: "rgba(46, 63, 158, 0.08)" }}
            >
              <h3 
                className="text-lg font-bold mb-2"
                style={{ color: "#2E3F9E" }}
              >
                Lorem ipsum
              </h3>
              <p 
                className="text-sm"
                style={{ color: "#4A4A5A" }}
              >
                Dolor sit amet consectetur.
              </p>
            </div>

            {/* Box 3 */}
            <div 
              className="rounded-lg p-6"
              style={{ backgroundColor: "rgba(46, 63, 158, 0.08)" }}
            >
              <h3 
                className="text-lg font-bold mb-2"
                style={{ color: "#2E3F9E" }}
              >
                Lorem ipsum
              </h3>
              <p 
                className="text-sm"
                style={{ color: "#4A4A5A" }}
              >
                Dolor sit amet consectetur.
              </p>
            </div>

            {/* Box 4 - Wide */}
            <div 
              className="col-span-2 rounded-lg p-6 relative overflow-hidden"
              style={{ backgroundColor: "#2E3F9E" }}
            >
              <div className="flex items-center gap-6">
                <div 
                  className="w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(245, 243, 235, 0.2)" }}
                >
                  <svg className="w-10 h-10" fill="#F5F3EB" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                </div>
                <div>
                  <h3 
                    className="text-lg font-bold"
                    style={{ color: "#F5F3EB" }}
                  >
                    Lorem ipsum
                  </h3>
                  <p 
                    className="text-sm mt-1 opacity-80"
                    style={{ color: "#F5F3EB" }}
                  >
                    Dolor sit amet consectetur adipiscing elit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original/Default Style
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
          {(recommendedScenario && typeof recommendedScenario === 'object') ? (
            /* Key Numbers */
            <>
              {('impressions' in recommendedScenario) ? (
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
              ) : null}

              {('budget' in recommendedScenario) ? (
                <div className="p-8 rounded-2xl" style={{ backgroundColor: slide.design.accentColor + "20" }}>
                  <div className="text-5xl font-black mb-2" style={{ color: slide.design.accentColor }}>
                    {String(recommendedScenario.budget)}
                  </div>
                  <div className="text-xl opacity-70">Budget</div>
                </div>
              ) : null}

              {('cpm' in recommendedScenario) ? (
                <div className="p-8 rounded-2xl" style={{ backgroundColor: slide.design.accentColor + "20" }}>
                  <div className="text-5xl font-black mb-2" style={{ color: slide.design.accentColor }}>
                    {String(recommendedScenario.cpm)}
                  </div>
                  <div className="text-xl opacity-70">CPM</div>
                </div>
              ) : null}
            </>
          ) : null}

          {/* Budget Breakdown Donut Chart */}
          {slide.content.customData?.budgetBreakdown && 
           Array.isArray(slide.content.customData.budgetBreakdown) && 
           slide.content.customData.budgetBreakdown.length > 0 ? (
            <div className="mt-6">
              <h4 className="text-2xl font-bold mb-4">Budget Allocation</h4>
              <DonutChart
                data={slide.content.customData.budgetBreakdown as any[]}
                height={300}
                innerRadius={60}
                outerRadius={100}
                centerLabel="Total"
                centerValue={
                  slide.content.customData.totalBudget && typeof slide.content.customData.totalBudget === 'number'
                    ? `€${(slide.content.customData.totalBudget / 1000).toFixed(0)}K`
                    : undefined
                }
              />
            </div>
          ) : null}

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
