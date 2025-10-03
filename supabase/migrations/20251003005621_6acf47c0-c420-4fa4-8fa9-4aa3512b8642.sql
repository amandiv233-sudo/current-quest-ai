-- Add mcq_type column to manual_mcqs table
ALTER TABLE public.manual_mcqs 
ADD COLUMN IF NOT EXISTS mcq_type TEXT DEFAULT 'General' CHECK (mcq_type IN ('General', 'Current Affairs'));

-- Add comment to describe the column
COMMENT ON COLUMN public.manual_mcqs.mcq_type IS 'Type of MCQ: General or Current Affairs';