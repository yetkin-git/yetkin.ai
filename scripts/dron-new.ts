#!/usr/bin/env tsx
/**
 * Yeni dron iskeleti — `npm run dron:new -- --id=ornek`.
 * Kayıt `lib/dronlar/kayit.ts`'ye kapalı doğar. Açmak: `DRON_<ID>_OPEN=1`.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const KAYIT = join(ROOT, "lib/dronlar/kayit.ts");

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function parseId(argv: string[]): string {
  const flag = argv.find((item) => item.startsWith("--id="));
  const raw = flag ? flag.slice("--id=".length) : argv.find((item) => !item.startsWith("-"));
  const id = raw?.trim() ?? "";
  if (!/^[a-z][a-z0-9-]{1,31}$/.test(id)) {
    fail("Kullanım: npm run dron:new -- --id=ornek-dron  (kebab-case, 2–32 karakter)");
  }
  return id;
}

function titleFromId(id: string): string {
  return id
    .split("-")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function envName(id: string): string {
  return `DRON_${id.toUpperCase().replace(/-/g, "_")}_OPEN`;
}

const id = parseId(process.argv.slice(2));
const label = titleFromId(id);
const kayit = readFileSync(KAYIT, "utf8");
if (new RegExp(`\\bid:\\s*"${id}"`).test(kayit)) {
  fail(`Dron zaten kayıtlı: ${id}`);
}
if (kayit.includes(`"${id}"`) && /FROZEN_DISK_ROOMS[\s\S]*\] as const/.test(kayit)) {
  const frozen = kayit.match(/export const FROZEN_DISK_ROOMS = \[([\s\S]*?)\] as const;/);
  if (frozen?.[1]?.includes(`"${id}"`)) {
    fail(`${id} donmuş disk odasıdır; yeni dron olamaz.`);
  }
}

const libDir = join(ROOT, "lib", id);
const apiDir = join(ROOT, "app", "api", id, "pulse");
if (existsSync(libDir)) {
  fail(`lib/${id} zaten var`);
}

const roomLine = `  { id: "${id}", path: "/${id}", label: "${label}", blurb: "Kapalı dron — bayrak ile açılır" },`;
const roomsNeedle = `  { id: "freelancer", path: "/freelancer", label: "Freelancer", blurb: "Arka plan · modül pasif" },
] as const;`;
if (!kayit.includes(roomsNeedle)) {
  fail("VERTICAL_ROOMS freelancer satırı beklenen biçimde değil; kayit.ts elle güncellenir.");
}

const kayitRow = `  {
    id: "${id}",
    path: "/${id}",
    label: "${label}",
    blurb: "Kapalı dron — bayrak ile açılır",
    hops: [],
    sahipEkip: "amiral",
    kapali: true,
    bayrakEnv: "${envName(id)}",
  },
];`;
const kayitNeedle = `    bayrakEnv: "DRON_FREELANCER_OPEN",
  },
];`;
if (!kayit.includes(kayitNeedle)) {
  fail("DRON_KAYIT freelancer satırı beklenen biçimde değil; kayit.ts elle güncellenir.");
}

const nextKayit = kayit
  .replace(roomsNeedle, `  { id: "freelancer", path: "/freelancer", label: "Freelancer", blurb: "Arka plan · modül pasif" },
${roomLine}
] as const;`)
  .replace(kayitNeedle, `    bayrakEnv: "DRON_FREELANCER_OPEN",
  },
${kayitRow}`);

writeFileSync(KAYIT, nextKayit, "utf8");

mkdirSync(libDir, { recursive: true });
writeFileSync(
  join(libDir, "index.ts"),
  `export const MODULE_ID = ${JSON.stringify(id)} as const;

/** Yeni dron kapalı doğar. Açmak: ${envName(id)}=1 */
export const DRON_HAPPY_PATH = ["pulse"] as const;
`,
  "utf8",
);
writeFileSync(
  join(libDir, "schema.prisma.tmpl"),
  `// Kopyala: prisma/schema/${id}.prisma — boş şablon; model icat etme.
// datasource ve generator base.prisma'dadır.

model ${titleFromId(id).replace(/\s+/g, "")}Pulse {
  id        String   @id
  userId    String
  createdAt DateTime @default(now())

  @@index([userId])
  @@map("${id.replace(/-/g, "_")}_pulse")
}
`,
  "utf8",
);

mkdirSync(apiDir, { recursive: true });
writeFileSync(
  join(apiDir, "route.ts"),
  `import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";

export const auth = "session" as const;

/** Örnek hop iskeleti. v1 siciline yazılmadan Dron tüketemez. */
export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    return jsonOk({
      pulse: {
        live: false,
        dronId: ${JSON.stringify(id)},
        userId: user.id,
      },
    });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
`,
  "utf8",
);

console.log(`dron:new OK — ${id} kaydı kapalı doğdu.`);
console.log(`  lib/${id}/index.ts`);
console.log(`  lib/${id}/schema.prisma.tmpl → prisma/schema/${id}.prisma (model hazır olunca)`);
console.log(`  app/api/${id}/pulse/route.ts`);
console.log(`Açmak: ${envName(id)}=1`);
console.log("v1 hop: packages/kernel/src/http/v1-hops-meta.ts + Zod bind.");
