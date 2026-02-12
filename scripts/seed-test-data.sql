-- ============================================================
-- TEST DATA: 3 tournaments (Group+Playoff, Round Robin, Single Elimination)
-- Run this in Supabase SQL Editor
-- ============================================================

-- Get organizer ID (first user who has tournaments)
DO $$
DECLARE
  org_id UUID;
  -- Tournament IDs
  t1_id UUID := gen_random_uuid();
  t2_id UUID := gen_random_uuid();
  t3_id UUID := gen_random_uuid();
  -- Group IDs
  ga_id UUID := gen_random_uuid();
  gb_id UUID := gen_random_uuid();
  -- Team IDs for Tournament 1 (Group+Playoff)
  vil_id UUID := gen_random_uuid();
  kau_id UUID := gen_random_uuid();
  klp_id UUID := gen_random_uuid();
  sia_id UUID := gen_random_uuid();
  rig_id UUID := gen_random_uuid();
  lie_id UUID := gen_random_uuid();
  tal_id UUID := gen_random_uuid();
  tar_id UUID := gen_random_uuid();
  -- Team IDs for Tournament 2 (Round Robin)
  zal_id UUID := gen_random_uuid();
  sak_id UUID := gen_random_uuid();
  vlk_id UUID := gen_random_uuid();
  azu_id UUID := gen_random_uuid();
  per_id UUID := gen_random_uuid();
  -- Team IDs for Tournament 3 (Single Elimination)
  thu_id UUID := gen_random_uuid();
  sto_id UUID := gen_random_uuid();
  lig_id UUID := gen_random_uuid();
  tor_id UUID := gen_random_uuid();
  cyc_id UUID := gen_random_uuid();
  bli_id UUID := gen_random_uuid();
