# Fluxos de Dominio

Este documento descreve os fluxos principais da API e as regras que precisam continuar verdadeiras durante evolucoes.

## Autenticacao e sessao

```mermaid
sequenceDiagram
  actor U as Usuario
  participant API as Fastify
  participant Auth as authPlugin
  participant Repo as Repositories
  participant Mongo as MongoDB

  U->>API: POST /v1/auth/signup
  API->>Auth: registerWithCredentials()
  Auth->>Repo: users.create()
  Repo->>Mongo: insert users
  Auth->>Repo: playerProfiles.upsert()
  Auth->>Repo: sessions.create()
  API-->>U: user + cookie httpOnly
```

Regras:

- Sessao usa cookie `soccer_stats_session`.
- Cookie e `httpOnly`, assinado, `sameSite=lax`.
- Em producao, cookie usa `secure`.
- `requireUser` valida cookie, sessao, expiracao, revogacao e usuario.
- Sessao registra `userAgent`, `ipHash`, `lastSeenAt` e `revokedAt`.
- `GET /v1/auth/sessions` lista sessoes do usuario.
- `DELETE /v1/auth/sessions/:sessionId` revoga uma sessao.
- `POST /v1/auth/signout-all` revoga as outras sessoes.

## CSRF em mutacoes

```mermaid
sequenceDiagram
  actor U as Usuario
  participant API as Fastify
  participant CSRF as csrf helper

  U->>API: GET /v1/auth/csrf
  API->>CSRF: issue token
  CSRF-->>U: csrfToken + cookie assinado
  U->>API: POST/PUT/PATCH/DELETE com x-csrf-token
  API->>CSRF: valida hash do header contra cookie
  alt Token invalido
    API-->>U: 403
  else Token valido
    API->>API: executa rota
  end
```

Regras:

- Double-submit token para rotas mutaveis sob `/v1`.
- Header exigido: `x-csrf-token`.
- Rotas de signup/signin/google/csrf sao excecoes para permitir bootstrap da sessao.
- O frontend chama `/auth/csrf` automaticamente antes de mutacoes autenticadas.

## Criacao de time

```mermaid
sequenceDiagram
  actor U as Usuario
  participant API as Teams route
  participant Repo as Repositories

  U->>API: POST /v1/teams
  API->>API: valida createTeamInputSchema
  API->>Repo: teams.create()
  Repo-->>API: team
  API-->>U: team
```

Regras:

- Criador vira membro `owner`.
- `visibility` default e `private`.
- `slug` e gerado com sufixo de ID.
- Stats iniciais usam `createEmptyStats()`.

## Convite de time

```mermaid
sequenceDiagram
  actor Admin as Owner/Admin
  participant API as Teams route
  participant Repo as Repositories
  participant Notif as NotificationService

  Admin->>API: POST /v1/teams/invites
  API->>Repo: teams.findById()
  API->>API: verifica owner/admin
  API->>Repo: invites.create()
  API->>Repo: users.findByEmail()
  alt Usuario ja existe
    API->>Notif: create(invite-created)
  end
  API-->>Admin: invite
```

Regras:

- Apenas owner/admin do time pode convidar.
- Convite tem `token` e `expiresAt`.
- Se o e-mail ja pertence a usuario existente, cria notificacao in-app.

## Cadastro e uso de local

```mermaid
flowchart TD
  Start["POST /v1/venues"] --> Validate["Valida createVenueInputSchema"]
  Validate --> Create["Cria venue com ownerId"]
  Create --> Public{"visibility public?"}
  Public --> Save["Salva em venues"]
  Save --> Response["Retorna venue"]

  Use["POST /v1/matches com venueId"] --> Find["Busca venue"]
  Find --> Exists{"Existe?"}
  Exists -- Nao --> BadRequest["400"]
  Exists -- Sim --> CanUse{"Publico ou owner?"}
  CanUse -- Nao --> Forbidden["403"]
  CanUse -- Sim --> Snapshot["Copia snapshot para match.venue"]
```

Regras:

