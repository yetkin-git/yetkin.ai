/**
 * Hibe hazırlık master planı. Deterministiktir: model, saat ve katalog okuması yoktur.
 * currentScore, firma profilinin geçtiği kriter oranıdır (analiz sekmesindeki kriter uyumu).
 * targetScore, hazırlıkla kapanan kriterler de geçince aynı oranın ulaşacağı değerdir.
 * İl, NACE, çalışan, yaş, kitle, ihracat ve patent eksikleri puana eklenmez.
 * Katalog belge adları kontrol listesidir; ikinci bir puan üretmez.
 * Son tarih yalnız çağıranın verdiği katalog anıdır.
 */

import { buildStoreZip } from "@/lib/tezgah/pro/zip";
import { grantInvestmentLabel } from "@/lib/yetkinhibe/grant-brief-axes";
import {
  grantBriefCriteria,
  type GrantProgramBrief,
} from "@/lib/yetkinhibe/match-grant-programs-for-brief";
import type { GrantCallStatus, GrantEligibilityCriteria } from "@/lib/yetkinhibe/types";

export const GRANT_PREP_SCORE_DISCLAIMER =
  "Bu yüzde kriter karşılama puanıdır. Resmî kurum onayı bu ekranda üretilmez.";

export const GRANT_PREP_WINDOW_TITLE = "Başvuru Öncesi Hazırlık Penceresi";

const RD_LABEL = "Ar-Ge / Yazılım Personel İstihdam Planı";
const MACHINE_BUDGET_LABEL = "Proforma Teklif & Makine-Teçhizat Bütçe Kırılımı";
const BLOCKER_NOTE =
  "Bu eksik hazırlık planıyla kapanmaz. Puan, profil veya çağrı şartı değişmeden artmaz.";

const CLOSABLE_KEYS = new Set(["requiresRdActivity", "investment"]);

const STAGE_TITLES = {
  m1: "1. Ay: Evrak & Altyapı",
  m2: "2. Ay: Teknik & Finansal Kurgu",
  m3: "3. Ay: Başvuru Dosyası & Sunum",
} as const;

export type GrantPrepGapKey = "requiresRdActivity" | "investment";

export type GrantPrepGap = {
  key: GrantPrepGapKey;
  label: string;
  points: number;
  task: string;
};

export type GrantPrepBlocker = {
  key: string;
  label: string;
  note: string;
};

export type GrantPrepTask = {
  actor: "firma" | "yetkinhibe";
  text: string;
};

export type GrantPrepStage = {
  id: "m1" | "m2" | "m3";
  title: string;
  tasks: readonly GrantPrepTask[];
};

export type GrantPrepWindow = {
  kind: "catalog" | "prep";
  title: string;
  detail: string;
};

export type GrantPrepMasterPlan = {
  grantId: string;
  title: string;
  sourceLabel: string;
  businessName: string | null;
  currentScore: number;
  targetScore: number;
  scoreLine: string;
  disclaimer: string;
  closable: readonly GrantPrepGap[];
  blockers: readonly GrantPrepBlocker[];
  documents: readonly string[];
  window: GrantPrepWindow;
  stages: readonly [GrantPrepStage, GrantPrepStage, GrantPrepStage];
};

export type GrantPrepPlanNote = {
  scoreLine: string;
  disclaimer: string;
  windowTitle: string;
  windowDetail: string;
  gaps: readonly string[];
  blockers: readonly string[];
  text: string;
};

export type GrantPrepMasterPlanInput = {
  brief: GrantProgramBrief;
  grantId: string;
  title: string;
  sourceLabel: string;
  businessName?: string | null;
  eligibility?: GrantEligibilityCriteria | null;
  requiredDocuments?: readonly string[] | null;
  applicationDeadline?: string | null;
  remainingDays?: number | null;
  status?: GrantCallStatus | null;
  /** Eligibility yoksa analiz satırındaki kriter uyumu. Yeni puan üretilmez. */
  fitPct?: number | null;
};

function scorePct(passed: number, total: number): number {
  if (total <= 0 || passed <= 0) {
    return 0;
  }
  if (passed >= total) {
    return 100;
  }
  return Math.round((passed / total) * 100);
}

