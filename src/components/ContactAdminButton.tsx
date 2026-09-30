import { MessageCircle } from "lucide-react";
import { useHelpContact } from "../store/HelpContactContext";

/** WhatsApp shortcut to the admin number set under Pengaturan. Used on the
 * login pages when a user is blocked or keeps failing to sign in. */
export function ContactAdminButton({ message }: { message: string }) {
  const { helpWhatsAppNumber } = useHelpContact();
  return (
    <a
      href={`https://wa.me/${helpWhatsAppNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
    >
      <MessageCircle size={16} /> Hubungi Admin
    </a>
  );
}
