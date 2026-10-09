#!/usr/bin/env tsx
/**
 * Eski ad. Canlı mühür `verify-junior-pilot-seals` ile aynı kontrolleri koşar.
 * Bu dosya artık exit 1 ile emekli numarası yapmaz.
 */

import { juniorPilotSealIssues } from "./verify-junior-pilot-seals";

const issues = juniorPilotSealIssues();
if (issues.length > 0) {
  console.error(
    ["verify:junior-guardianship-seals BAŞARISIZ:", ...issues.map((row) => `  ✗ ${row}`)].join("\n"),
  );
  process.exit(1);
}

console.log("verify:junior-guardianship-seals OK — aynı mühür: verify-junior-pilot-seals.");
