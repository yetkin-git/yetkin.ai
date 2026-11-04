import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";
import { curriculumLessonCountForSlug } from "@/lib/academy/curricula/lesson-index";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { LEGAL_SUPPORT_EMAIL } from "@/lib/copy/legal-launch";
import { ASSISTANT_SEN } from "@/lib/copy/sen-voice/assistant";
import {
  answerAssistantChat,
  ASSISTANT_CHAT_LIMIT_ERROR,
  ASSISTANT_CHAT_MESSAGE_LIMIT,
  ASSISTANT_CHAT_MODEL_ID,
  ASSISTANT_CHAT_PATH,
  ASSISTANT_CHAT_ROLE,
  scrubAssistantCitizenJargon,
  scrubAssistantProviderLeak,
  type AssistantChatQuotaPort,
} from "@/lib/kernel/ai/assistant-chat";
import {
  ASSISTANT_GUEST_QUESTION_LIMIT,
  GUEST_QUESTION_COUNT_KEY,
  assistantActorId,
  createMirroredGuestCountStorage,
  ensureGuestQuestionCount,
  formatGuestQuestionCookie,
  guestQuestionsUsed,
  guestQuotaExhausted,
  incrementGuestQuestionCount,
  writeGuestQuestionCount,
  readGuestQuestionCookieValue,
  type GuestCountStorage,
} from "@/lib/kernel/ai/assistant-guest-quota";
import {
  matchAssistantLocalFact,
  resolveAssistantLocalReply,
} from "@/lib/kernel/ai/assistant-facts";
import type { InvokeLlmInput, LlmGatewayResult } from "@/lib/kernel/ai/types";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function memoryQuota(limit: number = ASSISTANT_CHAT_MESSAGE_LIMIT): AssistantChatQuotaPort {
  const counts = new Map<string, number>();
  return {
    consume(userId) {
      const next = (counts.get(userId) ?? 0) + 1;
      counts.set(userId, next);
      return {
        allowed: next <= limit,
        remaining: Math.max(0, limit - next),
        limit,
      };
    },
  };
}

function llmResult(text: string): LlmGatewayResult {
  return {
    text,
    model: "hidden",
    provider: "gemini",
    usage: { promptTokens: 8, completionTokens: 6, totalTokens: 14 },
  };
}

