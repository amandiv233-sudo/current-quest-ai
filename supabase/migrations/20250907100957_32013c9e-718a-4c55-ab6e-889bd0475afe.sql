-- Fix the security warning by setting search path for the function
CREATE OR REPLACE FUNCTION public.increment_view_count(article_id UUID)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.current_affairs 
  SET view_count = view_count + 1 
  WHERE id = article_id;
END;
$$;