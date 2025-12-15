import type { Slide } from "@/types";
import { BarChartComparison, AnimatedNumber } from "@/components/charts";

interface TalentStrategySlideProps {
  slide: Slide;
  onEdit?: (field: string, value: string) => void;
}

const TalentStrategySlide = ({ slide, onEdit }: TalentStrategySlideProps) => {
  const influencerPool = slide.content.customData?.influencerPool;
  const hasRichData = influencerPool && Array.isArray(influencerPool) && influencerPool.length > 0;

  // Check for corporate brochure style
  const isCorporateBrochure = 
    slide.design.backgroundColor === "#F5F3EB" || 
    slide.design.accentColor === "#2E3F9E" ||
    slide.content.customData?.templateStyle === "corporate-brochure";

  // Corporate Brochure Style - Our Creative Team layout
  if (isCorporateBrochure) {
    const influencers = slide.content.influencers || [];

    return (
      <div className="w-full h-full flex relative" style={{ fontFamily: "Inter, sans-serif" }}>
        {/* Left Panel - Blue with title and founder message */}
        <div 
          className="w-2/5 h-full flex flex-col p-16 relative"
          style={{ backgroundColor: "#2E3F9E" }}
        >
          {/* Background pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Section Title */}
          <div className="mb-12 relative z-10">
            <h1 
              className="text-4xl font-bold tracking-tight uppercase mb-4"
              style={{ color: "#FFFFFF", fontFamily: "Georgia, serif" }}
            >
              {slide.content.title || "OUR CREATIVE TEAM"}
            </h1>
            <div 
              className="w-16 h-1"
              style={{ backgroundColor: "#F5F3EB" }}
            />
          </div>

          {/* Our Skill badges */}
          <div className="mb-12 relative z-10">
            <h2 
              className="text-lg font-semibold uppercase tracking-wider mb-6"
              style={{ color: "#F5F3EB" }}
            >
              OUR SKILL
            </h2>
            <div className="flex flex-wrap gap-3">
              {["Influencer Matching", "Content Strategy", "Campaign Analytics", "Brand Partnerships"].map((skill, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 text-sm font-medium rounded-full"
                  style={{ 
                    backgroundColor: "rgba(245, 243, 235, 0.15)",
                    color: "#F5F3EB",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Words of Founder */}
          <div className="flex-1 relative z-10">
            <h2 
              className="text-lg font-semibold uppercase tracking-wider mb-6"
              style={{ color: "#F5F3EB" }}
            >
              WORDS OF FOUNDER
            </h2>
            <div 
              className="p-6 rounded-lg"
              style={{ backgroundColor: "rgba(245, 243, 235, 0.1)" }}
            >
              <p 
                className="text-base leading-relaxed italic mb-4"
                style={{ color: "#F5F3EB" }}
              >
                {slide.content.body || "\"We believe in creating authentic connections between brands and audiences through strategic influencer partnerships.\""}
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: "#F5F3EB", color: "#2E3F9E" }}
                >
                  LA
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: "#F5F3EB" }}>
                    Look After You
                  </div>
                  <div className="text-xs opacity-70" style={{ color: "#F5F3EB" }}>
                    Agency Team
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Cream with team members grid */}
        <div 
          className="w-3/5 h-full flex flex-col p-16 relative"
          style={{ backgroundColor: "#F5F3EB" }}
        >
          {/* Team Grid */}
          <div className="grid grid-cols-3 gap-6 flex-1">
            {(influencers.length > 0 ? influencers.slice(0, 6) : [
              { name: "Your Name", handle: "role1" },
              { name: "Your Name", handle: "role2" },
              { name: "Your Name", handle: "role3" },
              { name: "Your Name", handle: "role4" },
              { name: "Your Name", handle: "role5" },
              { name: "Your Name", handle: "role6" },
            ]).map((member: any, index: number) => (
              <div 
                key={index}
                className="flex flex-col items-center text-center group"
              >
                {/* Profile Image */}
                <div 
                  className="w-28 h-28 rounded-full overflow-hidden mb-4 relative"
                  style={{ backgroundColor: "rgba(46, 63, 158, 0.1)" }}
                >
                  {/* Placeholder avatar */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="w-full h-full flex items-center justify-center text-3xl font-bold"
                      style={{ 
                        backgroundColor: "#2E3F9E",
                        color: "#F5F3EB",
                      }}
                    >
                      {member.name ? member.name.charAt(0).toUpperCase() : 'Y'}
                    </div>
                  </div>
                </div>
                
                {/* Name */}
                <h3 
                  className="text-base font-bold mb-1"
                  style={{ color: "#1A1A2E" }}
                >
                  {member.name || "YOUR NAME"}
                </h3>
                
                {/* Role/Handle */}
                <p 
                  className="text-xs uppercase tracking-wider"
                  style={{ color: "#2E3F9E" }}
                >
                  {member.handle ? `@${member.handle.replace('@', '')}` : "YOUR ROLE"}
                </p>

                {/* Stats if available */}
                {member.followers && (
                  <div className="mt-2 text-xs" style={{ color: "#6B7280" }}>
                    <AnimatedNumber value={member.followers} decimals={0} />
                    <span className="ml-1">followers</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Metrics at bottom */}
          {slide.content.metrics && slide.content.metrics.length > 0 && (
            <div className="mt-8 pt-8 border-t" style={{ borderColor: "rgba(46, 63, 158, 0.2)" }}>
              <div className="grid grid-cols-4 gap-6">
                {slide.content.metrics.slice(0, 4).map((metric: any, index: number) => (
                  <div key={index} className="text-center">
                    <div 
                      className="text-2xl font-bold"
                      style={{ color: "#2E3F9E" }}
                    >
                      {metric.value || metric}
                    </div>
                    <div 
                      className="text-xs uppercase tracking-wider mt-1"
                      style={{ color: "#6B7280" }}
                    >
                      {metric.label || "Metric"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Original/Default Style
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

      {/* Metrics Overview - Now with Bar Chart Visualization */}
      {slide.content.customData?.chartData && 
       Array.isArray(slide.content.customData.chartData) && 
       slide.content.customData.chartData.length > 0 ? (
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-3">Engagement Rate Comparison</h3>
          <BarChartComparison
            data={slide.content.customData.chartData as any[]}
            metric="%"
            averageLine={
              slide.content.customData.average && typeof slide.content.customData.average === 'number'
                ? slide.content.customData.average
                : undefined
            }
            averageLabel="Industry Average"
            height={180}
          />
          {(slide.content.customData.insight && typeof slide.content.customData.insight === 'string') ? (
            <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: slide.design.accentColor + "15" }}>
              <p className="text-sm italic">💡 <strong>Insight:</strong> {String(slide.content.customData.insight)}</p>
            </div>
          ) : null}
        </div>
      ) : slide.content.metrics && slide.content.metrics.length > 0 ? (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {slide.content.metrics.map((metric, index) => (
            <div
              key={index}
              className="p-4 rounded-lg"
              style={{ backgroundColor: slide.design.accentColor + "20" }}
            >
              <div className="text-sm opacity-70">{metric.label}</div>
              <div className="text-2xl font-bold mt-1">
                <AnimatedNumber value={typeof metric.value === 'number' ? metric.value : parseFloat(String(metric.value)) || 0} />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Rich Influencer Pool Display (with demographics) */}
      {hasRichData ? (
        <div className="flex-1 overflow-y-auto space-y-4 max-h-[600px]">
          {influencerPool.map((pool: any, poolIndex: number) => (
            <div key={poolIndex}>
              <h3 
                className="text-lg font-bold mb-3 pb-1 border-b-2"
                style={{ borderColor: slide.design.accentColor }}
              >
                {pool.category}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {pool.influencers.map((inf: any, infIndex: number) => (
                  <div
                    key={infIndex}
                    className="bg-white rounded-lg p-3 shadow-md"
                    style={{ color: "#1F2937" }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                        {inf.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base truncate">{inf.name}</h4>
                        {inf.handle && (
                          <p className="text-xs text-gray-600">@{inf.handle.replace('@', '')}</p>
                        )}
                        <div className="grid grid-cols-2 gap-2 mt-1.5 text-xs">
                          <div>
                            <span className="text-gray-600">Followers:</span>
                            <span className="font-semibold ml-1">
                              <AnimatedNumber 
                                value={inf.followers} 
                                decimals={0}
                                className="inline-block"
                              />
                            </span>
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
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="text-xs font-semibold text-gray-600 mb-0.5">Deliverables:</div>
                            <div className="flex flex-wrap gap-1">
                              {inf.deliverables.slice(0, 3).map((del: string, delIndex: number) => (
                                <span
                                  key={delIndex}
                                  className="text-xs px-1.5 py-0.5 rounded-full"
                                  style={{ 
                                    backgroundColor: slide.design.accentColor + "30",
                                    color: "#1F2937"
                                  }}
                                >
                                  {del}
                                </span>
                              ))}
                              {inf.deliverables.length > 3 && (
                                <span className="text-xs text-gray-500">+{inf.deliverables.length - 3}</span>
                              )}
                            </div>
                          </div>
                        )}
                        {inf.reason && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs italic text-gray-700 leading-snug line-clamp-2">{inf.reason}</p>
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
