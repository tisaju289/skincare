-- Lock down internal SECURITY DEFINER helpers from the exposed API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Public storefront RPCs: only the intended roles, never blanket PUBLIC
REVOKE ALL ON FUNCTION public.place_order(text, text, text, text, jsonb, public.payment_method, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(text, text, text, text, jsonb, public.payment_method, text, text, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.submit_review(text, text, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_review(text, text, integer, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.subscribe_newsletter(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.subscribe_newsletter(text) TO anon, authenticated;