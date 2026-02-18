-- =============================================
-- Seed groups + matches with scores for all 9 tournaments
-- Run AFTER seed_fake_tournaments.sql and seed_fake_teams.sql
-- team_ids is JSONB so we cast with to_jsonb()
-- =============================================

-- =============================================
-- 1. Kauno Krepšinio Lyga 2026 (group_playoff, 16 teams, in_progress)
-- =============================================
DO $$
DECLARE
  tid UUID;
  gid_a UUID; gid_b UUID; gid_c UUID; gid_d UUID;
  teams UUID[];
BEGIN
  SELECT id INTO tid FROM tournaments WHERE name = 'Kauno Krepšinio Lyga 2026';
  SELECT array_agg(id ORDER BY name) INTO teams FROM teams WHERE tournament_id = tid;

  INSERT INTO tournament_groups (tournament_id, name, team_ids)
  VALUES (tid, 'A grupė', to_jsonb(ARRAY[teams[1], teams[2], teams[3], teams[4]]))
  RETURNING id INTO gid_a;
  INSERT INTO tournament_groups (tournament_id, name, team_ids)
  VALUES (tid, 'B grupė', to_jsonb(ARRAY[teams[5], teams[6], teams[7], teams[8]]))
  RETURNING id INTO gid_b;
  INSERT INTO tournament_groups (tournament_id, name, team_ids)
  VALUES (tid, 'C grupė', to_jsonb(ARRAY[teams[9], teams[10], teams[11], teams[12]]))
  RETURNING id INTO gid_c;
  INSERT INTO tournament_groups (tournament_id, name, team_ids)
  VALUES (tid, 'D grupė', to_jsonb(ARRAY[teams[13], teams[14], teams[15], teams[16]]))
  RETURNING id INTO gid_d;

  -- Group A matches
  INSERT INTO matches (tournament_id, group_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage) VALUES
  (tid, gid_a, 1, 1, teams[1], teams[2], 78, 65, 'completed', 'group'),
  (tid, gid_a, 1, 2, teams[3], teams[4], 82, 80, 'completed', 'group'),
  (tid, gid_a, 2, 3, teams[1], teams[3], 90, 72, 'completed', 'group'),
  (tid, gid_a, 2, 4, teams[2], teams[4], 68, 71, 'completed', 'group'),
  (tid, gid_a, 3, 5, teams[1], teams[4], 85, 77, 'completed', 'group'),
  (tid, gid_a, 3, 6, teams[2], teams[3], 69, 74, 'completed', 'group');

  -- Group B matches
  INSERT INTO matches (tournament_id, group_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage) VALUES
  (tid, gid_b, 1, 7, teams[5], teams[6], 88, 82, 'completed', 'group'),
  (tid, gid_b, 1, 8, teams[7], teams[8], 75, 79, 'completed', 'group'),
  (tid, gid_b, 2, 9, teams[5], teams[7], 91, 85, 'completed', 'group'),
  (tid, gid_b, 2, 10, teams[6], teams[8], 70, 68, 'completed', 'group'),
  (tid, gid_b, 3, 11, teams[5], teams[8], 86, 80, 'completed', 'group'),
  (tid, gid_b, 3, 12, teams[6], teams[7], 77, 73, 'completed', 'group');

  -- Group C matches
  INSERT INTO matches (tournament_id, group_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage) VALUES
  (tid, gid_c, 1, 13, teams[9], teams[10], 64, 72, 'completed', 'group'),
  (tid, gid_c, 1, 14, teams[11], teams[12], 81, 78, 'completed', 'group'),
  (tid, gid_c, 2, 15, teams[9], teams[11], 70, 65, 'completed', 'group'),
  (tid, gid_c, 2, 16, teams[10], teams[12], 83, 79, 'completed', 'group'),
  (tid, gid_c, 3, 17, teams[9], teams[12], 76, 74, 'completed', 'group'),
  (tid, gid_c, 3, 18, teams[10], teams[11], 88, 82, 'completed', 'group');

  -- Group D matches
  INSERT INTO matches (tournament_id, group_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage) VALUES
  (tid, gid_d, 1, 19, teams[13], teams[14], 71, 69, 'completed', 'group'),
  (tid, gid_d, 1, 20, teams[15], teams[16], 66, 73, 'completed', 'group'),
  (tid, gid_d, 2, 21, teams[13], teams[15], 80, 75, 'completed', 'group'),
  (tid, gid_d, 2, 22, teams[14], teams[16], 78, 82, 'completed', 'group'),
  (tid, gid_d, 3, 23, teams[13], teams[16], 84, 77, 'completed', 'group'),
  (tid, gid_d, 3, 24, teams[14], teams[15], 72, 70, 'completed', 'group');

  -- Playoff
  INSERT INTO matches (tournament_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage) VALUES
  (tid, 1, 25, teams[1], teams[10], 82, 78, 'completed', 'playoff'),
  (tid, 1, 26, teams[5], teams[13], NULL, NULL, 'scheduled', 'playoff'),
  (tid, 2, 27, NULL, NULL, NULL, NULL, 'scheduled', 'playoff');
