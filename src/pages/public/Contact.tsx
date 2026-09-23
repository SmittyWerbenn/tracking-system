import { ArrowLeft, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PublicLayout } from "../../components/layout/PublicLayout";
import { useLanguage } from "../../store/LanguageContext";
import { useDocumentTitle } from "../../utils/useDocumentTitle";

const CHANNEL_ICONS = [Phone, MessageCircle, Mail];
const CHANNEL_VALUES = [
  { value: "021-2200-8899", href: "tel:0212200899" },
  { value: "0812-0000-8899", href: "https://wa.me/6281200008899" },
  { value: "cs@gangsarmitrasuatama.co.id", href: "mailto:cs@gangsarmitrasuatama.co.id" },
];

export default function Contact() {
  const { t } = useLanguage();
  useDocumentTitle(t.contact.title);
  const navigate = useNavigate();
  const channelLabels = [t.contact.channelPhone, t.contact.channelWhatsapp, t.contact.channelEmail];

  return (
    <PublicLayout>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={15} /> {t.trackingResult.back}
      </button>

      <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{t.contact.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{t.contact.desc}</p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {channelLabels.map((label, i) => {
            const Icon = CHANNEL_ICONS[i];
            const { value, href } = CHANNEL_VALUES[i];
            return (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="flex flex-col items-start gap-2 rounded-xl border border-slate-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                  <Icon size={18} />
                </span>
                <span className="text-xs font-medium text-slate-400">{label}</span>
                <span className="text-sm font-semibold text-slate-800">{value}</span>
              </a>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div className="flex gap-3">
            <MapPin size={18} className="mt-0.5 shrink-0 text-slate-400" />
            <div>
              <p className="text-xs font-medium text-slate-400">{t.contact.hqLabel}</p>
              <p className="text-sm text-slate-700">
                Jl. Raya Cakung No. 88, Cakung, Jakarta Timur, DKI Jakarta
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Clock size={18} className="mt-0.5 shrink-0 text-slate-400" />
            <div>
              <p className="text-xs font-medium text-slate-400">{t.contact.hoursLabel}</p>
              <p className="text-sm text-slate-700">{t.contact.hoursValue}</p>
            </div>
          </div>
        </div>

        <p className="mt-6 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500">
          {t.contact.footNote} <span className="font-medium text-slate-700">{t.contact.footNoteLink}</span>.
        </p>
      </section>
    </PublicLayout>
  );
}
