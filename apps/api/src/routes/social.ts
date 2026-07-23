import type { FastifyPluginAsync } from "fastify";
import { createTextContentInputSchema, listContentQuerySchema, matchCommentSchema, teamMessageSchema } from "@soccer-stats/shared";
import { createId } from "../lib/ids.js";

const isTeamModerator = (userId: string, team: { members: Array<{ userId: string; role: string }> }) =>
  team.members.some((member) => member.userId === userId && (member.role === "owner" || member.role === "admin"));

const canAccessMatchConversation = async (userId: string, match: { home: { teamId: string; playerIds: string[] }; away: { teamId: string; playerIds: string[] } }, app: Parameters<FastifyPluginAsync>[0]) => {
  if ([...match.home.playerIds, ...match.away.playerIds].includes(userId)) return true;
  const teams = await app.repositories.teams.listByIds([match.home.teamId, match.away.teamId]);
  return teams.some((team) => team.members.some((member) => member.userId === userId));
};

export const socialRoutes: FastifyPluginAsync = async (app) => {
  app.get("/teams/:teamId/messages", async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);
    if (!user) return;
    const { teamId } = request.params as { teamId: string };
    const query = listContentQuerySchema.parse(request.query);
    const team = await app.repositories.teams.findById(teamId);
    if (!team || !team.members.some((member) => member.userId === user.id)) { reply.code(403); return { message: "Apenas membros podem acessar o chat do time." }; }
    return { messages: (await app.repositories.teamMessages.listByTeam(teamId, query.page, query.pageSize)).map((message) => teamMessageSchema.parse(message)) };
  });

  app.post("/teams/:teamId/messages", async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);
    if (!user) return;
    const { teamId } = request.params as { teamId: string };
    const payload = createTextContentInputSchema.parse(request.body);
    const team = await app.repositories.teams.findById(teamId);
    if (!team || !team.members.some((member) => member.userId === user.id)) { reply.code(403); return { message: "Apenas membros podem conversar no time." }; }
    const message = await app.repositories.teamMessages.create({ id: createId(), teamId, authorId: user.id, text: payload.text, createdAt: new Date().toISOString() });
    return { message: teamMessageSchema.parse(message) };
  });

  app.delete("/teams/:teamId/messages/:messageId", async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);
    if (!user) return;
    const { teamId, messageId } = request.params as { teamId: string; messageId: string };
    const [team, message] = await Promise.all([app.repositories.teams.findById(teamId), app.repositories.teamMessages.findById(messageId)]);
    if (!team || !message || message.teamId !== teamId) { reply.code(404); return { message: "Mensagem nao encontrada." }; }
    if (message.authorId !== user.id && !isTeamModerator(user.id, team)) { reply.code(403); return { message: "Sem permissao para excluir esta mensagem." }; }
    await app.repositories.teamMessages.deleteById(messageId);
    return { ok: true };
  });

  app.get("/matches/:matchId/comments", async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);
    if (!user) return;
    const { matchId } = request.params as { matchId: string };
    const query = listContentQuerySchema.parse(request.query);
    const match = await app.repositories.matches.findById(matchId);
    if (!match || !await canAccessMatchConversation(user.id, match, app)) { reply.code(403); return { message: "Apenas participantes podem acessar os comentarios." }; }
    return { comments: (await app.repositories.matchComments.listByMatch(matchId, query.page, query.pageSize)).map((comment) => matchCommentSchema.parse(comment)) };
  });

  app.post("/matches/:matchId/comments", async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);
    if (!user) return;
    const { matchId } = request.params as { matchId: string };
    const payload = createTextContentInputSchema.parse(request.body);
    const match = await app.repositories.matches.findById(matchId);
    if (!match || !await canAccessMatchConversation(user.id, match, app)) { reply.code(403); return { message: "Apenas participantes podem comentar." }; }
    const comment = await app.repositories.matchComments.create({ id: createId(), matchId, authorId: user.id, text: payload.text, createdAt: new Date().toISOString() });
    return { comment: matchCommentSchema.parse(comment) };
  });

  app.delete("/matches/:matchId/comments/:commentId", async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);
    if (!user) return;
    const { matchId, commentId } = request.params as { matchId: string; commentId: string };
    const [match, comment] = await Promise.all([app.repositories.matches.findById(matchId), app.repositories.matchComments.findById(commentId)]);
    if (!match || !comment || comment.matchId !== matchId) { reply.code(404); return { message: "Comentario nao encontrado." }; }
    const teams = await app.repositories.teams.listByIds([match.home.teamId, match.away.teamId]);
    const moderator = teams.some((team) => isTeamModerator(user.id, team));
    if (comment.authorId !== user.id && !moderator) { reply.code(403); return { message: "Sem permissao para excluir este comentario." }; }
    await app.repositories.matchComments.deleteById(commentId);
    return { ok: true };
  });
};
