/**
 * Junior içerik kuralları. Pedagoji Ek-J ile aynıdır.
 * Model kimliği burada yazılmaz. Ses ve fon müziği `lib/junior/voice.ts` üzerinden mühürlü rolleri okur.
 */

import { JUNIOR_CLOSED_PROFILE_NICKNAME } from "@/lib/junior/guardian-notice";

/** Öğretmen hitabı. Belge ve veli sözleşmesi bu kuralın dışındadır. */
export const JUNIOR_TEACHER_ADDRESS = "sen" as const;

export const JUNIOR_TELL_CLOSE =
  "Aferin sana! Şimdi sıra sende. Aldığın bu notları mikrofona kendi sözlerinle anlat.";

/** Kısa özet bu dört bölümün yerine geçmez. Üçüncü bölümün çocuk yüzü ipucu kutusudur. */
export const JUNIOR_LESSON_SECTIONS = ["Kavram", "Örnek", "Kritik Uyarı", "Günlük Kullanım"] as const;

/**
 * Anlatımın üç aşaması. Bölüm adlarının (Kavram / Örnek / Uyarı / Günlük) yerine geçmez.
 * Günlük sahne Giriş’te merak uyandırır; Gelişme tanımsız tekrar etmez; Sonuç özet kartıyla biter.
 */
export const JUNIOR_SCENARIO_STAGES = [
  "Giriş (Oryantasyon)",
  "Gelişme (Tam Anlatım)",
  "Sonuç (Özetleme)",
] as const;

export const JUNIOR_RECAP_TITLE = "Bugün Neler Öğrendik?" as const;

/**
 * Konuşma bandı oynatıcı saatinde durur.
 * Alt sınır 5 dakika, hedef 7,5 dakika (7–8), üst sınır 12 dakika.
 */
export {
  JUNIOR_NARRATION_AIM_MS,
  JUNIOR_NARRATION_MAX_MS,
  JUNIOR_NARRATION_MIN_MS,
} from "@/lib/junior/player-clock";

/** Soğuk «Selam!» girişi yasaktır. Ders doğal ve sıcak öğretmen açılışlarından biriyle başlar. */
export const JUNIOR_WARM_OPENINGS = [
  "Merhaba güzel arkadaşım,",
  "Merhaba güzel arkadaşım!",
  "Merhaba!",
  "Selamlar! Bugün seninle çok keyifli bir konuyu keşfedeceğiz,",
  "Selamlar! Bugün seninle doğanın ve bilimin çok keyifli bir sırrını keşfedeceğiz,",
  "Selamlar! Bugün seninle dilimizin ve güzel Türkçemizin çok keyifli bir sırrını keşfedeceğiz,",
  "Selamlar! Bugün seninle toplumsal hayatımızın ve coğrafyamızın çok değerli bir sırrını keşfedeceğiz,",
  "Selamlar! Bugün seninle kendimizi İngilizce ifade etmenin çok keyifli yollarını keşfedeceğiz,",
  "Selamlar!",
  "Hoş geldin! Hazırsan bugün zihnimizi harika bir matematik yolculuğuna çıkarıyoruz,",
  "Hoş geldin! Hazırsan bugün zihnimizi harika bir bilim yolculuğuna çıkarıyoruz,",
  "Hoş geldin! Hazırsan bugün kelimelerin ve cümlelerin renkli dünyasına adım atıyoruz,",
  "Hoş geldin! Hazırsan bugün tarihin, kültürün ve yeryüzünün heyecan dolu dünyasına adım atıyoruz,",
  "Hoş geldin! Hazırsan bugün İngilizcenin ve eğlenceli kelimelerin dünyasına adım atıyoruz,",
  "Hoş geldin!",
  "Günün güzel geçiyordur umarım! Gel bakalım bugün önümüzde ne var,",
  "Günün güzel geçiyordur umarım! Gel bakalım bugün önümüzde ne var.",
  "Günün güzel geçiyordur umarım! Gel bakalım bugün önümüzde merak uyandıran ne var,",
  "Günün güzel geçiyordur umarım! Gel bakalım bugün kelimelerin arasında nasıl bir yolculuk var,",
  "Günün güzel geçiyordur umarım! Gel bakalım bugün haritada ve tarihte nasıl bir yolculuk var,",
  "Günün güzel geçiyordur umarım! Gel bakalım bugün İngilizcede önümüzde nasıl bir yolculuk var,",
  "Günün güzel geçiyordur umarım!",
  "Merhaba! Matematik dünyasına hoş geldin,",
  "Merhaba! Matematik dünyasına hoş geldin!",
  "Merhaba! Bilim dünyasına hoş geldin,",
  "Merhaba! Bilim dünyasına hoş geldin!",
  "Merhaba! Türkçe dünyasına hoş geldin,",
  "Merhaba! Türkçe dünyasına hoş geldin!",
  "Merhaba! Sosyal Bilgiler dünyasına hoş geldin,",
  "Merhaba! Sosyal Bilgiler dünyasına hoş geldin!",
  "Merhaba! İngilizce dünyasına hoş geldin,",
  "Merhaba! İngilizce dünyasına hoş geldin!",
  "Merhaba sevgili arkadaşım!",
  "Selam harika arkadaşım!",
] as const;

