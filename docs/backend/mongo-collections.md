# Collections MongoDB

Fonte de verdade atual dos schemas Mongoose: `apps/api/src/repositories/mongo.ts`.

O dominio TypeScript/Zod compartilhado fica em `packages/shared/src/domain.ts` e `packages/shared/src/contracts.ts`.

## ERD das collections

```mermaid
erDiagram
  USERS ||--|| PLAYER_PROFILES : owns
  USERS ||--o{ SESSIONS : has
  USERS ||--o{ TEAMS : owns
  USERS ||--o{ VENUES : owns
  USERS ||--o{ NOTIFICATIONS : receives
  USERS ||--o{ INVITES : sends

  TEAMS ||--o{ TEAM_MEMBERS : embeds
  TEAMS ||--o{ MATCHES : home_or_away
  TEAMS ||--o{ TOURNAMENTS : participates

  VENUES ||--o{ MATCHES : referenced_by
  TOURNAMENTS ||--o{ MATCHES : contains
  TOURNAMENTS ||--o{ TOURNAMENT_STANDINGS : embeds

  USERS {
    string _id
    string email
    string username
    string locale
    string theme
    string[] providers
    string passwordHash
    string createdAt
    string updatedAt
  }

  PLAYER_PROFILES {
    string _id
    string userId
    string displayName
    number shirtNumber
    string photoUrl
    string preferredFoot
    string preferredPosition
    object stats
  }

  TEAMS {
    string _id
    string name
    string slug
    string ownerId
    string visibility
    string city
    string state
    object[] members
    object stats
  }

  VENUES {
    string _id
    string name
    string slug
    string ownerId
    string visibility
    string address
    string city
    string state
    string surface
  }

  MATCHES {
    string _id
    string type
    string status
    string createdBy
    object home
    object away
    object[] eventLog
    string venueId
    object venue
    string tournamentId
    string playedAt
  }

  TOURNAMENTS {
    string _id
    string name
    string slug
    string ownerId
    string format
    string visibility
    string[] teamIds
    string[] matchIds
    object[] standings
  }

  INVITES {
    string _id
    string resourceType
    string resourceId
    string email
    string role
    string status
    string invitedBy
    string token
    string expiresAt
  }

  NOTIFICATIONS {
    string _id
    string userId
    string type
    string title
    string message
    object metadata
    string readAt
  }

  SESSIONS {
    string _id
    string userId
    string expiresAt
    string createdAt
  }
```

## Subdocumentos compartilhados

### `stats`

Usado em `teams.stats`, `player_profiles.stats` e `tournaments.standings.stats`.

```mermaid
classDiagram
  class AggregatedStats {
    number matchesPlayed
    number wins
    number draws
    number losses
    number goals
    number assists
    number saves
    number cleanSheets
    number goalDifference
    number points
    number winRate
    number goalsPerMatch
    string[] form
    string recentHighlight
  }
```

Regras:

- `matchesPlayed`, `wins`, `draws`, `losses`, `goals`, `assists`, `saves`, `cleanSheets`, `points`, `winRate`, `goalsPerMatch` nao podem ser negativos.
- `form` aceita apenas `W`, `D`, `L`.
- Campos derivados como `winRate` e `goalsPerMatch` sao calculados por `packages/shared/src/stats.ts`.

### `membership`

Embutido em `teams.members`.

```mermaid
classDiagram
  class Membership {
    string userId
    "owner|admin|member" role
    string joinedAt
  }
```

### `matchSide`

Embutido em `matches.home` e `matches.away`.

```mermaid
classDiagram
  class MatchSide {
    string teamId
    number score
    string[] playerIds
  }
```

### `matchEvent`

Embutido em `matches.eventLog`.

```mermaid
classDiagram
  class MatchEvent {
    number minute
    "goal|assist|yellow-card|red-card" type
    string playerId
    string teamId
    string assistPlayerId
  }
```

Regras:

- `minute` vai de `0` a `130`.
- Gols oficiais para stats saem de eventos `type = goal`.
- Assistencias podem vir de evento `assist` ou de `goal.assistPlayerId`.
- O placar de encerramento deve bater com os eventos de gol.

### `matchVenue`

Snapshot embutido em `matches.venue`.

```mermaid
classDiagram
  class MatchVenue {
    string name
    string address
    string city
    string state
    "grass|synthetic|court|sand|other" surface
  }
```

