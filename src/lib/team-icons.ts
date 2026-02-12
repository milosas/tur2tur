import type { TeamNameMap } from "@/lib/types";

export type TeamIcon = {
  color: string;
  path: string;
  viewBox?: string;
};

// 16 distinct shapes, each with a unique color
export const TEAM_ICONS: TeamIcon[] = [
  // 1. Shield — red
  {
    color: "#ef4444",
    path: "M10 1L2 5v5c0 4.5 3.4 8.3 8 9.5 4.6-1.2 8-5 8-9.5V5l-8-4z",
  },
  // 2. Star — blue
  {
    color: "#3b82f6",
    path: "M10 1l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L10 15.4l-5.6 2.8 1.1-6.2L1 7.6l6.2-.9L10 1z",
  },
  // 3. Lightning — green
  {
    color: "#22c55e",
    path: "M11 1L4 11h5l-1 8 7-10h-5l1-8z",
  },
  // 4. Diamond — orange
  {
    color: "#f97316",
    path: "M10 1L1 10l9 9 9-9-9-9z",
  },
  // 5. Crown — purple
  {
    color: "#a855f7",
    path: "M2 16h16l-2-10-4 4-2-8-2 8-4-4-2 10z",
  },
  // 6. Flame — cyan
  {
    color: "#06b6d4",
    path: "M10 1C7 5 4 7 4 11a6 6 0 0012 0c0-2-1-3-2-4-1 2-2 3-3 3 1-3 0-6-1-9z",
  },
  // 7. Heart — pink
  {
    color: "#ec4899",
    path: "M10 18l-1.4-1.3C3.4 12 0 9 0 5.5 0 2.4 2.4 0 5.5 0 7.2 0 8.8.8 10 2 11.2.8 12.8 0 14.5 0 17.6 0 20 2.4 20 5.5c0 3.5-3.4 6.5-8.6 11.2L10 18z",
  },
  // 8. Hexagon — amber
  {
    color: "#f59e0b",
    path: "M10 1l7.8 4.5v9L10 19l-7.8-4.5v-9L10 1z",
  },
  // 9. Arrow up — emerald
  {
    color: "#10b981",
    path: "M10 2l8 12H2l8-12z",
  },
  // 10. Cross/plus — indigo
  {
    color: "#6366f1",
    path: "M7 1h6v6h6v6h-6v6H7v-6H1V7h6V1z",
  },
  // 11. Circle target — rose
  {
    color: "#f43f5e",
    path: "M10 2a8 8 0 100 16 8 8 0 000-16zm0 3a5 5 0 110 10A5 5 0 0110 5zm0 3a2 2 0 100 4 2 2 0 000-4z",
  },
  // 12. Crescent — teal
  {
    color: "#14b8a6",
    path: "M10 1a9 9 0 100 18 9 9 0 000-18zm0 2a7 7 0 004 12.7A9 9 0 0110 3z",
  },
  // 13. Pentagon — violet
  {
    color: "#8b5cf6",
    path: "M10 1l8.1 5.9-3.1 9.2H5L1.9 6.9 10 1z",
  },
  // 14. Chevron — lime
  {
    color: "#84cc16",
    path: "M2 4l8 6 8-6v4l-8 6-8-6V4zm0 6l8 6 8-6",
  },
  // 15. Sword — fuchsia
  {
    color: "#d946ef",
    path: "M14 1l-4 4-2-1-3 3 2 2-5 5 2 2 5-5 2 2 3-3-1-2 4-4-2-2z",
  },
  // 16. Wave — sky
  {
    color: "#0ea5e9",
    path: "M1 12c2-3 4-5 6-3s4 0 6-3 4-5 6-3v6c-2-2-4 0-6 3s-4 5-6 3-4 0-6 3v-6z",
  },
];

export function getTeamIcon(teamId: string, teamNames: TeamNameMap): TeamIcon {
  const sortedKeys = Object.keys(teamNames).sort();
  const index = sortedKeys.indexOf(teamId);
  if (index === -1) return TEAM_ICONS[0];
  return TEAM_ICONS[index % TEAM_ICONS.length];
}
