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
        password: "12345678",
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
        password: "12345678",
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
});
