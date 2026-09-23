import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat;
        if (!path || path.includes("..")) return new Response("Not found", { status: 404 });

        const url = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const key =
          import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!url || !key) return new Response("Storage not configured", { status: 500 });

        const client = createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data, error } = await client.storage.from("media").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(data, {
          headers: {
            "Content-Type": data.type || "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
