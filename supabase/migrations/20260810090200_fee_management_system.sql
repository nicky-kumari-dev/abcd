-- Requirement 3: complete fee management system.
--
-- This EXTENDS the existing fee tracking rather than replacing it in place:
-- `students.fee_year` / `students.fee_months` (added in the very first
-- migration) are left untouched -- dropping or rewriting them here would
-- mean guessing how each already-marked-paid calendar month (Jan-Dec) maps
-- onto the school's actual April-March fee year, and a wrong guess would
-- silently misrepresent real payment history. Those columns simply stop
-- being read by the application from this point on; the two new tables
-- below are the single source of truth for every student created from now
-- on (and every existing student gets backfilled with a fresh, correctly
-- structured, all-unpaid row so admins have a clean base to record real
-- payments against).

-- ---------------------------------------------------------------------------
-- The school year runs April-March. This function is the one place that
-- knows that mapping, used both as this table's default and by the yearly
-- reset job below.
CREATE OR REPLACE FUNCTION public.current_fee_year()
RETURNS int
LANGUAGE sql STABLE AS $$
  SELECT CASE WHEN EXTRACT(MONTH FROM now()) >= 4
              THEN EXTRACT(YEAR FROM now())
              ELSE EXTRACT(YEAR FROM now()) - 1
         END::int
$$;
GRANT EXECUTE ON FUNCTION public.current_fee_year() TO authenticated, anon, service_role;

-- ---------------------------------------------------------------------------
-- Per-class fee structure. Reuses the existing admission `school_class` enum
-- (Play Group, NUR, LKG, UKG) rather than inventing a parallel class list --
-- this table is intentionally scoped to admission classes only, unlike the
-- separate Nursery..Class 12 lecture system.
CREATE TABLE public.class_fee_settings (
  class public.school_class PRIMARY KEY,
  total_fee integer NOT NULL CHECK (total_fee >= 0),
  monthly_fee integer NOT NULL CHECK (monthly_fee >= 0),
  registration_fee integer NOT NULL CHECK (registration_fee >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_fee_settings TO authenticated;
GRANT ALL ON public.class_fee_settings TO service_role;
ALTER TABLE public.class_fee_settings ENABLE ROW LEVEL SECURITY;

-- Admin-only, full stop. Parents must never see the individual registration
-- / monthly amounts (only the school-wide Total/Paid/Due figures, which are
-- computed and returned by a server function using the service-role client
-- -- see src/lib/fees.functions.ts). There is deliberately no parent SELECT
-- policy here, so a parent's own authenticated client gets zero rows back
-- even if it queries this table directly.
CREATE POLICY "admin manages fee settings" ON public.class_fee_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_class_fee_settings_updated_at
BEFORE UPDATE ON public.class_fee_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Initial fee structure, derived as Registration Fee = Total Fee - (12 x
-- Monthly Fee). Admin can change any of the three figures from the Fees tab
-- afterward; nothing here is hardcoded in the frontend.
INSERT INTO public.class_fee_settings (class, total_fee, monthly_fee, registration_fee) VALUES
  ('Play Group', 11700, 650, 3900),
  ('NUR',        13300, 700, 4900),
  ('LKG',        13900, 750, 4900),
  ('UKG',        15100, 850, 4900);

-- ---------------------------------------------------------------------------
-- Per-student payment state: one row per student per fee year, with a
-- distinct boolean for registration and each of the 12 school-year months.
-- Paid Fee / Due Fee are never stored here -- they are always derived from
-- these booleans plus class_fee_settings (see computeFeeTotals in
-- src/lib/fees.ts), so they can never drift out of sync with reality.
CREATE TABLE public.student_fee_payments (
  student_id uuid PRIMARY KEY REFERENCES public.students(id) ON DELETE CASCADE,
  fee_year int NOT NULL DEFAULT public.current_fee_year(),
  registration_paid boolean NOT NULL DEFAULT false,
  apr_paid boolean NOT NULL DEFAULT false,
  may_paid boolean NOT NULL DEFAULT false,
  jun_paid boolean NOT NULL DEFAULT false,
  jul_paid boolean NOT NULL DEFAULT false,
  aug_paid boolean NOT NULL DEFAULT false,
  sep_paid boolean NOT NULL DEFAULT false,
  oct_paid boolean NOT NULL DEFAULT false,
  nov_paid boolean NOT NULL DEFAULT false,
  dec_paid boolean NOT NULL DEFAULT false,
  jan_paid boolean NOT NULL DEFAULT false,
  feb_paid boolean NOT NULL DEFAULT false,
  mar_paid boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_fee_payments TO authenticated;
GRANT ALL ON public.student_fee_payments TO service_role;
ALTER TABLE public.student_fee_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parent reads own fee payments" ON public.student_fee_payments
  FOR SELECT TO authenticated
  USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "admin manages student fee payments" ON public.student_fee_payments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_student_fee_payments_updated_at
BEFORE UPDATE ON public.student_fee_payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Every student gets exactly one payments row automatically, whichever path
-- creates them (the admin server function today, or any future direct
-- insert) -- this is more robust than relying on application code to
-- remember the extra insert, and avoids a duplicate-row race between the two.
CREATE OR REPLACE FUNCTION public.create_student_fee_payments_row()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.student_fee_payments (student_id) VALUES (NEW.id)
  ON CONFLICT (student_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER students_create_fee_payments_row
AFTER INSERT ON public.students
FOR EACH ROW EXECUTE FUNCTION public.create_student_fee_payments_row();

-- Backfill: every student that already existed before this migration gets a
-- fresh, all-unpaid row so the new system has a clean, correctly-shaped
-- starting point for every current student.
INSERT INTO public.student_fee_payments (student_id)
SELECT id FROM public.students
ON CONFLICT (student_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Yearly reset at the start of the school year (April 1), mirroring the
-- existing `bvps-fee-year-reset` job but aligned to this table's April-March
-- year instead of the calendar year. As documented for the original job,
-- this requires the pg_cron extension (already enabled by an earlier
-- migration for this project) -- if pg_cron is unavailable on your plan,
-- skip this statement and run `select public.sync_student_fee_year();`
-- manually once a year instead.
CREATE OR REPLACE FUNCTION public.sync_student_fee_year()
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.student_fee_payments
     SET fee_year = public.current_fee_year(),
         registration_paid = false,
         apr_paid = false, may_paid = false, jun_paid = false, jul_paid = false,
         aug_paid = false, sep_paid = false, oct_paid = false, nov_paid = false,
         dec_paid = false, jan_paid = false, feb_paid = false, mar_paid = false
   WHERE fee_year <> public.current_fee_year();
$$;

REVOKE EXECUTE ON FUNCTION public.sync_student_fee_year() FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.sync_student_fee_year() TO service_role;

SELECT cron.schedule('bvps-student-fee-year-reset', '10 0 1 4 *', $$SELECT public.sync_student_fee_year();$$);
