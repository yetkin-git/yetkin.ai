import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildKurumsalShortlistCsv,
  kurumsalCsvCell,
  kurumsalShortlistCsvContentDisposition,
  kurumsalShortlistCsvFilename,
  kurumsalShortlistCsvFilenameStar,
} from "@/lib/sales/kurumsal-shortlist-csv";
import {
  kurumsalJobSlugFromPath,
  KURUMSAL_JOB_EDGE_PATH_RE,
} from "@/lib/sales/kurumsal-job-edge-gate";
import { decideKurumsalScreeningQuota } from "@/lib/sales/kurumsal-screening-entitlement";
import {
  KURUMSAL_JOBS_PER_LICENSE,
  KURUMSAL_QUOTA_LOCK_NAMESPACE,
} from "@/lib/sales/kurumsal-screening-purpose";
import { parseKurumsalJobDraft, kurumsalJobVertical } from "@/lib/sales/kurumsal-screening";
import { yetkinCvSkillCatalog } from "@/lib/career/yetkincv";

function src(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

/** Gerçek bir `Response` başlığı kurar — ByteString sınırını gerçekten çalıştırır. */
function headerIsAcceptable(value: string): boolean {
  try {
    const response = new Response("x", { headers: { "content-disposition": value } });
    return response.headers.get("content-disposition") !== null;
  } catch {
    return false;
  }
}

describe("Kurumsal final denetimi — CSV başlığı (P0)", () => {
  it("Türkçe unvanlı ilanların CSV dışa aktarımı çökmez (ByteString sınırı)", () => {
    // Ölçülen hata: `filename` ham `ı`/`ü`/`ş` taşıyınca Response constructor TypeError atar.
    for (const title of [
      "Yazılım Mühendisi",
      "İstanbul Şube Şefi",
      "Depo Sorumlusu",
      "Çağrı Merkezi Ğ Yetkilisi",
      "Ölçüm ve Ölçeklendirme Uzmanı",
      "Data Analyst",
      "!!!",
      "",
    ]) {
      const disposition = kurumsalShortlistCsvContentDisposition(title);
      expect(headerIsAcceptable(disposition), title).toBe(true);
    }
  });

  it("filename ASCII; filename* UTF-8 yüzde kodlu", () => {
    const title = "Yazılım Mühendisi";
    const filename = kurumsalShortlistCsvFilename(title);
    expect(/^kisa-liste-[a-z0-9-]+\.csv$/.test(filename)).toBe(true);
    expect(filename).toBe("kisa-liste-yazilim-muhendisi.csv");
    const star = kurumsalShortlistCsvFilenameStar(title);
    // Yüzde kodlu gövde saf ASCII olmalı.
    expect(/^[\x20-\x7e]+$/.test(star)).toBe(true);
    expect(decodeURIComponent(star)).toBe("kisa-liste-yazılım-mühendisi.csv");
    const disposition = kurumsalShortlistCsvContentDisposition(title);
    expect(disposition).toContain(`filename="${filename}"`);
    expect(disposition).toContain(`filename*=UTF-8''${star}`);
  });

  it("boş/bozuk unvan güvenli varsayılana düşer", () => {
    for (const title of ["", "   ", "!!!", "☃☃☃"]) {
      expect(kurumsalShortlistCsvFilename(title)).toBe("kisa-liste-ilan.csv");
      expect(headerIsAcceptable(kurumsalShortlistCsvContentDisposition(title))).toBe(true);
    }
  });
});

describe("Kurumsal final denetimi — CSV formül enjeksiyonu", () => {
  it("tüm tehlikeli ön ekler kaçırılır", () => {
    for (const raw of ["=CMD()", "+1+1", "-1+1", "@SUM(A1)", "\t=CMD()", "\r=CMD()"]) {
      const cell = kurumsalCsvCell(raw);
      expect(cell.startsWith("'"), raw).toBe(true);
    }
  });

  it("baştaki boşluk/denetim karakteriyle gizlenen formül de kaçırılır", () => {
    // `" =CMD()"` naif `/^=/` testini atlatır ama Excel hücreyi formül sayar.
    for (const raw of [" =CMD()", "   =1+1", "\u0000@SUM(A1)", "\u000b-CMD()"]) {
      expect(kurumsalCsvCell(raw).startsWith("'"), JSON.stringify(raw)).toBe(true);
    }
  });

  it("sıradan adlar ve e-postalar kaçış almaz, tırnak/virgül doğru sarılır", () => {
    expect(kurumsalCsvCell("Ada Lovelace")).toBe("Ada Lovelace");
    expect(kurumsalCsvCell("ada@yetkin.test")).toBe("ada@yetkin.test");
    expect(kurumsalCsvCell("Lovelace, Ada")).toBe('"Lovelace, Ada"');
    expect(kurumsalCsvCell('Ada "ACE" Lovelace')).toBe('"Ada ""ACE"" Lovelace"');
  });

  it("CSV çıktısı ham cvSummary ve PII gövdesi taşımaz", () => {
    const csv = buildKurumsalShortlistCsv([
      {
        candidateName: "=CMD()",
        candidateEmail: "a@b.co",
        weightedScore: 77,
        band: "SHORTLISTED",
        certificateCode: null,
        appliedAt: new Date("2026-11-01T00:00:00.000Z"),
      },
    ]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).not.toMatch(/cvSummary|cv_summary/i);
    // Hücre kaçışlı: satır `'=CMD()` ile başlar, ham `=CMD()` ile değil.
    const dataLine = csv.split("\n")[1] ?? "";
    expect(dataLine.startsWith("'=CMD()")).toBe(true);
    expect(csv).toContain("'=CMD()");
  });
});

describe("Kurumsal final denetimi — ilan varlık kapısı (F1.4 gerçek 404)", () => {
  it("biçim: yalnız tek segmentli /ilan/<slug> yakalanır", () => {
    expect(KURUMSAL_JOB_EDGE_PATH_RE.test("/ilan/depo-sorumlusu")).toBe(true);
    expect(KURUMSAL_JOB_EDGE_PATH_RE.test("/ilan/depo-sorumlusu/")).toBe(true);
    expect(KURUMSAL_JOB_EDGE_PATH_RE.test("/ilan")).toBe(false);
    expect(KURUMSAL_JOB_EDGE_PATH_RE.test("/ilan/a/b")).toBe(false);
    expect(kurumsalJobSlugFromPath("/ilan/depo-sorumlusu")).toBe("depo-sorumlusu");
    expect(kurumsalJobSlugFromPath("/ilan/depo-sorumlusu/")).toBe("depo-sorumlusu");
    expect(kurumsalJobSlugFromPath("/ilan")).toBeNull();
    expect(kurumsalJobSlugFromPath("/ilan/a/b")).toBeNull();
    // Bozuk yüzde kodlaması boş slug'a iner → geçersiz → 404.
    expect(kurumsalJobSlugFromPath("/ilan/%E0%A4%A")).toBe("");
  });

  it("proxy gerçekten varlık kapısını çağırır (sayfadaki notFound() yetmez)", () => {
    const proxy = src("proxy.ts");
    expect(proxy).toContain("resolveKurumsalJobEdgeVerdict");
    expect(proxy).toContain("kurumsalJobSlugFromPath");
    // Kapı, yanıt gövdesi akmadan 404 basmalı. Çağrı yerini (import değil) bul.
    const callAt = proxy.indexOf("const verdict = await resolveKurumsalJobEdgeVerdict");
    expect(callAt).toBeGreaterThan(-1);
    const gateBlock = proxy.slice(callAt, callAt + 700);
    expect(gateBlock).toContain("status: 404");
    expect(gateBlock).toContain("x-robots-tag");
  });

  it("DB okunamazsa fail-open (canlı ilan yanlışlıkla 404 olmaz)", () => {
    const gate = src("lib/sales/kurumsal-job-edge-gate.ts");
    expect(gate).toContain('return "unknown"');
    // `unknown` kararı 404 basmamalı: proxy yalnız `missing` üzerinde keser.
    const proxy = src("proxy.ts");
    expect(proxy).toContain('verdict === "missing"');
  });
});

describe("Kurumsal final denetimi — kota matematiği (F2.1)", () => {
  it("kota paket sayısı × ilan hakkı; kapatılmış ilan da sayılır", () => {
    expect(KURUMSAL_JOBS_PER_LICENSE).toBe(3);
    expect(decideKurumsalScreeningQuota({ clearedPackCount: 1, jobCount: 0 })).toEqual({
      ok: true,
      jobQuota: 3,
      remainingJobs: 3,
    });
    expect(decideKurumsalScreeningQuota({ clearedPackCount: 1, jobCount: 2 })).toEqual({
      ok: true,
      jobQuota: 3,
      remainingJobs: 1,
    });
    // Aç-kapat döngüsü kotayı geri kazanmaz: jobCount tüm satırlardır.
    expect(decideKurumsalScreeningQuota({ clearedPackCount: 1, jobCount: 3 })).toEqual({
      ok: false,
      jobQuota: 3,
    });
    expect(decideKurumsalScreeningQuota({ clearedPackCount: 1, jobCount: 99 }).ok).toBe(false);
    // İkinci paket kotayı ikiye katlar.
    expect(decideKurumsalScreeningQuota({ clearedPackCount: 2, jobCount: 3 })).toEqual({
      ok: true,
      jobQuota: 6,
      remainingJobs: 3,
    });
    // Bozuk/sıfır girdi çökmez.
    expect(decideKurumsalScreeningQuota({ clearedPackCount: 0, jobCount: 0 }).ok).toBe(false);
    expect(decideKurumsalScreeningQuota({ clearedPackCount: -5, jobCount: -1 }).ok).toBe(false);
  });

  it("yarış: kota sayımı ve ilan yazımı aynı advisory kilit altında", () => {
    const load = src("lib/sales/kurumsal-screening-load.ts");
    expect(load).toContain("pg_advisory_xact_lock");
    expect(load).toContain("lockKurumsalQuotaForOwner");
    // Kilit, entitlement kontrolünden ÖNCE alınmalı.
    const lockAt = load.indexOf("await lockKurumsalQuotaForOwner");
    const entitlementAt = load.indexOf("assertKurumsalScreeningEntitlement(input.ownerUserId, tx, catalog)");
    expect(lockAt).toBeGreaterThan(-1);
    expect(entitlementAt).toBeGreaterThan(lockAt);
    expect(KURUMSAL_QUOTA_LOCK_NAMESPACE).toBeGreaterThan(0);
  });

  it("kota kapısı katalog okumasını transaction DIŞINDA yapar (serverless havuz ölümü)", () => {
    // Ölçülen üretim hatası: katalog okuması global getPrisma() istemcisini kullanır.
    // `$transaction` bloğunun içinde çağrılırsa ikinci bağlantı istenir; Vercel
    // serverless havuzu `max: 1` olduğu için bağlantı hiç açılmaz → pool_timeout → 500.
    // Bu yüzden katalog kararı tx'ten ÖNCE okunmalı, tx içinde yalnız saf sayım kalmalı.
    const load = src("lib/sales/kurumsal-screening-load.ts");
    const gateAt = load.indexOf("const catalog = await readKurumsalScreeningCatalogGate()");
    const txAt = load.indexOf("const row = await prisma.$transaction(async (tx) => {");
    expect(gateAt).toBeGreaterThan(-1);
    expect(txAt).toBeGreaterThan(-1);
    expect(gateAt).toBeLessThan(txAt);
    // Entitlement'ın kendi içinde global istemci katalog okuması OLMAMALI.
    const entitlement = src("lib/sales/kurumsal-screening-entitlement.ts");
    const fnAt = entitlement.indexOf("export async function assertKurumsalScreeningEntitlement");
    const fnBody = entitlement.slice(fnAt, fnAt + 1_400);
    expect(fnBody).not.toContain("createPrismaPriceCatalogStore()");
  });

  it("kota/numara/miras kontrolleri ilan yazımıyla aynı transaction'da", () => {
    const load = src("lib/sales/kurumsal-screening-load.ts");
    const createAt = load.indexOf("export async function createKurumsalJobPosting");
    const block = load.slice(createAt, createAt + 4000);
    expect(block).toContain("$transaction");
    expect(block).toContain("foreignClaim");
    expect(block).toContain("priorVerified");
    // Yazma transaction istemcisiyle: `tx.kurumsalJobPosting.create`.
    expect(block).toContain("tx.kurumsalJobPosting.create");
  });
});

describe("Kurumsal final denetimi — VKN/TCKN sınır durumları (F2.3)", () => {
  const skills = yetkinCvSkillCatalog("ecommerce") ?? [];
  const now = new Date("2026-11-26T12:00:00+03:00");
  function draftWithTax(taxNumber: string) {
    return parseKurumsalJobDraft(
      {
        companyName: "Ada Ltd",
        title: "Depo sorumlusu",
        vertical: "ECOMMERCE",
        description: "Depo sayımı, iade ve kanal stoğu aynı kaynaktan yürür. Ölçülmeyen vaat yazılmaz.",
        taxNumber,
        criteriaWeights: [
          { key: skills[0]?.key, weight: 50 },
          { key: skills[1]?.key, weight: 30 },
          { key: skills[2]?.key, weight: 20 },
        ],
        minScore: 75,
        shortlistLimit: 5,
      },
      (vertical) => {
        const row = kurumsalJobVertical(vertical);
        return row ? yetkinCvSkillCatalog(row.yetkinCvVerticalId) : null;
      },
      now,
    );
  }

  it("mod 10/11 hataları ve sentetik diziler reddedilir", () => {
    for (const bad of [
      "0000000000",
      "1111111111",
      "4444444444", // checksum tutar ama sentetik tekrar → yine de reddedilir
      "9999999999",
      "1234567890",
      "12345678901",
      "1000000001", // VKN son hane hatası
      "10000000078".slice(0, 10), // VKN uzunluğunda ama checksum'ı TCKN'e ait
      "10000000147", // TCKN 11. hane hatalı
      "0123456789",
    ]) {
      expect(draftWithTax(bad).ok, bad).toBe(false);
    }
  });

  it("checksum'ı tutan numaralar kabul edilir", () => {
    for (const good of [
      "1000000000",
      "1000000018",
      "1000000026",
      "1111111114",
      "10000000078",
      "10000000146",
    ]) {
      const parsed = draftWithTax(good);
      expect(parsed.ok, good).toBe(true);
    }
  });

  it("numara zorunlu; boş ilan açılamaz (kalıcı noindex tuzağı kapanır)", () => {
    const parsed = draftWithTax("");
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.error).toMatch(/zorunlu/i);
    }
  });
});

