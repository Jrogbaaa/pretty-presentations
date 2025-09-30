import type { Slide } from "@/types";

interface CoverSlideProps {
  slide: Slide;
}

const CoverSlide = ({ slide }: CoverSlideProps) => {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center text-center p-12"
      style={{
        backgroundColor: slide.design.backgroundColor,
        color: slide.design.textColor,
        fontFamily: slide.design.fontFamily,
      }}
    >
      <div className="max-w-4xl space-y-8">
        <h1 className="text-6xl font-bold leading-tight">
          {slide.content.title}
        </h1>
        <h2 className="text-3xl font-light opacity-90">
          {slide.content.subtitle}
        </h2>
        <div className="pt-12 text-xl opacity-75">
          {slide.content.body}
        </div>
      </div>
      <div className="absolute bottom-8 right-8">
        <div className="text-lg font-semibold">Look After You</div>
      </div>
    </div>
  );
};

export default CoverSlide;
