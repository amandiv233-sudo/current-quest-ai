-- Create table for manual MCQs that admins can add
CREATE TABLE public.manual_mcqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_type TEXT DEFAULT 'mcq' CHECK (question_type IN ('mcq', 'pyq')),
  exam_year INTEGER,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.manual_mcqs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "MCQs are viewable by everyone" 
ON public.manual_mcqs 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Only authenticated users can create MCQs" 
ON public.manual_mcqs 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own MCQs" 
ON public.manual_mcqs 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own MCQs" 
ON public.manual_mcqs 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_manual_mcqs_updated_at
BEFORE UPDATE ON public.manual_mcqs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();