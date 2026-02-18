-- =============================================
-- Seed teams for all 9 fake tournaments
-- Run AFTER seed_fake_tournaments.sql
-- =============================================

-- Kauno Krepšinio Lyga 2026 (group_playoff, 16 teams)
INSERT INTO teams (tournament_id, name)
SELECT t.id, team_name
FROM tournaments t
CROSS JOIN (VALUES
  ('Kauno Žalgiris B'), ('Vilniaus Rytas B'), ('Klaipėdos Neptūnas'), ('Šiaulių Šiauliai'),
  ('Panevėžio Lietkabelis'), ('Utenos Juventus'), ('Alytaus Dzūkija'), ('Marijampolės Sūduva'),
  ('Prienų CBet'), ('Jonavos Jonava'), ('Kėdainių Nevėžis'), ('Telšių Telšiai'),
  ('Mažeikių Mažeikiai'), ('Tauragės Tauragė'), ('Biržų Biržai'), ('Raseinių Raseiniai')
) AS teams(team_name)
WHERE t.name = 'Kauno Krepšinio Lyga 2026';

-- Vilnius Futsal Cup (round_robin, 12 teams)
INSERT INTO teams (tournament_id, name)
SELECT t.id, team_name
FROM tournaments t
CROSS JOIN (VALUES
  ('FK Vytis'), ('FK Žalgiris Futsal'), ('Rīgas Futsal Club'), ('Tallinn United FC'),
  ('Kaunas Inkaras'), ('Vilnius City FC'), ('Daugavpils FC'), ('Tartu Futsal'),
  ('Klaipėda FC'), ('Jūrmala Futsal'), ('Pärnu FC'), ('Šiauliai United')
) AS teams(team_name)
WHERE t.name = 'Vilnius Futsal Cup';

-- Baltic Volleyball Open (group_reclass, 8 teams)
INSERT INTO teams (tournament_id, name)
SELECT t.id, team_name
FROM tournaments t
CROSS JOIN (VALUES
  ('Klaipėdos Amber'), ('Vilnius Volley'), ('Rīgas VK'), ('Tallinn Selver'),
  ('Kauno SM'), ('Jūrmalas Volejbols'), ('Tartu Bigbank'), ('Šiaulių Elga')
) AS teams(team_name)
WHERE t.name = 'Baltic Volleyball Open';

-- Pavasario Futbolo Taurė (single_elimination, 32 teams — add 16)
INSERT INTO teams (tournament_id, name)
SELECT t.id, team_name
FROM tournaments t
CROSS JOIN (VALUES
  ('Šiaulių FA'), ('Vilniaus FM'), ('Kauno FA'), ('Klaipėdos FA'),
  ('Panevėžio SM'), ('Alytaus SM'), ('Marijampolės SM'), ('Telšių FA'),
  ('Tauragės FA'), ('Utenos FA'), ('Biržų FA'), ('Mažeikių FA'),
  ('Jonavos FA'), ('Kėdainių FA'), ('Raseinių FA'), ('Rokiškio FA')
) AS teams(team_name)
WHERE t.name = 'Pavasario Futbolo Taurė';

-- Tarptautinis Rankinio Turnyras (group_playoff, 16 teams)
INSERT INTO teams (tournament_id, name)
SELECT t.id, team_name
FROM tournaments t
CROSS JOIN (VALUES
  ('HC Vilnius'), ('HC Kaunas'), ('HC Šiauliai'), ('HC Klaipėda'),
  ('Rīgas HC'), ('Daugavpils HC'), ('Liepājas HC'), ('Jēkabpils HC'),
  ('Tallinn HC'), ('Tartu HC'), ('Põlva Serviti'), ('Viljandi HC'),
  ('Gdańsk HC'), ('Minsk HC'), ('Helsinki HC'), ('Stockholm HC')
) AS teams(team_name)
WHERE t.name = 'Tarptautinis Rankinio Turnyras';

-- Vasaros Badmintono Čempionatas (round_robin, 24 — add 12)
INSERT INTO teams (tournament_id, name)
SELECT t.id, team_name
FROM tournaments t
CROSS JOIN (VALUES
  ('A. Jonaitis'), ('K. Petrauskas'), ('L. Kazlauskaitė'), ('M. Stankevičius'),
  ('R. Jankauskas'), ('G. Rimkus'), ('V. Balčiūnas'), ('D. Paulauskas'),
  ('T. Gudaitis'), ('S. Mockus'), ('E. Navickas'), ('I. Zakaraitė')
) AS teams(team_name)
WHERE t.name = 'Vasaros Badmintono Čempionatas';

-- Žiemos Ledo Ritulio Taurė (single_elimination, 8 teams)
INSERT INTO teams (tournament_id, name)
SELECT t.id, team_name
FROM tournaments t
CROSS JOIN (VALUES
  ('Kaunas Ice Wolves'), ('Vilnius Hockey'), ('Elektrėnų Energija'), ('Klaipėdos Baltai'),
  ('SC Kaunas'), ('Hockey Punks'), ('Baltica Riga'), ('Tallinn Stars')
) AS teams(team_name)
WHERE t.name = 'Žiemos Ledo Ritulio Taurė';

-- Kalėdinis Stalo Teniso Turnyras (round_robin, 16 teams)
INSERT INTO teams (tournament_id, name)
SELECT t.id, team_name
FROM tournaments t
CROSS JOIN (VALUES
  ('TT Vilnius A'), ('TT Vilnius B'), ('TT Kaunas'), ('TT Klaipėda'),
  ('TT Šiauliai'), ('TT Panevėžys'), ('TT Alytus'), ('TT Marijampolė'),
  ('TT Utena'), ('TT Telšiai'), ('TT Tauragė'), ('TT Mažeikiai'),
  ('TT Biržai'), ('TT Jonava'), ('TT Kėdainiai'), ('TT Druskininkai')
) AS teams(team_name)
WHERE t.name = 'Kalėdinis Stalo Teniso Turnyras';

-- Rudens Floorball Lyga (group_playoff, 12 teams)
INSERT INTO teams (tournament_id, name)
SELECT t.id, team_name
FROM tournaments t
CROSS JOIN (VALUES
  ('Vilnius Vipers'), ('Kaunas Cobras'), ('Klaipėda Storm'), ('Šiauliai Wolves'),
  ('Panevėžys Hawks'), ('Alytus Bears'), ('Vilnius Eagles'), ('Kaunas Thunder'),
  ('Klaipėda Sharks'), ('Šiauliai Lions'), ('Utena Foxes'), ('Telšiai Bulls')
) AS teams(team_name)
WHERE t.name = 'Rudens Floorball Lyga';
