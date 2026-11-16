/**
 * Kariyer çalışma odası görev paketi.
 * Freelancer kamu ilanı üretmez. Veritabanı yazmaz.
 * Durum geçişi ve teslimat burada planlanır; kayıt `desk-sync` yazar.
 */

import { tezgahDeskHref, type TezgahToolId } from "@/lib/tezgah/catalog";

export const CAREER_DESK_KINDS = [
  { id: "PHOTO_STUDIO", label: "Fotoğraf & Görsel Stüdyo" },
  { id: "MARKETPLACE_SEO", label: "Pazaryeri SEO & Katalog" },
  { id: "ADS_MANAGEMENT", label: "Özel Reklam Yönetimi" },
  { id: "SITE_EDIT", label: "Web Sitesi Teknik Düzenleme" },
] as const;

export type CareerDeskKind = (typeof CAREER_DESK_KINDS)[number]["id"];

export const CAREER_DESK_STATUSES = ["OPEN", "IN_PROGRESS", "DELIVERED"] as const;

export type CareerDeskStatus = (typeof CAREER_DESK_STATUSES)[number];

export const CAREER_DESK_HREF = "/career#calisma-odasi" as const;

export const CAREER_DESK_BENCHES: Record<CareerDeskKind, readonly { tool: TezgahToolId; label: string }[]> = {
  PHOTO_STUDIO: [
    { tool: "studio-photo", label: "Görsel & Ürün Stüdyosu" },
    { tool: "technical-drawing", label: "Teknik Çizim & Ölçü Şeması" },
  ],
  MARKETPLACE_SEO: [{ tool: "pazaryeri", label: "Pazaryeri Katalog Fabrikası" }],
  ADS_MANAGEMENT: [{ tool: "reklam", label: "Otonom Reklam Paketi" }],
  SITE_EDIT: [{ tool: "saas-builder", label: "Mini SaaS & Kod Üretici" }],
};

export function careerDeskStatusLabel(status: CareerDeskStatus): string {
  if (status === "IN_PROGRESS") {
    return "Üretimde";
  }
  if (status === "DELIVERED") {
    return "Teslim edildi";
  }
  return "Açık";
}

export function careerDeskBenchLinks(
  kind: CareerDeskKind,
  taskId: string,
): { label: string; href: string }[] {
  return CAREER_DESK_BENCHES[kind].map((bench) => ({
    label: bench.label,
    href: tezgahDeskHref(bench.tool, taskId),
  }));
}

export type CareerDeskPackage = {
  kind: CareerDeskKind;
  title: string;
  brief: string;
  href: typeof CAREER_DESK_HREF;
  freelancerJob: null;
};

export function isCareerDeskKind(value: string): value is CareerDeskKind {
  return CAREER_DESK_KINDS.some((row) => row.id === value);
}

export function careerDeskLabel(kind: CareerDeskKind): string {
  return CAREER_DESK_KINDS.find((row) => row.id === kind)?.label ?? kind;
}

export function buildCareerDeskPackage(input: {
  kind: CareerDeskKind;
  productTitle: string;
  sku: string;
  approvedStockQty: number;
}): CareerDeskPackage {
  const label = careerDeskLabel(input.kind);
  const title = `${label}: ${input.productTitle}`.slice(0, 120);
  const sku = input.sku.trim() || "yok";
  const brief = [
    `${label} paketi.`,
    `Ürün: ${input.productTitle}.`,
    `SKU: ${sku}.`,
    `Onaylı stok: ${input.approvedStockQty} adet.`,
    "Bu kayıt yalnız sizin Kariyer çalışma odanıza yazılır. Kamu ilanı açılmaz.",
  ]
    .join(" ")
    .slice(0, 2000);
  return {
    kind: input.kind,
    title,
    brief,
    href: CAREER_DESK_HREF,
    freelancerJob: null,
  };
}

export type CareerDeskDelivery = {
  tool: "studio-photo" | "technical-drawing" | "saas-builder";
  filename: string;
  summary: string;
  body: string;
};

export type CareerDeskSnapshot = {
  status: CareerDeskStatus;
  deliveryTool: string;
  deliveryFilename: string;
  deliverySummary: string;
  deliveryBody: string;
};

export type CareerDeskCommand =
  | { type: "status"; status: "IN_PROGRESS" }
  | { type: "deliver"; delivery: CareerDeskDelivery };

export type CareerDeskPlan =
  | { ok: false; reason: "closed" }
  | {
      ok: true;
      replayed: boolean;
      next: CareerDeskSnapshot;
      inboxStatus: CareerDeskStatus;
      inboxNote: string;
    };

export type CareerDeskRow = CareerDeskSnapshot & {
  id: string;
  userId: string;
  productId: string;
  inboxEntryId: string;
  kind: CareerDeskKind;
  title: string;
  brief: string;
};

export type CareerDeskInboxMirror = {
  id: string;
  body: string;
  kind: "EXPERT_TASK";
  deskStatus: CareerDeskStatus;
  deliverySummary: string;
};

export type CareerDeskMemory = {
  tasks: CareerDeskRow[];
  inbox: CareerDeskInboxMirror[];
  freelancerJobs: unknown[];
};

const EMPTY_DESK: CareerDeskSnapshot = {
  status: "OPEN",
  deliveryTool: "",
  deliveryFilename: "",
  deliverySummary: "",
  deliveryBody: "",
};

function inboxNote(status: CareerDeskStatus, summary: string): string {
  if (status !== "DELIVERED") {
    return "";
  }
  return summary.trim().slice(0, 240);
}