- Local privado so pode ser editado/usado pelo dono.
- Local publico pode ser usado por outros usuarios.
- Partida salva `venueId` e snapshot em `venue`.

## Criacao de partida

```mermaid
sequenceDiagram
  actor Admin as Owner/Admin
  participant API as Matches route
  participant Repo as Repositories
  participant Notif as NotificationService

  Admin->>API: POST /v1/matches
  API->>Repo: teams.findById(home/away)
  API->>API: verifica admin dos dois times
  opt tournamentId
    API->>Repo: tournaments.findById()
    API->>API: valida times no campeonato
  end
  opt venueId
    API->>Repo: venues.findById()
    API->>API: valida visibilidade do local
  end
  API->>Repo: matches.create(status=scheduled)
  API->>Repo: cria presences pending
  API->>Notif: notifyUsers(match-scheduled)
  API-->>Admin: match
```

Regras:

- Criacao exige permissao de owner/admin nos dois times.
- Partida de campeonato precisa ter os dois times no campeonato.
- `eventLog` inicia vazio.
- `presences` inicia com status `pending` para jogadores de `home.playerIds` e `away.playerIds`.
- Notifica membros dos times envolvidos.

## Presenca em partida

```mermaid
sequenceDiagram
  actor Player as Jogador
  actor Admin as Owner/Admin
  participant API as Matches route
  participant Repo as Repositories
  participant Notif as NotificationService

  Player->>API: PUT /v1/matches/:id/presences/me
  API->>Repo: matches.findById()
  API->>API: valida jogador relacionado
  API->>Repo: matches.update(status=confirming, presences)
  API->>Notif: presence-updated para criador

  Admin->>API: PUT /v1/matches/:id/presences/:userId
  API->>API: valida owner/admin de home ou away
  API->>Repo: matches.update(presences)
  API->>Notif: presence-updated para jogador
```

Regras:

- Status possiveis: `pending`, `confirmed`, `declined`, `maybe`.
- Primeira atualizacao muda partida `scheduled` para `confirming`.
- Usuario comum so altera a propria presenca.
- Owner/admin pode alterar presenca de jogador relacionado a partida.

## Cancelamento de partida

```mermaid
flowchart TD
  Request["POST /v1/matches/:matchId/cancel"] --> Auth["requireUser"]
  Auth --> Find["Busca partida"]
  Find --> Completed{"Ja completed?"}
  Completed -- Sim --> Conflict["409"]
  Completed -- Nao --> Role{"Owner/admin em home ou away?"}
  Role -- Nao --> Forbidden["403"]
  Role -- Sim --> Update["status=cancelled + cancelledAt/by/reason"]
  Update --> Notify["match-cancelled para membros"]
  Notify --> Audit["audit_logs match.cancel"]
```

Regras:

- Partida concluida nao pode ser cancelada.
- Partida cancelada nao pode ser encerrada depois.

## Encerramento de partida

```mermaid
sequenceDiagram
  actor Admin as Owner/Admin
  participant API as Matches route
  participant Repo as Repositories
  participant Stats as stats-service
  participant Notif as NotificationService

  Admin->>API: POST /v1/matches/complete
  API->>Repo: matches.findById()
  API->>API: bloqueia se ja completed
  API->>API: bloqueia se cancelled
  API->>Repo: teams.findById(home/away)
  API->>API: verifica admin dos dois times
  API->>Stats: validateMatchEventLog()
  API->>Stats: validateScoreAgainstGoalEvents()
  alt Sumula invalida
    API-->>Admin: 400
  else Sumula valida
    API->>Repo: matches.update(completed)
    API->>Stats: calculateTeamStats()
    API->>Repo: teams.update()
    API->>Stats: calculatePlayerStats()
    API->>Repo: playerProfiles.upsert()
    opt tournamentId
      API->>Stats: calculateStandings()
      API->>Repo: tournaments.update()
      API->>Notif: notifyUsers(tournament-updated)
    end
    API->>Notif: notifyUsers(match-completed)
    API-->>Admin: match
  end
```

Regras:

