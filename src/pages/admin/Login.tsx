import { AlertTriangle, Loader2, Lock, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useLocation, useNavigate, type Location } from "react-router-dom";
import logoIcon from "../../assets/icon-mark.png";
import { useAuth } from "../../store/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/admin";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setTimeout(() => {
      const ok = login(username, password);
      setSubmitting(false);
      if (ok) {
        navigate(from, { replace: true });
      } else {
        setError("Username atau password salah.");
      }
    }, 350);
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
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Username</span>
            <div className="relative">
              <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="admin"
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

        <p className="mt-5 rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-400">
          Demo prototype - default username/password:{" "}
          <span className="font-mono font-medium text-slate-600">admin</span> /{" "}
          <span className="font-mono font-medium text-slate-600">admin</span>
        </p>
      </div>
    </div>
  );
}
