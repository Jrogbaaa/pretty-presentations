import type { Slide } from "@/types";

interface IndexSlideProps {
  slide: Slide;
}

const IndexSlide = ({ slide }: IndexSlideProps) => {
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
      
      <div className="flex-1 flex items-center">
        <ol className="space-y-4 text-2xl">
          {slide.content.bullets?.map((item, index) => (
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

      {slide.content.customData?.estimatedReadTime && (
        <div className="text-lg opacity-70">
          <span className="font-medium">Estimated reading time:</span>{" "}
          {slide.content.customData.estimatedReadTime}
        </div>
      )}
    </div>
  );
};

export default IndexSlide;
