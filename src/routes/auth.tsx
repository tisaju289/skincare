import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Mail, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Login — Shajgoj" },
      { name: "description", content: "Sign in to the Shajgoj admin console." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin Login — Shajgoj" },
      { property: "og:description", content: "Sign in to the Shajgoj admin console." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        setInfo(
          "Account created. Check your email and click the confirmation link. The very first account on this store automatically becomes the admin.",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center mb-6">
          <span className="text-3xl font-black bg-gradient-to-r from-[color:var(--brand-pink)] to-[color:var(--brand-magenta)] bg-clip-text text-transparent">
            Shajgoj
          </span>
        </Link>
        <div className="bg-white rounded-2xl border border-border shadow-xl p-8">
          <h1 className="text-2xl font-black">Admin {mode === "signin" ? "sign in" : "sign up"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin"
              ? "Access the Shajgoj admin console."
              : "Create an account. Admin access is granted separately."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Email</span>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-[color:var(--brand-pink)]"
                  placeholder="admin@shajgoj.com"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Password</span>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-[color:var(--brand-pink)]"
                  placeholder="••••••••"
                />
              </div>
            </label>

            {error && (
              <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            {info && (
              <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-[color:var(--brand-pink)] text-white font-semibold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => { setMode("signup"); setError(null); setInfo(null); }}
                  className="font-semibold text-[color:var(--brand-pink)] hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => { setMode("signin"); setError(null); setInfo(null); }}
                  className="font-semibold text-[color:var(--brand-pink)] hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          Storefront is public. Login is only required for the admin panel.
        </p>
      </div>
    </div>
  );
}
