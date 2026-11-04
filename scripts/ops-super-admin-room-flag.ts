#!/usr/bin/env tsx
/**
 * Oda bayrağı env değişimi sonrası append-only günlük.
 *
 *   npx tsx scripts/ops-super-admin-room-flag.ts --room=junior --open=0 --note="Vercel prod kapatma"
 *
 * Env bayrağını bu betik değiştirmez; yalnız super_admin_audit_logs satırı yazar.
 */

import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import dotenv from "dotenv";
import { Client } from "pg";
import {
  isForbiddenPoolerUrl,
  resolveMigratorConnectionUrl,
  withPgLibpqSslCompat,
} from "./ops-migrate-lib";
import { parseRoomFlagArgs, runSuperAdminRoomFlagAudit } from "./ops-super-admin-room-flag-lib";

const ROOT = process.cwd();
dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

function fail(message: string): never {
  console.error(`ops:super-admin-room-flag BAŞARISIZ: ${message}`);
  process.exit(1);
}

async function main(): Promise<void> {
  const parsed = parseRoomFlagArgs(process.argv.slice(2));
  const url = resolveMigratorConnectionUrl({
    DIRECT_URL: process.env.DIRECT_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  });
  if (!url) {
    fail("DIRECT_URL veya DATABASE_URL yok. .system_docs/OPS_RUNBOOK.md");
  }
  if (isForbiddenPoolerUrl(url)) {
    fail("Günlük yazımı transaction pooler (:6543) üzerinden çalışmaz.");
  }

  const client = new Client({ connectionString: withPgLibpqSslCompat(url) });
  await client.connect();
  try {
    const result = await runSuperAdminRoomFlagAudit(
      {
        async writeAudit(row) {
          await client.query(
            `INSERT INTO super_admin_audit_logs (id, actor_user_id, action, target, detail)
             VALUES ($1, $2, $3, $4, $5)`,
            [randomUUID(), row.actorUserId, row.action, row.target, row.detail],
          );
        },
      },
      parsed,
    );
    if (!result.written) {
      console.warn(
        "ops:super-admin-room-flag: satır yazılmadı (SUPER_ADMIN_USER_ID boş veya aktör eşleşmedi). Env değişimi yine de geçerlidir.",
      );
      process.exit(0);
    }
    console.log(
      JSON.stringify({
        event: "super_admin_audit.room_flag",
        roomId: result.roomId,
        envKey: result.envKey,
        open: parsed.open,
      }),
    );
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
