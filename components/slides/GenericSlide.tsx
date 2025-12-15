import type { Slide } from "@/types";

interface GenericSlideProps {
  slide: Slide;
  onEdit?: (field: string, value: string) => void;
}

const GenericSlide = ({ slide, onEdit }: GenericSlideProps) => {
  const hasContent = slide.content.bullets || slide.content.metrics || slide.content.timeline;
  const hasImage = slide.content.images && slide.content.images.length > 0;

  // Check for corporate brochure style
  const isCorporateBrochure = 
    slide.design.backgroundColor === "#F5F3EB" || 
    slide.design.accentColor === "#2E3F9E" ||
    slide.content.customData?.templateStyle === "corporate-brochure";

  const handleContentEdit = (field: string, value: string) => {
    if (onEdit) {
      onEdit(field, value);
    }
  };

  // Corporate Brochure Style - Our Vision / Service style
  if (isCorporateBrochure) {
    const slideType = slide.type;
    const isVisionSlide = slideType === "objective" || slide.title?.toLowerCase().includes("vision");
    const isServiceSlide = slideType === "media-strategy" || slide.title?.toLowerCase().includes("service");

    return (
      <div className="w-full h-full flex relative" style={{ fontFamily: "Inter, sans-serif" }}>
        {/* Left Panel - Blue with numbered steps or content */}
        <div 
          className="w-1/2 h-full flex flex-col p-16 relative"
          style={{ backgroundColor: "#2E3F9E" }}
        >
          {/* Background pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Section Title */}
          <div className="mb-12 relative z-10">
            <h1 
              className="text-4xl font-bold tracking-tight uppercase"
              style={{ color: "#FFFFFF", fontFamily: "Georgia, serif" }}
              contentEditable={!!onEdit}
              suppressContentEditableWarning
              onBlur={(e) => handleContentEdit('title', e.currentTarget.textContent || '')}
            >
              {slide.content.title || slide.title || "OUR VISION"}
            </h1>
            <div 
              className="w-16 h-1 mt-4"
              style={{ backgroundColor: "#F5F3EB" }}
            />
          </div>

          {/* Numbered Steps - Corporate style */}
          <div className="flex-1 relative z-10">
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div 
                  key={num}
                  className={`flex-1 flex flex-col items-center ${num <= 3 ? '' : 'opacity-100'}`}
                >
                  <div 
                    className={`text-4xl font-bold mb-2 ${num === 4 ? 'text-white' : 'text-white/40'}`}
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {String(num).padStart(2, '0')}
                  </div>
                  <div 
                    className={`text-xs uppercase tracking-wider text-center ${num === 4 ? 'opacity-100' : 'opacity-40'}`}
                    style={{ color: "#F5F3EB" }}
                  >
                    Lorem ipsum
                  </div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-8 relative">
              <div 
                className="h-1 w-full opacity-30"
                style={{ backgroundColor: "#F5F3EB" }}
              />
              <div 
                className="absolute top-0 left-0 h-1 w-1/2"
                style={{ backgroundColor: "#F5F3EB" }}
              />
            </div>

            {/* Content bullets below if available */}
            {slide.content.bullets && Array.isArray(slide.content.bullets) && (
              <div className="mt-12 space-y-4">
                {slide.content.bullets.slice(0, 4).map((bullet, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div 
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: "#F5F3EB" }}
                    />
                    <p 
                      className="text-base leading-relaxed"
                      style={{ color: "#FFFFFF" }}
                      contentEditable={!!onEdit}
                      suppressContentEditableWarning
                      onBlur={(e) => handleContentEdit(`bullet-${index}`, e.currentTarget.textContent || '')}
                    >
                      {String(bullet)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Cream background with images and content */}
        <div 
          className="w-1/2 h-full flex flex-col p-16 relative overflow-hidden"
          style={{ backgroundColor: "#F5F3EB" }}
        >
          {/* Background Image with grayscale effect */}
          {hasImage && slide.content.images && (
            <div 
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `url(${slide.content.images[0]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'grayscale(100%)',
                opacity: 0.3,
              }}
            />
          )}

          {/* World Map Icon (decorative) */}
          <div className="absolute top-8 right-8 w-32 h-32 opacity-20 z-0">
            <svg viewBox="0 0 100 100" fill="#2E3F9E">
              <ellipse cx="50" cy="50" rx="45" ry="25" fill="none" stroke="#2E3F9E" strokeWidth="1"/>
              <ellipse cx="50" cy="50" rx="25" ry="45" fill="none" stroke="#2E3F9E" strokeWidth="1"/>
              <line x1="5" y1="50" x2="95" y2="50" stroke="#2E3F9E" strokeWidth="1"/>
              <line x1="50" y1="5" x2="50" y2="95" stroke="#2E3F9E" strokeWidth="1"/>
              <circle cx="50" cy="50" r="45" fill="none" stroke="#2E3F9E" strokeWidth="2"/>
            </svg>
          </div>

          {/* Content Grid */}
          <div className="flex-1 grid grid-cols-2 gap-6 relative z-10">
            {/* Info boxes */}
            {[
              { icon: "📊", label: "Lorem ipsum", value: "dolor sit" },
              { icon: "📈", label: "Consectetur", value: "adipiscing" },
              { icon: "🎯", label: "Sed do", value: "eiusmod" },
              { icon: "✨", label: "Tempor", value: "incididunt" },
            ].map((item, index) => (
              <div 
                key={index} 
                className="p-6 rounded-lg"
                style={{ backgroundColor: "rgba(46, 63, 158, 0.08)" }}
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <div 
                  className="text-sm uppercase tracking-wider font-semibold mb-1"
                  style={{ color: "#2E3F9E" }}
                >
                  {item.label}
                </div>
                <div 
                  className="text-xs opacity-70"
                  style={{ color: "#4A4A5A" }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom content */}
          <div className="mt-8 relative z-10">
            {slide.content.body && (
              <p 
                className="text-base leading-relaxed"
                style={{ color: "#4A4A5A" }}
                contentEditable={!!onEdit}
                suppressContentEditableWarning
                onBlur={(e) => handleContentEdit('body', e.currentTarget.textContent || '')}
              >
                {String(slide.content.body)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Original/Default Style
  return (
    <div
      className="w-full h-full flex flex-col p-16"
      style={{
        backgroundColor: slide.design.backgroundColor,
        color: slide.design.textColor,
        fontFamily: slide.design.fontFamily,
      }}
    >
      {/* Background Image (subtle, if available) */}
      {hasImage && slide.content.images && (
        <>
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${slide.content.images[0]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.15,
            }}
          />
          {/* Gradient overlay for readability */}
          <div 
            className="absolute inset-0 z-0"
            style={{
              background: `linear-gradient(to right, ${slide.design.backgroundColor} 0%, transparent 50%, ${slide.design.backgroundColor} 100%)`,
            }}
          />
        </>
      )}

      {/* Header */}
      <div className="mb-12 relative z-10">
        <h1 
          className="text-6xl font-black tracking-tight mb-4 outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-2 -ml-2"
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
          {slide.content.title || slide.title}
        </h1>
        {slide.content.subtitle && (
          <p 
            className="text-2xl opacity-80 outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-2 -ml-2"
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
            {String(slide.content.subtitle)}
          </p>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center relative z-10">
        {/* Bullets */}
        {slide.content.bullets && Array.isArray(slide.content.bullets) && slide.content.bullets.length > 0 && (
          <div className="space-y-6">
            {slide.content.bullets.map((bullet, index) => (
              <div key={index} className="flex items-start gap-6">
                <div
                  className="w-4 h-4 rounded-full mt-3 flex-shrink-0"
                  style={{ backgroundColor: slide.design.accentColor }}
                />
                <p 
                  className="text-3xl leading-relaxed outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-2 -ml-2"
                  contentEditable={!!onEdit}
                  suppressContentEditableWarning
                  onBlur={(e) => handleContentEdit(`bullet-${index}`, e.currentTarget.textContent || '')}
                >
                  {String(bullet)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Metrics */}
        {slide.content.metrics && Array.isArray(slide.content.metrics) && slide.content.metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-8 mt-8">
            {slide.content.metrics.map((metric, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl"
                style={{ backgroundColor: slide.design.accentColor + "20" }}
              >
                <div 
                  className="text-5xl font-black mb-2 outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-2 -ml-2" 
                  style={{ color: slide.design.accentColor }}
                  contentEditable={!!onEdit}
                  suppressContentEditableWarning
                  onBlur={(e) => handleContentEdit(`metric-value-${index}`, e.currentTarget.textContent || '')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                  }}
                >
                  {typeof metric === 'object' && metric && 'value' in metric ? String(metric.value) : String(metric)}
                </div>
                <div 
                  className="text-xl opacity-70 outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-2 -ml-2"
                  contentEditable={!!onEdit}
                  suppressContentEditableWarning
                  onBlur={(e) => handleContentEdit(`metric-label-${index}`, e.currentTarget.textContent || '')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                  }}
                >
                  {typeof metric === 'object' && metric && 'label' in metric ? String(metric.label) : ''}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Timeline */}
        {slide.content.timeline && Array.isArray(slide.content.timeline) && slide.content.timeline.length > 0 && (
          <div className="space-y-8">
            {slide.content.timeline.map((item, index) => (
              <div key={index} className="flex items-start gap-8">
                <div
                  className="text-6xl font-black opacity-30"
                  style={{ color: slide.design.accentColor }}
                >
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-2">
                    {typeof item === 'object' && item && 'phase' in item ? String(item.phase) : String(item)}
                  </h3>
                  <p className="text-xl opacity-80">
                    {typeof item === 'object' && item && 'description' in item ? String(item.description) : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Body Text */}
        {slide.content.body && !hasContent && (
          <p 
            className="text-3xl leading-relaxed outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-2 -ml-2"
            contentEditable={!!onEdit}
            suppressContentEditableWarning
            onBlur={(e) => handleContentEdit('body', e.currentTarget.textContent || '')}
          >
            {String(slide.content.body)}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-8 border-t relative z-10" style={{ borderColor: slide.design.accentColor + "30" }}>
        <div className="flex justify-between items-center opacity-60">
          <div className="text-lg">
            {slide.content.customData && typeof slide.content.customData === 'object' && 'agency' in slide.content.customData
              ? String(slide.content.customData.agency)
              : 'Look After You'}
          </div>
          <div className="text-lg">
            {slide.content.customData && typeof slide.content.customData === 'object' && 
             ('email' in slide.content.customData || 'phone' in slide.content.customData)
              ? `${'email' in slide.content.customData ? String(slide.content.customData.email) : ''} ${
                  'phone' in slide.content.customData ? String(slide.content.customData.phone) : ''
                }`.trim()
              : ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericSlide;
