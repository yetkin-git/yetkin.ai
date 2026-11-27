import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildOutreachUnsubscribeToken,
  buildOutreachUnsubscribeUrl,
  OUTREACH_UNSUBSCRIBE_SECRET_MIN,
  readOutreachUnsubscribeSecret,
  verifyOutreachUnsubscribeToken,
} from "@/lib/kernel/outreach/token";
import {
  composeOutreachTemplate,
  isCorporateMailbox,
  isFreeMailbox,
  outreachCopyIssue,
  outreachDraftCopyIssue,
  outreachDayStartUtc,
  outreachImportChannel,
  outreachImportFindings,
  outreachImportNote,
  parseOutreachDraftEdit,
  parseOutreachSettingsPatch,
  planOutreachImport,
  readOutreachImportVertical,
  withUnsubscribeFooter,
  OUTREACH_COMMERCIAL_NOTICE,
  OUTREACH_FREE_MAIL_DOMAINS,
  OUTREACH_IMPORT_FINDINGS_MARK,
  OUTREACH_IMPORT_MAX_ROWS,
  OUTREACH_VERTICAL_LINKS,
} from "@/lib/kernel/outreach/policy";
import {
  readOutreachSender,
  senderDomainCollides,
  transactionalSenderDomains,
} from "@/lib/kernel/outreach/sender";

const ROOT = process.cwd();
const SECRET = "x".repeat(OUTREACH_UNSUBSCRIBE_SECRET_MIN);

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("outreach gönderen alan adı izolasyonu", () => {
  it("OUTREACH_FROM_EMAIL boşsa fail-closed durur", () => {
    const state = readOutreachSender({});
    expect(state.ready).toBe(false);
    if (!state.ready) {
      expect(state.issue).toContain("OUTREACH_FROM_EMAIL");
    }
  });

  it("transactional alan adıyla aynı adresi reddeder", () => {
    const state = readOutreachSender({
      OUTREACH_FROM_EMAIL: "ekip@yetkin.ai",
      NOTICE_MAIL_FROM: "bildirim@yetkin.ai",
      NOTICE_SMTP_HOST: "smtp.example.com",
    });
    expect(state.ready).toBe(false);
    if (!state.ready) {
      expect(state.issue).toContain("aynı");
    }
  });

  it("ayrı alt alan adını kabul eder ve SMTP kimliğini okur", () => {
    const state = readOutreachSender({
      OUTREACH_FROM_EMAIL: "ekip@iletisim.yetkin.ai",
      NOTICE_MAIL_FROM: "bildirim@yetkin.ai",
      NOTICE_SMTP_HOST: "smtp.example.com",
      NOTICE_SMTP_PORT: "465",
      NOTICE_SMTP_USER: "user",
      NOTICE_SMTP_PASS: "pass",
    });
    expect(state.ready).toBe(true);
    if (state.ready) {
      expect(state.from).toBe("ekip@iletisim.yetkin.ai");
      expect(state.domain).toBe("iletisim.yetkin.ai");
      expect(state.transport).toBe("smtp");
    }
  });

  it("SMTP ve Resend yoksa gönderen hazır değildir", () => {
    const state = readOutreachSender({
      OUTREACH_FROM_EMAIL: "ekip@iletisim.yetkin.ai",
      NOTICE_MAIL_FROM: "bildirim@yetkin.ai",
    });
    expect(state.ready).toBe(false);
  });

  it("alan adı karşılaştırması üst alan adını ayırır", () => {
    expect(senderDomainCollides("yetkin.ai", ["yetkin.ai"])).toBe(true);
    expect(senderDomainCollides("iletisim.yetkin.ai", ["yetkin.ai"])).toBe(false);
    expect(transactionalSenderDomains({ NOTICE_MAIL_FROM: "a@yetkin.ai" })).toEqual(["yetkin.ai"]);
  });
});

