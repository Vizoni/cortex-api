#!/bin/bash
set -e  # Para se qualquer comando falhar

echo "🔍 Verificando DATABASE_URL..."
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL não está definida!"
  exit 1
fi

echo "✅ DATABASE_URL encontrada"

echo "🏗️  Compilando aplicação (inclui prisma generate)..."
pnpm run build

echo "🗄️  Aplicando migrations..."
pnpm prisma migrate deploy

echo "✅ Deploy concluído com sucesso!"

echo "🚀 Iniciando aplicação..."
node dist/src/main
