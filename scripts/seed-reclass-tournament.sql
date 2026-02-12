-- ============================================================
-- TEST DATA: Groups + Reclassification tournament (16 teams, 4 groups)
-- Run this in Supabase SQL Editor AFTER seed-test-data.sql
-- ============================================================

DO $$
DECLARE
  org_id UUID;
  t_id UUID := gen_random_uuid();
  -- Group IDs
  g1_id UUID := gen_random_uuid();
  g2_id UUID := gen_random_uuid();
  g3_id UUID := gen_random_uuid();
  g4_id UUID := gen_random_uuid();
  -- Reclass Group IDs
  rg1_id UUID := gen_random_uuid();
  rg2_id UUID := gen_random_uuid();
  rg3_id UUID := gen_random_uuid();
  rg4_id UUID := gen_random_uuid();
  -- Team IDs (16 teams)
  t01 UUID := gen_random_uuid();
  t02 UUID := gen_random_uuid();
  t03 UUID := gen_random_uuid();
  t04 UUID := gen_random_uuid();
  t05 UUID := gen_random_uuid();
  t06 UUID := gen_random_uuid();
  t07 UUID := gen_random_uuid();
  t08 UUID := gen_random_uuid();
  t09 UUID := gen_random_uuid();
  t10 UUID := gen_random_uuid();
  t11 UUID := gen_random_uuid();
  t12 UUID := gen_random_uuid();
  t13 UUID := gen_random_uuid();
  t14 UUID := gen_random_uuid();
  t15 UUID := gen_random_uuid();
  t16 UUID := gen_random_uuid();
