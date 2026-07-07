import type { Role, Team } from "@soccer-stats/shared";

export const hasTeamRole = (userId: string, team: Team | null, roles: Role[]): team is Team =>
  Boolean(team?.members.some((member) => member.userId === userId && roles.includes(member.role)));

export const canReadVisibleResource = (userId: string, resource: { visibility: "private" | "public"; ownerId?: string }): boolean =>
  resource.visibility === "public" || resource.ownerId === userId;
