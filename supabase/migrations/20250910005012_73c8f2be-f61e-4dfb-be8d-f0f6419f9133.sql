-- Fix authentication and RLS policies to make the app work properly

-- First, let's update the manual_mcqs table to allow public viewing and admin creation
DROP POLICY IF EXISTS "MCQs are viewable by everyone" ON public.manual_mcqs;
DROP POLICY IF EXISTS "Only authenticated users can create MCQs" ON public.manual_mcqs;
DROP POLICY IF EXISTS "Users can update their own MCQs" ON public.manual_mcqs;
DROP POLICY IF EXISTS "Users can delete their own MCQs" ON public.manual_mcqs;

-- Create new policies that work for both authenticated and unauthenticated users
CREATE POLICY "MCQs are publicly viewable" 
ON public.manual_mcqs 
FOR SELECT 
USING (is_active = true);

-- Allow both authenticated users and service role to create MCQs
CREATE POLICY "Allow MCQ creation" 
ON public.manual_mcqs 
FOR INSERT 
WITH CHECK (
  CASE 
    WHEN auth.role() = 'service_role' THEN true
    WHEN auth.uid() IS NOT NULL THEN true  -- Any authenticated user can create
    ELSE false
  END
);

-- Allow authenticated users to update their own MCQs, and service role to update any
CREATE POLICY "Allow MCQ updates" 
ON public.manual_mcqs 
FOR UPDATE 
USING (
  CASE 
    WHEN auth.role() = 'service_role' THEN true
    WHEN auth.uid() IS NOT NULL AND auth.uid() = created_by THEN true
    ELSE false
  END
);

-- Allow authenticated users to delete their own MCQs, and service role to delete any
CREATE POLICY "Allow MCQ deletion" 
ON public.manual_mcqs 
FOR DELETE 
USING (
  CASE 
    WHEN auth.role() = 'service_role' THEN true
    WHEN auth.uid() IS NOT NULL AND auth.uid() = created_by THEN true
    ELSE false
  END
);

-- Update mock_tests to allow public viewing
DROP POLICY IF EXISTS "Public tests are viewable by everyone" ON public.mock_tests;

CREATE POLICY "Tests are publicly viewable" 
ON public.mock_tests 
FOR SELECT 
USING (is_public = true);

-- Update chat sessions to allow unauthenticated usage for demo purposes
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.ai_chat_sessions;
DROP POLICY IF EXISTS "Users can create their own chat sessions" ON public.ai_chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON public.ai_chat_sessions;

-- Allow anyone to create and view chat sessions (for demo purposes)
CREATE POLICY "Allow public chat sessions" 
ON public.ai_chat_sessions 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Make created_by nullable in manual_mcqs for easier admin usage
ALTER TABLE public.manual_mcqs ALTER COLUMN created_by DROP NOT NULL;