describe("yetkin.ai asistan sohbet kotası", () => {
  it("LITE_STREAM gümrüğünden geçer; sistem talimatı sağlayıcı adı taşımaz", async () => {
    const invoke = vi.fn(async (input: InvokeLlmInput) => {
      expect(input.role).toBe(ASSISTANT_CHAT_ROLE);
      expect(ASSISTANT_CHAT_MODEL_ID).toBe("gemini-3.5-flash-lite");
      expect(input.system).toBe(ASSISTANT_SEN.system);
      expect(input.system).toContain("Sınav barajı 70 puandır.");
      expect(input.system).toContain(LEGAL_SUPPORT_EMAIL);
      expect(input.system).not.toMatch(/gemini|google|openai|anthropic/i);
      expect(input.user).toBe("Freelancer ilanı nasıl açılır?");
      return llmResult("İlanı aç, teklifleri incele; kariyer vizesi sicile basılmaz.");
    });
    const result = await answerAssistantChat(
      { userId: "user-1", message: "Freelancer ilanı nasıl açılır?" },
      { invoke, quota: memoryQuota() },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.source).toBe("llm");
      expect(result.reply).toContain("uzmanlık seviyesi");
      expect(result.reply).not.toMatch(/vize|mühür|dikey kapsam/i);
      expect(result.remaining).toBe(4);
      expect(result.limit).toBe(5);
    }
    expect(invoke).toHaveBeenCalledOnce();
  });

  it("Selam. Mail adresiniz var mı? LLM'siz SSOT e-posta basar", async () => {
    const invoke = vi.fn(async () => llmResult("kaçmamalı"));
    const result = await answerAssistantChat(
      { userId: "user-mail", message: "Selam. Mail adresiniz var mı?" },
      { invoke, quota: memoryQuota() },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.source).toBe("local-fact");
      expect(result.reply).toBe(ASSISTANT_SEN.facts.contact);
      expect(result.reply).toContain(LEGAL_SUPPORT_EMAIL);
      expect(result.reply).toContain("/academy");
      expect(result.reply).toContain("/career");
    }
    expect(invoke).not.toHaveBeenCalled();
  });

  it("Akademi ve Kariyer soruları gümrüğü beklemeden SSOT yönlendirir", async () => {
    const invoke = vi.fn(async () => llmResult("kaçmamalı"));
    const academy = await answerAssistantChat(
      { userId: "user-rooms", message: "Akademi belgesi nasıl alınır?" },
      { invoke, quota: memoryQuota() },
    );
    const career = await answerAssistantChat(
      { userId: "user-rooms-2", message: "Kariyer planımı nasıl kurarım?" },
      { invoke, quota: memoryQuota() },
    );
    expect(academy).toMatchObject({
      ok: true,
      source: "local-fact",
      reply: ASSISTANT_SEN.facts.academy,
    });
    expect(career).toMatchObject({
      ok: true,
      source: "local-fact",
      reply: ASSISTANT_SEN.facts.career,
    });
    expect(invoke).not.toHaveBeenCalled();
  });

  it("beşinci mesajdan sonra LLM çağırmaz ve limit uyarısı basar", async () => {
    const invoke = vi.fn(async () => llmResult("kısa yanıt"));
    const quota = memoryQuota(5);
    for (let i = 0; i < 5; i += 1) {
      const ok = await answerAssistantChat(
        { userId: "user-limit", message: `soru ${i + 1}` },
        { invoke, quota },
      );
      expect(ok.ok).toBe(true);
    }
    const denied = await answerAssistantChat(
      { userId: "user-limit", message: "altıncı soru" },
      { invoke, quota },
    );
    expect(denied.ok).toBe(false);
    if (!denied.ok) {
      expect(denied.error).toBe(ASSISTANT_CHAT_LIMIT_ERROR);
      expect(denied.status).toBe(429);
      expect(denied.remaining).toBe(0);
    }
    expect(invoke).toHaveBeenCalledTimes(5);
  });

  it("boş gövde kotayı yakmaz", async () => {
    const invoke = vi.fn(async () => llmResult("kaçmamalı"));
    const quota = memoryQuota(1);
    const empty = await answerAssistantChat(
      { userId: "user-empty", message: "   " },
      { invoke, quota },
    );
    expect(empty.ok).toBe(false);
    if (!empty.ok) {
      expect(empty.status).toBe(400);
    }
    const ok = await answerAssistantChat(
      { userId: "user-empty", message: "Freelancer emanet nedir?" },
      { invoke, quota },
    );
    expect(ok.ok).toBe(true);
    expect(invoke).toHaveBeenCalledOnce();
  });

  it("gümrük null dönerse sahte bilgi uydurmaz; destek e-postasına yönlendirir", async () => {
    const result = await answerAssistantChat(
      { userId: "user-down", message: "Freelancer emanet nedir?" },
      { invoke: async () => null, quota: memoryQuota() },
    );
    expect(result).toMatchObject({
      ok: true,
      source: "fail-safe",
      reply: ASSISTANT_SEN.failSafe,
    });
    if (result.ok) {
      expect(result.reply).toContain(LEGAL_SUPPORT_EMAIL);
      expect(result.reply).toContain("/academy");
      expect(result.reply).toContain("/career");
      expect(result.reply).not.toMatch(/emanet|escrow|bakiye kilit/i);
    }
  });

  it("yerel fact eşlemesi iletişim / oda sorularını ayırır", () => {
    expect(matchAssistantLocalFact("Selam. Mail adresiniz var mı?")).toBe("contact");
    expect(matchAssistantLocalFact("e-posta adresiniz nedir")).toBe("contact");
    expect(resolveAssistantLocalReply("İletişim için yazacak yer var mı?")).toBe(
      ASSISTANT_SEN.facts.contact,
    );
    expect(matchAssistantLocalFact("Akademi nedir?")).toBe("academy");
    expect(matchAssistantLocalFact("Doğrulanmış rozet nerede durur?")).toBe("career");
    expect(matchAssistantLocalFact("Selam")).toBeNull();
    expect(resolveAssistantLocalReply("Freelancer emanet nedir?")).toBeNull();
  });

  it("sınav barajı sorusu 70 puanı yerelden basar", async () => {
    const invoke = vi.fn(async () => llmResult("kaçmamalı"));
    const asked = [
      "Akademi Sertifikası hak edebilmek için sınavdan kaç puan almak gerekiyor?",
      "Sınavdan kaç puan almak gerekiyor?",
    ];
    for (const [index, message] of asked.entries()) {
      const result = await answerAssistantChat(
        { userId: `user-score-${index}`, message },
        { invoke, quota: memoryQuota() },
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.source).toBe("local-fact");
        expect(result.reply).toBe(ASSISTANT_SEN.facts.examScore);
        expect(result.reply).toContain(`${ACADEMY_EXAM_PASS_SCORE} puan`);
      }
    }
    expect(invoke).not.toHaveBeenCalled();
    expect(ASSISTANT_SEN.system).toContain(ASSISTANT_SEN.facts.examScore);
    expect(ASSISTANT_SEN.system).toContain(ASSISTANT_SEN.facts.spokenLessons);
    expect(ASSISTANT_SEN.system).toContain(ASSISTANT_SEN.facts.careerSeal);
    expect(ASSISTANT_SEN.facts.spokenLessons).toContain(
      `${curriculumLessonCountForSlug("01_office_ai")} sesli ders`,
    );
    expect(matchAssistantLocalFact("Kaç ders sesli?")).toBe("spokenLessons");
    expect(matchAssistantLocalFact("Sertifika kariyer vizesine dönüşür mü?")).toBe("careerSeal");
    expect(resolveAssistantLocalReply("Sertifika kariyer vizesine dönüşür mü?")).toBe(
      ASSISTANT_SEN.facts.careerSeal,
    );
    expect(ASSISTANT_SEN.facts.careerSeal).not.toMatch(/mühür|vize|dikey kapsam/i);
  });

  it("yanıttan sağlayıcı adını siler", () => {
    expect(scrubAssistantProviderLeak("Bu Gemini modelidir, Google üretir.")).toBe(
      `Bu ${YETKIN_BRAND} modelidir, ${YETKIN_BRAND} üretir.`,
    );
  });

  it("yanıttan mühür / vize / dikey kapsam kaçağını siler", () => {
    expect(
      scrubAssistantCitizenJargon(
        "Mühürlenince kariyer vizesi ve dikey kapsam açılır; mühürlü belge vizeli teklif kapısını açar.",
      ),
    ).toBe(
      "Belge alınca uzmanlık seviyesi ve uzmanlık alanı açılır; onaylı belge erişim hakkı olan teklif kapısını açar.",
    );
  });
});

