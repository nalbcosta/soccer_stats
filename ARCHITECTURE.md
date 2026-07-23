# Arquitetura NaBola

Este documento descreve a arquitetura atual do monorepo NaBola e os principais fluxos de dados entre frontend, backend, pacote compartilhado e MongoDB.

## Visao geral

```mermaid
flowchart TB
  subgraph Client["Cliente"]
    Browser["Browser / Mobile Web"]
  end

  subgraph Web["apps/web"]
    Next["Next.js 16 App Router"]
    Components["Componentes React"]
    ApiClient["lib/api.ts"]
  end

  subgraph Shared["packages/shared"]
    Domain["Tipos de dominio"]
    Contracts["Schemas Zod"]
    Stats["Regras de stats e card"]
  end

  subgraph Api["apps/api"]
    Fastify["Fastify app"]
    Routes["Routes / Controllers"]
    Services["Services de dominio"]
    Repos["Repositories"]
    OpenAPI["OpenAPI /docs"]
  end

  subgraph Data["Dados"]
    Mongo[("MongoDB")]
    Uploads["uploads/"]
  end

  Browser --> Next
  Next --> Components
  Components --> ApiClient
  ApiClient --> Fastify
  Next --> Shared
  Fastify --> Routes
  Routes --> Services
  Services --> Repos
  Repos --> Mongo
  Fastify --> OpenAPI
  Fastify --> Uploads
  Api --> Shared
```

## Camadas

```mermaid
flowchart LR
  UI["UI Components"] --> ApiClient["API Client"]
  ApiClient --> Routes["Fastify Routes"]
  Routes --> Controllers["Controllers"]
  Controllers --> Services["Domain Services"]
  Services --> Repositories["Repositories"]
  Repositories --> Models["Mongoose Models"]
  Models --> Mongo[("MongoDB")]
  Services --> SharedRules["Shared rules"]
```

Responsabilidades:

- `apps/web`: experiencia do usuario, formularios, navegacao e consumo da API.
- `apps/api`: autenticacao, autorizacao, regras de negocio, OpenAPI e persistencia.
- `packages/shared`: contratos, tipos e regras puras reaproveitadas por web e API.
- MongoDB: fonte persistente de usuarios, sessoes, times, partidas, locais, campeonatos e notificacoes.

## Modulos da API

```mermaid
flowchart TB
  App["createApp"] --> Auth["auth plugin"]
  App --> Routes["/v1 routes"]

  Routes --> AuthRoutes["auth"]
  Routes --> PlayerRoutes["players"]
  Routes --> TeamRoutes["teams"]
  Routes --> VenueRoutes["venues"]
  Routes --> MatchRoutes["matches"]
  Routes --> TournamentRoutes["tournaments"]
  Routes --> NotificationRoutes["notifications"]
  Routes --> DashboardRoutes["dashboard"]

  TeamRoutes --> NotificationService["NotificationService"]
  MatchRoutes --> MatchService["Match helpers"]
  MatchRoutes --> StatsService["Stats service"]
  MatchRoutes --> NotificationService
  VenueRoutes --> VenueService["VenueService"]
  TournamentRoutes --> StatsService
```

Padrao recomendado para novos dominios:

```text
apps/api/src/modules/<domain>/
|- <domain>.routes.ts
|- <domain>.controller.ts
|- <domain>.service.ts
|- <domain>.schemas.ts
|- <domain>.model.ts
|- <domain>.repository.ts
```

Nem todo modulo precisa ter todos os arquivos no inicio. A regra pratica: handlers ficam finos; regra de negocio vai para service; persistencia fica atras de repository/model.

## Persistencia

```mermaid
erDiagram
  USER ||--|| PLAYER_PROFILE : has
  USER ||--o{ SESSION : owns
  USER ||--o{ TEAM : owns
  USER ||--o{ VENUE : owns
  USER ||--o{ NOTIFICATION : receives
  TEAM ||--o{ MEMBERSHIP : has
  TEAM ||--o{ MATCH : plays
  VENUE ||--o{ MATCH : hosts
  TOURNAMENT ||--o{ MATCH : contains
  TOURNAMENT ||--o{ TOURNAMENT_STANDING : has
  INVITE }o--|| TEAM : targets

  USER {
    string id
    string email
    string username
    string locale
    string theme
  }

  TEAM {
    string id
    string name
    string slug
    string ownerId
    string visibility
    string city
    string state
  }

  VENUE {
    string id
    string name
    string slug
    string ownerId
    string visibility
    string city
    string state
    string surface
  }

  MATCH {
    string id
    string type
    string status
    string createdBy
    string venueId
    string tournamentId
    string playedAt
  }

  NOTIFICATION {
    string id
    string userId
    string type
    string title
    string readAt
  }
```

