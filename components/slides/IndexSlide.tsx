import type { Slide } from "@/types";

interface IndexSlideProps {
  slide: Slide;
  onEdit?: (field: string, value: string) => void;
}

const IndexSlide = ({ slide, onEdit }: IndexSlideProps) => {
  const campaignSummary = slide.content.customData?.campaignSummary;
  const keyNumbers = slide.content.customData?.keyNumbers;
  const hasCampaignSummary = campaignSummary || keyNumbers;

  return (
    <div
      className="w-full h-full flex flex-col p-12"
      style={{
        backgroundColor: slide.design.backgroundColor,
        color: slide.design.textColor,
        fontFamily: slide.design.fontFamily,
      }}
    >
      <h1 className="text-5xl font-bold mb-8">{slide.content.title}</h1>
      
      {/* Campaign Summary Grid (Scalpers/Premium templates) */}
      {hasCampaignSummary && (
        <div className="grid grid-cols-2 gap-6 mb-8">
          {(campaignSummary?.budget || keyNumbers?.budget) && (
            <div 
              className="p-6 rounded-xl"
              style={{ backgroundColor: slide.design.accentColor + "15" }}
            >
              <div className="text-sm font-semibold uppercase opacity-60 mb-2">Budget</div>
              <div className="text-3xl font-bold">{campaignSummary?.budget || keyNumbers?.budget}</div>
            </div>
          )}
          
          {(campaignSummary?.territory || keyNumbers?.territory) && (
            <div 
              className="p-6 rounded-xl"
              style={{ backgroundColor: slide.design.accentColor + "15" }}
            >
              <div className="text-sm font-semibold uppercase opacity-60 mb-2">Territory</div>
              <div className="text-3xl font-bold">{campaignSummary?.territory || keyNumbers?.territory}</div>
            </div>
          )}
          
          {(campaignSummary?.target || keyNumbers?.target) && (
            <div 
              className="p-6 rounded-xl"
              style={{ backgroundColor: slide.design.accentColor + "15" }}
            >
              <div className="text-sm font-semibold uppercase opacity-60 mb-2">Target</div>
              <div className="text-2xl font-bold">{campaignSummary?.target || keyNumbers?.target}</div>
            </div>
          )}
          
          {(campaignSummary?.period || keyNumbers?.period) && (
            <div 
              className="p-6 rounded-xl"
              style={{ backgroundColor: slide.design.accentColor + "15" }}
            >
              <div className="text-sm font-semibold uppercase opacity-60 mb-2">Period</div>
              <div className="text-3xl font-bold">{campaignSummary?.period || keyNumbers?.period}</div>
            </div>
          )}
          
          {(campaignSummary?.objective || keyNumbers?.objective) && (
            <div 
              className="col-span-2 p-6 rounded-xl"
              style={{ backgroundColor: slide.design.accentColor + "20" }}
            >
              <div className="text-sm font-semibold uppercase opacity-60 mb-2">Objective</div>
              <div className="text-2xl font-bold">{campaignSummary?.objective || keyNumbers?.objective}</div>
            </div>
          )}
        </div>
      )}

      {/* Traditional Index (if bullets provided) */}
      {slide.content.bullets && slide.content.bullets.length > 0 && (
        <div className="flex-1 flex items-center">
          <ol className="space-y-4 text-2xl">
            {slide.content.bullets.map((item, index) => (
              <li key={index} className="flex items-center gap-4">
                <span
                  className="flex items-center justify-center w-12 h-12 rounded-full font-bold"
                  style={{ backgroundColor: slide.design.accentColor, color: "#FFFFFF" }}
                >
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {slide.content.customData?.estimatedReadTime && (
        <div className="text-lg opacity-70 mt-4">
          <span className="font-medium">Estimated reading time:</span>{" "}
          {slide.content.customData.estimatedReadTime}
        </div>
      )}
    </div>
  );
};

export default IndexSlide;
