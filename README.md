# NaBola

Aplicativo web mobile-first para organizar peladas, times, partidas e campeonatos entre amigos.

O objetivo do projeto e profissionalizar o futebol amador sem perder a resenha: marcar jogo, montar elenco, registrar placar, acompanhar presenca e gerar estatisticas simples de forma clara.

## Stack

- `apps/web`: Next.js 15 + React 19 + Tailwind
- `apps/api`: Fastify + TypeScript + OpenAPI
- `packages/shared`: tipos, contratos e regras compartilhadas
- `MongoDB`: persistencia principal
- `Docker Compose`: ambiente de desenvolvimento e producao

## Estrutura

```text
.
|- apps/
|  |- web/       # App frontend NaBola
|  |- api/       # API HTTP e autenticacao
|- packages/
|  |- shared/    # Contratos, schemas e stats
|- docker-compose.dev.yml
|- docker-compose.prod.yml
```

## O que ja existe

- Autenticacao com email/senha e Google
- Sessao por cookie `httpOnly`
- Perfil de jogador
- Criacao de times
- Convites por email para times
- Criacao de partidas casuais e de campeonato
- Fechamento de placar
- Criacao de campeonatos simples
- Dashboard agregado no backend
- Documentacao OpenAPI em `/docs`
- Frontend com rotas publicas e privadas

## Rotas principais

### Frontend

- `/`: landing publica
- `/login`: autenticacao
- `/app`: resumo do usuario
- `/app/matches`: jogos
- `/app/teams`: times
- `/app/tournaments`: campeonatos
- `/app/profile`: perfil e preferencias

### API

- `GET /health`
- `GET /docs`
- `GET /docs/json`
- `POST /v1/auth/signup`
- `POST /v1/auth/signin`
- `POST /v1/auth/google`
- `POST /v1/auth/signout`
- `GET /v1/auth/me`
- `GET /v1/dashboard`

## Como rodar localmente

### Opcao 1: Docker

Ambiente recomendado para desenvolvimento.

```bash
docker compose -f docker-compose.dev.yml up --build
```

URLs:

- Web: `http://localhost:3000`
- API: `http://localhost:4000`
- Docs: `http://localhost:4000/docs`

### Opcao 2: Sem Docker

1. Criar arquivos de ambiente:

- `apps/api/.env` a partir de `apps/api/.env.example`
- `apps/web/.env.local` a partir de `apps/web/.env.example`

2. Instalar dependencias:

```bash
pnpm install
```

3. Subir tudo:

```bash
pnpm dev
```

## Comandos uteis

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter web build
pnpm --filter api test
```

## Design e frontend

- Marca atual: `NaBola`
- Tipografia base: `Satoshi` via Fontshare
- Tema: light e dark mode
- Navegacao mobile: tab bar inferior
- Foco visual: azul-turquesa, verde campo, amarelo marcador

O sistema visual inicial esta documentado em:

- [apps/web/docs/nabola-brand-system.md](</D:/Projetos Pessoais/soccer_stats/apps/web/docs/nabola-brand-system.md>)
- [apps/web/docs/nabola-evolution-roadmap.md](</D:/Projetos Pessoais/soccer_stats/apps/web/docs/nabola-evolution-roadmap.md>)
- [apps/web/docs/nabola-execution-plan.md](</D:/Projetos Pessoais/soccer_stats/apps/web/docs/nabola-execution-plan.md>)

## Documentacao para modelos/agentes

Para entender arquitetura, fluxo de dados, limites de cada camada e como planejar melhorias no projeto, consulte:

- [MODEL_SYSTEM_GUIDE.md](</D:/Projetos Pessoais/soccer_stats/MODEL_SYSTEM_GUIDE.md>)

## Validacao recomendada depois de alteracoes

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter web build
pnpm --filter api test
```
