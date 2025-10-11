-- Change the data type of the score column from INTEGER to NUMERIC
-- to correctly store scores with decimal values from negative marking.

ALTER TABLE public.user_test_attempts
ALTER COLUMN score TYPE NUMERIC(5, 2);