-- Add end_date column to tournaments table
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
