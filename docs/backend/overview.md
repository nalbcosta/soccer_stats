# Visao Geral do Backend

O backend do NaBola e uma API Fastify em TypeScript. Ele concentra autenticacao, autorizacao, regras de dominio, documentacao OpenAPI, persistencia MongoDB e recalculo de estatisticas.

## Stack

- Runtime: Node.js
- Framework HTTP: Fastify 5
- Validacao: Zod
- Banco: MongoDB
- ODM: Mongoose
- Docs HTTP: `@fastify/swagger` + `@fastify/swagger-ui`
- Testes: Vitest + `app.inject`

## Arquitetura de camadas

```mermaid
flowchart TB
  Server["server.ts"] --> App["createApp(config, repositories)"]
  App --> Plugins["Plugins Fastify"]
  App --> OpenAPI["OpenAPI schemas"]
  App --> Routes["Routes / Controllers"]
  Routes --> Services["Services de dominio"]
  Services --> Repositories["Repositories"]
  Repositories --> Mongoose["Mongoose Models"]
  Mongoose --> Mongo[("MongoDB")]
  Routes --> Shared["packages/shared contracts"]
  Services --> SharedStats["packages/shared stats"]
```

## Bootstrap

```mermaid
sequenceDiagram
  participant S as server.ts
  participant C as config.ts
  participant M as createMongoRepositories
  participant A as createApp
  participant F as Fastify

  S->>C: loadConfig()
  S->>M: conecta MongoDB
  M-->>S: repositories + connection
  S->>A: createApp(config, repositories)
  A->>F: registra plugins, docs e rotas
  S->>F: listen()
```

## Dependencias entre pacotes

```mermaid
flowchart LR
  Web["apps/web"] --> Shared["packages/shared"]
  Api["apps/api"] --> Shared
  Api --> Mongo["MongoDB"]
  Web --> Api
```

`packages/shared` e o contrato entre frontend e backend. Ele contem:

- tipos de dominio.
- schemas Zod de input/output.
- funcoes puras de estatistica e rating.

## Principais areas do backend

| Area | Caminho | Responsabilidade |
|---|---|---|
| Bootstrap | `src/server.ts` | Carrega config, conecta Mongo e sobe Fastify |
| App | `src/app.ts` | Registra plugins, OpenAPI, static uploads, rotas e error handler |
| Auth | `src/plugins/auth.ts` | Sessao, cookies, login credentials/Google e `requireUser` |
| OpenAPI | `src/docs/openapi.ts` | Schemas JSON e documentacao Swagger |
| Repositories | `src/repositories/*` | Persistencia Mongo/Memoria |
| Routes legadas | `src/routes/*` | Endpoints principais atuais |
| Modules | `src/modules/*` | Nova organizacao por dominio |
| Stats | `src/lib/stats-service.ts` | Calculo de times, jogadores e standings |

## Rotas registradas

Todas as rotas de produto ficam sob `/v1`.

```mermaid
flowchart TB
  V1["/v1"] --> Auth["/auth"]
  V1 --> Players["/players"]
  V1 --> Teams["/teams"]
  V1 --> Venues["/venues"]
  V1 --> Matches["/matches"]
  V1 --> Tournaments["/tournaments"]
  V1 --> Notifications["/notifications"]
  V1 --> Dashboard["/dashboard"]
  Root["/"] --> Health["/health"]
  Root --> Docs["/docs"]
```

## Error handling

O `app.ts` registra um error handler para:

- `ZodError`: responde `400` com `Payload invalido`.
- `mongoose.Error.ValidationError`: responde `400` com `Documento invalido`.
- outros erros: seguem para o handler padrao do Fastify.

## Padrao recomendado para novos modulos

```text
apps/api/src/modules/<domain>/
|- <domain>.routes.ts
|- <domain>.controller.ts
|- <domain>.service.ts
|- <domain>.schemas.ts
|- <domain>.model.ts
|- <domain>.repository.ts
```

Use todos os arquivos apenas quando houver complexidade suficiente. Para dominios pequenos, `routes + controller + service` ja basta.
