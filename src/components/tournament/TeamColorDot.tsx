import { getTeamIcon } from "@/lib/team-icons";
import type { TeamNameMap } from "@/lib/types";

interface TeamColorDotProps {
  teamId: string;
  teamNames: TeamNameMap;
}

export function TeamColorDot({ teamId, teamNames }: TeamColorDotProps) {
  const icon = getTeamIcon(teamId, teamNames);
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      className="shrink-0"
      aria-hidden="true"
    >
      <path d={icon.path} fill={icon.color} />
    </svg>
  );
}
