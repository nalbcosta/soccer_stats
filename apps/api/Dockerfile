FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --filter api... --frozen-lockfile=false

FROM deps AS build
COPY . .
RUN pnpm --filter @soccer-stats/shared build
RUN pnpm --filter api build

FROM base AS dev
COPY . .
COPY docker/dev/api-entrypoint.sh /usr/local/bin/api-entrypoint.sh
RUN chmod +x /usr/local/bin/api-entrypoint.sh
WORKDIR /app/apps/api
CMD ["api-entrypoint.sh"]

FROM node:24-alpine AS prod
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/packages/shared/src ./packages/shared/src
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
WORKDIR /app/apps/api
CMD ["pnpm", "start"]
