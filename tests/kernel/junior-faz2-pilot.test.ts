import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { COURSE_REGISTRY } from "@yetkin/kernel/catalog-ids/course-registry";
import { JUNIOR_PRODUCTION_LOCKED } from "@/lib/kernel/compliance/circuit-breakers";
import { isFrozenRoomApi } from "@/lib/kernel/security/edge-api-auth";
import { RLS_FORCE_TABLES } from "@/lib/kernel/security/rls-policy-registry";
import { juniorFreeLessonKeys, juniorLessonAccess } from "@/lib/junior/catalog";
import {
  JUNIOR_ELECTIVE_QUOTA,
  JUNIOR_FREE_LESSON_KEY,
  JUNIOR_PAID_ACTION_ERROR,
  JUNIOR_YEARLY_LIST_PRICE_MINOR,
} from "@/lib/junior/limits";
import { JUNIOR_PLAN_CODE, JUNIOR_POS_PROVIDER, juniorPlanExpiry } from "@/lib/junior/plan";
import { juniorAgeBand } from "@/lib/junior/persona";
import { createMemoryJuniorStore } from "@/lib/junior/memory-port";
import { publicJuniorPractice } from "@/lib/junior/practice";
import {
  createJuniorProfile,
  readJuniorLesson,
  selectJuniorProfile,
  submitJuniorPractice,
  submitJuniorTell,
} from "@/lib/junior/service";
import type { LlmGatewayResult } from "@/lib/kernel/ai/types";

const NOW = new Date("2026-10-04T12:00:00+03:00");
const PARENT = "parent-a";
const OTHER = "parent-b";

function clip(bytes: number): string {
  return Buffer.alloc(bytes, 7).toString("base64");
}

function told(score = 80): LlmGatewayResult {
  return {
    text: JSON.stringify({
      onTopic: true,
      praised: "Güneşin yıldız olduğunu söyledin.",
      missing: "Ayın uydu olduğunu da ekle.",
      advice: "Üç cümleyi sırayla tekrar et.",
      score,
    }),
    model: "gemini-3.8-live",
    provider: "gemini",
    usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
  };
}

async function seedActivePlan(
  store: ReturnType<typeof createMemoryJuniorStore>,
  userId = PARENT,
) {
  await store.saveActiveSubscription({
    userId,
    status: "ACTIVE",
    planCode: JUNIOR_PLAN_CODE,
    listPriceMinor: JUNIOR_YEARLY_LIST_PRICE_MINOR,
    currencyCode: "TRY",
    provider: JUNIOR_POS_PROVIDER,
    providerRef: "JRSEEDED01",
    cardLast4: "0000",
    invoiceName: "Ayse Yilmaz",
    invoiceTckn: "10000000146",
    invoicePhone: "5551112233",
    invoiceAddress: "Ataturk Mahallesi Deneme Sokak No 1",
    electiveQuota: JUNIOR_ELECTIVE_QUOTA,
    gradeSwitchRights: 1,
    activatedAt: NOW,
    expiresAt: juniorPlanExpiry(NOW),
  });
}

async function openProfile(store: ReturnType<typeof createMemoryJuniorStore>, nickname = "Ege") {
  const created = await createJuniorProfile(
    store,
    PARENT,
    { nickname, grade: 6, birthYear: 2015, consent: true },
    NOW,
  );
  if (!created.ok) {
    throw new Error(created.error);
  }
  return created.data.profile;
}

