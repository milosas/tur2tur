import { Team, Tournament, Match } from "./types";

export const teams: Record<string, Team> = {
  "t1":  { id: "t1",  name: "Vilnius FC",       shortName: "VIL" },
  "t2":  { id: "t2",  name: "Kaunas United",    shortName: "KAU" },
  "t3":  { id: "t3",  name: "Klaipėda City",    shortName: "KLP" },
  "t4":  { id: "t4",  name: "Šiauliai Stars",   shortName: "ŠIA" },
  "t5":  { id: "t5",  name: "Riga Dynamo",      shortName: "RIG" },
  "t6":  { id: "t6",  name: "Liepāja FK",       shortName: "LIE" },
  "t7":  { id: "t7",  name: "Daugavpils SC",    shortName: "DAU" },
  "t8":  { id: "t8",  name: "Jūrmala Beach",    shortName: "JUR" },
  "t9":  { id: "t9",  name: "Tallinn Rangers",  shortName: "TAL" },
  "t10": { id: "t10", name: "Tartu Athletic",   shortName: "TAR" },
  "t11": { id: "t11", name: "Pärnu Sailors",    shortName: "PÄR" },
  "t12": { id: "t12", name: "Narva Thunder",    shortName: "NAR" },
  "t13": { id: "t13", name: "Panevėžys Lions",  shortName: "PAN" },
  "t14": { id: "t14", name: "Ventspils Wave",   shortName: "VEN" },
  "t15": { id: "t15", name: "Valmiera Guard",   shortName: "VAL" },
  "t16": { id: "t16", name: "Rakvere Knights",  shortName: "RAK" },
};

function m(
  id: string,
  groupId: string | undefined,
  round: number,
  matchNumber: number,
  homeTeamId: string,
  awayTeamId: string,
  homeScore: number | null,
  awayScore: number | null,
  status: Match["status"],
  scheduledAt: string,
  stage: Match["stage"] = "group"
): Match {
  return {
    id, tournamentId: "tour-1", groupId, round, matchNumber,
    homeTeamId, awayTeamId, homeScore, awayScore, status, stage, scheduledAt,
  };
}

// Group A matches (round-robin: 6 matches for 4 teams)
const groupAMatches: Match[] = [
  m("ga1", "gA", 1, 1, "t1", "t2", 2, 1, "completed", "2026-03-15T14:00:00"),
  m("ga2", "gA", 1, 2, "t3", "t4", 0, 0, "completed", "2026-03-15T16:00:00"),
  m("ga3", "gA", 2, 3, "t1", "t3", 3, 0, "completed", "2026-03-18T14:00:00"),
  m("ga4", "gA", 2, 4, "t2", "t4", 1, 2, "completed", "2026-03-18T16:00:00"),
  m("ga5", "gA", 3, 5, "t1", "t4", 1, 1, "completed", "2026-03-21T14:00:00"),
  m("ga6", "gA", 3, 6, "t2", "t3", 2, 1, "completed", "2026-03-21T16:00:00"),
];

// Group B matches
const groupBMatches: Match[] = [
  m("gb1", "gB", 1, 1, "t5", "t6", 1, 0, "completed", "2026-03-15T18:00:00"),
  m("gb2", "gB", 1, 2, "t7", "t8", 2, 2, "completed", "2026-03-15T20:00:00"),
  m("gb3", "gB", 2, 3, "t5", "t7", 0, 1, "completed", "2026-03-18T18:00:00"),
  m("gb4", "gB", 2, 4, "t6", "t8", 3, 1, "completed", "2026-03-18T20:00:00"),
  m("gb5", "gB", 3, 5, "t5", "t8", 2, 0, "completed", "2026-03-21T18:00:00"),
  m("gb6", "gB", 3, 6, "t6", "t7", 1, 1, "completed", "2026-03-21T20:00:00"),
];

