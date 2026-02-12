import type { MatchStage } from "./types";

type GroupInsert = {
  tournament_id: string;
  name: string;
  team_ids: string[];
};

type MatchInsert = {
  tournament_id: string;
  group_id?: string;
  round: number;
  match_number: number;
  home_team_id: string | null;
  away_team_id: string | null;
  status: string;
  stage: MatchStage;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Generate round-robin pairings using the circle method */
function generateRoundRobinPairings(teamIds: string[]): [string, string][][] {
  const ids = [...teamIds];
  // If odd number of teams, add a "bye" placeholder
  if (ids.length % 2 !== 0) ids.push("");
  const n = ids.length;
  const rounds: [string, string][][] = [];

  for (let r = 0; r < n - 1; r++) {
    const roundPairings: [string, string][] = [];
    for (let i = 0; i < n / 2; i++) {
      const home = ids[i];
      const away = ids[n - 1 - i];
      // Skip "bye" matches
      if (home && away) {
        roundPairings.push([home, away]);
      }
    }
    rounds.push(roundPairings);
    // Rotate: keep first element fixed, rotate rest
    const last = ids.pop()!;
    ids.splice(1, 0, last);
  }
  return rounds;
}

/** Split teams into groups of ~4 */
function splitIntoGroups(teamIds: string[]): string[][] {
  const shuffled = shuffle(teamIds);
  const n = shuffled.length;
  // Determine group count: aim for groups of 4, min 3
  const groupCount = Math.max(1, Math.round(n / 4));
  const groups: string[][] = Array.from({ length: groupCount }, () => []);
  shuffled.forEach((id, i) => {
    groups[i % groupCount].push(id);
  });
  return groups;
}

/** Determine number of playoff teams (next power of 2, min 2) */
function playoffSlots(groupCount: number): number {
  const qualifyPerGroup = 2;
  const total = groupCount * qualifyPerGroup;
  let slots = 2;
  while (slots < total) slots *= 2;
  return slots;
}

export type BracketResult = {
  groups: GroupInsert[];
  matches: MatchInsert[];
  /** Placeholder group IDs map: index -> will be replaced after insert */
  groupPlaceholders: string[];
};

/**
 * Group + Playoff format
 * Creates groups with round-robin, then empty playoff bracket
 */
export function generateGroupPlayoff(
  teamIds: string[],
  tournamentId: string
): BracketResult {
  const groupTeams = splitIntoGroups(teamIds);
  const groupNames = groupTeams.map((_, i) => String.fromCharCode(65 + i)); // A, B, C, ...

  const groups: GroupInsert[] = groupTeams.map((ids, i) => ({
    tournament_id: tournamentId,
    name: groupNames[i],
    team_ids: ids,
  }));

  const matches: MatchInsert[] = [];
  let matchNum = 1;

  // Group stage matches (round-robin within each group)
  groupTeams.forEach((ids, gi) => {
    const pairings = generateRoundRobinPairings(ids);
    pairings.forEach((roundPairs, round) => {
      roundPairs.forEach(([home, away]) => {
        matches.push({
          tournament_id: tournamentId,
          group_id: `__GROUP_${gi}__`,
          round: round + 1,
          match_number: matchNum++,
          home_team_id: home,
          away_team_id: away,
          status: "scheduled",
          stage: "group",
        });
      });
    });
  });

  // Playoff matches (empty slots)
  const slots = playoffSlots(groupTeams.length);
  let playoffMatchNum = 1;
  let currentSlots = slots;
  let round = 1;
  while (currentSlots >= 2) {
    const matchesInRound = currentSlots / 2;
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        tournament_id: tournamentId,
        round,
        match_number: playoffMatchNum++,
        home_team_id: null,
        away_team_id: null,
        status: "scheduled",
        stage: "playoff",
      });
    }
    currentSlots /= 2;
    round++;
  }

  return {
    groups,
    matches,
    groupPlaceholders: groupTeams.map((_, i) => `__GROUP_${i}__`),
  };
}

/**
 * Round Robin format — all-play-all
 */
