import type { Slide } from "@/types";

interface IndexSlideProps {
  slide: Slide;
  onEdit?: (field: string, value: string) => void;
}

const IndexSlide = ({ slide, onEdit }: IndexSlideProps) => {
  const campaignSummary = slide.content.customData?.campaignSummary as Record<string, string | number> | undefined;
  const keyNumbers = slide.content.customData?.keyNumbers as Record<string, string | number> | undefined;
  const hasCampaignSummary = campaignSummary || keyNumbers;
  
  // Check for corporate brochure style
  const isCorporateBrochure = 
    slide.design.backgroundColor === "#F5F3EB" || 
    slide.design.accentColor === "#2E3F9E" ||
    slide.content.customData?.templateStyle === "corporate-brochure";

  // Corporate Brochure Style - About Us layout
  if (isCorporateBrochure) {
    return (
      <div className="w-full h-full flex relative" style={{ fontFamily: "Inter, sans-serif" }}>
        {/* Left Panel - Content with cream background */}
        <div 
          className="w-1/2 h-full flex flex-col p-16 relative"
          style={{ backgroundColor: "#F5F3EB" }}
        >
          {/* Section Header */}
          <div className="mb-12">
            <h1 
              className="text-5xl font-bold tracking-tight mb-4"
              style={{ color: "#1A1A2E", fontFamily: "Georgia, serif" }}
            >
              {slide.content.title || "ABOUT US"}
            </h1>
            <div 
              className="w-20 h-1"
              style={{ backgroundColor: "#2E3F9E" }}
            />
          </div>

          {/* Our Story Section */}
          <div className="flex-1">
            <h2 
              className="text-2xl font-semibold mb-6 uppercase tracking-wide"
              style={{ color: "#2E3F9E" }}
            >
              OUR STORY
            </h2>
            
            {/* Lorem ipsum placeholder or campaign summary */}
            <div className="space-y-4 text-base leading-relaxed" style={{ color: "#4A4A5A" }}>
              {slide.content.body ? (
                <p>{String(slide.content.body)}</p>
              ) : (
                <>
                  <p>
                    We are a leading influencer talent agency dedicated to connecting brands 
                    with authentic voices that resonate with their target audiences.
                  </p>
                  <p>
                    Our expertise spans across multiple platforms and industries, 
                    delivering measurable results through strategic partnerships.
                  </p>
                </>
              )}
            </div>

            {/* Date Badge */}
            <div 
              className="mt-12 inline-block px-6 py-3 text-white font-bold"
              style={{ backgroundColor: "#2E3F9E" }}
            >
              <div className="text-3xl">{new Date().getFullYear()}</div>
              <div className="text-xs uppercase tracking-wider opacity-80">
                {new Date().toLocaleDateString('en-US', { month: 'long' }).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Blue with Mission */}
        <div 
          className="w-1/2 h-full flex flex-col p-16 relative"
          style={{ backgroundColor: "#2E3F9E" }}
        >
          {/* Background image placeholder */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
          />

          {/* Our Mission */}
          <div className="relative z-10">
            <h2 
              className="text-3xl font-bold mb-8 uppercase tracking-wide"
              style={{ color: "#FFFFFF", fontFamily: "Georgia, serif" }}
            >
              OUR MISSION
            </h2>

            {/* Numbered Points */}
            <div className="space-y-8">
              {(slide.content.bullets && slide.content.bullets.length > 0 ? slide.content.bullets : [
                "Connect brands with authentic influencer voices",
                "Drive measurable engagement and conversions",
                "Build lasting partnerships that deliver value"
              ]).slice(0, 3).map((point, index) => (
                <div key={index} className="flex items-start gap-6">
                  <div 
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                    style={{ backgroundColor: "#F5F3EB", color: "#2E3F9E" }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p 
                      className="text-lg leading-relaxed"
                      style={{ color: "#FFFFFF" }}
                    >
                      {String(point)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Decorative Elements */}
          <div className="mt-auto relative z-10">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#F5F3EB" }}
              >
                <svg className="w-6 h-6" fill="#2E3F9E" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <div className="text-sm font-bold uppercase tracking-wider" style={{ color: "#F5F3EB" }}>
                  Lorem ipsum
                </div>
                <div className="text-xs opacity-70" style={{ color: "#F5F3EB" }}>
                  dolor sit amet
                </div>
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

      {slide.content.bullets && Array.isArray(slide.content.bullets) && slide.content.bullets.length > 0 ? (
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
                <span>{String(item)}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {slide.content.customData?.estimatedReadTime ? (
        <div className="text-lg opacity-70 mt-4">
          <span className="font-medium">Estimated reading time:</span>{" "}
          {String(slide.content.customData.estimatedReadTime)}
        </div>
      ) : null}
    </div>
  );
};

export default IndexSlide;
