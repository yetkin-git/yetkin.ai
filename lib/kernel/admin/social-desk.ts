/**
 * Sosyal yayın masası — saf kurallar.
 * Anahtar değeri burada okunmaz ve dönmez. Şablon, ölçülmemiş sonucu yazmaz.
 */

export const SOCIAL_ORIGIN = "https://yetkin.ai";

export const SOCIAL_MODULES = [
  "AI_TEZGAH",
  "COMMERCE",
  "TUBITAK_1507",
  "WEB_TETKIK",
  "CAREER_COACH",
] as const;

export type SocialModule = (typeof SOCIAL_MODULES)[number];

export const SOCIAL_PLATFORMS = ["LINKEDIN", "INSTAGRAM", "FACEBOOK", "X"] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const SOCIAL_POST_STATUSES = ["DRAFT", "PUBLISHED", "FAILED"] as const;

export type SocialPostStatus = (typeof SOCIAL_POST_STATUSES)[number];

export const SOCIAL_MODULE_LINKS: Record<SocialModule, string> = {
  AI_TEZGAH: `${SOCIAL_ORIGIN}/tezgah`,
  COMMERCE: `${SOCIAL_ORIGIN}/e-ticaret`,
  TUBITAK_1507: `${SOCIAL_ORIGIN}/tezgah?tool=grant`,
  WEB_TETKIK: `${SOCIAL_ORIGIN}/tezgah?tool=tetkik`,
  CAREER_COACH: `${SOCIAL_ORIGIN}/career`,
};

export const SOCIAL_MODULE_LABELS: Record<SocialModule, string> = {
  AI_TEZGAH: "AI Tezgâh",
  COMMERCE: "Yetkin Commerce",
  TUBITAK_1507: "TÜBİTAK 1507 Hibe",
  WEB_TETKIK: "Web Tetkik",
  CAREER_COACH: "AI Kariyer Koçu",
};

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  LINKEDIN: "LinkedIn",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  X: "X",
};

export const SOCIAL_BODY_LIMIT: Record<SocialPlatform, number> = {
  LINKEDIN: 3000,
  INSTAGRAM: 2200,
  FACEBOOK: 5000,
  X: 280,
};

const OVERCLAIM =
  /kesin hibe|kesin uygun|onayland[ıi]|%100 uygun|yüzde yüz uygun|garanti eder|iş vaadi|müşteri kazand/i;

export type SocialDraft = {
  module: SocialModule;
  platform: SocialPlatform;
  title: string;
  body: string;
  imagePrompt: string;
  targetUrl: string;
};

export type SocialConnectionCard = {
  id: "linkedin" | "meta" | "x" | "gemini";
  label: string;
  state: "connected" | "missing";
  detail: string;
};

export type SocialKeyReport = {
  linkedinMissing: string[];
  xMissing: string[];
  facebookMissing: string[];
  instagramMissing: string[];
  linkedinClientPresent: boolean;
  xBearerPresent: boolean;
  metaAdsPresent: boolean;
  geminiPresent: boolean;
};

export type SocialQueueItemView = {
  id: string;
  module: SocialModule;
  platform: SocialPlatform;
  title: string;
  body: string;
  imageUrl: string | null;
  imagePrompt: string;
  targetUrl: string;
  status: SocialPostStatus;
  externalPostId: string | null;
  lastError: string;
  createdAt: string;
};

export type SocialBoardView = {
  connections: SocialConnectionCard[];
  items: SocialQueueItemView[];
};

export type SocialEdit = {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  imagePrompt: string;
  targetUrl: string;
};

type Pack = {
  title: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  tweets: readonly [string, string, string];
  imagePrompt: string;
};

