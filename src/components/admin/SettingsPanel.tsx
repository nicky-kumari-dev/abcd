import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Upload } from "lucide-react";
import { toast } from "sonner";

import { logoAsset as bundledLogo } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  school_name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  address: string;
  map_link: string;
  map_embed: string;
  timings: string;
  about_text: string | null;
  logo_url: string | null;
};

const EMPTY: Row = {
  school_name: "",
  tagline: "",
  phone: "",
  whatsapp: "",
  address: "",
  map_link: "",
  map_embed: "",
  timings: "",
  about_text: "",
  logo_url: null,
};

/** Admin-only general information settings. Writes are guarded by admin RLS policies. */
export function SettingsPanel() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Row>(EMPTY);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const settings = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select(
          "school_name, tagline, phone, whatsapp, address, map_link, map_embed, timings, about_text, logo_url",
        )
        .eq("id", "main")
        .maybeSingle();
      if (error) throw error;
      return (data as Row | null) ?? EMPTY;
    },
  });

  useEffect(() => {
    if (settings.data) setForm(settings.data);
  }, [settings.data]);

  useEffect(() => {
    let active = true;
    async function sign() {
      if (!form.logo_url) {
        setLogoPreview(null);
        return;
      }
      const { data } = await supabase.storage.from("gallery").createSignedUrl(form.logo_url, 3600);
      if (active) setLogoPreview(data?.signedUrl ?? null);
    }
    void sign();
    return () => {
      active = false;
    };
  }, [form.logo_url]);

  const save = useMutation({
    mutationFn: async (patch: Partial<Row>) => {
      const { error } = await supabase.from("site_settings").update(patch).eq("id", "main");
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function uploadLogo(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Logo must be smaller than 3 MB");
      return;
    }
    setUploading(true);
    const path = `branding/logo-${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage
      .from("gallery")
      .upload(path, file, { cacheControl: "31536000", upsert: false });
    setUploading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setForm((f) => ({ ...f, logo_url: path }));
    save.mutate({ logo_url: path });
  }

  const field = (key: keyof Row, label: string, props: Record<string, unknown> = {}) => (
    <div className="space-y-2">
      <Label htmlFor={`set-${key}`}>{label}</Label>
      <Input
        id={`set-${key}`}
        value={(form[key] as string) ?? ""}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        {...props}
      />
    </div>
  );

  if (settings.isLoading) {
    return <p className="py-16 text-center text-sm text-muted-foreground">Loading settings…</p>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-card p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold text-primary-deep">School Logo</h2>
        <div className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
          <img
            src={logoPreview ?? bundledLogo.url}
            alt="Current school logo"
            className="h-20 w-20 shrink-0 rounded-full border border-border object-contain"
          />
          <div className="min-w-0 space-y-2">
            <Label htmlFor="logo-file">Upload a new logo (PNG / JPG / WebP, max 3 MB)</Label>
            <Input
              id="logo-file"
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadLogo(file);
                e.target.value = "";
              }}
            />
            {uploading && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
              </p>
            )}
            {form.logo_url && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => {
                  setForm((f) => ({ ...f, logo_url: null }));
                  save.mutate({ logo_url: null });
                }}
              >
                Reset to default logo
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-card p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold text-primary-deep">
          General Information
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("school_name", "School Name", { maxLength: 120 })}
          {field("tagline", "Tagline", { maxLength: 140 })}
          {field("phone", "Phone Number", { inputMode: "numeric", maxLength: 10 })}
          {field("whatsapp", "WhatsApp Number (with country code)", {
            inputMode: "numeric",
            maxLength: 15,
          })}
          {field("timings", "School Timings", { maxLength: 120 })}
          {field("map_link", "Google Maps Link", { maxLength: 500 })}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="set-address">Address</Label>
            <Textarea
              id="set-address"
              rows={2}
              maxLength={300}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="set-map_embed">Google Maps Embed URL</Label>
            <Textarea
              id="set-map_embed"
              rows={2}
              maxLength={800}
              value={form.map_embed}
              onChange={(e) => setForm({ ...form, map_embed: e.target.value })}
            />
          </div>
        </div>

        <Button
          className="mt-5 rounded-full"
          disabled={save.isPending}
          onClick={() => {
            if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
              toast.error("Enter a valid 10-digit phone number");
              return;
            }
            const { logo_url: _logo, ...rest } = form;
            save.mutate(rest);
          }}
        >
          {save.isPending ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-1 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </section>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Upload className="h-3.5 w-3.5" /> Gallery images are managed in the Gallery tab.
      </p>
    </div>
  );
}
