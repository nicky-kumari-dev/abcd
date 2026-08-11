CREATE TYPE public.app_role AS ENUM ('admin','parent');
CREATE TYPE public.school_class AS ENUM ('Junior Group','NUR','LKG','UKG');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  name text NOT NULL,
  class public.school_class NOT NULL,
  phone text NOT NULL UNIQUE,
  fee_year int NOT NULL DEFAULT EXTRACT(YEAR FROM now())::int,
  fee_months boolean[] NOT NULL DEFAULT ARRAY[false,false,false,false,false,false,false,false,false,false,false,false],
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent reads own student" ON public.students FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin manages students" ON public.students FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.my_class()
RETURNS public.school_class LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT class FROM public.students WHERE user_id = auth.uid() LIMIT 1
$$;

CREATE TABLE public.todays_learning (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class public.school_class NOT NULL,
  text text NOT NULL,
  publish_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.todays_learning TO authenticated;
GRANT ALL ON public.todays_learning TO service_role;
ALTER TABLE public.todays_learning ENABLE ROW LEVEL SECURITY;
CREATE POLICY "class parents read learning" ON public.todays_learning FOR SELECT TO authenticated USING (class = public.my_class() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin manages learning" ON public.todays_learning FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.homework (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class public.school_class NOT NULL,
  text text NOT NULL,
  publish_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homework TO authenticated;
GRANT ALL ON public.homework TO service_role;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
CREATE POLICY "class parents read homework" ON public.homework FOR SELECT TO authenticated USING (class = public.my_class() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin manages homework" ON public.homework FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery TO authenticated;
GRANT ALL ON public.gallery TO service_role;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery public read" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "admin manages gallery" ON public.gallery FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.lecture_links (
  class public.school_class PRIMARY KEY,
  url text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lecture_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lecture_links TO authenticated;
GRANT ALL ON public.lecture_links TO service_role;
ALTER TABLE public.lecture_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lecture links readable" ON public.lecture_links FOR SELECT USING (true);
CREATE POLICY "admin manages lecture links" ON public.lecture_links FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.lecture_links (class, url) VALUES
 ('Junior Group','https://drive.google.com/drive/folders/1AgnODPVd3PtP3WBsPvNglCmbcHurrf6N'),
 ('NUR','https://drive.google.com/drive/folders/1UQn5Z4owAOlgxrCvtdJj7Um2F_de3mmX'),
 ('LKG','https://drive.google.com/drive/folders/1kfmfHcQ7RC3oIeA3yYuzEpr7u4fzWexs'),
 ('UKG','https://drive.google.com/drive/folders/1rjC-WvNe9tQHe_1P6bgKaKCQmjHhMejG');

CREATE OR REPLACE FUNCTION public.sync_fee_year()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.students
     SET fee_year = EXTRACT(YEAR FROM now())::int,
         fee_months = ARRAY[false,false,false,false,false,false,false,false,false,false,false,false]
   WHERE fee_year <> EXTRACT(YEAR FROM now())::int;
$$;
GRANT EXECUTE ON FUNCTION public.sync_fee_year() TO authenticated, anon, service_role;