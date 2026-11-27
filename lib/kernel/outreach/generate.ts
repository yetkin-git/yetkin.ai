import "server-only";

/**
 * AI taslak üreticisi — onay kuyruğunun besleyicisi.
 *
 * Keşif kuralı: **şirket uydurulmaz.** Hedef listesi yalnız iki gerçek kaynaktan gelir:
 * 1. Super Admin'in girdiği `b2b_lead_campaign_items` kuyruğu
 *    (tek satır veya CSV içe aktarma; kaynak etiketi `admin-csv`).
 * 2. Kamuya açık kurumsal teklif formundan gelen `kurumsal_offer_requests` satırları.
 * Web kazıma ile adres toplamak bu modülde yoktur; olsaydı KVKK dayanağı ve
 * kaynak sorumluluğu ayrı bir tasarım gerektirirdi ve burada sessizce varsayılmaz.
 *
 * Model çıktısı kapıdan geçmezse şablon kullanılır. Şablon da dürüsttür:
 * ölçülmemiş sonuç, kesin hibe ve fiyat vaadi yazmaz.
 */

import { invokeLlm } from "@/lib/kernel/ai/llm-gateway";
import { resolveProductModel } from "@/lib/kernel/ai/product-models";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import type { InvokeLlmInput } from "@/lib/kernel/ai/types";
import { sanitizeGeminiApiKey } from "@/lib/kernel/ai/providers/gemini";
import { getPrisma } from "@/lib/kernel/db";
import {
  composeOutreachTemplate,
  isCorporateMailbox,
  normalizeOutreachEmail,
  outreachDraftCopyIssue,
  OUTREACH_GENERATE_BATCH_MAX,
  OUTREACH_IMPORT_FINDINGS_MARK,
  OUTREACH_ISSUE_LABELS,
  OUTREACH_VERTICAL_LABELS,
  OUTREACH_VERTICAL_LINKS,
  readOutreachImportVertical,
  type OutreachVertical,
} from "@/lib/kernel/outreach/policy";

export type OutreachSeed = {
  companyName: string;
  recipientEmail: string;
  sector: string;
  sourceUrl: string | null;
  origin: "b2b-queue" | "offer-request" | "manual" | "admin-csv";
};

type Invoke = (input: InvokeLlmInput) => Promise<{ text: string } | null>;

/** Kanal → dikey. İçe aktarılan satır dikeyi `findingsJson` etiketinden okunur; kanal yedeğidir. */
const CHANNEL_VERTICAL: Record<string, OutreachVertical> = {
  WEB_TETKIK: "KURUMSAL",
  TUBITAK_HIBE: "HIBE",
};

const LEAD_QUEUE_STATUSES = ["QUEUED", "DRAFT_READY", "FAILED"] as const;

const LEAD_SEED_SELECT = {
  companyName: true,
  email: true,
  sector: true,
  websiteUrl: true,
  channel: true,
  findingsJson: true,
} as const;

function verticalOfLead(channel: string, findingsJson: string): OutreachVertical {
  return readOutreachImportVertical(findingsJson) ?? CHANNEL_VERTICAL[channel] ?? "KURUMSAL";
}

/**
 * Hedef havuzu. Kara listedeki ve zaten taslağı olan adresler elenir;
 * böylece her sabah aynı firmaya ikinci kez yazılmaz.
 */
