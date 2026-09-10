import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  FREELANCER_PUBLIC_SURFACE_LOCKED,
  JUNIOR_PRODUCTION_LOCKED,
  WORKING_SHELL_NAV_ROOM_IDS,
  isFrozenShellPagePath,
} from "@/lib/kernel/compliance/circuit-breakers";
import { buildRailV1OpenApiDocument, RAIL_V1_HOPS } from "@/lib/kernel/http/v1-contract";
import { MARKETPLACE_SPLIT_LIVE } from "@/lib/kernel/payments/marketplace-split-live";
import { paymentsPort } from "@/lib/kernel/payments/port";
import { FROZEN_DISK_ROOMS, VERTICAL_ROOMS } from "@/lib/kernel/rooms.ssot";
import { PRODUCT_ROOM_PATHS } from "@/lib/copy/seo";

const ROOT = process.cwd();

function readSystemDoc(file: string): string {
  return readFileSync(join(ROOT, ".system_docs", file), "utf8");
}

describe("Faz 1 işletme resmi — belge zaman kipi ve kamu mühürü", () => {
  it("Anayasa A2 Freelancer tahsilatı Faz 2 zaman kipidir; A1–A5 gevşemez", () => {
    const anayasa = readSystemDoc("ANAYASA.md");
    expect(anayasa).toContain("Faz 2; lisanslı Split bağlıysa uygulanır");
    expect(anayasa).toContain("Faz 1 kamu vitrini");
    expect(anayasa).toContain("amountMinor");
    expect(anayasa).toContain("LedgerEntry");
    expect(anayasa).toContain("Satın Alınamaz");
    expect(anayasa).toContain("Sahte Finansal Veri Yasaktır");
    expect(anayasa).toContain("/api/wallet/withdraw");
  });

  it("Manifesto Faz 1 birincil kitle B2C öğrenen / kart sahibidir; işveren Faz 2 alıcısıdır", () => {
    const manifesto = readSystemDoc("MANIFESTO.md");
    expect(manifesto).toContain("B2C Öğrenen / Kart Sahibi");
    expect(manifesto).toContain("Faz 2 alıcısı");
    expect(manifesto).toContain("Faz 1 çalışan vitrin 3 odadır");
    expect(manifesto).toContain("4. oda (Freelancer) kilitli motordur");
    expect(manifesto).not.toMatch(/dört oda eşit omurga/i);
  });

  it("Pedagoji Junior odayı çocuk/veli ürünü sayar; başlangıç seviyesi Akademi Temel pakettir", () => {
    const pedagoji = readSystemDoc("PEDAGOJI.md");
    expect(pedagoji).toContain("Junior oda ≠ başlangıç seviyesi");
    expect(pedagoji).toContain("JUNIOR_PRODUCTION_LOCKED");
    expect(pedagoji).toContain("Temel Paketler");
    expect(pedagoji).toContain("18 yaş altı");
  });

  it("Runbook Motor 4 / Kamu Vitrini 3 Oda der; Akademi makbuzu SMTP env'ine bağlıdır", () => {
    const runbook = readSystemDoc("OPS_RUNBOOK.md");
    expect(runbook).toContain("Motor 4 / Kamu Vitrini 3 Oda (Panel, Akademi, Kariyer)");
    expect(runbook).toContain("academy-receipt-mail.ts");
    expect(runbook).toContain("Akademi mühürlü WAV **18**");
    expect(runbook).toContain("Faz 0: Akademi Canlı T3 Testi Prosedürü");
    expect(runbook).toContain("https://yetkin.ai/api/paytr/callback");
    expect(runbook).toContain("SMTP skipped");
    expect(runbook).not.toContain("Çalışan 4 oda");
    expect(runbook).not.toContain("Akademi satın alma makbuzu bu kanalda yoktur");
    expect(runbook).not.toContain("Akademi mühürlü WAV **2**");
    expect(runbook).toContain("RAIL_V1_HOPS`, **8 kayıt**");
  });

  it("kamu yüzeyi: freelancer ve junior 410; vitrin 3 oda; Split kapalı; Merchant asıl nakit portu", () => {
    expect(FREELANCER_PUBLIC_SURFACE_LOCKED).toBe(true);
    expect(JUNIOR_PRODUCTION_LOCKED).toBe(true);
    expect(MARKETPLACE_SPLIT_LIVE).toBe(false);
    expect(paymentsPort.id).toBe("merchant");
    expect([...WORKING_SHELL_NAV_ROOM_IDS]).toEqual(["dashboard", "academy", "career"]);
    expect(VERTICAL_ROOMS).toHaveLength(4);
    expect(FROZEN_DISK_ROOMS).toContain("junior");
    expect(isFrozenShellPagePath("/freelancer")).toBe(true);
    expect(isFrozenShellPagePath("/junior")).toBe(true);
    expect(isFrozenShellPagePath("/academy")).toBe(false);
    expect([...PRODUCT_ROOM_PATHS]).toEqual(["/academy", "/career"]);
  });

  it("OpenAPI kamu sözleşmesinde Marketplace tag'i ve freelancer path yoktur", () => {
    const document = buildRailV1OpenApiDocument();
    expect(RAIL_V1_HOPS).toHaveLength(8);
    expect(document.tags.map((tag) => tag.name)).toEqual(["Kernel", "Proof", "Payments"]);
    expect(document.tags.map((tag) => tag.name)).not.toContain("Marketplace");
    expect(document.info.description).toContain("Marketplace tag'i ve freelancer path'leri yayınlanmaz");
    expect(
      Object.keys(document.paths).filter(
        (path) => path.includes("/freelancer/") || path.includes("/client/"),
      ),
    ).toEqual([]);
    expect(JSON.stringify(document.paths)).not.toContain("Marketplace");
  });
});
