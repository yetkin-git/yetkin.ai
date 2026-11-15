/**
 * 30 günlük kariyer aksiyon planı.
 * Kapalı sözlük, LLM yok, veritabanı yazması yok.
 * Oturum sinyali formun önüne geçer; rozet uydurulmaz.
 */

import { CAREER_ACTION_PLAN_DISCLAIMER } from "@/lib/copy/sen-voice/career";
import {
  TEZGAH_TOOL_IDS,
  tezgahToolById,
  tezgahToolHref,
  type TezgahToolId,
} from "@/lib/tezgah/catalog";
import { academySlugFromCourseTitle, COURSE_REGISTRY } from "@yetkin/kernel/catalog-ids";

export const CAREER_ACTION_SITUATIONS = ["new", "learning", "producing", "stamped"] as const;
export const CAREER_ACTION_TIME_BANDS = ["under_3", "hours_3_7", "over_7"] as const;
export const CAREER_ACTION_FOCI = [
  "office",
  "ecommerce",
  "social",
  "chatbot",
  "prompt",
  "grant",
  "store",
] as const;

export type CareerActionSituation = (typeof CAREER_ACTION_SITUATIONS)[number];
export type CareerActionTimeBand = (typeof CAREER_ACTION_TIME_BANDS)[number];
export type CareerActionFocus = (typeof CAREER_ACTION_FOCI)[number];

export type CareerActionStepId = "d1" | "d8" | "d15" | "d23";

export type CareerActionStep = {
  id: CareerActionStepId;
  window: "Gün 1–7" | "Gün 8–14" | "Gün 15–22" | "Gün 23–30";
  title: string;
  body: string;
  href: string;
  cta: string;
};

export type CareerActionContinue = {
  slug: string;
  lessonKey: string | null;
};

export type CareerActionStore = {
  slug: string;
  name: string;
};

export type CareerActionLive = {
  continuePlay: CareerActionContinue | null;
  examGateSlug: string | null;
  certificatesHeld: number;
  certificateCourseSlug: string | null;
  publicCardHref: string | null;
  activeStore: CareerActionStore | null;
};

export type CareerActionAcademySignal = {
  certificatesHeld: number;
  lastCertificateTitle: string | null;
  lastCourseSlug: string | null;
  nextLessonKey: string | null;
};

export type CareerActionStampSignal = {
  title: string;
  publicHref: string | null;
  courseSlug: string | null;
};

export type CareerActionStoreSignal = {
  slug: string;
  name: string;
  status: "DRAFT" | "ACTIVE";
};

export type CareerActionSignalInput = {
  academy: CareerActionAcademySignal | null;
  stamps: readonly CareerActionStampSignal[];
  stores: readonly CareerActionStoreSignal[];
};

export type CareerActionPlan = {
  situation: CareerActionSituation;
  timeBand: CareerActionTimeBand;
  focus: CareerActionFocus;
  overrideNote: string | null;
  lead: string;
  disclaimer: typeof CAREER_ACTION_PLAN_DISCLAIMER;
  steps: readonly [CareerActionStep, CareerActionStep, CareerActionStep, CareerActionStep];
};

const LEVEL_TEST_HREF = "/academy/01_office_ai/seviye" as const;
const ACADEMY_HOME = "/academy" as const;
const EXAM_HASH = "academy-exam-gate";
const STORE_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LESSON_KEY_RE = /^[A-Za-z0-9_-]{1,40}$/;
const PUBLIC_CARD_RE = /^\/vize\/[A-Za-z0-9_-]{6,64}$/;

const ACTION_ACADEMY_SLUGS = new Set<string>(
  COURSE_REGISTRY.filter((row) => row.audience === "adult" && row.vitrineOrder !== null).map(
    (row) => row.slug,
  ),
);

const FOCUS_TOOL: Record<CareerActionFocus, TezgahToolId> = {
  office: "tetkik",
  ecommerce: "ecommerce",
  social: "reklam",
  chatbot: "proposal",
  prompt: "tetkik",
  grant: "grant",
  store: "dukkan",
};

const FOCUS_COURSE: Record<CareerActionFocus, string | null> = {
  office: "01_office_ai",
  ecommerce: "02_ecommerce_ai",
  social: "03_social_media_ai",
  chatbot: "04_chatbot_nocode",
  prompt: "05_prompt_practice",
  grant: null,
  store: "02_ecommerce_ai",
};