// Group C matches
const groupCMatches: Match[] = [
  m("gc1", "gC", 1, 1, "t9",  "t10", 2, 0, "completed",  "2026-03-16T14:00:00"),
  m("gc2", "gC", 1, 2, "t11", "t12", 1, 3, "completed",  "2026-03-16T16:00:00"),
  m("gc3", "gC", 2, 3, "t9",  "t11", 1, 1, "completed",  "2026-03-19T14:00:00"),
  m("gc4", "gC", 2, 4, "t10", "t12", 2, 2, "completed",  "2026-03-19T16:00:00"),
  m("gc5", "gC", 3, 5, "t9",  "t12", null, null, "scheduled", "2026-03-22T14:00:00"),
  m("gc6", "gC", 3, 6, "t10", "t11", null, null, "scheduled", "2026-03-22T16:00:00"),
];

// Group D matches
const groupDMatches: Match[] = [
  m("gd1", "gD", 1, 1, "t13", "t14", 0, 2, "completed",  "2026-03-16T18:00:00"),
  m("gd2", "gD", 1, 2, "t15", "t16", 1, 0, "completed",  "2026-03-16T20:00:00"),
  m("gd3", "gD", 2, 3, "t13", "t15", 1, 1, "completed",  "2026-03-19T18:00:00"),
  m("gd4", "gD", 2, 4, "t14", "t16", 3, 0, "completed",  "2026-03-19T20:00:00"),
  m("gd5", "gD", 3, 5, "t13", "t16", null, null, "scheduled", "2026-03-22T18:00:00"),
  m("gd6", "gD", 3, 6, "t14", "t15", null, null, "scheduled", "2026-03-22T20:00:00"),
];

// Playoff matches
const playoffMatches: Match[] = [
  // Quarterfinals
  m("pq1", undefined, 1, 1, "t1",  "t6",  2, 1, "completed", "2026-03-25T15:00:00", "playoff"),
  m("pq2", undefined, 1, 2, "t5",  "t2",  1, 0, "completed", "2026-03-25T18:00:00", "playoff"),
  m("pq3", undefined, 1, 3, "t9",  "t14", null, null, "scheduled", "2026-03-26T15:00:00", "playoff"),
  m("pq4", undefined, 1, 4, "t12", "t15", null, null, "scheduled", "2026-03-26T18:00:00", "playoff"),
  // Semifinals (QF1 winner vs QF2 winner already known; QF3 vs QF4 TBD)
  m("ps1", undefined, 2, 1, "t1", "t5", null, null, "scheduled", "2026-03-29T15:00:00", "playoff"),
  m("ps2", undefined, 2, 2, "",   "",   null, null, "scheduled", "2026-03-29T18:00:00", "playoff"),
  // Final
  m("pf1", undefined, 3, 1, "",   "",   null, null, "scheduled", "2026-04-01T17:00:00", "playoff"),
];

export const tournaments: Tournament[] = [
  {
    id: "tour-1",
    name: "Baltic Cup 2026",
    description: "Annual Baltic region football tournament featuring top teams from Lithuania, Latvia, and Estonia.",
    format: "group_playoff",
    status: "group_stage",
    teamCount: 16,
    startDate: "2026-03-15",
    groups: [
      { id: "gA", name: "A", teamIds: ["t1", "t2", "t3", "t4"] },
      { id: "gB", name: "B", teamIds: ["t5", "t6", "t7", "t8"] },
      { id: "gC", name: "C", teamIds: ["t9", "t10", "t11", "t12"] },
      { id: "gD", name: "D", teamIds: ["t13", "t14", "t15", "t16"] },
    ],
    groupMatches: [...groupAMatches, ...groupBMatches, ...groupCMatches, ...groupDMatches],
    playoffRounds: [
      { name: "Quarterfinals", matches: playoffMatches.slice(0, 4) },
      { name: "Semifinals", matches: playoffMatches.slice(4, 6) },
      { name: "Final", matches: playoffMatches.slice(6, 7) },
    ],
  },
];

export function getTournamentById(id: string): Tournament | undefined {
  return tournaments.find((t) => t.id === id);
}

export function getTeamById(id: string): Team | undefined {
  return teams[id];
}
