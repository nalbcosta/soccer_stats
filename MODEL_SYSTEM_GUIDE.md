# NaBola Model System Guide

Guia para modelos, agentes e automacoes entenderem o projeto antes de propor passos, implementar mudancas ou planejar melhorias.

## 1. Objetivo do sistema

O NaBola e um app para futebol entre amigos, pelada, varzea e campeonato amador.

O sistema precisa sustentar:

- identidade de usuario
- card de jogador
- times e membros
- partidas
- campeonatos
- convites
- estatisticas agregadas
- experiencia mobile-first

Regra de produto importante:

- o app deve parecer ferramenta de jogo real
- nao deve virar landing genérica, painel corporativo ou app social abstrato

## 2. Topologia do projeto

### `apps/web`

Responsavel pela experiencia do usuario.

Tecnologias:

- Next.js App Router
- React client components onde ha estado/interacao
- Tailwind + CSS variables

Responsabilidades:

- layout publico e autenticado
- roteamento
- sessao do frontend
- formularios
- componentes visuais
- tokens de interface

### `apps/api`

Responsavel por:

- auth
- sessao por cookie
- regras de dominio
- leitura e escrita em repositorios
- dashboard agregado
- OpenAPI

### `packages/shared`

Camada de verdade compartilhada para:

- tipos de dominio
- contratos
- schemas
- logica simples de stats

Se um campo ou shape existe tanto no front quanto na API, o lugar preferencial dele e aqui.

## 3. Fluxo principal de dados

### Autenticacao

1. frontend chama `api.signUp`, `api.signIn` ou `api.signInWithGoogle`
2. API cria/valida usuario
3. API cria cookie de sessao
4. frontend usa `SessionProvider`
5. `SessionProvider` chama `api.me()` e `api.dashboard()`
6. paginas privadas dependem desse estado central

### Area autenticada

No frontend atual, quase toda a area logada usa:

- `user`
- `dashboard`
- `refresh()`
- `logout()`
- `feedback`

Tudo isso vem de:

- [session-provider.tsx](</D:/Projetos Pessoais/soccer_stats/apps/web/components/app/session-provider.tsx>)

Regra:

- nao criar novos fetches concorrentes desnecessarios se o dado ja existe no `dashboard`
- ao criar/editar algo que impacta o painel, prefira chamar `refresh()`

## 4. Arquitetura atual do frontend

### Rotas publicas

- `/`
- `/login`

### Rotas autenticadas

- `/app`
- `/app/matches`
- `/app/matches/[matchId]`
- `/app/teams`
- `/app/teams/[teamId]`
- `/app/tournaments`
- `/app/tournaments/[tournamentId]`
- `/app/profile`

### Shell do app

Arquivos-chave:

- [app/(app)/app/layout.tsx](</D:/Projetos Pessoais/soccer_stats/apps/web/app/(app)/app/layout.tsx>)
- [app-shell.tsx](</D:/Projetos Pessoais/soccer_stats/apps/web/components/app/app-shell.tsx>)
- [app-header.tsx](</D:/Projetos Pessoais/soccer_stats/apps/web/components/app/app-header.tsx>)
- [mobile-tab-bar.tsx](</D:/Projetos Pessoais/soccer_stats/apps/web/components/app/mobile-tab-bar.tsx>)

Regra:

- qualquer nova tela autenticada deve respeitar esse shell
- nao criar experiencia paralela de navegacao sem necessidade forte

## 5. Design system atual

### Tokens

Os tokens moram em:

- [globals.css](</D:/Projetos Pessoais/soccer_stats/apps/web/app/globals.css>)
- [tailwind.config.ts](</D:/Projetos Pessoais/soccer_stats/apps/web/tailwind.config.ts>)

Categorias existentes:

- cores de superficie
- cores primarias
- cores semanticas
- espacamento
- radius
- sombras
- altura de nav
- touch target
- tipografia base

### Componentes-base

UI basica:

- `Button`
- `Card`
- `Input`
- `Select`
- `Badge`
- `TeamCrest`

Componentes esportivos:

- `ScoreboardCard`
- `RankingList`

Overlays:

- `BottomSheet`

Regra:

- antes de criar componente novo, verificar se um desses resolve ou pode ser estendido
- preservar a identidade NaBola: leitura rapida, contraste forte, toque confortavel

