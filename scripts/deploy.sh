#!/bin/bash
set -e  # Para se qualquer comando falhar

echo "🔍 Verificando DATABASE_URL..."
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL não está definida!"
  exit 1
fi

echo "✅ DATABASE_URL encontrada"

echo "🏗️  Compilando aplicação..."
pnpm run build

echo "📦 Gerando Prisma Client..."
pnpm prisma generate

echo "🗄️  Aplicando migrations..."
pnpm prisma migrate deploy

echo "✅ Migrations aplicadas com sucesso!"

echo "🚀 Iniciando aplicação..."
node dist/main
