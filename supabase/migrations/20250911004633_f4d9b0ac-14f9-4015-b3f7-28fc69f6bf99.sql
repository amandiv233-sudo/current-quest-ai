-- Add date field to manual_mcqs table for date-based organization
ALTER TABLE public.manual_mcqs ADD COLUMN mcq_date DATE DEFAULT CURRENT_DATE;

-- Add index for better performance when filtering by date
CREATE INDEX idx_manual_mcqs_date ON public.manual_mcqs(mcq_date);

-- Add index for category and date combination
CREATE INDEX idx_manual_mcqs_category_date ON public.manual_mcqs(category, mcq_date);