describe("RET jetonu", () => {
  it("imzalı jetonu doğrular", () => {
    const token = buildOutreachUnsubscribeToken("Buyer@Firma.com.tr", SECRET);
    const result = verifyOutreachUnsubscribeToken(token, SECRET);
    expect(result).toEqual({ ok: true, email: "buyer@firma.com.tr" });
  });

  it("kurcalanmış jetonu reddeder", () => {
    const token = buildOutreachUnsubscribeToken("buyer@firma.com.tr", SECRET);
    const parts = token.split(".");
    const forged = `${parts[0]}.${parts[1]}.${"a".repeat(43)}`;
    expect(verifyOutreachUnsubscribeToken(forged, SECRET).ok).toBe(false);
    expect(verifyOutreachUnsubscribeToken(token, "y".repeat(40)).ok).toBe(false);
    expect(verifyOutreachUnsubscribeToken("bozuk", SECRET).ok).toBe(false);
  });

  it("sır yoksa hiçbir jeton geçmez", () => {
    const token = buildOutreachUnsubscribeToken("buyer@firma.com.tr", SECRET);
    expect(verifyOutreachUnsubscribeToken(token, null).ok).toBe(false);
  });

  it("kısa sır çevreden okunmaz", () => {
    expect(readOutreachUnsubscribeSecret({ OUTREACH_UNSUBSCRIBE_SECRET: "kisa" })).toBeNull();
    expect(readOutreachUnsubscribeSecret({ OUTREACH_UNSUBSCRIBE_SECRET: SECRET })).toBe(SECRET);
  });

  it("mutlak RET adresi üretir", () => {
    const url = buildOutreachUnsubscribeUrl({
      email: "buyer@firma.com.tr",
      secret: SECRET,
      env: { NEXT_PUBLIC_APP_URL: "https://yetkin.ai/" },
    });
    expect(url.startsWith("https://yetkin.ai/api/outreach/unsubscribe?token=")).toBe(true);
  });
});

describe("kurumsal adres ve kara liste kapısı", () => {
  it("ücretsiz sağlayıcıları reddeder", () => {
    for (const domain of OUTREACH_FREE_MAIL_DOMAINS) {
      expect(isCorporateMailbox(`kisi@${domain}`)).toBe(false);
    }
    expect(isFreeMailbox("kisi@mail.gmail.com")).toBe(true);
    expect(isCorporateMailbox("satinalma@firma.com.tr")).toBe(true);
    expect(isCorporateMailbox("bozuk-adres")).toBe(false);
  });
});

describe("metin kapıları", () => {
  const unsubscribeUrl = "https://yetkin.ai/api/outreach/unsubscribe?token=abc";

  it("şablon taslağı taslak kapısından geçer", () => {
    const draft = composeOutreachTemplate({
      companyName: "Örnek Makine",
      sector: "Üretim",
      vertical: "KURUMSAL",
    });
    expect(outreachDraftCopyIssue({ vertical: "KURUMSAL", ...draft })).toEqual({ ok: true });
    // Altbilgi DB metninde değildir; gönderim anında basılır.
    expect(draft.body).not.toContain(OUTREACH_COMMERCIAL_NOTICE);
  });

  it("RET altbilgisi idempotent eklenir", () => {
    const once = withUnsubscribeFooter("Merhaba.", unsubscribeUrl);
    expect(once).toContain(OUTREACH_COMMERCIAL_NOTICE);
    expect(once).toContain(unsubscribeUrl);
    expect(withUnsubscribeFooter(once, unsubscribeUrl)).toBe(once);
  });

  it("altbilgisiz gövde gönderime kapanır", () => {
    const draft = composeOutreachTemplate({
      companyName: "Örnek Makine",
      sector: "Üretim",
      vertical: "KURUMSAL",
    });
    const result = outreachCopyIssue({
      vertical: "KURUMSAL",
      subject: draft.subject,
      body: draft.body,
      unsubscribeUrl,
    });
    expect(result).toEqual({ ok: false, reason: "missing_footer" });
  });

  it("overclaim ve spam kalıbını yakalar", () => {
    const base = composeOutreachTemplate({
      companyName: "Örnek Makine",
      sector: "Üretim",
      vertical: "KURUMSAL",
    });
    const overclaim = outreachDraftCopyIssue({
      vertical: "KURUMSAL",
      subject: base.subject,
      body: `${base.body}\nBu program kesin hibe kazandırır.`,
    });
    expect(overclaim).toEqual({ ok: false, reason: "overclaim" });

    const spam = outreachDraftCopyIssue({
      vertical: "KURUMSAL",
      subject: base.subject,
      body: `${base.body}\nBedava deneme, son şans!`,
    });
    expect(spam).toEqual({ ok: false, reason: "spam" });
  });

  it("dikey bağlantısı olmayan gövdeyi reddeder", () => {
    const result = outreachDraftCopyIssue({
      vertical: "HIBE",
      subject: "Kısa bir not",
      body: "Merhaba, bu metin yeterince uzun ama doğru bağlantıyı taşımıyor maalesef.",
    });
    expect(result).toEqual({ ok: false, reason: "missing_link" });
    expect(OUTREACH_VERTICAL_LINKS.HIBE).toContain("tezgah");
  });
});