- Partida concluida nao pode ser encerrada novamente.
- Partida cancelada nao pode ser encerrada.
- Sumula rejeita jogador fora da partida, time fora da partida, minuto maior que `durationMinutes` e assistente igual ao autor.
- Placar final deve bater com a quantidade de eventos `goal` por time.
- Stats de time usam placar.
- Stats de jogador usam participacao + eventos de gol/assistencia.
- Standings de campeonato sao recalculados quando a partida pertence a campeonato.

## Calculo de stats

```mermaid
flowchart TB
  Completed["Partidas completed"] --> TeamStats["calculateTeamStats"]
  Completed --> PlayerStats["calculatePlayerStats"]
  Completed --> Standings["calculateStandings"]
  Presences["matches.presences"] --> Rankings["rankings/players"]

  TeamStats --> TeamCache["teams.stats"]
  PlayerStats --> PlayerCache["player_profiles.stats"]
  Standings --> TournamentCache["tournaments.standings"]

  PlayerStats --> Card["NaBola Card ratings v1 no shared"]
  Rankings --> Card
```

Fonte de verdade:

- Times: partidas concluidas em que o time esta em `home` ou `away`.
- Jogadores: partidas concluidas em que o usuario esta em `playerIds`.
- Gols: eventos `goal`.
- Assistencias: eventos `assist` ou `goal.assistPlayerId`.
- Campeonatos: partidas concluidas do `tournamentId`.
- Ranking considera stats reais, presenca confirmada e `ratingVersion = v1`.

## Rankings e heuristica

```mermaid
flowchart LR
  Matches["matches completed"] --> PlayerStats["calculatePlayerStats"]
  Presences["matches.presences"] --> PresenceRate["presenceRate"]
  PlayerStats --> Snapshot["buildPlayerFeatureSnapshot"]
  PresenceRate --> Snapshot
  PlayerStats --> Ratings["buildPlayerCardRatings v1"]
  Ratings --> Ranking["GET /v1/rankings/players"]
  Ranking --> Scorers["/tournaments/:id/scorers"]
  Ranking --> Assists["/tournaments/:id/assists"]
```

Metricas:

- `overall`
- `goals`
- `assists`
- `presence`
- `winning`
- `form`

Observacao: ML real ainda nao foi implementado. O backend ja gera snapshot de features para preparar dataset futuro.

## Notificacoes

```mermaid
flowchart LR
  Invite["invite-created"] --> Notifications["notifications"]
  Accepted["invite-accepted"] --> Notifications
  Scheduled["match-scheduled"] --> Notifications
  Completed["match-completed"] --> Notifications
  Cancelled["match-cancelled"] --> Notifications
  Presence["presence-updated"] --> Notifications
  Member["team-member-added"] --> Notifications
  Tournament["tournament-updated"] --> Notifications
  Notifications --> List["GET /v1/notifications"]
  List --> Read["PATCH /v1/notifications/:id/read"]
  List --> ReadAll["POST /v1/notifications/read-all"]
```

Regras:

- Notificacoes sao in-app.
- `readAt` ausente significa nao lida.
- `metadata` guarda IDs relacionados como `teamId`, `matchId`, `tournamentId`, `inviteId`.

## Visibilidade e permissao

```mermaid
flowchart TD
  Request["Request autenticado"] --> Resource{"Recurso existe?"}
  Resource -- Nao --> NotFound["404"]
  Resource -- Sim --> Public{"visibility=public?"}
  Public -- Sim --> Read["Leitura permitida"]
  Public -- Nao --> Linked{"Usuario vinculado?"}
  Linked -- Sim --> Read
  Linked -- Nao --> Owner{"owner/admin?"}
  Owner -- Sim --> Write["Escrita permitida"]
  Owner -- Nao --> Deny["403 ou 404"]
```

Convencoes:

- Para leitura de recurso privado inexistente/sem acesso, preferir `404` quando nao quiser revelar existencia.
- Para acao administrativa sem permissao, usar `403`.
- Rotas autenticadas chamam `app.auth.requireUser`.
