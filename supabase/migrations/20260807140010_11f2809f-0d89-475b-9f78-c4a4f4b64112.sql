REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.my_class() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.sync_fee_year() FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.my_class() TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_fee_year() TO service_role;