describe("panel girişleri", () => {
  it("günlük tavan TRT gününe göre hesaplanır", () => {
    // 27 Kasım 2026 01:30 TRT = 26 Kasım 22:30 UTC → TRT günü 27'si olmalı.
    const lateUtc = new Date("2026-11-26T22:30:00.000Z");
    expect(outreachDayStartUtc(lateUtc).toISOString()).toBe("2026-11-26T21:00:00.000Z");
    // 27 Kasım 09:00 TRT = 06:00 UTC — aynı gün başlangıcı.
    const morning = new Date("2026-11-27T06:00:00.000Z");
    expect(outreachDayStartUtc(morning).toISOString()).toBe("2026-11-26T21:00:00.000Z");
  });

  it("ayar yaması tavanı 15–20 bandında tutar", () => {
    expect(parseOutreachSettingsPatch({ dailyLimit: 15 })).toEqual({
      ok: true,
      value: { dailyLimit: 15 },
    });
    expect(parseOutreachSettingsPatch({ dailyLimit: 20 }).ok).toBe(true);
    expect(parseOutreachSettingsPatch({ dailyLimit: 14 }).ok).toBe(false);
    expect(parseOutreachSettingsPatch({ dailyLimit: 21 }).ok).toBe(false);
    expect(parseOutreachSettingsPatch({ sendHourTrt: 9 }).ok).toBe(true);
    expect(parseOutreachSettingsPatch({ sendHourTrt: 3 }).ok).toBe(false);
    expect(parseOutreachSettingsPatch({}).ok).toBe(false);
  });

  it("taslak düzenlemesi ücretsiz adresi reddeder", () => {
    const base = {
      id: "clx000000000000000000000",
      subject: "Kısa bir not",
      body: "Merhaba, bu gövde yeterince uzun ve kurumsal bir tanışma metni taşıyor.",
    };
    expect(parseOutreachDraftEdit({ ...base, recipientEmail: "kisi@gmail.com" }).ok).toBe(false);
    expect(parseOutreachDraftEdit({ ...base, recipientEmail: "satinalma@firma.com.tr" }).ok).toBe(true);
  });
});

describe("kurumsal hedef içe aktarma", () => {
  const clean = {
    suppressed: new Set<string>(),
    taken: new Set<string>(),
  };

  it("27 ücretsiz sağlayıcıyı ve bozuk adresi eler", () => {
    expect(OUTREACH_FREE_MAIL_DOMAINS).toHaveLength(27);
    const lines = [
      "companyName,recipientEmail,sector,vertical,sourceNote",
      ...OUTREACH_FREE_MAIL_DOMAINS.map(
        (domain, index) => `Firma ${index},kisi@${domain},Üretim,KURUMSAL,not`,
      ),
      "Alt Alan,kisi@mail.gmail.com,Üretim,KURUMSAL,not",
      "Bozuk Satır,bozuk-adres,Üretim,KURUMSAL,not",
      "Örnek Makine,satinalma@ornekmakine.com.tr,Üretim,KURUMSAL,\"fuar, 2026\"",
    ];
    const plan = planOutreachImport(lines.join("\n"), clean);
    expect(plan.reasons.personalMailbox).toBe(28);
    expect(plan.reasons.invalidEmail).toBe(1);
    expect(plan.accepted).toEqual([
      {
        companyName: "Örnek Makine",
        recipientEmail: "satinalma@ornekmakine.com.tr",
        sector: "Üretim",
        vertical: "KURUMSAL",
        sourceNote: "fuar, 2026",
      },
    ]);
    expect(plan.rejected).toBe(29);
  });

  it("kara listeyi, kopyayı ve dikey etiketini ayırır", () => {
    const text = [
      "Örnek Makine;satin@ornekmakine.com.tr;Üretim;ETICARET;fuar",
      "Örnek Makine;satin@ornekmakine.com.tr;Üretim;ETICARET;ikinci",
      "Hibe A.Ş;hibe@hibe-firma.com.tr;Enerji;HIBE;çağrı",
      "Kara Liste;kara@kara-firma.com.tr;Üretim;KURUMSAL;ret",
      "Eksik Firma;ali@eksik-firma.com.tr;;KURUMSAL;not",
    ].join("\n");
    const plan = planOutreachImport(text, {
      suppressed: new Set(["KARA@kara-firma.com.tr"]),
      taken: new Set(["eski@eski-firma.com.tr"]),
    });
    expect(plan.reasons.duplicate).toBe(1);
    expect(plan.reasons.suppressed).toBe(1);
    expect(plan.reasons.incomplete).toBe(1);
    expect(plan.accepted.map((row) => row.vertical)).toEqual(["ETICARET", "HIBE"]);
    expect(outreachImportChannel("ETICARET")).toBe("WEB_TETKIK");
    expect(outreachImportChannel("HIBE")).toBe("TUBITAK_HIBE");
    const findings = outreachImportFindings(plan.accepted[0]!);
    expect(findings).toContain(OUTREACH_IMPORT_FINDINGS_MARK);
    expect(readOutreachImportVertical(findings)).toBe("ETICARET");
    expect(outreachImportNote("fuar")).toBe("admin-csv · fuar");
    expect(readOutreachImportVertical("")).toBeNull();
  });

  it("tavanı aşan satırı eler", () => {
    const lines = Array.from(
      { length: OUTREACH_IMPORT_MAX_ROWS + 1 },
      (_, index) => `Firma ${index},ali${index}@firma${index}.com.tr,Üretim,KURUMSAL,not`,
    );
    const plan = planOutreachImport(lines.join("\n"), clean);
    expect(plan.accepted).toHaveLength(OUTREACH_IMPORT_MAX_ROWS);
    expect(plan.reasons.limit).toBe(1);
  });

  it("içe aktarma rotası admin mührü ve sayaç eylemi taşır", () => {
    const route = read("app/api/(kernel)/admin/outreach/import/route.ts");
    expect(route).toContain('export const auth = "admin"');
    expect(route).toContain("requireSuperAdmin");
    expect(read("lib/kernel/outreach/write.ts")).toContain('"outreach_import"');
    expect(read("lib/kernel/admin/audit-log.ts")).toContain('"outreach_import"');
    expect(read("lib/kernel/security/route-auth-map.ts")).toContain(
      '"/api/admin/outreach/import": "admin"',
    );
    expect(read("components/kernel/admin-outreach-desk.tsx")).toContain("ADMIN_OUTREACH_IMPORT_PATH");
    const sql = read("prisma/migrations/20261127223000_outreach_import_audit/migration.sql");
    expect(sql).toContain("'outreach_import'");
  });
});