const SLUG_FOCUS: Record<string, CareerActionFocus> = {
  "01_office_ai": "office",
  "01_office_ai_ileri": "office",
  "02_ecommerce_ai": "ecommerce",
  "03_social_media_ai": "social",
  "04_chatbot_nocode": "chatbot",
  "05_prompt_practice": "prompt",
};

const CADENCE: Record<CareerActionTimeBand, string> = {
  under_3: "Haftalık süre bandın 3 saatin altında. Her pencerede tek oturum ayır.",
  hours_3_7: "Haftalık süre bandın 3 ile 7 saat. Her pencerede iki veya üç kısa oturum ayır.",
  over_7: "Haftalık süre bandın 7 saatin üzerinde. Her pencerede gün aşırı kısa bir oturum ayır.",
};

export const EMPTY_CAREER_ACTION_LIVE: CareerActionLive = {
  continuePlay: null,
  examGateSlug: null,
  certificatesHeld: 0,
  certificateCourseSlug: null,
  publicCardHref: null,
  activeStore: null,
};

function asMember<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function allowSlug(value: string | null | undefined): string | null {
  const slug = value?.trim() ?? "";
  return ACTION_ACADEMY_SLUGS.has(slug) ? slug : null;
}

function safeLessonKey(value: string | null | undefined): string | null {
  const key = value?.trim() ?? "";
  return LESSON_KEY_RE.test(key) ? key : null;
}

function parseStoreSlug(value: string): string | null {
  const slug = value.trim();
  if (slug.length < 1 || slug.length > 48 || !STORE_SLUG_RE.test(slug)) {
    return null;
  }
  return slug;
}

function plainLabel(value: string | null | undefined): string | null {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  if (!text || text.length > 80 || /[<>]/.test(text) || /https?:/i.test(text)) {
    return null;
  }
  if (/swot|yetenek radar/i.test(text)) {
    return null;
  }
  return text;
}

function playHref(slug: string): string {
  return `/academy/${slug}/oyna`;
}

function courseHref(slug: string): string {
  return `/academy/${slug}`;
}

function examHref(slug: string): string {
  return `/academy/${slug}?gate=exam#${EXAM_HASH}`;
}

function toolHref(id: TezgahToolId): string {
  return tezgahToolHref(id);
}

function closeTool(focus: CareerActionFocus): TezgahToolId {
  const open = FOCUS_TOOL[focus];
  if (open === "dukkan") {
    return "proposal";
  }
  if (open === "proposal") {
    return "dukkan";
  }
  if (focus === "grant" || focus === "office" || focus === "prompt") {
    return "proposal";
  }
  return "dukkan";
}

function focusForSlug(slug: string): CareerActionFocus | null {
  return SLUG_FOCUS[slug] ?? null;
}

