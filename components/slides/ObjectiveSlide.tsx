import type { Slide } from "@/types";

interface ObjectiveSlideProps {
  slide: Slide;
  onEdit?: (field: string, value: string) => void;
}

const ObjectiveSlide = ({ slide, onEdit }: ObjectiveSlideProps) => {
  const hasImage = slide.content.images && slide.content.images.length > 0;

  // Check for corporate brochure style
  const isCorporateBrochure = 
    slide.design.backgroundColor === "#F5F3EB" || 
    slide.design.accentColor === "#2E3F9E" ||
    slide.content.customData?.templateStyle === "corporate-brochure";

  // Corporate Brochure Style - Service / Vision layout
  if (isCorporateBrochure) {
    return (
      <div className="w-full h-full flex relative" style={{ fontFamily: "Inter, sans-serif" }}>
        {/* Left Panel - Cream with content */}
        <div 
          className="w-1/2 h-full flex flex-col p-16 relative"
          style={{ backgroundColor: "#F5F3EB" }}
        >
          {/* Section Header */}
          <div className="mb-8">
            <h1 
              className="text-4xl font-bold tracking-tight uppercase mb-4"
              style={{ color: "#1A1A2E", fontFamily: "Georgia, serif" }}
            >
              {slide.content.title || "OUR SERVICE"}
            </h1>
            <div 
              className="w-16 h-1"
              style={{ backgroundColor: "#2E3F9E" }}
            />
          </div>

          {/* Service Content */}
          <div className="flex-1 space-y-6">
            {/* Main description */}
            {slide.content.body && (
              <p 
                className="text-lg leading-relaxed mb-8"
                style={{ color: "#4A4A5A" }}
              >
                {String(slide.content.body)}
              </p>
            )}

            {/* Service Items */}
            <div className="space-y-6">
              {(slide.content.bullets || [
                "Strategic influencer partnerships",
                "Content creation and curation",
                "Campaign management and analytics"
              ]).slice(0, 4).map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 p-4 rounded-lg transition-all"
                  style={{ backgroundColor: "rgba(46, 63, 158, 0.05)" }}
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#2E3F9E" }}
                  >
                    <span className="text-white font-bold text-sm">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p 
                      className="text-base font-medium"
                      style={{ color: "#1A1A2E" }}
                    >
                      {String(item)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Percentage Circles */}
            <div className="flex gap-8 mt-8">
              {[
                { value: "50%", label: "YOUR TEXT HERE" },
                { value: "50%", label: "YOUR TEXT HERE" },
              ].map((stat, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center relative"
                    style={{ backgroundColor: "#2E3F9E" }}
                  >
                    <span className="text-2xl font-bold text-white">
                      {stat.value}
                    </span>
                  </div>
                  <div 
                    className="text-xs uppercase tracking-wider max-w-20"
                    style={{ color: "#4A4A5A" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Blue with images */}
        <div 
          className="w-1/2 h-full relative overflow-hidden"
          style={{ backgroundColor: "#2E3F9E" }}
        >
          {/* Background Image */}
          {hasImage && slide.content.images && (
            <div 
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `url(${slide.content.images[0]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'grayscale(100%)',
                opacity: 0.4,
              }}
            />
          )}

          {/* Overlay pattern */}
          <div 
            className="absolute inset-0 z-10"
            style={{
              background: 'linear-gradient(135deg, rgba(46, 63, 158, 0.9) 0%, rgba(30, 42, 110, 0.95) 100%)',
            }}
          />

          {/* Grid of images (decorative) */}
          <div className="absolute inset-0 z-20 grid grid-cols-2 gap-4 p-8">
            {/* Top left - large image */}
            <div 
              className="col-span-1 row-span-2 rounded-lg overflow-hidden"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.1)',
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-16 h-16 opacity-30" fill="white" viewBox="0 0 24 24">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
              </div>
            </div>
            
            {/* Top right */}
            <div 
              className="rounded-lg overflow-hidden"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-12 h-12 opacity-30" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </div>

            {/* Bottom right */}
            <div 
              className="rounded-lg overflow-hidden"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-12 h-12 opacity-30" fill="white" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Bottom info section */}
          <div className="absolute bottom-8 left-8 right-8 z-30">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#F5F3EB" }}
              >
                <svg className="w-6 h-6" fill="#2E3F9E" viewBox="0 0 24 24">
                  <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44A.991.991 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18.21 0 .41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9z"/>
                </svg>
              </div>
              <div>
                <div className="text-white font-bold text-sm">Look After You</div>
                <div className="text-white/70 text-xs">Influencer Agency</div>
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
      className="w-full h-full flex flex-col p-12 relative"
      style={{
        backgroundColor: slide.design.backgroundColor,
        color: slide.design.textColor,
        fontFamily: slide.design.fontFamily,
      }}
    >
      {/* Background Image with Overlay */}
      {hasImage && slide.content.images && (
        <>
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${slide.content.images[0]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.2,
            }}
          />
          <div 
            className="absolute inset-0 z-0"
            style={{
              background: `linear-gradient(135deg, ${slide.design.backgroundColor}DD 0%, ${slide.design.backgroundColor}AA 100%)`,
            }}
          />
        </>
      )}

      <h1 className="text-5xl font-bold mb-8 relative z-10">{slide.content.title}</h1>
      
      <div className="flex-1 flex flex-col justify-center space-y-8 relative z-10">
        <p className="text-2xl leading-relaxed">{slide.content.body}</p>
        
        {slide.content.bullets && slide.content.bullets.length > 0 && (
          <div className="space-y-4 mt-8">
            <h3 className="text-2xl font-semibold">Campaign Goals:</h3>
            <ul className="space-y-3">
              {slide.content.bullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-4 text-xl">
                  <span
                    className="mt-1 w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: slide.design.accentColor }}
                  />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ObjectiveSlide;
