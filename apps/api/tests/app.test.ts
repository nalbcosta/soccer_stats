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