export async function listOutreachSeeds(input: {
  vertical?: OutreachVertical;
  limit?: number;
}): Promise<OutreachSeed[]> {
  const limit = Math.min(Math.max(input.limit ?? OUTREACH_GENERATE_BATCH_MAX, 1), OUTREACH_GENERATE_BATCH_MAX);
  const prisma = getPrisma();
  const [suppressed, drafted] = await Promise.all([
    prisma.outreachSuppression.findMany({ select: { email: true } }),
    prisma.outreachCampaignDraft.findMany({ select: { recipientEmail: true } }),
  ]);
  const taken = new Set<string>([
    ...suppressed.map((row) => normalizeOutreachEmail(row.email)),
    ...drafted.map((row) => normalizeOutreachEmail(row.recipientEmail)),
  ]);

  const seeds: OutreachSeed[] = [];

  const leadWhere = { status: { in: [...LEAD_QUEUE_STATUSES] } };
  const [importedLeads, queuedLeads] = await Promise.all([
    prisma.b2bLeadCampaignItem.findMany({
      where: { ...leadWhere, findingsJson: { contains: OUTREACH_IMPORT_FINDINGS_MARK } },
      orderBy: { createdAt: "asc" },
      take: limit * 3,
      select: LEAD_SEED_SELECT,
    }),
    prisma.b2bLeadCampaignItem.findMany({
      where: leadWhere,
      orderBy: { createdAt: "asc" },
      take: limit * 3,
      select: LEAD_SEED_SELECT,
    }),
  ]);
  for (const row of [...importedLeads, ...queuedLeads]) {
    const email = normalizeOutreachEmail(row.email);
    const vertical = verticalOfLead(row.channel, row.findingsJson);
    if (input.vertical && vertical !== input.vertical) {
      continue;
    }
    if (!isCorporateMailbox(email) || taken.has(email)) {
      continue;
    }
    const imported = readOutreachImportVertical(row.findingsJson);
    taken.add(email);
    seeds.push({
      companyName: row.companyName,
      recipientEmail: email,
      sector: row.sector,
      sourceUrl: row.websiteUrl,
      origin: imported ? "admin-csv" : "b2b-queue",
    });
    if (seeds.length >= limit) {
      return seeds;
    }
  }

  const offers = await prisma.kurumsalOfferRequest.findMany({
    where: { status: { in: ["NEW", "CONTACTED"] } },
    orderBy: { createdAt: "desc" },
    take: limit * 3,
    select: { companyName: true, email: true, city: true, note: true },
  });
  for (const row of offers) {
    const email = normalizeOutreachEmail(row.email);
    if (!isCorporateMailbox(email) || taken.has(email)) {
      continue;
    }
    // Teklif formu dikey taşımaz; kurumsal varsayılır ve panelde değiştirilebilir.
    if (input.vertical && input.vertical !== "KURUMSAL") {
      continue;
    }
    taken.add(email);
    seeds.push({
      companyName: row.companyName,
      recipientEmail: email,
      sector: row.city || row.companyName,
      sourceUrl: null,
      origin: "offer-request",
    });
    if (seeds.length >= limit) {
      return seeds;
    }
  }

  return seeds;
}

/** Panelden elle eklenen hedef. E-posta kurumsal değilse null döner. */
export function manualSeed(input: {
  companyName: string;
  recipientEmail: string;
  sector: string;
  sourceUrl?: string | null;
}): OutreachSeed | null {
  const email = normalizeOutreachEmail(input.recipientEmail);
  const companyName = input.companyName.trim().slice(0, 120);
  const sector = input.sector.trim().slice(0, 80);
  if (!companyName || !sector || !isCorporateMailbox(email)) {
    return null;
  }
  return {
    companyName,
    recipientEmail: email,
    sector,
    sourceUrl: input.sourceUrl?.trim() || null,
    origin: "manual",
  };
}

const SYSTEM_PROMPT = [
  "yetkin.ai adına B2B tanışma e-postası yazan editörsün. Türkçe yaz, 'sen' aksında kal.",
  "Kurallar:",
  "1) Abartı yok. 'bedava', 'garanti', 'kesin', '%100', 'sınırsız', 'son şans', 'tıkla kazan' gibi sözcükler yasak.",
  "2) Ölçülmemiş sonuç, kurum kararı ve fiyat yazma. Hibe onayı verme.",
  "3) En fazla 120 kelime. İki kısa paragraf ve tek net bağlantı.",
  "4) Alıcının sektörüne tek somut gözlemle gir; genel övgü yazma.",
  "5) Gövde şu bağlantıyı aynen taşımak zorunda: {LINK}",
  "6) Selamlama 'Merhaba {FIRMA},' biçiminde olsun. İmza 'Yetkin' olsun.",
  "7) RET satırı, ticari ileti şerhi ve imzalı bağlantı EKLEME; onu sistem basar.",
  'Yalnız JSON dön: {"subject":"","body":""}',
].join(" ");

