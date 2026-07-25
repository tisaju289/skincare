import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldAlert, LogOut } from "lucide-react";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Console — Shajgoj" },
      { name: "description", content: "Manage orders, products, customers and marketing for your Shajgoj store." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "not_admin"; email: string }
  | { status: "admin"; email: string };

function AdminLayout() {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    async function check() {
      const { data: userData } = await supabase.auth.getUser();
      if (!active) return;
      if (!userData.user) {
        setState({ status: "unauthenticated" });
        navigate({ to: "/auth" });
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!active) return;
      if (roles) {
        setState({ status: "admin", email: userData.user.email ?? "" });
      } else {
        setState({ status: "not_admin", email: userData.user.email ?? "" });
      }
    }
    check();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setState({ status: "unauthenticated" });
        navigate({ to: "/auth" });
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  if (state.status === "loading" || state.status === "unauthenticated") {
    return (
      <div className="min-h-screen grid place-items-center bg-muted/30">
        <Loader2 className="h-6 w-6 animate-spin text-[color:var(--brand-pink)]" />
      </div>
    );
  }

  if (state.status === "not_admin") {
    return (
      <div className="min-h-screen grid place-items-center bg-muted/30 px-4">
        <div className="max-w-md text-center bg-card border border-border rounded-2xl p-8">
          <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 text-amber-700 grid place-items-center">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-black">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{state.email}</span> is signed in but
            doesn't have the <code className="px-1 rounded bg-muted">admin</code> role. Ask an
            existing admin to add a row in <code className="px-1 rounded bg-muted">user_roles</code>
            with your user id and role <code className="px-1 rounded bg-muted">admin</code>.
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
            }}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[color:var(--brand-pink)] text-white hover:opacity-90"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
