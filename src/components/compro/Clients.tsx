import { ArrowRight } from "lucide-react";
import { C } from "../../data/compro/content";
import { CLIENT_LOGOS } from "../../data/compro/config";
import { Container, SectionHeader } from "./SectionHeader";
import { Reveal, scrollToSection, useL } from "./utils";

export function ClientLogo({ name, logo, url }: { name: string; logo: string; url?: string }) {
  const img = (
    <img src={logo} alt={name} loading="lazy" className="max-h-12 w-auto object-contain opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0" />
  );
  return (
    <li className="flex h-24 items-center justify-center rounded-xl border border-slate-200 bg-white p-4">
      {url ? <a href={url} target="_blank" rel="noopener noreferrer">{img}</a> : img}
    </li>
  );
}

export function Clients() {
  const l = useL();
  return (
    <section id="clients" className="scroll-mt-16 bg-white py-20 sm:py-24">
      <Container>
        <SectionHeader eyebrow={l(C.clients.eyebrow)} title={l(C.clients.title)} sub={l(C.clients.sub)} />
        <Reveal className="mt-10">
          {CLIENT_LOGOS.length ? (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {CLIENT_LOGOS.map((c) => <ClientLogo key={c.name} {...c} />)}
            </ul>
          ) : (
            <p className="mx-auto max-w-xl rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-base text-slate-500">{l(C.clients.empty)}</p>
          )}
        </Reveal>
      </Container>
    </section>
  );
}

export function CTASection() {
  const l = useL();
  return (
    <section aria-labelledby="cta-title" className="relative isolate overflow-hidden bg-gms-deep py-20 text-white sm:py-28">
      <div aria-hidden className="absolute -left-20 top-0 -z-10 h-full w-56 skew-x-[-18deg] bg-gms-gold" />
      <div aria-hidden className="absolute left-32 top-0 -z-10 h-full w-10 skew-x-[-18deg] bg-gms-light/50 max-sm:hidden" />
      <div aria-hidden className="absolute -right-16 top-0 -z-10 h-full w-72 skew-x-[-18deg] bg-gms-navy" />
      <Container className="text-center">
        <Reveal>
          <h2 id="cta-title" className="mx-auto max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-6xl">
            {l(C.cta.title)}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-xl text-blue-100/85">{l(C.cta.sub)}</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={() => scrollToSection("kontak")} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-gms-gold px-8 text-lg font-bold text-gms-deep shadow-lg transition-all hover:-translate-y-0.5 hover:bg-gms-bright">
              {l(C.cta.quote)} <ArrowRight size={18} aria-hidden />
            </button>
            <button type="button" onClick={() => scrollToSection("kontak")} className="inline-flex min-h-14 items-center justify-center rounded-lg border-2 border-white/70 px-8 text-lg font-bold transition-colors hover:border-gms-light hover:text-gms-light">
              {l(C.cta.contact)}
            </button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
