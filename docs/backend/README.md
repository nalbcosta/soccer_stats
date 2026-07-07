# Backend NaBola

Documentacao aprofundada do backend Fastify do NaBola.

## Indice

- [Visao geral](./overview.md)
- [Collections MongoDB e schemas](./mongo-collections.md)
- [Fluxos de dominio](./domain-flows.md)
- [Operacao, ambiente e validacao](./operations.md)

## Onde o backend vive

```text
apps/api/
|- src/
|  |- app.ts
|  |- server.ts
|  |- config.ts
|  |- docs/openapi.ts
|  |- plugins/auth.ts
|  |- repositories/
|  |  |- mongo.ts
|  |  |- memory.ts
|  |- routes/
|  |- modules/
|  |- lib/
|- tests/
```

## Principios

- Handlers Fastify devem ser finos.
- Regra de negocio deve ir para services/helpers de dominio.
- Contratos compartilhados ficam em `packages/shared`.
- Persistencia fica atras de repositories.
- MongoDB usa Mongoose para schema, validacao e indices.
- Estatisticas devem ser derivadas de partidas concluidas e sumula.

## Validacao rapida

```bash
pnpm --filter api typecheck
pnpm --filter api test
pnpm --filter api build
```
