import { z } from "zod";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { CAREER_COACH_DISCLAIMER, CAREER_COACH_SEN } from "@/lib/copy/sen-voice/career-coach";

export const CAREER_COACH_PATH = "/api/career/coach" as const;

export const CAREER_COACH_GOALS = ["full_time", "freelancer", "own_business"] as const;

export type CareerCoachGoal = (typeof CAREER_COACH_GOALS)[number];

export type CareerCoachOffer = {
  title: string;
  why: string;
  incomeStep: string;
  tezgahHref: string | null;
  tezgahLabel: string | null;
};

export type CareerCoachSwot = {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
};

export type CareerCoachDossier = {
  cv: string;
  swot: CareerCoachSwot;
  offers: CareerCoachOffer[];
  roadmap: string[];
  disclaimer: string;
  source: "llm" | "fallback";
};

export type CareerCoachProfileInput = {
  targetRole: string;
  experience: string;
  goal: CareerCoachGoal;
  verifiedBadges: readonly string[];
};

const GOAL_LABEL: Record<CareerCoachGoal, string> = {
  full_time: "Tam zamanlı iş",
  freelancer: "Freelancer",
  own_business: "Kendi işini kurma",
};

type TezgahTool = {
  id: string;
  label: string;
  href: string;
  hints: readonly string[];
};

/** AI Tezgâh katalog bağları. Koç bu listenin dışına href yazmaz. */
const TEZGAH_TOOLS: readonly TezgahTool[] = [
  {
    id: "ecommerce",
    label: "E-Ticaret Ürün Kartı",
    href: "/tezgah?tool=ecommerce",
    hints: ["e-ticaret", "eticaret", "ürün kart", "pazaryeri"],
  },
  {
    id: "proposal",
    label: "Müşteri Teklif Yazıcı",
    href: "/tezgah?tool=proposal",
    hints: ["freelancer", "teklif", "danışman", "danisman"],
  },
  {
    id: "tetkik",
    label: "Web Site Analizi",
    href: "/tezgah?tool=tetkik",
    hints: ["web", "site", "tetkik", "analiz"],
  },
  {
    id: "dukkan",
    label: "Sektörel Dijital Dükkan",
    href: "/tezgah?tool=dukkan",
    hints: ["dükkan", "dukkan", "vitrin", "kendi iş"],
  },
  {
    id: "pazaryeri",
    label: "Pazaryeri Katalog Fabrikası",
    href: "/tezgah?tool=pazaryeri",
    hints: ["katalog", "trendyol", "hepsiburada"],
  },
  {
    id: "reklam",
    label: "Otonom Reklam Paketi",
    href: "/tezgah?tool=reklam",
    hints: ["reklam", "sosyal", "pazarlama"],
  },
  {
    id: "grant",
    label: "Hibe Proje Dosyası",
    href: "/tezgah?tool=grant",
    hints: ["hibe", "proje dosyası", "proje dosyasi"],
  },
];

const TOOL_BY_ID = new Map(TEZGAH_TOOLS.map((tool) => [tool.id, tool]));
const TOOL_HREFS = new Set(TEZGAH_TOOLS.map((tool) => tool.href));

const GOAL_ORDER: Record<CareerCoachGoal, readonly string[]> = {
  freelancer: ["proposal", "ecommerce", "reklam", "tetkik", "pazaryeri", "dukkan", "grant"],
  full_time: ["tetkik", "proposal", "reklam", "ecommerce", "pazaryeri", "dukkan", "grant"],
  own_business: ["dukkan", "ecommerce", "grant", "pazaryeri", "reklam", "proposal", "tetkik"],
};

const PROVIDER_LEAK_RE =
  /\b(google|gemini|openai|chatgpt|claude|anthropic|gpt-4|gpt-5|gemma|imagen)\b/gi;

