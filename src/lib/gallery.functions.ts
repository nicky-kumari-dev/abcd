import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { requireServerEnv } from "@/lib/env";

export type GalleryItem = { id: string; url: string; caption: string };

function publicClient() {
  const key = requireServerEnv("SUPABASE_PUBLISHABLE_KEY");
  const url = requireServerEnv("SUPABASE_URL");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Public gallery feed. Signs private storage uploads, passes CDN images through. */
export const getGallery = createServerFn({ method: "GET" }).handler(
  async (): Promise<GalleryItem[]> => {
    const supabase = publicClient();
    const { data, error } = await supabase
      .from("gallery")
      .select("id, image_url, caption, storage_path")
      .order("created_at", { ascending: true });

    if (error || !data) return [];

    const items: GalleryItem[] = [];
    const toSign = data.filter((row) => row.storage_path);

    const signed: Record<string, string> = {};
    if (toSign.length > 0) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: urls } = await supabaseAdmin.storage.from("gallery").createSignedUrls(
        toSign.map((r) => r.storage_path as string),
        60 * 60 * 6,
      );
      for (const u of urls ?? []) {
        if (u.path && u.signedUrl) signed[u.path] = u.signedUrl;
      }
    }

    for (const row of data) {
      const url = row.storage_path ? signed[row.storage_path] : row.image_url;
      if (url) items.push({ id: row.id, url, caption: row.caption });
    }
    return items;
  },
);
