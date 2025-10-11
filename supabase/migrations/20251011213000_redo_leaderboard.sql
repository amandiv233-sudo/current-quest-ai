-- Step 1: Drop the old function to ensure a clean slate.
DROP FUNCTION IF EXISTS public.get_leaderboard(text);

-- Step 2: Add a performance index to the user_test_attempts table.
-- This will speed up queries that filter by user and date.
CREATE INDEX IF NOT EXISTS idx_user_test_attempts_user_id_completed_at 
ON public.user_test_attempts(user_id, completed_at DESC);

-- Step 3: Create the new, more robust leaderboard function.
CREATE OR REPLACE FUNCTION get_leaderboard(period TEXT)
RETURNS TABLE (
    rank BIGINT,
    user_id UUID,
    username TEXT,
    avatar_url TEXT,
    average_score NUMERIC,
    tests_taken BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER -- Allows the function to bypass RLS to calculate ranks across all users.
SET search_path = public -- A security best practice for SECURITY DEFINER functions.
AS $$
BEGIN
    RETURN QUERY
    WITH user_scores AS (
        SELECT
            uta.user_id,
            -- Calculate a weighted average score: (total correct points / total possible points) * 100
            (SUM(uta.score) * 100.0 / SUM(uta.total_questions)) AS weighted_average,
            COUNT(uta.id) AS tests_count
        FROM
            user_test_attempts uta
        WHERE
            -- Filter by the selected time period
            CASE
                WHEN period = 'daily' THEN uta.completed_at >= now() - interval '1 day'
                WHEN period = 'weekly' THEN uta.completed_at >= now() - interval '7 days'
                ELSE true -- For 'all-time'
            END
        GROUP BY
            uta.user_id
        -- Ensure we don't divide by zero and user has taken at least one test
        HAVING SUM(uta.total_questions) > 0
    )
    SELECT
        ROW_NUMBER() OVER (ORDER BY s.weighted_average DESC, s.tests_count DESC) AS rank,
        p.id AS user_id,
        COALESCE(p.username, p.full_name, 'Anonymous') AS username,
        p.avatar_url,
        s.weighted_average AS average_score,
        s.tests_count AS tests_taken
    FROM
        user_scores s
    JOIN
        profiles p ON s.user_id = p.id
    ORDER BY
        rank
    LIMIT 50;
END;
$$;