function stripGuaranteePromises(text: string): string {
  return text
    .replace(/[İiI]şe yerleşeceksin/g, "bu bir taslaktır ve garanti etmez")
    .replace(/[İiI]şe yerleşirsin/g, "bu bir taslaktır ve garanti etmez")
    .replace(/kesin kazan(?:ırsın|acaksın)/gi, "bu bir taslaktır ve garanti etmez")
    .replace(/gelir(?:i|ini)? garanti ediyorum/gi, "bu bir taslaktır ve garanti etmez")
    .replace(/gelir garantisi veriyorum/gi, "bu bir taslaktır ve garanti etmez")
    .replace(/maaşın garanti(?! (?:vermez|edilmez|etmez))/gi, "bu bir taslaktır ve garanti etmez");
}

const historyTurnSchema = z.strictObject({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(2_000),
});

const offerSchema = z.strictObject({
  title: z.string().trim().min(1).max(160),
  why: z.string().trim().min(1).max(500),
  incomeStep: z.string().trim().min(1).max(500),
  tezgahHref: z
    .string()
    .trim()
    .max(80)
    .nullable()
    .refine((value) => value == null || TOOL_HREFS.has(value)),
  tezgahLabel: z.string().trim().max(80).nullable(),
});

const bulletSchema = z.string().trim().min(1).max(280);

export const careerCoachDossierSchema = z.strictObject({
  cv: z.string().trim().min(1).max(8_000),
  swot: z.strictObject({
    strengths: z.array(bulletSchema).min(1).max(4),
    weaknesses: z.array(bulletSchema).min(1).max(4),
    opportunities: z.array(bulletSchema).min(1).max(4),
    threats: z.array(bulletSchema).min(1).max(4),
  }),
  offers: z.array(offerSchema).min(3).max(3),
  roadmap: z.array(bulletSchema).min(3).max(6),
  disclaimer: z.string().trim().min(1).max(400),
  source: z.enum(["llm", "fallback"]),
});

const profileFields = {
  targetRole: z.string().trim().min(2).max(120),
  experience: z.string().trim().min(2).max(2_000),
  goal: z.enum(CAREER_COACH_GOALS),
};

export const careerCoachRequestSchema = z.discriminatedUnion("mode", [
  z.strictObject({
    mode: z.literal("profile"),
    ...profileFields,
  }),
  z.strictObject({
    mode: z.literal("dialogue"),
    ...profileFields,
    message: z.string().trim().min(1).max(2_000),
    history: z.array(historyTurnSchema).max(8).optional(),
    dossier: careerCoachDossierSchema.nullable().optional(),
  }),
]);

export type CareerCoachRequest = z.infer<typeof careerCoachRequestSchema>;

export function listedVerifiedBadges(
  titles: readonly string[],
  maxChars = 3_500,
): { titles: string[]; total: number } {
  const clean: string[] = [];
  let used = 0;
  let total = 0;
  for (const title of titles) {
    const next = title.trim().slice(0, 120);
    if (!next) {
      continue;
    }
    total += 1;
    if (clean.length > 0 && used + next.length > maxChars) {
      continue;
    }
    clean.push(next);
    used += next.length;
  }
  return { titles: clean, total };
}

function fold(text: string): string {
  return text.toLocaleLowerCase("tr-TR").replace(/\u0307/g, "");
}

export function scrubCareerCoachText(text: string, badges: readonly string[]): string {
  const branded = text.replace(PROVIDER_LEAK_RE, YETKIN_BRAND);
  const noGuarantee = stripGuaranteePromises(branded);
  const titles = badges.map((badge) => badge.trim()).filter((badge) => badge.length > 1);
  const lowerTitles = titles.map((badge) => fold(badge));
  return noGuarantee
    .split("\n")
    .map((line) => {
      const lower = fold(line);
      if (!lower.includes("dogrulan") && !lower.includes("doğrulan")) {
        return line;
      }
      if (/yok|değil|degil|yazılmaz|yazilmaz|yalnız|yalniz|liste|sicil/.test(lower)) {
        return line;
      }
      if (lowerTitles.some((title) => title.length > 2 && lower.includes(fold(title)))) {
        return line;
      }
      if (/kazand|ald[ıi]m|sahip|rozetim|sertifikam|:\s*\S/.test(lower)) {
        return "Doğrulanmış rozet olarak yalnız sicildeki adlar yazılır.";
      }
      return line;
    })
    .join("\n")
    .trim();
}

