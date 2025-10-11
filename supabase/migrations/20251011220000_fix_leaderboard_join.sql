-- This function replaces the previous version to use a LEFT JOIN.
-- This ensures users with test scores appear on the leaderboard even if they
-- don't have a corresponding entry in the profiles table yet.

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
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH user_scores AS (
        SELECT
            uta.user_id,
            (SUM(uta.score) * 100.0 / SUM(uta.total_questions)) AS weighted_average,
            COUNT(uta.id) AS tests_count
        FROM
            user_test_attempts uta
        WHERE
            uta.user_id IS NOT NULL AND
            CASE
                WHEN period = 'daily' THEN uta.completed_at >= now() - interval '1 day'
                WHEN period = 'weekly' THEN uta.completed_at >= now() - interval '7 days'
                ELSE true
            END
        GROUP BY
            uta.user_id
        HAVING SUM(uta.total_questions) > 0
    )
    SELECT
        ROW_NUMBER() OVER (ORDER BY s.weighted_average DESC, s.tests_count DESC) AS rank,
        s.user_id,
        COALESCE(p.username, p.full_name, 'Anonymous') AS username,
        p.avatar_url,
        s.weighted_average AS average_score,
        s.tests_count AS tests_taken
    FROM
        user_scores s
    -- The fix is changing 'JOIN' to 'LEFT JOIN' here.
    LEFT JOIN
        profiles p ON s.user_id = p.id
    ORDER BY
        rank
    LIMIT 50;
END;
$$;