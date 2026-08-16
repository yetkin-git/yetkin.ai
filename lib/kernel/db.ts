import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";

let prisma: PrismaClient | null = null;
let pool: Pool | null = null;

export function getPrisma(): PrismaClient {
  if (prisma) {
    return prisma;
  }
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL tanımlı değil.");
  }
  pool = new Pool({ connectionString: url });
  prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  return prisma;
}
