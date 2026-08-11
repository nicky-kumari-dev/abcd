import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { requireServerEnv } from "@/lib/env";
import { SCHOOL } from "@/lib/school";

export type SiteSettings = {
  schoolName: string;
  tagline: string;
  phone: string;
  phoneIntl: string;
  whatsapp: string;
  address: string;
  mapLink: string;
  mapEmbed: string;
  timings: string;
  aboutText: string | null;
  /** Signed URL for an admin-uploaded logo, or null when the bundled logo is used. */
  logoUrl: string | null;
  /** Storage path of the uploaded logo (admin use). */
  logoPath: string | null;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  schoolName: SCHOOL.name,
  tagline: SCHOOL.tagline,
  phone: SCHOOL.phone,
  phoneIntl: SCHOOL.phoneIntl,
  whatsapp: SCHOOL.whatsapp,
  address: SCHOOL.address,
  mapLink: SCHOOL.mapLink,
  mapEmbed: SCHOOL.mapEmbed,
  timings: SCHOOL.timings,
  aboutText: null,
  logoUrl: null,
  logoPath: null,
};

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

/** Public, read-only school information managed from the admin settings panel. */
export const getSiteSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteSettings> => {
    const supabase = publicClient();
    const { data } = await supabase
      .from("site_settings")
      .select(
        "school_name, tagline, phone, whatsapp, address, map_link, map_embed, timings, about_text, logo_url",
      )
      .eq("id", "main")
      .maybeSingle();

    if (!data) return DEFAULT_SETTINGS;

    let logoUrl: string | null = null;
    if (data.logo_url) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: signed } = await supabaseAdmin.storage
        .from("gallery")
        .createSignedUrl(data.logo_url, 60 * 60 * 6);
      logoUrl = signed?.signedUrl ?? null;
    }

    const phone = data.phone || SCHOOL.phone;
    return {
      schoolName: data.school_name || SCHOOL.name,
      tagline: data.tagline || SCHOOL.tagline,
      phone,
      phoneIntl: `+91${phone.replace(/\D/g, "").slice(-10)}`,
      whatsapp: data.whatsapp || SCHOOL.whatsapp,
      address: data.address || SCHOOL.address,
      mapLink: data.map_link || SCHOOL.mapLink,
      mapEmbed: data.map_embed || SCHOOL.mapEmbed,
      timings: data.timings || SCHOOL.timings,
      aboutText: data.about_text ?? null,
      logoUrl,
      logoPath: data.logo_url ?? null,
    };
  },
);
