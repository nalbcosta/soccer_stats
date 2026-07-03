# NaBola Execution Plan

Plano de execucao depois dos modulos 1 a 10.

Use este documento como fila pratica de produto/engenharia. O roadmap explica as fases; este plano diz o que atacar primeiro.

## 1. Tarefas priorizadas

| Prioridade | Tarefa | Tipo | Camada | Resultado esperado |
|---|---|---|---|---|
| P0 | Criar tabs internas em detalhe de partida | UX/UI | Web | Partida deixa de ser tela simples e vira hub de jogo |
| P0 | Criar tabs internas em detalhe de time | UX/UI | Web | Time ganha resumo, elenco, jogos e stats |
| P0 | Criar tabs internas em detalhe de campeonato | UX/UI | Web | Copa ganha tabela, rodadas e artilharia futura |
| P0 | Expandir dashboard com ranking de jogadores | Produto | Shared + API + Web | Ranking deixa de ser so de times |
| P0 | Modelar presenca em partida | Dominio | Shared + API + Web | Base real para confiabilidade, presenca e card |
| P1 | Criar artilharia e assistencias por campeonato | Produto | Shared + API + Web | Campeonatos parecem mais vivos |
| P1 | Criar comparacao jogador vs jogador | Produto | Web + Shared | Usa `PlayerCard` e metricas atuais |
| P1 | Melhorar fluxo de convite/aceite | Produto | API + Web | Convites viram fluxo real, nao apenas lista |
| P1 | Criar compartilhamento de card | Produto | Web | Aumenta viralidade e identidade |
| P2 | Adicionar testes para componentes esportivos | Qualidade | Web | Reduz regressao em UI critica |
| P2 | Refinar dark mode das telas novas | Polish | Web | Consistencia visual |
| P2 | Melhorar SEO/metadados da landing | Growth | Web | Melhor presenca publica |

## 2. Componentes a criar ou evoluir

### Criar

- `EntityTabs`: wrapper de `Tabs` com presets para partida, time e campeonato.
- `SectionHeader`: titulo curto, subtitulo opcional e acao contextual.
- `MetricGrid`: grid padronizado para mini stats.
- `PlayerRankingList`: ranking de jogadores com `PlayerCard` mini.
- `MatchPresencePanel`: confirmados, pendentes e ausentes.
- `MatchLineupPanel`: times, jogadores e status de presenca.
- `TournamentScorersTable`: artilharia e assistencias.
- `ShareCardPreview`: preview para compartilhar card ou placar.
- `InlineError`: erro compacto para forms.

### Evoluir

- `PlayerCard`: adicionar variante `mini` para ranking e comparacao.
- `ScoreboardCard`: aceitar estados futuros `live`, `cancelled`, `confirming`.
- `MatchStatusChip`: preparar status mais ricos.
- `SportsListItem`: permitir status/trailing padronizado.
- `ToastViewport`: suportar acao inline como `Ver jogo` ou `Tentar de novo`.
- `ConfirmDialog`: suportar estado loading na acao primaria.

## 3. Rotas sugeridas

### Criar depois

| Rota | Objetivo | Dependencia |
|---|---|---|
| `/signup` | Cadastro dedicado se login ficar pesado | Auth UI |
| `/explore` | Demonstração publica navegavel | Landing madura |
| `/invite/[token]` | Aceite publico de convite | API de convite |
| `/share/player/[playerId]` | Card compartilhavel | Player stats publicas |
| `/share/match/[matchId]` | Placar compartilhavel | Privacidade de partida |

### Subrotas ou tabs internas

| Tela | Tabs |
|---|---|
| `/app/matches/[matchId]` | Resumo, Presenca, Elencos, Stats |
| `/app/teams/[teamId]` | Resumo, Elenco, Jogos, Stats |
| `/app/tournaments/[tournamentId]` | Tabela, Rodadas, Artilharia, Times |
| `/app/profile` | Card, Numeros, Historico |
| `/app/ranking` | Times, Jogadores, Gols, Presenca |

## 4. Melhorias visuais

- Reduzir repeticao de cards simples com `SectionHeader` e `MetricGrid`.
- Usar `tabular-nums` em todos os placares, rankings e metricas.
- Revisar contraste de `warning` em light/dark mode.
- Aplicar linhas de campo apenas em momentos especiais: hero, card, placar, destaque.
- Dar mais densidade a listas no desktop.
- Garantir que cards em desktop nao fiquem largos demais sem contexto.
- Padronizar icones por dominio: jogo, time, ranking, stats, convite.
- Revisar responsividade do `PlayerCard` em telas estreitas.

## 5. Melhorias funcionais

- Presenca por partida: confirmado, pendente, ausente.
- Ranking de jogadores por pontos, gols, assistencias e presenca.
- Artilharia por campeonato.
- Assistencias por campeonato.
- Historico recente por time.
- Comparacao pre-jogo entre times.
- Comparacao jogador vs jogador.
- Aceite de convite por token.
- Compartilhamento de card.
- Compartilhamento de placar.
- Notificacoes internas baseadas em eventos do dashboard.

## 6. Melhorias de UX

- Transformar detalhes complexos em tabs, nao em paginas longas.
- Usar bottom sheet apenas para acoes curtas.
- Usar tela completa para fluxos longos como campeonato complexo.
- Usar dialog apenas para confirmacao critica.
- Fechar formularios com toast e CTA contextual quando fizer sentido.
- Mostrar empty state com proxima acao clara.
- Evitar overlay sobre overlay.
- Melhorar mensagens de erro nos formularios.
- Adicionar contexto de data/status nas listas.
- Separar configuracoes do perfil competitivo.

## 7. Ordem ideal de implementacao

1. `SectionHeader`, `MetricGrid` e `EntityTabs`.
2. Tabs internas em partida, time e campeonato.
3. Ajustes visuais nos detalhes usando componentes existentes.
4. Modelagem de presenca no `packages/shared`.
5. API de presenca e dashboard expandido.
6. UI de presenca em partida.
7. Ranking de jogadores.
8. Artilharia e assistencias por campeonato.
9. Comparacao jogador vs jogador.
10. Compartilhamento de card e placar.
11. SEO/metadados da landing.
12. Testes e polish de dark mode/responsividade.

## 8. Primeira sprint recomendada

Escopo de baixo risco para continuar imediatamente:

- Criar `SectionHeader`.
- Criar `MetricGrid`.
- Criar `EntityTabs`.
- Refatorar `MatchDetail` com tabs visuais.
- Refatorar `TeamDetail` com tabs visuais.
- Refatorar `TournamentDetail` com tabs visuais.
- Rodar validacao web completa.

Comandos:

```bash
pnpm --filter web typecheck
pnpm --filter web lint
pnpm --filter web test
```

## 9. Segunda sprint recomendada

Escopo com dominio/API:

- Adicionar tipos de presenca no `packages/shared`.
- Criar contratos de confirmar presenca.
- Criar persistencia no backend.
- Expandir `dashboard` com presencas.
- Criar `MatchPresencePanel`.
- Atualizar card/ranking com presenca.

Comandos:

```bash
pnpm --filter @soccer-stats/shared typecheck
pnpm --filter api typecheck
pnpm --filter api test
pnpm --filter web typecheck
pnpm --filter web test
```

## 10. Definicao de pronto

Uma melhoria so deve ser considerada pronta quando:

- respeita mobile-first
- usa componente existente ou cria componente reutilizavel
- nao duplica estado que ja existe no `dashboard`
- mantem light/dark mode funcional
- tem empty/loading/error state quando aplicavel
- passou pelos comandos de validacao do escopo
- nao introduz linguagem corporativa ou generica
