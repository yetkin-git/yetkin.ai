import "server-only";

import { invokeLlm, type InvokeLlmDeps } from "@/lib/kernel/ai/llm-gateway";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import { formatAmountMinorAsWholeTry } from "@/lib/yetkinhibe/format-amount";
import {
  grantAudienceLabel,
  grantInvestmentLabel,
  grantNaceLabel,
  grantProvinceLabel,
  grantRdLabel,
} from "@/lib/yetkinhibe/grant-brief-axes";
import { loadYetkinhibeGrantCatalog } from "@/lib/yetkinhibe/grant-catalog-live";
import {
  matchGrantProgramsForBrief,
  type GrantBriefCall,
  type GrantEligibleProgramMatch,
} from "@/lib/yetkinhibe/match-grant-programs-for-brief";
import {
  GRANT_DOSSIER_BUDGET_NOTE,
  GRANT_DOSSIER_DISCLAIMER,
  GRANT_DOSSIER_NO_ELIGIBLE,
  GRANT_DOSSIER_PROGRAM_MISSING,
  GRANT_DOSSIER_SCHEDULE_NOTE,
  GRANT_PROJECT_DISCLAIMER,
} from "@/lib/yetkinhibe/grant-project-notes";
import { TEZGAH_FAIL_MESSAGE, TEZGAH_GUEST_QUOTA_MESSAGE, TEZGAH_MEMBER_QUOTA_MESSAGE } from "@/lib/tezgah/catalog";
import { readGrantDossierPlan } from "@/lib/tezgah/grant/details";
import { readGrantDraft } from "@/lib/tezgah/grant/draft";
import { readGrantDossierNarrative, readGrantNarrative } from "@/lib/tezgah/grant/narrative";
import { grantSystemPrompt, grantUserPrompt } from "@/lib/tezgah/grant/prompts";
import { grantGenerateRequestSchema, type GrantGenerateRequest } from "@/lib/tezgah/grant/schema";
import type { GrantDossier, GrantEligibleProgram, GrantProjectReport } from "@/lib/tezgah/grant/types";
import { consumeTezgahQuota, peekTezgahQuota, refundTezgahQuota } from "@/lib/tezgah/quota";

/** Üç bölüm tek çağrıya sığar. Katalog tutarı bu tavandan geçmez; kod basar. */
export const GRANT_MAX_OUTPUT_TOKENS = 900;
/** Tam dosyanın yedi düz metin bölümü. Tutar ve ay aralığı bu tavandan geçmez. */
export const GRANT_DOSSIER_MAX_OUTPUT_TOKENS = 1_800;
export const GRANT_MODEL_ROLE = "LITE_STREAM" as const;

export type GrantGenerateResult =
  | ({
      ok: true;
      remaining: number;
      limit: number;
      guest: boolean;
    } & GrantProjectReport)
  | {
      ok: false;
      error: string;
      status: 400 | 429 | 503;
      remaining: number;
      limit: number;
      guest: boolean;
    };

export type GenerateGrantDeps = InvokeLlmDeps & {
  now?: () => Date;
  invoke?: typeof invokeLlm;
  loadCatalog?: (now: Date) => Promise<readonly GrantBriefCall[]>;
};

function plain(value: string, max: number): string {
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : clean.slice(0, max);
}

function catalogPoolLabel(poolAmountMinor: number | null): string {
  if (poolAmountMinor === null) {
    return "Havuz ilan edilmedi";
  }
  return `Katalog havuzu ${formatAmountMinorAsWholeTry(poolAmountMinor)}`;
}

function catalogRatioLabel(bps: number): string {
  const whole = Math.trunc(bps / 100);
  const frac = bps % 100;
  if (frac === 0) {
    return `Katalog destek oranı %${whole}`;
  }
  return `Katalog destek oranı %${whole},${Math.trunc(frac / 10)}`;
}

function toEligibleProgram(program: GrantEligibleProgramMatch): GrantEligibleProgram {
  return {
    grantId: program.grantId,
    title: program.title,
    sourceLabel: program.sourceLabel,
    officialInfoUrl: program.officialInfoUrl,
    remainingDays: program.remainingDays,
    criteria: program.criteria.map((row) => ({
      key: row.key,
      label: row.label,
      passed: row.passed,
      unconstrained: row.unconstrained,
    })),
    poolLabel: catalogPoolLabel(program.poolAmountMinor),
    ceilingLabel: `Katalog tavanı ${formatAmountMinorAsWholeTry(program.maxSupportMinor)}`,
    ratioLabel: catalogRatioLabel(program.supportRatioBps),
  };
}

