FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --filter web... --frozen-lockfile=false

FROM deps AS build
COPY . .
RUN pnpm --filter web build

FROM base AS dev
COPY . .
COPY docker/dev/web-entrypoint.sh /usr/local/bin/web-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/web-entrypoint.sh \
    && chmod +x /usr/local/bin/web-entrypoint.sh
WORKDIR /app/apps/web
CMD ["web-entrypoint.sh"]

FROM node:24-alpine AS prod
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/web ./apps/web
COPY --from=build /app/packages/shared/src ./packages/shared/src
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
WORKDIR /app/apps/web
CMD ["pnpm", "start", "--hostname", "0.0.0.0"]
