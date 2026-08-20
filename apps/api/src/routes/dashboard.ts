import type { FastifyPluginAsync } from "fastify";
import { inviteSchema, matchSchema, notificationSchema, playerProfileSchema, teamSchema, tournamentSchema, venueSchema } from "@soccer-stats/shared";
import { dashboardRouteSchemas } from "../docs/openapi.js";
import { NotificationService } from "../modules/notifications/notification.service.js";

export const dashboardRoutes: FastifyPluginAsync = async (app) => {
  app.get("/dashboard", { schema: dashboardRouteSchemas.get }, async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);

    if (!user) {
      return;
    }

    const teams = await app.repositories.teams.listByMember(user.id);
    const matches = await app.repositories.matches.listByTeamIds(teams.map((team) => team.id));
    const tournaments = await app.repositories.tournaments.listByOwnerOrTeam(
      user.id,
      teams.map((team) => team.id)
    );
    const invites = await app.repositories.invites.findPendingForUser(user.id, user.email);
    const venues = await app.repositories.venues.listVisibleToUser(user.id, { pageSize: 10 });
    const notifications = await new NotificationService(app.repositories).listByUser(user.id);
    const profile = await app.repositories.playerProfiles.findByUserId(user.id);

    return {
      profile: profile ? playerProfileSchema.parse(profile) : null,
      teams: teams.map((team) => teamSchema.parse(team)),
      matches: matches.map((match) => matchSchema.parse(match)),
      tournaments: tournaments.map((item) => tournamentSchema.parse(item)),
      invites: invites.map((invite) => inviteSchema.parse(invite)),
      venues: venues.map((venue) => venueSchema.parse(venue)),
      notifications: notifications.map((notification) => notificationSchema.parse(notification))
    };
  });
};
