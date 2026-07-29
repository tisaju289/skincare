REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.sync_product_status() FROM anon, authenticated, public;

DROP FUNCTION IF EXISTS public.place_order(text, text, text, text, jsonb, payment_method, text, text);

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;