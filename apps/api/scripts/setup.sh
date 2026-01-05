#!/bin/bash

# Script de setup do backend MINC Teams API

set -e

echo "🚀 Setup do Backend MINC Teams API"
echo ""

# Verificar se está na pasta correta
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na pasta apps/api/"
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js >= 18.0.0"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versão 18+ é necessário. Versão atual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Verificar pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm não encontrado. Instale pnpm >= 8.0.0"
    exit 1
fi

echo "✅ pnpm $(pnpm -v) encontrado"

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Instale Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose não encontrado"
    exit 1
fi

echo "✅ Docker encontrado"

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Criando arquivo .env a partir do .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Arquivo .env criado"
        echo "⚠️  IMPORTANTE: Edite o arquivo .env e altere o JWT_SECRET!"
    else
        echo "❌ Arquivo .env.example não encontrado"
        exit 1
    fi
else
    echo "✅ Arquivo .env já existe"
fi

# Verificar se PostgreSQL está rodando
echo ""
echo "🐘 Verificando PostgreSQL..."
cd ../../

if docker-compose ps postgres 2>/dev/null | grep -q "Up"; then
    echo "✅ PostgreSQL já está rodando"
else
    echo "📦 Subindo PostgreSQL..."
    docker-compose up -d postgres
    echo "⏳ Aguardando PostgreSQL inicializar..."
    sleep 5
    echo "✅ PostgreSQL iniciado"
fi

cd apps/api

# Instalar dependências
echo ""
echo "📦 Instalando dependências..."
pnpm install

echo ""
echo "✅ Setup concluído!"
echo ""
echo "Próximos passos:"
echo "1. Edite o arquivo .env e altere o JWT_SECRET"
echo "2. Execute 'pnpm dev' para iniciar o servidor"
echo "3. Acesse http://localhost:3001/api/docs para ver a documentação Swagger"
echo ""
