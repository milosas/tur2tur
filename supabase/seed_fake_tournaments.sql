-- =============================================
-- Seed 9 fake tournaments (3 ongoing, 3 upcoming, 3 past)
-- Run this in Supabase SQL Editor
-- Replace YOUR_USER_ID with your actual user ID from auth.users
-- To find it: SELECT id FROM auth.users LIMIT 5;
-- =============================================

-- First, find your user ID:
-- SELECT id, email FROM auth.users;

-- Then replace 'YOUR_USER_ID' below with the actual UUID

DO $$
DECLARE
  uid UUID;
BEGIN
  -- Get first user ID (change if needed)
  SELECT id INTO uid FROM auth.users LIMIT 1;

  -- =============================================
  -- 3 ONGOING tournaments (start_date <= today, end_date >= today)
  -- =============================================
  INSERT INTO tournaments (name, description, format, status, max_teams, start_date, end_date, venue, visibility, organizer_id, logo_url)
  VALUES
  (
    'Kauno Krepšinio Lyga 2026',
    'Kasmetinis Kauno miesto krepšinio turnyras. 16 geriausių komandų varžosi dėl čempiono titulo.',
    'group_playoff',
    'in_progress',
    16,
    '2026-02-01',
    '2026-03-15',
    'Kauno sporto halė',
    'public',
    uid,
    'https://img.icons8.com/color/200/basketball.png'
  ),
  (
    'Vilnius Futsal Cup',
    'Tarptautinis futsal turnyras Vilniuje. Komandos iš Lietuvos, Latvijos ir Estijos.',
    'round_robin',
    'in_progress',
    12,
    '2026-02-10',
    '2026-03-01',
    'Vilniaus futsal arena',
    'public',
    uid,
    'https://img.icons8.com/color/200/soccer-ball.png'
  ),
  (
    'Baltic Volleyball Open',
    'Regioninis tinklinio čempionatas — atviras visiems Baltijos šalių klubams.',
    'group_reclass',
    'in_progress',
    8,
    '2026-02-05',
    '2026-02-28',
    'Klaipėdos sporto centras',
    'public',
    uid,
    'https://img.icons8.com/color/200/volleyball.png'
  );

  -- =============================================
  -- 3 UPCOMING tournaments (start_date > today)
  -- =============================================
  INSERT INTO tournaments (name, description, format, status, max_teams, start_date, end_date, venue, visibility, organizer_id, logo_url)
  VALUES
  (
    'Pavasario Futbolo Taurė',
    'Tradicinis pavasario futbolo turnyras mokyklų komandoms. Registracija atidaryta!',
    'single_elimination',
    'registration',
    32,
    '2026-04-01',
    '2026-04-20',
    'Šiaulių miesto stadionas',
    'public',
    uid,
    'https://img.icons8.com/color/200/football2--v1.png'
  ),
  (
    'Tarptautinis Rankinio Turnyras',
    'U-18 rankinio turnyras su komandomis iš 5 šalių. Grupės + atkrintamosios.',
    'group_playoff',
    'registration',
    16,
    '2026-05-10',
    '2026-05-17',
    'Panevėžio arena',
    'public',
    uid,
    'https://img.icons8.com/color/200/handball.png'
  ),
  (
    'Vasaros Badmintono Čempionatas',
    'Atviras badmintono turnyras — vienetai ir dvejetai. Visų amžiaus grupių dalyviai.',
    'round_robin',
    'registration',
    24,
    '2026-06-01',
    '2026-06-08',
    'Druskininkų sporto centras',
    'public',
    uid,
    'https://img.icons8.com/color/200/badminton-shuttlecock.png'
  );

  -- =============================================
  -- 3 PAST tournaments (end_date < today)
  -- =============================================
  INSERT INTO tournaments (name, description, format, status, max_teams, start_date, end_date, venue, visibility, organizer_id, logo_url)
  VALUES
  (
    'Žiemos Ledo Ritulio Taurė',
    'Metinis ledo ritulio turnyras. Nugalėtojas — Kaunas Ice Wolves!',
    'single_elimination',
    'completed',
    8,
    '2026-01-10',
    '2026-01-25',
    'Elektrėnų ledo arena',
    'public',
    uid,
    'https://img.icons8.com/color/200/ice-hockey.png'
  ),
  (
    'Kalėdinis Stalo Teniso Turnyras',
    'Šventinis stalo teniso turnyras — gerai nuotaikai ir sportui. Daugiau nei 40 dalyvių.',
    'round_robin',
    'completed',
    16,
    '2025-12-20',
    '2025-12-23',
    'Alytaus sporto mokykla',
    'public',
    uid,
    'https://img.icons8.com/color/200/ping-pong.png'
  ),
  (
    'Rudens Floorball Lyga',
    'Grindų riedulio sezonas baigtas. Čempionai — Vilnius Vipers.',
    'group_playoff',
    'completed',
    12,
    '2025-10-01',
    '2025-12-15',
    'Vilniaus universiteto sporto salė',
    'public',
    uid,
    'https://img.icons8.com/color/200/field-hockey.png'
  );

END $$;
