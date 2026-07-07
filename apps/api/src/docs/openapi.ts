import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance, FastifySchema } from "fastify";

const isoDate = { type: "string", format: "date-time" } as const;
const id = { type: "string" } as const;
const messageResponse = {
  type: "object",
  properties: {
    message: { type: "string" }
  },
  required: ["message"]
} as const;

const authSecurity = [{ sessionCookie: [] }] as const;

export const authRouteSchemas = {
  usernameAvailability: {
    tags: ["auth"],
    summary: "Verifica disponibilidade de apelido",
    querystring: { $ref: "usernameAvailabilityQuery#" },
    response: {
      200: { $ref: "usernameAvailabilityResponse#" },
      400: { $ref: "usernameAvailabilityResponse#" }
    }
  } satisfies FastifySchema,
  signUp: {
    tags: ["auth"],
    summary: "Cria uma conta com email, username e senha",
    body: { $ref: "signUpInput#" },
    response: {
      200: { $ref: "publicUserEnvelope#" },
      400: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  signIn: {
    tags: ["auth"],
    summary: "Autentica com email e senha",
    body: { $ref: "signInInput#" },
    response: {
      200: { $ref: "publicUserEnvelope#" },
      401: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  google: {
    tags: ["auth"],
    summary: "Autentica com credencial Google Identity Services",
    body: { $ref: "googleAuthInput#" },
    response: {
      200: { $ref: "publicUserEnvelope#" },
      400: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  signOut: {
    tags: ["auth"],
    summary: "Encerra a sessão atual",
    security: authSecurity,
    response: {
      200: { $ref: "okResponse#" }
    }
  } satisfies FastifySchema,
  me: {
    tags: ["auth"],
    summary: "Retorna o usuário autenticado",
    security: authSecurity,
    response: {
      200: { $ref: "publicUserEnvelope#" },
      401: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema
};

export const playerRouteSchemas = {
  getMe: {
    tags: ["players"],
    summary: "Retorna o perfil do jogador autenticado",
    security: authSecurity,
    response: {
      200: { $ref: "playerProfileEnvelopeNullable#" },
      401: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  updateMe: {
    tags: ["players"],
    summary: "Atualiza o perfil do jogador autenticado",
    security: authSecurity,
    body: { $ref: "updateProfileInput#" },
    response: {
      200: { $ref: "playerProfileEnvelope#" },
      401: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  uploadPhoto: {
    tags: ["players"],
    summary: "Faz upload da foto do jogador autenticado",
    security: authSecurity,
    consumes: ["multipart/form-data"],
    body: {
      type: "object",
      properties: {
        photo: { type: "string", format: "binary" }
      },
      required: ["photo"]
    },
    response: {
      200: { $ref: "playerProfileEnvelope#" },
      400: { $ref: "messageResponse#" },
      401: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema
};

export const teamRouteSchemas = {
  list: {
    tags: ["teams"],
    summary: "Lista os times do usuário autenticado",
    security: authSecurity,
    response: {
      200: { $ref: "teamsEnvelope#" },
      401: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  get: {
    tags: ["teams"],
    summary: "Detalha um time visivel ao usuario",
    security: authSecurity,
    response: {
      200: { $ref: "teamEnvelope#" },
      401: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  create: {
    tags: ["teams"],
    summary: "Cria um novo time",
    security: authSecurity,
    body: { $ref: "createTeamInput#" },
    response: {
      200: { $ref: "teamEnvelope#" },
      401: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  update: {
    tags: ["teams"],
    summary: "Atualiza dados basicos e visibilidade do time",
    security: authSecurity,
    body: { $ref: "updateTeamInput#" },
    response: {
      200: { $ref: "teamEnvelope#" },
      401: { $ref: "messageResponse#" },
      403: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  invite: {
    tags: ["teams"],
    summary: "Cria um convite para um time",
    security: authSecurity,
    body: { $ref: "createInviteInput#" },
    response: {
      200: { $ref: "inviteEnvelope#" },
      400: { $ref: "messageResponse#" },
      403: { $ref: "messageResponse#" },
      401: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema
};

export const venueRouteSchemas = {
  list: {
    tags: ["venues"],
    summary: "Lista locais publicos e locais privados do usuario",
    security: authSecurity,
    querystring: { $ref: "listVenuesQuery#" },
    response: {
      200: { $ref: "venuesEnvelope#" },
      401: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  get: {
    tags: ["venues"],
    summary: "Detalha um local visivel ao usuario",
    security: authSecurity,
    response: {
      200: { $ref: "venueEnvelope#" },
      401: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  create: {
    tags: ["venues"],
    summary: "Cadastra um local ou estadio",
    security: authSecurity,
    body: { $ref: "createVenueInput#" },
    response: {
      200: { $ref: "venueEnvelope#" },
      401: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  update: {
    tags: ["venues"],
    summary: "Atualiza um local do usuario",
    security: authSecurity,
    body: { $ref: "updateVenueInput#" },
    response: {
      200: { $ref: "venueEnvelope#" },
      401: { $ref: "messageResponse#" },
      403: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema
};

export const tournamentRouteSchemas = {
  list: {
    tags: ["tournaments"],
    summary: "Lista os campeonatos do usuário",
    security: authSecurity,
    response: {
      200: { $ref: "tournamentsEnvelope#" },
      401: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  create: {
    tags: ["tournaments"],
    summary: "Cria um campeonato simples em formato liga",
    security: authSecurity,
    body: { $ref: "createTournamentInput#" },
    response: {
      200: { $ref: "tournamentEnvelope#" },
      400: { $ref: "messageResponse#" },
      403: { $ref: "messageResponse#" },
      401: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema
};

export const matchRouteSchemas = {
  list: {
    tags: ["matches"],
    summary: "Lista as partidas dos times do usuário",
    security: authSecurity,
    response: {
      200: { $ref: "matchesEnvelope#" },
      401: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  create: {
    tags: ["matches"],
    summary: "Cria uma partida casual ou de campeonato",
    security: authSecurity,
    body: { $ref: "createMatchInput#" },
    response: {
      200: { $ref: "matchEnvelope#" },
      400: { $ref: "messageResponse#" },
      403: { $ref: "messageResponse#" },
      401: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  complete: {
    tags: ["matches"],
    summary: "Encerra uma partida e recalcula estatísticas",
    security: authSecurity,
    body: { $ref: "completeMatchInput#" },
    response: {
      200: { $ref: "matchEnvelope#" },
      400: { $ref: "messageResponse#" },
      401: { $ref: "messageResponse#" },
      403: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" },
      409: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema
};

export const dashboardRouteSchemas = {
  get: {
    tags: ["dashboard"],
    summary: "Retorna a visão agregada do painel do usuário",
    security: authSecurity,
    response: {
      200: { $ref: "dashboardResponse#" },
      401: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema
};

export const notificationRouteSchemas = {
  list: {
    tags: ["notifications"],
    summary: "Lista notificacoes in-app do usuario",
    security: authSecurity,
    response: {
      200: { $ref: "notificationsEnvelope#" },
      401: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  markRead: {
    tags: ["notifications"],
    summary: "Marca uma notificacao como lida",
    security: authSecurity,
    response: {
      200: { $ref: "notificationEnvelope#" },
      401: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  markAllRead: {
    tags: ["notifications"],
    summary: "Marca todas as notificacoes como lidas",
    security: authSecurity,
    response: {
      200: { $ref: "okResponse#" },
      401: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema
};

const schemas = [
  {
    $id: "messageResponse",
    ...messageResponse
  },
  {
    $id: "okResponse",
    type: "object",
    properties: {
      ok: { type: "boolean" }
    },
    required: ["ok"]
  },
  {
    $id: "stats",
    type: "object",
    properties: {
      matchesPlayed: { type: "integer", minimum: 0 },
      wins: { type: "integer", minimum: 0 },
      draws: { type: "integer", minimum: 0 },
      losses: { type: "integer", minimum: 0 },
      goals: { type: "integer", minimum: 0 },
      assists: { type: "integer", minimum: 0 },
      saves: { type: "integer", minimum: 0 },
      cleanSheets: { type: "integer", minimum: 0 },
      goalDifference: { type: "integer" },
      points: { type: "integer", minimum: 0 },
      winRate: { type: "number", minimum: 0 },
      goalsPerMatch: { type: "number", minimum: 0 },
      form: {
        type: "array",
        items: {
          type: "string",
          enum: ["W", "D", "L"]
        }
      },
      recentHighlight: { type: "string" }
    },
    required: [
      "matchesPlayed",
      "wins",
      "draws",
      "losses",
      "goals",
      "assists",
      "saves",
      "cleanSheets",
      "goalDifference",
      "points",
      "winRate",
      "goalsPerMatch",
      "form",
      "recentHighlight"
    ]
  },
  {
    $id: "publicUser",
    type: "object",
    properties: {
      id,
      email: { type: "string", format: "email" },
      username: { type: "string" },
      locale: { type: "string", enum: ["pt-BR", "en"] },
      theme: { type: "string", enum: ["light", "dark", "system"] },
      providers: {
        type: "array",
        items: { type: "string", enum: ["credentials", "google"] }
      }
    },
    required: ["id", "email", "username", "locale", "theme", "providers"]
  },
  {
    $id: "playerProfile",
    type: "object",
    properties: {
      userId: id,
      displayName: { type: "string" },
      shirtNumber: { type: "integer", minimum: 1, maximum: 99 },
      photoUrl: { type: "string", format: "uri" },
      teamName: { type: "string", minLength: 2, maxLength: 40 },
      preferredFoot: { type: "string", enum: ["right", "left", "both"] },
      preferredPosition: { type: "string", enum: ["goalkeeper", "defender", "midfielder", "forward"] },
      bio: { type: "string" },
      stats: { $ref: "stats#" }
    },
    required: ["userId", "displayName", "preferredFoot", "preferredPosition", "stats"]
  },
  {
    $id: "membership",
    type: "object",
    properties: {
      userId: id,
      role: { type: "string", enum: ["owner", "admin", "member"] },
      joinedAt: isoDate
    },
    required: ["userId", "role", "joinedAt"]
  },
  {
    $id: "team",
    type: "object",
    properties: {
      id,
      name: { type: "string" },
      slug: { type: "string" },
      ownerId: id,
      visibility: { type: "string", enum: ["private", "public"] },
      city: { type: "string" },
      state: { type: "string", minLength: 2, maxLength: 2 },
      members: {
        type: "array",
        items: { $ref: "membership#" }
      },
      stats: { $ref: "stats#" },
      createdAt: isoDate,
      updatedAt: isoDate
    },
    required: ["id", "name", "slug", "ownerId", "visibility", "members", "stats", "createdAt", "updatedAt"]
  },
  {
    $id: "invite",
    type: "object",
    properties: {
      id,
      resourceType: { type: "string", enum: ["team", "tournament"] },
      resourceId: id,
      email: { type: "string", format: "email" },
      role: { type: "string", enum: ["admin", "member"] },
      status: { type: "string", enum: ["pending", "accepted", "revoked"] },
      invitedBy: id,
      token: { type: "string" },
      expiresAt: isoDate,
      createdAt: isoDate
    },
    required: ["id", "resourceType", "resourceId", "email", "role", "status", "invitedBy", "createdAt"]
  },
  {
    $id: "matchEvent",
    type: "object",
    properties: {
      minute: { type: "integer", minimum: 0, maximum: 130 },
      type: { type: "string", enum: ["goal", "assist", "yellow-card", "red-card"] },
      playerId: id,
      teamId: id,
      assistPlayerId: id
    },
    required: ["minute", "type", "playerId", "teamId"]
  },
  {
    $id: "notification",
    type: "object",
    properties: {
      id,
      userId: id,
      type: { type: "string", enum: ["invite-created", "match-scheduled", "match-completed", "tournament-updated"] },
      title: { type: "string" },
      message: { type: "string" },
      metadata: {
        type: "object",
        additionalProperties: { type: "string" }
      },
      readAt: isoDate,
      createdAt: isoDate
    },
    required: ["id", "userId", "type", "title", "message", "createdAt"]
  },
  {
    $id: "matchVenue",
    type: "object",
    properties: {
      name: { type: "string", minLength: 2, maxLength: 80 },
      address: { type: "string", minLength: 2, maxLength: 120 },
      city: { type: "string", minLength: 2, maxLength: 80 },
      state: { type: "string", minLength: 2, maxLength: 2 },
      surface: { type: "string", enum: ["grass", "synthetic", "court", "sand", "other"] }
    }
  },
  {
    $id: "venue",
    type: "object",
    properties: {
      id,
      name: { type: "string" },
      slug: { type: "string" },
      ownerId: id,
      visibility: { type: "string", enum: ["private", "public"] },
      address: { type: "string" },
      city: { type: "string" },
      state: { type: "string" },
      surface: { type: "string", enum: ["grass", "synthetic", "court", "sand", "other"] },
      createdAt: isoDate,
      updatedAt: isoDate
    },
    required: ["id", "name", "slug", "ownerId", "visibility", "city", "state", "surface", "createdAt", "updatedAt"]
  },
  {
    $id: "matchSide",
    type: "object",
    properties: {
      teamId: id,
      score: { type: "integer", minimum: 0 },
      playerIds: {
        type: "array",
        items: id
      }
    },
    required: ["teamId", "score", "playerIds"]
  },
  {
    $id: "match",
    type: "object",
    properties: {
      id,
      type: { type: "string", enum: ["casual", "tournament"] },
      status: { type: "string", enum: ["scheduled", "completed"] },
      createdBy: id,
      home: { $ref: "matchSide#" },
      away: { $ref: "matchSide#" },
      eventLog: {
        type: "array",
        items: { $ref: "matchEvent#" }
      },
      durationMinutes: { type: "integer", minimum: 1, maximum: 180 },
      venueId: id,
      venue: { $ref: "matchVenue#" },
      tournamentId: id,
      playedAt: isoDate,
      createdAt: isoDate,
      updatedAt: isoDate
    },
    required: ["id", "type", "status", "createdBy", "home", "away", "eventLog", "playedAt", "createdAt", "updatedAt"]
  },
  {
    $id: "tournamentStanding",
    type: "object",
    properties: {
      teamId: id,
      stats: { $ref: "stats#" }
    },
    required: ["teamId", "stats"]
  },
  {
    $id: "tournament",
    type: "object",
    properties: {
      id,
      name: { type: "string" },
      slug: { type: "string" },
      ownerId: id,
      format: { type: "string", enum: ["league"] },
      visibility: { type: "string", enum: ["private", "public"] },
      teamIds: {
        type: "array",
        items: id
      },
      matchIds: {
        type: "array",
        items: id
      },
      standings: {
        type: "array",
        items: { $ref: "tournamentStanding#" }
      },
      createdAt: isoDate,
      updatedAt: isoDate
    },
    required: ["id", "name", "slug", "ownerId", "format", "visibility", "teamIds", "matchIds", "standings", "createdAt", "updatedAt"]
  },
  {
    $id: "signUpInput",
    type: "object",
    properties: {
      email: { type: "string", format: "email" },
      username: { type: "string", minLength: 3, maxLength: 20, pattern: "^[a-z0-9_]+$" },
      password: { type: "string", minLength: 8, maxLength: 72, pattern: "^(?=.*[A-Za-z])(?=.*\\d).+$" },
      locale: { type: "string", enum: ["pt-BR", "en"] }
    },
    required: ["email", "username", "password"]
  },
  {
    $id: "usernameAvailabilityQuery",
    type: "object",
    properties: {
      username: { type: "string", minLength: 3, maxLength: 20, pattern: "^[a-z0-9_]+$" }
    },
    required: ["username"]
  },
  {
    $id: "usernameAvailabilityResponse",
    type: "object",
    properties: {
      available: { type: "boolean" },
      message: { type: "string" }
    },
    required: ["available", "message"]
  },
  {
    $id: "signInInput",
    type: "object",
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 8, maxLength: 72 },
      rememberMe: { type: "boolean", default: false }
    },
    required: ["email", "password"]
  },
  {
    $id: "googleAuthInput",
    type: "object",
    properties: {
      credential: { type: "string" },
      locale: { type: "string", enum: ["pt-BR", "en"] },
      rememberMe: { type: "boolean", default: false }
    },
    required: ["credential"]
  },
  {
    $id: "updateProfileInput",
    type: "object",
    properties: {
      displayName: { type: "string", minLength: 2, maxLength: 40 },
      shirtNumber: { type: "integer", minimum: 1, maximum: 99 },
      photoUrl: { type: "string", format: "uri", maxLength: 500 },
      teamName: { type: "string", minLength: 2, maxLength: 40 },
      preferredFoot: { type: "string", enum: ["right", "left", "both"] },
      preferredPosition: { type: "string", enum: ["goalkeeper", "defender", "midfielder", "forward"] },
      bio: { type: "string", maxLength: 160 }
    },
    required: ["displayName", "preferredFoot", "preferredPosition"]
  },
  {
    $id: "createTeamInput",
    type: "object",
    properties: {
      name: { type: "string", minLength: 2, maxLength: 40 },
      visibility: { type: "string", enum: ["private", "public"], default: "private" },
      city: { type: "string", minLength: 2, maxLength: 80 },
      state: { type: "string", minLength: 2, maxLength: 2 }
    },
    required: ["name"]
  },
  {
    $id: "updateTeamInput",
    type: "object",
    properties: {
      name: { type: "string", minLength: 2, maxLength: 40 },
      visibility: { type: "string", enum: ["private", "public"] },
      city: { type: "string", minLength: 2, maxLength: 80 },
      state: { type: "string", minLength: 2, maxLength: 2 }
    }
  },
  {
    $id: "createInviteInput",
    type: "object",
    properties: {
      resourceType: { type: "string", enum: ["team", "tournament"] },
      resourceId: id,
      email: { type: "string", format: "email" },
      role: { type: "string", enum: ["admin", "member"] }
    },
    required: ["resourceType", "resourceId", "email", "role"]
  },
  {
    $id: "createMatchInput",
    type: "object",
    properties: {
      type: { type: "string", enum: ["casual", "tournament"] },
      home: { $ref: "matchSide#" },
      away: { $ref: "matchSide#" },
      tournamentId: id,
      durationMinutes: { type: "integer", minimum: 1, maximum: 180 },
      venueId: id,
      venue: { $ref: "matchVenue#" },
      playedAt: isoDate
    },
    required: ["type", "home", "away", "playedAt"]
  },
  {
    $id: "completeMatchInput",
    type: "object",
    properties: {
      id,
      homeScore: { type: "integer", minimum: 0 },
      awayScore: { type: "integer", minimum: 0 },
      durationMinutes: { type: "integer", minimum: 1, maximum: 180 },
      venue: { $ref: "matchVenue#" },
      eventLog: {
        type: "array",
        items: { $ref: "matchEvent#" }
      }
    },
    required: ["id", "homeScore", "awayScore", "eventLog"]
  },
  {
    $id: "createTournamentInput",
    type: "object",
    properties: {
      name: { type: "string", minLength: 2, maxLength: 50 },
      visibility: { type: "string", enum: ["private", "public"], default: "private" },
      teamIds: {
        type: "array",
        items: id,
        minItems: 2
      }
    },
    required: ["name", "teamIds"]
  },
  {
    $id: "createVenueInput",
    type: "object",
    properties: {
      name: { type: "string", minLength: 2, maxLength: 80 },
      visibility: { type: "string", enum: ["private", "public"], default: "private" },
      address: { type: "string", minLength: 2, maxLength: 120 },
      city: { type: "string", minLength: 2, maxLength: 80 },
      state: { type: "string", minLength: 2, maxLength: 2 },
      surface: { type: "string", enum: ["grass", "synthetic", "court", "sand", "other"], default: "other" }
    },
    required: ["name", "city", "state"]
  },
  {
    $id: "updateVenueInput",
    type: "object",
    properties: {
      name: { type: "string", minLength: 2, maxLength: 80 },
      visibility: { type: "string", enum: ["private", "public"] },
      address: { type: "string", minLength: 2, maxLength: 120 },
      city: { type: "string", minLength: 2, maxLength: 80 },
      state: { type: "string", minLength: 2, maxLength: 2 },
      surface: { type: "string", enum: ["grass", "synthetic", "court", "sand", "other"] }
    }
  },
  {
    $id: "listVenuesQuery",
    type: "object",
    properties: {
      city: { type: "string", minLength: 2, maxLength: 80 },
      state: { type: "string", minLength: 2, maxLength: 2 },
      visibility: { type: "string", enum: ["private", "public"] },
      page: { type: "integer", minimum: 1, default: 1 },
      pageSize: { type: "integer", minimum: 1, maximum: 50, default: 20 }
    }
  },
  {
    $id: "publicUserEnvelope",
    type: "object",
    properties: {
      user: { $ref: "publicUser#" }
    },
    required: ["user"]
  },
  {
    $id: "playerProfileEnvelope",
    type: "object",
    properties: {
      profile: { $ref: "playerProfile#" }
    },
    required: ["profile"]
  },
  {
    $id: "playerProfileEnvelopeNullable",
    type: "object",
    properties: {
      profile: {
        anyOf: [{ $ref: "playerProfile#" }, { type: "null" }]
      }
    },
    required: ["profile"]
  },
  {
    $id: "teamEnvelope",
    type: "object",
    properties: {
      team: { $ref: "team#" }
    },
    required: ["team"]
  },
  {
    $id: "teamsEnvelope",
    type: "object",
    properties: {
      teams: {
        type: "array",
        items: { $ref: "team#" }
      }
    },
    required: ["teams"]
  },
  {
    $id: "venueEnvelope",
    type: "object",
    properties: {
      venue: { $ref: "venue#" }
    },
    required: ["venue"]
  },
  {
    $id: "venuesEnvelope",
    type: "object",
    properties: {
      venues: {
        type: "array",
        items: { $ref: "venue#" }
      }
    },
    required: ["venues"]
  },
  {
    $id: "inviteEnvelope",
    type: "object",
    properties: {
      invite: { $ref: "invite#" }
    },
    required: ["invite"]
  },
  {
    $id: "notificationEnvelope",
    type: "object",
    properties: {
      notification: { $ref: "notification#" }
    },
    required: ["notification"]
  },
  {
    $id: "notificationsEnvelope",
    type: "object",
    properties: {
      notifications: {
        type: "array",
        items: { $ref: "notification#" }
      }
    },
    required: ["notifications"]
  },
  {
    $id: "matchEnvelope",
    type: "object",
    properties: {
      match: { $ref: "match#" }
    },
    required: ["match"]
  },
  {
    $id: "matchesEnvelope",
    type: "object",
    properties: {
      matches: {
        type: "array",
        items: { $ref: "match#" }
      }
    },
    required: ["matches"]
  },
  {
    $id: "tournamentEnvelope",
    type: "object",
    properties: {
      tournament: { $ref: "tournament#" }
    },
    required: ["tournament"]
  },
  {
    $id: "tournamentsEnvelope",
    type: "object",
    properties: {
      tournaments: {
        type: "array",
        items: { $ref: "tournament#" }
      }
    },
    required: ["tournaments"]
  },
  {
    $id: "dashboardResponse",
    type: "object",
    properties: {
      profile: {
        anyOf: [{ $ref: "playerProfile#" }, { type: "null" }]
      },
      teams: {
        type: "array",
        items: { $ref: "team#" }
      },
      matches: {
        type: "array",
        items: { $ref: "match#" }
      },
      tournaments: {
        type: "array",
        items: { $ref: "tournament#" }
      },
      invites: {
        type: "array",
        items: { $ref: "invite#" }
      },
      venues: {
        type: "array",
        items: { $ref: "venue#" }
      },
      notifications: {
        type: "array",
        items: { $ref: "notification#" }
      }
    },
    required: ["profile", "teams", "matches", "tournaments", "invites", "venues", "notifications"]
  }
];

export const registerOpenApi = async (app: FastifyInstance): Promise<void> => {
  for (const schema of schemas) {
    app.addSchema(schema);
  }

  await app.register(swagger, {
    openapi: {
      info: {
        title: "NaBola API",
        description: "Documentação das rotas do NaBola de peladas, times, campeonatos e estatísticas.",
        version: "1.0.0"
      },
      servers: [
        {
          url: "http://localhost:4000",
          description: "Desenvolvimento local"
        }
      ],
      tags: [
        { name: "auth", description: "Autenticação e sessão" },
        { name: "players", description: "Perfil do jogador" },
        { name: "teams", description: "Times e convites" },
        { name: "venues", description: "Locais e estadios" },
        { name: "matches", description: "Partidas e encerramento" },
        { name: "tournaments", description: "Campeonatos" },
        { name: "notifications", description: "Alertas in-app" },
        { name: "dashboard", description: "Visão agregada do painel" }
      ],
      components: {
        securitySchemes: {
          sessionCookie: {
            type: "apiKey",
            in: "cookie",
            name: "soccer_stats_session"
          }
        }
      }
    }
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true
    },
    staticCSP: true,
    transformSpecificationClone: true,
    indexPrefix: ""
  });
};
