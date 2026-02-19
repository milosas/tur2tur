export type TournamentFormat = "group_playoff" | "round_robin" | "single_elimination" | "group_reclass";
export type TournamentStatus = "draft" | "registration" | "in_progress" | "group_stage" | "playoffs" | "completed";
export type MatchStatus = "scheduled" | "in_progress" | "completed";
export type MatchStage = "group" | "playoff" | "round_robin" | "elimination" | "reclass";

export type Team = {
  id: string;
  name: string;
  shortName: string;
};

export type Group = {
  id: string;
  name: string;
  teamIds: string[];
};

export type Match = {
  id: string;
  tournamentId: string;
  groupId?: string;
  round: number;
  matchNumber: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  stage: MatchStage;
  scheduledAt?: string;
  penaltyHome?: number | null;
  penaltyAway?: number | null;
  penaltyLabel?: string | null;
};

export type PlayoffRound = {
  name: string;
  matches: Match[];
};

export type Tournament = {
  id: string;
  name: string;
  description: string;
  format: TournamentFormat;
  status: TournamentStatus;
  teamCount: number;
  startDate: string;
  groups: Group[];
  groupMatches: Match[];
  playoffRounds: PlayoffRound[];
};

export type Standing = {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
};

export type TeamNameMap = Record<string, string>;

// DB types (matching Supabase schema)
export type TournamentVisibility = "public" | "private";

export type DBTournament = {
  id: string;
  organizer_id: string;
  name: string;
  description: string | null;
  format: string;
  status: string;
  max_teams: number;
  start_date: string | null;
  end_date: string | null;
  venue: string | null;
  accent_colors: string[];
  visibility: TournamentVisibility;
  logo_url: string | null;
  created_at: string;
};

export type DBTeam = {
  id: string;
  tournament_id: string;
  name: string;
  logo_url: string | null;
  created_at: string;
  team_players: { id: string; name: string; number: number | null }[];
};

export type DBGroup = {
  id: string;
  tournament_id: string;
  name: string;
  team_ids: string[];
};

export type DBMatch = {
  id: string;
  tournament_id: string;
  group_id: string | null;
  round: number;
  match_number: number;
  home_team_id: string | null;
  away_team_id: string | null;
  home_score: number | null;
  away_score: number | null;
  status: string;
  stage: string;
  scheduled_at: string | null;
  completed_at: string | null;
  penalty_home: number | null;
  penalty_away: number | null;
  penalty_label: string | null;
};

export type SubscriptionTier = 'free' | 'single' | 'unlimited';

export type DBProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  locale: string;
  subscription_tier: SubscriptionTier;
  stripe_customer_id: string | null;
  tournament_credits: number;
  tournaments_created: number;
  subscription_end_date: string | null;
  created_at: string;
};

// Mapper functions
export function dbMatchToMatch(m: DBMatch): Match {
  return {
    id: m.id,
    tournamentId: m.tournament_id,
    groupId: m.group_id ?? undefined,
    round: m.round,
    matchNumber: m.match_number,
    homeTeamId: m.home_team_id ?? "",
    awayTeamId: m.away_team_id ?? "",
    homeScore: m.home_score,
    awayScore: m.away_score,
    status: m.status as MatchStatus,
    stage: m.stage as MatchStage,
    scheduledAt: m.scheduled_at ?? undefined,
    penaltyHome: m.penalty_home ?? null,
    penaltyAway: m.penalty_away ?? null,
    penaltyLabel: m.penalty_label ?? null,
  };
}

export function dbGroupToGroup(g: DBGroup): Group {
  return {
    id: g.id,
    name: g.name,
    teamIds: g.team_ids,
  };
}
