import type { Slide } from "@/types";
import CoverSlide from "./slides/CoverSlide";
import IndexSlide from "./slides/IndexSlide";
import ObjectiveSlide from "./slides/ObjectiveSlide";
import TalentStrategySlide from "./slides/TalentStrategySlide";
import RecommendedScenarioSlide from "./slides/RecommendedScenarioSlide";
import GenericSlide from "./slides/GenericSlide";

interface SlideRendererProps {
  slide: Slide;
  scale?: number;
  onEdit?: (field: string, value: string) => void;
}

const SlideRenderer = ({ slide, scale = 1, onEdit }: SlideRendererProps) => {
  const renderSlide = () => {
    switch (slide.type) {
      case "cover":
        return <CoverSlide slide={slide} onEdit={onEdit} />;
      case "index":
        return <IndexSlide slide={slide} onEdit={onEdit} />;
      case "objective":
        return <ObjectiveSlide slide={slide} onEdit={onEdit} />;
      case "talent-strategy":
        return <TalentStrategySlide slide={slide} onEdit={onEdit} />;
      case "brief-summary":
        // Check if this is a recommended scenario slide
        if (slide.content.customData?.recommendedScenario) {
          return <RecommendedScenarioSlide slide={slide} onEdit={onEdit} />;
        }
        return <GenericSlide slide={slide} onEdit={onEdit} />;
      default:
        return <GenericSlide slide={slide} onEdit={onEdit} />;
    }
  };

  return (
    <div
      className="relative shadow-2xl"
      style={{
        width: `${1920 * scale}px`,
        height: `${1080 * scale}px`,
      }}
    >
      <div 
        className="origin-top-left bg-white overflow-hidden"
        style={{
          width: "1920px",
          height: "1080px",
          transform: `scale(${scale})`,
        }}
      >
        {renderSlide()}
      </div>
    </div>
  );
};

export default SlideRenderer;
