-- Add topic column to manual_mcqs table
ALTER TABLE public.manual_mcqs
ADD COLUMN topic text;

-- Create exams table
CREATE TABLE public.exams (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on exams
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- Create policy for public viewing of exams
CREATE POLICY "Exams are publicly viewable"
ON public.exams
FOR SELECT
USING (true);

-- Create exam_syllabus_mappings table
CREATE TABLE public.exam_syllabus_mappings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  subcategory text NOT NULL,
  topic text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on exam_syllabus_mappings
ALTER TABLE public.exam_syllabus_mappings ENABLE ROW LEVEL SECURITY;

-- Create policy for public viewing of exam syllabus mappings
CREATE POLICY "Exam syllabus mappings are publicly viewable"
ON public.exam_syllabus_mappings
FOR SELECT
USING (true);

-- Insert exam data from CSV
INSERT INTO public.exams (name, category, description) VALUES
  ('NDA', 'Defense Exams', 'National Defence Academy'),
  ('CDS', 'Defense Exams', 'Combined Defence Services'),
  ('AFCAT', 'Defense Exams', 'Air Force Common Admission Test'),
  ('IBPS PO', 'Banking Exams', 'Institute of Banking Personnel Selection - Probationary Officer'),
  ('SBI PO', 'Banking Exams', 'State Bank of India - Probationary Officer'),
  ('RBI Grade B', 'Banking Exams', 'Reserve Bank of India - Grade B Officer'),
  ('IBPS RRB', 'Banking Exams', 'IBPS Regional Rural Banks'),
  ('SSC CGL', 'SSC Exams', 'Staff Selection Commission - Combined Graduate Level'),
  ('SSC CHSL', 'SSC Exams', 'Staff Selection Commission - Combined Higher Secondary Level'),
  ('SSC CPO', 'SSC Exams', 'Staff Selection Commission - Central Police Organisation'),
  ('SSC GD', 'SSC Exams', 'Staff Selection Commission - General Duty'),
  ('RRB NTPC', 'Railway Exams', 'Railway Recruitment Board - Non-Technical Popular Categories'),
  ('RRB Group D', 'Railway Exams', 'Railway Recruitment Board - Group D'),
  ('RRB ALP', 'Railway Exams', 'Railway Recruitment Board - Assistant Loco Pilot');

-- Create trigger for updating updated_at on exams
CREATE TRIGGER update_exams_updated_at
BEFORE UPDATE ON public.exams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();