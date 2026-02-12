-- Allow group_reclass format
ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS tournaments_format_check;
ALTER TABLE tournaments ADD CONSTRAINT tournaments_format_check
  CHECK (format IN ('round_robin', 'single_elimination', 'double_elimination', 'group_playoff', 'group_reclass'));

-- Allow reclass stage
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_stage_check;
ALTER TABLE matches ADD CONSTRAINT matches_stage_check
  CHECK (stage IN ('group', 'playoff', 'round_robin', 'elimination', 'reclass'));