END $$;

-- =============================================
-- 2. Vilnius Futsal Cup (round_robin, 12 teams, in_progress)
-- =============================================
DO $$
DECLARE
  tid UUID;
  teams UUID[];
  i INT; j INT; mn INT := 1; r INT := 1;
  hs INT; as_ INT;
BEGIN
  SELECT id INTO tid FROM tournaments WHERE name = 'Vilnius Futsal Cup';
  SELECT array_agg(id ORDER BY name) INTO teams FROM teams WHERE tournament_id = tid;

  FOR i IN 1..12 LOOP
    FOR j IN (i+1)..12 LOOP
      IF mn <= 40 THEN
        hs := floor(random() * 8)::INT;
        as_ := floor(random() * 8)::INT;
        INSERT INTO matches (tournament_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage)
        VALUES (tid, r, mn, teams[i], teams[j], hs, as_, 'completed', 'round_robin');
      ELSE
        INSERT INTO matches (tournament_id, round, match_number, home_team_id, away_team_id, status, stage)
        VALUES (tid, r, mn, teams[i], teams[j], 'scheduled', 'round_robin');
      END IF;
      mn := mn + 1;
      IF mn % 6 = 1 THEN r := r + 1; END IF;
    END LOOP;
  END LOOP;
END $$;

-- =============================================
-- 3. Baltic Volleyball Open (group_reclass, 8 teams, in_progress)
-- =============================================
DO $$
DECLARE
  tid UUID;
  gid_a UUID; gid_b UUID;
  teams UUID[];
BEGIN
  SELECT id INTO tid FROM tournaments WHERE name = 'Baltic Volleyball Open';
  SELECT array_agg(id ORDER BY name) INTO teams FROM teams WHERE tournament_id = tid;

  INSERT INTO tournament_groups (tournament_id, name, team_ids)
  VALUES (tid, 'A grupė', to_jsonb(ARRAY[teams[1], teams[2], teams[3], teams[4]]))
  RETURNING id INTO gid_a;
  INSERT INTO tournament_groups (tournament_id, name, team_ids)
  VALUES (tid, 'B grupė', to_jsonb(ARRAY[teams[5], teams[6], teams[7], teams[8]]))
  RETURNING id INTO gid_b;

  INSERT INTO matches (tournament_id, group_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage) VALUES
  (tid, gid_a, 1, 1, teams[1], teams[2], 3, 1, 'completed', 'group'),
  (tid, gid_a, 1, 2, teams[3], teams[4], 2, 3, 'completed', 'group'),
  (tid, gid_a, 2, 3, teams[1], teams[3], 3, 0, 'completed', 'group'),
  (tid, gid_a, 2, 4, teams[2], teams[4], 3, 2, 'completed', 'group'),
  (tid, gid_a, 3, 5, teams[1], teams[4], 3, 1, 'completed', 'group'),
  (tid, gid_a, 3, 6, teams[2], teams[3], 1, 3, 'completed', 'group'),
  (tid, gid_b, 1, 7, teams[5], teams[6], 3, 2, 'completed', 'group'),
  (tid, gid_b, 1, 8, teams[7], teams[8], 0, 3, 'completed', 'group'),
  (tid, gid_b, 2, 9, teams[5], teams[7], 3, 1, 'completed', 'group'),
  (tid, gid_b, 2, 10, teams[6], teams[8], 2, 3, 'completed', 'group'),
  (tid, gid_b, 3, 11, teams[5], teams[8], 3, 0, 'completed', 'group'),
  (tid, gid_b, 3, 12, teams[6], teams[7], 3, 1, 'completed', 'group');

  INSERT INTO matches (tournament_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage) VALUES
  (tid, 4, 13, teams[1], teams[8], 3, 0, 'completed', 'reclass'),
  (tid, 4, 14, teams[5], teams[4], 3, 1, 'completed', 'reclass'),
  (tid, 4, 15, teams[3], teams[6], NULL, NULL, 'scheduled', 'reclass'),
  (tid, 4, 16, teams[2], teams[7], NULL, NULL, 'scheduled', 'reclass');
