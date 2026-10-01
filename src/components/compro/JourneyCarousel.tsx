import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { journeySteps } from "../../data/compro/journeySteps";
import { useLanguage } from "../../store/LanguageContext";
import { journeyAssets } from "../../data/compro/assetsMap";

// Inline animation styles untuk carousel
const carouselStyles = `
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideUpIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .animate-scaleIn {
    animation: scaleIn 0.6s ease-out forwards;
  }

  .animate-slideUpIn-1 {
    animation: slideUpIn 0.7s ease-out forwards;
  }

  .animate-slideUpIn-2 {
    animation: slideUpIn 0.8s ease-out forwards;
  }

  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }
`;

export function JourneyCarousel() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const { language } = useLanguage();

  const totalSteps = journeySteps.length;
  const nextIdx = (currentIdx + 1) % totalSteps;
  const prevIdx = (currentIdx - 1 + totalSteps) % totalSteps;

  // Auto-advance carousel setiap 5 detik
  useEffect(() => {
    if (!isAutoPlay) return;

    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % totalSteps);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlay, totalSteps]);

  const handleNext = () => {
    setCurrentIdx(nextIdx);
    setIsAutoPlay(false); // Pause auto-play ketika user interact
    setTimeout(() => setIsAutoPlay(true), 8000); // Resume setelah 8 detik
  };

  const handlePrev = () => {
    setCurrentIdx(prevIdx);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 8000);
  };

  return (
    <>
      <style>{carouselStyles}</style>
      <div className="relative w-full bg-gradient-to-b from-[#EAF0F8] to-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <p className="text-sm font-semibold text-[#D4A72C] uppercase tracking-widest mb-2">
              {language === "id" ? "Proses Pengiriman" : "Delivery Process"}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#071B41] mb-3">
              {language === "id"
                ? "Perjalanan Pengiriman Bersama GMS Logistics"
                : "Shipping Journey with GMS Logistics"}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {language === "id"
                ? "Dari proses administrasi hingga serah terima, setiap pengiriman dipantau dan dikelola secara terkoordinasi."
                : "From administrative process to delivery handoff, every shipment is monitored and managed in a coordinated manner."}
            </p>
          </div>

          {/* Main Carousel */}
          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            {/* Slide Container - Landscape 16:9 aspect ratio */}
            <div className="relative w-full bg-black" style={{ aspectRatio: "16/9" }}>
              {journeySteps.map((s, idx) => {
                const isActive = idx === currentIdx;
                const isNext = idx === nextIdx;
                const isPrev = idx === prevIdx;

                return (
                  <div
                    key={s.id}
                    className={`absolute inset-0 transition-all duration-700 ease-out ${
                      isActive
                        ? "opacity-100 scale-100 translate-x-0"
                        : isNext
                          ? "opacity-0 scale-95 translate-x-full"
                          : isPrev
                            ? "opacity-0 scale-95 -translate-x-full"
                            : "opacity-0 scale-95"
                    }`}
                  >
                    {/* Background image - full cover */}
                    <img
                      src={journeyAssets[s.id]}
                      alt={s.imageAlt[language]}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />

                    {/* Minimal step label - bottom left corner */}
                    <div className="absolute bottom-4 left-4 z-20 bg-black/60 backdrop-blur px-3 py-2 rounded-lg">
                      <p className="text-xs font-bold text-[#D4A72C] uppercase tracking-wide">
                        {`${String(currentIdx + 1).padStart(2, "0")} - ${s.short[language]}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={handlePrev}
              className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-[#071B41] p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
              aria-label="Previous step"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-[#071B41] p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
              aria-label="Next step"
            >
              <ChevronRight size={24} />
            </button>

            {/* Progress Indicator Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {journeySteps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIdx(idx);
                    setIsAutoPlay(false);
                    setTimeout(() => setIsAutoPlay(true), 8000);
                  }}
                  className={`transition-all duration-500 rounded-full ${
                    idx === currentIdx
                      ? "w-8 h-3 bg-[#D4A72C] shadow-lg"
                      : "w-3 h-3 bg-white/60 hover:bg-white/80"
                  }`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Step Counter & Timeline Indicator */}
          <div className="mt-8 md:mt-10">
            {/* Timeline bar */}
            <div className="relative h-2 bg-[#EAF0F8] rounded-full overflow-hidden border border-[#D4A72C]/20">
              <div
                className="h-full bg-gradient-to-r from-[#D4A72C] to-[#E5B83B] transition-all duration-700 rounded-full"
                style={{ width: `${((currentIdx + 1) / totalSteps) * 100}%` }}
              />
            </div>

            {/* Step labels */}
            <div className="mt-6 grid grid-cols-3 gap-2 md:grid-cols-6">
              {journeySteps.map((s, idx) => {
                const isPassed = idx < currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={s.id} className="text-center">
                    <button
                      onClick={() => {
                        setCurrentIdx(idx);
                        setIsAutoPlay(false);
                        setTimeout(() => setIsAutoPlay(true), 8000);
                      }}
                      className={`text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:text-[#D4A72C] ${
                        isCurrent
                          ? "text-[#D4A72C] scale-110"
                          : isPassed
                            ? "text-[#0B2553]"
                            : "text-gray-400"
                      }`}
                    >
                      {s.short[language]}
                    </button>
                    <div
                      className={`mt-1 h-1 rounded-full mx-auto transition-all duration-300 ${
                        isPassed || isCurrent ? "w-full bg-[#D4A72C]" : "w-0 bg-gray-300"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Auto-play indicator */}
          {/* Removed - no need to show indicator */}
        </div>
      </div>
    </>
  );
}
