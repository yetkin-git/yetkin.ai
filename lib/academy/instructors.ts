/**
 * Tek ses = tek Türkçe isim. TTS kodu mühürdür; ikinci isim yasak.
 * Eğitmen, moderatör ve anons aynı Cast Registry tekillik denetiminden geçer.
 * Client-safe: sınav şıkları ve GEMINI_API_KEY yoktur.
 * Faz 3: pusula / Koray montajı `archived/lib/academy-studio/` (field-voice, studio-cast).
 * Bu dosya vitrin biyografisi ve ses mührüdür; fabrika import etmez.
 */

import { YETKIN_BRAND } from "@/lib/copy/brand";
import {
  academyCourseTitleBySlug,
  type AcademyCourseTitleSlug,
} from "@/lib/academy/course-titles";
import { academyCourseLevelBySlug } from "@/lib/academy/course-level";
import {
  isAcademyInstructorSpeaker,
  type DialogueSpeakerId,
} from "@/lib/academy/curricula/types";

export const ACADEMY_INSTRUCTOR_TTS_VOICES = [
  "Zephyr",
  "Kore",
  "Puck",
  "Fenrir",
  "Aoede",
  "Leda",
  "Callirrhoe",
] as const;

export const ACADEMY_TTS_VOICES = [
  ...ACADEMY_INSTRUCTOR_TTS_VOICES,
  "Charon",
  "Enceladus",
  "Iapetus",
  "Orus",
] as const;

export type AcademyTtsVoice = (typeof ACADEMY_TTS_VOICES)[number];
export type AcademyInstructorTtsVoice = (typeof ACADEMY_INSTRUCTOR_TTS_VOICES)[number];

export type AcademyVoiceFingerprint = {
  provider: "google-gemini";
  model: "gemini-3.1-flash-tts-preview";
  providerVoiceId: AcademyTtsVoice;
  modelRevision: "preview";
};

export type AcademyCastBinding = {
  characterId: string;
  canonicalCharacterName: string;
  role: "instructor" | "moderator" | "announcer";
  voice: AcademyTtsVoice;
  voiceFingerprint: AcademyVoiceFingerprint;
  /** 1 = %100. Maya (eğitmen) %95 micro-pacing; Koray Temel’de %100. */
  speechRate: number;
};

function academyVoiceFingerprint(voice: AcademyTtsVoice): AcademyVoiceFingerprint {
  return {
    provider: "google-gemini",
    model: "gemini-3.1-flash-tts-preview",
    providerVoiceId: voice,
    modelRevision: "preview",
  };
}

export type AcademyInstructorGender = "erkek" | "kadin";

export type AcademyInstructorTone = "sakin" | "enerjik" | "pratik" | "otoriter" | "kurumsal";

export type AcademyInstructor = {
  voice: AcademyInstructorTtsVoice;
  voiceFingerprint: AcademyVoiceFingerprint;
  name: string;
  title: string;
  gender: AcademyInstructorGender;
  toneLabel: string;
  tone: AcademyInstructorTone;
  /** Ders ilk paragrafı bu önekle açılır. */
  greetingLead: string;
};

export type AcademyModeratorBinding = {
  characterId: string;
  voice: AcademyTtsVoice;
  voiceFingerprint: AcademyVoiceFingerprint;
  name: string;
  title: string;
  role: string;
  gender: "erkek";
  speechRate: number;
};

/** Stüdyo sunucusu — eğitmenlerden ayrı fiziksel ses mührü. */
export const ACADEMY_MODERATOR: AcademyModeratorBinding = {
  characterId: "character.moderator.koray",
  voice: "Charon" as const satisfies AcademyTtsVoice,
  voiceFingerprint: academyVoiceFingerprint("Charon"),
  name: "Koray",
  title: "Moderatör Koray",
  role: "Stüdyo Sunucusu / Moderatör",
  gender: "erkek",
  /** Temel seviye saha temposu — PEDAGOJI.md; Orta/İleri slug’dan okunur. */
  speechRate: 1,
};

