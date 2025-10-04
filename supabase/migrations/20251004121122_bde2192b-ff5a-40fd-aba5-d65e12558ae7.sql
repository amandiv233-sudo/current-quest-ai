-- Update all banking exams to use monthly_current_affairs model
UPDATE exams 
SET content_model = 'monthly_current_affairs'
WHERE category = 'Banking Exams';

-- Insert banking exams only if they don't exist (check by name and category)
INSERT INTO exams (name, category, description, content_model)
SELECT 'IBPS PO', 'Banking Exams', 'Institute of Banking Personnel Selection - Probationary Officer', 'monthly_current_affairs'
WHERE NOT EXISTS (SELECT 1 FROM exams WHERE name = 'IBPS PO' AND category = 'Banking Exams');

INSERT INTO exams (name, category, description, content_model)
SELECT 'IBPS RRB', 'Banking Exams', 'IBPS Regional Rural Banks', 'monthly_current_affairs'
WHERE NOT EXISTS (SELECT 1 FROM exams WHERE name = 'IBPS RRB' AND category = 'Banking Exams');

INSERT INTO exams (name, category, description, content_model)
SELECT 'RBI Grade B', 'Banking Exams', 'Reserve Bank of India - Grade B Officer', 'monthly_current_affairs'
WHERE NOT EXISTS (SELECT 1 FROM exams WHERE name = 'RBI Grade B' AND category = 'Banking Exams');

INSERT INTO exams (name, category, description, content_model)
SELECT 'SBI PO', 'Banking Exams', 'State Bank of India - Probationary Officer', 'monthly_current_affairs'
WHERE NOT EXISTS (SELECT 1 FROM exams WHERE name = 'SBI PO' AND category = 'Banking Exams');