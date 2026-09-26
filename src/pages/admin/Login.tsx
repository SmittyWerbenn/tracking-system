import { AlertTriangle, Loader2, Lock, Mail } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate, type Location } from "react-router-dom";
import logoIcon from "../../assets/icon-mark.png";
import { useAuth } from "../../store/AuthContext";

export default function Login() {
  const { login, logout, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [awaitingRoleCheck, setAwaitingRoleCheck] = useState(false);

  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/admin";

  // login() resolves before AuthContext's profile state has actually
  // flushed, so the role isn't readable synchronously right after - react
  // to the profile update instead, once it lands.
  useEffect(() => {
    if (!awaitingRoleCheck || !profile) return;
    setAwaitingRoleCheck(false);
    if (profile.role === "Driver") {
      logout();
      setError("Akun Driver menggunakan Portal Driver, bukan di sini. Buka /driver untuk login.");
    } else {
      navigate(from, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, awaitingRoleCheck]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setAwaitingRoleCheck(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <img src={logoIcon} alt="GMS Logistics" className="h-14 w-14 object-contain" />
          <h1 className="mt-4 text-lg font-semibold text-slate-900">Portal Admin</h1>
          <p className="mt-1 text-sm text-slate-500">PT Gangsar Mitra Suatama</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Email</span>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                autoFocus
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="nama@gangsarmitrasuatama.co.id"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Password</span>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="********"
              />
            </div>
          </label>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-60"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