/** Siber Güvenlik dikeyi — Can; Koray bu kulvarda konuşmaz. Tempo slug’dan: Temel %100, Orta %98, İleri %96. */
export const ACADEMY_SECURITY_MODERATOR: AcademyModeratorBinding = {
  characterId: "character.moderator.can",
  voice: "Enceladus" as const satisfies AcademyTtsVoice,
  voiceFingerprint: academyVoiceFingerprint("Enceladus"),
  name: "Can",
  title: "Moderatör Can",
  role: "Stüdyo Sunucusu / Moderatör",
  gender: "erkek",
  speechRate: 1,
};

/** Dijital Beceriler / İş Dünyası — Tarık; Koray ve Can bu kulvarda konuşmaz. Masterclass %100. */
export const ACADEMY_DIGITAL_SKILLS_MODERATOR: AcademyModeratorBinding = {
  characterId: "character.moderator.tarik",
  voice: "Iapetus" as const satisfies AcademyTtsVoice,
  voiceFingerprint: academyVoiceFingerprint("Iapetus"),
  name: "Tarık",
  title: "Moderatör Tarık",
  role: "Stüdyo Sunucusu / Moderatör",
  gender: "erkek",
  speechRate: 1,
};

export function academyModeratorForSlug(slug: string): AcademyModeratorBinding {
  if (slug.startsWith("security-")) {
    return ACADEMY_SECURITY_MODERATOR;
  }
  if (isAcademyDigitalSkillsSlug(slug)) {
    return ACADEMY_DIGITAL_SKILLS_MODERATOR;
  }
  return ACADEMY_MODERATOR;
}

/** Dijital Beceriler / İş Dünyası — Tarık + Gözde; Excel, Ads, E-Ticaret, Canva, LinkedIn. */
export function isAcademyDigitalSkillsSlug(slug: string): boolean {
  return (
    slug.startsWith("excel-") ||
    slug.startsWith("google-ads-") ||
    slug.startsWith("meta-ads-") ||
    slug.startsWith("eticaret-") ||
    slug.startsWith("canva-") ||
    slug.startsWith("linkedin-")
  );
}

/** Eğitmen usta temposu — Maya ve diğer eğitmenler %95 micro-pacing. */
export const ACADEMY_INSTRUCTOR_SPEECH_RATE = 0.95 as const;

/** PEDAGOJI.md Koray: Temel %100, Orta %98, İleri %96. */
export const ACADEMY_MODERATOR_SPEECH_RATE_ORTA = 0.98 as const;
export const ACADEMY_MODERATOR_SPEECH_RATE_ILERI = 0.96 as const;

export function academyModeratorSpeechRateForSlug(slug: string): number {
  const level = academyCourseLevelBySlug(slug);
  if (level === "Orta") {
    return ACADEMY_MODERATOR_SPEECH_RATE_ORTA;
  }
  if (level === "İleri") {
    return ACADEMY_MODERATOR_SPEECH_RATE_ILERI;
  }
  return ACADEMY_MODERATOR.speechRate;
}

export type AcademyDialogueCast = {
  voice: AcademyTtsVoice;
  speechRate: number;
  canonicalCharacterName: string;
  role: "instructor" | "moderator";
};

/** CastRegistry — speaker + kurs slug → ses ve PEDAGOJI tempo mührü. */
export function academyCastForDialogueSpeaker(
  slug: string,
  speaker: DialogueSpeakerId,
): AcademyDialogueCast {
  if (isAcademyInstructorSpeaker(speaker)) {
    const instructor = academyInstructorBySlug(slug);
    return {
      voice: instructor.voice,
      speechRate: ACADEMY_INSTRUCTOR_SPEECH_RATE,
      canonicalCharacterName: instructor.name,
      role: "instructor",
    };
  }
  const moderator = academyModeratorForSlug(slug);
  return {
    voice: moderator.voice,
    speechRate: academyModeratorSpeechRateForSlug(slug),
    canonicalCharacterName: moderator.name,
    role: "moderator",
  };
}

