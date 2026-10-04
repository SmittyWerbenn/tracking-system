import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoIcon from "../../assets/icon-mark.png";
import { C } from "../../data/compro/content";
import { SOCIAL_LINKS } from "../../data/compro/config";
import { toTelHref, useHelpContact } from "../../store/HelpContactContext";
import { Container } from "./SectionHeader";
import { useL } from "./utils";

export function Footer() {
  const l = useL();
  const navigate = useNavigate();
  const onHome = useLocation().pathname === "/";
  const { helpPhoneDisplay, helpWhatsAppNumber, contactPhone, contactEmail, contactAddress, contactHours } =
    useHelpContact();

  function go(id: string) {
    if (onHome) document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    else navigate("/", { state: { scrollTo: id } });
  }
  const link = "text-left text-lg text-blue-100/75 transition-colors hover:text-gms-light";

  return (
    <footer className="relative bg-gms-deep text-white">
      {/* Gold divider as a subtle wave instead of a straight bar, so the
          section above doesn't look like it's cut off flat. */}
      <svg
        aria-hidden
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 top-0 h-7 w-full -translate-y-1/2 sm:h-9"
      >
        <defs>
          <linearGradient id="footerWaveGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D4A72C" />
            <stop offset="50%" stopColor="#F0C75E" />
            <stop offset="100%" stopColor="#D4A72C" />
          </linearGradient>
        </defs>
        <path
          d="M0,26 C220,4 380,46 620,26 C860,6 1040,46 1260,24 C1340,16 1400,20 1440,24"
          fill="none"
          stroke="url(#footerWaveGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <Container className="pt-14 pb-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1.15fr_1.3fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img src={logoIcon} alt="GMS Logistics - PT Gangsar Mitra Suatama" className="h-10 w-10 object-contain" />
              <span className="font-display text-2xl font-extrabold">GMS Logistics</span>
            </div>
            <p className="mt-4 max-w-sm text-lg leading-relaxed text-blue-100/75">{l(C.footer.desc)}</p>
            {SOCIAL_LINKS.length > 0 && (
              <div className="mt-5">
                <p className="text-base font-bold uppercase tracking-wider text-gms-light">{l(C.footer.followUs)}</p>
                <ul className="mt-2 flex flex-wrap gap-3">
                  {SOCIAL_LINKS.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className={link}>
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <p className="text-base font-bold uppercase tracking-wider text-gms-light">{l(C.footer.company)}</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li><button className={link} onClick={() => go("tentang")}>{l(C.nav.about)}</button></li>
              <li><button className={link} onClick={() => go("clients")}>{l(C.nav.clients)}</button></li>
              <li><button className={link} onClick={() => go("coverage")}>{l(C.nav.coverage)}</button></li>
            </ul>
          </div>

          <div>
            <p className="text-base font-bold uppercase tracking-wider text-gms-light">
              {l(C.footer.services)} &amp; {l(C.footer.fleet)}
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li><button className={link} onClick={() => go("layanan")}>{l(C.footer.services)}</button></li>
              <li><button className={link} onClick={() => go("armada")}>{l(C.footer.fleet)}</button></li>
              <li><Link to="/tracking" className={link}>{l(C.footer.tracking)}</Link></li>
              <li><Link to="/cek-ongkir" className={link}>{l(C.nav.checkPrice)}</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-base font-bold uppercase tracking-wider text-gms-light">{l(C.footer.contact)}</p>
            <ul className="mt-4 flex flex-col gap-3 text-lg text-blue-100/75">
              <li className="flex gap-2"><Phone size={15} className="mt-0.5 shrink-0 text-gms-gold" aria-hidden /><a href={toTelHref(contactPhone)} className="hover:text-gms-light">{contactPhone}</a></li>
              {helpWhatsAppNumber && (
                <li className="flex gap-2"><MessageCircle size={15} className="mt-0.5 shrink-0 text-gms-gold" aria-hidden /><a href={`https://wa.me/${helpWhatsAppNumber}`} target="_blank" rel="noopener noreferrer" className="hover:text-gms-light">{helpPhoneDisplay}</a></li>
              )}
              <li className="flex gap-2"><Mail size={15} className="mt-0.5 shrink-0 text-gms-gold" aria-hidden /><a href={`mailto:${contactEmail}`} className="break-all hover:text-gms-light">{contactEmail}</a></li>
              <li className="flex gap-2"><MapPin size={15} className="mt-0.5 shrink-0 text-gms-gold" aria-hidden /><span>{contactAddress}</span></li>
              <li className="flex gap-2"><Clock size={15} className="mt-0.5 shrink-0 text-gms-gold" aria-hidden /><span>{contactHours}</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-center text-lg text-blue-100/60">
          © {new Date().getFullYear()} {l(C.footer.copyright)}
        </div>
      </Container>
    </footer>
  );
}
