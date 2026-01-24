FROM oven/bun:1 AS base

WORKDIR /app

COPY ./package.json ./package.json
COPY ./apps/web/package.json ./apps/web/package.json
COPY ./turbo.json ./turbo.json
COPY ./packages ./packages
COPY ./bun.lock ./bun.lock

RUN bun install

COPY ./apps/web ./apps/web



WORKDIR /app/apps/web

RUN bun run build

WORKDIR /app/apps/web/dist
CMD ["bunx", "serve", "--port", "3000"]