## 6. Principios para planejar melhorias

Quando um modelo for propor passos, deve seguir esta ordem:

1. entender se a melhoria e de produto, de fluxo, de visual ou de dominio
2. verificar se o dado ja existe em `dashboard` ou na API atual
3. decidir se a mudanca e:
   interface apenas
   frontend + contrato
   frontend + backend + shared
4. minimizar novos estados duplicados
5. manter mobile-first como criterio principal

## 7. Invariantes importantes

- autenticacao depende de cookie e sessao de backend
- frontend usa `SessionProvider` como fonte principal do estado logado
- API publica o dashboard agregado como fonte de leitura ampla
- tipos compartilhados devem continuar saindo de `packages/shared`
- tema light/dark precisa continuar funcional
- navegacao mobile por tab bar e parte da identidade do app
- o nome da marca no frontend e `NaBola`

## 8. O que evitar

- recriar uma pagina unica gigante com tudo misturado
- criar fetch por pagina para entidades que ja estao no `dashboard`
- adicionar componentes visuais sem token
- adicionar cores fora da paleta sem necessidade real
- linguagem corporativa, tecnica demais ou generica
- usar a interface como landing de marketing dentro da area logada
- criar overlay sobre overlay
- mover regra de dominio para o frontend sem motivo

## 9. Como pensar melhorias futuras

### Melhorias de frontend de baixo risco

- empty states melhores
- filtros locais
- tabelas e rankings mais ricos
- skeletons
- microcopy
- acessibilidade
- estados de erro
- refinamento visual

### Melhorias de medio risco

- paginas com leitura mais detalhada de time/jogo/campeonato
- edicao de entidades
- filtros persistidos
- onboarding contextual
- notificacoes internas

### Melhorias de alto impacto

- novos endpoints
- novas agregacoes no dashboard
- convites com aceite real
- presenca em partidas
- ranking real por jogador
- modulos de analytics

## 10. Checklist antes de implementar

Antes de mudar algo, um modelo deve responder:

1. Qual problema do usuario isso resolve?
2. Em qual camada a mudanca mora?
3. O dado ja existe ou precisa de backend?
4. Ha componente reutilizavel semelhante?
5. Isso respeita o shell mobile-first?
6. A linguagem continua NaBola?
7. Quais comandos validam a mudanca?

## 11. Comandos de validacao

Workspace:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Frontend:

```bash
pnpm --filter web typecheck
pnpm --filter web test
pnpm --filter web build
```

Backend:

```bash
pnpm --filter api typecheck
pnpm --filter api test
pnpm --filter api build
```

Docker dev:

```bash
docker compose -f docker-compose.dev.yml up --build
```

## 12. Arquivos de referencia rapida

Frontend shell:

- [app-shell.tsx](</D:/Projetos Pessoais/soccer_stats/apps/web/components/app/app-shell.tsx>)
- [session-provider.tsx](</D:/Projetos Pessoais/soccer_stats/apps/web/components/app/session-provider.tsx>)

Frontend identidade:

- [globals.css](</D:/Projetos Pessoais/soccer_stats/apps/web/app/globals.css>)
- [nabola-brand-system.md](</D:/Projetos Pessoais/soccer_stats/apps/web/docs/nabola-brand-system.md>)
- [nabola-evolution-roadmap.md](</D:/Projetos Pessoais/soccer_stats/apps/web/docs/nabola-evolution-roadmap.md>)
- [nabola-execution-plan.md](</D:/Projetos Pessoais/soccer_stats/apps/web/docs/nabola-execution-plan.md>)

API entry:

- [app.ts](</D:/Projetos Pessoais/soccer_stats/apps/api/src/app.ts>)
- [openapi.ts](</D:/Projetos Pessoais/soccer_stats/apps/api/src/docs/openapi.ts>)

Shared contracts:

- [domain.ts](</D:/Projetos Pessoais/soccer_stats/packages/shared/src/domain.ts>)
- [contracts.ts](</D:/Projetos Pessoais/soccer_stats/packages/shared/src/contracts.ts>)

## 13. Resumo operacional

Se voce for um modelo lendo esse projeto:

- comece pelo shell e pelo dashboard
- trate `packages/shared` como contrato
- use o design system existente
- pense primeiro em mobile
- mantenha a linguagem de futebol entre amigos
- implemente em passos pequenos e validaveis
