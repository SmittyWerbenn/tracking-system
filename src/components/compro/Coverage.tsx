import { C } from "../../data/compro/content";
import { COMPANY_STATS } from "../../data/compro/config";
import { Container, SectionHeader } from "./SectionHeader";
import { Reveal, useL } from "./utils";

export function Coverage() {
  const l = useL();
  return (
    <section id="coverage" className="scroll-mt-16 bg-gms-mist py-20 sm:py-24">
      <Container>
        <SectionHeader eyebrow={l(C.coverage.eyebrow)} title={l(C.coverage.title)} sub={l(C.coverage.sub)} />
        <div className="mt-12 flex justify-center">
          <Reveal className="w-full max-w-2xl">
            <div role="img" aria-label={l(C.coverage.mapLabel)} className="relative overflow-hidden rounded-3xl bg-gms-corp p-6 text-white">
              <svg viewBox="0 0 400 220" className="w-full" aria-hidden>
                <defs>
                  <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.3" fill="#ffffff" opacity="0.18" /></pattern>
                </defs>
                <rect width="400" height="220" fill="url(#dots)" />
                <path d="M60 150 L130 120 L200 150 L270 130 L330 160" fill="none" stroke="#D4A72C" strokeWidth="2" strokeDasharray="6 5" style={{ animation: "dashMove 1.5s linear infinite" }} />
                {[[60,150],[130,120],[200,150],[270,130],[330,160],[160,80],[300,70]].map(([x,y],i)=>(
                  <g key={i}><circle cx={x} cy={y} r="5" fill="#E5B83B" /><circle cx={x} cy={y} r="5" fill="#E5B83B" style={{ transformOrigin: `${x}px ${y}px`, animation: `pulseRing 2.4s ease-out ${i*0.3}s infinite` }} /></g>
                ))}
              </svg>
              <p className="mt-2 font-display text-4xl font-extrabold text-gms-gold">{COMPANY_STATS.citiesCovered}</p>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-100/80">{l(C.coverage.citiesSuffix)}</p>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
