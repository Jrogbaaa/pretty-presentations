import type { Slide } from "@/types";

interface TalentStrategySlideProps {
  slide: Slide;
}

const TalentStrategySlide = ({ slide }: TalentStrategySlideProps) => {
  const influencerPool = slide.content.customData?.influencerPool;
  const hasRichData = influencerPool && Array.isArray(influencerPool) && influencerPool.length > 0;

  return (
    <div
      className="w-full h-full flex flex-col p-12"
      style={{
        backgroundColor: slide.design.backgroundColor,
        color: slide.design.textColor,
        fontFamily: slide.design.fontFamily,
      }}
    >
      <div className="mb-6">
        <h1 className="text-5xl font-bold">{slide.content.title}</h1>
        {slide.content.subtitle && (
          <h2 className="text-2xl mt-2 opacity-80">{slide.content.subtitle}</h2>
        )}
      </div>

      {slide.content.body && (
        <p className="text-lg mb-6 leading-relaxed">{slide.content.body}</p>
      )}

      {/* Metrics Overview */}
      {slide.content.metrics && slide.content.metrics.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {slide.content.metrics.map((metric, index) => (
            <div
              key={index}
              className="p-4 rounded-lg"
              style={{ backgroundColor: slide.design.accentColor + "20" }}
            >
              <div className="text-sm opacity-70">{metric.label}</div>
              <div className="text-2xl font-bold mt-1">{metric.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Rich Influencer Pool Display (with demographics) */}
      {hasRichData ? (
        <div className="flex-1 overflow-y-auto space-y-6">
          {influencerPool.map((pool: any, poolIndex: number) => (
            <div key={poolIndex}>
              <h3 
                className="text-xl font-bold mb-4 pb-2 border-b-2"
                style={{ borderColor: slide.design.accentColor }}
              >
                {pool.category}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {pool.influencers.map((inf: any, infIndex: number) => (
                  <div
                    key={infIndex}
                    className="bg-white rounded-xl p-4 shadow-lg"
                    style={{ color: "#1F2937" }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                        {inf.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg truncate">{inf.name}</h4>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          <div>
                            <span className="text-gray-600">Followers:</span>
                            <span className="font-semibold ml-1">{inf.followers.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">ER:</span>
                            <span className="font-semibold ml-1">{inf.engagement}</span>
                          </div>
                          {inf.genderSplit && (
                            <div>
                              <span className="text-gray-600">Gender:</span>
                              <span className="font-semibold ml-1">{inf.genderSplit.female}%F / {inf.genderSplit.male}%M</span>
                            </div>
                          )}
                          {inf.geo && (
                            <div>
                              <span className="text-gray-600">Geo:</span>
                              <span className="font-semibold ml-1">{inf.geo}</span>
                            </div>
                          )}
                          {inf.credibleAudience && (
                            <div className="col-span-2">
                              <span className="text-gray-600">Credible:</span>
                              <span className="font-semibold ml-1 text-green-600">{inf.credibleAudience}</span>
                            </div>
                          )}
                        </div>
                        {inf.deliverables && inf.deliverables.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs font-semibold text-gray-600 mb-1">Deliverables:</div>
                            <div className="flex flex-wrap gap-1">
                              {inf.deliverables.map((del: string, delIndex: number) => (
                                <span
                                  key={delIndex}
                                  className="text-xs px-2 py-1 rounded-full"
                                  style={{ 
                                    backgroundColor: slide.design.accentColor + "30",
                                    color: "#1F2937"
                                  }}
                                >
                                  {del}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {inf.reason && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs italic text-gray-700 leading-relaxed">{inf.reason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Fallback: Standard Influencer Grid (when rich data not available) */
        slide.content.influencers && slide.content.influencers.length > 0 && (
          <div className="grid grid-cols-4 gap-4 flex-1">
            {slide.content.influencers.slice(0, 8).map((influencer, index) => (
              <div
                key={index}
                className="bg-white rounded-lg overflow-hidden shadow-md flex flex-col"
                style={{ color: "#1F2937" }}
              >
                <div className="aspect-square bg-gray-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-gray-400">
                    {influencer.name.charAt(0)}
                  </div>
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-bold text-sm">{influencer.name}</h3>
                  <p className="text-xs text-gray-600">@{influencer.handle}</p>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Followers:</span>
                      <span className="font-semibold">{(influencer.followers / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Engagement:</span>
                      <span className="font-semibold">{influencer.engagement}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default TalentStrategySlide;
