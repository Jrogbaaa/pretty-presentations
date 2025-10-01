import type { Slide } from "@/types";

interface RecommendedScenarioSlideProps {
  slide: Slide;
}

const RecommendedScenarioSlide = ({ slide }: RecommendedScenarioSlideProps) => {
  const scenario = slide.content.customData?.recommendedScenario;

  return (
    <div
      className="w-full h-full flex flex-col p-12"
      style={{
        backgroundColor: slide.design.backgroundColor,
        color: slide.design.textColor,
        fontFamily: slide.design.fontFamily,
      }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-bold">{slide.content.title}</h1>
        {slide.content.subtitle && (
          <h2 className="text-2xl mt-2 opacity-80">{slide.content.subtitle}</h2>
        )}
      </div>

      <div className="flex-1 grid grid-cols-2 gap-8">
        {/* Left Column: Influencer Mix & Content Plan */}
        <div className="space-y-6">
          {/* Influencer Mix */}
          {scenario?.influencerMix && (
            <div
              className="p-6 rounded-xl"
              style={{ backgroundColor: slide.design.accentColor + "15" }}
            >
              <h3 className="text-xl font-bold mb-4">Influencer Mix</h3>
              
              {scenario.influencerMix.forHer && scenario.influencerMix.forHer.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-semibold uppercase opacity-70 mb-2">For Her</div>
                  <div className="space-y-1">
                    {scenario.influencerMix.forHer.map((name: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: slide.design.accentColor }}
                        />
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {scenario.influencerMix.forHim && scenario.influencerMix.forHim.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-semibold uppercase opacity-70 mb-2">For Him</div>
                  <div className="space-y-1">
                    {scenario.influencerMix.forHim.map((name: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: slide.design.accentColor }}
                        />
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {scenario.influencerMix.unisex && scenario.influencerMix.unisex.length > 0 && (
                <div>
                  <div className="text-sm font-semibold uppercase opacity-70 mb-2">Unisex</div>
                  <div className="space-y-1">
                    {scenario.influencerMix.unisex.map((name: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: slide.design.accentColor }}
                        />
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content Plan */}
          {scenario?.contentPlan && (
            <div
              className="p-6 rounded-xl"
              style={{ backgroundColor: slide.design.accentColor + "15" }}
            >
              <h3 className="text-xl font-bold mb-4">Content Plan</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(scenario.contentPlan).map(([key, value]: [string, any]) => {
                  if (typeof value === 'number') {
                    return (
                      <div
                        key={key}
                        className="p-4 rounded-lg bg-white/10 text-center"
                      >
                        <div className="text-3xl font-bold">{value}</div>
                        <div className="text-sm capitalize mt-1">{key}</div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Key Metrics */}
        <div className="space-y-6">
          {/* Impressions */}
          {scenario?.impressions && (
            <div
              className="p-8 rounded-xl text-center"
              style={{ backgroundColor: slide.design.accentColor + "20" }}
            >
              <div className="text-sm font-semibold uppercase opacity-70 mb-2">
                Projected Impressions
              </div>
              <div className="text-6xl font-bold">{scenario.impressions}</div>
            </div>
          )}

          {/* Budget & CPM */}
          <div className="grid grid-cols-2 gap-6">
            {scenario?.budget && (
              <div
                className="p-6 rounded-xl"
                style={{ backgroundColor: slide.design.accentColor + "15" }}
              >
                <div className="text-sm font-semibold uppercase opacity-70 mb-2">
                  Total Budget
                </div>
                <div className="text-4xl font-bold">{scenario.budget}</div>
              </div>
            )}

            {scenario?.cpm && (
              <div
                className="p-6 rounded-xl"
                style={{ backgroundColor: slide.design.accentColor + "15" }}
              >
                <div className="text-sm font-semibold uppercase opacity-70 mb-2">CPM</div>
                <div className="text-4xl font-bold">{scenario.cpm}</div>
              </div>
            )}
          </div>

          {/* Additional Metrics Box */}
          <div
            className="p-6 rounded-xl"
            style={{ backgroundColor: slide.design.accentColor + "10" }}
          >
            <h3 className="text-lg font-bold mb-3">Campaign Summary</h3>
            <div className="space-y-2 text-sm">
              {scenario?.impressions && (
                <div className="flex justify-between">
                  <span className="opacity-70">Reach:</span>
                  <span className="font-semibold">{scenario.impressions}</span>
                </div>
              )}
              {scenario?.budget && (
                <div className="flex justify-between">
                  <span className="opacity-70">Investment:</span>
                  <span className="font-semibold">{scenario.budget}</span>
                </div>
              )}
              {scenario?.cpm && (
                <div className="flex justify-between">
                  <span className="opacity-70">Cost per Mile:</span>
                  <span className="font-semibold">{scenario.cpm}</span>
                </div>
              )}
              {scenario?.contentPlan && (
                <div className="flex justify-between pt-2 border-t border-white/20">
                  <span className="opacity-70">Total Content Pieces:</span>
                  <span className="font-semibold">
                    {Object.values(scenario.contentPlan)
                      .filter((v) => typeof v === 'number')
                      .reduce((sum: number, v: any) => sum + v, 0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendedScenarioSlide;