const PACKS: Record<SocialModule, Pack> = {
  AI_TEZGAH: {
    title: "AI Tezgâh ile aynı gün çıktı",
    linkedin:
      "KOBİ ekipleri ürün kartı, teklif metni ve site tetkikini aynı tezgahta üretir. Çıktı dakikalar içinde hazırlanır. Misafir günde 3 üretim alır. Kota sayfada yazar; bu metin rakam uydurmaz.\n\nTezgâh bir ajans sözleşmesi değildir. Metin senin ürünün ve senin onayındır.\n\nAI Tezgâh: https://yetkin.ai/tezgah",
    instagram:
      "Esnafın ürün kartı ve teklif metni aynı tezgahta çıkar. Kota sayfada yazar; burada rakam uydurulmaz.\n\nhttps://yetkin.ai/tezgah\n\n#KOBİ #esnaf #yapayzeka",
    facebook:
      "Dükkânın için ürün metnini ve teklifi tek yerde hazırlarsın. Sonucu sen okur, sen paylaşırsın. Kota sayfada durur.\n\nhttps://yetkin.ai/tezgah",
    tweets: [
      "Ürün kartı, teklif ve site tetkiki tek tezgahta. Çıktı dakikalar sürer; sonuç uydurulmaz.",
      "Misafir günde 3 üretim alır. Kota sayfada yazar.",
      "AI Tezgâh: https://yetkin.ai/tezgah",
    ],
    imagePrompt: "Açık mavi masa, sade dizüstü, yetkin.ai tezgâh ekranı. Abartısız, logo uydurma yok.",
  },
  COMMERCE: {
    title: "Yetkin Commerce: tek stok, komisyonsuz vitrin",
    linkedin:
      "Yetkin Commerce, KOBİ vitrinini komisyonsuz açar. Ürün, stok ve pazaryeri bağlantısı (Trendyol, Hepsiburada) aynı masadadır. Satılan ürünün stoğu düşünce kayıt düşer. Fiyatı işletme yazar; bu metin tutar uydurmaz.\n\nYetkin Commerce: https://yetkin.ai/e-ticaret",
    instagram:
      "Komisyonsuz vitrin, tek stok. Trendyol ve Hepsiburada bağını aynı yerden kurarsın. Fiyatı sen yazarsın.\n\nhttps://yetkin.ai/e-ticaret\n\n#KOBİ #esnaf #eticaret",
    facebook:
      "Mağazanı aç, ürününü tek havuzda tut. Pazaryeri stoğu düşünce kayıt da düşer. Tutar alanı sendedir.\n\nhttps://yetkin.ai/e-ticaret",
    tweets: [
      "Komisyonsuz vitrin ve tek stok havuzu. Trendyol ile Hepsiburada aynı masada bağlanır.",
      "Satılan ürünün stoğu düşer. Tutarı sen yazarsın; biz fiyat uydurmayız.",
      "Yetkin Commerce: https://yetkin.ai/e-ticaret",
    ],
    imagePrompt: "Küçük dükkân tezgâhı, sade ürün kutuları, açık mavi vitrin ekranı. Fiyat etiketi yok.",
  },
  TUBITAK_1507: {
    title: "TÜBİTAK 1507 dosyası, uydurma uygunluk yok",
    linkedin:
      "TÜBİTAK 1507 KOBİ Ar-Ge başlangıç dosyası için iskelet tezgahta hazırlanır. Uygunluk cümlesi, çağrı metni olmadan yazılmaz. Hibe kararı kurumundur. Bu paylaşım onay iddiası taşımaz.\n\n1507 masası: https://yetkin.ai/tezgah?tool=grant",
    instagram:
      "1507 dosyasını toplarken uygunluk cümlesi uydurulmaz. Karar kurumundur. İskelet tezgahta durur.\n\nhttps://yetkin.ai/tezgah?tool=grant\n\n#KOBİ #ArGe #TÜBİTAK",
    facebook:
      "Hibe dosyası için proje iskeleti hazırlanır. Kurumun kararı burada yazılmaz. Çağrı satırını sen kontrol edersin.\n\nhttps://yetkin.ai/tezgah?tool=grant",
    tweets: [
      "TÜBİTAK 1507 dosyasında uygunluk cümlesi uydurulmaz. Çağrı metni kaynak ister.",
      "Proje iskeleti tezgahta hazırlanır. Hibe kararı kurumundur.",
      "1507 masası: https://yetkin.ai/tezgah?tool=grant",
    ],
    imagePrompt: "Sade çalışma masası, dosya klasörü ve açık mavi ekran. Mühür veya onay damgası yok.",
  },
  WEB_TETKIK: {
    title: "Web Tetkik: ölçülen satır, uydurma skor yok",
    linkedin:
      "Web Tetkik, sitedeki boş başlık, hız ve güven satırını ölçer. Skor, ölçüm dönmeden yazılmaz. Eksik satır fırsat cümlesine döner. Rapor sayfada kalır.\n\nWeb Tetkik: https://yetkin.ai/tezgah?tool=tetkik",
    instagram:
      "Sitenin boş kalan satırını ölçer, skor uydurmaz. Eksik neyse rapor odur.\n\nhttps://yetkin.ai/tezgah?tool=tetkik\n\n#KOBİ #esnaf #web",
    facebook:
      "Dükkân sitesinde boş başlık ve yavaş sayfa varsa tetkik onu yazar. Uydurma puan yoktur.\n\nhttps://yetkin.ai/tezgah?tool=tetkik",
    tweets: [
      "Sitenin boş başlık, hız ve güven satırı ölçülür. Skor uydurulmaz.",
      "Eksik satır fırsat cümlesine döner. Rapor sayfada kalır.",
      "Web Tetkik: https://yetkin.ai/tezgah?tool=tetkik",
    ],
    imagePrompt: "Sade tarayıcı penceresi, kontrol listesi, açık mavi arka plan. Puan rozeti yok.",
  },
  CAREER_COACH: {
    title: "AI Kariyer Koçu: doğrulanmış rozet, iş sözü yok",
    linkedin:
      "AI Kariyer Koçu hedef rol, deneyim ve mühürlü rozete bakar. Rozet sayısı doğrulanmadan yazılmaz. İş sözü verilmez. Plan, sayfadaki satırla sınırlıdır.\n\nAI Kariyer Koçu: https://yetkin.ai/career",
    instagram:
      "Hedef rolünü ve mühürlü rozetini yaz. Koç, olmayan rozeti eklemez. İş sözü yoktur.\n\nhttps://yetkin.ai/career\n\n#kariyer #KOBİ #yetkin",
    facebook:
      "Kariyer planı, doğrulanmış rozetin kadar konuşur. Olmayan başarı eklenmez.\n\nhttps://yetkin.ai/career",
    tweets: [
      "Kariyer koçu hedef rol, deneyim ve mühürlü rozete bakar. İş sözü verilmez.",
      "Rozet sayısı uydurulmaz. Planda yalnız doğrulanmış satır durur.",
      "AI Kariyer Koçu: https://yetkin.ai/career",
    ],
    imagePrompt: "Sade masa, açık defter ve kariyer ekranı. Sahte diploma veya rozet yok.",
  },
};

