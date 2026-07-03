# NaBola Evolution Roadmap

Roadmap modular para evoluir o NaBola de MVP funcional para app esportivo mais completo, consistente e escalavel.

Este documento reflete o estado depois dos modulos 1 a 9:

- diagnostico aplicado em componentes visuais
- direcao de score/stats aplicada ao dashboard
- novas rotas privadas criadas
- card de jogador implementado
- estatisticas derivadas no `packages/shared`
- design system expandido
- overlays/toasts estruturados
- landing publica refeita
- shell desktop com sidebar e trilho contextual

## Principios de execucao

- Mobile-first continua sendo o criterio principal.
- Desktop deve ganhar contexto, nao apenas largura.
- Regra compartilhada fica em `packages/shared`.
- A area logada deve usar `SessionProvider` e `dashboard` antes de criar fetch novo.
- Componentes esportivos devem ser reutilizaveis antes de virar tela especifica.
- Mudancas devem ser pequenas, validaveis e com baixo risco de regressao.

## Fase 1 - Quick wins

| Campo | Definicao |
|---|---|
| Status | Concluida |
| Objetivo | Tirar sinais visuais de MVP sem mexer em dominio |
| Entregaveis | `MatchStatusChip`, `ScoreboardCard` melhorado, empty states melhores, dashboard menos generico |
| Dependencias | Componentes existentes e `dashboard` atual |
| Impacto percebido | Alto |
| Risco | Baixo |
| Prioridade | Alta |

Proximos refinamentos:

- revisar microcopy de todos os empty states
- padronizar loading de listas restantes
- aplicar status esportivo em detalhes de partida/time/copa

## Fase 2 - Design system

| Campo | Definicao |
|---|---|
| Status | Parcialmente concluida |
| Objetivo | Criar base reutilizavel para telas esportivas |
| Entregaveis | `Tabs`, `SkeletonBlock`, `SkeletonList`, `SportsListItem`, `StatTile`, `FormDots`, `ComparisonBar` |
| Dependencias | Tokens em `globals.css`, componentes `ui` atuais |
| Impacto percebido | Alto |
| Risco | Baixo/medio |
| Prioridade | Alta |

Proximos refinamentos:

- criar `StatusChip` generico para recursos alem de partidas
- criar `SectionHeader` para reduzir repeticao em telas
- criar `MetricGrid` para evitar mini stats duplicados
- documentar exemplos de uso dos componentes em docs

## Fase 3 - Navegacao e layout

| Campo | Definicao |
|---|---|
| Status | Parcialmente concluida |
| Objetivo | Dar arquitetura madura para app logado |
| Entregaveis | `/app/ranking`, `/app/stats`, `/app/invites`, `/app/notifications`, `/app/settings`, sidebar desktop, context rail |
| Dependencias | `SessionProvider`, `dashboard`, `appNavItems` e `secondaryNavItems` |
| Impacto percebido | Alto |
| Risco | Medio |
| Prioridade | Alta |

Proximos refinamentos:

- adicionar tabs internas em partida, time e campeonato
- revisar header por contexto da rota atual
- melhorar comportamento da sidebar em larguras intermediarias
- criar breadcrumbs simples para telas de detalhe

## Fase 4 - Estatisticas e card de jogador

| Campo | Definicao |
|---|---|
| Status | Parcialmente concluida |
| Objetivo | Transformar dados simples em sensacao de profundidade esportiva |
| Entregaveis | `PlayerCard`, rating no `shared`, metricas de performance, central `/app/stats` |
| Dependencias | `AggregatedStats`, contratos compartilhados, dashboard agregado |
| Impacto percebido | Muito alto |
| Risco | Medio/alto |
| Prioridade | Alta |

Proximos refinamentos:

- criar ranking real de jogadores
- persistir presenca em partidas
- adicionar artilharia e assistencias por campeonato
- adicionar comparacao jogador vs jogador
- criar card compartilhavel em `/share/player/[playerId]`

## Fase 5 - Landing page

| Campo | Definicao |
|---|---|
| Status | Concluida em primeira versao |
| Objetivo | Fazer o produto parecer real antes do login |
| Entregaveis | hero completo, demos de placar/card/stats, features, prova de produto, FAQ, CTA final |
| Dependencias | Componentes esportivos reais |
| Impacto percebido | Alto |
| Risco | Baixo/medio |
| Prioridade | Media |

Proximos refinamentos:

- adicionar imagens reais ou assets de futebol amador
- criar bloco de convite publico
- melhorar SEO/metadados
- adicionar pagina `/explore` se fizer sentido

## Fase 6 - Refinamento desktop

| Campo | Definicao |
|---|---|
| Status | Iniciada |
| Objetivo | Fazer desktop parecer app planejado, nao mobile esticado |
| Entregaveis | sidebar, context rail, grids responsivos |
| Dependencias | Shell atual, rotas maduras, dados do dashboard |
| Impacto percebido | Medio/alto |
| Risco | Medio |
| Prioridade | Media |

Proximos refinamentos:

- testar visualmente breakpoints `md`, `lg`, `xl`
- revisar densidade de listas no desktop
- criar layouts especificos para detalhes com coluna lateral
- garantir que texto nao estoura em cards e botoes

## Fase 7 - Polish e consistencia final

| Campo | Definicao |
|---|---|
| Status | Pendente |
| Objetivo | Fechar aparencia, acessibilidade e consistencia de experiencia |
| Entregaveis | QA visual, dark mode revisado, estados de erro, microcopy, acessibilidade, testes ampliados |
| Dependencias | Fases anteriores estabilizadas |
| Impacto percebido | Alto |
| Risco | Baixo |
| Prioridade | Alta antes de release |

Proximos refinamentos:

- revisar foco por teclado em overlays e tabs
- adicionar testes para `PlayerCard`, `ToastViewport`, `DesktopSidebar`
- validar dark mode nas telas novas
- revisar contraste de badges e chips
- fazer pass de responsividade mobile real

## Backlog priorizado

| Prioridade | Tarefa | Camada | Observacao |
|---|---|---|---|
| P0 | Tabs internas em partida/time/copa | Web | Usa `Tabs` existente |
| P0 | Ranking de jogadores | Shared + API + Web | Precisa contrato novo ou dashboard expandido |
| P0 | Presenca em partida | Shared + API + Web | Base para metricas mais reais |
| P1 | Artilharia/assistencias por campeonato | Shared + API + Web | Aumenta profundidade esportiva |
| P1 | Compartilhamento de player card | Web + possivel API | Pode comecar com rota publica mockada |
| P1 | Melhorar fluxo de convite/aceite | API + Web | Usa `/app/invites` como base |
| P2 | SEO e metadados da landing | Web | Baixo risco |
| P2 | Testes de componentes esportivos | Web | Reduz regressao visual/logica |
| P2 | Refinar dark mode | Web | QA visual |

## Componentes criados ou consolidados

- `MatchStatusChip`
- `ScoreboardCard`
- `PlayerCard`
- `StatTile`
- `FormDots`
- `ComparisonBar`
- `SportsListItem`
- `Tabs`
- `SkeletonBlock`
- `SkeletonList`
- `ToastViewport`
- `ConfirmDialog`
- `DesktopSidebar`
- `ContextRail`

## Rotas atuais recomendadas

Publicas:

- `/`
- `/login`

Privadas:

- `/app`
- `/app/matches`
- `/app/matches/[matchId]`
- `/app/teams`
- `/app/teams/[teamId]`
- `/app/tournaments`
- `/app/tournaments/[tournamentId]`
- `/app/ranking`
- `/app/stats`
- `/app/invites`
- `/app/notifications`
- `/app/profile`
- `/app/settings`

Rotas futuras:

- `/signup` ou `/login?mode=signup`
- `/explore`
- `/invite/[token]`
- `/share/player/[playerId]`
- `/share/match/[matchId]`

## Ordem ideal daqui para frente

1. Refinar detalhes existentes com tabs internas.
2. Expandir `dashboard` com ranking de jogadores e presenca.
3. Implementar ranking real por jogador.
4. Implementar presenca em partidas.
5. Implementar artilharia/assistencias por campeonato.
6. Criar rotas publicas de compartilhamento.
7. Fazer polish final de desktop, mobile, dark mode e acessibilidade.

## Validacao por tipo de mudanca

Frontend visual:

```bash
pnpm --filter web typecheck
pnpm --filter web lint
pnpm --filter web test
```

Shared/domain:

```bash
pnpm --filter @soccer-stats/shared typecheck
pnpm --filter @soccer-stats/shared build
```

API/contrato:

```bash
pnpm --filter api typecheck
pnpm --filter api test
pnpm --filter api build
```

Workspace completo antes de release:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