export function generateRoundRobin(
  teamIds: string[],
  tournamentId: string
): BracketResult {
  const pairings = generateRoundRobinPairings(teamIds);
  const matches: MatchInsert[] = [];
  let matchNum = 1;

  pairings.forEach((roundPairs, round) => {
    roundPairs.forEach(([home, away]) => {
      matches.push({
        tournament_id: tournamentId,
        round: round + 1,
        match_number: matchNum++,
        home_team_id: home,
        away_team_id: away,
        status: "scheduled",
        stage: "round_robin",
      });
    });
  });

  return { groups: [], matches, groupPlaceholders: [] };
}

/**
 * Single Elimination format — bracket tree with byes
 */
/**
 * Groups + Reclassification format
 * Stage 1: groups with round-robin
 * Stage 2: empty reclassification groups (Gold, Silver, Bronze, Consolation)
 * that get filled later based on group standings
 */
export function generateGroupReclass(
  teamIds: string[],
  tournamentId: string
): BracketResult {
  const groupTeams = splitIntoGroups(teamIds);
  const groupNames = groupTeams.map((_, i) => String.fromCharCode(65 + i));

  const groups: GroupInsert[] = groupTeams.map((ids, i) => ({
    tournament_id: tournamentId,
    name: groupNames[i],
    team_ids: ids,
  }));

  const matches: MatchInsert[] = [];
  let matchNum = 1;

  // Stage 1: Group stage matches (round-robin within each group)
  groupTeams.forEach((ids, gi) => {
    const pairings = generateRoundRobinPairings(ids);
    pairings.forEach((roundPairs, round) => {
      roundPairs.forEach(([home, away]) => {
        matches.push({
          tournament_id: tournamentId,
          group_id: `__GROUP_${gi}__`,
          round: round + 1,
          match_number: matchNum++,
          home_team_id: home,
          away_team_id: away,
          status: "scheduled",
          stage: "group",
        });
      });
    });
  });

  // Stage 2 reclassification matches will be generated later
  // when the user clicks "Fill Reclassification Groups"

  return {
    groups,
    matches,
    groupPlaceholders: groupTeams.map((_, i) => `__GROUP_${i}__`),
  };
}

/**
 * Single Elimination format — bracket tree with byes
 */
export function generateSingleElimination(
  teamIds: string[],
  tournamentId: string
): BracketResult {
  const shuffled = shuffle(teamIds);
  // Next power of 2
  let slots = 2;
  while (slots < shuffled.length) slots *= 2;

  const byes = slots - shuffled.length;
  const matches: MatchInsert[] = [];
  let matchNum = 1;

  // First round
  const firstRoundMatches = slots / 2;
  const seeded: (string | null)[] = [];

  // Place teams with byes getting null opponents
  for (let i = 0; i < slots; i++) {
    seeded.push(i < shuffled.length ? shuffled[i] : null);
  }

  // Round 1
  for (let i = 0; i < firstRoundMatches; i++) {
    const home = seeded[i * 2];
    const away = seeded[i * 2 + 1];
    if (home !== null && away !== null) {
      matches.push({
        tournament_id: tournamentId,
        round: 1,
        match_number: matchNum++,
        home_team_id: home,
        away_team_id: away,
        status: "scheduled",
        stage: "elimination",
      });
    } else if (home !== null || away !== null) {
      // Bye match — auto-advance: mark as completed with the real team as winner
      matches.push({
        tournament_id: tournamentId,
        round: 1,
        match_number: matchNum++,
        home_team_id: home,
        away_team_id: away,
        status: "scheduled",
        stage: "elimination",
      });
    }
  }

  // Subsequent rounds (empty slots)
  let currentSlots = firstRoundMatches;
  let round = 2;
  while (currentSlots >= 2) {
    const matchesInRound = currentSlots / 2;
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        tournament_id: tournamentId,
        round,
        match_number: matchNum++,
        home_team_id: null,
        away_team_id: null,
        status: "scheduled",
        stage: "elimination",
      });
    }
    currentSlots /= 2;
    round++;
  }

  return { groups: [], matches, groupPlaceholders: [] };
}