END $$;

-- =============================================
-- 4. Pavasario Futbolo Taurė (single_elimination, 16 teams, registration)
-- =============================================
DO $$
DECLARE
  tid UUID;
  teams UUID[];
BEGIN
  SELECT id INTO tid FROM tournaments WHERE name = 'Pavasario Futbolo Taurė';
  SELECT array_agg(id ORDER BY name) INTO teams FROM teams WHERE tournament_id = tid;

  INSERT INTO matches (tournament_id, round, match_number, home_team_id, away_team_id, status, stage) VALUES
  (tid, 1, 1, teams[1], teams[16], 'scheduled', 'elimination'),
  (tid, 1, 2, teams[2], teams[15], 'scheduled', 'elimination'),
  (tid, 1, 3, teams[3], teams[14], 'scheduled', 'elimination'),
  (tid, 1, 4, teams[4], teams[13], 'scheduled', 'elimination'),
  (tid, 1, 5, teams[5], teams[12], 'scheduled', 'elimination'),
  (tid, 1, 6, teams[6], teams[11], 'scheduled', 'elimination'),
  (tid, 1, 7, teams[7], teams[10], 'scheduled', 'elimination'),
  (tid, 1, 8, teams[8], teams[9], 'scheduled', 'elimination');

  INSERT INTO matches (tournament_id, round, match_number, status, stage) VALUES
  (tid, 2, 9, 'scheduled', 'elimination'),
  (tid, 2, 10, 'scheduled', 'elimination'),
  (tid, 2, 11, 'scheduled', 'elimination'),
  (tid, 2, 12, 'scheduled', 'elimination'),
  (tid, 3, 13, 'scheduled', 'elimination'),
  (tid, 3, 14, 'scheduled', 'elimination'),
  (tid, 4, 15, 'scheduled', 'elimination');
END $$;

-- =============================================
-- 5. Tarptautinis Rankinio Turnyras (group_playoff, 16 teams, registration)
-- =============================================
DO $$
DECLARE
  tid UUID;
  gid_a UUID; gid_b UUID; gid_c UUID; gid_d UUID;
  teams UUID[];