export function commitCareerDesk(
  memory: CareerDeskMemory,
  input: {
    id: string;
    inboxEntryId: string;
    userId: string;
    productId: string;
    pack: CareerDeskPackage;
  },
): { replayed: boolean; taskId: string; inboxEntryId: string; href: typeof CAREER_DESK_HREF; freelancerJob: null } {
  const prior = memory.tasks.find(
    (row) => row.userId === input.userId && row.productId === input.productId && row.kind === input.pack.kind,
  );
  if (prior) {
    return {
      replayed: true,
      taskId: prior.id,
      inboxEntryId: prior.inboxEntryId,
      href: CAREER_DESK_HREF,
      freelancerJob: null,
    };
  }
  memory.inbox.push({
    id: input.inboxEntryId,
    body: input.pack.brief,
    kind: "EXPERT_TASK",
    deskStatus: "OPEN",
    deliverySummary: "",
  });
  memory.tasks.push({
    id: input.id,
    userId: input.userId,
    productId: input.productId,
    inboxEntryId: input.inboxEntryId,
    kind: input.pack.kind,
    title: input.pack.title,
    brief: input.pack.brief,
    ...EMPTY_DESK,
  });
  return {
    replayed: false,
    taskId: input.id,
    inboxEntryId: input.inboxEntryId,
    href: CAREER_DESK_HREF,
    freelancerJob: null,
  };
}

export function readCareerDeskDelivery(value: unknown): CareerDeskDelivery | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const row = value as Record<string, unknown>;
  const tool = row.tool;
  if (tool !== "studio-photo" && tool !== "technical-drawing" && tool !== "saas-builder") {
    return null;
  }
  if (typeof row.filename !== "string" || !/^[a-z0-9][a-z0-9.-]{2,79}$/.test(row.filename)) {
    return null;
  }
  if (typeof row.summary !== "string" || typeof row.body !== "string") {
    return null;
  }
  const summary = row.summary.trim();
  if (summary.length < 2 || summary.length > 500 || row.body.trim().length < 2 || row.body.length > 20000) {
    return null;
  }
  return { tool, filename: row.filename, summary, body: row.body };
}

export function readCareerDeskCommand(
  value: unknown,
): { taskId: string; command: CareerDeskCommand } | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const row = value as Record<string, unknown>;
  const taskId = typeof row.taskId === "string" ? row.taskId.trim() : "";
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(taskId)) {
    return null;
  }
  if (row.delivery != null) {
    const delivery = readCareerDeskDelivery(row.delivery);
    if (!delivery) {
      return null;
    }
    return { taskId, command: { type: "deliver", delivery } };
  }
  if (row.status === "IN_PROGRESS") {
    return { taskId, command: { type: "status", status: "IN_PROGRESS" } };
  }
  return null;
}

export function planCareerDeskMutation(
  current: CareerDeskSnapshot,
  command: CareerDeskCommand,
): CareerDeskPlan {
  if (command.type === "status") {
    if (current.status === "IN_PROGRESS") {
      return { ok: true, replayed: true, next: current, inboxStatus: "IN_PROGRESS", inboxNote: "" };
    }
    if (current.status !== "OPEN") {
      return { ok: false, reason: "closed" };
    }
    const next = { ...current, status: "IN_PROGRESS" as const };
    return { ok: true, replayed: false, next, inboxStatus: "IN_PROGRESS", inboxNote: "" };
  }
  const delivery = command.delivery;
  const same =
    current.status === "DELIVERED" &&
    current.deliveryTool === delivery.tool &&
    current.deliveryFilename === delivery.filename &&
    current.deliverySummary === delivery.summary &&
    current.deliveryBody === delivery.body;
  if (same) {
    return {
      ok: true,
      replayed: true,
      next: current,
      inboxStatus: "DELIVERED",
      inboxNote: inboxNote("DELIVERED", delivery.summary),
    };
  }
  const next: CareerDeskSnapshot = {
    status: "DELIVERED",
    deliveryTool: delivery.tool,
    deliveryFilename: delivery.filename,
    deliverySummary: delivery.summary,
    deliveryBody: delivery.body,
  };
  return {
    ok: true,
    replayed: false,
    next,
    inboxStatus: "DELIVERED",
    inboxNote: inboxNote("DELIVERED", delivery.summary),
  };
}

export function applyCareerDeskMemory(
  memory: CareerDeskMemory,
  input: { userId: string; taskId: string; command: CareerDeskCommand },
):
  | { ok: true; replayed: boolean; status: CareerDeskStatus; inboxStatus: CareerDeskStatus; inboxNote: string }
  | { ok: false; reason: "missing" | "closed" } {
  const task = memory.tasks.find((row) => row.id === input.taskId && row.userId === input.userId);
  if (!task) {
    return { ok: false, reason: "missing" };
  }
  const plan = planCareerDeskMutation(task, input.command);
  if (!plan.ok) {
    return { ok: false, reason: plan.reason };
  }
  task.status = plan.next.status;
  task.deliveryTool = plan.next.deliveryTool;
  task.deliveryFilename = plan.next.deliveryFilename;
  task.deliverySummary = plan.next.deliverySummary;
  task.deliveryBody = plan.next.deliveryBody;
  const mirror = memory.inbox.find((row) => row.id === task.inboxEntryId);
  if (mirror) {
    mirror.deskStatus = plan.inboxStatus;
    mirror.deliverySummary = plan.inboxNote;
  }
  return {
    ok: true,
    replayed: plan.replayed,
    status: plan.next.status,
    inboxStatus: plan.inboxStatus,
    inboxNote: plan.inboxNote,
  };
}