export function isSocialModule(value: unknown): value is SocialModule {
  return typeof value === "string" && (SOCIAL_MODULES as readonly string[]).includes(value);
}

export function isSocialPlatform(value: unknown): value is SocialPlatform {
  return typeof value === "string" && (SOCIAL_PLATFORMS as readonly string[]).includes(value);
}

export function isYetkinHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "yetkin.ai" && value.length <= 300;
  } catch {
    return false;
  }
}

export function isPublicHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && value.length <= 500;
  } catch {
    return false;
  }
}

export function socialCopyIsHonest(text: string): boolean {
  return !OVERCLAIM.test(text);
}

export function splitXFlood(body: string): string[] {
  const parts = body
    .split(/\n\s*---\s*\n/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return parts.length > 0 ? parts : [body.trim()].filter((part) => part.length > 0);
}

export function joinXFlood(tweets: readonly string[]): string {
  return tweets.map((tweet) => tweet.trim()).join("\n---\n");
}

export function composeBrandPackage(module: SocialModule): SocialDraft[] {
  const pack = PACKS[module];
  const targetUrl = SOCIAL_MODULE_LINKS[module];
  const drafts: SocialDraft[] = [
    {
      module,
      platform: "LINKEDIN",
      title: pack.title,
      body: pack.linkedin,
      imagePrompt: pack.imagePrompt,
      targetUrl,
    },
    {
      module,
      platform: "INSTAGRAM",
      title: pack.title,
      body: pack.instagram,
      imagePrompt: pack.imagePrompt,
      targetUrl,
    },
    {
      module,
      platform: "FACEBOOK",
      title: pack.title,
      body: pack.facebook,
      imagePrompt: pack.imagePrompt,
      targetUrl,
    },
    {
      module,
      platform: "X",
      title: pack.title,
      body: joinXFlood(pack.tweets),
      imagePrompt: pack.imagePrompt,
      targetUrl,
    },
  ];
  for (const draft of drafts) {
    assertDraftShape(draft);
  }
  return drafts;
}

export function publishTextIssue(platform: SocialPlatform, body: string): string | null {
  const trimmed = body.trim();
  if (!trimmed) {
    return "Metin boş.";
  }
  if (!socialCopyIsHonest(trimmed)) {
    return "Metin ölçülmemiş sonuç vaadi taşıyor.";
  }
  if (platform === "X") {
    const parts = splitXFlood(trimmed);
    if (parts.length > 6) {
      return "X flood en fazla 6 tweet.";
    }
    for (const part of parts) {
      if ([...part].length > SOCIAL_BODY_LIMIT.X) {
        return "X metni 280 karakteri aşıyor.";
      }
    }
    return null;
  }
  if ([...trimmed].length > SOCIAL_BODY_LIMIT[platform]) {
    return `${SOCIAL_PLATFORM_LABELS[platform]} metni sınırı aşıyor.`;
  }
  return null;
}

export function acceptModelSocialPack(module: SocialModule, raw: string): SocialDraft[] | null {
  let parsed: unknown;
  try {
    const trimmed = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/u, "").trim();
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }
  const posts = (parsed as { posts?: unknown }).posts;
  if (!Array.isArray(posts)) {
    return null;
  }
  const targetUrl = SOCIAL_MODULE_LINKS[module];
  const byPlatform = new Map<SocialPlatform, SocialDraft>();
  for (const row of posts) {
    if (!row || typeof row !== "object") {
      return null;
    }
    const record = row as Record<string, unknown>;
    if (!isSocialPlatform(record.platform)) {
      return null;
    }
    const title = typeof record.title === "string" ? record.title.trim() : "";
    const body = typeof record.body === "string" ? record.body.trim() : "";
    const imagePrompt = typeof record.imagePrompt === "string" ? record.imagePrompt.trim() : "";
    if (title.length < 2 || title.length > 180 || body.length < 2) {
      return null;
    }
    if (!body.includes(targetUrl) || !socialCopyIsHonest(`${title}\n${body}`)) {
      return null;
    }
    if (publishTextIssue(record.platform, body)) {
      return null;
    }
    byPlatform.set(record.platform, {
      module,
      platform: record.platform,
      title,
      body,
      imagePrompt: imagePrompt.slice(0, 500),
      targetUrl,
    });
  }
  if (byPlatform.size !== SOCIAL_PLATFORMS.length) {
    return null;
  }
  return SOCIAL_PLATFORMS.map((platform) => byPlatform.get(platform)!);
}

