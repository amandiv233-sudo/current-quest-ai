-- Create current_affairs table to store daily news
CREATE TABLE public.current_affairs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  source TEXT NOT NULL,
  source_url TEXT,
  image_url TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  tags TEXT[],
  exam_relevance TEXT[],
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX idx_current_affairs_category ON public.current_affairs(category);
CREATE INDEX idx_current_affairs_published_at ON public.current_affairs(published_at DESC);
CREATE INDEX idx_current_affairs_tags ON public.current_affairs USING GIN(tags);
CREATE INDEX idx_current_affairs_exam_relevance ON public.current_affairs USING GIN(exam_relevance);

-- Create user_bookmarks table for user interactions
CREATE TABLE public.user_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.current_affairs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, article_id)
);

-- Create mock_tests table to store generated tests
CREATE TABLE public.mock_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  questions JSONB NOT NULL,
  total_questions INTEGER NOT NULL,
  time_limit INTEGER, -- in minutes
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_public BOOLEAN DEFAULT true
);

-- Create user_test_attempts table to track user performance
CREATE TABLE public.user_test_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id UUID REFERENCES public.mock_tests(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_taken INTEGER, -- in seconds
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ai_chat_sessions table for chat history
CREATE TABLE public.ai_chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  session_type TEXT DEFAULT 'general' CHECK (session_type IN ('general', 'doubt_solving', 'test_prep')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.current_affairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for current_affairs (public read access)
CREATE POLICY "Current affairs are viewable by everyone" 
ON public.current_affairs 
FOR SELECT 
USING (true);

-- Create policies for user_bookmarks
CREATE POLICY "Users can view their own bookmarks" 
ON public.user_bookmarks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks" 
ON public.user_bookmarks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" 
ON public.user_bookmarks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for mock_tests
CREATE POLICY "Public tests are viewable by everyone" 
ON public.mock_tests 
FOR SELECT 
USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create their own tests" 
ON public.mock_tests 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Create policies for user_test_attempts
CREATE POLICY "Users can view their own test attempts" 
ON public.user_test_attempts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test attempts" 
ON public.user_test_attempts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for ai_chat_sessions
CREATE POLICY "Users can view their own chat sessions" 
ON public.ai_chat_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions" 
ON public.ai_chat_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" 
ON public.ai_chat_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_current_affairs_updated_at
  BEFORE UPDATE ON public.current_affairs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_chat_sessions_updated_at
  BEFORE UPDATE ON public.ai_chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.current_affairs 
  SET view_count = view_count + 1 
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;