describe("Kurumsal final denetimi — admin yüzeyi denetim mührü", () => {
  it("teklif durum geçişi audit log yazar ve mühürsüz geçmez", () => {
    const write = src("lib/kernel/admin/kurumsal-offer-write.ts");
    expect(write).toContain("writeSuperAdminAudit");
    expect(write).toContain("offer_request_status");
    expect(write).toContain("SUPER_ADMIN_AUDIT_SEAL_MISSED");
    const audit = src("lib/kernel/admin/audit-log.ts");
    expect(audit).toContain('"offer_request_status"');
  });

  it("admin rotaları süper admin kapısında ve sicilde", () => {
    const map = src("lib/kernel/security/route-auth-map.ts");
    expect(map).toContain('"/api/admin/b2b/[id]": "admin"');
    expect(map).toContain('"/api/admin/ops/employer-verify": "admin"');
    const patchRoute = src("app/api/(kernel)/admin/b2b/[id]/route.ts");
    expect(patchRoute).toContain("requireSuperAdmin");
    const verifyRoute = src("app/api/(kernel)/admin/ops/employer-verify/route.ts");
    expect(verifyRoute).toContain("requireSuperAdmin");
    expect(verifyRoute).toContain("writeSuperAdminAudit");
  });
});

describe("Kurumsal final denetimi — lead hunisi (F2.4/F2.5)", () => {
  it("honeypot doluysa DB'ye yazmadan sahte 200", () => {
    const lead = src("app/api/lead/route.ts");
    const honeypotAt = lead.indexOf("honeypotFilled(record)");
    const createAt = lead.indexOf("kurumsalOfferRequest.create");
    expect(honeypotAt).toBeGreaterThan(-1);
    expect(createAt).toBeGreaterThan(-1);
    expect(honeypotAt).toBeLessThan(createAt);
    expect(lead).toContain("received: true");
  });

  it("mükerrer kontrolü yarışa kapalı ve yanıt künye sızdırmıyor", () => {
    const lead = src("app/api/lead/route.ts");
    expect(lead).toContain("pg_advisory_xact_lock");
    expect(lead).toContain("KURUMSAL_LEAD_LOCK_NAMESPACE");
    // Eski yanıt başka bir firmanın adını/şehrini geri basıyordu.
    // Blok, `create` çağrısına kadar kesilir; komşu kod değil yanıt gövdesi ölçülür.
    const start = lead.indexOf("const existing = await tx.kurumsalOfferRequest.findFirst");
    const end = lead.indexOf("const created = await tx.kurumsalOfferRequest.create");
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const duplicateBlock = lead.slice(start, end);
    expect(duplicateBlock).toContain("duplicate: true");
    expect(duplicateBlock).not.toContain("companyName");
    expect(duplicateBlock).not.toContain("city");
    expect(duplicateBlock).not.toContain("quotedAmountMinor");
  });

  it("fiyat anlık görüntüsü transaction DIŞINDA alınır (serverless havuz ölümü)", () => {
    // Ölçülen üretim hatası: `snapshotKurumsalOfferQuotedAmountMinor` global
    // getPrisma() istemcisini kullanır; `$transaction` içinde çağrılırsa ikinci
    // bağlantı ister → serverless `max: 1` havuzunda pool_timeout → 500.
    const lead = src("app/api/lead/route.ts");
    const quoteAt = lead.indexOf("await snapshotKurumsalOfferQuotedAmountMinor(packageKey)");
    const txAt = lead.indexOf("await prisma.$transaction(async (tx) => {");
    expect(quoteAt).toBeGreaterThan(-1);
    expect(txAt).toBeGreaterThan(-1);
    expect(quoteAt).toBeLessThan(txAt);
  });

  it("honeypot yanıtı gerçek başarı yanıtıyla aynı şekli taşır (bot fark etmez)", () => {
    // Eski yanıt yalnız `{received, duplicate}` dönüyordu; gerçek yanıt ise
    // `request.id` taşır. Bot bu farktan tuzağı anlardı.
    const lead = src("app/api/lead/route.ts");
    const hpAt = lead.indexOf("if (honeypotFilled(record))");
    const createAt = lead.indexOf("const companyName = clip(");
    expect(hpAt).toBeGreaterThan(-1);
    expect(createAt).toBeGreaterThan(hpAt);
    const honeypotBlock = lead.slice(hpAt, createAt);
    expect(honeypotBlock).toContain("request:");
    expect(honeypotBlock).toContain("id: fakeOfferRequestId()");
    expect(honeypotBlock).toContain("status:");
    expect(honeypotBlock).toContain("quotedAmountMinor:");
    // DB'ye dokunmaz.
    expect(honeypotBlock).not.toContain("kurumsalOfferRequest.create");
    expect(honeypotBlock).not.toContain("getPrisma");
  });

  it("quotedAmountMinor katalog yokken null'a güvenli düşer", () => {
    const quote = src("lib/sales/kurumsal-lead-quote.ts");
    expect(quote).toContain("return null");
    expect(quote).toContain("catch");
    // Paket katalog eşlemesi olmayan anahtarlar null döner.
    expect(quote).toContain('"iso-auditor": null');
    expect(quote).toContain('"company-brain": null');
  });
});
