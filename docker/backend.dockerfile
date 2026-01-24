FROM oven/bun:1 AS base

WORKDIR /app

COPY ./package.json ./package.json
COPY ./apps/backend/package.json ./apps/backend/package.json
COPY ./turbo.json ./turbo.json
COPY ./packages ./packages
COPY ./bun.lock ./bun.lock

RUN bun install

COPY ./apps/backend ./apps/backend

WORKDIR /app/packages/db

RUN bunx prisma generate

WORKDIR /app/apps/backend

CMD ["bun", "./src/index.ts"]

