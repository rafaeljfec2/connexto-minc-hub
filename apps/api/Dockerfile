FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN npm install -g turbo

# Prune the workspace to only include the api and its deps
FROM base AS prune
WORKDIR /app
COPY . .
RUN turbo prune --scope=@minc-teams/api --docker

# Install dev dependencies (needed for build)
FROM base AS dev-deps
WORKDIR /app
COPY --from=prune /app/out/json/ .
COPY --from=prune /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Install prod dependencies (needed for runtime)
FROM base AS prod-deps
WORKDIR /app
COPY --from=prune /app/out/json/ .
COPY --from=prune /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --prod --frozen-lockfile

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=dev-deps /app/ .
COPY --from=prune /app/out/full/ .
RUN turbo run build --filter=@minc-teams/api

# Production stage
# Production stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy everything from prod-deps to ensure we have all node_modules in their correct places
COPY --from=prod-deps /app/ .

# Copy built artifacts
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 3000

CMD ["node", "apps/api/dist/main"]
