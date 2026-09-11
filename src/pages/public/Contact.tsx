import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PublicLayout } from "../../components/layout/PublicLayout";

const CHANNELS = [
  {
    icon: Phone,
    label: "Telepon",
    value: "021-2200-8899",
    href: "tel:0212200899",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "0812-0000-8899",
    href: "https://wa.me/6281200008899",
  },
  {
    icon: Mail,
    label: "Email",
    value: "cs@gangsarmitrasautama.co.id",
    href: "mailto:cs@gangsarmitrasautama.co.id",
  },
];

export default function Contact() {
  return (
    <PublicLayout>
      <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Hubungi Kami</h1>
        <p className="mt-2 text-sm text-slate-500">
          Butuh bantuan seputar pengiriman atau resi Anda? Tim customer service kami siap
          membantu.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {CHANNELS.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="flex flex-col items-start gap-2 rounded-xl border border-slate-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                <c.icon size={18} />
              </span>
              <span className="text-xs font-medium text-slate-400">{c.label}</span>
              <span className="text-sm font-semibold text-slate-800">{c.value}</span>
            </a>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div className="flex gap-3">
            <MapPin size={18} className="mt-0.5 shrink-0 text-slate-400" />
            <div>
              <p className="text-xs font-medium text-slate-400">Kantor Pusat</p>
              <p className="text-sm text-slate-700">
                Jl. Raya Cakung No. 88, Cakung, Jakarta Timur, DKI Jakarta
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Clock size={18} className="mt-0.5 shrink-0 text-slate-400" />
            <div>
              <p className="text-xs font-medium text-slate-400">Jam Operasional</p>
              <p className="text-sm text-slate-700">Senin - Sabtu, 08.00 - 18.00 WIB</p>
            </div>
          </div>
        </div>

        <p className="mt-6 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500">
          Untuk menanyakan status pengiriman, siapkan nomor AWB Anda agar tim kami dapat membantu
          lebih cepat. Anda juga dapat melacak mandiri melalui halaman{" "}
          <span className="font-medium text-slate-700">Lacak Kiriman</span>.
        </p>
      </section>
    </PublicLayout>
  );
}
