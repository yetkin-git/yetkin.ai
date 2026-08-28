#!/usr/bin/env tsx
/**
 * OpenAPI v1 JSON'u Zod sicilinden yazar. Elle spec ikinci kaynak değildir.
 * --check: disk kopyası saparsa exit 1.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { serializeRailV1OpenApiDocument } from "../lib/kernel/http/v1-contract";

const ROOT = process.cwd();
const TARGET = join(ROOT, "lib/kernel/http/openapi-v1.json");
const check = process.argv.includes("--check");
const serialized = serializeRailV1OpenApiDocument();

if (check) {
  if (!existsSync(TARGET)) {
    console.error("openapi-v1.json yok — npm run generate:openapi-v1");
    process.exit(1);
  }
  const onDisk = readFileSync(TARGET, "utf8");
  if (onDisk !== serialized) {
    console.error("openapi-v1.json sapması — npm run generate:openapi-v1");
    process.exit(1);
  }
  console.log("verify:openapi-v1 OK — JSON kopyası Zod sicili ile örtüşür.");
  process.exit(0);
}

mkdirSync(dirname(TARGET), { recursive: true });
writeFileSync(TARGET, serialized, "utf8");
console.log(`wrote ${TARGET}`);
