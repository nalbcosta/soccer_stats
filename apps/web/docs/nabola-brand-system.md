# NaBola Brand System

## 1. Estrategia de marca

Essencia: futebol entre amigos com organizacao de app serio.

Posicionamento: o NaBola profissionaliza a pelada sem tirar o clima de resenha, bairro e rivalidade saudavel.

Promessa central: marcar jogo, montar time, fechar placar e acompanhar numeros sem depender de grupo perdido.

Personalidade: direto, competitivo, proximo, confiavel e ligeiramente provocador.

Percepcao mobile: rapido de ler com uma mao, claro em campo, forte em contraste e com a acao principal sempre facil de tocar.

Diferenciacao: nao e agenda generica nem app estatistico frio. O produto fala a lingua da pelada e organiza informacao de jogo, time e ranking.

## 2. Plataforma verbal

Tom: brasileiro, curto, de vestiario, sem piada forçada.

Atributos: claro, boleiro, competitivo, comunitario e acionavel.

Fala sobre: jogo, time, presenca, placar, fase, ranking, convite e resenha.

Evita: jargoes de SaaS, "performance management", "dashboard analytics", texto infantil e promessa grandiosa.

Tagline principal: A pelada sai do grupo e entra no jogo.

Alternativas:

- Organize a resenha. Feche o placar.
- Seu futebol, seus numeros.
- Do apito ao ranking.
- O vestiario da sua pelada.
- Marque jogo. Monte time. Resolva em campo.

Microcopy:

- Onboarding: Monte sua turma e marque o primeiro jogo.
- Criar partida: Marcar jogo.
- Confirmar presenca: Confirmar que vou.
- Ranking: Quem ta sobrando.
- Resultado final: Placar fechado.
- Empty state: A rodada ainda nao saiu.
- Convite: Chamar para o elenco.
- Erro: Nao deu para conectar. Tenta de novo.
- Push: Seu jogo comeca em 1 hora.
- CTA principal: Entrar em campo.

## 3. Sistema de cores

Primaria:

- `color-primary`: `#00A8A3`
- `color-primary-hover`: `#00938F`
- `color-primary-active`: `#08716D`
- `color-primary-pressed`: `#075F5C`
- `color-primary-soft`: `#E3F7F4`

Secundarias:

- Campo: `#2F8F46`
- Marcador: `#F2C94C`
- Apoio social: `#1FB6A6`

Semanticas:

- Sucesso: `#1E9F57`
- Alerta: `#D89B17`
- Erro: `#D94A3D`
- Info: `#1F7BD7`

Regras:

- Alta saturacao fica em CTA, placar, status e nav ativo.
- Superficies e listas usam tons suaves.
- Texto pequeno precisa ficar em `color-text` ou `color-muted`; nunca em turquesa claro sobre fundo claro.
- Overlays usam `modal-overlay` e sheets usam `color-surface`.

## 4. Tipografia

Base: Satoshi Variable.

Escala mobile:

- Display: 40px / 44px / 900
- H1: 30px / 36px / 900
- H2: 24px / 30px / 800
- H3: 20px / 26px / 800
- Section title: 16px / 22px / 800
- Body: 15px / 22px / 500
- Body small: 14px / 20px / 500
- Caption: 12px / 16px / 800 uppercase
- Tab label: 11px / 14px / 900
- Button: 14px / 20px / 800
- Badge: 11px / 14px / 900 uppercase
- Placar: 34px / 36px / 900 tabular
- Estatistica: 28px / 32px / 900 tabular

Regras:

- Titulo curto, verbo claro.
- Placar e ranking usam `tabular-nums`.
- Nada de tracking negativo.
- Em telas pequenas, densidade vem de grid e hierarquia, nao de fonte apertada.

## 5. Estrutura visual do app

App shell: header compacto, conteudo escaneavel e tab bar inferior no mobile.

Header: marca, contexto e acesso a perfil. Evita excesso de acoes.

Bottom nav: 5 itens maximos, 68px, labels curtos e icones claros.

FAB: usado para acao primaria contextual, como marcar jogo. No MVP, fica como botao no header da pagina e abre bottom sheet.

Cards: raio 8px, borda sutil, sombra curta. Cards representam itens, nao secoes inteiras.

