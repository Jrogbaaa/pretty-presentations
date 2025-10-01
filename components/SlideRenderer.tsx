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
}

const SlideRenderer = ({ slide, scale = 1 }: SlideRendererProps) => {
  const renderSlide = () => {
    switch (slide.type) {
      case "cover":
        return <CoverSlide slide={slide} />;
      case "index":
        return <IndexSlide slide={slide} />;
      case "objective":
        return <ObjectiveSlide slide={slide} />;
      case "talent-strategy":
        return <TalentStrategySlide slide={slide} />;
      case "brief-summary":
        // Check if this is a recommended scenario slide
        if (slide.content.customData?.recommendedScenario) {
          return <RecommendedScenarioSlide slide={slide} />;
        }
        return <GenericSlide slide={slide} />;
      default:
        return <GenericSlide slide={slide} />;
    }
  };

  return (
    <div
      className="relative bg-white shadow-2xl"
      style={{
        width: `${1920 * scale}px`,
        height: `${1080 * scale}px`,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {renderSlide()}
    </div>
  );
};

export default SlideRenderer;
