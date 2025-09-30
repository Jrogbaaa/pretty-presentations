import type { Slide } from "@/types";

interface GenericSlideProps {
  slide: Slide;
}

const GenericSlide = ({ slide }: GenericSlideProps) => {
  return (
    <div
      className="w-full h-full flex flex-col p-12"
      style={{
        backgroundColor: slide.design.backgroundColor,
        color: slide.design.textColor,
        fontFamily: slide.design.fontFamily,
      }}
    >
      <div className="mb-8">
        <h1 className="text-5xl font-bold">{slide.content.title}</h1>
        {slide.content.subtitle && (
          <h2 className="text-2xl mt-2 opacity-80">{slide.content.subtitle}</h2>
        )}
      </div>

      <div className="flex-1 space-y-6">
        {slide.content.body && (
          <p className="text-xl leading-relaxed">{slide.content.body}</p>
        )}

        {slide.content.bullets && slide.content.bullets.length > 0 && (
          <ul className="space-y-4">
            {slide.content.bullets.map((bullet, index) => (
              <li key={index} className="flex items-start gap-4 text-xl">
                <span
                  className="mt-2 w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: slide.design.accentColor }}
                />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Timeline */}
        {slide.content.timeline && slide.content.timeline.length > 0 && (
          <div className="space-y-4 mt-8">
            {slide.content.timeline.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0"
                  style={{ backgroundColor: slide.design.accentColor, color: "#FFFFFF" }}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">{item.phase}</h3>
                    <span className="text-sm opacity-70">{item.duration}</span>
                  </div>
                  <p className="text-base mt-1 opacity-80">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom Data Display */}
        {slide.content.customData && (
          <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: slide.design.accentColor + "10" }}>
            {Object.entries(slide.content.customData).map(([key, value]) => {
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
