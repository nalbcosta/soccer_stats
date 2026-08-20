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
  csrf: {
    tags: ["auth"],
    summary: "Emite token CSRF para rotas mutaveis autenticadas",
    response: {
      200: { $ref: "csrfResponse#" }
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
  } satisfies FastifySchema,
  sessions: {
    tags: ["auth"],
    summary: "Lista sessoes do usuario autenticado",
    security: authSecurity,
    response: {
      200: { $ref: "sessionsEnvelope#" },
      401: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  revokeSession: {
    tags: ["auth"],
    summary: "Revoga uma sessao do usuario autenticado",
    security: authSecurity,
    response: {
      200: { $ref: "okResponse#" },
      401: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  signOutAll: {
    tags: ["auth"],
    summary: "Revoga todas as outras sessoes do usuario autenticado",
    security: authSecurity,
    response: {
      200: { $ref: "okResponse#" },
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
      404: { $ref: "messageResponse#" },
      422: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  uploadPhoto: {
    tags: ["players"],
    summary: "Faz upload da foto do jogador autenticado",
    security: authSecurity,
    consumes: ["multipart/form-data"],
    description: "Envie o campo multipart `photo` com uma imagem JPG, PNG ou WebP de até 4 MB.",
    response: {
      200: { $ref: "playerProfileEnvelope#" },
      400: { $ref: "messageResponse#" },
      401: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  getCard: {
    tags: ["players"],
    summary: "Retorna a projeção atual do NaBola Card de um jogador visível",
    security: authSecurity,
    response: {
      200: { $ref: "playerCardProjectionEnvelope#" },
      401: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  getInsights: {
    tags: ["players"],
    summary: "Retorna insights v2 de um jogador visivel",
    security: authSecurity,
    response: {
      200: { $ref: "playerInsightsEnvelope#" },
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
      401: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" },
      409: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema
};

export const inviteRouteSchemas = {
  list: {
    tags: ["invites"],
    summary: "Lista convites pendentes do usuario autenticado",
    security: authSecurity,
    response: {
      200: { $ref: "invitesEnvelope#" },
      401: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  accept: {
    tags: ["invites"],
    summary: "Aceita um convite por token",
    security: authSecurity,
    response: {
      200: { $ref: "inviteAcceptEnvelope#" },
      400: { $ref: "messageResponse#" },
      401: { $ref: "messageResponse#" },
      403: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" },
      409: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  revoke: {
    tags: ["invites"],
    summary: "Revoga um convite pendente",
    security: authSecurity,
    response: {
      200: { $ref: "inviteEnvelope#" },
      401: { $ref: "messageResponse#" },
      403: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" },
      409: { $ref: "messageResponse#" }
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

export const locationRouteSchemas = {
  reverse: {
    tags: ["locations"],
    summary: "Resolve cidade e UF a partir de coordenadas do navegador",
    security: authSecurity,
    querystring: { $ref: "locationReverseQuery#" },
    response: {
      200: { $ref: "locationEnvelope#" },
      401: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  search: {
    tags: ["locations"],
    summary: "Busca locais/cidades usando OpenStreetMap Nominatim",
    security: authSecurity,
    querystring: { $ref: "locationSearchQuery#" },
    response: {
      200: { $ref: "locationsEnvelope#" },
      401: { $ref: "messageResponse#" }
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
  get: {
    tags: ["tournaments"],
    summary: "Detalha um campeonato visivel",
    security: authSecurity,
    response: {
      200: { $ref: "tournamentEnvelope#" },
      401: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" }
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
  } satisfies FastifySchema,
  update: {
    tags: ["tournaments"],
    summary: "Atualiza dados basicos do campeonato",
    security: authSecurity,
    body: { $ref: "updateTournamentInput#" },
    response: {
      200: { $ref: "tournamentEnvelope#" },
      400: { $ref: "messageResponse#" },
      401: { $ref: "messageResponse#" },
      403: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  addTeams: {
    tags: ["tournaments"],
    summary: "Adiciona times antes de partidas concluidas",
    security: authSecurity,
    body: { $ref: "updateTournamentTeamsInput#" },
    response: {
      200: { $ref: "tournamentEnvelope#" },
      400: { $ref: "messageResponse#" },
      401: { $ref: "messageResponse#" },
      403: { $ref: "messageResponse#" },
      409: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  removeTeam: {
    tags: ["tournaments"],
    summary: "Remove time antes de partidas concluidas",
    security: authSecurity,
    response: {
      200: { $ref: "tournamentEnvelope#" },
      400: { $ref: "messageResponse#" },
      401: { $ref: "messageResponse#" },
      403: { $ref: "messageResponse#" },
      409: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  generateRounds: {
    tags: ["tournaments"],
    summary: "Gera rodadas simples para campeonato liga",
    security: authSecurity,
    response: {
      200: { $ref: "tournamentEnvelope#" },
      401: { $ref: "messageResponse#" },
      403: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema
};

export const rankingRouteSchemas = {
  players: {
    tags: ["rankings"],
    summary: "Ranking real de jogadores por estatisticas e heuristica NaBola Card",
    security: authSecurity,
    querystring: { $ref: "playerRankingQuery#" },
    response: {
      200: { $ref: "playerRankingsEnvelope#" },
      401: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  tournamentScorers: {
    tags: ["rankings"],
    summary: "Artilharia de um campeonato",
    security: authSecurity,
    response: {
      200: { $ref: "playerRankingsEnvelope#" },
      401: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  tournamentAssists: {
    tags: ["rankings"],
    summary: "Ranking de assistencias de um campeonato",
    security: authSecurity,
    response: {
      200: { $ref: "playerRankingsEnvelope#" },
      401: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema
};

export const matchRouteSchemas = {
  list: {
    tags: ["matches"],
    summary: "Lista partidas com busca, filtros, escopo e paginacao",
    security: authSecurity,
    querystring: { $ref: "listMatchesQuery#" },
    response: {
      200: { $ref: "matchesEnvelope#" },
      401: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  get: {
    tags: ["matches"],
    summary: "Detalha uma partida visivel ao usuario",
    security: authSecurity,
    response: {
      200: { $ref: "matchEnvelope#" },
      401: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" }
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
  } satisfies FastifySchema,
  listPresences: {
    tags: ["matches"],
    summary: "Lista presencas de uma partida",
    security: authSecurity,
    response: {
      200: { $ref: "matchPresencesEnvelope#" },
      401: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  updateMyPresence: {
    tags: ["matches"],
    summary: "Atualiza a propria presenca em uma partida",
    security: authSecurity,
    body: { $ref: "updatePresenceInput#" },
    response: {
      200: { $ref: "matchPresencesEnvelope#" },
      400: { $ref: "messageResponse#" },
      401: { $ref: "messageResponse#" },
      403: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  updatePresence: {
    tags: ["matches"],
    summary: "Atualiza presenca de um jogador como owner/admin",
    security: authSecurity,
    body: { $ref: "updatePresenceInput#" },
    response: {
      200: { $ref: "matchPresencesEnvelope#" },
      400: { $ref: "messageResponse#" },
      401: { $ref: "messageResponse#" },
      403: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  cancel: {
    tags: ["matches"],
    summary: "Cancela uma partida agendada ou em confirmacao",
    security: authSecurity,
    body: { $ref: "cancelMatchInput#" },
    response: {
      200: { $ref: "matchEnvelope#" },
      400: { $ref: "messageResponse#" },
      401: { $ref: "messageResponse#" },
      403: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" },
      409: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  updateLineup: {
    tags: ["matches"],
    summary: "Define escalacao final da partida",
    security: authSecurity,
    body: { $ref: "updateMatchLineupInput#" },
    response: {
      200: { $ref: "matchEnvelope#" },
      400: { $ref: "messageResponse#" },
      401: { $ref: "messageResponse#" },
      403: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" },
      409: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  checkInMe: {
    tags: ["matches"],
    summary: "Registra check-in do jogador autenticado",
    security: authSecurity,
    response: {
      200: { $ref: "matchEnvelope#" },
      401: { $ref: "messageResponse#" },
      403: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  review: {
    tags: ["matches"],
    summary: "Revisa sumula de uma partida concluida",
    security: authSecurity,
    body: { $ref: "reviewMatchInput#" },
    response: {
      200: { $ref: "matchEnvelope#" },
      400: { $ref: "messageResponse#" },
      401: { $ref: "messageResponse#" },
      403: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" },
      409: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  approveReview: {
    tags: ["matches"],
    summary: "Aprova revisao de sumula",
    security: authSecurity,
    response: {
      200: { $ref: "matchEnvelope#" },
      401: { $ref: "messageResponse#" },
      403: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  disputeReview: {
    tags: ["matches"],
    summary: "Contesta revisao de sumula",
    security: authSecurity,
    response: {
      200: { $ref: "matchEnvelope#" },
      401: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema,
  statsImpact: {
    tags: ["matches"],
    summary: "Retorna impacto estatistico de uma partida",
    security: authSecurity,
    response: {
      200: { $ref: "statsImpactEnvelope#" },
      401: { $ref: "messageResponse#" },
      404: { $ref: "messageResponse#" }
    }
  } satisfies FastifySchema
};

export const auditRouteSchemas = {
  listMine: {
    tags: ["audit"],
    summary: "Lista audit logs do usuario autenticado",
    security: authSecurity,
    response: {
      200: { $ref: "auditLogsEnvelope#" },
      401: { $ref: "messageResponse#" }
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
      publicIdentifier: { type: "string", pattern: "^#[0-9A-F]{6}$" },
      email: { type: "string", format: "email" },
      username: { type: "string" },
      locale: { type: "string", enum: ["pt-BR", "en"] },
      theme: { type: "string", enum: ["light", "dark", "system"] },
      providers: {
        type: "array",
        items: { type: "string", enum: ["credentials", "google"] }
      },
      platformRole: { type: "string", enum: ["user", "admin"] }
    },
    required: ["id", "publicIdentifier", "email", "username", "locale", "theme", "providers", "platformRole"]
  },
  {
    $id: "playerProfile",
    type: "object",
    properties: {
      userId: id,
      displayName: { type: "string" },
      shirtNumber: { type: "integer", minimum: 1, maximum: 99 },
      photoUrl: { type: "string", description: "URL absoluta ou caminho interno /uploads/..." },
      photoMetadata: {
        type: "object",
        properties: {
          fileName: { type: "string" },
          mimeType: { type: "string", enum: ["image/jpeg", "image/png", "image/webp"] },
          size: { type: "integer", minimum: 1 },
          uploadedAt: isoDate
        },
        required: ["fileName", "mimeType", "size", "uploadedAt"]
      },
      primaryTeamId: id,
      teamName: { type: "string", minLength: 2, maxLength: 40 },
      preferredFoot: { type: "string", enum: ["right", "left", "both"] },
      preferredPosition: { type: "string", enum: ["goalkeeper", "right-back", "center-back", "left-back", "defensive-midfielder", "central-midfielder", "attacking-midfielder", "right-winger", "left-winger", "striker"] },
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
      username: { type: "string", minLength: 3, maxLength: 20 },
      role: { type: "string", enum: ["owner", "admin", "captain", "member", "guest"] },
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
      joinPolicy: { type: "string", enum: ["closed", "request"] },
      description: { type: "string", maxLength: 240 },
      logoUrl: { type: "string" },
      logoMetadata: {
        type: "object", properties: { fileName: { type: "string" }, mimeType: { type: "string", enum: ["image/jpeg", "image/png", "image/webp"] }, size: { type: "integer" }, uploadedAt: isoDate }, required: ["fileName", "mimeType", "size", "uploadedAt"]
      },
      city: { type: "string" },
      state: { type: "string", minLength: 2, maxLength: 2 },
      latitude: { type: "number" },
      longitude: { type: "number" },
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
      recipientUserId: id,
      recipientPublicIdentifier: { type: "string", pattern: "^#[0-9A-F]{6}$" },
      email: { type: "string", format: "email" },
      role: { type: "string", enum: ["admin", "captain", "member"] },
      status: { type: "string", enum: ["pending", "accepted", "revoked"] },
      invitedBy: id,
      token: { type: "string" },
      expiresAt: isoDate,
      createdAt: isoDate
    },
    required: ["id", "resourceType", "resourceId", "role", "status", "invitedBy", "createdAt"]
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
      type: {
        type: "string",
        enum: [
          "invite-created",
          "invite-accepted",
          "match-scheduled",
          "match-completed",
          "match-cancelled",
          "presence-updated",
          "team-member-added",
          "tournament-updated"
        ]
      },
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
    $id: "matchPresence",
    type: "object",
    properties: {
      userId: id,
      status: { type: "string", enum: ["pending", "confirmed", "declined", "maybe"] },
      updatedAt: isoDate,
      updatedBy: id
    },
    required: ["userId", "status", "updatedAt", "updatedBy"]
  },
  {
    $id: "matchLineup",
    type: "object",
    properties: {
      homePlayerIds: { type: "array", items: id },
      awayPlayerIds: { type: "array", items: id },
      updatedAt: isoDate,
      updatedBy: id
    },
    required: ["homePlayerIds", "awayPlayerIds", "updatedAt", "updatedBy"]
  },
  {
    $id: "matchCheckIn",
    type: "object",
    properties: {
      userId: id,
      checkedInAt: isoDate
    },
    required: ["userId", "checkedInAt"]
  },
  {
    $id: "matchVenue",
    type: "object",
    properties: {
      name: { type: "string", minLength: 2, maxLength: 80 },
      address: { type: "string", minLength: 2, maxLength: 120 },
      city: { type: "string", minLength: 2, maxLength: 80 },
      state: { type: "string", minLength: 2, maxLength: 2 },
      surface: { type: "string", enum: ["grass", "synthetic", "court", "sand", "other"] },
      latitude: { type: "number", minimum: -90, maximum: 90 },
      longitude: { type: "number", minimum: -180, maximum: 180 }
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
      postalCode: { type: "string", pattern: "^\\d{5}-?\\d{3}$" },
      addressNumber: { type: "string" },
      city: { type: "string" },
      state: { type: "string" },
      surface: { type: "string", enum: ["grass", "synthetic", "court", "sand", "other"] },
      latitude: { type: "number", minimum: -90, maximum: 90 },
      longitude: { type: "number", minimum: -180, maximum: 180 },
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
      status: { type: "string", enum: ["scheduled", "confirming", "completed", "cancelled"] },
      createdBy: id,
      home: { $ref: "matchSide#" },
      away: { $ref: "matchSide#" },
      eventLog: {
        type: "array",
        items: { $ref: "matchEvent#" }
      },
      presences: {
        type: "array",
        items: { $ref: "matchPresence#" }
      },
      lineup: { $ref: "matchLineup#" },
      checkIns: {
        type: "array",
        items: { $ref: "matchCheckIn#" }
      },
      reviewStatus: { type: "string", enum: ["none", "pending", "approved", "disputed"] },
      eventLogVersion: { type: "integer", minimum: 1 },
      durationMinutes: { type: "integer", minimum: 1, maximum: 180 },
      venueId: id,
      venue: { $ref: "matchVenue#" },
      tournamentId: id,
      cancelledAt: isoDate,
      cancelledBy: id,
      cancelReason: { type: "string", maxLength: 180 },
      playedAt: isoDate,
      createdAt: isoDate,
      updatedAt: isoDate
    },
    required: ["id", "type", "status", "createdBy", "home", "away", "eventLog", "presences", "checkIns", "reviewStatus", "eventLogVersion", "playedAt", "createdAt", "updatedAt"]
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
    $id: "tournamentRoundPairing",
    type: "object",
    properties: {
      homeTeamId: id,
      awayTeamId: id,
      matchId: id
    },
    required: ["homeTeamId", "awayTeamId"]
  },
  {
    $id: "tournamentRound",
    type: "object",
    properties: {
      round: { type: "integer", minimum: 1 },
      pairings: {
        type: "array",
        items: { $ref: "tournamentRoundPairing#" }
      },
      createdAt: isoDate
    },
    required: ["round", "pairings", "createdAt"]
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
      rounds: {
        type: "array",
        items: { $ref: "tournamentRound#" }
      },
      standings: {
        type: "array",
        items: { $ref: "tournamentStanding#" }
      },
      createdAt: isoDate,
      updatedAt: isoDate
    },
    required: ["id", "name", "slug", "ownerId", "format", "visibility", "teamIds", "matchIds", "rounds", "standings", "createdAt", "updatedAt"]
  },
  {
    $id: "signUpInput",
    type: "object",
    properties: {
      email: { type: "string", format: "email" },
      username: { type: "string", minLength: 3, maxLength: 20, pattern: "^[A-Za-z0-9_]+$" },
      password: { type: "string", minLength: 8, maxLength: 72, pattern: "^(?=.*[A-Za-z])(?=.*\\d).+$" },
      locale: { type: "string", enum: ["pt-BR", "en"] }
    },
    required: ["email", "username", "password"]
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
    $id: "csrfResponse",
    type: "object",
    properties: {
      csrfToken: { type: "string" }
    },
    required: ["csrfToken"]
  },
  {
    $id: "sessionSummary",
    type: "object",
    properties: {
      id,
      createdAt: isoDate,
      expiresAt: isoDate,
      lastSeenAt: isoDate,
      revokedAt: isoDate,
      current: { type: "boolean" }
    },
    required: ["id", "createdAt", "expiresAt", "current"]
  },
  {
    $id: "sessionsEnvelope",
    type: "object",
    properties: {
      sessions: {
        type: "array",
        items: { $ref: "sessionSummary#" }
      }
    },
    required: ["sessions"]
  },
  {
    $id: "updateProfileInput",
    type: "object",
    properties: {
      displayName: { type: "string", minLength: 2, maxLength: 40 },
      shirtNumber: { type: "integer", minimum: 1, maximum: 99, nullable: true },
      photoUrl: { type: "string", maxLength: 500, nullable: true, description: "URL absoluta ou caminho interno /uploads/..." },
      primaryTeamId: { ...id, nullable: true },
      preferredFoot: { type: "string", enum: ["right", "left", "both"] },
      preferredPosition: { type: "string", enum: ["goalkeeper", "right-back", "center-back", "left-back", "defensive-midfielder", "central-midfielder", "attacking-midfielder", "right-winger", "left-winger", "striker"] },
      bio: { type: "string", maxLength: 160, nullable: true }
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
      publicIdentifier: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
      role: { type: "string", enum: ["admin", "captain", "member"] }
    },
    required: ["resourceType", "resourceId", "publicIdentifier", "role"]
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
    $id: "listMatchesQuery",
    type: "object",
    properties: {
      scope: { type: "string", enum: ["mine", "nearby"], default: "mine" },
      q: { type: "string", minLength: 1, maxLength: 80 },
      status: { type: "string", enum: ["scheduled", "confirming", "completed", "cancelled"] },
      teamId: id,
      tournamentId: id,
      city: { type: "string", minLength: 2, maxLength: 80 },
      state: { type: "string", minLength: 2, maxLength: 2 },
      latitude: { type: "number", minimum: -90, maximum: 90 },
      longitude: { type: "number", minimum: -180, maximum: 180 },
      radiusKm: { type: "number", minimum: 1, maximum: 100, default: 25 },
      page: { type: "integer", minimum: 1, default: 1 },
      pageSize: { type: "integer", minimum: 1, maximum: 50, default: 10 }
    }
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
    $id: "updatePresenceInput",
    type: "object",
    properties: {
      status: { type: "string", enum: ["pending", "confirmed", "declined", "maybe"] }
    },
    required: ["status"]
  },
  {
    $id: "updateMatchLineupInput",
    type: "object",
    properties: {
      homePlayerIds: { type: "array", items: id, minItems: 1 },
      awayPlayerIds: { type: "array", items: id, minItems: 1 }
    },
    required: ["homePlayerIds", "awayPlayerIds"]
  },
  {
    $id: "reviewMatchInput",
    type: "object",
    properties: {
      homeScore: { type: "integer", minimum: 0 },
      awayScore: { type: "integer", minimum: 0 },
      durationMinutes: { type: "integer", minimum: 1, maximum: 180 },
      venue: { $ref: "matchVenue#" },
      eventLog: {
        type: "array",
        items: { $ref: "matchEvent#" }
      },
      reason: { type: "string", maxLength: 240 }
    },
    required: ["homeScore", "awayScore", "eventLog"]
  },
  {
    $id: "cancelMatchInput",
    type: "object",
    properties: {
      reason: { type: "string", maxLength: 180 }
    }
  },
  {
    $id: "playerRankingQuery",
    type: "object",
    properties: {
      teamId: id,
      tournamentId: id,
      period: { type: "string", enum: ["all", "last-5", "last-10"], default: "all" },
      metric: { type: "string", enum: ["overall", "goals", "assists", "presence", "winning", "form"], default: "overall" }
    }
  },
  {
    $id: "playerCardRatings",
    type: "object",
    properties: {
      ratingVersion: { type: "string", enum: ["v1", "v2"] },
      overall: { type: "integer", minimum: 35, maximum: 99 },
      attack: { type: "integer", minimum: 35, maximum: 99 },
      pass: { type: "integer", minimum: 35, maximum: 99 },
      presence: { type: "integer", minimum: 35, maximum: 99 },
      regularity: { type: "integer", minimum: 35, maximum: 99 },
      winning: { type: "integer", minimum: 35, maximum: 99 },
      form: { type: "integer", minimum: 35, maximum: 99 }
    },
    required: ["ratingVersion", "overall", "attack", "pass", "presence", "regularity", "winning", "form"]
  },
  {
    $id: "playerRankingEntry",
    type: "object",
    properties: {
      playerId: id,
      displayName: { type: "string" },
      stats: { $ref: "stats#" },
      ratings: { $ref: "playerCardRatings#" },
      rank: { type: "integer", minimum: 1 },
      explanation: { type: "string" }
    },
    required: ["playerId", "displayName", "stats", "ratings", "rank", "explanation"]
  },
  {
    $id: "playerFeatureSnapshot",
    type: "object",
    properties: {
      id,
      playerId: id,
      ratingVersion: { type: "string", enum: ["v1", "v2"] },
      teamId: id,
      tournamentId: id,
      matchesPlayed: { type: "integer", minimum: 0 },
      goalsPerMatch: { type: "number", minimum: 0 },
      assistsPerMatch: { type: "number", minimum: 0 },
      presenceRate: { type: "number", minimum: 0 },
      checkInRate: { type: "number", minimum: 0 },
      winRate: { type: "number", minimum: 0 },
      recentFormScore: { type: "number", minimum: 0 },
      impactScore: { type: "number" },
      createdAt: isoDate
    },
    required: ["playerId", "ratingVersion", "matchesPlayed", "goalsPerMatch", "assistsPerMatch", "presenceRate", "winRate", "recentFormScore", "createdAt"]
  },
  {
    $id: "playerCardV2Factor",
    type: "object",
    properties: {
      key: { type: "string" },
      label: { type: "string" },
      value: { type: "number" },
      weight: { type: "number" }
    },
    required: ["key", "label", "value", "weight"]
  },
  {
    $id: "playerCardV2",
    type: "object",
    properties: {
      playerId: id,
      ratingVersion: { type: "string", enum: ["v2"] },
      score: { type: "integer", minimum: 35, maximum: 99 },
      factors: { type: "array", items: { $ref: "playerCardV2Factor#" } },
      explanation: { type: "string" },
      snapshot: { $ref: "playerFeatureSnapshot#" }
    },
    required: ["playerId", "ratingVersion", "score", "factors", "explanation", "snapshot"]
  },
  {
    $id: "playerCardProjection",
    type: "object",
    properties: {
      playerId: id,
      ratingVersion: { type: "string", enum: ["v3"] },
      score: { type: "integer", minimum: 35, maximum: 99 },
      confidence: { type: "string", enum: ["forming", "established"] },
      stats: { $ref: "stats#" },
      factors: { type: "array", items: { type: "object", properties: { key: { type: "string" }, value: { type: "number" }, weight: { type: "number" } }, required: ["key", "value", "weight"] } },
      sourceSignature: { type: "string" },
      updatedAt: isoDate
    },
    required: ["playerId", "ratingVersion", "score", "confidence", "stats", "factors", "sourceSignature", "updatedAt"]
  },
  {
    $id: "playerInsight",
    type: "object",
    properties: {
      type: { type: "string", enum: ["strength", "opportunity", "trend"] },
      title: { type: "string" },
      message: { type: "string" },
      scoreImpact: { type: "number" }
    },
    required: ["type", "title", "message", "scoreImpact"]
  },
  {
    $id: "statsImpact",
    type: "object",
    properties: {
      matchId: id,
      playerImpacts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            playerId: id,
            goals: { type: "integer", minimum: 0 },
            assists: { type: "integer", minimum: 0 },
            checkedIn: { type: "boolean" },
            impactScore: { type: "number" }
          },
          required: ["playerId", "goals", "assists", "checkedIn", "impactScore"]
        }
      },
      teamImpacts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            teamId: id,
            pointsDelta: { type: "integer" },
            goalDifferenceDelta: { type: "integer" }
          },
          required: ["teamId", "pointsDelta", "goalDifferenceDelta"]
        }
      }
    },
    required: ["matchId", "playerImpacts", "teamImpacts"]
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
    $id: "updateTournamentInput",
    type: "object",
    properties: {
      name: { type: "string", minLength: 2, maxLength: 50 },
      visibility: { type: "string", enum: ["private", "public"] }
    }
  },
  {
    $id: "updateTournamentTeamsInput",
    type: "object",
    properties: {
      teamIds: { type: "array", items: id, minItems: 1 }
    },
    required: ["teamIds"]
  },
  {
    $id: "createVenueInput",
    type: "object",
    properties: {
      name: { type: "string", minLength: 2, maxLength: 80 },
      visibility: { type: "string", enum: ["private", "public"], default: "private" },
      address: { type: "string", minLength: 2, maxLength: 180 },
      postalCode: { type: "string", pattern: "^\\d{5}-?\\d{3}$" },
      addressNumber: { type: "string", minLength: 1, maxLength: 20 },
      city: { type: "string", minLength: 2, maxLength: 80 },
      state: { type: "string", minLength: 2, maxLength: 2 },
      surface: { type: "string", enum: ["grass", "synthetic", "court", "sand", "other"], default: "other" },
      latitude: { type: "number", minimum: -90, maximum: 90 },
      longitude: { type: "number", minimum: -180, maximum: 180 },
      contactPhone: { type: "string", minLength: 8, maxLength: 24 },
      prices: {
        type: "object",
        properties: {
          minutes60: { type: "integer", minimum: 0 },
          minutes90: { type: "integer", minimum: 0 },
          minutes120: { type: "integer", minimum: 0 }
        },
        required: ["minutes60", "minutes90", "minutes120"]
      }
    },
    required: ["name", "address", "postalCode", "addressNumber", "city", "state", "contactPhone", "prices"]
  },
  {
    $id: "updateVenueInput",
    type: "object",
    properties: {
      name: { type: "string", minLength: 2, maxLength: 80 },
      visibility: { type: "string", enum: ["private", "public"] },
      address: { type: "string", minLength: 2, maxLength: 180 },
      postalCode: { type: "string", pattern: "^\\d{5}-?\\d{3}$" },
      addressNumber: { type: "string", minLength: 1, maxLength: 20 },
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
    $id: "locationReverseQuery",
    type: "object",
    properties: {
      latitude: { type: "number", minimum: -90, maximum: 90 },
      longitude: { type: "number", minimum: -180, maximum: 180 }
    },
    required: ["latitude", "longitude"]
  },
  {
    $id: "locationSearchQuery",
    type: "object",
    properties: {
      q: { type: "string", minLength: 2, maxLength: 120 },
      limit: { type: "integer", minimum: 1, maximum: 10, default: 5 }
    },
    required: ["q"]
  },
  {
    $id: "locationResult",
    type: "object",
    properties: {
      latitude: { type: "number" },
      longitude: { type: "number" },
      displayName: { type: "string" },
      city: { type: "string" },
      state: { type: "string" },
      country: { type: "string" }
    },
    required: ["latitude", "longitude", "displayName"]
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
    $id: "playerCardEnvelope",
    type: "object",
    properties: {
      card: { $ref: "playerCardV2#" }
    },
    required: ["card"]
  },
  {
    $id: "playerCardProjectionEnvelope",
    type: "object",
    properties: { card: { $ref: "playerCardProjection#" } },
    required: ["card"]
  },
  {
    $id: "playerInsightsEnvelope",
    type: "object",
    properties: {
      insights: {
        type: "array",
        items: { $ref: "playerInsight#" }
      }
    },
    required: ["insights"]
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
    $id: "invitesEnvelope",
    type: "object",
    properties: {
      invites: {
        type: "array",
        items: { $ref: "invite#" }
      }
    },
    required: ["invites"]
  },
  {
    $id: "inviteAcceptEnvelope",
    type: "object",
    properties: {
      invite: { $ref: "invite#" },
      team: { $ref: "team#" }
    },
    required: ["invite", "team"]
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
    $id: "matchPresencesEnvelope",
    type: "object",
    properties: {
      presences: {
        type: "array",
        items: { $ref: "matchPresence#" }
      }
    },
    required: ["presences"]
  },
  {
    $id: "statsImpactEnvelope",
    type: "object",
    properties: {
      impact: { $ref: "statsImpact#" }
    },
    required: ["impact"]
  },
  {
    $id: "matchesEnvelope",
    type: "object",
    properties: {
      matches: {
        type: "array",
        items: { $ref: "match#" }
      },
      pagination: {
        type: "object",
        properties: {
          page: { type: "integer" },
          pageSize: { type: "integer" },
          total: { type: "integer" },
          totalPages: { type: "integer" }
        },
        required: ["page", "pageSize", "total", "totalPages"]
      }
    },
    required: ["matches"]
  },
  {
    $id: "locationEnvelope",
    type: "object",
    properties: {
      location: { $ref: "locationResult#" }
    },
    required: ["location"]
  },
  {
    $id: "locationsEnvelope",
    type: "object",
    properties: {
      locations: {
        type: "array",
        items: { $ref: "locationResult#" }
      }
    },
    required: ["locations"]
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
    $id: "playerRankingsEnvelope",
    type: "object",
    properties: {
      players: {
        type: "array",
        items: { $ref: "playerRankingEntry#" }
      }
    },
    required: ["players"]
  },
  {
    $id: "auditLog",
    type: "object",
    properties: {
      id,
      actorUserId: id,
      action: { type: "string" },
      resourceType: { type: "string" },
      resourceId: id,
      metadata: {
        type: "object",
        additionalProperties: { type: "string" }
      },
      createdAt: isoDate
    },
    required: ["id", "actorUserId", "action", "resourceType", "resourceId", "createdAt"]
  },
  {
    $id: "auditLogsEnvelope",
    type: "object",
    properties: {
      auditLogs: {
        type: "array",
        items: { $ref: "auditLog#" }
      }
    },
    required: ["auditLogs"]
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
      notifications: {
        type: "array",
        items: { $ref: "notification#" }
      }
    },
    required: ["profile", "teams", "matches", "tournaments", "invites", "notifications"]
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
        { name: "invites", description: "Fluxo de convites" },
        { name: "venues", description: "Campos, locais e avaliacoes" },
        { name: "admin", description: "Moderacao da plataforma" },
        { name: "locations", description: "Geocoding e localizacao" },
        { name: "matches", description: "Partidas e encerramento" },
        { name: "tournaments", description: "Campeonatos" },
        { name: "rankings", description: "Rankings, artilharia e heuristica NaBola Card" },
        { name: "notifications", description: "Alertas in-app" },
        { name: "audit", description: "Auditoria protegida" },
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
