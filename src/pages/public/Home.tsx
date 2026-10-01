import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { About } from "../../components/compro/About";
import { CTASection } from "../../components/compro/Clients";
import { ContactSection } from "../../components/compro/ContactSection";
import { Coverage } from "../../components/compro/Coverage";
import { Fleet, FleetFinder } from "../../components/compro/Fleet";
import { FleetStats } from "../../components/compro/FleetStats";
import { Footer } from "../../components/compro/Footer";
import { Hero } from "../../components/compro/Hero";
import { JourneyCarousel } from "../../components/compro/JourneyCarousel";
import { Navbar } from "../../components/compro/Navbar";
import { ServicesExplorer } from "../../components/compro/ServicesExplorer";
import { scrollToSection, useL } from "../../components/compro/utils";
import { WhyUs } from "../../components/compro/WhyUs";
import { C } from "../../data/compro/content";
import { SITE_URL } from "../../data/compro/config";
import type { FleetGroup, FleetItem } from "../../data/compro/fleetData";
import { useHelpContact } from "../../store/HelpContactContext";
import { useLanguage } from "../../store/LanguageContext";

function setMeta(sel: string, attr: string, key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(sel);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function useSeo() {
  const { language } = useLanguage();
  const { contactPhone, contactEmail, contactAddress } = useHelpContact();
  useEffect(() => {
    const title = C.seo.title[language];
    const desc = C.seo.description[language];
    document.title = title;
    document.documentElement.lang = language;
    setMeta('meta[name="description"]', "name", "description", desc);
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", desc);
    setMeta('meta[property="og:type"]', "property", "og:type", "website");
    setMeta('meta[property="og:url"]', "property", "og:url", SITE_URL);
    setMeta('meta[property="og:locale"]', "property", "og:locale", language === "id" ? "id_ID" : "en_US");
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.id = "compro-jsonld";
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "GMS Logistics",
      legalName: "PT Gangsar Mitra Suatama",
      url: SITE_URL,
      description: desc,
      telephone: contactPhone,
      email: contactEmail,
      address: { "@type": "PostalAddress", streetAddress: contactAddress, addressCountry: "ID" },
      areaServed: "ID",
    });
    document.getElementById("compro-jsonld")?.remove();
    document.head.appendChild(ld);
    return () => ld.remove();
  }, [language, contactPhone, contactEmail, contactAddress]);
}

export default function Home() {
  const l = useL();
  const location = useLocation();
  const [group, setGroup] = useState<"all" | FleetGroup>("all");
  const [prefill, setPrefill] = useState("");
  const { language } = useLanguage();
  useSeo();

  useEffect(() => {
    const id = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (id) setTimeout(() => scrollToSection(id), 50);
  }, [location.state]);

  // pickService callback no longer needed; ServicesExplorer manages its own state
  const requestFleet = useCallback(
    (f: FleetItem) => {
      setPrefill(`${C.contact.form.fleetPrefix[language]}: ${f.name}`);
      scrollToSection("kontak");
    },
    [language],
  );

  return (
    <div className="compro min-h-screen bg-white font-sans text-gms-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-gms-gold focus:px-4 focus:py-2 focus:font-bold focus:text-gms-deep">
        {l(C.nav.skip)}
      </a>
      <Navbar overlay />
      <main id="main">
        <Hero />
        <About />
        <ServicesExplorer />
        <WhyUs />
        <JourneyCarousel />
        <Fleet group={group} setGroup={setGroup} onRequest={requestFleet} />
        <FleetStats />
        <FleetFinder onPick={setGroup} />
        <Coverage />
        <CTASection />
        <ContactSection prefillMessage={prefill} />
      </main>
      <Footer />
      {/* Mobile sticky CTA - REMOVED */}
    </div>
  );
}
