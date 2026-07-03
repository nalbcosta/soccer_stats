#!/bin/sh
set -eu

cd /app
pnpm install --frozen-lockfile=false --config.confirmModulesPurge=false

cd /app/apps/api
exec pnpm dev
