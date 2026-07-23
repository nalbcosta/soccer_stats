# Deploy no Vercel

## Arquitetura

O monorepo deve ser conectado a dois projetos Vercel, ambos apontando para o mesmo repositório:

| Projeto | Root Directory | Branch de produção |
|---|---|---|
| `soccer-stats-web` | `apps/web` | `Main` |
| `soccer-stats-api` | `apps/api` | `Main` |

Ative a opção de incluir arquivos fora do Root Directory, pois os dois apps usam o workspace `packages/shared` e o lockfile na raiz.

O Vercel fará deploy automático a cada push. A branch `Main` gera deploy de produção; a branch `Dev` gera deploy de preview para homologação. Recomenda-se associar domínios fixos às duas branches, por exemplo:

- `app.exemplo.com` para `Main`;
- `dev.exemplo.com` para `Dev`;
- `api.exemplo.com` para `Main`;
- `api-dev.exemplo.com` para `Dev`.

## Variáveis do projeto `soccer-stats-api`

Configure as variáveis abaixo no Vercel, separando os valores por ambiente:

| Variável | Preview / `Dev` | Production / `Main` |
|---|---|---|
| `MONGODB_URI` | URI do cluster Atlas de homologação | URI do cluster Atlas de produção |
| `MONGODB_DB` | `soccer_stats_dev` | `soccer_stats_prod` |
| `WEB_ORIGIN` | URL do web em `Dev` | URL do web em `Main` |
| `SESSION_SECRET` | segredo exclusivo de homologação | segredo exclusivo de produção |
| `NODE_ENV` | `production` | `production` |
| `COOKIE_DOMAIN` | domínio compartilhado, se aplicável | domínio compartilhado, se aplicável |
| `GOOGLE_CLIENT_ID` | Client ID OAuth de homologação | Client ID OAuth de produção |
| `NOMINATIM_BASE_URL` | `https://nominatim.openstreetmap.org` | `https://nominatim.openstreetmap.org` |
| `NOMINATIM_USER_AGENT` | identificador do projeto | identificador do projeto |
| `NOMINATIM_EMAIL` | e-mail opcional | e-mail opcional |
| `BLOB_READ_WRITE_TOKEN` | token do Blob Store de homologação | token do Blob Store de produção |

Se web e API estiverem em subdomínios do mesmo domínio, use `COOKIE_DOMAIN=.exemplo.com`. Se estiverem em domínios diferentes, a autenticação por cookie pode ser bloqueada pelo navegador por causa de `SameSite=Lax`; nesse caso, use um domínio compartilhado.

## Variáveis do projeto `soccer-stats-web`

| Variável | Preview / `Dev` | Production / `Main` |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api-dev.exemplo.com/v1` | `https://api.exemplo.com/v1` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client ID OAuth de homologação | Client ID OAuth de produção |

Variáveis `NEXT_PUBLIC_*` são incorporadas ao build do Next.js. Depois de alterá-las, faça um novo deploy.

## MongoDB Atlas

Crie dois deployments ou clusters no Atlas, preferencialmente um para cada ambiente:

1. Crie o cluster de homologação e o de produção.
2. Crie usuários de banco separados, com acesso apenas ao banco correspondente.
3. Configure a Network Access List para aceitar as conexões do Vercel conforme a política de segurança escolhida.
4. Copie as URIs `mongodb+srv://` para as variáveis do Vercel, sem colocá-las no Git.
5. Use nomes de banco distintos: `soccer_stats_dev` e `soccer_stats_prod`.

A aplicação executa `syncIndexes()` ao iniciar a conexão. Faça o primeiro deploy de cada ambiente e valide o endpoint `/health` da API.

## Fluxo de branches

```text
feature/* -> Pull Request -> Dev -> homologação -> Pull Request -> Main -> produção
```

Proteções recomendadas no GitHub:

- exigir Pull Request para `Dev` e `Main`;
- exigir os checks do workflow `CI` antes do merge;
- impedir push direto em `Main`;
- exigir aprovação para promover `Dev` para `Main`.

## Uploads com Vercel Blob

Fotos de jogadores e logos de times usam o Vercel Blob automaticamente quando `BLOB_READ_WRITE_TOKEN` estiver configurado na API. Crie um Blob Store **público** na área Storage do projeto `soccer-stats-api` e habilite-o para os ambientes Preview e Production. O Vercel criará essa variável automaticamente; não a versione no Git.

Sem o token — como no desenvolvimento local — os arquivos continuam sendo gravados em `apps/api/uploads`. Em produção, as URLs públicas do Blob são persistidas diretamente no MongoDB e o arquivo anterior é removido ao trocar ou apagar uma foto/logo.

O limite da API é 4 MB por arquivo, compatível com uploads enviados pelo servidor em Functions Vercel. Se o limite precisar aumentar, migre o fluxo para client uploads do Vercel Blob.

## Configuração no Dashboard

Para cada projeto: importe o repositório, selecione o Root Directory indicado, deixe o Framework Preset correspondente, configure `Main` como Production Branch e cadastre as variáveis nos ambientes Preview e Production. O arquivo `vercel.json` de cada app já define os comandos de instalação e build.
