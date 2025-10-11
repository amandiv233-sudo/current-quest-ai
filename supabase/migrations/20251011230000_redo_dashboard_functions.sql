-- Step 1: Drop the old complex function to start clean.
DROP FUNCTION IF EXISTS public.get_user_performance_stats(p_user_id uuid);


-- Step 2: Create a new function specifically for overall stats.
-- It returns a TABLE, which Supabase's type generator understands perfectly.
CREATE OR REPLACE FUNCTION get_user_overall_stats(p_user_id UUID)
RETURNS TABLE (
    total_tests BIGINT,
    average_score NUMERIC,
    best_score NUMERIC
)
LANGUAGE sql
AS $$
    SELECT
        COUNT(*) AS total_tests,
        AVG(uta.score * 100.0 / uta.total_questions) AS average_score,
        MAX(uta.score * 100.0 / uta.total_questions) AS best_score
    FROM public.user_test_attempts uta
    WHERE uta.user_id = p_user_id;
$$;


-- Step 3: Create a new function for category-specific performance.
CREATE OR REPLACE FUNCTION get_user_category_performance(p_user_id UUID)
RETURNS TABLE (
    category TEXT,
    average_score NUMERIC,
    tests_taken BIGINT
)
LANGUAGE sql
AS $$
    SELECT
        mt.category,
        AVG(uta.score * 100.0 / uta.total_questions) as average_score,
        COUNT(uta.id) as tests_taken
    FROM public.user_test_attempts uta
    JOIN public.mock_tests mt ON uta.test_id = mt.id
    WHERE uta.user_id = p_user_id
    GROUP BY mt.category
    ORDER BY average_score DESC;
$$;


-- Step 4: Create a new function for recent test attempts.
CREATE OR REPLACE FUNCTION get_user_recent_attempts(p_user_id UUID)
RETURNS TABLE (
    test_id UUID,
    title TEXT,
    score NUMERIC,
    total_questions INT,
    completed_at TIMESTAMPTZ
)
LANGUAGE sql
AS $$
    SELECT
        uta.test_id,
        mt.title,
        uta.score,
        uta.total_questions,
        uta.completed_at
    FROM public.user_test_attempts uta
    JOIN public.mock_tests mt ON uta.test_id = mt.id
    WHERE uta.user_id = p_user_id
    ORDER BY uta.completed_at DESC
    LIMIT 10;
$$;