BEGIN
  SELECT id INTO tid FROM tournaments WHERE name = 'Tarptautinis Rankinio Turnyras';
  SELECT array_agg(id ORDER BY name) INTO teams FROM teams WHERE tournament_id = tid;

  INSERT INTO tournament_groups (tournament_id, name, team_ids)
  VALUES (tid, 'A grupė', to_jsonb(ARRAY[teams[1], teams[2], teams[3], teams[4]]))
  RETURNING id INTO gid_a;
  INSERT INTO tournament_groups (tournament_id, name, team_ids)
  VALUES (tid, 'B grupė', to_jsonb(ARRAY[teams[5], teams[6], teams[7], teams[8]]))
  RETURNING id INTO gid_b;
  INSERT INTO tournament_groups (tournament_id, name, team_ids)
  VALUES (tid, 'C grupė', to_jsonb(ARRAY[teams[9], teams[10], teams[11], teams[12]]))
  RETURNING id INTO gid_c;
  INSERT INTO tournament_groups (tournament_id, name, team_ids)
  VALUES (tid, 'D grupė', to_jsonb(ARRAY[teams[13], teams[14], teams[15], teams[16]]))
  RETURNING id INTO gid_d;

  INSERT INTO matches (tournament_id, group_id, round, match_number, home_team_id, away_team_id, status, stage) VALUES
  (tid, gid_a, 1, 1, teams[1], teams[2], 'scheduled', 'group'),
  (tid, gid_a, 1, 2, teams[3], teams[4], 'scheduled', 'group'),
  (tid, gid_a, 2, 3, teams[1], teams[3], 'scheduled', 'group'),
  (tid, gid_a, 2, 4, teams[2], teams[4], 'scheduled', 'group'),
  (tid, gid_a, 3, 5, teams[1], teams[4], 'scheduled', 'group'),
  (tid, gid_a, 3, 6, teams[2], teams[3], 'scheduled', 'group'),
  (tid, gid_b, 1, 7, teams[5], teams[6], 'scheduled', 'group'),
  (tid, gid_b, 1, 8, teams[7], teams[8], 'scheduled', 'group'),
  (tid, gid_b, 2, 9, teams[5], teams[7], 'scheduled', 'group'),
  (tid, gid_b, 2, 10, teams[6], teams[8], 'scheduled', 'group'),
  (tid, gid_b, 3, 11, teams[5], teams[8], 'scheduled', 'group'),
  (tid, gid_b, 3, 12, teams[6], teams[7], 'scheduled', 'group'),
  (tid, gid_c, 1, 13, teams[9], teams[10], 'scheduled', 'group'),
  (tid, gid_c, 1, 14, teams[11], teams[12], 'scheduled', 'group'),
  (tid, gid_c, 2, 15, teams[9], teams[11], 'scheduled', 'group'),
  (tid, gid_c, 2, 16, teams[10], teams[12], 'scheduled', 'group'),
  (tid, gid_c, 3, 17, teams[9], teams[12], 'scheduled', 'group'),
  (tid, gid_c, 3, 18, teams[10], teams[11], 'scheduled', 'group'),
  (tid, gid_d, 1, 19, teams[13], teams[14], 'scheduled', 'group'),
  (tid, gid_d, 1, 20, teams[15], teams[16], 'scheduled', 'group'),
  (tid, gid_d, 2, 21, teams[13], teams[15], 'scheduled', 'group'),
  (tid, gid_d, 2, 22, teams[14], teams[16], 'scheduled', 'group'),
  (tid, gid_d, 3, 23, teams[13], teams[16], 'scheduled', 'group'),
  (tid, gid_d, 3, 24, teams[14], teams[15], 'scheduled', 'group');
END $$;

-- =============================================
-- 6. Vasaros Badmintono Čempionatas (round_robin, 12 teams, registration)
-- =============================================
DO $$
DECLARE
  tid UUID;
  teams UUID[];
  i INT; j INT; mn INT := 1;
BEGIN
  SELECT id INTO tid FROM tournaments WHERE name = 'Vasaros Badmintono Čempionatas';
  SELECT array_agg(id ORDER BY name) INTO teams FROM teams WHERE tournament_id = tid;

  FOR i IN 1..12 LOOP
    FOR j IN (i+1)..12 LOOP
      INSERT INTO matches (tournament_id, round, match_number, home_team_id, away_team_id, status, stage)
      VALUES (tid, ceil(mn::float / 6)::INT, mn, teams[i], teams[j], 'scheduled', 'round_robin');
      mn := mn + 1;
    END LOOP;
  END LOOP;
END $$;

-- =============================================
-- 7. Žiemos Ledo Ritulio Taurė (single_elimination, 8 teams, completed)
-- =============================================
DO $$
DECLARE
  tid UUID;
  teams UUID[];
BEGIN
  SELECT id INTO tid FROM tournaments WHERE name = 'Žiemos Ledo Ritulio Taurė';
  SELECT array_agg(id ORDER BY name) INTO teams FROM teams WHERE tournament_id = tid;

  INSERT INTO matches (tournament_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage) VALUES
  (tid, 1, 1, teams[1], teams[8], 5, 2, 'completed', 'elimination'),
  (tid, 1, 2, teams[2], teams[7], 3, 4, 'completed', 'elimination'),
  (tid, 1, 3, teams[3], teams[6], 6, 3, 'completed', 'elimination'),
  (tid, 1, 4, teams[4], teams[5], 2, 5, 'completed', 'elimination'),
  (tid, 2, 5, teams[1], teams[7], 4, 2, 'completed', 'elimination'),
  (tid, 2, 6, teams[3], teams[5], 3, 5, 'completed', 'elimination'),
  (tid, 3, 7, teams[1], teams[5], 6, 4, 'completed', 'elimination');
END $$;

-- =============================================
-- 8. Kalėdinis Stalo Teniso Turnyras (round_robin, 16 teams, completed)
-- =============================================
DO $$
DECLARE
  tid UUID;
  teams UUID[];
  i INT; j INT; mn INT := 1;
  hs INT; as_ INT;