Motivo do snapshot: preservar o historico da partida caso o cadastro do local seja editado depois.

## Collections

### `users`

Armazena usuarios autenticaveis.

Campos:

| Campo | Tipo | Obrigatorio | Observacao |
|---|---|---:|---|
| `_id` | string | Sim | ID de dominio |
| `email` | string | Sim | Unico |
| `username` | string | Sim | Unico |
| `locale` | `pt-BR | en` | Sim | Preferencia |
| `theme` | `light | dark | system` | Sim | Preferencia |
| `providers` | array | Sim | `credentials` e/ou `google` |
| `passwordHash` | string | Nao | Apenas para credentials |
| `createdAt` | string ISO | Sim | Data de criacao |
| `updatedAt` | string ISO | Sim | Data de atualizacao |

Indices:

- `email` unico.
- `username` unico.

### `player_profiles`

Perfil esportivo do usuario.

Campos:

| Campo | Tipo | Obrigatorio | Observacao |
|---|---|---:|---|
| `_id` | string | Sim | Igual ao `userId` |
| `userId` | string | Sim | Unico |
| `displayName` | string | Sim | Nome publico |
| `shirtNumber` | number | Nao | Camisa |
| `photoUrl` | string | Nao | URL ou `/uploads/...` |
| `teamName` | string | Nao | Texto livre |
| `preferredFoot` | enum | Sim | `right`, `left`, `both` |
| `preferredPosition` | enum | Sim | `goalkeeper`, `defender`, `midfielder`, `forward` |
| `bio` | string | Nao | Curta |
| `stats` | object | Sim | `AggregatedStats` |

Indices:

- `userId` unico.

### `teams`

Times locais, publicos ou privados.

Campos:

| Campo | Tipo | Obrigatorio | Observacao |
|---|---|---:|---|
| `_id` | string | Sim | ID de dominio |
| `name` | string | Sim | Nome do time |
| `slug` | string | Sim | Unico |
| `ownerId` | string | Sim | Dono |
| `visibility` | enum | Sim | `private` ou `public` |
| `city` | string | Nao | Localidade |
| `state` | string | Nao | UF |
| `members` | array | Sim | `Membership[]` |
| `stats` | object | Sim | `AggregatedStats` |
| `createdAt` | string ISO | Sim | Data de criacao |
| `updatedAt` | string ISO | Sim | Data de atualizacao |

Indices:

- `slug` unico.
- `ownerId`.
- `visibility`.
- `members.userId`.

### `venues`

Locais/estadios cadastrados.

Campos:

| Campo | Tipo | Obrigatorio | Observacao |
|---|---|---:|---|
| `_id` | string | Sim | ID de dominio |
| `name` | string | Sim | Nome do local |
| `slug` | string | Sim | Unico |
| `ownerId` | string | Sim | Dono |
| `visibility` | enum | Sim | `private` ou `public` |
| `address` | string | Nao | Endereco livre |
| `city` | string | Sim | Cidade |
| `state` | string | Sim | UF |
| `surface` | enum | Sim | `grass`, `synthetic`, `court`, `sand`, `other` |
| `createdAt` | string ISO | Sim | Data de criacao |
| `updatedAt` | string ISO | Sim | Data de atualizacao |

Indices:

- `slug` unico.
- `ownerId`.
- `visibility`.
- `city`.
- `state`.
- composto `{ city: 1, state: 1, visibility: 1 }`.

### `matches`

Partidas casuais ou de campeonato.

Campos:

| Campo | Tipo | Obrigatorio | Observacao |
|---|---|---:|---|
| `_id` | string | Sim | ID de dominio |
| `type` | enum | Sim | `casual` ou `tournament` |
| `status` | enum | Sim | `scheduled` ou `completed` |
| `createdBy` | string | Sim | Usuario que criou |
| `home` | object | Sim | `MatchSide` |
| `away` | object | Sim | `MatchSide` |
| `eventLog` | array | Sim | Sumula |
| `durationMinutes` | number | Nao | Duracao |
| `venueId` | string | Nao | Referencia a `venues` |
| `venue` | object | Nao | Snapshot do local |
| `tournamentId` | string | Nao | Referencia a `tournaments` |
| `playedAt` | string ISO | Sim | Data/hora do jogo |
| `createdAt` | string ISO | Sim | Data de criacao |
| `updatedAt` | string ISO | Sim | Data de atualizacao |

