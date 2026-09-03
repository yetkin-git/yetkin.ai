/**
 * Tek ses = tek Türkçe isim. TTS kodu mühürdür; ikinci isim yasak.
 * Eğitmen, moderatör ve anons aynı Cast Registry tekillik denetiminden geçer.
 * Client-safe: sınav şıkları ve GEMINI_API_KEY yoktur.
 * Faz 3: pusula / Koray montajı `archived/lib/academy-studio/` (field-voice, studio-cast).
 * Bu dosya vitrin biyografisi ve ses mührüdür; fabrika import etmez.
 * Master Voice: Erinome — net, berrak, yakın mikrofon; teknik anlatım %93 tempo.
 */

import { YETKIN_BRAND } from "@/lib/copy/brand";
import {
  academyCourseTitleBySlug,
  type AcademyCourseTitleSlug,
} from "@/lib/academy/course-titles";
import { academyCourseLevelBySlug } from "@/lib/academy/course-level";
import {
  type AcademyLessonDraft,
  type DialogueSpeakerId,
  type DialogueTurn,
} from "@/lib/academy/curricula/types";

export const ACADEMY_INSTRUCTOR_TTS_VOICES = [
  "Zephyr",
  "Erinome",
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
  /** 0.93 = teknik akademi temposu; 1 = %100. */
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
  /** Kıdem / uzmanlık — vitrin ve tanışma cümlesi. */
  roleTitle: string;
  /** İlk ders özgeçmişi; greetingLead'den sonra konuşulur. */
  bio: string;
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

/** Eğitmen usta temposu — teknik kavramlar acele etmeden, %93. */
export const ACADEMY_INSTRUCTOR_SPEECH_RATE = 0.93 as const;

/** Gemini TTS Master Voice — yüksek frekans, berrak, yakın mikrofon. */
export const ACADEMY_MASTER_VOICE = "Erinome" as const satisfies AcademyInstructorTtsVoice;

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

/** CastRegistry — speaker yok sayılır; ders sesi yalnız Master Voice Erinome. */
export function academyCastForDialogueSpeaker(
  slug: string,
  _speaker: DialogueSpeakerId,
): AcademyDialogueCast {
  const instructor = academyInstructorBySlug(slug);
  return {
    voice: ACADEMY_MASTER_VOICE,
    speechRate: ACADEMY_INSTRUCTOR_SPEECH_RATE,
    canonicalCharacterName: instructor.name,
    role: "instructor",
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
    title: "Kıdemli Yazılım Mimarı",
    gender: "erkek",
    tone: "sakin",
    toneLabel: "Erkek / Sakin",
    greetingLead: "Selamlar, ben Deniz",
    roleTitle: "Kıdemli Yazılım Mimarı",
    bio: "Yazılım sistemleri uzmanıyım. Kıdemli Yazılım Mimarı olarak sahada kapı ve sözleşme kuruyorum.",
  },
  Erinome: {
    voice: "Erinome",
    voiceFingerprint: academyVoiceFingerprint("Erinome"),
    name: "Maya",
    title: "Kıdemli Yapay Zeka Mimarı",
    gender: "kadin",
    tone: "enerjik",
    toneLabel: "Kadın / Net Master Voice",
    greetingLead: "Merhaba, ben Maya",
    roleTitle: "Kıdemli Yapay Zeka Mimarı",
    bio: "Yapay Zeka Sistemleri Uzmanıyım. Kıdemli Yapay Zeka Mimarı olarak sahada ajan, araç ve Fail-closed kapıları kuruyorum.",
  },
  Puck: {
    voice: "Puck",
    voiceFingerprint: academyVoiceFingerprint("Puck"),
    name: "Aras",
    title: "Kıdemli Uygulama Mimarı",
    gender: "erkek",
    tone: "pratik",
    toneLabel: "Erkek / Pratik",
    greetingLead: "Selam, ben Aras",
    roleTitle: "Kıdemli Uygulama Mimarı",
    bio: "Uygulama sistemleri uzmanıyım. Kıdemli Uygulama Mimarı olarak işi masada değil sahada çözüyorum.",
  },
  Fenrir: {
    voice: "Fenrir",
    voiceFingerprint: academyVoiceFingerprint("Fenrir"),
    name: "Boran",
    title: "Kıdemli Veri Mimarı",
    gender: "erkek",
    tone: "otoriter",
    toneLabel: "Erkek / Otoriter",
    greetingLead: "Merhaba, ben Boran",
    roleTitle: "Kıdemli Veri Mimarı",
    bio: "Veri ve yapay zekâ uzmanıyım. Kıdemli Veri Mimarı olarak kuralı emniyet dilinde tutuyorum.",
  },
  Aoede: {
    voice: "Aoede",
    voiceFingerprint: academyVoiceFingerprint("Aoede"),
    name: "Selin",
    title: "Kıdemli Ürün Tasarım Mimarı",
    gender: "kadin",
    tone: "kurumsal",
    toneLabel: "Kadın / Kurumsal",
    greetingLead: "Merhaba, ben Selin",
    roleTitle: "Kıdemli Ürün Tasarım Mimarı",
    bio: "Dijital ürün tasarımı uzmanıyım. Kıdemli Ürün Tasarım Mimarı olarak sloganla değil kanıt satırıyla konuşuyorum.",
  },
  Leda: {
    voice: "Leda",
    voiceFingerprint: academyVoiceFingerprint("Leda"),
    name: "Ece",
    title: "Kıdemli Siber Güvenlik Mimarı",
    gender: "kadin",
    tone: "pratik",
    toneLabel: "Kadın / Pratik",
    greetingLead: "Merhaba, ben Ece",
    roleTitle: "Kıdemli Siber Güvenlik Mimarı",
    bio: "Siber güvenlik uzmanıyım. Kıdemli Siber Güvenlik Mimarı olarak kapıyı varsayılan kilitte tutuyorum.",
  },
  Callirrhoe: {
    voice: "Callirrhoe",
    voiceFingerprint: academyVoiceFingerprint("Callirrhoe"),
    name: "Gözde",
    title: "Kıdemli Dijital Beceriler Eğitmeni",
    gender: "kadin",
    tone: "pratik",
    toneLabel: "Kadın / Pratik",
    greetingLead: "Merhaba, ben Gözde",
    roleTitle: "Kıdemli Dijital Beceriler Eğitmeni",
    bio: "Dijital beceriler uzmanıyım. Kıdemli Dijital Beceriler Eğitmeni olarak iş dünyası araçlarını tane tane kuruyorum.",
  },
};

/** SKU → ses. İsim sesten okunur; sluga ikinci isim yazılmaz. */
export const ACADEMY_INSTRUCTOR_VOICE_BY_SLUG: Record<
  AcademyCourseTitleSlug,
  AcademyInstructorTtsVoice
> = {
  "ai-agent-temel": "Erinome",
  "ai-agent-orta": "Erinome",
  "ai-agent-ileri": "Erinome",
  "python-temel": "Erinome",
  "python-orta": "Erinome",
  "python-ileri": "Erinome",
  "fullstack-temel": "Erinome",
  "fullstack-orta": "Erinome",
  "fullstack-ileri": "Erinome",
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
  return `${instructor.greetingLead}. ${instructor.bio} ${field} tarafında sahada duruyorum. Bugün seninle ${topic} konuşacağız.`;
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

/** İlk ders tanışması — selam + özgeçmiş. PEDAGOJI.md kural 2. */
export function academyInstructorSpokenOpen(slug: string, order: number): string {
  if (order !== 1) {
    return "";
  }
  const instructor = academyInstructorBySlugOrNull(slug);
  if (!instructor) {
    return "";
  }
  return `${instructor.greetingLead}. ${instructor.bio}`;
}

function prefixInstructorOpen(text: string, open: string): string {
  const trimmed = text.replace(/\s+/gu, " ").trim();
  if (!open || !trimmed) {
    return trimmed;
  }
  if (trimmed.includes(open) || trimmed.startsWith(open.split(".")[0]!)) {
    return trimmed;
  }
  return `${open} ${trimmed}`.replace(/\s+/gu, " ").trim();
}

function sealDialogueTurn(turn: DialogueTurn, open: string, index: number): DialogueTurn {
  if (index !== 0 || !open) {
    return turn;
  }
  return { ...turn, text: prefixInstructorOpen(turn.text, open) };
}

/** Müfredat tohumuna tanışma mührü — bake ve ekran aynı DialogueTurn'dan okur. */
export function academySealLessonDraft(slug: string, draft: AcademyLessonDraft): AcademyLessonDraft {
  if (draft.format === "compact" || !draft.dialogue) {
    return draft;
  }
  const open = academyInstructorSpokenOpen(slug, draft.order);
  if (!open) {
    return draft;
  }
  const warmup = draft.dialogue.warmup.map((turn, index) => sealDialogueTurn(turn, open, index));
  const dialogue = {
    ...draft.dialogue,
    warmup,
  };
  const introWarmup = warmup.map((turn) => turn.text.trim()).join("\n\n");
  const introProblem = draft.dialogue.problem.map((turn) => turn.text.trim()).join("\n\n");
  return {
    ...draft,
    intro: `${introWarmup}\n\n${introProblem}`,
    dialogue,
  };
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
