-- Add tiebreaker fields to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS penalty_home INT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS penalty_away INT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS penalty_label TEXT;