export function detectReplyModule(inbound: string): SocialModule | null {
  const text = inbound.toLocaleLowerCase("tr-TR");
  if (/tübitak|tubitak|1507|hibe/.test(text)) {
    return "TUBITAK_1507";
  }
  if (/tetkik|seo|web site|websitem|sitem/.test(text)) {
    return "WEB_TETKIK";
  }
  if (/mağaza|magaza|trendyol|hepsiburada|stok|commerce|vitrin/.test(text)) {
    return "COMMERCE";
  }
  if (/kariyer|özgeçmiş|ozgecmis|rozet|koç|koc/.test(text)) {
    return "CAREER_COACH";
  }
  if (/tezgah|tezgâh|ürün kart|urun kart|teklif/.test(text)) {
    return "AI_TEZGAH";
  }
  return null;
}

export function resolveReplyModule(inbound: string, selected: SocialModule | null): SocialModule {
  return detectReplyModule(inbound) ?? selected ?? "AI_TEZGAH";
}

export function composeSocialReply(input: {
  inbound: string;
  module: SocialModule;
}): { draft: string; module: SocialModule; targetUrl: string } {
  const inbound = input.inbound.trim();
  const targetUrl = SOCIAL_MODULE_LINKS[input.module];
  const label = SOCIAL_MODULE_LABELS[input.module];
  const asksPrice = /fiyat|ücret|ucret|ne kadar|tutar/i.test(inbound);
  const asksGuarantee = /kesin|garanti|onaylanır|çıkar mı|cikar mi/i.test(inbound);
  const priceLine = asksPrice ? "Güncel tutar bu taslakta yoktur; sayfada durur." : "";
  const guaranteeLine = asksGuarantee ? "Ölçülmemiş sonuç veya kurum kararı burada yazılmaz." : "";
  const draft = [
    `Yorumun için ${label} sayfasını bırakıyorum.`,
    priceLine,
    guaranteeLine,
    `İlgili sayfa: ${targetUrl}`,
  ]
    .filter((line) => line.length > 0)
    .join("\n");
  if (!socialCopyIsHonest(draft) || !draft.includes(targetUrl)) {
    throw new Error("Yanıt şablonu marka kuralını bozuyor.");
  }
  return { draft, module: input.module, targetUrl };
}

