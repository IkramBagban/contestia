import { PrismaClient } from "./generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prismaClient: PrismaClient;
};
const prismaClient = globalForPrisma.prismaClient ?? new PrismaClient({});

if (process.env.NODE_ENV !== "development") {
  globalForPrisma.prismaClient = prismaClient;
}

export default prismaClient;
export * from "./generated/prisma/client";