export const ACADEMY_MODERATOR_OPEN_LEAD =
  `Merhaba, ${YETKIN_BRAND} Akademi stüdyosundan selam. Bu yayın senin için.`;

export const ACADEMY_MODERATOR_OPEN_TAIL = "Mikrofonu kendisine bırakıyorum...";

export const ACADEMY_INSTRUCTOR_HANDBACK_LEAD =
  "Teşekkürler Koray, herkese merhaba. Sağ ol, hoş bulduk. Masayı kurduk, doğrudan sahaya iniyoruz...";

/** Ders arası teyit yanıtı — Koray özetinin ardından. */
export const ACADEMY_INSTRUCTOR_RECAP_REPLY =
  "Evet Koray Bey, doğru anlıyorsunuz. Evet, yani... az önce dokunduğunuz nokta tam da sahada en çok takıldığımız yer; kaldığımız yerden orayı açalım...";

export const ACADEMY_MODERATOR_CLOSE_TAIL =
  "Bir sonraki mühürlü sertifikasyon programında görüşmek üzere, hoşça kalın!";

/** Gelişme yanıtı — saha dili; honorifik'ten sonraki Koray sorusu kursa özel. Yapay «Harika!» yok. */
export const ACADEMY_INSTRUCTOR_ASK_REPLY =
  "Çok doğru bir noktaya değindin. Koray Bey, masada en çok zaman tam orada (hata anında kapalı) kaybediliyor — acele edip yanlış kapıyı boyamak gibi; asıl kilit konuşulmadan ilerleyen her adım sonra geri sökülüyor...";

/** Vaka yanıtı. */
export const ACADEMY_INSTRUCTOR_VAKA_REPLY =
  "Doğru dedin. Koray Bey, bu iş masada şöyle bozuluyor: herkes «bir şekilde yürür» deyince orta değer uyduruluyor; biz o anı yazılı tarif netleşmeden kesiyoruz...";

/** Parametre yanıtı. */
export const ACADEMY_INSTRUCTOR_PARAMS_REPLY =
  "Tam olarak bu işte. Koray Bey, masada tek tek üzerinden geçiyorum — çünkü parametre kutusu açılınca herkes acele eder; önce hangi kaydın dürüst durduğunu netleştirmek gerekir...";
const ACADEMY_INSTRUCTOR_STUDIO_LEADS = [
  ACADEMY_INSTRUCTOR_HANDBACK_LEAD,
  ACADEMY_INSTRUCTOR_RECAP_REPLY,
  ACADEMY_INSTRUCTOR_ASK_REPLY,
  ACADEMY_INSTRUCTOR_VAKA_REPLY,
  ACADEMY_INSTRUCTOR_PARAMS_REPLY,
] as const;

export const ACADEMY_INSTRUCTORS_BY_VOICE: Record<AcademyInstructorTtsVoice, AcademyInstructor> = {
  Zephyr: {
    voice: "Zephyr",
    voiceFingerprint: academyVoiceFingerprint("Zephyr"),
    name: "Deniz",
    title: "Eğitmen Deniz",
    gender: "erkek",
    tone: "sakin",
    toneLabel: "Erkek / Sakin",
    greetingLead: "Selamlar, ben Deniz",
  },
  Kore: {
    voice: "Kore",
    voiceFingerprint: academyVoiceFingerprint("Kore"),
    name: "Maya",
    title: "Eğitmen Maya",
    gender: "kadin",
    tone: "enerjik",
    toneLabel: "Kadın / Enerjik",
    greetingLead: "Merhaba, ben Maya",
  },
  Puck: {
    voice: "Puck",
    voiceFingerprint: academyVoiceFingerprint("Puck"),
    name: "Aras",
    title: "Eğitmen Aras",
    gender: "erkek",
    tone: "pratik",
    toneLabel: "Erkek / Pratik",
    greetingLead: "Selam, ben Aras",
  },
  Fenrir: {
    voice: "Fenrir",
    voiceFingerprint: academyVoiceFingerprint("Fenrir"),
    name: "Boran",
    title: "Eğitmen Boran",
    gender: "erkek",
    tone: "otoriter",
    toneLabel: "Erkek / Otoriter",
    greetingLead: "Merhaba, ben Boran",
  },
  Aoede: {
    voice: "Aoede",
    voiceFingerprint: academyVoiceFingerprint("Aoede"),
    name: "Selin",
    title: "Eğitmen Selin",
    gender: "kadin",
    tone: "kurumsal",
    toneLabel: "Kadın / Kurumsal",
    greetingLead: "Merhaba, ben Selin",
  },
  Leda: {
    voice: "Leda",
    voiceFingerprint: academyVoiceFingerprint("Leda"),
    name: "Ece",
    title: "Eğitmen Ece",
    gender: "kadin",
    tone: "pratik",
    toneLabel: "Kadın / Pratik",
    greetingLead: "Merhaba, ben Ece",
  },
  Callirrhoe: {
    voice: "Callirrhoe",
    voiceFingerprint: academyVoiceFingerprint("Callirrhoe"),
    name: "Gözde",
    title: "Eğitmen Gözde",
    gender: "kadin",
    tone: "pratik",
    toneLabel: "Kadın / Pratik",
    greetingLead: "Merhaba, ben Gözde",
  },
};