export function acceptModelReply(module: SocialModule, raw: string): string | null {
  const draft = raw.trim();
  const targetUrl = SOCIAL_MODULE_LINKS[module];
  if (draft.length < 20 || draft.length > 1200) {
    return null;
  }
  if (!draft.includes(targetUrl) || !socialCopyIsHonest(draft)) {
    return null;
  }
  return draft;
}

export function socialConnectionCards(report: SocialKeyReport): SocialConnectionCard[] {
  const linkedinExtra =
    report.linkedinClientPresent && report.linkedinMissing.includes("LINKEDIN_ACCESS_TOKEN")
      ? "LINKEDIN_CLIENT_ID yayın jetonu değildir."
      : "";
  const xExtra =
    report.xBearerPresent && report.xMissing.length > 0
      ? "X_BEARER_TOKEN okuma içindir; yayın OAuth 1.0a ister."
      : "";
  const metaMissing = unique([...report.facebookMissing, ...report.instagramMissing]);
  const metaExtra =
    report.metaAdsPresent && metaMissing.length > 0
      ? "META_ADS_ACCESS_TOKEN organik sayfa anahtarı değildir. Yayın denemesinde Graph sayfa listesi sorulur."
      : "";
  return [
    card("linkedin", "LinkedIn", report.linkedinMissing, linkedinExtra),
    card("meta", "Meta", metaMissing, metaExtra),
    card("x", "X", report.xMissing, xExtra),
    card("gemini", "Gemini", report.geminiPresent ? [] : ["GEMINI_API_KEY"], ""),
  ];
}

export function validateSocialEdit(input: unknown): { ok: true; value: SocialEdit } | { ok: false; reason: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, reason: "Taslak gövdesi yok." };
  }
  const row = input as Record<string, unknown>;
  const id = typeof row.id === "string" ? row.id.trim() : "";
  if (id.length < 8 || id.length > 40) {
    return { ok: false, reason: "Taslak kimliği yok." };
  }
  const title = typeof row.title === "string" ? row.title.trim() : "";
  if (title.length < 2 || title.length > 180) {
    return { ok: false, reason: "Başlık 2–180 karakter olmalı." };
  }
  const body = typeof row.body === "string" ? row.body.trim() : "";
  if (body.length < 2 || body.length > 5000) {
    return { ok: false, reason: "Metin 2–5000 karakter olmalı." };
  }
  if (!socialCopyIsHonest(`${title}\n${body}`)) {
    return { ok: false, reason: "Metin ölçülmemiş sonuç vaadi taşıyor." };
  }
  const targetUrl = typeof row.targetUrl === "string" ? row.targetUrl.trim() : "";
  if (!isYetkinHttpsUrl(targetUrl)) {
    return { ok: false, reason: "Hedef link https://yetkin.ai olmalı." };
  }
  const imagePrompt = typeof row.imagePrompt === "string" ? row.imagePrompt.trim().slice(0, 500) : "";
  const imageRaw = typeof row.imageUrl === "string" ? row.imageUrl.trim() : "";
  if (imageRaw && !isPublicHttpsUrl(imageRaw)) {
    return { ok: false, reason: "Görsel linki https olmalı." };
  }
  return {
    ok: true,
    value: {
      id,
      title,
      body,
      imageUrl: imageRaw || null,
      imagePrompt,
      targetUrl,
    },
  };
}

function card(
  id: SocialConnectionCard["id"],
  label: string,
  missing: string[],
  extra: string,
): SocialConnectionCard {
  const state = missing.length === 0 ? "connected" : "missing";
  const base = state === "connected" ? "Yayın anahtarları duruyor." : `Eksik: ${missing.join(", ")}.`;
  return {
    id,
    label,
    state,
    detail: extra ? `${base} ${extra}` : base,
  };
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function assertDraftShape(draft: SocialDraft): void {
  if (!draft.body.includes(draft.targetUrl)) {
    throw new Error(`${draft.module} ${draft.platform} linki yok.`);
  }
  if (!socialCopyIsHonest(`${draft.title}\n${draft.body}`)) {
    throw new Error(`${draft.module} ${draft.platform} vaat sınırı.`);
  }
  const issue = publishTextIssue(draft.platform, draft.body);
  if (issue) {
    throw new Error(`${draft.module} ${draft.platform}: ${issue}`);
  }
}
