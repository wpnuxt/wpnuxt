# demo.wpnuxt.com: playgrounds/full as a Node server, deployed on Coolify (.github/workflows/demo.yml).
# Build from the repository root, the playground depends on the workspace packages:
#   docker build -f playgrounds/full/Dockerfile .

FROM node:24-slim AS build
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH
RUN corepack enable

COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile --filter "@wpnuxt/playground-full..."

# CI=true: use the committed schema.graphql instead of downloading it (downloadSchema: !IS_CI)
ENV CI=true \
    NUXT_SOURCEMAPS=false \
    NODE_OPTIONS=--max-old-space-size=4096
RUN pnpm --filter "@wpnuxt/playground-full^..." run build
# A build-time revalidate secret registers POST /api/_wpnuxt/revalidate. It is random so no real
# secret ends up in the image; the real one is set at runtime with NUXT_WP_NUXT_REVALIDATE_SECRET.
RUN WPNUXT_REVALIDATE_SECRET=$(node -e "console.log(crypto.randomUUID())") \
    pnpm --filter @wpnuxt/playground-full run build && \
    test -f playgrounds/full/.output/server/index.mjs

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000
COPY --from=build --chown=node:node /app/playgrounds/full/.output ./.output
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
USER node
CMD ["node", ".output/server/index.mjs"]
