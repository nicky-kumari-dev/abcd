-- Requirement 2: Lectures section for Nursery through Class 12.
--
-- The school's admission classes (public.school_class: Play Group, NUR, LKG,
-- UKG) stay exactly as they are -- this migration does not touch them beyond
-- what the previous migration already did. Lectures are a separate concept
-- the principal wants to cover a wider range (Nursery..Class 12), including
-- classes the school does not currently enroll students in, so they get
-- their own enum rather than overloading school_class. Play Group is
-- intentionally excluded: it has no entry in lecture_class and therefore can
-- never have a lecture_links row.
CREATE TYPE public.lecture_class AS ENUM (
  'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6',
  'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'
);

-- Preserve the existing Google Drive links (NUR/LKG/UKG) before rebuilding
-- the table on the new key type. The old row for the class that is now
-- "Play Group" is intentionally left behind -- Play Group must not appear in
-- the lecture system.
ALTER TABLE public.lecture_links RENAME TO lecture_links_old;

CREATE TABLE public.lecture_links (
  class public.lecture_class PRIMARY KEY,
  url text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.lecture_links (class, url, updated_at)
SELECT
  (CASE class::text WHEN 'NUR' THEN 'Nursery' ELSE class::text END)::public.lecture_class,
  url,
  updated_at
FROM public.lecture_links_old
WHERE class::text IN ('NUR', 'LKG', 'UKG');

DROP TABLE public.lecture_links_old;

-- Table-level grants follow the same shape as the rest of the app (RLS does
-- the real enforcement): authenticated users get full CRUD grants, RLS then
-- restricts writes to admins and reads to "your own class or admin". Unlike
-- the previous table, there is no anon/public grant here -- lecture links are
-- only ever surfaced inside the authenticated parent/admin dashboards, never
-- on the public site, and the security requirements ask that parents only be
-- able to read their own class's link (not browse every class).
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lecture_links TO authenticated;
GRANT ALL ON public.lecture_links TO service_role;
ALTER TABLE public.lecture_links ENABLE ROW LEVEL SECURITY;

-- Maps a signed-in parent's own admission class to the matching lecture
-- class. Returns NULL for Play Group (and for anyone who isn't a linked
-- parent), which means the "own class" read policy below matches nothing --
-- Play Group parents see no lecture rows at all, enforced at the database
-- level as well as in the UI.
CREATE OR REPLACE FUNCTION public.my_lecture_class()
RETURNS public.lecture_class
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE class::text
    WHEN 'NUR' THEN 'Nursery'::public.lecture_class
    WHEN 'LKG' THEN 'LKG'::public.lecture_class
    WHEN 'UKG' THEN 'UKG'::public.lecture_class
    ELSE NULL
  END
  FROM public.students
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

REVOKE EXECUTE ON FUNCTION public.my_lecture_class() FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.my_lecture_class() TO authenticated, service_role;

CREATE POLICY "own class lecture link readable" ON public.lecture_links
  FOR SELECT TO authenticated
  USING (class = public.my_lecture_class() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin manages lecture links" ON public.lecture_links
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
