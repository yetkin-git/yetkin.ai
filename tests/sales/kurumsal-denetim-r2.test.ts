import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { NotFoundError, BadRequestError } from "@/lib/kernel/http/errors";
import {
  assertKurumsalScreeningEntitlement,
  decideKurumsalScreeningQuota,
  type KurumsalCatalogGate,
  type KurumsalEntitlementDb,
} from "@/lib/sales/kurumsal-screening-entitlement";
import {
  KURUMSAL_JOBS_PER_LICENSE,
  KURUMSAL_SCREENING_ORDER_PURPOSE,
} from "@/lib/sales/kurumsal-screening-purpose";
import {
  setKurumsalJobActive,
  loadKurumsalShortlistCsvRows,
  type KurumsalJobMutationDb,
  type KurumsalShortlistDb,
} from "@/lib/sales/kurumsal-screening-load";
import {
  buildKurumsalShortlistCsv,
  kurumsalCsvCell,
} from "@/lib/sales/kurumsal-shortlist-csv";

function src(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

const LIVE_CATALOG: KurumsalCatalogGate = { ok: true, amountMinor: 290_000 };
const CLOSED_CATALOG: KurumsalCatalogGate = { ok: false, reason: "catalog-inactive" };

/** CLEARED sipariş sayısı ve ilan sayısı verilen sahte DB — gerçek Prisma değil. */
function fakeEntitlementDb(input: {
  clearedOrders: number;
  jobCount: number;
  purpose?: string;
}): KurumsalEntitlementDb & { countCalls: number } {
  const state = { countCalls: 0 };
  return {
    get countCalls() {
      return state.countCalls;
    },
    paymentOrder: {
      async findMany() {
        return Array.from({ length: input.clearedOrders }, (_, index) => ({
          merchantOid: `SP${index}`,
          purpose: input.purpose ?? KURUMSAL_SCREENING_ORDER_PURPOSE,
        }));
      },
    },
    kurumsalJobPosting: {
      async count() {
        state.countCalls += 1;
        return input.jobCount;
      },
    },
  };
}

describe("Denetim R2 — kota kapısı gerçekten çalıştırılır (F2.1 / D-01)", () => {
  it("1 paket → 3 hak; kapatılmış ilan da sayıldığı için 3 ilanda kapanır", async () => {
    const fresh = await assertKurumsalScreeningEntitlement(
      "owner-a",
      fakeEntitlementDb({ clearedOrders: 1, jobCount: 0 }),
      LIVE_CATALOG,
    );
    expect(fresh).toMatchObject({ ok: true, jobQuota: 3, remainingJobs: 3, clearedPackCount: 1 });

    const full = await assertKurumsalScreeningEntitlement(
      "owner-a",
      fakeEntitlementDb({ clearedOrders: 1, jobCount: 3 }),
      LIVE_CATALOG,
    );
    expect(full).toMatchObject({ ok: false, reason: "quota-exhausted" });

    // Aç-kapat döngüsü kotayı geri kazanmaz: 99 satır (hepsi kapalı olabilir) reddedilir.
    const abused = await assertKurumsalScreeningEntitlement(
      "owner-a",
      fakeEntitlementDb({ clearedOrders: 1, jobCount: 99 }),
      LIVE_CATALOG,
    );
    expect(abused.ok).toBe(false);
  });

  it("ikinci paket kotayı ikiye katlar", async () => {
    const two = await assertKurumsalScreeningEntitlement(
      "owner-b",
      fakeEntitlementDb({ clearedOrders: 2, jobCount: 3 }),
      LIVE_CATALOG,
    );
    expect(two).toMatchObject({ ok: true, jobQuota: 6, remainingJobs: 3 });
  });

  it("CLEARED olmayan / yanlış niyetli sipariş lisans üretmez", async () => {
    const noOrders = await assertKurumsalScreeningEntitlement(
      "owner-c",
      fakeEntitlementDb({ clearedOrders: 0, jobCount: 0 }),
      LIVE_CATALOG,
    );
    expect(noOrders).toMatchObject({ ok: false, reason: "license-missing" });

    // D-01: gevşek `contains` yok — başka ürünün niyeti lisans sayılmaz.
    const wrongPurpose = await assertKurumsalScreeningEntitlement(
      "owner-c",
      fakeEntitlementDb({
        clearedOrders: 1,
        jobCount: 0,
        purpose: "other-product:job-screening-pack",
      }),
      LIVE_CATALOG,
    );
    expect(wrongPurpose).toMatchObject({ ok: false, reason: "license-missing" });
  });

  it("katalog kapalıysa sayım bile yapılmaz", async () => {
    const db = fakeEntitlementDb({ clearedOrders: 5, jobCount: 0 });
    const closed = await assertKurumsalScreeningEntitlement("owner-d", db, CLOSED_CATALOG);
    expect(closed).toMatchObject({ ok: false, reason: "catalog-inactive" });
    expect(db.countCalls).toBe(0);
  });

  it("saf kota kararı sınır ve bozuk girdide çökmez", () => {
    expect(KURUMSAL_JOBS_PER_LICENSE).toBe(3);
    expect(decideKurumsalScreeningQuota({ clearedPackCount: 1, jobCount: 2 })).toEqual({
      ok: true,
      jobQuota: 3,
      remainingJobs: 1,
    });
    expect(decideKurumsalScreeningQuota({ clearedPackCount: 0, jobCount: 0 }).ok).toBe(false);
    expect(decideKurumsalScreeningQuota({ clearedPackCount: -4, jobCount: -9 }).ok).toBe(false);
    expect(decideKurumsalScreeningQuota({ clearedPackCount: 1.9, jobCount: 0.4 })).toEqual({
      ok: true,
      jobQuota: 3,
      remainingJobs: 3,
    });
  });
});

describe("Denetim R2 — çapraz işveren IDOR çalıştırılarak kanıtlanır (F1.5 / O-04)", () => {
  /** Sahibi `owner-a` olan tek ilan; başka owner sorguda bulunamaz. */
  function scopedDb(): KurumsalJobMutationDb & { updateCalls: number } {
    const state = { updateCalls: 0 };
    const row = {
      id: "job-1",
      slug: "depo-sorumlusu",
      isActive: true,
      deadlineAt: null as Date | null,
    };
    return {
      get updateCalls() {
        return state.updateCalls;
      },
      kurumsalJobPosting: {
        async findFirst(args) {
          // Gerçek Prisma gibi davranır: sahiplik filtresi tutmazsa null.
          if (args.where.id !== row.id || args.where.ownerUserId !== "owner-a") {
            return null;
          }
          return { ...row };
        },
        async update(args) {
          state.updateCalls += 1;
          return { id: args.where.id, isActive: args.data.isActive, slug: row.slug };
        },
      },
    };
  }

  it("kendi ilanını kapatır", async () => {
    const db = scopedDb();
    const result = await setKurumsalJobActive(
      { ownerUserId: "owner-a", jobId: "job-1", isActive: false },
      db,
    );
    expect(result).toEqual({ id: "job-1", isActive: false, applyPath: "/ilan/depo-sorumlusu" });
    expect(db.updateCalls).toBe(1);
  });

  it("başka işverenin jobId'si 404 alır ve hiç yazma yapılmaz", async () => {
    const db = scopedDb();
    await expect(
      setKurumsalJobActive({ ownerUserId: "owner-b", jobId: "job-1", isActive: false }, db),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(db.updateCalls).toBe(0);
  });

  it("süresi geçmiş ilan yeniden açılamaz", async () => {
    const db: KurumsalJobMutationDb = {
      kurumsalJobPosting: {
        async findFirst() {
          return {
            id: "job-1",
            slug: "eski-ilan",
            isActive: false,
            deadlineAt: new Date(Date.now() - 86_400_000),
          };
        },
        async update() {
          throw new Error("yazma olmamalı");
        },
      },
    };
    await expect(
      setKurumsalJobActive({ ownerUserId: "owner-a", jobId: "job-1", isActive: true }, db),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it("CSV dışa aktarımı çapraz işverende 404; kendi ilanında cvSummary taşımaz", async () => {
    const applications = [
      {
        id: "app-1",
        candidateName: "Ada Lovelace",
        candidateEmail: "ada@yetkin.test",
        weightedScore: 91,
        createdAt: new Date("2026-11-01T00:00:00.000Z"),
        certificateCode: "a".repeat(64),
      },
    ];
    const db: KurumsalShortlistDb = {
      kurumsalJobPosting: {
        async findFirst(args) {
          if (args.where.ownerUserId !== "owner-a") {
            return null;
          }
          return { title: "Depo Sorumlusu", minScore: 70, shortlistLimit: 1, applications };
        },
      },
    };
    await expect(
      loadKurumsalShortlistCsvRows({ ownerUserId: "owner-b", jobId: "job-1" }, db),
    ).rejects.toBeInstanceOf(NotFoundError);

    const own = await loadKurumsalShortlistCsvRows({ ownerUserId: "owner-a", jobId: "job-1" }, db);
    expect(own.rows).toHaveLength(1);
    const csv = buildKurumsalShortlistCsv(own.rows);
    expect(csv).not.toMatch(/cvSummary|cv_summary/i);
    // Satır nesnesinde CV gövdesi alanı hiç yok.
    expect(Object.keys(own.rows[0]!)).not.toContain("cvSummary");
  });
});

describe("Denetim R2 — CSV formül enjeksiyonu görünmez karakter atlatması", () => {
  it("sıfır genişlik, BOM, yön işareti ve tam genişlik '=' kaçırılır", () => {
    // Ölçülen atlatmalar: ilk sürüm bunları PLAIN bırakıyordu.
    for (const raw of [
      "\u200b=CMD()", // zero width space
      "\ufeff=CMD()", // BOM
      "\u200e+1+1", // left-to-right mark
      "\u200f@SUM(1)", // right-to-left mark
      "\u2028=CMD()", // line separator
      "\u2029-CMD()", // paragraph separator
      "\u2007=CMD()", // figure space
      "\u202f=CMD()", // narrow no-break space
      "\uff1dCMD()", // fullwidth equals
      "\u00a0=CMD()",
    ]) {
      expect(kurumsalCsvCell(raw).startsWith("'"), JSON.stringify(raw)).toBe(true);
    }
  });

  it("zararsız değerler kaçış almaz", () => {
    expect(kurumsalCsvCell("Ada Lovelace")).toBe("Ada Lovelace");
    expect(kurumsalCsvCell("ada@yetkin.test")).toBe("ada@yetkin.test");
    expect(kurumsalCsvCell("Lovelace, Ada")).toBe('"Lovelace, Ada"');
  });
});

describe("Denetim R2 — 90 günlük anonimleştirme idempotent (F1.6)", () => {
  it("idempotans anahtarı yalnız ad + e-posta; özet sabiti anahtar DEĞİL", () => {
    // KVKK talebi (`eraseCareerPersonalData`) özete farklı bir sabit yazar. Özet
    // filtreye katılırsa aynı satır ikinci kez güncellenir (iki akış birbirini ezer).
    const retention = src("lib/sales/kurumsal-retention.ts");
    const whereAt = retention.indexOf("const result = await prisma.kurumsalJobApplication.updateMany");
    const dataAt = retention.indexOf("data: {", whereAt);
    const whereBlock = retention.slice(whereAt, dataAt);
    expect(whereBlock).toContain("candidateName: KURUMSAL_RETENTION_ANON_NAME");
    expect(whereBlock).toContain("candidateEmail: KURUMSAL_RETENTION_ANON_EMAIL");
    expect(whereBlock).not.toContain("cvSummary");
  });

  it("anonimleştirme gerçekten çalışır: PII gider, puan/band bozulmaz", async () => {
    const updateMany = vi.fn(async (_args: unknown) => ({ count: 2 }));
    const findMany = vi.fn(async () => [{ id: "job-old" }]);
    vi.resetModules();
    vi.doMock("@/lib/kernel/db", () => ({
      getPrisma: () => ({ kurumsalJobPosting: { findMany }, kurumsalJobApplication: { updateMany } }),
    }));
    const { anonymizeExpiredKurumsalApplications, KURUMSAL_RETENTION_ANON_EMAIL } = await import(
      "@/lib/sales/kurumsal-retention"
    );
    const result = await anonymizeExpiredKurumsalApplications(new Date("2026-11-26T00:00:00.000Z"));
    expect(result.applicationsAnonymized).toBe(2);
    expect(result.jobsMatched).toBe(1);
    const arg = updateMany.mock.calls[0]?.[0] as {
      data: Record<string, unknown>;
      where: { jobId: { in: string[] } };
    };
    expect(arg.where.jobId.in).toEqual(["job-old"]);
    expect(arg.data.candidateEmail).toBe(KURUMSAL_RETENTION_ANON_EMAIL);
    // Puan ve band kolonlarına dokunulmaz.
    expect(Object.keys(arg.data)).not.toContain("weightedScore");
    expect(Object.keys(arg.data)).not.toContain("status");
    expect(Object.keys(arg.data)).not.toContain("testScore");
    vi.doUnmock("@/lib/kernel/db");
  });
});

describe("Denetim R2 — vergi numarası sahipliği yarışa kapalı (F2.3)", () => {
  it("numara kilidi sahip kilidinden sonra alınır (deadlock sırası)", () => {
    const load = src("lib/sales/kurumsal-screening-load.ts");
    const ownerLockAt = load.indexOf("await lockKurumsalQuotaForOwner(tx, input.ownerUserId)");
    const taxLockAt = load.indexOf("await lockKurumsalTaxNumber(tx, parsed.value.taxNumber)");
    const claimAt = load.indexOf("const foreignClaim = await tx.kurumsalJobPosting.findFirst");
    expect(ownerLockAt).toBeGreaterThan(-1);
    expect(taxLockAt).toBeGreaterThan(-1);
    expect(claimAt).toBeGreaterThan(-1);
    // Sıra: sahip → numara → sahiplik okuması. Ters sıra kilitlenme üretir.
    expect(taxLockAt).toBeGreaterThan(ownerLockAt);
    expect(claimAt).toBeGreaterThan(taxLockAt);
  });

  it("numara kilidi ayrı ad alanı kullanır (sahip kilidiyle çakışmaz)", async () => {
    const purpose = await import("@/lib/sales/kurumsal-screening-purpose");
    expect(purpose.KURUMSAL_TAX_LOCK_NAMESPACE).not.toBe(purpose.KURUMSAL_QUOTA_LOCK_NAMESPACE);
    expect(purpose.KURUMSAL_TAX_LOCK_NAMESPACE).toBeGreaterThan(0);
  });
});

describe("Denetim R2 — ödeme dönüş masası ve fatura künyesi (F2.12 / F2.13)", () => {
  it("kurumsal ve career masaları PayTR dönüş adresine yazılır", async () => {
    const { buildPaytrMerchantBrowserReturnUrl, PAYTR_RETURN_DESKS } = await import(
      "@/lib/kernel/payments/paytr/checkout"
    );
    // Ölçülen hata: iki masa listede yoktu, `?masa=` sessizce düşüyordu.
    expect(PAYTR_RETURN_DESKS).toContain("kurumsal");
    expect(PAYTR_RETURN_DESKS).toContain("career");
    const kurumsal = buildPaytrMerchantBrowserReturnUrl(
      "https://yetkin.ai",
      "kurumsal",
      "SPABCDEF123456",
    );
    expect(kurumsal).toContain("masa=kurumsal");
    expect(kurumsal).toContain("merchant_oid=SPABCDEF123456");
    const career = buildPaytrMerchantBrowserReturnUrl("https://yetkin.ai", "career", "SPABCDEF123456");
    expect(career).toContain("masa=career");
  });

  it("dönüş paneli bu iki masayı kendi yüzeyine indirir", async () => {
    const { kasaReturnHref, kasaReturnDesk, kasaReturnLabel } = await import(
      "@/components/kernel/kasa-return-panel"
    );
    expect(kasaReturnDesk("kurumsal")).toBe("kurumsal");
    expect(kasaReturnHref("kurumsal")).toBe("/kurumsal/ilanlar");
    expect(kasaReturnLabel("kurumsal")).toContain("Kısa Liste");
    expect(kasaReturnDesk("career")).toBe("career");
    expect(kasaReturnHref("career")).toBe("/career");
  });

  it("satın alma rotası fatura künyesini zorunlu tutar ve tahsilata geçirir", () => {
    const satin = src("app/api/kurumsal/satin-al/route.ts");
    // Künyesiz istek 422 almalı; künye tahsilat çağrısına geçmeli.
    expect(satin).toContain("billing: checkoutBillingInfoSchema");
    expect(satin).toContain("persistCheckoutBilling");
    expect(satin).toContain("billing,");
    expect(satin).toContain("Fatura künyesi eksik");
  });

  it("kokpit künye alanlarını toplar ve gönderir", () => {
    const cockpit = src("components/kurumsal/screening-cockpit.tsx");
    expect(cockpit).toContain("CheckoutBillingFields");
    expect(cockpit).toContain("isCheckoutBillingComplete");
    expect(cockpit).toContain("billing: normalized.billing");
  });
});
