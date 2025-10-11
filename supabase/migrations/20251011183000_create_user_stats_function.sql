CREATE OR REPLACE FUNCTION get_user_performance_stats(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    overall_stats JSONB;
    category_performance JSONB;
    recent_attempts JSONB;
BEGIN
    -- 1. Calculate Overall Stats
    SELECT
        jsonb_build_object(
            'totalTests', COUNT(*),
            'averageScore', AVG(uta.score * 100.0 / uta.total_questions),
            'bestScore', MAX(uta.score * 100.0 / uta.total_questions)
        )
    INTO overall_stats
    FROM user_test_attempts uta
    WHERE uta.user_id = p_user_id;

    -- 2. Calculate Performance by Category
    SELECT
        jsonb_agg(stats)
    INTO category_performance
    FROM (
        SELECT
            mt.category,
            AVG(uta.score * 100.0 / uta.total_questions) as "averageScore",
            COUNT(uta.id) as "testsTaken"
        FROM user_test_attempts uta
        JOIN mock_tests mt ON uta.test_id = mt.id
        WHERE uta.user_id = p_user_id
        GROUP BY mt.category
        ORDER BY "averageScore" DESC
    ) stats;

    -- 3. Get Recent Test Attempts
    SELECT
        jsonb_agg(attempts)
    INTO recent_attempts
    FROM (
        SELECT
            uta.test_id as "testId",
            mt.title,
            uta.score,
            uta.total_questions as "totalQuestions",
            uta.completed_at as "completedAt"
        FROM user_test_attempts uta
        JOIN mock_tests mt ON uta.test_id = mt.id
        WHERE uta.user_id = p_user_id
        ORDER BY uta.completed_at DESC
        LIMIT 10
    ) attempts;

    -- 4. Combine all stats into a single JSON object
    RETURN jsonb_build_object(
        'overallStats', COALESCE(overall_stats, '{}'::jsonb),
        'categoryPerformance', COALESCE(category_performance, '[]'::jsonb),
        'recentAttempts', COALESCE(recent_attempts, '[]'::jsonb)
    );
END;
$$;