export type GeneratedOutreachDraft = {
  seed: OutreachSeed;
  subject: string;
  body: string;
  source: "gemini" | "template";
  note: string;
};

function clipSubject(value: string): string {
  const clean = value.replace(/[\r\n\u0000]/g, " ").replace(/\s+/g, " ").trim();
  return clean.length <= 180 ? clean : clean.slice(0, 177).trimEnd() + "…";
}

function acceptModelDraft(
  vertical: OutreachVertical,
  raw: string,
): { subject: string; body: string } | null {
  let parsed: unknown;
  try {
    const trimmed = raw.trim().replace(/^```(?:json)?/iu, "").replace(/```$/u, "").trim();
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }
  const row = parsed as Record<string, unknown>;
  const subject = clipSubject(typeof row.subject === "string" ? row.subject : "");
  const body = (typeof row.body === "string" ? row.body : "").replace(/\u0000/g, "").trim();
  const issue = outreachDraftCopyIssue({ vertical, subject, body });
  if (!issue.ok) {
    return null;
  }
  return { subject, body };
}

async function defaultInvoke(input: InvokeLlmInput): Promise<{ text: string } | null> {
  const result = await invokeLlm(input);
  return result?.text ? { text: result.text } : null;
}

export async function generateOutreachDraft(input: {
  seed: OutreachSeed;
  vertical: OutreachVertical;
  userId: string;
  invoke?: Invoke;
}): Promise<GeneratedOutreachDraft> {
  const fallback = composeOutreachTemplate({
    companyName: input.seed.companyName,
    sector: input.seed.sector,
    vertical: input.vertical,
  });

  if (sanitizeGeminiApiKey(process.env.GEMINI_API_KEY) == null) {
    return {
      seed: input.seed,
      ...fallback,
      source: "template",
      note: "GEMINI_API_KEY yok. Marka şablonu kullanıldı.",
    };
  }

  const invoke = input.invoke ?? defaultInvoke;
  let text = "";
  try {
    const result = await invoke({
      role: "LITE_STREAM",
      model: await resolveProductModel("textEasy"),
      system: SYSTEM_PROMPT.replace("{LINK}", OUTREACH_VERTICAL_LINKS[input.vertical]).replace(
        "{FIRMA}",
        input.seed.companyName,
      ),
      user: JSON.stringify({
        companyName: input.seed.companyName,
        sector: input.seed.sector,
        vertical: OUTREACH_VERTICAL_LABELS[input.vertical],
        sourceUrl: input.seed.sourceUrl,
      }),
      temperature: 0.5,
      maxOutputTokens: 700,
      responseJson: true,
      timeoutMs: 25_000,
      maxAttempts: 1,
      rateLimit: {
        identifier: input.userId,
        scope: "admin-outreach-generate",
        limit: 60,
        windowMs: 24 * 60 * 60_000,
      },
      billing: {
        userId: input.userId,
        source: AI_TOKEN_SOURCES.KURUMSAL,
        recordUsage: false,
      },
    });
    text = result?.text ?? "";
  } catch {
    text = "";
  }

  const accepted = text ? acceptModelDraft(input.vertical, text) : null;
  if (!accepted) {
    return {
      seed: input.seed,
      ...fallback,
      source: "template",
      note: text
        ? "Gemini yanıtı dürüstlük kapısından geçmedi. Marka şablonu kullanıldı."
        : "Gemini yanıtı alınamadı. Marka şablonu kullanıldı.",
    };
  }
  return {
    seed: input.seed,
    ...accepted,
    source: "gemini",
    note: "Gemini taslağı üretildi. Gönderim Super Admin onayı bekler.",
  };
}

/** Üretilen metin DB'ye yazılmadan önce son kapı — panel düzenlemesi de buradan geçer. */
export function describeDraftIssue(vertical: OutreachVertical, subject: string, body: string): string | null {
  const issue = outreachDraftCopyIssue({ vertical, subject, body });
  return issue.ok ? null : OUTREACH_ISSUE_LABELS[issue.reason];
}