function clip(text: string, max: number): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

export function matchTezgahOffers(input: CareerCoachProfileInput): CareerCoachOffer[] {
  const hay = fold(`${input.targetRole} ${input.experience}`);
  const order = GOAL_ORDER[input.goal];
  const ranked = TEZGAH_TOOLS.map((tool) => {
    const hintScore = tool.hints.reduce((score, hint) => score + (hay.includes(fold(hint)) ? 10 : 0), 0);
    const rank = order.indexOf(tool.id);
    return { tool, score: hintScore + (rank >= 0 ? order.length - rank : 0) };
  }).sort((left, right) => right.score - left.score || left.tool.id.localeCompare(right.tool.id));
  const goal = GOAL_LABEL[input.goal];
  return ranked.slice(0, 3).map(({ tool }) => ({
    title: tool.label,
    why: `${goal} hedefi ve yazdığın özet, ${tool.label} ile somut bir teslim taslağına döner.`,
    incomeStep: `${tool.label} ile bir örnek teslim üret. Kapsamı ve süreyi karşı tarafla konuş. Bu adım gelir garantisi vermez.`,
    tezgahHref: tool.href,
    tezgahLabel: tool.label,
  }));
}

function badgeBlock(badges: readonly string[]): string {
  const listed = listedVerifiedBadges(badges);
  if (listed.total === 0) {
    return "Doğrulanmış rozet yok. Deneyim satırları belge değildir.";
  }
  const names = listed.titles.join(", ");
  if (listed.titles.length < listed.total) {
    return `Doğrulanmış rozet sayısı ${listed.total}. Bu taslakta adları yazılanlar: ${names}. Listelenmeyen ad uydurulmaz.`;
  }
  return `Doğrulanmış rozetler: ${names}.`;
}

