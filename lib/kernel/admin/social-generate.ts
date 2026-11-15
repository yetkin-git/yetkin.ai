import "server-only";

import { invokeLlm } from "@/lib/kernel/ai/llm-gateway";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import type { InvokeLlmInput } from "@/lib/kernel/ai/types";
import { sanitizeGeminiApiKey } from "@/lib/kernel/ai/providers/gemini";
import {
  acceptModelReply,
  acceptModelSocialPack,
  composeBrandPackage,
  composeSocialReply,
  SOCIAL_MODULE_LABELS,
  SOCIAL_MODULE_LINKS,
  type SocialDraft,
  type SocialModule,
} from "@/lib/kernel/admin/social-desk";

type Invoke = (input: InvokeLlmInput) => Promise<{ text: string } | null>;

export async function generateSocialPackage(input: {
  module: SocialModule;
  userId: string;
  invoke?: Invoke;
}): Promise<{ drafts: SocialDraft[]; source: "gemini" | "template"; note: string }> {
  const fallback = composeBrandPackage(input.module);
  if (sanitizeGeminiApiKey(process.env.GEMINI_API_KEY) == null) {
    return {
      drafts: fallback,
      source: "template",
      note: "GEMINI_API_KEY yok. Marka şablonu kullanıldı.",
    };
  }
  const invoke = input.invoke ?? defaultInvoke;
  const label = SOCIAL_MODULE_LABELS[input.module];
  const targetUrl = SOCIAL_MODULE_LINKS[input.module];
  let text = "";
  try {
    const result = await invoke({
      role: "LITE_STREAM",
      system: [
        "yetkin.ai sosyal medya editörüsün. Türkçe yaz.",
        "Uydurma metrik, kesin hibe, garanti ve iş vaadi yazma.",
        "Her gövde verilen hedef linki aynen taşısın.",
        "LinkedIn profesyonel B2B. Instagram ve Facebook KOBİ ve esnaf dili. X en fazla 3 tweet, tweetler \\n---\\n ile ayrılır, her tweet 280 karakteri geçmez.",
        'Yalnız JSON dön: {"posts":[{"platform":"LINKEDIN|INSTAGRAM|FACEBOOK|X","title":"","body":"","imagePrompt":""}]}',
      ].join(" "),
      user: JSON.stringify({ module: label, targetUrl }),
      temperature: 0.4,
      maxOutputTokens: 1800,
      responseJson: true,
      timeoutMs: 25_000,
      maxAttempts: 1,
      rateLimit: {
        identifier: input.userId,
        scope: "admin-social-pack",
        limit: 30,
        windowMs: 24 * 60 * 60_000,
      },
      billing: {
        userId: input.userId,
        source: AI_TOKEN_SOURCES.SUPPORT,
        recordUsage: false,
      },
    });
    text = result?.text ?? "";
  } catch {
    text = "";
  }
  const accepted = text ? acceptModelSocialPack(input.module, text) : null;
  if (!accepted) {
    return {
      drafts: fallback,
      source: "template",
      note: "Gemini yanıtı marka kuralına uymadı. Marka şablonu kullanıldı.",
    };
  }
  return { drafts: accepted, source: "gemini", note: "Gemini taslağı üretildi. Yayın kendiliğinden gitmez." };
}

export async function generateSocialReply(input: {
  inbound: string;
  module: SocialModule;
  userId: string;
  invoke?: Invoke;
}): Promise<{ draft: string; source: "gemini" | "template"; note: string }> {
  const fallback = composeSocialReply({ inbound: input.inbound, module: input.module });
  if (sanitizeGeminiApiKey(process.env.GEMINI_API_KEY) == null) {
    return { draft: fallback.draft, source: "template", note: "GEMINI_API_KEY yok. Marka şablonu kullanıldı." };
  }
  const invoke = input.invoke ?? defaultInvoke;
  const targetUrl = SOCIAL_MODULE_LINKS[input.module];
  let text = "";
  try {
    const result = await invoke({
      role: "LITE_STREAM",
      system: [
        "yetkin.ai yorum yanıt editörüsün. Kısa Türkçe taslak yaz.",
        "Uydurma fiyat, kesin hibe ve iş vaadi yazma.",
        `Gövde bu linki aynen taşısın: ${targetUrl}`,
        "Taslak kendiliğinden gönderilmez.",
      ].join(" "),
      user: input.inbound,
      temperature: 0.3,
      maxOutputTokens: 500,
      timeoutMs: 20_000,
      maxAttempts: 1,
      rateLimit: {
        identifier: input.userId,
        scope: "admin-social-reply",
        limit: 40,
        windowMs: 24 * 60 * 60_000,
      },
      billing: {
        userId: input.userId,
        source: AI_TOKEN_SOURCES.SUPPORT,
        recordUsage: false,
      },
    });
    text = result?.text ?? "";
  } catch {
    text = "";
  }
  const accepted = text ? acceptModelReply(input.module, text) : null;
  if (!accepted) {
    return {
      draft: fallback.draft,
      source: "template",
      note: "Gemini yanıtı marka kuralına uymadı. Marka şablonu kullanıldı.",
    };
  }
  return { draft: accepted, source: "gemini", note: "Taslak hazır. Kendiliğinden gitmez." };
}

async function defaultInvoke(input: InvokeLlmInput): Promise<{ text: string } | null> {
  const result = await invokeLlm(input);
  return result?.text ? { text: result.text } : null;
}