/** SKU → ses. İsim sesten okunur; sluga ikinci isim yazılmaz. */
export const ACADEMY_INSTRUCTOR_VOICE_BY_SLUG: Record<
  AcademyCourseTitleSlug,
  AcademyInstructorTtsVoice
> = {
  "ai-agent-temel": "Kore",
  "ai-agent-orta": "Kore",
  "ai-agent-ileri": "Kore",
  "python-temel": "Kore",
  "python-orta": "Kore",
  "python-ileri": "Kore",
  "fullstack-temel": "Kore",
  "fullstack-orta": "Kore",
  "fullstack-ileri": "Kore",
  "ai-temel": "Fenrir",
  "ux-temel": "Aoede",
  "security-temel": "Leda",
  "security-orta": "Leda",
  "security-ileri": "Leda",
  "excel-masterclass": "Callirrhoe",
  "google-ads-masterclass": "Callirrhoe",
  "meta-ads-masterclass": "Callirrhoe",
  "eticaret-masterclass": "Callirrhoe",
  "canva-masterclass": "Callirrhoe",
  "linkedin-masterclass": "Callirrhoe",
};

export type AcademyCourseOpen = {
  field: string;
  topic: string;
};

export const ACADEMY_COURSE_OPEN: Record<AcademyCourseTitleSlug, AcademyCourseOpen> = {
  "ai-agent-temel": {
    field: "AI Agent mimarlığı",
    topic: "ajan, yapılandırılmış çıktı, araç çağrısı, hafıza ve ReAct döngüsünü",
  },
  "ai-agent-orta": {
    field: "çoklu ajan ve RAG mimarisi",
    topic: "gömme, vektör sorgu, ajan paslaşması, durum ve insan onay kapısını",
  },
  "ai-agent-ileri": {
    field: "ileri ajan mimarisi ve otonom sistem güvenliği",
    topic: "durum grafiği, yansıma onarımı, korkuluk, eval ve üretim kuyruğunu",
  },
  "python-temel": {
    field: "Python yazılım temelleri",
    topic: "değişken, tip, kontrol akışı, fonksiyon, koleksiyon ve Fail-Closed laboratuvarını",
  },
  "python-orta": {
    field: "Python nesne yönelimi ve veri işleme",
    topic: "sınıf, miras, JSON mühürü, isimli hata ve HTTP damgasını",
  },
  "python-ileri": {
    field: "Python ileri mimari ve performans",
    topic: "decorator, üreteç, asyncio, süreç seçimi ve metaclass kapısını",
  },
  "fullstack-temel": {
    field: "modern web temelleri",
    topic: "HTTP, semantik HTML, CSS ızgarası, JavaScript DOM, fetch ve TypeScript sözleşmesini",
  },
  "fullstack-orta": {
    field: "modern tam yığın uygulama",
    topic: "React bileşen ve durum, Express REST, Prisma defteri ve JWT kimlik kapısını",
  },
  "fullstack-ileri": {
    field: "ileri tam yığın mimari",
    topic: "App Router ve RSC, mikroservis, Redis, Docker Compose ve CI/CD kapısını",
  },
  "ai-temel": {
    field: "Yapay zekâ ve veri analizi",
    topic: "üretim tarifi, yapılandırılmış çıktı ve kaynaklı veri disiplinini",
  },
  "ux-temel": {
    field: "dijital ürün tasarımı",
    topic: "Kullanıcı Deneyimi araştırması, Figma ve el teslimi paketini",
  },
  "security-temel": {
    field: "siber güvenlik temelleri",
    topic: "CIA üçlüsü, ağ kapısı, Açık Web Uygulaması Güvenlik Projesi (OWASP) ve Fail-Closed kimlik duvarını",
  },
  "security-orta": {
    field: "uygulamalı sızma testi ve web zafiyet mimarisi",
    topic: "keşif kapsamı, lab ağ envanteri, IDOR/SSRF, OAuth2/JWT ve SAST kapatma kapısını",
  },
  "security-ileri": {
    field: "ileri DevSecOps, bulut güvenliği ve olay müdahalesi",
    topic: "boru hattı damgası, IAM/KMS fişi, günlük zinciri, SIEM avı ve Sıfır Güven üçlüsünü",
  },
  "excel-masterclass": {
    field: "Excel ve yapay zekâ destekli veri analizi",
    topic: "hücre mimarisi, arama formülü, özet tablo, temizlik ve dashboard kapısını",
  },
  "google-ads-masterclass": {
    field: "Google Ads ve arama motoru pazarlaması",
    topic: "hesap mimarisi, eşleme, ağ, GTM dönüşüm takibi ve kalite puanı kapısını",
  },
  "meta-ads-masterclass": {
    field: "Meta Business Suite ve reklam hunisi",
    topic: "piksel, CAPI, kitle, kreatif, CBO/ABO ve ROAS kapısını",
  },
  "eticaret-masterclass": {
    field: "e-ticaret ve pazar yeri operasyonu",
    topic: "tezgâh mantığı, mağaza belgesi, liste SEO, stok senkronu ve kargo/iade kapısını",
  },
  "canva-masterclass": {
    field: "Canva ve yapay zekâ destekli dijital tasarım",
    topic: "marka kiti, sosyal kare, broşür, Magic Studio ve teslim formatı kapısını",
  },
  "linkedin-masterclass": {
    field: "LinkedIn profesyonel marka ve B2B müşteri bulma",
    topic: "All-Star profil, algoritma içeriği, Sales Navigator ICP ve outreach kapısını",
  },
};

