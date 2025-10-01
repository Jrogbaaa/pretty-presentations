import type { Slide } from "@/types";

interface CoverSlideProps {
  slide: Slide;
  onEdit?: (field: string, value: string) => void;
}

const CoverSlide = ({ slide, onEdit }: CoverSlideProps) => {
  // Ensure good contrast - if background is too dark, make text brighter
  const textColor = slide.design.textColor || "#FFFFFF";
  const accentColor = slide.design.accentColor || "#FFC806";

  return (
    <div
      className="w-full h-full flex flex-col relative p-20"
      style={{
        backgroundColor: slide.design.backgroundColor,
        color: textColor,
        fontFamily: slide.design.fontFamily,
      }}
    >
      {/* Main Content - Left Aligned with Modern Layout */}
      <div className="flex-1 flex flex-col justify-center max-w-5xl">
        {/* Subtitle/Tagline */}
        {slide.content.subtitle && (
          <div className="mb-8">
            <div 
              className="inline-block px-6 py-3 text-lg font-bold tracking-widest uppercase rounded-lg"
              style={{
                backgroundColor: accentColor + '30',
                color: accentColor,
                border: `2px solid ${accentColor}`,
              }}
            >
              {slide.content.subtitle}
            </div>
          </div>
        )}

        {/* Main Title - Extra Large with Shadow for Visibility */}
        <h1 
          className="text-9xl font-black leading-none mb-10 tracking-tight"
          style={{
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          {slide.content.title}
        </h1>

        {/* Body/Description */}
        {slide.content.body && (
          <div className="text-3xl font-light leading-relaxed opacity-90 max-w-3xl">
            {slide.content.body}
          </div>
        )}
      </div>

      {/* Footer with Agency Branding */}
      <div className="flex items-end justify-between mt-auto pt-8">
        <div>
          <div className="text-4xl font-bold tracking-tight" style={{ color: textColor }}>
            Look After You
          </div>
          <div className="text-lg opacity-70 mt-2">Influencer Talent Agency</div>
        </div>
        {slide.content.date && (
          <div className="text-lg opacity-70">
            {slide.content.date}
          </div>
        )}
      </div>

      {/* Decorative Element */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
        style={{
          background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
        }}
      />
    </div>
  );
};

export default CoverSlide;