describe("asistan yüzey mührü", () => {
  it("widget ve rota yetkin.ai Asistanı taşır; Gemini vitrine çıkmaz", () => {
    expect(ASSISTANT_CHAT_PATH).toBe("/api/ai/chat");
    expect(ASSISTANT_SEN.title).toBe(`${YETKIN_BRAND} Asistanı`);
    expect(ASSISTANT_SEN.role).toBe("Kariyer Danışmanı");
    expect(ASSISTANT_CHAT_LIMIT_ERROR).toBe("Bugünlük soru limitine ulaştın.");
    expect(ASSISTANT_SEN.welcome).toContain(`${YETKIN_BRAND} kariyer danışmanınım`);
    expect(ASSISTANT_SEN.welcome).toContain("Akademi veya Kariyer");
    expect(ASSISTANT_SEN.system).toContain("/academy");
    expect(ASSISTANT_SEN.system).toContain("/career");
    expect(ASSISTANT_SEN.system).toContain("/iletisim");
    expect(ASSISTANT_SEN.system).toContain(LEGAL_SUPPORT_EMAIL);
    expect(ASSISTANT_SEN.system).toContain("Sertifika");
    expect(ASSISTANT_SEN.system).toContain("Doğrulanmış Rozet");
    expect(ASSISTANT_SEN.system).toContain("Yetkinlik Belgesi");
    expect(ASSISTANT_SEN.system).toContain("Uzmanlık Seviyesi");
    expect(ASSISTANT_SEN.system).toContain("Erişim Hakkı");
    expect(ASSISTANT_SEN.system).toContain(ASSISTANT_SEN.templates.certificate);
    expect(ASSISTANT_SEN.facts.contact).toContain(LEGAL_SUPPORT_EMAIL);
    expect(ASSISTANT_SEN.failSafe).toContain(LEGAL_SUPPORT_EMAIL);
    expect(ASSISTANT_SEN.unavailable).toBe(ASSISTANT_SEN.failSafe);
    const citizenFacing = [
      ASSISTANT_SEN.welcome,
      ASSISTANT_SEN.unavailable,
      ASSISTANT_SEN.failSafe,
      ASSISTANT_SEN.placeholder,
      ...Object.values(ASSISTANT_SEN.templates),
      ...Object.values(ASSISTANT_SEN.facts),
    ].join("\n");
    expect(citizenFacing).not.toMatch(/mühür|vize|dikey kapsam/i);
    const widget = readSrc("components/kernel/ai-chat-widget.tsx");
    const route = readSrc("app/api/(kernel)/ai/chat/route.ts");
    const engine = readSrc("lib/kernel/ai/assistant-chat.ts");
    expect(widget).toContain("ASSISTANT_SEN.title");
    expect(widget).toContain("ASSISTANT_SEN.role");
    expect(widget).toContain("ASSISTANT_SEN.academyCta");
    expect(widget).toContain("ASSISTANT_SEN.careerCta");
    expect(widget).toContain('href="/academy"');
    expect(widget).toContain('href="/career"');
    expect(widget).toContain("bottom-6 right-6");
    expect(widget).toContain("z-50");
    expect(widget).toContain("pointer-events-none fixed z-50");
    expect(widget).toContain("pointer-events-auto relative flex h-14");
    expect(widget).toContain("withRailApiVersion");
    expect(widget).toContain("readCitizenEnvelope");
    expect(widget).toContain("fitAssistantComposer");
    expect(widget).toContain("min-h-10");
    expect(widget).toContain("max-h-[120px]");
    expect(widget).toContain('event.key === "Enter" && !event.shiftKey');
    expect(widget).toContain("data-assistant-composer");
    expect(widget).toContain("ensureBrowserGuestQuestionCount");
    expect(widget).toContain("incrementBrowserGuestQuestionCount");
    expect(widget).toContain("signedIn");
    expect(widget).toContain("envelope.status === 401 && signedIn");
    const guestQuota = readSrc("lib/kernel/ai/assistant-guest-quota.ts");
    expect(guestQuota).toContain('GUEST_QUESTION_COUNT_KEY = "guest_question_count"');
    expect(guestQuota).toContain("localStorage");
    expect(guestQuota).toContain("document.cookie");
    expect(widget.toLowerCase()).not.toContain("gemini");
    expect(widget.toLowerCase()).not.toContain("google");
    expect(route).toContain('export const auth = "public"');
    expect(route).toContain("getSession");
    expect(route).toContain("isStaleRefreshTokenError");
    expect(route).toContain("assistantActorId");
    expect(route).toContain("refresh_token_not_found");
    expect(route).not.toContain("requireSession");
    expect(route).toContain("answerAssistantChat");
    expect(engine).toContain("ASSISTANT_CHAT_ROLE");
    expect(engine).toContain("LITE_STREAM");
    expect(ASSISTANT_CHAT_MODEL_ID).toBe("gemini-3.5-flash-lite");
    expect(engine).toContain("invokeLlm");
    expect(engine).toContain("resolveAssistantLocalReply");
    expect(engine).toContain("scrubAssistantCitizenJargon");
    expect(engine).toContain('"fail-safe"');
    expect(engine).toContain('"local-fact"');
    expect(readSrc("components/shell/app-shell-switch.tsx")).toContain("AiChatWidget");
    expect(readSrc("components/shell/app-shell.tsx")).not.toContain("AiChatWidget");
    expect(readSrc("app/dashboard/page.tsx")).not.toContain("AiChatWidget");
    expect(readSrc("app/(public)/layout.tsx")).not.toContain("AiChatWidget");
    expect(readSrc("app/(auth)/layout.tsx")).not.toContain("AiChatWidget");
    const gemini = readSrc("lib/kernel/ai/providers/gemini.ts");
    expect(gemini).toContain("process.env.GEMINI_API_KEY");
    expect(gemini).toContain("sanitizeGeminiApiKey");
    expect(route).toContain('reason: result.status === 429 ? "quota" : "invalid"');
    expect(route).toContain("assistant.chat.fail_safe");
    expect(route).toContain("result.source");
  });
});

