import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createMemoryRepositories } from "../src/repositories/memory.js";
import { loadConfig } from "../src/config.js";
import type { FastifyInstance } from "fastify";
import type { PlayerProfile } from "@soccer-stats/shared";

describe("api flows", () => {
  let app: FastifyInstance;

  const withCsrf = async (sessionCookie: string) => {
    const response = await app.inject({
      method: "GET",
      url: "/v1/auth/csrf",
      headers: { cookie: sessionCookie }
    });
    const csrfCookie = response.cookies.find((cookie) => cookie.name.includes("soccer_stats_csrf"));

    return {
      cookie: csrfCookie ? `${sessionCookie}; ${csrfCookie.name}=${csrfCookie.value}` : sessionCookie,
      token: response.json().csrfToken as string
    };
  };

  beforeEach(async () => {
    app = await createApp(
      { ...loadConfig(), nodeEnv: "test", googleClientId: "", siteAdminEmails: ["match-owner@example.com"] },
      createMemoryRepositories()
    );
  });

  afterEach(async () => {
    await app.close();
  });

  it("cadastra usuario e retorna sessao", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/signup",
      payload: {
        email: "owner@example.com",
        username: "owner_one",
        password: "senha123",
        locale: "pt-BR"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().user.username).toBe("owner_one");
    expect(response.cookies.some((cookie) => cookie.name.includes("soccer_stats_session"))).toBe(true);
  });

  it("permite apelidos repetidos e gera identificadores publicos unicos", async () => {
    const first = await app.inject({
      method: "POST",
      url: "/v1/auth/signup",
      payload: {
        email: "capitalized@example.com",
        username: "Camisa10",
        password: "senha123",
        locale: "pt-BR"
      }
    });
    const second = await app.inject({
      method: "POST",
      url: "/v1/auth/signup",
      payload: {
        email: "another@example.com",
        username: "Camisa10",
        password: "senha123",
        locale: "pt-BR"
      }
    });

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(first.json().user.username).toBe("Camisa10");
    expect(second.json().user.username).toBe("Camisa10");
    expect(first.json().user.publicIdentifier).toMatch(/^#[0-9A-F]{6}$/);
    expect(second.json().user.publicIdentifier).toMatch(/^#[0-9A-F]{6}$/);
    expect(second.json().user.publicIdentifier).not.toBe(first.json().user.publicIdentifier);
  });

  it("permite PATCH de notificacoes no preflight CORS", async () => {
    const response = await app.inject({
      method: "OPTIONS",
      url: "/v1/notifications/notification-1/read",
      headers: {
        origin: "http://localhost:3000",
        "access-control-request-method": "PATCH"
      }
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers["access-control-allow-methods"]).toContain("PATCH");
  });

  it("normaliza barra final da origem permitida no CORS", async () => {
    await app.close();
    app = await createApp(
      { ...loadConfig(), nodeEnv: "test", googleClientId: "", webOrigin: "https://soccer-stats-web.vercel.app/" },
      createMemoryRepositories()
    );

    const response = await app.inject({
      method: "GET",
      url: "/health",
      headers: { origin: "https://soccer-stats-web.vercel.app" }
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe("https://soccer-stats-web.vercel.app");
  });

  it("atualiza e permite limpar campos opcionais do perfil", async () => {
    const signUp = await app.inject({
      method: "POST",
      url: "/v1/auth/signup",
      payload: {
        email: "profile@example.com",
        username: "profile_one",
        password: "senha123",
        locale: "pt-BR"
      }
    });
    const cookie = signUp.cookies[0];
    const csrf = await withCsrf(`${cookie?.name}=${cookie?.value}`);

    const response = await app.inject({
      method: "PUT",
      url: "/v1/players/me",
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token },
      payload: {
        displayName: "Camisa 10",
        shirtNumber: null,
        teamName: null,
        photoUrl: null,
        bio: null,
        preferredFoot: "left",
        preferredPosition: "striker"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().profile).toMatchObject({
      displayName: "Camisa 10",
      preferredFoot: "left",
      preferredPosition: "striker"
    });
    expect(response.json().profile.shirtNumber).toBeUndefined();
    expect(response.json().profile.teamName).toBeUndefined();
    expect(response.json().profile.photoUrl).toBeUndefined();
    expect(response.json().profile.bio).toBeUndefined();
  });

  it("aceita apenas um time do qual o jogador faz parte como principal", async () => {
    const signUp = await app.inject({
      method: "POST",
      url: "/v1/auth/signup",
      payload: { email: "team-profile@example.com", username: "team_profile", password: "senha123", locale: "pt-BR" }
    });
    const cookie = signUp.cookies[0];
    const csrf = await withCsrf(`${cookie?.name}=${cookie?.value}`);
    const team = await app.inject({
      method: "POST",
      url: "/v1/teams",
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token },
      payload: { name: "Ratinho Corp" }
    });
    expect(team.json().team.members[0]).toMatchObject({
      userId: signUp.json().user.id,
      username: "team_profile",
      role: "owner"
    });

    const valid = await app.inject({
      method: "PUT",
      url: "/v1/players/me",
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token },
      payload: { displayName: "Jogador", primaryTeamId: team.json().team.id, preferredFoot: "right", preferredPosition: "central-midfielder" }
    });
    const invalid = await app.inject({
      method: "PUT",
      url: "/v1/players/me",
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token },
      payload: { displayName: "Jogador", primaryTeamId: "time-inexistente", preferredFoot: "right", preferredPosition: "central-midfielder" }
    });

    expect(valid.statusCode).toBe(200);
    expect(valid.json().profile).toMatchObject({ primaryTeamId: team.json().team.id, teamName: "Ratinho Corp" });
    expect(invalid.statusCode).toBe(422);
  });

  it("normaliza posições legadas ao carregar o dashboard", async () => {
    const signUp = await app.inject({
      method: "POST",
      url: "/v1/auth/signup",
      payload: { email: "legacy@example.com", username: "legacy_one", password: "senha123", locale: "pt-BR" }
    });
    const userId = signUp.json().user.id as string;
    const profile = await app.repositories.playerProfiles.findByUserId(userId);

    await app.repositories.playerProfiles.upsert({
      ...(profile as PlayerProfile),
      preferredPosition: "midfielder" as unknown as PlayerProfile["preferredPosition"],
      photoUrl: "/uploads/legacy-photo.jpg"
    });

    const cookie = signUp.cookies[0];
    const dashboard = await app.inject({ method: "GET", url: "/v1/dashboard", headers: { cookie: `${cookie?.name}=${cookie?.value}` } });

    expect(dashboard.statusCode).toBe(200);
    expect(dashboard.json().profile.preferredPosition).toBe("central-midfielder");
    expect(dashboard.json().profile.photoUrl).toBe("/uploads/legacy-photo.jpg");
  });

  it("exige csrf em mutacoes autenticadas e permite revogar sessoes", async () => {
    const signUp = await app.inject({
      method: "POST",
      url: "/v1/auth/signup",
      payload: {
        email: "secure@example.com",
        username: "secure_one",
        password: "senha123",
        locale: "pt-BR"
      }
    });
    const cookie = signUp.cookies[0];
    const sessionCookie = `${cookie?.name}=${cookie?.value}`;

    const blocked = await app.inject({
      method: "POST",
      url: "/v1/teams",
      headers: { cookie: sessionCookie },
      payload: { name: "Time Bloqueado" }
    });
    expect(blocked.statusCode).toBe(403);

    const csrf = await withCsrf(sessionCookie);
    const sessions = await app.inject({
      method: "GET",
      url: "/v1/auth/sessions",
      headers: { cookie: csrf.cookie }
    });
    const currentSessionId = sessions.json().sessions.find((session: { current: boolean }) => session.current)?.id as string;

    expect(sessions.statusCode).toBe(200);
    expect(currentSessionId).toBeDefined();

    const revoked = await app.inject({
      method: "DELETE",
      url: `/v1/auth/sessions/${currentSessionId}`,
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token }
    });
    expect(revoked.statusCode).toBe(200);

    const me = await app.inject({
      method: "GET",
      url: "/v1/auth/me",
      headers: { cookie: csrf.cookie }
    });
    expect(me.statusCode).toBe(401);
  });

  it("cria time, campeonato e partida protegidos por sessao", async () => {
    const signUp = await app.inject({
      method: "POST",
      url: "/v1/auth/signup",
      payload: {
        email: "captain@example.com",
        username: "captain_one",
        password: "senha123",
        locale: "pt-BR"
      }
    });

    const cookie = signUp.cookies[0];
    expect(cookie).toBeDefined();
    const sessionCookie = `${cookie?.name}=${cookie?.value}`;
    const csrf = await withCsrf(sessionCookie);

    const teamA = await app.inject({
      method: "POST",
      url: "/v1/teams",
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token },
      payload: { name: "Time Azul" }
    });

    const teamB = await app.inject({
      method: "POST",
      url: "/v1/teams",
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token },
      payload: { name: "Time Verde" }
    });

    expect(teamA.json().team.slug).toBe("time-azul");
    expect(teamB.json().team.slug).toBe("time-verde");

    const tournament = await app.inject({
      method: "POST",
      url: "/v1/tournaments",
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token },
      payload: {
        name: "Liga da Resenha",
        teamIds: [teamA.json().team.id, teamB.json().team.id]
      }
    });

    const match = await app.inject({
      method: "POST",
      url: "/v1/matches",
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token },
      payload: {
        type: "tournament",
        tournamentId: tournament.json().tournament.id,
        home: { teamId: teamA.json().team.id, score: 0, playerIds: [signUp.json().user.id] },
        away: { teamId: teamB.json().team.id, score: 0, playerIds: [signUp.json().user.id] },
        playedAt: new Date().toISOString()
      }
    });

    expect(tournament.statusCode).toBe(200);
    expect(match.statusCode).toBe(200);

    const tournamentDetail = await app.inject({
      method: "GET",
      url: `/v1/tournaments/${tournament.json().tournament.id}`,
      headers: { cookie: sessionCookie }
    });
    expect(tournamentDetail.statusCode).toBe(200);

    const rounds = await app.inject({
      method: "POST",
      url: `/v1/tournaments/${tournament.json().tournament.id}/rounds/generate`,
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token }
    });
    expect(rounds.statusCode).toBe(200);
    expect(rounds.json().tournament.rounds.length).toBeGreaterThan(0);
  });

  it("salva habilidades e aplica uma avaliacao especifica no time", async () => {
    const signUp = await app.inject({
      method: "POST",
      url: "/v1/auth/signup",
      payload: {
        email: "athlete@example.com",
        username: "atleta_um",
        password: "senha123",
        locale: "pt-BR"
      }
    });
    const userId = signUp.json().user.id as string;
    const cookie = signUp.cookies[0];
    const csrf = await withCsrf(`${cookie?.name}=${cookie?.value}`);
    const team = await app.inject({
      method: "POST",
      url: "/v1/teams",
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token },
      payload: { name: "Time das Estrelas" }
    });
    const teamId = team.json().team.id as string;
    const selfAssessment = {
      outfield: { pac: 4, sho: 3, pas: 5, dri: 4, def: 2, phy: 3 },
      isGoalkeeper: false
    };

    const invalidGoalkeeper = await app.inject({
      method: "PATCH",
      url: "/v1/players/me/skills",
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token },
      payload: { ...selfAssessment, isGoalkeeper: true }
    });
    expect(invalidGoalkeeper.statusCode).toBe(400);

    const saved = await app.inject({
      method: "PATCH",
      url: "/v1/players/me/skills",
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token },
      payload: selfAssessment
    });
    expect(saved.statusCode).toBe(200);
    expect(saved.json().skills.outfield.pas).toBe(5);

    const overridden = await app.inject({
      method: "PUT",
      url: `/v1/teams/${teamId}/athletes/${userId}/skill-override`,
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token },
      payload: {
        outfield: { pac: 5, sho: 5, pas: 4, dri: 4, def: 3, phy: 4 },
        isGoalkeeper: false
      }
    });
    expect(overridden.statusCode).toBe(200);

    const roster = await app.inject({
      method: "GET",
      url: `/v1/teams/${teamId}/athletes`,
      headers: { cookie: csrf.cookie }
    });
    expect(roster.statusCode).toBe(200);
    expect(roster.json().athletes[0]).toMatchObject({
      userId,
      hasSkillOverride: true,
      effectiveSkills: { outfield: { pac: 5, sho: 5 } }
    });

  });

  it("aplica a primeira avaliacao do atleta e exige aprovacao para alteracoes posteriores", async () => {
    const ownerSignup = await app.inject({ method: "POST", url: "/v1/auth/signup", payload: { email: "team-owner@example.com", username: "dono_time", password: "senha123", locale: "pt-BR" } });
    const ownerCookie = ownerSignup.cookies[0];
    const ownerCsrf = await withCsrf(`${ownerCookie?.name}=${ownerCookie?.value}`);
    const teamResponse = await app.inject({ method: "POST", url: "/v1/teams", headers: { cookie: ownerCsrf.cookie, "x-csrf-token": ownerCsrf.token }, payload: { name: "Time da Aprovacao" } });
    const teamId = teamResponse.json().team.id as string;
    const athleteSignup = await app.inject({ method: "POST", url: "/v1/auth/signup", payload: { email: "request-athlete@example.com", username: "atleta_pedido", password: "senha123", locale: "pt-BR" } });
    const athleteId = athleteSignup.json().user.id as string;
    const athleteCookie = athleteSignup.cookies[0];
    const athleteCsrf = await withCsrf(`${athleteCookie?.name}=${athleteCookie?.value}`);
    const storedTeam = await app.repositories.teams.findById(teamId);
    await app.repositories.teams.update({ ...storedTeam!, members: [...storedTeam!.members, { userId: athleteId, username: "atleta_pedido", role: "member", joinedAt: new Date().toISOString() }], updatedAt: new Date().toISOString() });

    const firstAssessment = await app.inject({ method: "PUT", url: `/v1/teams/${teamId}/athletes/${athleteId}/skill-override`, headers: { cookie: athleteCsrf.cookie, "x-csrf-token": athleteCsrf.token }, payload: { outfield: { pac: 3, sho: 3, pas: 3, dri: 3, def: 3, phy: 3 }, isGoalkeeper: false } });
    expect(firstAssessment.statusCode).toBe(200);
    expect(firstAssessment.json().skillOverride.outfield.pac).toBe(3);

    const requestedChange = await app.inject({ method: "PUT", url: `/v1/teams/${teamId}/athletes/${athleteId}/skill-override`, headers: { cookie: athleteCsrf.cookie, "x-csrf-token": athleteCsrf.token }, payload: { outfield: { pac: 5, sho: 4, pas: 4, dri: 4, def: 3, phy: 4 }, isGoalkeeper: false } });
    expect(requestedChange.statusCode).toBe(200);
    expect(requestedChange.json().skillChangeRequest.status).toBe("pending");

    const beforeApproval = await app.inject({ method: "GET", url: `/v1/teams/${teamId}/athletes`, headers: { cookie: athleteCsrf.cookie } });
    const athleteBeforeApproval = beforeApproval.json().athletes.find((item: { userId: string }) => item.userId === athleteId);
    expect(athleteBeforeApproval.effectiveSkills.outfield.pac).toBe(3);

    const approval = await app.inject({ method: "POST", url: `/v1/teams/${teamId}/athletes/${athleteId}/skill-change-requests/${requestedChange.json().skillChangeRequest.id}/approve`, headers: { cookie: ownerCsrf.cookie, "x-csrf-token": ownerCsrf.token } });
    expect(approval.statusCode).toBe(200);

    const afterApproval = await app.inject({ method: "GET", url: `/v1/teams/${teamId}/athletes`, headers: { cookie: athleteCsrf.cookie } });
    const athleteAfterApproval = afterApproval.json().athletes.find((item: { userId: string }) => item.userId === athleteId);
    expect(athleteAfterApproval.effectiveSkills.outfield.pac).toBe(5);
  });

  it("cadastra local, cria partida com snapshot, encerra por sumula e gera notificacoes", async () => {
    const signUp = await app.inject({
      method: "POST",
      url: "/v1/auth/signup",
      payload: {
        email: "match-owner@example.com",
        username: "match_owner",
        password: "senha123",
        locale: "pt-BR"
      }
    });
    const cookie = signUp.cookies[0];
    const sessionCookie = `${cookie?.name}=${cookie?.value}`;
    const csrf = await withCsrf(sessionCookie);
    const userId = signUp.json().user.id as string;

    const venue = await app.inject({
      method: "POST",
      url: "/v1/venues",
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token },
      payload: {
        name: "Arena Central",
        visibility: "public",
        address: "Rua das Redes, 10",
        postalCode: "80000-000",
        addressNumber: "10",
        city: "Curitiba",
        state: "PR",
        surface: "synthetic",
        contactPhone: "41999999999",
        prices: { minutes60: 10000, minutes90: 14000, minutes120: 18000 }
      }
    });
    expect(venue.statusCode).toBe(202);
    const approval = await app.inject({
      method: "PATCH",
      url: `/v1/admin/venues/change-requests/${venue.json().request.id}`,
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token },
      payload: { decision: "approve" }
    });
    expect(approval.statusCode).toBe(200);
    const venueList = await app.inject({ method: "GET", url: "/v1/venues", headers: { cookie: csrf.cookie } });
    const approvedVenue = venueList.json().venues.find((item: { name: string }) => item.name === "Arena Central");

    const teamA = await app.inject({
      method: "POST",
      url: "/v1/teams",
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token },
      payload: { name: "Time Norte", visibility: "public", city: "Curitiba", state: "PR" }
    });
    const teamB = await app.inject({
      method: "POST",
      url: "/v1/teams",
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token },
      payload: { name: "Time Sul", visibility: "private" }
    });

    const match = await app.inject({
      method: "POST",
      url: "/v1/matches",
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token },
      payload: {
        type: "casual",
        venueId: approvedVenue.id,
        home: { teamId: teamA.json().team.id, score: 0, playerIds: [userId] },
        away: { teamId: teamB.json().team.id, score: 0, playerIds: [userId] },
        playedAt: new Date().toISOString()
      }
    });

    expect(match.statusCode).toBe(200);
    expect(match.json().match.venue.name).toBe("Arena Central");

    const presence = await app.inject({
      method: "PUT",
      url: `/v1/matches/${match.json().match.id}/presences/me`,
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token },
      payload: { status: "confirmed" }
    });
    expect(presence.statusCode).toBe(200);
    expect(presence.json().presences.some((item: { userId: string; status: string }) => item.userId === userId && item.status === "confirmed")).toBe(true);

    const lineup = await app.inject({
      method: "POST",
      url: `/v1/matches/${match.json().match.id}/lineup`,
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token },
      payload: {
        homePlayerIds: [userId],
        awayPlayerIds: [userId]
      }
    });
    expect(lineup.statusCode).toBe(200);
    expect(lineup.json().match.lineup.homePlayerIds).toContain(userId);

    const checkIn = await app.inject({
      method: "POST",
      url: `/v1/matches/${match.json().match.id}/check-in/me`,
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token }
    });
    expect(checkIn.statusCode).toBe(200);
    expect(checkIn.json().match.checkIns.some((item: { userId: string }) => item.userId === userId)).toBe(true);

    const invalidComplete = await app.inject({
      method: "POST",
      url: "/v1/matches/complete",
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token },
      payload: {
        id: match.json().match.id,
        homeScore: 1,
        awayScore: 0,
        eventLog: []
      }
    });
    expect(invalidComplete.statusCode).toBe(400);

    const complete = await app.inject({
      method: "POST",
      url: "/v1/matches/complete",
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token },
      payload: {
        id: match.json().match.id,
        homeScore: 1,
        awayScore: 0,
        eventLog: [{ minute: 12, type: "goal", playerId: userId, teamId: teamA.json().team.id }]
      }
    });
    expect(complete.statusCode).toBe(200);

    const duplicateComplete = await app.inject({
      method: "POST",
      url: "/v1/matches/complete",
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token },
      payload: {
        id: match.json().match.id,
        homeScore: 1,
        awayScore: 0,
        eventLog: [{ minute: 12, type: "goal", playerId: userId, teamId: teamA.json().team.id }]
      }
    });
    expect(duplicateComplete.statusCode).toBe(409);

    const ranking = await app.inject({
      method: "GET",
      url: "/v1/rankings/players?metric=overall",
      headers: { cookie: sessionCookie }
    });
    expect(ranking.statusCode).toBe(200);
    expect(ranking.json().players[0].ratings.ratingVersion).toBe("v1");

    const impact = await app.inject({
      method: "GET",
      url: `/v1/matches/${match.json().match.id}/stats-impact`,
      headers: { cookie: sessionCookie }
    });
    expect(impact.statusCode).toBe(200);
    expect(impact.json().impact.playerImpacts[0].checkedIn).toBe(true);

    const card = await app.inject({
      method: "GET",
      url: `/v1/players/${userId}/card`,
      headers: { cookie: sessionCookie }
    });
    expect(card.statusCode).toBe(200);
    expect(card.json().card.ratingVersion).toBe("v3");

    const insights = await app.inject({
      method: "GET",
      url: `/v1/players/${userId}/insights`,
      headers: { cookie: sessionCookie }
    });
    expect(insights.statusCode).toBe(200);
    expect(insights.json().insights.length).toBeGreaterThan(0);

    const review = await app.inject({
      method: "POST",
      url: `/v1/matches/${match.json().match.id}/review`,
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token },
      payload: {
        homeScore: 2,
        awayScore: 0,
        reason: "Gol corrigido na sumula",
        eventLog: [
          { minute: 12, type: "goal", playerId: userId, teamId: teamA.json().team.id },
          { minute: 33, type: "goal", playerId: userId, teamId: teamA.json().team.id }
        ]
      }
    });
    expect(review.statusCode).toBe(200);
    expect(review.json().match.reviewStatus).toBe("pending");
    expect(review.json().match.eventLogVersion).toBe(2);

    const approve = await app.inject({
      method: "POST",
      url: `/v1/matches/${match.json().match.id}/review/approve`,
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token }
    });
    expect(approve.statusCode).toBe(200);
    expect(approve.json().match.reviewStatus).toBe("approved");

    const notifications = await app.inject({
      method: "GET",
      url: "/v1/notifications",
      headers: { cookie: sessionCookie }
    });
    expect(notifications.statusCode).toBe(200);
    expect(notifications.json().notifications.length).toBeGreaterThanOrEqual(2);
    expect(notifications.json().notifications.some((notification: { type: string; metadata?: Record<string, string> }) =>
      notification.type === "match-completed" && notification.metadata?.homeTeam === "Time Norte" && notification.metadata.awayScore === "0"
    )).toBe(true);

    const firstNotificationId = notifications.json().notifications[0].id as string;
    const read = await app.inject({
      method: "PATCH",
      url: `/v1/notifications/${firstNotificationId}/read`,
      headers: { cookie: csrf.cookie, "x-csrf-token": csrf.token }
    });
    expect(read.statusCode).toBe(200);
    expect(read.json().notification.readAt).toBeDefined();
  });

  it("expoe o json OpenAPI", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/docs/json"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().openapi).toBe("3.0.3");
    expect(response.json().paths["/v1/auth/signup"]).toBeDefined();
  });

  it("envia convite pelo identificador publico do usuario", async () => {
    const owner = await app.inject({
      method: "POST",
      url: "/v1/auth/signup",
      payload: {
        email: "invite-owner@example.com",
        username: "Dono",
        password: "senha123",
        locale: "pt-BR"
      }
    });
    const recipient = await app.inject({
      method: "POST",
      url: "/v1/auth/signup",
      payload: {
        email: "invite-recipient@example.com",
        username: "Dono",
        password: "senha123",
        locale: "pt-BR"
      }
    });
    const recipientUser = recipient.json().user as { id: string; publicIdentifier: string };
    expect(recipient.statusCode, recipient.body).toBe(200);
    expect(recipientUser.publicIdentifier).toMatch(/^#[0-9A-F]{6}$/);
    const ownerCookie = owner.cookies[0];
    const ownerCsrf = await withCsrf(`${ownerCookie?.name}=${ownerCookie?.value}`);
    const team = await app.inject({
      method: "POST",
      url: "/v1/teams",
      headers: { cookie: ownerCsrf.cookie, "x-csrf-token": ownerCsrf.token },
      payload: { name: "Time dos IDs" }
    });
    const invite = await app.inject({
      method: "POST",
      url: "/v1/teams/invites",
      headers: { cookie: ownerCsrf.cookie, "x-csrf-token": ownerCsrf.token },
      payload: {
        resourceType: "team",
        resourceId: team.json().team.id,
        publicIdentifier: recipientUser.publicIdentifier.toLowerCase(),
        role: "member"
      }
    });
    const recipientCookie = recipient.cookies[0];
    const dashboard = await app.inject({
      method: "GET",
      url: "/v1/dashboard",
      headers: { cookie: `${recipientCookie?.name}=${recipientCookie?.value}` }
    });

    expect(invite.statusCode, invite.body).toBe(200);
    expect(invite.json().invite).toMatchObject({
      recipientUserId: recipientUser.id,
      recipientPublicIdentifier: recipientUser.publicIdentifier
    });
    expect(dashboard.statusCode).toBe(200);
    expect(dashboard.json().invites).toHaveLength(1);
  });
});
