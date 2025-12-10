import type { Slide } from "@/types";

interface GenericSlideProps {
  slide: Slide;
  onEdit?: (field: string, value: string) => void;
}

const GenericSlide = ({ slide, onEdit }: GenericSlideProps) => {
  const hasContent = slide.content.bullets || slide.content.metrics || slide.content.timeline;
  const hasImage = slide.content.images && slide.content.images.length > 0;

  const handleContentEdit = (field: string, value: string) => {
    if (onEdit) {
      onEdit(field, value);
    }
  };

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
