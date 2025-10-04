-- Add content_model field to exams table to differentiate between static syllabus and monthly current affairs
ALTER TABLE public.exams 
ADD COLUMN content_model text DEFAULT 'static_syllabus' CHECK (content_model IN ('static_syllabus', 'monthly_current_affairs'));

-- Add month_year field to manual_mcqs table for banking current affairs
ALTER TABLE public.manual_mcqs 
ADD COLUMN month_year date NULL;

-- Add index on month_year for better query performance
CREATE INDEX idx_manual_mcqs_month_year ON public.manual_mcqs(month_year);

-- Add comment to clarify the dual model
COMMENT ON COLUMN public.exams.content_model IS 'Defines content structure: static_syllabus for SSC/Railways, monthly_current_affairs for Banking';
COMMENT ON COLUMN public.manual_mcqs.month_year IS 'Used for Banking exams - stores the month and year for current affairs questions';