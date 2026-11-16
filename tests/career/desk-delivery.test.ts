import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  applyCareerDeskMemory,
  buildCareerDeskPackage,
  careerDeskBenchLinks,
  commitCareerDesk,
  readCareerDeskCommand,
  type CareerDeskMemory,
} from "@/lib/career/desk-brief";
import { buildProStudio } from "@/lib/tezgah/pro/build";

const ROOT = process.cwd();

function openMemory(): { memory: CareerDeskMemory; taskId: string } {
  const pack = buildCareerDeskPackage({
    kind: "PHOTO_STUDIO",
    productTitle: "Bez çanta",
    sku: "BEZ",
    approvedStockQty: 12,
  });
  const memory: CareerDeskMemory = { tasks: [], inbox: [], freelancerJobs: [] };
  const committed = commitCareerDesk(memory, {
    id: "task-1234",
    inboxEntryId: "inbox-1234",
    userId: "user-1",
    productId: "prod-1",
    pack,
  });
  return { memory, taskId: committed.taskId };
}

describe("çalışma odası teslimatı", () => {
  it("görev türünü ilgili tezgâh kısayoluna bağlar", () => {
    expect(careerDeskBenchLinks("PHOTO_STUDIO", "task-1234").map((link) => link.href)).toEqual([
      "/tezgah?tool=studio-photo&desk=task-1234",
      "/tezgah?tool=technical-drawing&desk=task-1234",
    ]);
    expect(careerDeskBenchLinks("MARKETPLACE_SEO", "task-1234")[0]?.href).toBe(
      "/tezgah?tool=pazaryeri&desk=task-1234",
    );
    expect(careerDeskBenchLinks("ADS_MANAGEMENT", "task-1234")[0]?.href).toContain("tool=reklam");
    expect(careerDeskBenchLinks("SITE_EDIT", "task-1234")[0]?.href).toContain("tool=saas-builder");
  });

  it("açıktan üretime, üretimden teslimata geçince gelen kutuya yansır", () => {
    const { memory, taskId } = openMemory();
    expect(memory.inbox[0]?.deskStatus).toBe("OPEN");
    const started = applyCareerDeskMemory(memory, {
      userId: "user-1",
      taskId,
      command: { type: "status", status: "IN_PROGRESS" },
    });
    expect(started).toMatchObject({ ok: true, status: "IN_PROGRESS", inboxStatus: "IN_PROGRESS" });
    expect(memory.inbox[0]?.deskStatus).toBe("IN_PROGRESS");
    const again = applyCareerDeskMemory(memory, {
      userId: "user-1",
      taskId,
      command: { type: "status", status: "IN_PROGRESS" },
    });
    expect(again).toMatchObject({ ok: true, replayed: true });
    const built = buildProStudio("studio-photo", {
      productName: "Bez çanta",
      features: "Yıkanabilir kanvas",
      market: "trendyol",
      widthPx: "1200",
      heightPx: "1800",
      background: "white",
      overlay: "hayir",
      galleryCount: "3",
    });
    expect(built.ok).toBe(true);
    if (!built.ok) {
      return;
    }
    const delivered = applyCareerDeskMemory(memory, {
      userId: "user-1",
      taskId,
      command: {
        type: "deliver",
        delivery: {
          tool: built.pack.tool,
          filename: built.pack.filename,
          summary: built.pack.summary,
          body: built.pack.body,
        },
      },
    });
    expect(delivered).toMatchObject({ ok: true, status: "DELIVERED", inboxStatus: "DELIVERED" });
    expect(memory.tasks[0]?.deliveryFilename).toBe("gorsel-studyo.md");
    expect(memory.inbox[0]?.deskStatus).toBe("DELIVERED");
    expect(memory.inbox[0]?.deliverySummary).toContain("gorsel-studyo.md");
    expect(memory.tasks[0]?.status).toBe("DELIVERED");
  });

  it("teslim edilmiş görevi geri almaz ve yabancı kullanıcıyı yazmaz", () => {
    const { memory, taskId } = openMemory();
    applyCareerDeskMemory(memory, {
      userId: "user-1",
      taskId,
      command: {
        type: "deliver",
        delivery: {
          tool: "technical-drawing",
          filename: "olcu-semasi.svg",
          summary: "Ölçü şeması hazır.",
          body: "<svg></svg>",
        },
      },
    });
    const backward = applyCareerDeskMemory(memory, {
      userId: "user-1",
      taskId,
      command: { type: "status", status: "IN_PROGRESS" },
    });
    expect(backward).toEqual({ ok: false, reason: "closed" });
    expect(memory.inbox[0]?.deskStatus).toBe("DELIVERED");
    const stranger = applyCareerDeskMemory(memory, {
      userId: "user-2",
      taskId,
      command: { type: "status", status: "IN_PROGRESS" },
    });
    expect(stranger).toEqual({ ok: false, reason: "missing" });
    expect(memory.freelancerJobs).toEqual([]);
  });

  it("komut kapısı eksik teslimatı düşürür", () => {
    expect(readCareerDeskCommand({ taskId: "task-1234", status: "IN_PROGRESS" })?.command).toEqual({
      type: "status",
      status: "IN_PROGRESS",
    });
    expect(readCareerDeskCommand({ taskId: "task-1234", status: "DELIVERED" })).toBeNull();
    expect(readCareerDeskCommand({ taskId: "kısa", status: "IN_PROGRESS" })).toBeNull();
    expect(
      readCareerDeskCommand({
        taskId: "task-1234",
        delivery: { tool: "studio-photo", filename: "gorsel-studyo.md", summary: "kısa", body: " " },
      }),
    ).toBeNull();
  });

  it("canlı yazma gelen kutu durumunu da günceller", () => {
    const sync = readFileSync(join(ROOT, "lib/career/desk-sync.ts"), "utf8");
    const service = readFileSync(join(ROOT, "lib/commerce/os-service.ts"), "utf8");
    const load = readFileSync(join(ROOT, "lib/commerce/os-load.ts"), "utf8");
    const board = readFileSync(join(ROOT, "components/career/desk-board.tsx"), "utf8");
    expect(sync).toContain("expertStatus: plan.inboxStatus");
    expect(sync).toContain("commerceInboxEntry.update");
    expect(sync).toContain("careerDeskTask.update");
    expect(service).toContain('expertStatus: "OPEN"');
    expect(load).toContain("entry.expertStatus");
    expect(board).toContain("calisma-odasi");
    expect(board).toContain("bench.href");
    expect(readFileSync(join(ROOT, "app/api/career/desk/route.ts"), "utf8")).toContain('auth = "session"');
  });
});
