import type { Slide } from "@/types";

interface GenericSlideProps {
  slide: Slide;
}

const GenericSlide = ({ slide }: GenericSlideProps) => {
  return (
    <div
      className="w-full h-full flex flex-col p-16"
      style={{
        backgroundColor: slide.design.backgroundColor,
        color: slide.design.textColor,
        fontFamily: slide.design.fontFamily,
      }}
    >
      {/* Header Section */}
      <div className="mb-12">
        {/* Accent Line */}
        <div 
          className="w-24 h-1.5 mb-6"
          style={{ backgroundColor: slide.design.accentColor }}
        />
        
        {/* Title */}
        <h1 className="text-6xl font-bold leading-tight tracking-tight mb-4">
          {slide.content.title}
        </h1>
        
        {/* Subtitle */}
        {slide.content.subtitle && (
          <h2 className="text-3xl font-light opacity-70">
            {slide.content.subtitle}
          </h2>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 space-y-8">
        {/* Body Text */}
        {slide.content.body && (
          <p className="text-2xl leading-relaxed opacity-90 max-w-4xl">
            {slide.content.body}
          </p>
        )}

        {/* Bullet Points - Modern Style */}
        {slide.content.bullets && slide.content.bullets.length > 0 && (
          <div className="grid grid-cols-1 gap-6 mt-8">
            {slide.content.bullets.map((bullet, index) => (
              <div 
                key={index} 
                className="flex items-start gap-6 p-6 rounded-lg transition-all"
                style={{ backgroundColor: slide.design.accentColor + '08' }}
              >
                <div
                  className="text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0"
                  style={{ 
                    backgroundColor: slide.design.accentColor,
                    color: slide.design.backgroundColor
                  }}
                >
                  {index + 1}
                </div>
                <span className="text-xl leading-relaxed flex-1 pt-1">{bullet}</span>
              </div>
            ))}
          </div>
        )}

        {/* Timeline - Modern Card Style */}
        {slide.content.timeline && slide.content.timeline.length > 0 && (
          <div className="grid grid-cols-2 gap-6 mt-8">
            {slide.content.timeline.map((item, index) => (
              <div 
                key={index} 
                className="p-6 rounded-xl"
                style={{ backgroundColor: slide.design.accentColor + '10' }}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl"
                    style={{ backgroundColor: slide.design.accentColor, color: "#FFFFFF" }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{item.phase}</h3>
                    {item.duration && (
                      <span className="text-sm opacity-60">{item.duration}</span>
                    )}
                  </div>
                </div>
                <p className="text-base opacity-80 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Hashtags (Creative Ideas) */}
        {slide.content.customData?.hashtags && Array.isArray(slide.content.customData.hashtags) && (
          <div className="flex flex-wrap gap-3 mt-6">
            {slide.content.customData.hashtags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-6 py-3 rounded-full text-lg font-semibold"
                style={{ 
                  backgroundColor: slide.design.accentColor,
                  color: "#FFFFFF"
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Claim (Creative Ideas - shown prominently if separate from subtitle) */}
        {slide.content.customData?.claim && slide.content.customData.claim !== slide.content.subtitle && (
          <div 
            className="mt-6 p-6 rounded-xl border-l-4"
            style={{ 
              backgroundColor: slide.design.accentColor + "10",
              borderColor: slide.design.accentColor
            }}
          >
            <div className="text-sm font-semibold uppercase opacity-60 mb-2">Campaign Claim</div>
            <div className="text-2xl font-bold italic">{slide.content.customData.claim}</div>
          </div>
        )}

        {/* Extra Activation Idea */}
        {slide.content.customData?.extra && (
          <div 
            className="mt-6 p-6 rounded-xl"
            style={{ backgroundColor: slide.design.accentColor + "08" }}
          >
            <div className="text-sm font-semibold uppercase opacity-60 mb-2">💡 Extra Activation</div>
            <div className="text-lg leading-relaxed">{slide.content.customData.extra}</div>
          </div>
        )}

        {/* Other Custom Data (fallback for unhandled fields) */}
        {slide.content.customData && Object.entries(slide.content.customData).some(([key]) => 
          !['hashtags', 'claim', 'extra', 'execution', 'contactInfo', 'campaignSummary', 'influencerPool', 'recommendedScenario', 'photoStyle', 'overlayText', 'layout', 'gridLayout', 'columns', 'layoutStyle', 'estimatedReadTime', 'keyNumbers'].includes(key)
        ) && (
          <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: slide.design.accentColor + "10" }}>
            {Object.entries(slide.content.customData).map(([key, value]) => {
              // Skip already-rendered fields
              if (['hashtags', 'claim', 'extra', 'execution', 'contactInfo', 'campaignSummary', 'influencerPool', 'recommendedScenario', 'photoStyle', 'overlayText', 'layout', 'gridLayout', 'columns', 'layoutStyle', 'estimatedReadTime', 'keyNumbers'].includes(key)) {
                return null;
              }
              
              if (typeof value === "object" && !Array.isArray(value)) {
                return null;
              }
              if (Array.isArray(value)) {
                return (
                  <div key={key} className="mb-3">
                    <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, " $1")}: </span>
                    <span>{value.join(", ")}</span>
                  </div>
                );
              }
              return (
                <div key={key} className="mb-3">
                  <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, " $1")}: </span>
                  <span>{String(value)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contact Info (for Next Steps slide) */}
      {slide.content.customData?.contactInfo && (
        <div className="mt-8 text-center">
          <div className="text-2xl font-bold mb-2">
            {slide.content.customData.contactInfo.agency}
          </div>
          <div className="text-lg">
            {slide.content.customData.contactInfo.email} | {slide.content.customData.contactInfo.phone}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenericSlide;
