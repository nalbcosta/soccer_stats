#!/bin/sh
set -eu

cd /app
pnpm install --frozen-lockfile=false --config.confirmModulesPurge=false --config.node-linker=hoisted

cd /app/apps/api
exec pnpm dev
