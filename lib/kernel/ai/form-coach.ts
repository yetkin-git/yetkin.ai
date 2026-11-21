import "server-only";

import { z } from "zod";
import {
  FORM_COACH_CONTEXTS,
  FORM_COACH_MAX_INPUT_CHARS,
  FORM_COACH_MIN_CHARS_FOR_API,
  FORM_COACH_PATH,
  type FormCoachContext,
} from "@/lib/kernel/ai/form-coach-client";
import { invokeLlm, type InvokeLlmDeps } from "@/lib/kernel/ai/llm-gateway";
import { getDefaultModelId } from "@/lib/kernel/ai/model-roles";
import { resolveProductModel } from "@/lib/kernel/ai/product-models";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import {
  consumeHttpRateLimit,
  HTTP_RATE_LIMITS,
} from "@/lib/kernel/security/http-rate-limit";

export {
  FORM_COACH_CONTEXTS,
  FORM_COACH_MAX_INPUT_CHARS,
  FORM_COACH_MIN_CHARS_FOR_API,
  FORM_COACH_PATH,
  type FormCoachContext,
};

/** Form koçu. Çağrı anı `resolveProductModel("textEasy")` okur. */
export const FORM_COACH_ROLE = "LITE_STREAM" as const;
/** Kod varsayılanı. Boş yuva bu kimliğe düşer. */
export const FORM_COACH_MODEL_ID = getDefaultModelId(FORM_COACH_ROLE);
export const FORM_COACH_MAX_OUTPUT_TOKENS = 120;

const CONTEXT_LABEL: Record<FormCoachContext, string> = {
  hibe: "hibe / proje başvurusu",
  tezgah: "tezgâh belge üretimi",
  kurumsal: "kurumsal talep",
  ecommerce: "e-ticaret ürün açıklaması",
  career: "kariyer / CV özeti",
  general: "genel form girdisi",
};

export const FORM_COACH_SYSTEM = [
  "Sen Yetkin.ai form koçusun.",
  "Kullanıcı metnini verilen form bağlamına göre değerlendir.",
  "Eksik kritik bilgi varsa tek cümlelik yapıcı Türkçe ipucu ver; emoji 💡 ile başla.",
  "Metin yeterliyse yalnız şu cümleyi yaz: ✓ Harika, tüm kritik detaylar mevcut. Doğrudan işleme geçebilirsiniz.",
  "Başka madde, madde işareti, markdown veya model adı yazma. En fazla 1 cümle.",
].join(" ");

export const formCoachRequestSchema = z.object({
  text: z.string().trim().min(FORM_COACH_MIN_CHARS_FOR_API).max(FORM_COACH_MAX_INPUT_CHARS),
  context: z.enum(FORM_COACH_CONTEXTS).default("general"),
});

export type FormCoachRequest = z.infer<typeof formCoachRequestSchema>;

export type FormCoachQuotaPort = {
  consume(
    userId: string,
  ):
    | { allowed: boolean; remaining: number; limit: number }
    | Promise<{ allowed: boolean; remaining: number; limit: number }>;
};

export type FormCoachOk = {
  ok: true;
  tip: string;
  remaining: number;
  limit: number;
  source: "llm" | "fail-safe";
};

export type FormCoachFail = {
  ok: false;
  error: string;
  status: 400 | 429;
  remaining: number;
  limit: number;
};

export type FormCoachResult = FormCoachOk | FormCoachFail;

export type CoachFormFieldDeps = InvokeLlmDeps & {
  quota?: FormCoachQuotaPort;
  invoke?: typeof invokeLlm;
};

export function createHttpFormCoachQuota(): FormCoachQuotaPort {
  return {
    async consume(userId) {
      const decision = await consumeHttpRateLimit(userId, HTTP_RATE_LIMITS.formCoachUser);
      return {
        allowed: decision.allowed,
        remaining: decision.remaining,
        limit: decision.limit,
      };
    },
  };
}

const FAIL_SAFE_TIP =
  "✓ Temel detaylar görünüyor. İsterseniz bir iki somut ölçü veya hedef daha ekleyebilirsiniz.";

function normalizeTip(raw: string): string {
  const compact = raw.replace(/\s+/g, " ").trim();
  if (!compact) {
    return FAIL_SAFE_TIP;
  }
  const firstLine = compact.split(/(?<=[.!?…])\s+/)[0] ?? compact;
  return firstLine.slice(0, 280);
}

export async function coachFormField(
  input: {
    userId: string;
    text: string;
    context?: FormCoachContext;
  },
  deps: CoachFormFieldDeps = {},
): Promise<FormCoachResult> {
  const parsed = formCoachRequestSchema.safeParse({
    text: input.text,
    context: input.context ?? "general",
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Metin koçluk için uygun değil.",
      status: 400,
      remaining: HTTP_RATE_LIMITS.formCoachUser.limit,
      limit: HTTP_RATE_LIMITS.formCoachUser.limit,
    };
  }

  const quota = deps.quota ?? createHttpFormCoachQuota();
  const slot = await Promise.resolve(quota.consume(input.userId));
  if (!slot.allowed) {
    return {
      ok: false,
      error: "Çok fazla koçluk isteği. Biraz sonra yeniden deneyin.",
      status: 429,
      remaining: 0,
      limit: slot.limit,
    };
  }

  const invoke = deps.invoke ?? invokeLlm;
  const label = CONTEXT_LABEL[parsed.data.context];
  const llm = await invoke(
    {
      role: FORM_COACH_ROLE,
      model: await resolveProductModel("textEasy"),
      system: FORM_COACH_SYSTEM,
      user: `Bağlam: ${label}\nMetin:\n${parsed.data.text}`,
      temperature: 0.2,
      maxOutputTokens: FORM_COACH_MAX_OUTPUT_TOKENS,
      rateLimit: {
        identifier: input.userId,
        scope: "form-coach",
        limit: HTTP_RATE_LIMITS.formCoachUser.limit,
        windowMs: HTTP_RATE_LIMITS.formCoachUser.windowMs,
      },
      billing: {
        userId: input.userId.startsWith("guest:") ? null : input.userId,
        source: AI_TOKEN_SOURCES.SUPPORT,
        recordUsage: false,
      },
    },
    deps,
  );

  if (!llm?.text) {
    return {
      ok: true,
      tip: FAIL_SAFE_TIP,
      remaining: slot.remaining,
      limit: slot.limit,
      source: "fail-safe",
    };
  }

  return {
    ok: true,
    tip: normalizeTip(llm.text),
    remaining: slot.remaining,
    limit: slot.limit,
    source: "llm",
  };
}