export function buildFallbackDossier(input: CareerCoachProfileInput): CareerCoachDossier {
  const offers = matchTezgahOffers(input);
  const experience = clip(input.experience, 600);
  const badges = badgeBlock(input.verifiedBadges);
  const cv = [
    input.targetRole.trim(),
    "",
    "Özet",
    experience,
    "",
    "Doğrulanmış belgeler",
    badges,
    "",
    "Hedef",
    `${GOAL_LABEL[input.goal]} için hazırlanan vitrin taslağı.`,
    "",
    CAREER_COACH_DISCLAIMER,
  ].join("\n");
  const firstOffer = offers[0]?.title ?? "AI Tezgâh teslimi";
  const swot: CareerCoachSwot = {
    strengths:
      input.verifiedBadges.length > 0
        ? [
            `Doğrulanmış rozet: ${input.verifiedBadges[0]?.trim()}`,
            "Hedef rolün kendi cümlenle yazıldı.",
          ]
        : ["Hedef rolün net yazıldı.", "Deneyim özeti kendi cümlenle duruyor; belge değildir."],
    weaknesses:
      input.verifiedBadges.length > 0
        ? [
            "Rozet listesi hedefin tamamını kaplamayabilir.",
            "Proje kanıtı ayrıca gösterilmeli.",
          ]
        : [
            "Henüz doğrulanmış rozet yok.",
            "Belgesiz iddia CV'de doğrulanmış yazılamaz.",
          ],
    opportunities: offers.slice(0, 2).map((offer) => `${offer.title} ile örnek teslim üretmek.`),
    threats: [
      "İlan, kanıt istemeden deneyimi abartırsa güven düşer.",
      "Gelir vaadi veren taslak kullanılmamalı.",
    ],
  };
  return {
    cv: scrubCareerCoachText(cv, input.verifiedBadges),
    swot: {
      strengths: swot.strengths.map((row) => scrubCareerCoachText(row, input.verifiedBadges)),
      weaknesses: swot.weaknesses.map((row) => scrubCareerCoachText(row, input.verifiedBadges)),
      opportunities: swot.opportunities.map((row) => scrubCareerCoachText(row, input.verifiedBadges)),
      threats: swot.threats.map((row) => scrubCareerCoachText(row, input.verifiedBadges)),
    },
    offers,
    roadmap: [
      input.verifiedBadges.length > 0
        ? "Doğrulanmış rozetinin dersini bir teslim örneğiyle pekiştir."
        : "Akademi'de seçtiğin alanda 8 dersi bitir, testi 70 ve üzeri ile geç.",
      `${firstOffer} aracında bir örnek teslim üret.`,
      "CV'ye yalnız sicildeki doğrulanmış rozet adlarını yaz.",
      "İlk görüşmede kapsam, süre ve teslimi konuş. İşe yerleşme garanti edilmez.",
    ],
    disclaimer: CAREER_COACH_DISCLAIMER,
    source: "fallback",
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function asBullets(value: unknown, fallback: readonly string[], badges: readonly string[]): string[] {
  const rows = Array.isArray(value) ? value : [];
  const built = rows
    .filter((item): item is string => typeof item === "string")
    .map((item) => clip(scrubCareerCoachText(item, badges), 280))
    .filter((item) => item.length > 0)
    .slice(0, 4);
  for (const row of fallback) {
    if (built.length >= 2) {
      break;
    }
    if (!built.includes(row)) {
      built.push(row);
    }
  }
  return built.slice(0, 4);
}

function asOffers(value: unknown, fallback: readonly CareerCoachOffer[], badges: readonly string[]): CareerCoachOffer[] {
  const rows = Array.isArray(value) ? value : [];
  const built: CareerCoachOffer[] = [];
  for (const row of rows) {
    const record = asRecord(row);
    if (!record) {
      continue;
    }
    const title = typeof record.title === "string" ? clip(scrubCareerCoachText(record.title, badges), 160) : "";
    if (!title) {
      continue;
    }
    const tool = typeof record.tezgahToolId === "string" ? TOOL_BY_ID.get(record.tezgahToolId) : undefined;
    const why =
      typeof record.why === "string" ? clip(scrubCareerCoachText(record.why, badges), 500) : fallback[0]?.why ?? title;
    const incomeStep =
      typeof record.incomeStep === "string"
        ? clip(scrubCareerCoachText(record.incomeStep, badges), 500)
        : (fallback[0]?.incomeStep ?? CAREER_COACH_DISCLAIMER);
    built.push({
      title,
      why: why || title,
      incomeStep: incomeStep || CAREER_COACH_DISCLAIMER,
      tezgahHref: tool?.href ?? null,
      tezgahLabel: tool?.label ?? null,
    });
    if (built.length === 3) {
      break;
    }
  }
  for (const offer of fallback) {
    if (built.length === 3) {
      break;
    }
    built.push(offer);
  }
  return built.slice(0, 3);
}

function withDisclaimer(cv: string, badges: readonly string[]): string {
  const scrubbed = scrubCareerCoachText(cv, badges);
  if (fold(scrubbed).includes("garanti etmez")) {
    return scrubbed;
  }
  return `${scrubbed}\n\n${CAREER_COACH_DISCLAIMER}`;
}

export function dossierFromModelText(
  text: string,
  input: CareerCoachProfileInput,
): CareerCoachDossier | null {
  const fallback = buildFallbackDossier(input);
  let raw: unknown;
  try {
    const trimmed = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    try {
      raw = JSON.parse(trimmed);
    } catch {
      const start = trimmed.indexOf("{");
      const end = trimmed.lastIndexOf("}");
      if (start < 0 || end <= start) {
        return null;
      }
      raw = JSON.parse(trimmed.slice(start, end + 1));
    }
  } catch {
    return null;
  }
  const record = asRecord(raw);
  if (!record) {
    return null;
  }
  const swot = asRecord(record.swot);
  const cv = typeof record.cv === "string" ? withDisclaimer(record.cv, input.verifiedBadges) : fallback.cv;
  const roadmapRows = Array.isArray(record.roadmap) ? record.roadmap : [];
  const roadmap = roadmapRows
    .filter((item): item is string => typeof item === "string")
    .map((item) => clip(scrubCareerCoachText(item, input.verifiedBadges), 280))
    .filter((item) => item.length > 0)
    .slice(0, 6);
  for (const step of fallback.roadmap) {
    if (roadmap.length >= 4) {
      break;
    }
    roadmap.push(step);
  }
  const candidate: CareerCoachDossier = {
    cv: clip(cv, 8_000),
    swot: {
      strengths: asBullets(swot?.strengths, fallback.swot.strengths, input.verifiedBadges),
      weaknesses: asBullets(swot?.weaknesses, fallback.swot.weaknesses, input.verifiedBadges),
      opportunities: asBullets(swot?.opportunities, fallback.swot.opportunities, input.verifiedBadges),
      threats: asBullets(swot?.threats, fallback.swot.threats, input.verifiedBadges),
    },
    offers: asOffers(record.offers, fallback.offers, input.verifiedBadges),
    roadmap: roadmap.slice(0, 6),
    disclaimer: CAREER_COACH_DISCLAIMER,
    source: "llm",
  };
  const parsed = careerCoachDossierSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

export function fallbackCareerDialogue(
  message: string,
  dossier: CareerCoachDossier | null,
  badges: readonly string[],
): string {
  const folded = fold(message);
  const badgeLine =
    badges.length > 0
      ? `Doğrulanmış rozetlerin: ${listedVerifiedBadges(badges).titles.join(", ")}.`
      : "Doğrulanmış rozetin yok. Yeni belge adı ekleme.";
  let body: string;
  if (folded.includes("ilan")) {
    const role = dossier?.cv.split("\n")[0]?.trim() || "hedef rolün";
    body = `${role} için ilandaki görev cümlelerini deneyim özetime eşle. ${badgeLine} İlanda geçen ama sicilde olmayan sertifikayı doğrulanmış yazma.`;
  } else if (folded.includes("zayif") || folded.includes("zayıf") || folded.includes("gelisim") || folded.includes("gelişim")) {
    const gaps = dossier?.swot.weaknesses.join(" ") || "Belgesiz iddiayı kapat.";
    body = `Gelişim alanların: ${gaps} Kapatmak için Akademi dersini bitir ve AI Tezgâh'ta bir örnek teslim üret. ${badgeLine}`;
  } else if (folded.includes("teklif")) {
    body = `İlk freelancer teklifinde ihtiyacı, kapsamı, teslimi ve süreyi yaz. Fiyatı sen koyarsın. AI Tezgâh Müşteri Teklif Yazıcı taslak üretir. ${badgeLine}`;
  } else {
    body = `CV ve SWOT taslağın duruyor. Somut bir ilan, gelişim alanı veya teklif cümlesi yaz. ${badgeLine}`;
  }
  return scrubCareerCoachText(`${body}\n\n${CAREER_COACH_DISCLAIMER}`, badges);
}

export function careerCoachNote(source: "llm" | "fallback", modelConfigured: boolean): string {
  if (source === "llm") {
    return CAREER_COACH_SEN.llmNote;
  }
  return modelConfigured ? CAREER_COACH_SEN.fallbackNote : CAREER_COACH_SEN.missingKeyNote;
}
