#!/usr/bin/env tsx
/**
 * Canlı IDOR mühür zinciri — statik bağ. Canlı Postgres yok.
 * Prebuild: kernel authorize + freelancer iş tahtası + doğrudan teklif/ekip/mesaj/tahkim
 * + akademi sınav/satın alma + kariyer portföy.
 * Donmuş Arena ihale tahtası 410 envanteridir; `test:frozen`.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const issues: string[] = [];

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const pkgRaw = readFileSync(join(ROOT, "package.json"), "utf8");
const pkg = JSON.parse(pkgRaw) as { scripts?: Record<string, string> };
const scripts = pkg.scripts ?? {};
const idor = scripts["verify:idor-seals"] ?? "";
const prebuild = scripts["verify:prebuild"] ?? "";
const nightly = scripts["verify:nightly"] ?? "";

if (!idor.includes("scripts/verify-idor-seals.ts")) {
  issues.push("package.json verify:idor-seals: scripts/verify-idor-seals.ts hedefi yok");
}
if (!idor.includes("tests/kernel/authorize.test.ts")) {
  issues.push("package.json verify:idor-seals: kernel authorize vitest yok");
}
if (!idor.includes("tests/freelancer/idor-job-board.test.ts")) {
  issues.push("package.json verify:idor-seals: freelancer IDOR vitest yok");
}
if (!idor.includes("tests/freelancer/idor-party-forbidden.test.ts")) {
  issues.push("package.json verify:idor-seals: freelancer taraf/mesaj/ekip/tahkim IDOR vitest yok");
}
if (!idor.includes("tests/freelancer/idor-direct-offers.test.ts")) {
  issues.push("package.json verify:idor-seals: doğrudan teklif IDOR vitest yok");
}
if (!idor.includes("tests/academy/idor-exam-purchase.test.ts")) {
  issues.push("package.json verify:idor-seals: akademi sınav/satın alma IDOR vitest yok");
}
if (!idor.includes("tests/career/idor-portfolio.test.ts")) {
  issues.push("package.json verify:idor-seals: kariyer portföy IDOR vitest yok");
}
if (idor.includes("tests/arena/")) {
  issues.push("package.json verify:idor-seals: tests/arena 410 envanteridir — test:frozen");
}
if (!prebuild.includes("verify:idor-seals")) {
  issues.push("package.json verify:prebuild: verify:idor-seals yok");
}
if (nightly.includes("tests/arena/")) {
  issues.push("package.json verify:nightly: tests/arena canlı yeşil değildir");
}

const ROUTE_SEALS: ReadonlyArray<{ file: string; needles: readonly string[] }> = [
  {
    file: "app/api/freelancer/direct-offers/route.ts",
    needles: ["requireSession", "listDirectOffersForInvitee", "user.id"],
  },
  {
    file: "app/api/freelancer/direct-offers/[id]/accept/route.ts",
    needles: ["actorUserId: user.id", "acceptDirectFreelancerOffer"],
  },
  {
    file: "app/api/freelancer/direct-offers/[id]/decline/route.ts",
    needles: ["actorUserId: user.id", "declineDirectFreelancerOffer"],
  },
  {
    file: "app/api/freelancer/squad/route.ts",
    needles: ["user.id !== contract.clientId", "actorUserId: user.id"],
  },
  {
    file: "app/api/freelancer/contracts/[id]/messages/route.ts",
    needles: ["actorUserId: user.id", "listFreelancerContractMessages"],
  },
  {
    file: "app/api/freelancer/dispute/route.ts",
    needles: ["user.id !== contract.clientId", "actorUserId: user.id"],
  },
  {
    file: "lib/freelancer/engine.ts",
    needles: ["job.inviteeId !== command.actorUserId", "ForbiddenError"],
  },
  {
    file: "lib/freelancer/messages.ts",
    needles: ["command.actorUserId !== contract.clientId", "ForbiddenError"],
  },
  {
    file: "lib/freelancer/squad-engine.ts",
    needles: ["command.actorUserId !== contract.freelancerId", "ForbiddenError"],
  },
  {
    file: "lib/freelancer/dispute-engine.ts",
    needles: ["actorUserId !== contract.clientId", "ForbiddenError"],
  },
];

for (const row of ROUTE_SEALS) {
  const source = readSrc(row.file);
  for (const needle of row.needles) {
    if (!source.includes(needle)) {
      issues.push(`${row.file}: IDOR iğnesi yok — ${needle}`);
    }
  }
}

if (issues.length > 0) {
  console.error(["verify:idor-seals BAŞARISIZ:", ...issues.map((row) => `  ✗ ${row}`)].join("\n"));
  process.exit(1);
}

console.log(
  "verify:idor-seals OK — canlı zincir kernel authorize + freelancer (iş tahtası, doğrudan teklif, mesaj, ekip, tahkim) + akademi exam/purchase + kariyer portföy; Arena 410 dışı.",
);
