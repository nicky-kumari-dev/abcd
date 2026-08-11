CREATE TABLE public.site_settings (
  id text PRIMARY KEY DEFAULT 'main',
  school_name text NOT NULL DEFAULT 'Bhartiya Vidyapeeth Playway School',
  tagline text NOT NULL DEFAULT 'Second home cum school of your child',
  phone text NOT NULL DEFAULT '7905817399',
  whatsapp text NOT NULL DEFAULT '917905817399',
  address text NOT NULL DEFAULT 'Milky Mohalla, Plot No. 27, Sikanderpur, Ballia, Uttar Pradesh – 277303',
  map_link text NOT NULL DEFAULT 'https://maps.app.goo.gl/N33iw3Tbcoda2siG6?g_st=ac',
  map_embed text NOT NULL DEFAULT 'https://www.google.com/maps?q=Bhartiya%20Vidyapeeth%20Play%20Way%20School%2C%20Milky%20Mohalla%2C%20Sikanderpur%2C%20Ballia%2C%20Uttar%20Pradesh%20277303&output=embed',
  timings text NOT NULL DEFAULT 'Monday – Saturday, 9:00 AM to 2:00 PM',
  logo_url text,
  about_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_singleton CHECK (id = 'main')
);

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site settings public read" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "admin manages site settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_settings (id) VALUES ('main') ON CONFLICT (id) DO NOTHING;