function memoryGuestStore(): GuestCountStorage & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}

describe("anonim asistan sayacı", () => {
  const now = 1_700_000_000_000;

  it("ilk girişte sayaç 0 yazılır; her başarılı yanıt +1; 5 olunca kota biter", () => {
    const local = memoryGuestStore();
    const jar = new Map<string, string>();
    const storage = createMirroredGuestCountStorage(
      local,
      () => jar.get(GUEST_QUESTION_COUNT_KEY) ?? null,
      (value) => jar.set(GUEST_QUESTION_COUNT_KEY, value),
    );
    expect(ensureGuestQuestionCount(storage, now)).toBe(0);
    expect(local.values.get(GUEST_QUESTION_COUNT_KEY)).toBe("0");
    expect(jar.get(GUEST_QUESTION_COUNT_KEY)).toBe("0");
    expect(guestQuotaExhausted(0)).toBe(false);

    let count = 0;
    for (let step = 1; step <= 4; step += 1) {
      count = incrementGuestQuestionCount(storage, now);
      expect(count).toBe(step);
      expect(guestQuotaExhausted(count)).toBe(false);
    }
    count = incrementGuestQuestionCount(storage, now);
    expect(count).toBe(5);
    expect(jar.get(GUEST_QUESTION_COUNT_KEY)).toBe("5");
    expect(guestQuotaExhausted(count)).toBe(true);
    expect(ASSISTANT_GUEST_QUESTION_LIMIT).toBe(ASSISTANT_CHAT_MESSAGE_LIMIT);
  });

  it("sunucu kalan hakkını sayaca yazar ve çerez aynı değeri taşır", () => {
    const local = memoryGuestStore();
    const jar = new Map<string, string>();
    const storage = createMirroredGuestCountStorage(
      local,
      () => jar.get(GUEST_QUESTION_COUNT_KEY) ?? null,
      (value) => jar.set(GUEST_QUESTION_COUNT_KEY, value),
    );
    expect(ensureGuestQuestionCount(storage, now)).toBe(0);
    expect(guestQuestionsUsed(5, 4)).toBe(1);
    expect(writeGuestQuestionCount(storage, guestQuestionsUsed(5, 4), now)).toBe(1);
    expect(local.values.get(GUEST_QUESTION_COUNT_KEY)).toBe("1");
    expect(jar.get(GUEST_QUESTION_COUNT_KEY)).toBe("1");
    expect(guestQuestionsUsed(5, 0)).toBe(5);
    const cookie = formatGuestQuestionCookie("1");
    expect(cookie.startsWith(`${GUEST_QUESTION_COUNT_KEY}=1`)).toBe(true);
    expect(readGuestQuestionCookieValue(`theme=dark; ${cookie}`)).toBe("1");
    expect(readGuestQuestionCookieValue("theme=dark")).toBeNull();
  });

  it("günlük pencere dolunca sayaç yeniden 0 olur", () => {
    const storage = memoryGuestStore();
    expect(incrementGuestQuestionCount(storage, now)).toBe(1);
    expect(ensureGuestQuestionCount(storage, now + 24 * 60 * 60 * 1000)).toBe(0);
    expect(storage.values.get(GUEST_QUESTION_COUNT_KEY)).toBe("0");
  });

  it("ölü oturum anonim kovaya düşer; geçerli üye kendi kimliğinde kalır", () => {
    expect(assistantActorId(null, "203.0.113.7")).toEqual({
      userId: "guest:203.0.113.7",
      guest: true,
    });
    expect(assistantActorId("   ", "203.0.113.7").guest).toBe(true);
    expect(assistantActorId("user-1", "203.0.113.7")).toEqual({
      userId: "user-1",
      guest: false,
    });
  });
});