export function isClosedCareerActionHref(href: string): boolean {
  if (href === ACADEMY_HOME || href === LEVEL_TEST_HREF) {
    return true;
  }
  const play = /^\/academy\/([a-z0-9_]+)\/oyna$/.exec(href);
  if (play) {
    return ACTION_ACADEMY_SLUGS.has(play[1] ?? "");
  }
  const exam = /^\/academy\/([a-z0-9_]+)\?gate=exam#academy-exam-gate$/.exec(href);
  if (exam) {
    return ACTION_ACADEMY_SLUGS.has(exam[1] ?? "");
  }
  const course = /^\/academy\/([a-z0-9_]+)$/.exec(href);
  if (course) {
    return ACTION_ACADEMY_SLUGS.has(course[1] ?? "");
  }
  const tool = /^\/tezgah\?tool=([a-z]+)$/.exec(href);
  if (tool) {
    return (TEZGAH_TOOL_IDS as readonly string[]).includes(tool[1] ?? "");
  }
  const store = /^\/magaza\/([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(href);
  if (store) {
    return parseStoreSlug(store[1] ?? "") !== null;
  }
  return PUBLIC_CARD_RE.test(href);
}

function sealHref(href: string): string {
  return isClosedCareerActionHref(href) ? href : ACADEMY_HOME;
}

function positiveCount(value: number): number {
  return Number.isInteger(value) && value > 0 ? value : 0;
}

export function assembleCareerActionLive(input: CareerActionSignalInput): CareerActionLive {
  const academy = input.academy;
  const slug = allowSlug(academy?.lastCourseSlug);
  const rawKey = academy?.nextLessonKey?.trim() ?? "";
  const continuePlay =
    slug && rawKey
      ? { slug, lessonKey: safeLessonKey(rawKey) }
      : null;
  const examGateSlug = slug && !rawKey ? slug : null;
  const certificatesHeld = positiveCount(academy?.certificatesHeld ?? 0);
  const titled = allowSlug(academySlugFromCourseTitle(academy?.lastCertificateTitle ?? ""));
  const certificateCourseSlug = titled;

  let publicCardHref: string | null = null;
  for (const stamp of input.stamps) {
    const href = stamp.publicHref?.trim() ?? "";
    if (PUBLIC_CARD_RE.test(href)) {
      publicCardHref = href;
      break;
    }
  }

  let activeStore: CareerActionStore | null = null;
  for (const store of input.stores) {
    if (store.status !== "ACTIVE") {
      continue;
    }
    const storeSlug = parseStoreSlug(store.slug);
    if (!storeSlug) {
      continue;
    }
    activeStore = { slug: storeSlug, name: plainLabel(store.name) ?? "Mağaza" };
    break;
  }

  return {
    continuePlay,
    examGateSlug,
    certificatesHeld,
    certificateCourseSlug,
    publicCardHref,
    activeStore,
  };
}

export function suggestCareerActionInput(live: CareerActionLive | null | undefined): {
  situation: CareerActionSituation;
  timeBand: CareerActionTimeBand;
  focus: CareerActionFocus;
} {
  const safe = live ?? EMPTY_CAREER_ACTION_LIVE;
  const slug = safe.continuePlay?.slug ?? safe.examGateSlug ?? safe.certificateCourseSlug;
  const focus = (slug ? focusForSlug(slug) : null) ?? (safe.activeStore ? "store" : "office");
  let situation: CareerActionSituation = "new";
  if (
    (safe.publicCardHref != null && isClosedCareerActionHref(safe.publicCardHref)) ||
    safe.certificatesHeld > 0
  ) {
    situation = "stamped";
  } else if (safe.continuePlay || safe.examGateSlug) {
    situation = "learning";
  } else if (safe.activeStore) {
    situation = "producing";
  }
  return { situation, timeBand: "hours_3_7", focus };
}

function hasBadge(live: CareerActionLive): boolean {
  return (
    (live.publicCardHref != null && isClosedCareerActionHref(live.publicCardHref)) ||
    live.certificatesHeld > 0
  );
}

function overrideNote(form: CareerActionSituation, live: CareerActionLive): string | null {
  const badge = hasBadge(live);
  const study = live.continuePlay != null || live.examGateSlug != null;
  if (form === "new" && (badge || study || live.activeStore)) {
    return "Form yeni diyor. Canlı kayıt buna uymuyor; plan sicildeki dersi, rozeti veya mağazayı esas alır.";
  }
  if (form === "stamped" && !badge) {
    return "Form rozet diyor. Canlı sicilde doğrulanmış rozet yok; plan rozet uydurmaz.";
  }
  return null;
}

function examSlug(live: CareerActionLive, focus: CareerActionFocus): string {
  return (
    allowSlug(live.continuePlay?.slug) ??
    allowSlug(live.examGateSlug) ??
    allowSlug(live.certificateCourseSlug) ??
    FOCUS_COURSE[focus] ??
    "05_prompt_practice"
  );
}

function week1(live: CareerActionLive, focus: CareerActionFocus): Omit<CareerActionStep, "id" | "window"> {
  if (live.continuePlay && allowSlug(live.continuePlay.slug)) {
    const key = safeLessonKey(live.continuePlay.lessonKey);
    return {
      title: "Yarım ders",
      body: key
        ? `Sıradaki ders ${key}. Oynatıcıda kaldığın yerden devam et.`
        : "Oynatıcıda kaldığın yerden devam et.",
      href: sealHref(playHref(live.continuePlay.slug)),
      cta: "Derse gir",
    };
  }
  if (allowSlug(live.examGateSlug)) {
    return {
      title: "Sınav kapısı",
      body: "Müfredat bitmiş görünüyor. Sınav kapısı bu eğitimde. Baraj 70. Satın alma tek başına rozet basmaz.",
      href: sealHref(examHref(live.examGateSlug ?? "")),
      cta: "Sınav kapısını aç",
    };
  }
  if (!hasBadge(live) && focus === "office") {
    return {
      title: "Yetkinlik testi",
      body: "Ücretsiz yetkinlik testi. Sonuç, giriş yapmadan sicile yazılmaz.",
      href: LEVEL_TEST_HREF,
      cta: "Teste gir",
    };
  }
  if (focus === "grant") {
    return {
      title: "Eğitim yolu",
      body: "Katalogdan proje ve prompt yolunu aç. Dersler bitince sınav kapısı açılır.",
      href: ACADEMY_HOME,
      cta: "Eğitimi aç",
    };
  }
  const slug = FOCUS_COURSE[focus] ?? "01_office_ai";
  return {
    title: "Eğitim yolu",
    body: "Bu odağın eğitim yolu. Dersler bitince sınav kapısı açılır. Satın alma tek başına rozet basmaz.",
    href: sealHref(courseHref(slug)),
    cta: "Eğitimi aç",
  };
}

function week2(focus: CareerActionFocus): Omit<CareerActionStep, "id" | "window"> {
  const id = FOCUS_TOOL[focus];
  const tool = tezgahToolById(id);
  const label = tool?.label ?? "Tezgâh";
  return {
    title: "Odak aracı",
    body: `${label} aracında bir çıktı üret. Çıktı taslaktır; iş veya gelir vaadi değildir.`,
    href: sealHref(toolHref(id)),
    cta: `${label} aracını aç`,
  };
}

function week3(live: CareerActionLive, focus: CareerActionFocus): Omit<CareerActionStep, "id" | "window"> {
  if (live.publicCardHref && isClosedCareerActionHref(live.publicCardHref)) {
    return {
      title: "Paylaşım kartı",
      body: "Kamuya açık yetkinlik kartını aç. CV ve LinkedIn rehberi bu sayfadaki paylaşım bölümündedir.",
      href: live.publicCardHref,
      cta: "Kartı aç",
    };
  }
  if (hasBadge(live) && allowSlug(live.certificateCourseSlug)) {
    return {
      title: "Rozetli eğitim",
      body: "Doğrulanmış rozetin bu eğitime bağlı. Kamuya açık kart adresi bu oturumda çözülemedi. Paylaşım rehberi bu sayfada.",
      href: sealHref(courseHref(live.certificateCourseSlug ?? "")),
      cta: "Eğitimi aç",
    };
  }
  const slug = examSlug(live, focus);
  return {
    title: "Sınav kapısı",
    body: "8 ders bitince sınav bu eğitimde açılır. Baraj 70. Satın alma tek başına rozet basmaz.",
    href: sealHref(examHref(slug)),
    cta: "Sınav kapısını aç",
  };
}

function week4(live: CareerActionLive, focus: CareerActionFocus): Omit<CareerActionStep, "id" | "window"> {
  const storeHref = live.activeStore ? `/magaza/${live.activeStore.slug}` : null;
  if (live.activeStore && storeHref && isClosedCareerActionHref(storeHref)) {
    return {
      title: "Vitrin",
      body: `${live.activeStore.name} vitrini açık. Ürün kartını bu adreste güncelle.`,
      href: storeHref,
      cta: "Vitrini aç",
    };
  }
  const id = closeTool(focus);
  const tool = tezgahToolById(id);
  const label = tool?.label ?? "Tezgâh";
  return {
    title: "Teslim taslağı",
    body: `${label} ile teslim taslağı çıkar. Açık mağaza vitrini yok.`,
    href: sealHref(toolHref(id)),
    cta: `${label} aracını aç`,
  };
}

export function buildCareerActionPlan(input: {
  situation: string;
  timeBand: string;
  focus: string;
  live?: CareerActionLive | null;
}): CareerActionPlan {
  const situation = asMember(input.situation, CAREER_ACTION_SITUATIONS, "new");
  const timeBand = asMember(input.timeBand, CAREER_ACTION_TIME_BANDS, "hours_3_7");
  const focus = asMember(input.focus, CAREER_ACTION_FOCI, "office");
  const live = input.live ?? EMPTY_CAREER_ACTION_LIVE;
  const note = overrideNote(situation, live);
  const [first, second, third, fourth] = [
    week1(live, focus),
    week2(focus),
    week3(live, focus),
    week4(live, focus),
  ] as const;
  const steps: CareerActionPlan["steps"] = [
    { id: "d1", window: "Gün 1–7", ...first },
    { id: "d8", window: "Gün 8–14", ...second },
    { id: "d15", window: "Gün 15–22", ...third },
    { id: "d23", window: "Gün 23–30", ...fourth },
  ];

  return {
    situation,
    timeBand,
    focus,
    overrideNote: note,
    lead: note ? `${CADENCE[timeBand]} ${note}` : CADENCE[timeBand],
    disclaimer: CAREER_ACTION_PLAN_DISCLAIMER,
    steps,
  };
}
