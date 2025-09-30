import type { Slide } from "@/types";

interface TalentStrategySlideProps {
  slide: Slide;
}

const TalentStrategySlide = ({ slide }: TalentStrategySlideProps) => {
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
        <div className="grid grid-cols-4 gap-4 mb-8">
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

      {/* Influencer Grid */}
      {slide.content.influencers && slide.content.influencers.length > 0 && (
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
      )}
    </div>
  );
};

export default TalentStrategySlide;