/**
 * Hibe proje dosyası. Günlük hak tezgâh havuzundadır.
 * Katalog okunamazsa veya model bölümü boşsa hak geri yazılır.
 * Ayrıntı isteğe bağlıdır. Tutar ve ay aralığı girilen değerden basılır.
 * Seçilen program uygun listede yoksa hak geri yazılır.
 * Taslak tablosuna yazılmaz. Cüzdan yazılmaz. Oda kapısı açılmaz.
 */
export async function generateGrantProject(
  input: {
    actorId: string;
    guest: boolean;
    request: GrantGenerateRequest;
  },
  deps: GenerateGrantDeps = {},
): Promise<GrantGenerateResult> {
  const parsed = grantGenerateRequestSchema.safeParse(input.request);
  const now = deps.now?.() ?? new Date();
  const open = () => peekTezgahQuota(input.actorId, input.guest, now);
  if (!parsed.success) {
    const quota = open();
    return {
      ok: false,
      error: "Alanları kısa ve net doldur.",
      status: 400,
      remaining: quota.remaining,
      limit: quota.limit,
      guest: input.guest,
    };
  }

  const draft = readGrantDraft(parsed.data);
  if (!draft) {
    const quota = open();
    return {
      ok: false,
      error: "Alanları kısa ve net doldur.",
      status: 400,
      remaining: quota.remaining,
      limit: quota.limit,
      guest: input.guest,
    };
  }

  const provinceLabel = grantProvinceLabel(draft.provinceCode);
  const audienceLabel = grantAudienceLabel(draft.audience);
  const naceLabel = grantNaceLabel(draft.naceGroup);
  const investmentLabel = grantInvestmentLabel(draft.investmentFocus);
  const rdLabel = grantRdLabel(draft.rdMaturityLevel);
  if (!provinceLabel || !audienceLabel || !naceLabel || !investmentLabel || !rdLabel) {
    const quota = open();
    return {
      ok: false,
      error: "Alanları kısa ve net doldur.",
      status: 400,
      remaining: quota.remaining,
      limit: quota.limit,
      guest: input.guest,
    };
  }

  const dossierRead = parsed.data.details ? readGrantDossierPlan(parsed.data.details) : null;
  if (dossierRead && !dossierRead.ok) {
    const quota = open();
    return {
      ok: false,
      error: dossierRead.error,
      status: 400,
      remaining: quota.remaining,
      limit: quota.limit,
      guest: input.guest,
    };
  }

  const slot = consumeTezgahQuota(input.actorId, input.guest, now);
  if (!slot.allowed) {
    return {
      ok: false,
      error: input.guest ? TEZGAH_GUEST_QUOTA_MESSAGE : TEZGAH_MEMBER_QUOTA_MESSAGE,
      status: 429,
      remaining: 0,
      limit: slot.limit,
      guest: input.guest,
    };
  }

  const restore = (): GrantGenerateResult => {
    const restored = refundTezgahQuota(input.actorId, input.guest, now);
    return {
      ok: false,
      error: TEZGAH_FAIL_MESSAGE,
      status: 503,
      remaining: restored.remaining,
      limit: restored.limit,
      guest: input.guest,
    };
  };

  let calls: readonly GrantBriefCall[];
  try {
    const load = deps.loadCatalog ?? ((at: Date) => loadYetkinhibeGrantCatalog(at));
    calls = await load(now);
  } catch {
    return restore();
  }
  if (calls.length === 0) {
    return restore();
  }

  const matched = matchGrantProgramsForBrief(
    {
      provinceCode: draft.provinceCode,
      audience: draft.audience,
      naceGroup: draft.naceGroup,
      investmentFocus: draft.investmentFocus,
      employeeCount: draft.employeeCount,
      companyAgeYears: draft.companyAgeYears,
      rdMaturityLevel: draft.rdMaturityLevel,
      exportActive: draft.exportActive,
      hasPatentOrUtilityModel: draft.hasPatentOrUtilityModel,
    },
    calls,
  );

  let target: GrantEligibleProgramMatch | null = null;
  if (dossierRead?.ok) {
    target = matched.eligible.find((row) => row.grantId === dossierRead.plan.targetGrantId) ?? null;
    if (!target) {
      const restored = refundTezgahQuota(input.actorId, input.guest, now);
      return {
        ok: false,
        error: matched.eligible.length === 0 ? GRANT_DOSSIER_NO_ELIGIBLE : GRANT_DOSSIER_PROGRAM_MISSING,
        status: 400,
        remaining: restored.remaining,
        limit: restored.limit,
        guest: input.guest,
      };
    }
  }

  const dossierContext = target
    ? {
        criterionLabels: target.criteria
          .map((row) => plain(row.label, 80))
          .filter((label) => label.length >= 2),
        teamExpertise: dossierRead?.ok ? plain(dossierRead.plan.expertiseText, 800) : "",
        outputGoal: dossierRead?.ok ? plain(dossierRead.plan.outputGoal, 800) : "",
      }
    : null;
  if (dossierContext && dossierContext.criterionLabels.length === 0) {
    return restore();
  }

  const invoke = deps.invoke ?? invokeLlm;
  const llm = await invoke(
    {
      role: GRANT_MODEL_ROLE,
      system: grantSystemPrompt(dossierContext !== null),
      user: grantUserPrompt({
        businessName: plain(draft.businessName, 80),
        provinceLabel,
        audienceLabel,
        naceLabel,
        investmentLabel,
        project: plain(draft.project, 1500),
        dossier: dossierContext ?? undefined,
      }),
      temperature: 0.2,
      maxOutputTokens: dossierContext ? GRANT_DOSSIER_MAX_OUTPUT_TOKENS : GRANT_MAX_OUTPUT_TOKENS,
      maxAttempts: 1,
      timeoutMs: dossierContext ? 35_000 : 25_000,
      rateLimit: {
        identifier: input.actorId,
        scope: "tezgah",
        limit: 8,
        windowMs: 60_000,
      },
      billing: {
        userId: input.guest ? null : input.actorId,
        source: AI_TOKEN_SOURCES.TEZGAH,
        recordUsage: false,
      },
    },
    deps,
  );

  const briefNarrative = dossierContext ? null : readGrantNarrative(llm?.text ?? "");
  const fullNarrative = dossierContext ? readGrantDossierNarrative(llm?.text ?? "") : null;
  if (dossierContext ? !fullNarrative : !briefNarrative) {
    return restore();
  }
  const narrative = fullNarrative ?? briefNarrative;
  if (!narrative) {
    return restore();
  }

  let dossier: GrantDossier | null = null;
  if (dossierContext && fullNarrative && target && dossierRead?.ok) {
    dossier = {
      disclaimer: GRANT_DOSSIER_DISCLAIMER,
      targetTitle: plain(target.title, 180),
      targetSourceLabel: plain(target.sourceLabel, 80),
      targetInfoUrl: target.officialInfoUrl,
      criterionLabels: dossierContext.criterionLabels,
      durationMonths: dossierRead.plan.durationMonths,
      durationNote: GRANT_DOSSIER_SCHEDULE_NOTE,
      workPackages: dossierRead.plan.workPackages,
      budgetNote: GRANT_DOSSIER_BUDGET_NOTE,
      budgetTotalLabel: formatAmountMinorAsWholeTry(dossierRead.plan.totalMinor),
      budgetRows: dossierRead.plan.budgetRows.map((row) => ({
        category: row.category,
        label: row.label,
        amountLabel: formatAmountMinorAsWholeTry(row.amountMinor),
      })),
      budgetRationale: fullNarrative.budgetRationale,
      teamHeadcount: dossierRead.plan.teamHeadcount,
      teamRows: dossierRead.plan.teamRows,
      competencyNote: fullNarrative.competencyNote,
      outputGoal: dossierRead.plan.outputGoal,
      commercialization: fullNarrative.commercialization,
      summary: fullNarrative.summary,
    };
  }
  if (dossierContext && !dossier) {
    return restore();
  }

  const report: GrantProjectReport = {
    tool: "grant",
    disclaimer: GRANT_PROJECT_DISCLAIMER,
    preparedAt: now.toISOString(),
    businessName: plain(draft.businessName, 80),
    freelancerName: plain(draft.freelancerName, 80),
    provinceLabel,
    audienceLabel,
    naceLabel,
    investmentFocusLabel: investmentLabel,
    employeeCount: draft.employeeCount,
    companyAgeYears: draft.companyAgeYears,
    rdLabel,
    exportLabel: draft.exportActive ? "İhracat var" : "İhracat yok",
    patentLabel: draft.hasPatentOrUtilityModel ? "Patent veya faydalı model var" : "Patent yok",
    eligible: matched.eligible.map(toEligibleProgram),
    closed: matched.closed.map((row) => ({ ...row })),
    unverified: matched.unverified.map((row) => ({ ...row })),
    purpose: narrative.purpose,
    market: narrative.market,
    schedule: draft.schedule.map((row) => ({
      id: row.id,
      name: row.name,
      windowLabel: row.windowLabel,
      draft: row.windowLabel === null,
    })),
    investments: draft.investments.map((row) => ({
      category: row.category,
      label: row.label,
      amountLabel: row.amountMinor === null ? null : formatAmountMinorAsWholeTry(row.amountMinor),
    })),
    risk: narrative.risk,
    dossier,
  };

  return {
    ok: true,
    ...report,
    remaining: slot.remaining,
    limit: slot.limit,
    guest: input.guest,
  };
}