function clampScore(value: number | null | undefined): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 100) {
    return 0;
  }
  return value;
}

function splitPoints(count: number, total: number): number[] {
  if (count <= 0) {
    return [];
  }
  if (total <= 0) {
    return Array.from({ length: count }, () => 0);
  }
  const base = Math.floor(total / count);
  let rest = total - base * count;
  return Array.from({ length: count }, () => {
    const extra = rest > 0 ? 1 : 0;
    rest -= extra;
    return base + extra;
  });
}

function cleanDocuments(rows: readonly string[] | null | undefined): string[] {
  if (!rows) {
    return [];
  }
  const out: string[] = [];
  for (const row of rows) {
    if (typeof row !== "string") {
      continue;
    }
    const text = row.trim().replace(/\s+/g, " ").slice(0, 180);
    if (text.length < 2 || out.includes(text)) {
      continue;
    }
    out.push(text);
    if (out.length >= 12) {
      break;
    }
  }
  return out;
}

function readDays(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 100_000) {
    return null;
  }
  return value;
}

function readDeadline(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value.trim())) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

function readStatus(value: GrantCallStatus | null | undefined): GrantCallStatus | null {
  if (value === "ACTIVE" || value === "CLOSING_SOON" || value === "UPCOMING" || value === "CLOSED") {
    return value;
  }
  return null;
}

/** Katalog anını İstanbul takvim gününe çevirir. Türkiye yıl boyu UTC+3. */
function istanbulDay(date: Date): string {
  const shifted = new Date(date.getTime() + 3 * 60 * 60 * 1000);
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const year = String(shifted.getUTCFullYear());
  return `${day}.${month}.${year}`;
}

function daySentence(days: number | null): string {
  return days === null ? "" : ` Kalan gün: ${days}.`;
}

function buildWindow(input: GrantPrepMasterPlanInput): GrantPrepWindow {
  const deadline = readDeadline(input.applicationDeadline);
  const days = readDays(input.remainingDays);
  const status = readStatus(input.status);
  const label = deadline ? istanbulDay(deadline) : null;
  const open = status === "ACTIVE" || status === "CLOSING_SOON";

  if (open && label) {
    const compress = days !== null && days < 90 ? ` 1., 2. ve 3. ay başlıkları hazırlık dilimidir. Katalogda kalan gün ${days}.` : "";
    return {
      kind: "catalog",
      title: "Katalog başvuru penceresi",
      detail: `Katalog son tarihi ${label}.${daySentence(days)} Üç aşama bu katalog kaydına bölünmüş hazırlıktır. Kurum takvimi değildir.${compress}`,
    };
  }

  if (status === "UPCOMING" && label) {
    return {
      kind: "prep",
      title: GRANT_PREP_WINDOW_TITLE,
      detail: `Pencere henüz açılmadı. Katalog son tarihi ${label}.${daySentence(days)} Üç aşama ${GRANT_PREP_WINDOW_TITLE} olarak durur. Kurum takvimi değildir.`,
    };
  }

  if (status === "CLOSED" && label) {
    return {
      kind: "prep",
      title: GRANT_PREP_WINDOW_TITLE,
      detail: `Katalog penceresi kapalı. Katalog son tarihi ${label}. Bu planda yeni bir son tarih yok. Üç aşama ${GRANT_PREP_WINDOW_TITLE} olarak durur.`,
    };
  }

  if (label) {
    return {
      kind: "prep",
      title: GRANT_PREP_WINDOW_TITLE,
      detail: `Katalog son tarihi ${label}. Pencerenin açık olup olmadığı bu kayıtta yok. Üç aşama ${GRANT_PREP_WINDOW_TITLE} olarak durur.`,
    };
  }

  return {
    kind: "prep",
    title: GRANT_PREP_WINDOW_TITLE,
    detail: "Katalogda okunmuş bir başvuru süresi yok. Üç aşama Başvuru Öncesi Hazırlık Penceresi olarak durur.",
  };
}

