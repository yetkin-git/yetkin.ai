import "server-only";

import {
  careerCoachNote,
  dossierFromModelText,
  fallbackCareerDialogue,
  buildFallbackDossier,
  listedVerifiedBadges,
  scrubCareerCoachText,
  type CareerCoachDossier,
  type CareerCoachRequest,
} from "@/lib/career/coach-contract";
import { CAREER_COACH_DISCLAIMER } from "@/lib/copy/sen-voice/career-coach";
import { invokeLlm, type InvokeLlmDeps } from "@/lib/kernel/ai/llm-gateway";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import { sanitizeGeminiApiKey } from "@/lib/kernel/ai/providers/gemini";
import type { LlmChatTurn } from "@/lib/kernel/ai/types";

export const CAREER_COACH_ROLE = "FAST_STREAM" as const;

export const CAREER_COACH_SYSTEM = `Türkçe yaz. Kısa, somut ve dürüst ol.
Yalnızca kullanıcı JSON'undaki verifiedBadges adları doğrulanmış rozettir. Listede olmayan eğitim, sertifika, kurs veya deneyim doğrulanmış değildir; deneyim cümlesi olarak kalır.
İşe yerleşme, maaş veya gelir garantisi verme. Taslak işe yerleşmeyi veya gelir elde etmeyi garanti etmez.
Sağlayıcı ve model adı yazma.
Üç iş önerisi somut hizmet olsun. tezgahToolId yalnız şunlardan biri veya null: ecommerce, proposal, tetkik, dukkan, pazaryeri, reklam, grant.
incomeStep bir sonraki teslim eylemidir, kazanç sözü değildir.
Yanıt yalnız JSON olsun:
{"cv":"","swot":{"strengths":[""],"weaknesses":[""],"opportunities":[""],"threats":[""]},"offers":[{"title":"","why":"","incomeStep":"","tezgahToolId":null}],"roadmap":["",""]}`;

export const CAREER_COACH_DIALOGUE_SYSTEM = `Türkçe yaz. Kariyer koçusun. Elindeki CV ve SWOT taslağını bağlam olarak kullan.
Yalnızca verifiedBadges adları doğrulanmış rozettir. Kazanılmamış belgeyi doğrulanmış yazma.
İşe yerleşme veya gelir garantisi verme. Cümlenin sonunda taslağın garanti etmediğini söyle.
Sağlayıcı ve model adı yazma. JSON isteme. Düz metin yaz.`;

export type CareerCoachProfileResult = {
  mode: "profile";
  source: "llm" | "fallback";
  note: string;
  verifiedBadgeCount: number;
  dossier: CareerCoachDossier;
};

export type CareerCoachDialogueResult = {
  mode: "dialogue";
  source: "llm" | "fallback";
  reply: string;
  disclaimer: string;
};

export type CareerCoachResult = CareerCoachProfileResult | CareerCoachDialogueResult;

export type CareerCoachDeps = InvokeLlmDeps & {
  invoke?: typeof invokeLlm;
  modelConfigured?: boolean;
};

function modelConfigured(deps: CareerCoachDeps): boolean {
  if (typeof deps.modelConfigured === "boolean") {
    return deps.modelConfigured;
  }
  return sanitizeGeminiApiKey(process.env.GEMINI_API_KEY) != null;
}

function profileInput(request: CareerCoachRequest, verifiedBadges: readonly string[]) {
  return {
    targetRole: request.targetRole,
    experience: request.experience,
    goal: request.goal,
    verifiedBadges,
  };
}

export async function runCareerCoach(
  input: {
    userId: string;
    request: CareerCoachRequest;
    verifiedBadges: readonly string[];
  },
  deps: CareerCoachDeps = {},
): Promise<CareerCoachResult> {
  const badges = listedVerifiedBadges(input.verifiedBadges);
  const profile = profileInput(input.request, badges.titles);
  const configured = modelConfigured(deps);
  const invoke = deps.invoke ?? invokeLlm;

  if (input.request.mode === "profile") {
    const fallback = buildFallbackDossier(profile);
    const llm = configured
      ? await invoke(
      {
        role: CAREER_COACH_ROLE,
        system: CAREER_COACH_SYSTEM,
        user: JSON.stringify({
          targetRole: profile.targetRole,
          experience: profile.experience,
          goal: profile.goal,
          verifiedBadges: badges.titles,
          verifiedBadgeCount: badges.total,
        }),
        temperature: 0.4,
        maxOutputTokens: 1800,
        responseJson: true,
        timeoutMs: 25_000,
        rateLimit: {
          identifier: input.userId,
          scope: "career-coach",
          limit: 20,
          windowMs: 24 * 60 * 60_000,
        },
        billing: {
          userId: input.userId,
          source: AI_TOKEN_SOURCES.CAREER,
          recordUsage: false,
        },
      },
      deps,
    )
      : null;
    const parsed = llm?.text ? dossierFromModelText(llm.text, profile) : null;
    const dossier = parsed ?? fallback;
    return {
      mode: "profile",
      source: dossier.source,
      note: careerCoachNote(dossier.source, configured),
      verifiedBadgeCount: badges.total,
      dossier,
    };
  }

  const dossier = input.request.dossier ?? null;
  const history: LlmChatTurn[] = (input.request.history ?? []).map((turn) => ({
    role: turn.role,
    content: turn.content,
  }));
  const llm = configured
    ? await invoke(
    {
      role: CAREER_COACH_ROLE,
      system: CAREER_COACH_DIALOGUE_SYSTEM,
      user: JSON.stringify({
        message: input.request.message,
        targetRole: profile.targetRole,
        experience: profile.experience,
        goal: profile.goal,
        verifiedBadges: badges.titles,
        verifiedBadgeCount: badges.total,
        dossier,
      }),
      history,
      temperature: 0.3,
      maxOutputTokens: 700,
      timeoutMs: 25_000,
      rateLimit: {
        identifier: input.userId,
        scope: "career-coach-dialogue",
        limit: 20,
        windowMs: 24 * 60 * 60_000,
      },
      billing: {
        userId: input.userId,
        source: AI_TOKEN_SOURCES.CAREER,
        recordUsage: false,
      },
    },
    deps,
  )
    : null;
  const reply = llm?.text
    ? scrubCareerCoachText(llm.text, badges.titles)
    : "";
  const safeReply =
    reply.length > 0
      ? reply
      : fallbackCareerDialogue(input.request.message, dossier, badges.titles);
  const withSeal = foldHasDisclaimer(safeReply)
    ? safeReply
    : `${safeReply}\n\n${CAREER_COACH_DISCLAIMER}`;
  return {
    mode: "dialogue",
    source: llm?.text && reply.length > 0 ? "llm" : "fallback",
    reply: withSeal,
    disclaimer: CAREER_COACH_DISCLAIMER,
  };
}

function foldHasDisclaimer(text: string): boolean {
  return text.toLocaleLowerCase("tr-TR").includes("garanti etmez");
}
