import type { Role, Team, Tournament } from "@soccer-stats/shared";
import type { Repositories } from "../../types.js";

export const hasTeamRole = (userId: string, team: Team | null, roles: Role[]): team is Team =>
  Boolean(team?.members.some((member) => member.userId === userId && roles.includes(member.role)));

export const canReadVisibleResource = (userId: string, resource: { visibility: "private" | "public"; ownerId?: string }): boolean =>
  resource.visibility === "public" || resource.ownerId === userId;

export const requireTeamRole = async (repositories: Repositories, userId: string, teamId: string, roles: Role[]): Promise<Team | null> => {
  const team = await repositories.teams.findById(teamId);
  return hasTeamRole(userId, team, roles) ? team : null;
};

export const canReadResource = (
  userId: string,
  resource: { visibility: "private" | "public"; ownerId?: string; members?: Array<{ userId: string }> }
): boolean => canReadVisibleResource(userId, resource) || Boolean(resource.members?.some((member) => member.userId === userId));

export const requireTournamentRole = async (
  repositories: Repositories,
  userId: string,
  tournament: Tournament | null,
  roles: Role[] = ["owner", "admin"]
): Promise<Tournament | null> => {
  if (!tournament) {
    return null;
  }

  if (tournament.ownerId === userId) {
    return tournament;
  }

  const teams = await repositories.teams.listByIds(tournament.teamIds);
  return teams.some((team) => team.members.some((member) => member.userId === userId && roles.includes(member.role)))
    ? tournament
    : null;
};