BEGIN
  -- Get organizer
  SELECT organizer_id INTO org_id FROM tournaments LIMIT 1;
  IF org_id IS NULL THEN
    SELECT id INTO org_id FROM auth.users LIMIT 1;
  END IF;

  IF org_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please log in via the app first.';
  END IF;

  -- ═══════════════════════════════════════════════════════════
  -- TOURNAMENT: Kauno Mokyklų Čempionatas (Group + Reclassification, 16 teams)
  -- ═══════════════════════════════════════════════════════════
  INSERT INTO tournaments (id, organizer_id, name, description, format, status, max_teams, start_date)
  VALUES (t_id, org_id, 'Kauno Mokyklų Čempionatas',
    '16 mokyklų komandų turnyras su grupėmis ir pergrupavimo etapu. Kiekviena komanda gauna tikslų reitingą nuo 1 iki 16.',
    'group_reclass', 'in_progress', 16, '2026-06-01');

  -- Teams (Lithuanian school names)
  INSERT INTO teams (id, tournament_id, name) VALUES
    (t01, t_id, 'Saulės gimnazija'),
    (t02, t_id, 'Ąžuolo progimnazija'),
    (t03, t_id, 'Aušros vidurinė'),
    (t04, t_id, 'Gabijos mokykla'),
    (t05, t_id, 'Dariaus ir Girėno'),
    (t06, t_id, 'Maironio gimnazija'),
    (t07, t_id, 'Kudirkos mokykla'),
    (t08, t_id, 'Basanavičiaus liceju'),
    (t09, t_id, 'Žemaitės progimnazija'),
    (t10, t_id, 'Salomėjos mokykla'),
    (t11, t_id, 'Vytauto gimnazija'),
    (t12, t_id, 'Birutės mokykla'),
    (t13, t_id, 'Gedimino vidurinė'),
    (t14, t_id, 'Mindaugo gimnazija'),
    (t15, t_id, 'Kęstučio mokykla'),
    (t16, t_id, 'Algirdo progimnazija');

  -- Stage 1: Initial Groups (4 groups of 4)
  INSERT INTO tournament_groups (id, tournament_id, name, team_ids) VALUES
    (g1_id, t_id, 'A', jsonb_build_array(t01, t02, t03, t04)),
    (g2_id, t_id, 'B', jsonb_build_array(t05, t06, t07, t08)),
    (g3_id, t_id, 'C', jsonb_build_array(t09, t10, t11, t12)),
    (g4_id, t_id, 'D', jsonb_build_array(t13, t14, t15, t16));

  -- Group A matches (all completed)
  -- Standings: t01=7pts(1st), t02=6pts(2nd), t04=4pts(3rd), t03=0pts(4th)
  INSERT INTO matches (tournament_id, group_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage) VALUES
    (t_id, g1_id, 1, 1, t01, t02, 2, 1, 'completed', 'group'),
    (t_id, g1_id, 1, 2, t03, t04, 0, 3, 'completed', 'group'),
    (t_id, g1_id, 2, 3, t01, t03, 4, 0, 'completed', 'group'),
    (t_id, g1_id, 2, 4, t02, t04, 2, 1, 'completed', 'group'),
    (t_id, g1_id, 3, 5, t01, t04, 1, 1, 'completed', 'group'),
    (t_id, g1_id, 3, 6, t02, t03, 3, 0, 'completed', 'group');

  -- Group B matches (all completed)
  -- Standings: t06=7pts(1st), t05=6pts(2nd), t08=4pts(3rd), t07=0pts(4th)
  INSERT INTO matches (tournament_id, group_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage) VALUES
    (t_id, g2_id, 1, 7,  t05, t06, 1, 2, 'completed', 'group'),
    (t_id, g2_id, 1, 8,  t07, t08, 0, 2, 'completed', 'group'),
    (t_id, g2_id, 2, 9,  t05, t07, 3, 0, 'completed', 'group'),
    (t_id, g2_id, 2, 10, t06, t08, 2, 1, 'completed', 'group'),
    (t_id, g2_id, 3, 11, t05, t08, 2, 1, 'completed', 'group'),
    (t_id, g2_id, 3, 12, t06, t07, 3, 0, 'completed', 'group');

  -- Group C matches (all completed)
  -- Standings: t11=7pts(1st), t09=5pts(2nd), t10=4pts(3rd), t12=1pt(4th)
  INSERT INTO matches (tournament_id, group_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage) VALUES
    (t_id, g3_id, 1, 13, t09, t10, 2, 0, 'completed', 'group'),
    (t_id, g3_id, 1, 14, t11, t12, 3, 1, 'completed', 'group'),
    (t_id, g3_id, 2, 15, t09, t11, 1, 2, 'completed', 'group'),
    (t_id, g3_id, 2, 16, t10, t12, 2, 0, 'completed', 'group'),
    (t_id, g3_id, 3, 17, t09, t12, 2, 2, 'completed', 'group'),
    (t_id, g3_id, 3, 18, t10, t11, 0, 2, 'completed', 'group');

  -- Group D matches (all completed)
  -- Standings: t14=9pts(1st), t13=4pts(2nd), t16=3pts(3rd), t15=1pt(4th)
  INSERT INTO matches (tournament_id, group_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage) VALUES
    (t_id, g4_id, 1, 19, t13, t14, 0, 2, 'completed', 'group'),
    (t_id, g4_id, 1, 20, t15, t16, 1, 1, 'completed', 'group'),
    (t_id, g4_id, 2, 21, t13, t15, 2, 0, 'completed', 'group'),
    (t_id, g4_id, 2, 22, t14, t16, 3, 1, 'completed', 'group'),
    (t_id, g4_id, 3, 23, t13, t16, 1, 0, 'completed', 'group'),
    (t_id, g4_id, 3, 24, t14, t15, 4, 0, 'completed', 'group');

  -- Stage 2: Reclassification Groups
  -- Gold: 1st from each group (t01, t06, t11, t14)
  -- Silver: 2nd from each group (t02, t05, t09, t13)
  -- Bronze: 3rd from each group (t04, t08, t10, t16)
  -- Consolation: 4th from each group (t03, t07, t12, t15)

  INSERT INTO tournament_groups (id, tournament_id, name, team_ids) VALUES
    (rg1_id, t_id, 'Gold', jsonb_build_array(t01, t06, t11, t14)),
    (rg2_id, t_id, 'Silver', jsonb_build_array(t02, t05, t09, t13)),
    (rg3_id, t_id, 'Bronze', jsonb_build_array(t04, t08, t10, t16)),
    (rg4_id, t_id, 'Consolation', jsonb_build_array(t03, t07, t12, t15));

  -- Gold Group matches (some completed, some scheduled)
  INSERT INTO matches (tournament_id, group_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage) VALUES
    (t_id, rg1_id, 1, 25, t01, t06, 2, 2, 'completed', 'reclass'),
    (t_id, rg1_id, 1, 26, t11, t14, 1, 3, 'completed', 'reclass'),
    (t_id, rg1_id, 2, 27, t01, t11, 3, 0, 'completed', 'reclass'),
    (t_id, rg1_id, 2, 28, t06, t14, 1, 1, 'completed', 'reclass'),
    (t_id, rg1_id, 3, 29, t01, t14, NULL, NULL, 'scheduled', 'reclass'),
    (t_id, rg1_id, 3, 30, t06, t11, NULL, NULL, 'scheduled', 'reclass');

  -- Silver Group matches (some completed)
  INSERT INTO matches (tournament_id, group_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage) VALUES
    (t_id, rg2_id, 1, 31, t02, t05, 1, 0, 'completed', 'reclass'),
    (t_id, rg2_id, 1, 32, t09, t13, 2, 1, 'completed', 'reclass'),
    (t_id, rg2_id, 2, 33, t02, t09, NULL, NULL, 'scheduled', 'reclass'),
    (t_id, rg2_id, 2, 34, t05, t13, NULL, NULL, 'scheduled', 'reclass'),
    (t_id, rg2_id, 3, 35, t02, t13, NULL, NULL, 'scheduled', 'reclass'),
    (t_id, rg2_id, 3, 36, t05, t09, NULL, NULL, 'scheduled', 'reclass');

  -- Bronze Group matches (all scheduled)
  INSERT INTO matches (tournament_id, group_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage) VALUES
    (t_id, rg3_id, 1, 37, t04, t08, NULL, NULL, 'scheduled', 'reclass'),
    (t_id, rg3_id, 1, 38, t10, t16, NULL, NULL, 'scheduled', 'reclass'),
    (t_id, rg3_id, 2, 39, t04, t10, NULL, NULL, 'scheduled', 'reclass'),
    (t_id, rg3_id, 2, 40, t08, t16, NULL, NULL, 'scheduled', 'reclass'),
    (t_id, rg3_id, 3, 41, t04, t16, NULL, NULL, 'scheduled', 'reclass'),
    (t_id, rg3_id, 3, 42, t08, t10, NULL, NULL, 'scheduled', 'reclass');

  -- Consolation Group matches (all scheduled)
  INSERT INTO matches (tournament_id, group_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage) VALUES
    (t_id, rg4_id, 1, 43, t03, t07, NULL, NULL, 'scheduled', 'reclass'),
    (t_id, rg4_id, 1, 44, t12, t15, NULL, NULL, 'scheduled', 'reclass'),
    (t_id, rg4_id, 2, 45, t03, t12, NULL, NULL, 'scheduled', 'reclass'),
    (t_id, rg4_id, 2, 46, t07, t15, NULL, NULL, 'scheduled', 'reclass'),
    (t_id, rg4_id, 3, 47, t03, t15, NULL, NULL, 'scheduled', 'reclass'),
    (t_id, rg4_id, 3, 48, t07, t12, NULL, NULL, 'scheduled', 'reclass');

  RAISE NOTICE 'Done! Created Kauno Mokyklų Čempionatas with 16 teams, 4 groups + reclassification.';
END $$;