export const ACADEMY_ANNOUNCER = {
  characterId: "character.announcer.yetkin-academy",
  voice: "Orus" as const satisfies AcademyTtsVoice,
  voiceFingerprint: academyVoiceFingerprint("Orus"),
  name: "Yetkin Akademi",
  role: "Eğitim Anonsu",
} as const;

export const ACADEMY_CAST_REGISTRY: readonly AcademyCastBinding[] = [
  ...Object.values(ACADEMY_INSTRUCTORS_BY_VOICE).map((instructor) => ({
    characterId: `character.instructor.${instructor.name.toLocaleLowerCase("tr-TR")}`,
    canonicalCharacterName: instructor.name,
    role: "instructor" as const,
    voice: instructor.voice,
    voiceFingerprint: instructor.voiceFingerprint,
    speechRate: ACADEMY_INSTRUCTOR_SPEECH_RATE,
  })),
  {
    characterId: ACADEMY_MODERATOR.characterId,
    canonicalCharacterName: ACADEMY_MODERATOR.name,
    role: "moderator",
    voice: ACADEMY_MODERATOR.voice,
    voiceFingerprint: ACADEMY_MODERATOR.voiceFingerprint,
    speechRate: ACADEMY_MODERATOR.speechRate,
  },
  {
    characterId: ACADEMY_SECURITY_MODERATOR.characterId,
    canonicalCharacterName: ACADEMY_SECURITY_MODERATOR.name,
    role: "moderator",
    voice: ACADEMY_SECURITY_MODERATOR.voice,
    voiceFingerprint: ACADEMY_SECURITY_MODERATOR.voiceFingerprint,
    speechRate: ACADEMY_SECURITY_MODERATOR.speechRate,
  },
  {
    characterId: ACADEMY_DIGITAL_SKILLS_MODERATOR.characterId,
    canonicalCharacterName: ACADEMY_DIGITAL_SKILLS_MODERATOR.name,
    role: "moderator",
    voice: ACADEMY_DIGITAL_SKILLS_MODERATOR.voice,
    voiceFingerprint: ACADEMY_DIGITAL_SKILLS_MODERATOR.voiceFingerprint,
    speechRate: ACADEMY_DIGITAL_SKILLS_MODERATOR.speechRate,
  },
  {
    characterId: ACADEMY_ANNOUNCER.characterId,
    canonicalCharacterName: ACADEMY_ANNOUNCER.name,
    role: "announcer",
    voice: ACADEMY_ANNOUNCER.voice,
    voiceFingerprint: ACADEMY_ANNOUNCER.voiceFingerprint,
    speechRate: 1,
  },
];