/** Anlatım boyunca çocuğu odağında tutan sıcak öğretmen yönlendirmeleri. */
export const JUNIOR_TEACHER_CUES = [
  "Bak burası senin için çok önemli!",
  "Şurası aklında kalsın tamam mı?",
] as const;

/** Kalıbın ünlem ve soru imi düşmüş gövdesi. Bağlama iki nokta ile yapılır. */
export function juniorTeacherCueStem(cue: string): string {
  return cue.replace(/[!?]+$/u, "").trim();
}

function escapeJuniorCue(stem: string): string {
  return stem.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

/**
 * Yönlendirme yalnız başına durmaz.
 * Hemen ardından açıklama varsa cümlenin başına iki nokta ile bağlanır.
 */
export function bindJuniorTeacherCue(cue: string, explanation: string): string {
  const stem = juniorTeacherCueStem(cue);
  const body = normalizeJuniorTeacherCues(explanation);
  if (!stem || !body) {
    return body;
  }
  if (body.includes(stem)) {
    return body;
  }
  return `${stem}: ${body}`;
}

/** Gömülü kalıbı açıklamasına bağlar. Ardında cümle yoksa kalıbı siler. */
export function normalizeJuniorTeacherCues(text: string): string {
  let next = text.replace(/\s+/g, " ").trim();
  for (const cue of JUNIOR_TEACHER_CUES) {
    const stem = juniorTeacherCueStem(cue);
    const escaped = escapeJuniorCue(stem);
    next = next.replace(new RegExp(`${escaped}[!?]?\\s+(?=\\S)`, "gu"), `${stem}: `);
    next = next.replace(new RegExp(`(?:^|\\s)${escaped}[!?]?\\s*$`, "gu"), "").trim();
  }
  return next.replace(/\s{2,}/g, " ").trim();
}

export type JuniorLessonSection = (typeof JUNIOR_LESSON_SECTIONS)[number];

/** Senaryo alanı → bölüm adı. Aynı paragraf üç alana kopyalanmaz. */
export const JUNIOR_SCENARIO_SECTION = {
  concept: "Kavram",
  example: "Örnek",
  warning: "Kritik Uyarı",
  life: "Günlük Kullanım",
} as const satisfies Record<string, JuniorLessonSection>;

/**
 * Gelişimsel İpucu Kutusu.
 * Üçüncü bölüm çocuk yüzünde bu iki başlıktan biriyle durur.
 * `title` ekranda, `spoken` anlatım metninde okunur.
 */
export const JUNIOR_HINT_BOX = {
  trap: { title: "Tuzaklara Düşme! 🕵️‍♂️", spoken: "Tuzaklara Düşme!" },
  gold: { title: "Altın İpucu! 💡", spoken: "Altın İpucu!" },
} as const;

export type JuniorHintKind = keyof typeof JUNIOR_HINT_BOX;

export const JUNIOR_HINT_BOX_PRINCIPLE =
  'Sınav ve test uyarıları asla baskıcı, korkutucu veya stres yaratıcı dille ("sınavda vururlar", "şok olursun" vb.) yazılamaz. Tüm kritik uyarılar "Tuzaklara Düşme! 🕵️‍♂️" veya "Altın İpucu! 💡" başlıklarıyla sunulur. Çocuk uyarılırken cesaretlendirilir ve merakı tetiklenir.';

/** Ders ve test gövdesinde yasak kalıplar. İlke metni bu listeyi örnek diye anabilir; ders metni taşımaz. */
export const JUNIOR_HARSH_WARNING_PHRASES = [
  "sınavda vururlar",
  "şok olursun",
  "sakın unutma",
  "barajın altında kaldın",
] as const;

export function juniorHintTitle(kind: JuniorHintKind): string {
  return JUNIOR_HINT_BOX[kind].title;
}

export function juniorHintCue(kind: JuniorHintKind): string {
  const spoken = JUNIOR_HINT_BOX[kind].spoken;
  if (kind === "gold") {
    return `${spoken} Bunu bir kez görünce kolayca hatırlarsın.`;
  }
  return `${spoken} Birlikte bakalım. Bu noktayı sen de görürsün.`;
}

export function juniorWarningHasHarshPhrase(text: string): boolean {
  const folded = text.toLocaleLowerCase("tr-TR");
  return JUNIOR_HARSH_WARNING_PHRASES.some((phrase) => folded.includes(phrase));
}

export function assertJuniorHintVoice(text: string): void {
  if (juniorWarningHasHarshPhrase(text)) {
    throw new Error("Junior uyarısı baskıcı dil taşıyor.");
  }
}

export function juniorHintKindFromCaption(caption: string): JuniorHintKind | null {
  const text = caption.trim();
  if (text.startsWith(JUNIOR_HINT_BOX.gold.spoken)) {
    return "gold";
  }
  if (text.startsWith(JUNIOR_HINT_BOX.trap.spoken) || text.startsWith("Tuzak:")) {
    return "trap";
  }
  return null;
}

const JUNIOR_OPENING_NICKNAME_RE = /^[\p{L}][\p{L}\s]{0,19}$/u;

/** Kapalı profil ve e-posta rumuz açılışa girmez. */
export function juniorOpeningNickname(raw: string | null | undefined): string | null {
  const name = raw?.trim().replace(/\s+/g, " ") ?? "";
  if (
    !name ||
    name === JUNIOR_CLOSED_PROFILE_NICKNAME ||
    name.includes("@") ||
    !JUNIOR_OPENING_NICKNAME_RE.test(name)
  ) {
    return null;
  }
  return name;
}

/**
 * Rumuz yoksa ders anahtarının harf toplamı sıcak listedeki kalıbı seçer.
 * Rumuz varsa açılış bir kez «Merhaba {rumuz}, bugün seninle…» olur. Liste büyümez.
 */
export function juniorWarmOpening(key: string, nickname?: string | null): string {
  const name = juniorOpeningNickname(nickname);
  if (name) {
    return `Merhaba ${name}, bugün seninle bu konuya bakacağız.`;
  }
  let sum = 0;
  for (let index = 0; index < key.length; index += 1) {
    sum += key.charCodeAt(index);
  }
  return JUNIOR_WARM_OPENINGS[sum % JUNIOR_WARM_OPENINGS.length] ?? JUNIOR_WARM_OPENINGS[0];
}

/**
 * Konuşma metninin başındaki sıcak kalıbı rumuzlu açılışla değiştirir.
 * Fırınlanmış kasetin zaman çizelgesine uygulanmaz.
 */
export function applyJuniorNicknameOpening(text: string, nickname?: string | null): string {
  const greeting = juniorOpeningNickname(nickname) ? juniorWarmOpening("acilis", nickname) : null;
  if (!greeting) {
    return text;
  }
  const trimmed = text.replace(/\s+/g, " ").trim();
  const openings = [...JUNIOR_WARM_OPENINGS].sort((left, right) => right.length - left.length);
  for (const opening of openings) {
    if (!trimmed.startsWith(opening)) {
      continue;
    }
    const restRaw = trimmed.slice(opening.length).trim();
    const rest = restRaw
      ? `${restRaw.charAt(0).toLocaleUpperCase("tr-TR")}${restRaw.slice(1)}`
      : "";
    return rest ? `${greeting} ${rest}` : greeting;
  }
  return `${greeting} ${trimmed}`.replace(/\s+/g, " ").trim();
}

export function startsWithJuniorWarmOpening(text: string): boolean {
  const trimmed = text.trim();
  return JUNIOR_WARM_OPENINGS.some((opening) => trimmed.startsWith(opening));
}

/** Soğuk «Selam!» kalıbı. «Selam harika arkadaşım!» bu yasağın dışındadır. */
export function juniorColdGreeting(text: string): boolean {
  return text.trim().startsWith("Selam!");
}

/**
 * Girişi mühürlü sıcak hitaba bağlar.
 * Gövde cümlesi sen dilinde kalır. Belge ve veli notu bu kapıdan geçmez.
 */
export function sealJuniorWarmWelcome(text: string, key: string): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (startsWithJuniorWarmOpening(trimmed)) {
    return trimmed;
  }
  const body = trimmed
    .replace(/^Selam!\s*/u, "")
    .replace(/^Sevgili çocuklar merhaba!\s*/u, "");
  return `${juniorWarmOpening(key)} ${body}`.replace(/\s+/g, " ").trim();
}

export function juniorHintBody(caption: string): string {
  const text = caption.trim();
  const prefixes = [JUNIOR_HINT_BOX.gold.spoken, JUNIOR_HINT_BOX.trap.spoken, "Tuzak:"];
  for (const prefix of prefixes) {
    if (text.startsWith(prefix)) {
      return text.slice(prefix.length).trim();
    }
  }
  return text;
}
