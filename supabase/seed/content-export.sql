-- Content export from the original database.
-- Run AFTER applying all files in supabase/migrations/ to your Supabase project.
-- Students are NOT included: each student row is tied to a Supabase Auth user,
-- and auth users cannot be copied across projects. Recreate them in the admin
-- panel (Students -> Add student), then set their paid months in the fee modal.

-- Site settings
UPDATE public.site_settings SET school_name='Bhartiya Vidyapeeth Playway School', tagline='Second home cum school of your child', phone='7905817399', whatsapp='917905817399', address='Milky Mohalla, Plot No. 27, Sikanderpur, Ballia, Uttar Pradesh – 277303', map_link='https://maps.app.goo.gl/N33iw3Tbcoda2siG6?g_st=ac', map_embed='https://www.google.com/maps?q=Bhartiya%20Vidyapeeth%20Play%20Way%20School%2C%20Milky%20Mohalla%2C%20Sikanderpur%2C%20Ballia%2C%20Uttar%20Pradesh%20277303&output=embed', timings='Monday – Saturday, 8:00 AM to 2:00 PM', about_text=NULL, logo_url=NULL WHERE id='main';

-- Gallery (images are served from /public/img in this repo)
INSERT INTO public.gallery (id, image_url, caption, storage_path, created_at) VALUES ('01b23b8d-b4ca-4fe6-a0e1-77f25428ec4a','/img/1653f6a0.webp','Parent Teacher Meeting (PTM)',NULL,'2026-08-07 14:02:22.347752+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.gallery (id, image_url, caption, storage_path, created_at) VALUES ('ac9d70bd-a3af-448b-b089-0f8ac0ab8b63','/img/e3948f46.webp','Morning Prayer & Meditation Session',NULL,'2026-08-07 14:02:22.347752+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.gallery (id, image_url, caption, storage_path, created_at) VALUES ('7f7f323b-5f7c-40d1-a307-aabac9bcf65b','/img/a20bb859.webp','Independence Day Celebration',NULL,'2026-08-07 14:02:22.347752+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.gallery (id, image_url, caption, storage_path, created_at) VALUES ('08840366-f673-4b67-9523-56866d656b53','/img/e33e553b.webp','Janmashtami Fancy Dress Competition',NULL,'2026-08-07 14:02:22.347752+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.gallery (id, image_url, caption, storage_path, created_at) VALUES ('fbe47c66-d1d9-47e6-a40a-2bd29c711bd8','/img/3bf84f3c.webp','Yoga & Fitness Activity',NULL,'2026-08-07 14:02:22.347752+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.gallery (id, image_url, caption, storage_path, created_at) VALUES ('4bec864d-0db3-436e-9c5a-a6521622dd25','/img/c66e7f44.webp','Teachers Day Celebration',NULL,'2026-08-07 14:02:22.347752+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.gallery (id, image_url, caption, storage_path, created_at) VALUES ('94fb502f-3d87-44b7-bc07-ea1f1d5cdaac','/img/4951072d.webp','Our Experienced Teaching Team',NULL,'2026-08-07 14:02:22.347752+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.gallery (id, image_url, caption, storage_path, created_at) VALUES ('5eb97191-4f89-48ba-be37-c636e65eb2e7','/img/7665bef6.webp','Welcome to Our Colourful Kindergarten',NULL,'2026-08-07 14:02:22.347752+00') ON CONFLICT (id) DO NOTHING;

-- Today's learning
INSERT INTO public.todays_learning (id, class, text, publish_date) VALUES ('38e4093e-d7bf-42b4-9362-a4c384167974','NUR','Counting 1-100','2026-08-07') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.todays_learning (id, class, text, publish_date) VALUES ('2ddc1c8c-2f6f-4023-b5e7-464403a323d3','UKG','counting','2026-08-08') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.todays_learning (id, class, text, publish_date) VALUES ('e5773591-8d5f-4a91-a282-d9264c60ee85','NUR','Counting 1-10','2026-08-08') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.todays_learning (id, class, text, publish_date) VALUES ('07065d2b-79d2-46e4-be67-4dfd1368c47d','NUR','Maths
Counting 1-10

English 
A - Z

Hindi 
A - Ah','2026-08-08') ON CONFLICT (id) DO NOTHING;

-- Homework
INSERT INTO public.homework (id, class, text, publish_date) VALUES ('0374b39a-b228-420e-b9e5-b083be424ebe','NUR','Write numbers 1-20','2026-08-07') ON CONFLICT (id) DO NOTHING;

-- Existing students to recreate manually:
-- Krishna kumar Prajapati (LKG), phone 9519957439, fees {t,t,t,t,t,f,f,f,f,f,f,f}
-- Aman Kashyap (UKG), phone 9161504195, fees {t,t,t,t,t,t,f,f,f,f,f,f}