function voiceFingerprintKey(fingerprint: AcademyVoiceFingerprint): string {
  return [
    fingerprint.provider,
    fingerprint.model,
    fingerprint.providerVoiceId,
    fingerprint.modelRevision,
  ].join(":");
}

function assertOneVoiceOneName(): void {
  const voices = Object.keys(ACADEMY_INSTRUCTORS_BY_VOICE);
  const names = Object.values(ACADEMY_INSTRUCTORS_BY_VOICE).map((row) => row.name);
  if (voices.length !== ACADEMY_INSTRUCTOR_TTS_VOICES.length) {
    throw new Error("Ses sicili eksik.");
  }
  if (new Set(names).size !== names.length) {
    throw new Error("Bir sese ikinci isim atanamaz.");
  }
  for (const voice of ACADEMY_INSTRUCTOR_TTS_VOICES) {
    if (ACADEMY_INSTRUCTORS_BY_VOICE[voice].voice !== voice) {
      throw new Error(`Ses anahtarı sapması: ${voice}`);
    }
  }
  const fingerprintKeys = ACADEMY_CAST_REGISTRY.map((binding) =>
    voiceFingerprintKey(binding.voiceFingerprint),
  );
  if (new Set(fingerprintKeys).size !== fingerprintKeys.length) {
    throw new Error("CAST_REGISTRY_VOICE_FINGERPRINT_COLLISION");
  }
}

assertOneVoiceOneName();

export function isAcademyTtsVoice(value: string): value is AcademyTtsVoice {
  return (ACADEMY_TTS_VOICES as readonly string[]).includes(value);
}

export function academyInstructorByVoice(voice: AcademyInstructorTtsVoice): AcademyInstructor {
  return ACADEMY_INSTRUCTORS_BY_VOICE[voice];
}

export function academyInstructorBySlug(slug: string): AcademyInstructor {
  const voice = ACADEMY_INSTRUCTOR_VOICE_BY_SLUG[slug as AcademyCourseTitleSlug];
  if (!voice) {
    throw new Error(`Eğitmen mühürü yok: ${slug}`);
  }
  return ACADEMY_INSTRUCTORS_BY_VOICE[voice];
}

export function academyInstructorBySlugOrNull(slug: string): AcademyInstructor | null {
  const voice = ACADEMY_INSTRUCTOR_VOICE_BY_SLUG[slug as AcademyCourseTitleSlug];
  return voice ? ACADEMY_INSTRUCTORS_BY_VOICE[voice] : null;
}