describe("şema ve sicil mühürleri", () => {
  const sql = readFileSync(
    join(ROOT, "prisma/migrations/20261127210000_outreach_engine/migration.sql"),
    "utf8",
  );

  it("üç tablo FORCE RLS ve kapsamsız deny alır", () => {
    for (const table of [
      "outreach_settings",
      "outreach_campaign_drafts",
      "outreach_suppressions",
    ]) {
      expect(sql).toContain(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`);
      expect(sql).toContain(`ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY`);
    }
    expect(sql).toContain("rls_deny_unscoped");
    expect(sql).toContain("USING (false)");
    expect(sql).not.toContain("FOR INSERT");
    expect(sql).not.toContain("FOR UPDATE");
    expect(sql).not.toContain("FOR DELETE");
  });

  it("tavan 15–20 ve motor kapalı doğar", () => {
    expect(sql).toContain("daily_limit");
    expect(sql).toContain(">= 15");
    expect(sql).toContain("<= 20");
    expect(sql).toContain("'OUTREACH_ENGINE_ENABLED', false, 15, 9");
  });

  it("SENT damgası sent_at olmadan yazılmaz", () => {
    expect(sql).toContain("outreach_campaign_drafts_sent_at_status");
    expect(sql).toContain("'SENT' AND \"sent_at\" IS NOT NULL");
  });

  it("audit eylem listesi SQL ile TS aynıdır", () => {
    for (const action of ["outreach_switch", "outreach_draft", "outreach_send"]) {
      expect(sql).toContain(`'${action}'`);
      expect(read("lib/kernel/admin/audit-log.ts")).toContain(`"${action}"`);
    }
  });

  it("şema modeli b2b.prisma içinde ve map adları aynıdır", () => {
    const schema = read("prisma/schema/b2b.prisma");
    expect(schema).toContain("model OutreachSettings");
    expect(schema).toContain("model OutreachCampaignDraft");
    expect(schema).toContain("model OutreachSuppression");
    expect(schema).toContain('@@map("outreach_settings")');
    expect(schema).toContain('@@map("outreach_campaign_drafts")');
    expect(schema).toContain('@@map("outreach_suppressions")');
    expect(schema).toContain("enum OutreachVertical");
    expect(schema).toContain("enum OutreachDraftStatus");
  });

  it("Inngest 09:00 TRT işi ve RET ucu sicilde", () => {
    const inngest = read("lib/kernel/jobs/inngest.ts");
    expect(inngest).toContain('id: "outreach-daily-send"');
    expect(inngest).toContain("0 6 * * *");
    expect(inngest).toContain("step.sleep");
    expect(inngest).toContain("outreachDailySend");
    expect(read("app/api/(kernel)/outreach/unsubscribe/route.ts")).toContain('export const auth = "public"');
    expect(read("lib/kernel/security/route-auth-map.ts")).toContain('"/api/outreach/unsubscribe": "public"');
    expect(read("lib/kernel/security/route-auth-map.ts")).toContain('"/api/admin/outreach": "admin"');
  });

  it("çevre şablonu yeni iki anahtarı taşır", () => {
    const example = read(".env.example");
    expect(example).toContain('OUTREACH_FROM_EMAIL=""');
    expect(example).toContain('OUTREACH_UNSUBSCRIBE_SECRET=""');
    expect(read("lib/kernel/env.ts")).toContain("OUTREACH_FROM_EMAIL");
    expect(read("lib/kernel/env.ts")).toContain("OUTREACH_UNSUBSCRIBE_SECRET");
  });
});
