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

export const ACADEMY_INSTRUCTOR_TTS_VOICES = [
  "Zephyr",
  "Kore",
  "Puck",
  "Fenrir",
  "Aoede",
] as const;

export const ACADEMY_TTS_VOICES = [
  ...ACADEMY_INSTRUCTOR_TTS_VOICES,
  "Charon",
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

/** Stüdyo sunucusu — eğitmenlerden ayrı fiziksel ses mührü. */
export const ACADEMY_MODERATOR = {
  characterId: "character.moderator.koray",
  voice: "Charon" as const satisfies AcademyTtsVoice,
  voiceFingerprint: academyVoiceFingerprint("Charon"),
  name: "Koray",
  title: "Moderatör Koray",
  role: "Stüdyo Sunucusu / Moderatör",
  gender: "erkek" as const,
};

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
};

/** SKU → ses. İsim sesten okunur; sluga ikinci isim yazılmaz. */
export const ACADEMY_INSTRUCTOR_VOICE_BY_SLUG: Record<
  AcademyCourseTitleSlug,
  AcademyInstructorTtsVoice
> = {
  "python-temel": "Kore",
  "fullstack-temel": "Puck",
  "ai-temel": "Fenrir",
  "ux-temel": "Aoede",
};

export type AcademyCourseOpen = {
  field: string;
  topic: string;
};

export const ACADEMY_COURSE_OPEN: Record<AcademyCourseTitleSlug, AcademyCourseOpen> = {
  "python-temel": {
    field: "Python yazılım temelleri",
    topic: "değişken, kontrol akışı, fonksiyon, koleksiyon ve problem çözme laboratuvarını",
  },
  "fullstack-temel": {
    field: "Full-stack web geliştirme",
    topic: "React, Next.js, Node.js ve dürüst Hipermetin Aktarım Protokolü sözleşmesini",
  },
  "ai-temel": {
    field: "Yapay zekâ ve veri analizi",
    topic: "üretim tarifi, yapılandırılmış çıktı ve kaynaklı veri disiplinini",
  },
  "ux-temel": {
    field: "dijital ürün tasarımı",
    topic: "Kullanıcı Deneyimi araştırması, Figma ve el teslimi paketini",
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
  })),
  {
    characterId: ACADEMY_MODERATOR.characterId,
    canonicalCharacterName: ACADEMY_MODERATOR.name,
    role: "moderator",
    voice: ACADEMY_MODERATOR.voice,
    voiceFingerprint: ACADEMY_MODERATOR.voiceFingerprint,
  },
  {
    characterId: ACADEMY_ANNOUNCER.characterId,
    canonicalCharacterName: ACADEMY_ANNOUNCER.name,
    role: "announcer",
    voice: ACADEMY_ANNOUNCER.voice,
    voiceFingerprint: ACADEMY_ANNOUNCER.voiceFingerprint,
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
