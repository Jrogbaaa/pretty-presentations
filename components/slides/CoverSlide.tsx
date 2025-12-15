import type { Slide } from "@/types";

interface CoverSlideProps {
  slide: Slide;
  onEdit?: (field: string, value: string) => void;
}

const CoverSlide = ({ slide, onEdit }: CoverSlideProps) => {
  const isCorporateBrochure = slide.content.customData?.templateStyle === "corporate-brochure";
  const textColor = slide.design.textColor || "#FFFFFF";
  const accentColor = slide.design.accentColor || "#2E3F9E";
  const bgColor = slide.design.backgroundColor || "#2E3F9E";

  const hasBackgroundImage = slide.content.images && slide.content.images.length > 0;

  const handleContentEdit = (field: string, value: string) => {
    if (onEdit) {
      onEdit(field, value);
    }
  };

  // Corporate Brochure Style (matching the image reference)
  if (isCorporateBrochure || bgColor === "#2E3F9E") {
    return (
      <div className="w-full h-full flex relative" style={{ fontFamily: "Georgia, serif" }}>
        {/* Left Panel - Royal Blue with Title */}
        <div 
          className="w-1/2 h-full flex flex-col justify-between p-16 relative"
          style={{ backgroundColor: "#2E3F9E" }}
        >
          {/* Background Image with Blue Overlay */}
          {hasBackgroundImage && slide.content.images && (
            <>
              <div 
                className="absolute inset-0 z-0"
                style={{
                  backgroundImage: `url(${slide.content.images[0]})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  filter: 'grayscale(100%)',
                  opacity: 0.3,
                }}
              />
              <div 
                className="absolute inset-0 z-0"
                style={{
                  backgroundColor: "#2E3F9E",
                  opacity: 0.85,
                }}
              />
            </>
          )}

          {/* Content */}
          <div className="relative z-10">
            {/* Small decorative accent line */}
            <div 
              className="w-16 h-1 mb-8"
              style={{ backgroundColor: "#F5F3EB" }}
            />
          </div>

          {/* Main Title - Left Aligned, Large */}
          <div className="flex-1 flex flex-col justify-center relative z-10">
            <h1 
              className="text-8xl font-bold leading-tight mb-6 tracking-tight outline-none focus:ring-2 focus:ring-white/50 focus:ring-opacity-50 rounded"
              style={{ 
                color: "#FFFFFF",
                fontFamily: "Georgia, serif",
              }}
              contentEditable={!!onEdit}
              suppressContentEditableWarning
              onBlur={(e) => handleContentEdit('title', e.currentTarget.textContent || '')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
            >
              {slide.content.title || "INTRODUCTION"}
            </h1>
            
            {/* Body/Description */}
            {slide.content.body && (
              <p 
                className="text-xl leading-relaxed opacity-90 max-w-lg outline-none focus:ring-2 focus:ring-white/50 rounded"
                style={{ 
                  color: "#FFFFFF",
                  fontFamily: "Inter, sans-serif",
                }}
                contentEditable={!!onEdit}
                suppressContentEditableWarning
                onBlur={(e) => handleContentEdit('body', e.currentTarget.textContent || '')}
              >
                {slide.content.body}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="relative z-10">
            <div 
              className="text-sm tracking-widest uppercase opacity-80"
              style={{ color: "#FFFFFF", fontFamily: "Inter, sans-serif" }}
            >
              Look After You Agency
            </div>
          </div>
        </div>

        {/* Right Panel - Cream with Table of Contents */}
        <div 
          className="w-1/2 h-full flex flex-col p-16 relative"
          style={{ backgroundColor: "#F5F3EB" }}
        >
          {/* Decorative vertical text */}
          <div 
            className="absolute right-16 top-1/2 -translate-y-1/2 origin-center"
            style={{ 
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg) translateY(50%)',
            }}
          >
            <span 
              className="text-6xl font-bold tracking-wider opacity-20"
              style={{ 
                color: "#2E3F9E",
                fontFamily: "Georgia, serif",
              }}
            >
              TABLE OF CONTENT
            </span>
          </div>

          {/* Table of Contents */}
          <div className="flex-1 flex flex-col justify-center relative z-10 pr-32">
            <div className="space-y-6">
              {[
                { num: "01", label: "ABOUT US" },
                { num: "02", label: "OUR VISION" },
                { num: "03", label: "OUR SERVICES" },
                { num: "04", label: "OUR CREATIVE WORK" },
                { num: "05", label: "OUR CREATIVE TEAM" },
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-6 group"
                >
                  <span 
                    className="text-2xl font-bold"
                    style={{ color: "#2E3F9E", fontFamily: "Georgia, serif" }}
                  >
                    {item.num}
                  </span>
                  <div 
                    className="flex-1 h-px opacity-30"
                    style={{ backgroundColor: "#2E3F9E" }}
                  />
                  <span 
                    className="text-lg tracking-wide"
                    style={{ color: "#1A1A2E", fontFamily: "Inter, sans-serif" }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Subtitle/Brand */}
          <div className="relative z-10">
            {slide.content.subtitle && (
              <div 
                className="text-2xl font-bold tracking-tight outline-none focus:ring-2 focus:ring-blue-500/50 rounded"
                style={{ 
                  color: "#2E3F9E",
                  fontFamily: "Georgia, serif",
                }}
                contentEditable={!!onEdit}
                suppressContentEditableWarning
                onBlur={(e) => handleContentEdit('subtitle', e.currentTarget.textContent || '')}
              >
                {slide.content.subtitle}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default/Original Style
  return (
    <div
      className="w-full h-full flex flex-col relative p-20"
      style={{
        backgroundColor: slide.design.backgroundColor,
        color: textColor,
        fontFamily: slide.design.fontFamily,
      }}
    >
      {/* Background Image with Overlay */}
      {hasBackgroundImage && slide.content.images && (
        <>
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${slide.content.images[0]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          {/* Dark overlay for better text readability */}
          <div 
            className="absolute inset-0 z-0"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.3) 100%)',
            }}
          />
        </>
      )}

      {/* Main Content - Left Aligned with Modern Layout */}
      <div className="flex-1 flex flex-col justify-center max-w-5xl relative z-10">
        {/* Subtitle/Tagline */}
        {slide.content.subtitle && (
          <div className="mb-8">
            <div 
              className="inline-block px-6 py-3 text-lg font-bold tracking-widest uppercase rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              style={{
                backgroundColor: accentColor + '30',
                color: accentColor,
                border: `2px solid ${accentColor}`,
              }}
              contentEditable={!!onEdit}
              suppressContentEditableWarning
              onBlur={(e) => handleContentEdit('subtitle', e.currentTarget.textContent || '')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
            >
              {slide.content.subtitle}
            </div>
          </div>
        )}

        {/* Main Title - Extra Large with Shadow for Visibility */}
        <h1 
          className="text-9xl font-black leading-none mb-10 tracking-tight outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-2 -ml-2"
          style={{
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
          contentEditable={!!onEdit}
          suppressContentEditableWarning
          onBlur={(e) => handleContentEdit('title', e.currentTarget.textContent || '')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        >
          {slide.content.title}
        </h1>

        {/* Body/Description */}
        {slide.content.body && (
          <div 
            className="text-3xl font-light leading-relaxed opacity-90 max-w-3xl outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-2 -ml-2"
            contentEditable={!!onEdit}
            suppressContentEditableWarning
            onBlur={(e) => handleContentEdit('body', e.currentTarget.textContent || '')}
          >
            {slide.content.body}
          </div>
        )}
      </div>

      {/* Footer with Agency Branding */}
      <div className="flex items-end justify-between mt-auto pt-8 relative z-10">
        <div>
          <div className="text-4xl font-bold tracking-tight" style={{ color: textColor }}>
            Look After You
          </div>
          <div className="text-lg opacity-70 mt-2">Influencer Talent Agency</div>
        </div>
        {slide.content.customData && typeof slide.content.customData === 'object' && 'date' in slide.content.customData && (
          <div className="text-lg opacity-70">
            {String(slide.content.customData.date)}
          </div>
        )}
      </div>

      {/* Decorative Element - Only show if no background image */}
      {!hasBackgroundImage && (
        <div 
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{
            background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
          }}
        />
      )}
    </div>
  );
};

export default CoverSlide;
