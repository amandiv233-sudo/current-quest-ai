-- Function to get leaderboard data based on a time period
CREATE OR REPLACE FUNCTION get_leaderboard(period TEXT)
RETURNS TABLE (
    rank BIGINT,
    user_id UUID,
    username TEXT,
    avatar_url TEXT,
    average_score NUMERIC,
    tests_taken BIGINT
)
AS $$
BEGIN
    RETURN QUERY
    WITH ranked_users AS (
        SELECT
            p.id as user_id,
            p.username,
            p.avatar_url,
            AVG(uta.score * 100.0 / uta.total_questions) as average_score,
            COUNT(uta.id) as tests_taken,
            ROW_NUMBER() OVER (ORDER BY AVG(uta.score * 100.0 / uta.total_questions) DESC, COUNT(uta.id) DESC) as rank
        FROM
            public.user_test_attempts uta
        JOIN
            public.profiles p ON uta.user_id = p.id
        WHERE
            uta.user_id IS NOT NULL AND
            CASE
                WHEN period = 'daily' THEN uta.completed_at >= now() - interval '1 day'
                WHEN period = 'weekly' THEN uta.completed_at >= now() - interval '7 days'
                WHEN period = 'all-time' THEN true
                ELSE true
            END
        GROUP BY
            p.id
        HAVING
            COUNT(uta.id) > 0
    )
    SELECT
        ru.rank,
        ru.user_id,
        COALESCE(ru.username, 'Anonymous') as username, -- Fallback for null usernames
        ru.avatar_url,
        ru.average_score,
        ru.tests_taken
    FROM
        ranked_users ru
    ORDER BY
        ru.rank
    LIMIT 50; -- Limit to top 50 users
END;
$$ LANGUAGE plpgsql;