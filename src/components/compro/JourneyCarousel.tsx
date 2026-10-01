import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { journeySteps } from "../../data/compro/journeySteps";
import { useLanguage } from "../../store/LanguageContext";
import { journeyAssets } from "../../data/compro/assetsMap";

// Inline animation styles untuk carousel & stepper
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

  @keyframes glowPulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(212, 167, 44, 0.4);
    }
    50% {
      box-shadow: 0 0 0 6px rgba(212, 167, 44, 0);
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

  .animate-glowPulse {
    animation: glowPulse 2s infinite;
  }

  .stepper-line {
    background: linear-gradient(to right, #0B2553 0%, #0B2553 var(--progress, 0%), #D4C5A9 var(--progress, 0%), #D4C5A9 100%);
    transition: --progress 0.7s ease-out;
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
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 8000);
  };

  const handlePrev = () => {
    setCurrentIdx(prevIdx);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 8000);
  };

  const progressPercent = ((currentIdx + 1) / totalSteps) * 100;

  return (
    <>
      <style>{carouselStyles}</style>
      <div className="relative w-full bg-gradient-to-b from-[#EAF0F8] to-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 md:mb-14">
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

          {/* Professional Stepper - Logistics Journey Timeline */}
          <div className="mb-12 md:mb-14">
            <div className="overflow-x-auto pb-4">
              <div className="min-w-min md:flex md:justify-center px-2">
                {/* Main stepper container */}
                <div className="relative inline-flex items-start gap-0 md:gap-0">
                  {/* Progress connector line - background */}
                  <div className="absolute top-5 left-0 h-1 bg-[#D4C5A9] transition-all duration-700"
                    style={{
                      right: 0,
                      width: 'calc(100% - 24px)',
                      marginLeft: '12px',
                    }}
                  />

                  {/* Progress connector line - active */}
                  <div 
                    className="absolute top-5 left-0 h-1 bg-gradient-to-r from-[#0B2553] to-[#D4A72C] transition-all duration-700"
                    style={{
                      width: `calc(${progressPercent}% - ${(100 - progressPercent) * 0.24}px)`,
                      marginLeft: '12px',
                    }}
                  />

                  {/* Step Items */}
                  {journeySteps.map((s, idx) => {
                    const isActive = idx === currentIdx;
                    const isPassed = idx < currentIdx;
                    
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          setCurrentIdx(idx);
                          setIsAutoPlay(false);
                          setTimeout(() => setIsAutoPlay(true), 8000);
                        }}
                        className="relative z-10 flex flex-col items-center transition-all duration-300 hover:scale-105 active:scale-95"
                        style={{
                          minWidth: idx === journeySteps.length - 1 ? 'auto' : 'calc(16.666% - 4px)',
                          width: 'auto',
                          paddingRight: idx === journeySteps.length - 1 ? 0 : '0px',
                        }}
                      >
                        {/* Circle Container */}
                        <div className="relative mb-3 md:mb-4">
                          {/* Glow effect for active */}
                          {isActive && (
                            <div className="absolute inset-0 rounded-full animate-glowPulse"
                              style={{
                                width: '56px',
                                height: '56px',
                                left: '-2px',
                                top: '-2px',
                              }}
                            />
                          )}

                          {/* Circle itself */}
                          <div
                            className={`relative w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold font-display transition-all duration-300 ${
                              isActive
                                ? "bg-[#071B41] text-white ring-4 ring-[#D4A72C] shadow-lg scale-110"
                                : isPassed
                                  ? "bg-[#0B2553] text-white shadow-md"
                                  : "bg-white border-2 border-[#D4C5A9] text-[#071B41] shadow-sm"
                            }`}
                          >
                            {isPassed ? (
                              <Check size={20} className="md:w-6 md:h-6" strokeWidth={3} />
                            ) : (
                              <span className="text-sm md:text-base">{idx + 1}</span>
                            )}
                          </div>
                        </div>

                        {/* Step Label */}
                        <span
                          className={`text-xs md:text-sm font-bold uppercase tracking-wider leading-tight text-center transition-all duration-300 ${
                            isActive
                              ? "text-[#071B41] scale-105 font-display"
                              : isPassed
                                ? "text-[#0B2553] font-semibold"
                                : "text-[#7A8A9E] font-semibold"
                          }`}
                          style={{
                            maxWidth: '90px',
                            wordBreak: 'break-word',
                            lineHeight: '1.2',
                          }}
                        >
                          {s.short[language]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
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
        </div>
      </div>
    </>
  );
}
