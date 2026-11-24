import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { logEvent } from "@/lib/kernel/observability/log";
import {
  TEZGAH_FREE_MONTHLY_CREDITS,
  TEZGAH_PRO_MONTHLY_CREDITS,
} from "@/lib/tezgah/catalog";
import {
  tezgahMonthKey,
  tezgahPreviousMonthKey,
  tezgahRolloverCredits,
} from "@/lib/tezgah/quota";

/**
 * Faz 3 / S-01 — aylık kredi devri taraması.
 *
 * **Dürüstlük notu (önemli):** Devir *okuma anında deterministik* hesaplanır
 * (`lib/tezgah/quota.ts` → `tezgahRolloverCredits`). Yani kullanıcı ayın 1'inde
 * ilk üretimini yaptığında devir zaten hesaba katılmış olur; cron beklenmez.
 *
 * Bu tarama bir **ikinci bakiye yazmaz** ve `tezgah_daily_quotas` satırına kredi
 * eklemez (aksi hâlde devir iki kez sayılırdı). Yaptığı üç iş:
 *
 * 1. **Denetim ölçümü** — kaç kullanıcı devir hakkı kazandı, toplam kaç kredi taşındı.
 *    Bu sayı Inngest çıktısına ve yapılandırılmış günlüğe düşer (operatör görünürlüğü).
 * 2. **Sıfır satır temizliği** — önceki ayın kullanılmayan (0 kullanımlı) satırları silinir;
 *    tablo şişmez, RLS mührü değişmez.
 * 3. **Eşik kontrolü** — devir alan kullanıcı oranı %100 ise (kimse kredi kullanmamış)
 *    bu bir ürün sinyalidir ve `warn` olarak işaretlenir; kredi ekonomisi ölü demektir.
 *
 * Pro ve ücretsiz havuz ayrı sayılır: Pro kullanıcının devri Pro tabanına (500),
 * ücretsiz kullanıcının devri ücretsiz tabana (30) göre hesaplanır.
 *
 * `DATABASE_URL` yoksa tarama no-op döner (sahte sayı basılmaz).
 */

export type TezgahRolloverScanResult = {
  periodKey: string;
  previousPeriodKey: string;
  scannedSubjects: number;
  rolloverSubjects: number;
  rolloverCredits: number;
  purgedRows: number;
  applied: false;
};

export const TEZGAH_ROLLOVER_NOOP: TezgahRolloverScanResult = {
  periodKey: "",
  previousPeriodKey: "",
  scannedSubjects: 0,
  rolloverSubjects: 0,
  rolloverCredits: 0,
  purgedRows: 0,
  applied: false,
};

export type TezgahRolloverRow = {
  subjectKey: string;
  poolKey: string;
  usedCount: number;
};

/**
 * Saf hesap: satır listesi → devir özeti. DB yok. Test edilebilir.
 *
 * `proSubjectKeys` içinde olan özne Pro tabanıyla, olmayan ücretsiz tabanla ölçülür.
 * `lite` dışındaki havuzlar (tetkik ömür boyu) devir almaz.
 */
export function summarizeTezgahRollover(input: {
  rows: readonly TezgahRolloverRow[];
  proSubjectKeys?: readonly string[];
}): { rolloverSubjects: number; rolloverCredits: number; scannedSubjects: number } {
  const pro = new Set(input.proSubjectKeys ?? []);
  let rolloverSubjects = 0;
  let rolloverCredits = 0;
  let scannedSubjects = 0;
  for (const row of input.rows) {
    if (row.poolKey !== "lite") {
      continue;
    }
    scannedSubjects += 1;
    const baseLimit = pro.has(row.subjectKey)
      ? TEZGAH_PRO_MONTHLY_CREDITS
      : TEZGAH_FREE_MONTHLY_CREDITS;
    const carried = tezgahRolloverCredits({ baseLimit, previousUsed: row.usedCount });
    if (carried > 0) {
      rolloverSubjects += 1;
      rolloverCredits += carried;
    }
  }
  return { rolloverSubjects, rolloverCredits, scannedSubjects };
}

/** Pro satırı olan özneler — devir tabanı Pro havuzudur. ACTIVE + süresi dolmamış. */
async function loadProSubjectKeys(now: Date): Promise<string[]> {
  const rows = await getPrisma().tezgahSubscription.findMany({
    where: { status: "ACTIVE", expiresAt: { gt: now } },
    select: { userId: true },
  });
  return rows.map((row) => row.userId);
}

export async function runTezgahCreditRolloverScan(
  now: Date = new Date(),
): Promise<TezgahRolloverScanResult> {
  const periodKey = tezgahMonthKey(now);
  const previousPeriodKey = tezgahPreviousMonthKey(now);
  if (!process.env.DATABASE_URL?.trim()) {
    return { ...TEZGAH_ROLLOVER_NOOP, periodKey, previousPeriodKey };
  }
  const prisma = getPrisma();
  const [rows, proSubjectKeys] = await Promise.all([
    prisma.tezgahDailyQuota.findMany({
      where: { dateKey: previousPeriodKey, poolKey: "lite" },
      select: { subjectKey: true, poolKey: true, usedCount: true },
    }),
    loadProSubjectKeys(now),
  ]);
  const summary = summarizeTezgahRollover({ rows, proSubjectKeys });

  // Sıfır kullanımlı satır silinir: devir 0'dır, tablo şişmez. Kullanılmış satır
  // **silinmez** — devir gelecek ay da aynı artıktan hesaplanacaksa kaynak durur.
  let purgedRows = 0;
  try {
    const purged = await prisma.tezgahDailyQuota.deleteMany({
      where: { dateKey: previousPeriodKey, poolKey: "lite", usedCount: 0 },
    });
    purgedRows = purged.count;
  } catch {
    purgedRows = 0;
  }

  const saturated =
    summary.scannedSubjects > 0 && summary.rolloverSubjects === summary.scannedSubjects;

  logEvent({
    level: saturated ? "warn" : "info",
    event: "tezgah.credit.rollover",
    action: periodKey,
    reason: saturated ? "no_usage_all_rolled_over" : "measured",
    applied: false,
    status: summary.rolloverSubjects,
  });

  return {
    periodKey,
    previousPeriodKey,
    scannedSubjects: summary.scannedSubjects,
    rolloverSubjects: summary.rolloverSubjects,
    rolloverCredits: summary.rolloverCredits,
    purgedRows,
    applied: false,
  };
}