function firstLessonBio(instructor: AcademyInstructor, field: string, topic: string): string {
  const handback = ACADEMY_INSTRUCTOR_HANDBACK_LEAD;
  switch (instructor.voice) {
    case "Zephyr":
      return `${handback} ${field} tarafında yıllardır sahada ter döken biriyim. Bugün seninle ${topic} konuşacağız.`;
    case "Kore":
      return `${handback} ${field} tarafında sahada koşturan biriyim. Bugün ${topic} dalıyoruz.`;
    case "Puck":
      return `${handback} ${field} işini masada değil sahada çözüyorum. ${topic} pratik taraftan konuşacağız.`;
    case "Fenrir":
      return `${handback} ${field} tarafında kural net duruyor. ${topic} emniyet dilinde ele alacağız.`;
    case "Aoede":
      return `${handback} ${field} kurumsal raporda yaşar. ${topic} sloganla değil kanıt satırıyla konuşacağız.`;
    case "Leda":
      return `${handback} ${field} tarafında kapı varsayılan kilit durur. Bugün ${topic} konuşacağız.`;
    case "Callirrhoe":
      return `${handback} ${field} tarafında tane tane durur. Bugün ${topic} konuşacağız.`;
  }
}

export function academyModeratorOpenForSlug(slug: string): string {
  const instructor = academyInstructorBySlug(slug);
  const courseTitle = academyCourseTitleBySlug(slug);
  if (!courseTitle) {
    throw new Error(`Kurs adı yok: ${slug}`);
  }
  const honorific = academyInstructorHonorific(instructor);
  return `${ACADEMY_MODERATOR_OPEN_LEAD} Bugün sahadaki başlığımız: ${courseTitle}. Yanımızda alanında uzman ${honorific}. ${ACADEMY_MODERATOR_OPEN_TAIL}`;
}

export function academyModeratorCloseForSlug(slug: string): string {
  const instructor = academyInstructorBySlug(slug);
  return `${academyInstructorDativeHonorific(instructor)} bu anlatım için çok teşekkür ediyoruz. ${ACADEMY_MODERATOR_CLOSE_TAIL}`;
}

export function academyInstructorHonorific(instructor: AcademyInstructor): string {
  return instructor.gender === "kadin" ? `${instructor.name} Hanım` : `${instructor.name} Bey`;
}

export function academyInstructorDativeHonorific(instructor: AcademyInstructor): string {
  return instructor.gender === "kadin" ? `${instructor.name} Hanım'a` : `${instructor.name} Bey'e`;
}

export function isAcademyInstructorHandbackProse(text: string): boolean {
  return text.replace(/\s+/gu, " ").trim().includes(ACADEMY_INSTRUCTOR_HANDBACK_LEAD);
}

export function isAcademyInstructorStudioReplyProse(text: string): boolean {
  const trimmed = text.replace(/\s+/gu, " ").trim();
  return ACADEMY_INSTRUCTOR_STUDIO_LEADS.some((lead) => trimmed.includes(lead));
}

export function academyFirstLessonIntroForSlug(slug: string): string {
  const instructor = academyInstructorBySlug(slug);
  const open = ACADEMY_COURSE_OPEN[slug as AcademyCourseTitleSlug];
  if (!open) {
    throw new Error(`Ders açılışı yok: ${slug}`);
  }
  return `${academyModeratorOpenForSlug(slug)}\n${firstLessonBio(instructor, open.field, open.topic)}`;
}

/** Sonraki derslerin ilk paragrafı — isim + nefes. */
export function academyLessonMiddleOpenForSlug(slug: string): string {
  return `${academyInstructorBySlug(slug).greetingLead}...`;
}

/** Geriye dönük alias — NameOpen çağrıları MiddleOpen ile aynı nefesten geçer. */
export function academyLessonNameOpenForSlug(slug: string): string {
  return academyLessonMiddleOpenForSlug(slug);
}

/** Zephyr mühürü — geriye dönük vitrin sabiti. Diğer sesler slug’dan okunur. */
export const ACADEMY_INSTRUCTOR_NAME = ACADEMY_INSTRUCTORS_BY_VOICE.Zephyr.name;
export const ACADEMY_INSTRUCTOR_TITLE = ACADEMY_INSTRUCTORS_BY_VOICE.Zephyr.title;
