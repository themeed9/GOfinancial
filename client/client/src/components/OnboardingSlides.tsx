import { useState } from "react";
import slide1Img from "@assets/GO_Mobile1_1771055942946.jpg";
import slide2Img from "@assets/GO_Mobile_2_1771055942945.jpg";
import slide3Img from "@assets/GO_Mobile_3_1771055942946.jpg";

interface OnboardingSlidesProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const slides = [
  { id: 1, image: slide1Img },
  { id: 2, image: slide2Img },
  { id: 3, image: slide3Img },
];

export function OnboardingSlides({ onComplete, onSkip }: OnboardingSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isLastSlide = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-200 ease-in-out"
          style={{
            opacity: index === currentSlide ? 1 : 0,
            zIndex: index === currentSlide ? 2 : 1,
            pointerEvents: index === currentSlide ? "auto" : "none",
          }}
        >
          <img
            src={slide.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      ))}

      <div className="absolute bottom-0 left-0 right-0 pb-10 pt-6 z-10 flex flex-col items-center gap-3">
        <button
          onClick={handleNext}
          className="px-14 py-3.5 bg-blue-500 text-white rounded-full font-semibold text-base shadow-lg active:bg-blue-600 transition-colors"
          data-testid="button-onboarding-next"
        >
          {isLastSlide ? "Get Started" : "Next"}
        </button>

        {!isLastSlide && (
          <button
            onClick={handleSkip}
            className="py-2 text-white/80 font-medium text-sm"
            data-testid="button-onboarding-skip"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
