-- =============================================
-- RLS policies for all core tables
-- =============================================

-- TOURNAMENTS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tournaments are viewable by everyone"
  ON tournaments FOR SELECT
  USING (visibility = 'public' OR organizer_id = auth.uid());

CREATE POLICY "Users can create their own tournaments"
  ON tournaments FOR INSERT
  TO authenticated
  WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Organizers can update their own tournaments"
  ON tournaments FOR UPDATE
  TO authenticated
  USING (organizer_id = auth.uid())
  WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Organizers can delete their own tournaments"
  ON tournaments FOR DELETE
  TO authenticated
  USING (organizer_id = auth.uid());

-- TEAMS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teams are viewable by everyone"
  ON teams FOR SELECT
  USING (true);

CREATE POLICY "Tournament organizers can manage teams"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = teams.tournament_id
        AND tournaments.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Tournament organizers can update teams"
  ON teams FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = teams.tournament_id
        AND tournaments.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Tournament organizers can delete teams"
  ON teams FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = teams.tournament_id
        AND tournaments.organizer_id = auth.uid()
    )
  );

-- TEAM_PLAYERS
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team players are viewable by everyone"
  ON team_players FOR SELECT
  USING (true);

CREATE POLICY "Tournament organizers can manage team players"
  ON team_players FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      JOIN tournaments ON tournaments.id = teams.tournament_id
      WHERE teams.id = team_players.team_id
        AND tournaments.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Tournament organizers can update team players"
  ON team_players FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams
      JOIN tournaments ON tournaments.id = teams.tournament_id
      WHERE teams.id = team_players.team_id
        AND tournaments.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Tournament organizers can delete team players"
  ON team_players FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams
      JOIN tournaments ON tournaments.id = teams.tournament_id
      WHERE teams.id = team_players.team_id
        AND tournaments.organizer_id = auth.uid()
    )
  );

-- TOURNAMENT_GROUPS
ALTER TABLE tournament_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Groups are viewable by everyone"
  ON tournament_groups FOR SELECT
  USING (true);

CREATE POLICY "Organizers can manage groups"
  ON tournament_groups FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_groups.tournament_id
        AND tournaments.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can update groups"
  ON tournament_groups FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_groups.tournament_id
        AND tournaments.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can delete groups"
  ON tournament_groups FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_groups.tournament_id
        AND tournaments.organizer_id = auth.uid()
    )
  );

-- MATCHES
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Matches are viewable by everyone"
  ON matches FOR SELECT
  USING (true);

CREATE POLICY "Organizers can manage matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = matches.tournament_id
        AND tournaments.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can update matches"
  ON matches FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = matches.tournament_id
        AND tournaments.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can delete matches"
  ON matches FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = matches.tournament_id
        AND tournaments.organizer_id = auth.uid()
    )
  );