BEGIN
  -- Get organizer
  SELECT organizer_id INTO org_id FROM tournaments LIMIT 1;
  IF org_id IS NULL THEN
    SELECT id INTO org_id FROM auth.users LIMIT 1;
  END IF;

  IF org_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please log in via the app first.';
  END IF;

  RAISE NOTICE 'Using organizer: %', org_id;

  -- ═══════════════════════════════════════════════════════════
  -- TOURNAMENT 1: Baltic Cup 2026 (Group + Playoff, 8 teams)
  -- ═══════════════════════════════════════════════════════════
  INSERT INTO tournaments (id, organizer_id, name, description, format, status, max_teams, start_date)
  VALUES (t1_id, org_id, 'Baltic Cup 2026',
    'Kasmetinis Baltijos regiono futbolo turnyras. 8 komandos, 2 grupės, atkrintamosios.',
    'group_playoff', 'in_progress', 8, '2026-03-15');

  -- Teams
  INSERT INTO teams (id, tournament_id, name) VALUES
    (vil_id, t1_id, 'Vilnius FC'),
    (kau_id, t1_id, 'Kaunas United'),
    (klp_id, t1_id, 'Klaipėda City'),
    (sia_id, t1_id, 'Šiauliai Stars'),
    (rig_id, t1_id, 'Riga Dynamo'),
    (lie_id, t1_id, 'Liepāja FK'),
    (tal_id, t1_id, 'Tallinn Rangers'),
    (tar_id, t1_id, 'Tartu Athletic');

  -- Groups
  INSERT INTO tournament_groups (id, tournament_id, name, team_ids) VALUES
    (ga_id, t1_id, 'A', jsonb_build_array(vil_id, kau_id, klp_id, sia_id)),
    (gb_id, t1_id, 'B', jsonb_build_array(rig_id, lie_id, tal_id, tar_id));

  -- Group A matches (all completed)
  INSERT INTO matches (tournament_id, group_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage) VALUES
    (t1_id, ga_id, 1, 1,  vil_id, kau_id, 2, 1, 'completed', 'group'),
    (t1_id, ga_id, 1, 2,  klp_id, sia_id, 0, 0, 'completed', 'group'),
    (t1_id, ga_id, 2, 3,  vil_id, klp_id, 3, 1, 'completed', 'group'),
    (t1_id, ga_id, 2, 4,  kau_id, sia_id, 1, 2, 'completed', 'group'),
    (t1_id, ga_id, 3, 5,  vil_id, sia_id, 1, 1, 'completed', 'group'),
    (t1_id, ga_id, 3, 6,  kau_id, klp_id, 2, 0, 'completed', 'group');

  -- Group B matches (all completed)
  INSERT INTO matches (tournament_id, group_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage) VALUES
    (t1_id, gb_id, 1, 7,  rig_id, lie_id, 1, 0, 'completed', 'group'),
    (t1_id, gb_id, 1, 8,  tal_id, tar_id, 2, 2, 'completed', 'group'),
    (t1_id, gb_id, 2, 9,  rig_id, tal_id, 0, 1, 'completed', 'group'),
    (t1_id, gb_id, 2, 10, lie_id, tar_id, 3, 1, 'completed', 'group'),
    (t1_id, gb_id, 3, 11, rig_id, tar_id, 2, 0, 'completed', 'group'),
    (t1_id, gb_id, 3, 12, lie_id, tal_id, 1, 1, 'completed', 'group');

  -- Playoff: Semifinals + Final
  -- Group A standings: Vilnius 7pts, Šiauliai 4pts, Kaunas 6pts, Klaipėda 1pt → top2: Vilnius, Kaunas
  -- Group B standings: Riga 6pts, Tallinn 5pts, Liepāja 4pts, Tartu 2pts → top2: Riga, Tallinn
  INSERT INTO matches (tournament_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage) VALUES
    -- Semifinal 1: A1 (Vilnius) vs B2 (Tallinn)
    (t1_id, 1, 1, vil_id, tal_id, 3, 1, 'completed', 'playoff'),
    -- Semifinal 2: B1 (Riga) vs A2 (Kaunas)
    (t1_id, 1, 2, rig_id, kau_id, 2, 1, 'completed', 'playoff'),
    -- Final: Vilnius vs Riga (not yet played!)
    (t1_id, 2, 3, vil_id, rig_id, NULL, NULL, 'scheduled', 'playoff');

  -- ═══════════════════════════════════════════════════════════
  -- TOURNAMENT 2: Vilnius City League (Round Robin, 5 teams)
  -- ═══════════════════════════════════════════════════════════
  INSERT INTO tournaments (id, organizer_id, name, description, format, status, max_teams, start_date)
  VALUES (t2_id, org_id, 'Vilnius City League',
    '5 komandų miesto lyga. Visi žaidžia prieš visus — kas surinks daugiausiai taškų, tas laimi!',
    'round_robin', 'in_progress', 5, '2026-04-01');

  INSERT INTO teams (id, tournament_id, name) VALUES
    (zal_id, t2_id, 'Žalgiris B'),
    (sak_id, t2_id, 'Sakalai'),
    (vlk_id, t2_id, 'Vilko Komanda'),
    (azu_id, t2_id, 'Ąžuolai'),
    (per_id, t2_id, 'Perkūnas');

  -- 10 matches total, 6 completed, 4 scheduled
  INSERT INTO matches (tournament_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage) VALUES
    -- Round 1
    (t2_id, 1, 1, zal_id, per_id, 3, 0, 'completed', 'round_robin'),
    (t2_id, 1, 2, sak_id, azu_id, 1, 1, 'completed', 'round_robin'),
    -- Round 2
    (t2_id, 2, 3, zal_id, azu_id, 2, 0, 'completed', 'round_robin'),
    (t2_id, 2, 4, vlk_id, per_id, 0, 1, 'completed', 'round_robin'),
    -- Round 3
    (t2_id, 3, 5, zal_id, vlk_id, 4, 2, 'completed', 'round_robin'),
    (t2_id, 3, 6, sak_id, per_id, 2, 3, 'completed', 'round_robin'),
    -- Round 4 (not yet played)
    (t2_id, 4, 7, zal_id, sak_id, NULL, NULL, 'scheduled', 'round_robin'),
    (t2_id, 4, 8, vlk_id, azu_id, NULL, NULL, 'scheduled', 'round_robin'),
    -- Round 5 (not yet played)
    (t2_id, 5, 9,  sak_id, vlk_id, NULL, NULL, 'scheduled', 'round_robin'),
    (t2_id, 5, 10, azu_id, per_id, NULL, NULL, 'scheduled', 'round_robin');

  -- ═══════════════════════════════════════════════════════════
  -- TOURNAMENT 3: Kaunas Knockout Cup (Single Elimination, 6 teams)
  -- ═══════════════════════════════════════════════════════════
  INSERT INTO tournaments (id, organizer_id, name, description, format, status, max_teams, start_date)
  VALUES (t3_id, org_id, 'Kaunas Knockout Cup',
    'Greitas eliminacijos turnyras — pralaimi ir iškrenti! 6 komandos kovoja dėl taurės.',
    'single_elimination', 'in_progress', 6, '2026-05-10');

  INSERT INTO teams (id, tournament_id, name) VALUES
    (thu_id, t3_id, 'Thunder FC'),
    (sto_id, t3_id, 'Storm United'),
    (lig_id, t3_id, 'Lightning XI'),
    (tor_id, t3_id, 'Tornado SK'),
    (cyc_id, t3_id, 'Cyclone FC'),
    (bli_id, t3_id, 'Blizzard FC');

  -- 6 teams → needs 8 slots → 2 byes
  -- Round 1 (QF): 4 matches, 2 real + 2 with only 1 team (bye → auto advance)
  INSERT INTO matches (tournament_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage) VALUES
    (t3_id, 1, 1, thu_id, sto_id, 2, 1, 'completed', 'elimination'),
    (t3_id, 1, 2, lig_id, tor_id, 0, 3, 'completed', 'elimination'),
    (t3_id, 1, 3, cyc_id, NULL,   NULL, NULL, 'scheduled', 'elimination'),
    (t3_id, 1, 4, bli_id, NULL,   NULL, NULL, 'scheduled', 'elimination'),
    -- Round 2 (SF): Thunder vs Tornado, Cyclone vs Blizzard
    (t3_id, 2, 5, thu_id, tor_id, 1, 0, 'completed', 'elimination'),
    (t3_id, 2, 6, cyc_id, bli_id, 3, 2, 'completed', 'elimination'),
    -- Round 3 (Final): Thunder vs Cyclone
    (t3_id, 3, 7, thu_id, cyc_id, NULL, NULL, 'scheduled', 'elimination');

  RAISE NOTICE 'Done! Created 3 tournaments with test data.';
END $$;
