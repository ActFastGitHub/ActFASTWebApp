/* This handles the TypeScript for globalThis.prisma in prismadb.tsx */
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}