Indices:

- `status`.
- `venueId`.
- `tournamentId`.
- `playedAt`.
- `home.teamId`.
- `away.teamId`.

### `tournaments`

Campeonatos locais.

Campos:

| Campo | Tipo | Obrigatorio | Observacao |
|---|---|---:|---|
| `_id` | string | Sim | ID de dominio |
| `name` | string | Sim | Nome |
| `slug` | string | Sim | Unico |
| `ownerId` | string | Sim | Criador |
| `format` | enum | Sim | Hoje apenas `league` |
| `visibility` | enum | Sim | `private` ou `public` |
| `teamIds` | string[] | Sim | Times participantes |
| `matchIds` | string[] | Sim | Partidas concluidas/associadas |
| `standings` | array | Sim | Tabela cacheada |
| `createdAt` | string ISO | Sim | Data de criacao |
| `updatedAt` | string ISO | Sim | Data de atualizacao |

Indices:

- `slug` unico.
- `ownerId`.
- `visibility`.
- `teamIds`.

### `invites`

Convites para times ou campeonatos.

Campos:

| Campo | Tipo | Obrigatorio | Observacao |
|---|---|---:|---|
| `_id` | string | Sim | ID de dominio |
| `resourceType` | enum | Sim | `team` ou `tournament` |
| `resourceId` | string | Sim | Recurso alvo |
| `email` | string | Sim | Convidado |
| `role` | enum | Sim | `admin` ou `member` |
| `status` | enum | Sim | `pending`, `accepted`, `revoked` |
| `invitedBy` | string | Sim | Usuario que convidou |
| `token` | string | Nao | Token para aceite futuro |
| `expiresAt` | string ISO | Nao | Expiracao |
| `createdAt` | string ISO | Sim | Data de criacao |

Indices:

- `resourceId`.
- `email`.
- `status`.
- `token`.

### `notifications`

Notificacoes in-app.

Campos:

| Campo | Tipo | Obrigatorio | Observacao |
|---|---|---:|---|
| `_id` | string | Sim | ID de dominio |
| `userId` | string | Sim | Destinatario |
| `type` | enum | Sim | Tipo de evento |
| `title` | string | Sim | Titulo curto |
| `message` | string | Sim | Mensagem |
| `metadata` | map string-string | Nao | IDs relacionados |
| `readAt` | string ISO | Nao | Ausente = nao lida |
| `createdAt` | string ISO | Sim | Data de criacao |

Tipos:

- `invite-created`
- `match-scheduled`
- `match-completed`
- `tournament-updated`

Indices:

- `userId`.
- `createdAt`.
- composto `{ userId: 1, readAt: 1, createdAt: -1 }`.

### `sessions`

Sessoes de usuario.

Campos:

| Campo | Tipo | Obrigatorio | Observacao |
|---|---|---:|---|
| `_id` | string | Sim | ID da sessao |
| `userId` | string | Sim | Usuario |
| `expiresAt` | string ISO | Sim | Expiracao |
| `createdAt` | string ISO | Sim | Criacao |

Indices:

- `userId`.
- `expiresAt`.

Observacao: a expiracao tambem e validada pela API em `authPlugin.requireUser`.

## Estrategia de IDs

O backend usa IDs string gerados por `createId()` em `apps/api/src/lib/ids.ts`. No Mongo, esse ID e salvo como `_id`; ao retornar para o dominio, o repository converte `_id` para `id`.

```mermaid
flowchart LR
  Domain["Domain object id"] --> Persisted["Mongo _id"]
  Persisted --> Repository["Repository normalize"]
  Repository --> Response["API response id"]
```

## Quando criar nova collection

Crie uma collection propria quando:

- o volume esperado for alto.
- o documento crescer sem limite claro.
- houver necessidade de consultar por esse item diretamente.
- houver lifecycle independente do aggregate pai.

Mantenha subdocumento embutido quando:

- o dado depende totalmente do documento pai.
- o volume e pequeno/controlado.
- a consulta principal sempre carrega o pai.

Exemplos atuais:

- `matches.eventLog` fica embutido por simplicidade.
- `matches.venue` e snapshot embutido para historico.
- `venues` e collection porque locais sao reutilizaveis.
