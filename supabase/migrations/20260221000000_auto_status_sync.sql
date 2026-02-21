-- Automatic tournament status sync based on dates
-- Called via rpc('sync_tournament_statuses') before loading tournament lists

CREATE OR REPLACE FUNCTION sync_tournament_statuses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark as completed: end_date has passed (skip draft)
  UPDATE tournaments
  SET status = 'completed'
  WHERE status NOT IN ('draft', 'completed')
    AND end_date IS NOT NULL
    AND end_date < now();

  -- Mark as completed: no end_date but start_date passed by 1+ day (skip draft)
  UPDATE tournaments
  SET status = 'completed'
  WHERE status NOT IN ('draft', 'completed')
    AND end_date IS NULL
    AND start_date IS NOT NULL
    AND start_date < (now() - interval '1 day');

  -- Mark as in_progress: start_date reached, end_date not yet passed (only from registration)
  UPDATE tournaments
  SET status = 'in_progress'
  WHERE status = 'registration'
    AND start_date IS NOT NULL
    AND start_date <= now()
    AND (end_date IS NULL OR end_date >= now());
END;
$$;