Observacoes:

- `matches.eventLog` continua embutido na partida nesta fase.
- `matches.venue` guarda snapshot do local para preservar historico.
- Stats cacheadas podem existir em time, jogador e campeonato.
- A fonte auditavel das stats e: partidas concluidas + sumula/eventLog.

## Fluxo de autenticacao

```mermaid
sequenceDiagram
  actor U as Usuario
  participant W as Web
  participant A as API
  participant M as MongoDB

  U->>W: Login ou cadastro
  W->>A: /v1/auth/signin ou /signup
  A->>M: Busca/cria usuario
  A->>M: Cria sessao
  A-->>W: Cookie httpOnly assinado
  W->>A: Requests com credentials include
  A->>M: Valida sessao
  A-->>W: Dados autenticados
```

## Fluxo de partida e stats

```mermaid
sequenceDiagram
  actor Admin as Admin do time
  participant W as Web
  participant A as API
  participant M as MongoDB
  participant S as StatsService
  participant N as NotificationService

  Admin->>W: Cria partida
  W->>A: POST /v1/matches
  A->>M: Valida times e local
  A->>M: Salva partida scheduled
  A->>N: Notifica membros
  A-->>W: Partida criada

  Admin->>W: Encerra partida
  W->>A: POST /v1/matches/complete
  A->>A: Valida permissao
  A->>S: Valida placar contra gols
  A->>M: Atualiza partida completed
  A->>S: Recalcula stats
  A->>M: Atualiza times, jogadores e campeonato
  A->>N: Notifica resultado
  A-->>W: Partida encerrada
```

## Visibilidade e autorizacao

```mermaid
flowchart TD
  Resource["Recurso solicitado"] --> Public{"visibility = public?"}
  Public -- Sim --> Allow["Permitir leitura"]
  Public -- Nao --> Member{"Usuario vinculado?"}
  Member -- Sim --> Allow
  Member -- Nao --> Owner{"Usuario e owner/admin?"}
  Owner -- Sim --> AllowWrite["Permitir escrita"]
  Owner -- Nao --> Deny["403 ou 404"]
```

Regras atuais:

- Times, locais e campeonatos podem ser `public` ou `private`.
- Escrita exige dono/admin quando o recurso pertence a um time.
- Local privado so pode ser usado pelo dono.
- Partida so pode ser encerrada por admin/owner dos dois times envolvidos.

## Contratos compartilhados

```mermaid
flowchart LR
  Domain["domain.ts"] --> Contracts["contracts.ts"]
  Domain --> Stats["stats.ts"]
  Contracts --> ApiValidation["API validation"]
  Contracts --> WebTypes["Web forms/types"]
  Stats --> ApiStats["API stats recalculation"]
  Stats --> WebCards["NaBola Card UI"]
```

O pacote compartilhado deve receber:

- Tipos usados por web e API.
- Schemas Zod de payloads e responses.
- Funcoes puras de stats, ratings e heuristicas do NaBola Card.

Evite colocar nele:

- Codigo com dependencia de Fastify.
- Codigo com dependencia de React.
- Codigo com acesso a banco ou filesystem.

## Decisoes tecnicas

- `pnpm` e o gerenciador padrao.
- MongoDB e acessado via Mongoose na API.
- OpenAPI fica registrado em `apps/api/src/docs/openapi.ts`.
- Uploads locais ficam em `apps/api/uploads`.
- Cookies de sessao sao `httpOnly`, assinados e `sameSite=lax`.
- Notificacoes sao in-app nesta fase; sem email/push.
- Campeonatos comecam em formato `league`.

## Validacao

Use a validacao completa antes de merge/release:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Docs Backend

Para detalhes aprofundados da API, schemas MongoDB, fluxos de dominio e operacao:

- [docs/backend/README.md](./docs/backend/README.md)
- [docs/backend/mongo-collections.md](./docs/backend/mongo-collections.md)
- [docs/backend/domain-flows.md](./docs/backend/domain-flows.md)
- [docs/backend/operations.md](./docs/backend/operations.md)
