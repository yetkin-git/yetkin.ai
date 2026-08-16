import dotenv from "dotenv";
import { resolve } from "node:path";
import { defineConfig } from "prisma/config";

dotenv.config({ path: resolve(".env.local") });
dotenv.config();

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
    ...(process.env.SHADOW_DATABASE_URL
      ? { shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL }
      : {}),
  },
});
