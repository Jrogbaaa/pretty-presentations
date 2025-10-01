import type { Slide } from "@/types";

interface CoverSlideProps {
  slide: Slide;
}

const CoverSlide = ({ slide }: CoverSlideProps) => {
  return (
    <div
      className="w-full h-full flex flex-col relative p-16"
      style={{
        backgroundColor: slide.design.backgroundColor,
        color: slide.design.textColor,
        fontFamily: slide.design.fontFamily,
      }}
    >
      {/* Main Content - Left Aligned with Modern Layout */}
      <div className="flex-1 flex flex-col justify-center max-w-5xl">
        {/* Subtitle/Tagline */}
        {slide.content.subtitle && (
          <div className="mb-6">
            <div 
              className="inline-block px-4 py-2 text-sm font-semibold tracking-widest uppercase"
              style={{
                backgroundColor: slide.design.accentColor + '20',
                color: slide.design.accentColor,
              }}
            >
              {slide.content.subtitle}
            </div>
          </div>
        )}

        {/* Main Title - Extra Large */}
        <h1 className="text-8xl font-black leading-none mb-8 tracking-tight">
          {slide.content.title}
        </h1>

        {/* Body/Description */}
        {slide.content.body && (
          <div className="text-2xl font-light leading-relaxed opacity-80 max-w-3xl">
            {slide.content.body}
          </div>
        )}
      </div>

      {/* Footer with Agency Branding */}
      <div className="flex items-end justify-between mt-auto">
        <div>
          <div className="text-3xl font-bold tracking-tight">Look After You</div>
          <div className="text-sm opacity-60 mt-1">Influencer Talent Agency</div>
        </div>
        {slide.content.date && (
          <div className="text-sm opacity-60">
            {slide.content.date}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoverSlide;
