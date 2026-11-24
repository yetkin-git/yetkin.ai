import { writeFileSync } from "node:fs";
import {
  GRANT_CALL_SEEDS_2027,
  GRANT_SEED_VERIFIED_AT,
  GRANT_SOURCE_SEEDS,
} from "@/lib/yetkinhibe/grant-call-seed-2027";

function quote(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

function textArray(rows: readonly string[]): string {
  return `ARRAY[${rows.map(quote).join(",")}]::TEXT[]`;
}

const lines: string[] = [];
for (const source of GRANT_SOURCE_SEEDS) {
  lines.push(
    `INSERT INTO "yetkinhibe_grant_sources" ("key", "label", "official_url", "updated_at") VALUES (${quote(source.key)}, ${quote(source.label)}, ${quote(source.officialUrl)}, CURRENT_TIMESTAMP) ON CONFLICT ("key") DO NOTHING;`,
  );
}
lines.push("");
for (const call of GRANT_CALL_SEEDS_2027) {
  lines.push(
    `INSERT INTO "yetkinhibe_grant_calls" ("id", "source_key", "title", "summary", "pool_amount_minor", "min_support_minor", "max_support_minor", "support_ratio_bps", "application_opens_at", "application_deadline", "eligibility_json", "required_documents", "tags", "official_info_url", "publication_url", "source_verified_at", "is_published", "data_version", "updated_at") VALUES (${quote(call.id)}, ${quote(call.sourceKey)}, ${quote(call.title)}, ${quote(call.summary)}, NULL, ${call.minSupportMinor}, ${call.maxSupportMinor}, ${call.supportRatioBps}, ${quote(call.applicationOpensAt)}, ${quote(call.applicationDeadline)}, ${quote(JSON.stringify(call.eligibility))}::jsonb, ${textArray(call.requiredDocuments)}, ${textArray(call.tags)}, ${quote(call.officialInfoUrl)}, ${call.publicationUrl ? quote(call.publicationUrl) : "NULL"}, ${quote(GRANT_SEED_VERIFIED_AT)}, true, 1, CURRENT_TIMESTAMP) ON CONFLICT ("id") DO NOTHING;`,
  );
  lines.push(
    `INSERT INTO "hibe_grant_call_revisions" ("id", "call_id", "data_version", "action", "actor_user_id", "snapshot_json") SELECT 'seed-' || ${quote(call.id)}, ${quote(call.id)}, 1, 'SEED', NULL, ${quote(JSON.stringify({ id: call.id, action: "SEED" }))}::jsonb WHERE EXISTS (SELECT 1 FROM "yetkinhibe_grant_calls" WHERE "id" = ${quote(call.id)}) AND NOT EXISTS (SELECT 1 FROM "hibe_grant_call_revisions" WHERE "id" = 'seed-' || ${quote(call.id)});`,
  );
}

writeFileSync(
  "prisma/migrations/20261123180000_yetkinhibe_faz1_catalog_write/seed-body.sql",
  `${lines.join("\n")}\n\nUPDATE "yetkinhibe_grant_calls" SET "source_key" = 'KALKINMA_AJANSI' WHERE "source_key" = 'BOLGESEL_AJANS';\nUPDATE "yetkinhibe_grant_calls" SET "is_published" = false WHERE "source_key" = 'RESMI_GAZETE';\nDELETE FROM "yetkinhibe_grant_sources" WHERE "key" = 'BOLGESEL_AJANS' AND NOT EXISTS (SELECT 1 FROM "yetkinhibe_grant_calls" WHERE "source_key" = 'BOLGESEL_AJANS');\n`,
);
console.log(GRANT_CALL_SEEDS_2027.length);
