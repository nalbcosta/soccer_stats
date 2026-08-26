import type { FastifyPluginAsync } from "fastify";
import { createTextContentInputSchema, listContentQuerySchema, matchCommentSchema } from "@soccer-stats/shared";
import { createId } from "../lib/ids.js";

const isTeamModerator = (userId: string, team: { members: Array<{ userId: string; role: string }> }) =>
  team.members.some((member) => member.userId === userId && (member.role === "owner" || member.role === "admin"));

const canAccessMatchConversation = async (userId: string, match: { home: { teamId: string; playerIds: string[] }; away: { teamId: string; playerIds: string[] } }, app: Parameters<FastifyPluginAsync>[0]) => {
  if ([...match.home.playerIds, ...match.away.playerIds].includes(userId)) return true;
  const teams = await app.repositories.teams.listByIds([match.home.teamId, match.away.teamId]);
  return teams.some((team) => team.members.some((member) => member.userId === userId));
};

export const socialRoutes: FastifyPluginAsync = async (app) => {
  app.get("/matches/:matchId/comments", async (request, reply) => {
    const user = await app.auth.requireUser(request, reply);
    if (!user) return;
    const { matchId } = request.params as { matchId: string };
    const query = listContentQuerySchema.parse(request.query);
    const match = await app.repositories.matches.findById(matchId);
    if (!match || !await canAccessMatchConversation(user.id, match, app)) { reply.code(403); return { message: "Apenas participantes podem acessar os comentários." }; }
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
    if (!match || !comment || comment.matchId !== matchId) { reply.code(404); return { message: "Comentário não encontrado." }; }
    const teams = await app.repositories.teams.listByIds([match.home.teamId, match.away.teamId]);
    const moderator = teams.some((team) => isTeamModerator(user.id, team));
    if (comment.authorId !== user.id && !moderator) { reply.code(403); return { message: "Sem permissão para excluir este comentário." }; }
    await app.repositories.matchComments.deleteById(commentId);
    return { ok: true };
  });
};
