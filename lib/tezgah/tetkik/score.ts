import { parseHomepageHtml, pageSnippetFromParsed } from "@/lib/tezgah/tetkik/parse-html";
import {
  TETKIK_CHECK_ORDER,
  TETKIK_CONVERSION,
  TETKIK_DISCLAIMER,
  TETKIK_HTML_BUDGET_BYTES,
  TETKIK_LABELS,
  TETKIK_MAX_SCORE,
  TETKIK_OPPORTUNITY,
  TETKIK_SHOP_GATES,
  TETKIK_STRUCTURAL,
  TETKIK_TTFB_BUDGET_MS,
  TETKIK_WEIGHTS,
  type TetkikCheckId,
} from "@/lib/tezgah/tetkik/rubric";
import {
  techSeoSignalsFromProbes,
  uncheckedTechSeoSignals,
  type TechSeoProbe,
} from "@/lib/tezgah/tetkik/tech-seo";
import type {
  ParsedHomepage,
  TetkikAction,
  TetkikCheck,
  TetkikPageSnippet,
  TetkikTechSeoSignal,
} from "@/lib/tezgah/tetkik/types";

export type TetkikMeasures = {
  https: boolean;
  ttfbMs: number;
  htmlBytes: number;
  /** Yoksa teknik SEO sinyalleri `unchecked` kalır; ana 100 puan değişmez. */
  techSeo?: {
    robotsTxt: TechSeoProbe;
    sitemapXml: TechSeoProbe;
  };
};

export type TetkikScore = {
  score: number;
  maxScore: 100;
  disclaimer: string;
  checks: TetkikCheck[];
  opportunities: string[];
  action: TetkikAction;
  /** Ana skora ek teknik SEO sinyali (robots.txt / sitemap.xml). */
  techSeo: TetkikTechSeoSignal[];
  pageSnippet: TetkikPageSnippet;
};

function inRange(length: number, min: number, max: number): boolean {
  return length >= min && length <= max;
}

function headingOrderIntact(levels: readonly number[]): boolean {
  if (levels.length === 0 || levels[0] !== 1) {
    return false;
  }
  for (let index = 1; index < levels.length; index += 1) {
    const current = levels[index] ?? 0;
    const previous = levels[index - 1] ?? 0;
    if (current > previous + 1) {
      return false;
    }
  }
  return true;
}

function isTurkish(lang: string): boolean {
  const value = lang.trim().toLowerCase();
  return value === "tr" || value.startsWith("tr-");
}

