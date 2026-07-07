import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createMemoryRepositories } from "../src/repositories/memory.js";
import { loadConfig } from "../src/config.js";
import type { FastifyInstance } from "fastify";

describe("api flows", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await createApp(
      { ...loadConfig(), nodeEnv: "test", googleClientId: "" },
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

    const teamA = await app.inject({
      method: "POST",
      url: "/v1/teams",
      headers: { cookie: sessionCookie },
      payload: { name: "Time Azul" }
    });

    const teamB = await app.inject({
      method: "POST",
      url: "/v1/teams",
      headers: { cookie: sessionCookie },
      payload: { name: "Time Verde" }
    });

    const tournament = await app.inject({
      method: "POST",
      url: "/v1/tournaments",
      headers: { cookie: sessionCookie },
      payload: {
        name: "Liga da Resenha",
        teamIds: [teamA.json().team.id, teamB.json().team.id]
      }
    });

    const match = await app.inject({
      method: "POST",
      url: "/v1/matches",
      headers: { cookie: sessionCookie },
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
    const userId = signUp.json().user.id as string;

    const venue = await app.inject({
      method: "POST",
      url: "/v1/venues",
      headers: { cookie: sessionCookie },
      payload: {
        name: "Arena Central",
        visibility: "public",
        address: "Rua das Redes, 10",
        city: "Curitiba",
        state: "PR",
        surface: "synthetic"
      }
    });
    expect(venue.statusCode).toBe(200);

    const teamA = await app.inject({
      method: "POST",
      url: "/v1/teams",
      headers: { cookie: sessionCookie },
      payload: { name: "Time Norte", visibility: "public", city: "Curitiba", state: "PR" }
    });
    const teamB = await app.inject({
      method: "POST",
      url: "/v1/teams",
      headers: { cookie: sessionCookie },
      payload: { name: "Time Sul", visibility: "private" }
    });

    const match = await app.inject({
      method: "POST",
      url: "/v1/matches",
      headers: { cookie: sessionCookie },
      payload: {
        type: "casual",
        venueId: venue.json().venue.id,
        home: { teamId: teamA.json().team.id, score: 0, playerIds: [userId] },
        away: { teamId: teamB.json().team.id, score: 0, playerIds: [userId] },
        playedAt: new Date().toISOString()
      }
    });

    expect(match.statusCode).toBe(200);
    expect(match.json().match.venue.name).toBe("Arena Central");

    const invalidComplete = await app.inject({
      method: "POST",
      url: "/v1/matches/complete",
      headers: { cookie: sessionCookie },
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
      headers: { cookie: sessionCookie },
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
      headers: { cookie: sessionCookie },
      payload: {
        id: match.json().match.id,
        homeScore: 1,
        awayScore: 0,
        eventLog: [{ minute: 12, type: "goal", playerId: userId, teamId: teamA.json().team.id }]
      }
    });
    expect(duplicateComplete.statusCode).toBe(409);

    const notifications = await app.inject({
      method: "GET",
      url: "/v1/notifications",
      headers: { cookie: sessionCookie }
    });
    expect(notifications.statusCode).toBe(200);
    expect(notifications.json().notifications.length).toBeGreaterThanOrEqual(2);

    const firstNotificationId = notifications.json().notifications[0].id as string;
    const read = await app.inject({
      method: "PATCH",
      url: `/v1/notifications/${firstNotificationId}/read`,
      headers: { cookie: sessionCookie }
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

  it("verifica disponibilidade de apelido", async () => {
    await app.inject({
      method: "POST",
      url: "/v1/auth/signup",
      payload: {
        email: "lookup@example.com",
        username: "lookup_one",
        password: "senha123",
        locale: "pt-BR"
      }
    });

    const taken = await app.inject({
      method: "GET",
      url: "/v1/auth/username-availability?username=lookup_one"
    });
    const available = await app.inject({
      method: "GET",
      url: "/v1/auth/username-availability?username=lookup_two"
    });

    expect(taken.statusCode).toBe(200);
    expect(taken.json().available).toBe(false);
    expect(available.statusCode).toBe(200);
    expect(available.json().available).toBe(true);
  });
});
