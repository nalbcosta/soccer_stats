#!/bin/sh
set -eu

cd /app
pnpm install --frozen-lockfile=false --config.confirmModulesPurge=false

cd /app/apps/web
exec pnpm dev --hostname 0.0.0.0