function allowedFocusLabel(eligibility: GrantEligibilityCriteria): string | null {
  const foci = eligibility.investmentFocus;
  if (!foci || foci.length === 0) {
    return null;
  }
  const names = foci.map((id) => grantInvestmentLabel(id) ?? id);
  return names.join(", ");
}

function investmentGapLabel(eligibility: GrantEligibilityCriteria): string {
  const foci = eligibility.investmentFocus ?? [];
  if (foci.includes("makine_techizat")) {
    return MACHINE_BUDGET_LABEL;
  }
  const allowed = allowedFocusLabel(eligibility);
  return allowed ? `Proforma Teklif ve Bütçe Kırılımı (${allowed})` : "Proforma Teklif ve Bütçe Kırılımı";
}

function pointsSuffix(points: number): string {
  return points > 0 ? ` (+${points} puan)` : "";
}

function rdTask(points: number): string {
  return `${RD_LABEL}${pointsSuffix(points)}: kişi sayısı, ay ve iş paketi yaz. Bu adım Ar-Ge kriterini kapatır.`;
}

function investmentTask(label: string, points: number, allowed: string | null): string {
  const focus = allowed ? ` İzin verilen odak: ${allowed}.` : "";
  return `${label}${pointsSuffix(points)}: bütçeyi çağrının izin verdiği odağa göre kır.${focus} Tutarlar senin tahminindir.`;
}

type CriterionState = "gap" | "met" | "open" | "unknown";

function buildStages(input: {
  documents: readonly string[];
  rd: CriterionState;
  investment: CriterionState;
  rdGap: GrantPrepGap | null;
  investmentGap: GrantPrepGap | null;
  focusLabel: string;
  allowedFocus: string | null;
}): readonly [GrantPrepStage, GrantPrepStage, GrantPrepStage] {
  const documentTasks: GrantPrepTask[] =
    input.documents.length > 0
      ? input.documents.map((doc) => ({
          actor: "firma",
          text: `«${doc}» belgesini katalogdaki adıyla hazırla.`,
        }))
      : [
          {
            actor: "firma",
            text: "Bu çağrı satırında belge listesi yok. Listeyi resmî ilandan oku.",
          },
        ];

  const rdFirm: GrantPrepTask =
    input.rd === "gap"
      ? { actor: "firma", text: input.rdGap?.task ?? rdTask(input.rdGap?.points ?? 0) }
      : input.rd === "met"
        ? { actor: "firma", text: "Ar-Ge kriteri şu an geçiyor. İstihdam planı bu çağrıda puana eklenmez." }
        : input.rd === "open"
          ? { actor: "firma", text: "Bu çağrı Ar-Ge şartı yazmıyor. İstihdam planı puana eklenmez." }
          : { actor: "firma", text: "Ar-Ge kriter dökümü bu satırda yok." };

  const budgetFirm: GrantPrepTask =
    input.investment === "gap"
      ? {
          actor: "firma",
          text:
            input.investmentGap?.task ??
            investmentTask("Proforma Teklif ve Bütçe Kırılımı", 0, input.allowedFocus),
        }
      : input.investment === "met"
        ? {
            actor: "firma",
            text: `Yatırım odağı kriteri geçiyor (${input.focusLabel}). Bütçe kalemlerini kendi tahmininle yaz. Katalog tavanı bu kalem değildir.`,
          }
        : input.investment === "open"
          ? {
              actor: "firma",
              text: `Bu çağrı yatırım odağı şartı yazmıyor. Seçilen odak: ${input.focusLabel}. Bütçe kalemlerini kendi tahmininle yaz. Katalog tavanı bu kalem değildir.`,
            }
          : { actor: "firma", text: "Yatırım kriter dökümü bu satırda yok." };

  return [
    {
      id: "m1",
      title: STAGE_TITLES.m1,
      tasks: [
        ...documentTasks,
        {
          actor: "yetkinhibe",
          text:
            input.documents.length > 0
              ? `Eksik belge kontrol listesine katalogdaki ${input.documents.length} adı yazar. Listeye yeni belge eklemez.`
              : "Belge kontrol listesine katalogda olmayan ad yazmaz.",
        },
      ],
    },
    {
      id: "m2",
      title: STAGE_TITLES.m2,
      tasks: [
        rdFirm,
        budgetFirm,
        {
          actor: "yetkinhibe",
          text: "Proje dosyasında personel, makine-teçhizat ve hizmet kalemlerinin taslak kırılımını üretir. Tutarlar senin tahminindir. Katalog tavanı bu satıra yazılmaz.",
        },
      ],
    },
    {
      id: "m3",
      title: STAGE_TITLES.m3,
      tasks: [
        {
          actor: "firma",
          text: "Beş bölümü tek dosyada topla: proje özeti, pazar, iş paketleri, bütçe, etki.",
        },
        {
          actor: "firma",
          text: `Sunumda kriter uyumunu yüzde olarak yaz. ${GRANT_PREP_SCORE_DISCLAIMER}`,
        },
        {
          actor: "yetkinhibe",
          text: "Tam proje dosyası taslağını Proje Dosyası sekmesinde üretir. Dosya resmî başvuru değildir.",
        },
      ],
    },
  ];
}