describe("Junior faz 2 — profil, kapı ve puan", () => {
  it("çocuk e-postası açılmaz; onay ve yaş kapısı durur", async () => {
    const store = createMemoryJuniorStore();
    const email = await createJuniorProfile(
      store,
      PARENT,
      { nickname: "Ege", grade: 6, birthYear: 2015, consent: true, email: "cocuk@okul.com" },
      NOW,
    );
    expect(email.ok).toBe(false);
    if (!email.ok) {
      expect(email.error).toContain("e-posta");
    }
    const consent = await createJuniorProfile(
      store,
      PARENT,
      { nickname: "Ege", grade: 6, birthYear: 2015, consent: false },
      NOW,
    );
    expect(consent.ok).toBe(false);
    const year = await createJuniorProfile(
      store,
      PARENT,
      { nickname: "Ege", grade: 6, birthYear: 1900, consent: true },
      NOW,
    );
    expect(year.ok).toBe(false);

    const first = await openProfile(store, "Ege");
    expect(first.selected).toBe(true);
    await openProfile(store, "Ada");
    await openProfile(store, "Can");
    await openProfile(store, "Naz");
    const fifth = await createJuniorProfile(
      store,
      PARENT,
      { nickname: "Su", grade: 6, birthYear: 2015, consent: true },
      NOW,
    );
    expect(fifth.ok).toBe(false);

    const foreign = await selectJuniorProfile(store, OTHER, first.id);
    expect(foreign.ok).toBe(false);
  });

  it("her dersin ilk konusu ücretsizdir; ikinci konu kapalıdır; yetişkin defteri değişmez", () => {
    expect(JUNIOR_PRODUCTION_LOCKED).toBe(true);
    const freeKeys = juniorFreeLessonKeys();
    expect(freeKeys).toContain("jr_06_mat-1");
    expect(freeKeys).toContain("jr_06_ing_main-1");
    expect(freeKeys.length).toBeGreaterThan(3);
    for (const key of freeKeys) {
      expect(juniorLessonAccess(key)).toBe("free");
      const free = readJuniorLesson(key);
      expect(free.access).toBe("free");
      if (free.access === "free") {
        expect(free.script.length).toBeGreaterThan(40);
        expect(free.mebNote.length).toBeGreaterThan(40);
        expect(free.lifeUse.length).toBeGreaterThan(40);
        expect(free.scene.length).toBeGreaterThan(2);
      }
      expect(JSON.stringify(publicJuniorPractice(key))).not.toContain("correctIndex");
      const lockedKey = key.replace(/-1$/, "-2");
      expect(juniorLessonAccess(lockedKey)).toBe("locked");
      expect(readJuniorLesson(lockedKey).access).toBe("locked");
    }
    const practiced = readJuniorLesson(JUNIOR_FREE_LESSON_KEY);
    expect(practiced.access).toBe("free");
    if (practiced.access === "free") {
      expect(practiced.practice.length).toBe(3);
    }
    const registrySlugs = COURSE_REGISTRY.map((row) => row.slug as string);
    expect(registrySlugs.some((slug) => slug.startsWith("jr_"))).toBe(false);
    expect(COURSE_REGISTRY.filter((row) => row.audience === "adult")).toHaveLength(14);
    expect(isFrozenRoomApi("/api/junior")).toBe(true);
    expect(isFrozenRoomApi("/api/junior/tell")).toBe(true);
    expect(isFrozenRoomApi("/api/junior-pilot/tell")).toBe(false);
    expect(isFrozenRoomApi("/api/junior-pilot/quiz")).toBe(false);
    expect(isFrozenRoomApi("/api/junior-pilot/checkout")).toBe(true);
    expect(RLS_FORCE_TABLES).toEqual(
      expect.arrayContaining([
        "junior_guardian_consents",
        "junior_profiles",
        "junior_question_bank",
        "junior_progress",
        "junior_subscriptions",
        "junior_xp",
      ]),
    );
  });

  it("ses değerlendirmeden sonra taşınmaz; oyun puanı cüzdan değildir", async () => {
    const bare = createMemoryJuniorStore();
    const bareProfile = await openProfile(bare);
    const blockedTell = await submitJuniorTell(
      bare,
      {
        userId: PARENT,
        profileId: bareProfile.id,
        lessonKey: JUNIOR_FREE_LESSON_KEY,
        mode: "write",
        text: "Kesir bir bütünün eşit parçasıdır. Pay üstte, payda altta durur.",
        now: NOW,
      },
      { invoke: async () => told() },
    );
    expect(blockedTell.ok).toBe(false);
    if (!blockedTell.ok) {
      expect(blockedTell.error).toBe(JUNIOR_PAID_ACTION_ERROR);
    }

    const store = createMemoryJuniorStore();
    const profile = await openProfile(store);
    await seedActivePlan(store);
    const audio = clip(8_000);
    const payload = {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: JUNIOR_FREE_LESSON_KEY,
      mode: "speak" as const,
      audioBase64: audio,
      mimeType: "audio/webm;codecs=opus",
      durationSec: 20,
      now: NOW,
    };
    let seen = "";
    let system = "";
    const saved = await submitJuniorTell(store, payload, {
      invoke: async (input) => {
        seen = input.inlineMedia?.[0]?.dataBase64 ?? "";
        system = input.system;
        return told(80);
      },
    });
    expect(system).toContain("Yaş grubu 10-12");
    expect(system).toContain("merak uyandıran, sıcak, oyunlaştırması yüksek ve cesaretlendirici");
    expect(juniorAgeBand(2015, NOW)).toBe("10-12");
    expect(seen.length).toBeGreaterThan(100);
    expect(payload.audioBase64).toBe("");
    expect(saved.ok).toBe(true);
    if (saved.ok) {
      expect(saved.data.xpAwarded).toBe(12);
      expect(saved.data.praised).toContain("yıldız");
      expect(JSON.stringify(saved.data)).not.toContain(audio.slice(0, 24));
    }
    const rows = await store.listProgress(PARENT, profile.id);
    expect(JSON.stringify(rows)).not.toContain(audio.slice(0, 24));
    expect(rows[0]?.mode).toBe("speak");

    const short = {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: JUNIOR_FREE_LESSON_KEY,
      mode: "speak" as const,
      audioBase64: clip(8_000),
      mimeType: "audio/webm",
      durationSec: 10,
      now: NOW,
    };
    let called = false;
    const rejected = await submitJuniorTell(store, short, {
      invoke: async () => {
        called = true;
        return told();
      },
    });
    expect(called).toBe(false);
    expect(rejected.ok).toBe(false);
    expect(short.audioBase64).toBe("");

    const locked = await submitJuniorTell(
      bare,
      {
        userId: PARENT,
        profileId: bareProfile.id,
        lessonKey: "jr_06_mat-2",
        mode: "write",
        text: "Dünya kendi çevresinde döner ve gece gündüz oluşur.",
        now: NOW,
      },
      { invoke: async () => told() },
    );
    expect(locked.ok).toBe(false);

    const offTopic = await submitJuniorTell(
      store,
      {
        userId: PARENT,
        profileId: profile.id,
        lessonKey: JUNIOR_FREE_LESSON_KEY,
        mode: "write",
        text: "Bugün parkta top oynadık ve sonra dondurma yedik birlikte.",
        now: NOW,
      },
      {
        invoke: async () => ({
          ...told(90),
          text: JSON.stringify({
            onTopic: false,
            praised: "Konu dışındaydı.",
            missing: "Ders anlatılmadı.",
            advice: "Güneşe dön.",
            score: 90,
          }),
        }),
      },
    );
    expect(offTopic.ok).toBe(true);
    if (offTopic.ok) {
      expect(offTopic.data.score).toBe(0);
      expect(offTopic.data.xpAwarded).toBe(0);
    }
  });

  it("pekiştirme sunucuda puanlanır; doğru eşleşme rozet verir", async () => {
    const store = createMemoryJuniorStore();
    const profile = await openProfile(store);
    await seedActivePlan(store);
    const graded = await submitJuniorPractice(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: JUNIOR_FREE_LESSON_KEY,
      now: NOW,
      answers: [
        { id: "payda-ne", choiceIndex: 0 },
        { id: "pay-nerede", choiceIndex: 0 },
        {
          id: "esle",
          matches: { "l-yarim": "r-yarim", "l-ceyrek": "r-ceyrek", "l-ucte": "r-ucte" },
        },
      ],
    });
    expect(graded.ok).toBe(true);
    if (graded.ok) {
      expect(graded.data.score).toBe(100);
      expect(graded.data.xpAwarded).toBe(8);
      expect(graded.data.badges).toContain("pekistirme");
      expect(graded.data.badges).not.toContain("ilk-anlatis");
    }
    const stranger = await submitJuniorPractice(store, {
      userId: OTHER,
      profileId: profile.id,
      lessonKey: JUNIOR_FREE_LESSON_KEY,
      now: NOW,
      answers: [],
    });
    expect(stranger.ok).toBe(false);
  });

  it("değerlendirme üslubu doğum yılına göre değişir", async () => {
    expect(juniorAgeBand(2015, NOW)).toBe("10-12");
    expect(juniorAgeBand(2012, NOW)).toBe("13-14");
    expect(juniorAgeBand(2009, NOW)).toBe("15-18");

    const store = createMemoryJuniorStore();
    const lgs = await createJuniorProfile(
      store,
      PARENT,
      { nickname: "Ege", grade: 6, birthYear: 2012, consent: true },
      NOW,
    );
    expect(lgs.ok).toBe(true);
    if (!lgs.ok) {
      return;
    }
    await seedActivePlan(store, PARENT);
    let lgsSystem = "";
    const lgsTell = await submitJuniorTell(
      store,
      {
        userId: PARENT,
        profileId: lgs.data.profile.id,
        lessonKey: "jr_06_fen-1",
        mode: "write",
        text: "Kuvvet bir cismi iter veya çeker. İtmek ve çekmek ayrı yöndür.",
        now: NOW,
      },
      {
        invoke: async (input) => {
          lgsSystem = input.system;
          return told();
        },
      },
    );
    expect(lgsTell.ok).toBe(true);
    expect(lgsSystem).toContain("Yaş grubu 13-14");
    expect(lgsSystem).toContain("hedef odaklı, sınav stresini yöneten, stratejik ve ritmik");
    expect(lgsSystem).not.toContain("Yaş grubu 10-12");

    const lycee = await createJuniorProfile(
      store,
      OTHER,
      { nickname: "Ada", grade: 6, birthYear: 2009, consent: true },
      NOW,
    );
    expect(lycee.ok).toBe(true);
    if (!lycee.ok) {
      return;
    }
    await seedActivePlan(store, OTHER);
    let lyceeSystem = "";
    const lyceeTell = await submitJuniorTell(
      store,
      {
        userId: OTHER,
        profileId: lycee.data.profile.id,
        lessonKey: "jr_06_turkce-1",
        mode: "write",
        text: "Ana fikir yazarın asıl söylemek istediğidir. Örnek ise ayrıntıdır.",
        now: NOW,
      },
      {
        invoke: async (input) => {
          lyceeSystem = input.system;
          return told();
        },
      },
    );
    expect(lyceeTell.ok).toBe(true);
    expect(lyceeSystem).toContain("Yaş grubu 15-18");
    expect(lyceeSystem).toContain("analitik, genç yetişkin saygısında, akran rehberliğinde net ve doğrudan");
    expect(lyceeSystem).not.toContain("Yaş grubu 13-14");
  });

  it("oyun puanı ve ses, cüzdan dosyalarına yazılmaz", () => {
    const root = process.cwd();
    const files = [
      ...walk(join(root, "lib", "junior")),
      ...walk(join(root, "components", "junior")),
      ...walk(join(root, "app", "api", "junior-pilot")),
      ...walk(join(root, "app", "junior")),
      join(root, "prisma", "schema", "junior.prisma"),
    ];
    const banned = /\bWallet\b|\bLedgerEntry\b|amountMinor|audio_base64|localStorage|indexedDB/;
    for (const file of files) {
      expect(readFileSync(file, "utf8"), file).not.toMatch(banned);
    }
    expect(readFileSync(join(root, "components", "junior", "topic-quiz.tsx"), "utf8")).not.toContain(
      "correctIndex",
    );
    const chain = readFileSync(join(root, "components", "junior", "lesson-chain.tsx"), "utf8");
    expect(chain).not.toContain("PracticeBoard");
    expect(chain).not.toContain("Pekiştir");
    expect(chain).not.toContain("Çoktan seçmeli");
    expect(readFileSync(join(root, "components", "junior", "listen-and-tell.tsx"), "utf8")).toContain(
      "Şimdi Sen Anlat",
    );
    expect(readFileSync(join(root, "components", "junior", "listen-and-tell.tsx"), "utf8")).not.toContain(
      "Yazarak anlat",
    );
    expect(readFileSync(join(root, "components", "junior", "listen-and-tell.tsx"), "utf8")).not.toContain(
      "mode: \"write\"",
    );
    const player = readFileSync(join(root, "components", "junior", "vector-player.tsx"), "utf8");
    expect(player).toContain("Video / Görsel Oynatıcı");
    expect(player).toContain("Ders Notu");
    expect(player).not.toContain("MEB Tanımı & Okul Notu");
    expect(player).not.toContain("Hayatta Ne İşime Yarar?");
  });
});

function walk(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...walk(full));
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") || entry.name.endsWith(".prisma")) {
      found.push(full);
    }
  }
  return found;
}
