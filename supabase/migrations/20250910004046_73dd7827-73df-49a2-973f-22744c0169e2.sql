-- Fix the mock_tests RLS policy to allow edge functions to create tests
DROP POLICY IF EXISTS "Users can create their own tests" ON public.mock_tests;

-- Create a new policy that allows both authenticated users and service role
CREATE POLICY "Allow test creation" 
ON public.mock_tests 
FOR INSERT 
WITH CHECK (
  CASE 
    WHEN auth.role() = 'service_role' THEN true
    WHEN auth.uid() IS NOT NULL THEN auth.uid() = created_by
    ELSE false
  END
);