function criterionState(input: {
  known: boolean;
  row: { passed: boolean; unconstrained: boolean } | undefined;
}): CriterionState {
  if (!input.known) {
    return "unknown";
  }
  if (!input.row) {
    return "unknown";
  }
  if (input.row.unconstrained) {
    return "open";
  }
  return input.row.passed ? "met" : "gap";
}

export function grantPrepScoreLine(
  plan: Pick<GrantPrepMasterPlan, "currentScore" | "targetScore" | "closable">,
): string {
  if (plan.closable.length === 0) {
    return `Mevcut Kriter Uyumu: %${plan.currentScore}. Hazırlık planıyla kapanan ek kriter yok.`;
  }
  return `Mevcut Kriter Uyumu: %${plan.currentScore} → Eksik ${plan.closable.length} adımı tamamlarsan %${plan.targetScore} uyuma ulaşırsın.`;
}

function businessNameOf(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim().slice(0, 80);
  return trimmed.length >= 2 ? trimmed : null;
}

export function buildGrantPrepMasterPlan(input: GrantPrepMasterPlanInput): GrantPrepMasterPlan {
  const documents = cleanDocuments(input.requiredDocuments);
  const window = buildWindow(input);
  const focusLabel = grantInvestmentLabel(input.brief.investmentFocus) ?? input.brief.investmentFocus;
  const eligibility = input.eligibility ?? null;
  const criteria = eligibility ? grantBriefCriteria(input.brief, eligibility) : null;
  const passed = criteria ? criteria.filter((row) => row.passed).length : 0;
  const currentScore = criteria ? scorePct(passed, criteria.length) : clampScore(input.fitPct);
  const rdRow = criteria?.find((row) => row.key === "requiresRdActivity");
  const investmentRow = criteria?.find((row) => row.key === "investment");
  const failedClosable = (criteria ?? []).filter(
    (row) => !row.passed && !row.unconstrained && CLOSABLE_KEYS.has(row.key),
  );
  const rawTarget = criteria ? scorePct(passed + failedClosable.length, criteria.length) : currentScore;
  const targetScore = Math.min(100, Math.max(currentScore, rawTarget));
  const shares = splitPoints(failedClosable.length, targetScore - currentScore);
  const allowed = eligibility ? allowedFocusLabel(eligibility) : null;

  const closable: GrantPrepGap[] = [];
  failedClosable.forEach((row, index) => {
    const points = shares[index] ?? 0;
    if (points <= 0) {
      return;
    }
    if (row.key === "requiresRdActivity") {
      closable.push({
        key: "requiresRdActivity",
        label: RD_LABEL,
        points,
        task: rdTask(points),
      });
      return;
    }
    if (row.key === "investment") {
      const label = eligibility ? investmentGapLabel(eligibility) : "Proforma Teklif ve Bütçe Kırılımı";
      closable.push({
        key: "investment",
        label,
        points,
        task: investmentTask(label, points, allowed),
      });
    }
  });

  const blockers: GrantPrepBlocker[] = (criteria ?? [])
    .filter((row) => !row.passed && !row.unconstrained && !CLOSABLE_KEYS.has(row.key))
    .map((row) => ({
      key: row.key,
      label: row.label,
      note: BLOCKER_NOTE,
    }));

  const rdGap = closable.find((row) => row.key === "requiresRdActivity") ?? null;
  const investmentGap = closable.find((row) => row.key === "investment") ?? null;
  const stages = buildStages({
    documents,
    rd: criterionState({ known: criteria !== null, row: rdRow }),
    investment: criterionState({ known: criteria !== null, row: investmentRow }),
    rdGap,
    investmentGap,
    focusLabel,
    allowedFocus: allowed,
  });

  const plan: GrantPrepMasterPlan = {
    grantId: input.grantId.trim().slice(0, 80),
    title: input.title.trim().slice(0, 180) || "Destek programı",
    sourceLabel: input.sourceLabel.trim().slice(0, 80) || "Katalog",
    businessName: businessNameOf(input.businessName),
    currentScore,
    targetScore,
    scoreLine: "",
    disclaimer: GRANT_PREP_SCORE_DISCLAIMER,
    closable,
    blockers,
    documents,
    window,
    stages,
  };
  plan.scoreLine = grantPrepScoreLine(plan);
  return plan;
}