Listas: linhas altas o suficiente para toque, avatar/escudo a esquerda, status a direita.

Score modules: placar central, times laterais, numeros tabulares, status no topo.

Ranking: posicao, escudo, nome, metrica principal e detalhe secundario.

Estados vazios: mensagem curta + proxima acao.

Loaders: simples e discretos, sem bloquear visualmente mais que o necessario.

Esportivo: placares, ranking, escudos, status de jogo.

Utilitario: formularios, preferencias, filtros, listas.

## 6. Modais e bottom sheets

Bottom sheet:

- Usar para acoes curtas: marcar jogo, convidar jogador, filtros, confirmar presenca.
- Altura ideal: ate 82vh.
- Header com titulo e botao de fechar visivel.
- Fundo com overlay forte.
- Scroll interno quando necessario.
- Em desktop, vira modal compacto central.

Tela cheia:

- Usar para fluxos longos: editar perfil completo, criar campeonato complexo, revisar estatisticas.

Modal central:

- Usar para confirmacoes destrutivas ou alertas criticos.

Regras:

- Nao empilhar bottom sheet sobre bottom sheet.
- Toda acao precisa ter alvo minimo de 44px.
- Fechar por overlay e por botao.
- Contraste do sheet precisa separar claramente fundo e conteudo.

## 7. Logo e app icon

Conceito: NB como marca de placar e presenca em campo.

Simbolo: monograma `NB` dentro de um quadrado arredondado com linhas sutis de campo. Evita bola literal demais.

Wordmark: NaBola em Satoshi Black, compacto, sem ornamento.

App icon: fundo verde campo ou turquesa, monograma branco, grid sutil.

Versoes: principal colorida, reduzida NB, monocromatica, negativa e icon-only.

Evitar: bola 3D, escudo generico, estrela demais, visual gamer neon.

## 8. Elementos de apoio

Motivos: linhas de campo, marcacao de zona, placar, posicao em ranking e heatmap leve.

Grid: 4px base, cards em pilha no mobile, 2 a 3 colunas no desktop.

Iconografia: lucide, stroke consistente, sem mistura de familias.

Imagens: futebol real, quadra, campo society, chuteira, colete e grupo. Evitar banco de imagem corporativo.

Social media: usar placar, ranking e frase curta como unidades visuais.

## 9. Design tokens iniciais

```css
--color-primary: #00a8a3;
--color-primary-pressed: #075f5c;
--color-surface: #ffffff;
--color-surface-raised: #ffffff;
--color-bg: #f6faf7;
--color-text: #102421;
--color-text-muted: #63746f;
--color-border: rgba(16, 36, 33, 0.12);
--color-success: #1e9f57;
--color-warning: #d89b17;
--color-error: #d94a3d;
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--shadow-sm: 0 1px 2px rgba(16, 36, 33, 0.08);
--shadow-md: 0 14px 34px rgba(16, 36, 33, 0.13);
--font-family-base: "Satoshi Variable", "Satoshi", ui-sans-serif, system-ui, sans-serif;
--font-size-body: 15px;
--font-size-caption: 12px;
--font-size-score: 34px;
--bottom-sheet-radius: 20px;
--modal-overlay: rgba(7, 18, 15, 0.58);
--nav-height: 68px;
--touch-target-min: 44px;
```

Spacing: `4, 8, 12, 16, 20, 24, 32, 40`.

## 10. Direcoes finais

Direcao recomendada: Raiz Digital.

Resumo: linguagem de pelada, interface limpa, dados de jogo com peso visual e turquesa como assinatura digital.

Rotas visuais:

- Raiz Digital: equilibrada, mais forte para mobile, mistura campo e produto. Vantagem: escalavel. Risco: precisa de microcopy boa para nao ficar neutra.
- Placar de Rua: mais quente e comunitaria, boa para campanhas e onboarding. Vantagem: memoravel. Risco: pode ficar informal demais.
- Turquesa Competitivo: mais performance e estatistica. Vantagem: leitura forte de dados. Risco: pode esfriar a resenha.

Escolha: Raiz Digital, porque sustenta app real, thumb reach, dark/light mode, ranking, placar e comunidade sem parecer template generico.