/** Görsel yoksa alt metin eksik sayılmaz; oran varsa tam puana yuvarlanır. */
export function imageAltPoints(images: readonly { hasAlt: boolean }[]): number {
  const weight = TETKIK_WEIGHTS.imageAlt;
  if (images.length === 0) {
    return weight;
  }
  const withAlt = images.filter((image) => image.hasAlt).length;
  return Math.round((withAlt / images.length) * weight);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

function row(id: TetkikCheckId, earned: number, detail = ""): TetkikCheck {
  const weight = TETKIK_WEIGHTS[id];
  const passed = earned === weight;
  return {
    id,
    label: TETKIK_LABELS[id],
    earned,
    weight,
    passed,
    detail,
    opportunity: passed ? "" : TETKIK_OPPORTUNITY[id],
  };
}

function failed(checks: readonly TetkikCheck[], ids: readonly TetkikCheckId[]): boolean {
  const set = new Set<string>(ids);
  return checks.some((check) => set.has(check.id) && !check.passed);
}

function actionFor(checks: readonly TetkikCheck[]): TetkikAction {
  const structuralGap = failed(checks, TETKIK_STRUCTURAL);
  const doorGap = failed(checks, TETKIK_CONVERSION);
  if (structuralGap) {
    const namedGate = failed(checks, TETKIK_SHOP_GATES);
    const shop = namedGate
      ? "Ölçülen sayfada dükkanın iskeleti eksik. Önce 3. Aşama — Yeni Dijital Dükkan. Başlık, mobil çerçeve, güvenli adres ve şişkin sayfa kapanmadan reklam konuşulmaz."
      : "Ölçülen sayfada dükkanın iskeleti eksik. Önce 3. Aşama — Yeni Dijital Dükkan. Bu eksikler kapanmadan reklam konuşulmaz.";
    const door = doorGap
      ? " Dönüşüm kapısı da kapalı. 4. Aşama — Reklam Paketi, dükkan kurulup kapı açılınca gelir."
      : "";
    return {
      stage: "shop",
      title: "3. Aşama — Yeni Dijital Dükkan",
      body: `${shop}${door}`,
    };
  }
  if (doorGap) {
    return {
      stage: "ads",
      title: "4. Aşama — Reklam Paketi",
      body: "İskelet ayakta. Eksik olan kapı: WhatsApp, telefon, form veya çağrı. 4. Aşama — Reklam Paketi, bu kapı açıldıktan sonra konuşulur.",
    };
  }
  return {
    stage: "ready",
    title: "Kapı açık",
    body: "Ölçülen iskelet ve dönüşüm kapısı yerinde. Reklam, dükkan ayaktayken ayrıca konuşulur.",
  };
}

export function scoreTetkik(parsed: ParsedHomepage, measures: TetkikMeasures): TetkikScore {
  const h1Count = parsed.headingLevels.filter((level) => level === 1).length;
  const checks: TetkikCheck[] = [
    row("title", inRange(parsed.title.length, 10, 60) ? TETKIK_WEIGHTS.title : 0),
    row(
      "metaDescription",
      inRange(parsed.metaDescription.length, 50, 160) ? TETKIK_WEIGHTS.metaDescription : 0,
    ),
    row("h1", h1Count === 1 ? TETKIK_WEIGHTS.h1 : 0),
    row("headingOrder", headingOrderIntact(parsed.headingLevels) ? TETKIK_WEIGHTS.headingOrder : 0),
    row("viewport", /width/i.test(parsed.viewport) ? TETKIK_WEIGHTS.viewport : 0),
    row("langTr", isTurkish(parsed.lang) ? TETKIK_WEIGHTS.langTr : 0),
    row("https", measures.https ? TETKIK_WEIGHTS.https : 0),
    row("whatsappOrPhone", parsed.whatsapp || parsed.phone ? TETKIK_WEIGHTS.whatsappOrPhone : 0),
    row("emailOrForm", parsed.email || parsed.form ? TETKIK_WEIGHTS.emailOrForm : 0),
    row("cta", parsed.cta ? TETKIK_WEIGHTS.cta : 0),
    row("imageAlt", imageAltPoints(parsed.images)),
    row(
      "ttfb",
      measures.ttfbMs >= 0 && measures.ttfbMs < TETKIK_TTFB_BUDGET_MS ? TETKIK_WEIGHTS.ttfb : 0,
      `${Math.max(0, Math.round(measures.ttfbMs))} ms`,
    ),
    row(
      "htmlSize",
      measures.htmlBytes >= 0 && measures.htmlBytes < TETKIK_HTML_BUDGET_BYTES ? TETKIK_WEIGHTS.htmlSize : 0,
      formatBytes(Math.max(0, measures.htmlBytes)),
    ),
  ];
  const byId = new Map(checks.map((check) => [check.id, check]));
  const ordered = TETKIK_CHECK_ORDER.map((id) => {
    const check = byId.get(id);
    if (!check) {
      throw new Error(`Tetkik maddesi eksik: ${id}`);
    }
    return check;
  });
  const score = ordered.reduce((sum, check) => sum + check.earned, 0);
  const techSeo = measures.techSeo
    ? techSeoSignalsFromProbes(measures.techSeo)
    : uncheckedTechSeoSignals("Ana sayfa skoru; kök SEO dosyası bu çağrıda ölçülmedi.");
  return {
    score,
    maxScore: TETKIK_MAX_SCORE,
    disclaimer: TETKIK_DISCLAIMER,
    checks: ordered,
    opportunities: ordered.map((check) => check.opportunity).filter((line) => line.length > 0),
    action: actionFor(ordered),
    techSeo,
    pageSnippet: pageSnippetFromParsed(parsed),
  };
}

export function scoreHomepageHtml(html: string, measures: TetkikMeasures): TetkikScore {
  return scoreTetkik(parseHomepageHtml(html), measures);
}

/** Açık maddeler, kaçan puanı büyük olandan. Eşitlikte ağırlık öne geçer. */
export function topOpenTetkikGaps(checks: readonly TetkikCheck[], limit = 2): TetkikCheck[] {
  return [...checks]
    .filter((check) => !check.passed)
    .sort((left, right) => {
      const missed = right.weight - right.earned - (left.weight - left.earned);
      if (missed !== 0) {
        return missed;
      }
      return right.weight - left.weight;
    })
    .slice(0, Math.max(0, limit));
}
