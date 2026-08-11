ALTER TABLE public.gallery ADD COLUMN storage_path text;

CREATE POLICY "admin uploads gallery files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gallery' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin reads gallery files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'gallery' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin deletes gallery files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'gallery' AND public.has_role(auth.uid(),'admin'));

CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('bvps-fee-year-reset', '5 0 1 1 *', $$SELECT public.sync_fee_year();$$);