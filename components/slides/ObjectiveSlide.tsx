import type { Slide } from "@/types";

interface ObjectiveSlideProps {
  slide: Slide;
}

const ObjectiveSlide = ({ slide }: ObjectiveSlideProps) => {
  const hasImage = slide.content.images && slide.content.images.length > 0;

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
      {hasImage && (
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
