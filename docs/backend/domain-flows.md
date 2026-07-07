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
- `requireUser` valida cookie, sessao, expiracao e usuario.

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
  API->>Notif: notifyUsers(match-scheduled)
  API-->>Admin: match
```

Regras:

- Criacao exige permissao de owner/admin nos dois times.
- Partida de campeonato precisa ter os dois times no campeonato.
- `eventLog` inicia vazio.
- Notifica membros dos times envolvidos.

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
  API->>Repo: teams.findById(home/away)
  API->>API: verifica admin dos dois times
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

  TeamStats --> TeamCache["teams.stats"]
  PlayerStats --> PlayerCache["player_profiles.stats"]
  Standings --> TournamentCache["tournaments.standings"]

  PlayerStats --> Card["NaBola Card ratings no shared"]
```

Fonte de verdade:

- Times: partidas concluidas em que o time esta em `home` ou `away`.
- Jogadores: partidas concluidas em que o usuario esta em `playerIds`.
- Gols: eventos `goal`.
- Assistencias: eventos `assist` ou `goal.assistPlayerId`.
- Campeonatos: partidas concluidas do `tournamentId`.

## Notificacoes

```mermaid
flowchart LR
  Invite["invite-created"] --> Notifications["notifications"]
  Scheduled["match-scheduled"] --> Notifications
  Completed["match-completed"] --> Notifications
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
