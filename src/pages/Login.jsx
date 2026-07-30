import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Code2, Loader2, ShieldCheck } from "lucide-react";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/");
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 grid lg:grid-cols-5">
      {/* Left panel */}
      <div className="lg:col-span-2 flex items-center justify-center p-6 md:p-10 border-b lg:border-b-0 lg:border-r border-zinc-800">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 flex items-center justify-center bg-orange-500 rounded-sm">
              <Code2 className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-black text-white text-lg tracking-tight">LEETRACK</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">
                Student Progress Console
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-none">
            Sign in to
            <br /><span className="text-orange-500">continue</span>
          </h1>
          <p className="mt-3 text-zinc-400 text-sm">
            Track LeetCode progress across your entire college — admins, faculty and students in one place.
          </p>

          <form onSubmit={onSubmit} className="mt-10 space-y-5">
            <div>
              <label className="label-upper block mb-1.5">Email</label>
              <input
                data-testid="login-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 text-white rounded-sm outline-none focus:border-orange-500 focus-visible:ring-1 focus-visible:ring-orange-500 mono"
                placeholder="admin@college.edu"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label-upper block mb-1.5">Password</label>
              <input
                data-testid="login-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 text-white rounded-sm outline-none focus:border-orange-500 focus-visible:ring-1 focus-visible:ring-orange-500 mono"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {err && (
              <div
                data-testid="login-error"
                className="text-xs text-rose-400 border border-rose-900/40 bg-rose-950/30 px-3 py-2 rounded-sm"
              >
                {err}
              </div>
            )}

            <button
              type="submit"
              data-testid="login-submit-button"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-sm font-semibold tracking-wide flex items-center justify-center gap-2 link-hover disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <div className="text-xs text-zinc-500 border-t border-zinc-800 pt-4 mono">
              Default admin: <span className="text-zinc-300">admin@college.edu</span> / <span className="text-zinc-300">Admin@12345</span>
            </div>
          </form>
        </div>
      </div>

      {/* Right panel */}
      <div
        className="hidden lg:block lg:col-span-3 relative"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/10325707/pexels-photo-10325707.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative h-full flex flex-col justify-end p-12">
          <div className="max-w-lg">
            <div className="label-upper mb-3 text-orange-400">Modern Analytics</div>
            <h2 className="text-4xl font-black tracking-tighter text-white mb-3">
              A single console for every LeetCode contribution on campus.
            </h2>
            <p className="text-zinc-300 text-sm">
              Sync real-time data, watch leaderboards climb and export reports in seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