export function grantPrepPlanNote(plan: GrantPrepMasterPlan): GrantPrepPlanNote {
  return {
    scoreLine: plan.scoreLine,
    disclaimer: plan.disclaimer,
    windowTitle: plan.window.title,
    windowDetail: plan.window.detail,
    gaps: plan.closable.map((row) => `${row.label} (+${row.points} puan)`),
    blockers: plan.blockers.map((row) => row.label),
    text: renderGrantPrepMasterPlan(plan),
  };
}

function actorLabel(actor: GrantPrepTask["actor"]): string {
  return actor === "firma" ? "Firma" : "YetkinHibe";
}

export function renderGrantPrepMasterPlan(plan: GrantPrepMasterPlan): string {
  const lines: string[] = [
    "Hibe Hazırlık Master Planı",
    `${plan.sourceLabel} — ${plan.title}`,
  ];
  if (plan.businessName) {
    lines.push(`Firma: ${plan.businessName}`);
  }
  lines.push("", plan.disclaimer, "", plan.scoreLine, "", "Başvuru penceresi", plan.window.title, plan.window.detail, "");
  lines.push("Kapatılabilir eksikler");
  if (plan.closable.length === 0) {
    lines.push("Kapatılabilir kriter eksik yok.");
  } else {
    for (const gap of plan.closable) {
      lines.push(`- ${gap.label} (+${gap.points} puan)`);
    }
  }
  lines.push("", "Belge planıyla kapanmayan şartlar");
  if (plan.blockers.length === 0) {
    lines.push("Belge planıyla kapanmayan şart yok.");
  } else {
    for (const blocker of plan.blockers) {
      lines.push(`- ${blocker.label}. ${blocker.note}`);
    }
  }
  for (const stage of plan.stages) {
    lines.push("", stage.title);
    for (const task of stage.tasks) {
      lines.push(`${actorLabel(task.actor)}: ${task.text}`);
    }
  }
  return lines.join("\n");
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Sıkıştırmasız DOCX. Metin `renderGrantPrepMasterPlan` çıktısıdır. */
export function grantPrepMasterPlanDocx(plan: GrantPrepMasterPlan): Uint8Array {
  const paragraphs = renderGrantPrepMasterPlan(plan)
    .split(/\r?\n/)
    .map((line) => `<w:p><w:r><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r></w:p>`)
    .join("");
  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr/></w:body></w:document>`;
  return buildStoreZip([
    {
      name: "[Content_Types].xml",
      text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`,
    },
    {
      name: "_rels/.rels",
      text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
    },
    { name: "word/document.xml", text: document },
  ]);
}

export function grantPrepDocxFilename(grantId: string): string {
  const slug = grantId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug ? `hibe-hazirlik-plani-${slug}.docx` : "hibe-hazirlik-plani.docx";
}