BEGIN
  SELECT id INTO tid FROM tournaments WHERE name = 'Kalėdinis Stalo Teniso Turnyras';
  SELECT array_agg(id ORDER BY name) INTO teams FROM teams WHERE tournament_id = tid;

  FOR i IN 1..16 LOOP
    FOR j IN (i+1)..16 LOOP
      hs := floor(random() * 4)::INT;
      as_ := floor(random() * 4)::INT;
      IF hs = as_ THEN hs := hs + 1; END IF;
      INSERT INTO matches (tournament_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage)
      VALUES (tid, ceil(mn::float / 8)::INT, mn, teams[i], teams[j], hs, as_, 'completed', 'round_robin');
      mn := mn + 1;
    END LOOP;
  END LOOP;
END $$;

-- =============================================
-- 9. Rudens Floorball Lyga (group_playoff, 12 teams, completed)
-- =============================================
DO $$
DECLARE
  tid UUID;
  gid_a UUID; gid_b UUID; gid_c UUID;
  teams UUID[];
BEGIN
  SELECT id INTO tid FROM tournaments WHERE name = 'Rudens Floorball Lyga';
  SELECT array_agg(id ORDER BY name) INTO teams FROM teams WHERE tournament_id = tid;

  INSERT INTO tournament_groups (tournament_id, name, team_ids)
  VALUES (tid, 'A grupė', to_jsonb(ARRAY[teams[1], teams[2], teams[3], teams[4]]))
  RETURNING id INTO gid_a;
  INSERT INTO tournament_groups (tournament_id, name, team_ids)
  VALUES (tid, 'B grupė', to_jsonb(ARRAY[teams[5], teams[6], teams[7], teams[8]]))
  RETURNING id INTO gid_b;
  INSERT INTO tournament_groups (tournament_id, name, team_ids)
  VALUES (tid, 'C grupė', to_jsonb(ARRAY[teams[9], teams[10], teams[11], teams[12]]))
  RETURNING id INTO gid_c;

  INSERT INTO matches (tournament_id, group_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage) VALUES
  (tid, gid_a, 1, 1, teams[1], teams[2], 7, 3, 'completed', 'group'),
  (tid, gid_a, 1, 2, teams[3], teams[4], 5, 6, 'completed', 'group'),
  (tid, gid_a, 2, 3, teams[1], teams[3], 8, 4, 'completed', 'group'),
  (tid, gid_a, 2, 4, teams[2], teams[4], 4, 5, 'completed', 'group'),
  (tid, gid_a, 3, 5, teams[1], teams[4], 6, 3, 'completed', 'group'),
  (tid, gid_a, 3, 6, teams[2], teams[3], 3, 7, 'completed', 'group'),
  (tid, gid_b, 1, 7, teams[5], teams[6], 5, 4, 'completed', 'group'),
  (tid, gid_b, 1, 8, teams[7], teams[8], 3, 6, 'completed', 'group'),
  (tid, gid_b, 2, 9, teams[5], teams[7], 7, 2, 'completed', 'group'),
  (tid, gid_b, 2, 10, teams[6], teams[8], 4, 4, 'completed', 'group'),
  (tid, gid_b, 3, 11, teams[5], teams[8], 8, 5, 'completed', 'group'),
  (tid, gid_b, 3, 12, teams[6], teams[7], 6, 3, 'completed', 'group'),
  (tid, gid_c, 1, 13, teams[9], teams[10], 4, 5, 'completed', 'group'),
  (tid, gid_c, 1, 14, teams[11], teams[12], 6, 3, 'completed', 'group'),
  (tid, gid_c, 2, 15, teams[9], teams[11], 7, 7, 'completed', 'group'),
  (tid, gid_c, 2, 16, teams[10], teams[12], 5, 2, 'completed', 'group'),
  (tid, gid_c, 3, 17, teams[9], teams[12], 8, 4, 'completed', 'group'),
  (tid, gid_c, 3, 18, teams[10], teams[11], 3, 6, 'completed', 'group');

  INSERT INTO matches (tournament_id, round, match_number, home_team_id, away_team_id, home_score, away_score, status, stage) VALUES
  (tid, 4, 19, teams[1], teams[6], 9, 5, 'completed', 'playoff'),
  (tid, 4, 20, teams[5], teams[10], 7, 4, 'completed', 'playoff'),
  (tid, 5, 21, teams[1], teams[5], 8, 6, 'completed', 'playoff');
END $$;
