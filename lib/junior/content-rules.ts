/**
 * Junior içerik kuralları. Pedagoji Ek-J ile aynıdır.
 * Model kimliği burada yazılmaz. Ses ve fon müziği `lib/junior/voice.ts` üzerinden mühürlü rolleri okur.
 */

import { JUNIOR_CLOSED_PROFILE_NICKNAME } from "@/lib/junior/guardian-notice";

/**
 * Gövde ve mikrofon cümlesi sen dilindedir.
 * Açılış topluluğa, ipucu tek çocuğa, adım sonu birlikte söylenir.
 * Belge ve veli sözleşmesi bu kuralın dışındadır.
 */
export const JUNIOR_TEACHER_ADDRESS = "sen" as const;

/** Kaset açılışı. Topluluk aidiyeti. Tek sayı birinci, çift sayı ikinci kalıbı alır. */
export const JUNIOR_HYBRID_OPENINGS = [
  "Merhaba sevgili çocuklar!",
  "Merhaba çocuklar, hepiniz hoş geldiniz!",
] as const;

/** İpucu ve kilit nokta. Birebir rehberlik. */
export const JUNIOR_HYBRID_HINT_LEAD =
  "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta.";

/** Adım sonu. Birlikte başarma. Mikrofon cümlesinden hemen önce durur. */
export const JUNIOR_HYBRID_STEP_CLOSE = "Tebrikler çocuklar! Harika bir iş çıkardık.";

export const JUNIOR_TELL_CLOSE =
  "Şimdi sıra sende. Aldığın bu notları mikrofona kendi sözlerinle anlat.";

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
 * Alt sınır 3 dakika (180 sn), hedef 7,5 dakika, üst sınır 12 dakika.
 * Sayıların evi `JUNIOR_NARRATION_MIN_MS`.
 */
export {
  JUNIOR_NARRATION_AIM_MS,
  JUNIOR_NARRATION_MAX_MS,
  JUNIOR_NARRATION_MIN_MS,
} from "@/lib/junior/player-clock";

/** Soğuk «Selam!» girişi yasaktır. Kaset, hibrit topluluk açılışından biriyle başlar. */
export const JUNIOR_WARM_OPENINGS = [
  ...JUNIOR_HYBRID_OPENINGS,
  "Merhaba güzel arkadaşım,",
  "Merhaba güzel arkadaşım!",
  "Merhaba!",
  "Selamlar! Çok keyifli bir konuyu keşfedeceğiz,",
  "Selamlar! Doğanın ve bilimin çok keyifli bir sırrını keşfedeceğiz,",
  "Selamlar! Dilimizin ve güzel Türkçemizin çok keyifli bir sırrını keşfedeceğiz,",
  "Selamlar! Toplumsal hayatımızın ve coğrafyamızın çok değerli bir sırrını keşfedeceğiz,",
  "Selamlar! Kendimizi İngilizce ifade etmenin çok keyifli yollarını keşfedeceğiz,",
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

/**
 * Anlatım köprüsü. Alkış ve «çok önemli» dolgusu değildir.
 * Ünlem, mühürde iki nokta ile bağlansın diye durur; kaset metnine ünlemli hali yazılmaz.
 */
export const JUNIOR_TEACHER_CUES = [
  "Kavramın cümlesi burada durur!",
  "Özet kartında bunu yanında tut!",
] as const;

/**
 * Yapay doldurma. Ders gövdesinde ve derlemede durmaz.
 * «çok önemli» tek başına yasak değildir; meşru cümle («çok önemli bir dönüm noktası») kalır.
 */
export const JUNIOR_CLICHE_PHRASES = [
  "bak burası çok önemli",
  "bak burası senin için çok önemli",
  "aferin sana",
  "şurası aklında kalsın",
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
 * `title` ekrandadır. `spoken` fırınlanmış kasetin cümle başıdır; yeni başlık ses kaydını kaydırmaz.
 */
export const JUNIOR_HINT_BOX = {
  trap: { title: "💡 Dikkat Noktası", spoken: "Tuzaklara Düşme!" },
  gold: { title: "⭐ Altın İpucu", spoken: "Altın İpucu!" },
} as const;

export type JuniorHintKind = keyof typeof JUNIOR_HINT_BOX;

export const JUNIOR_HINT_BOX_PRINCIPLE =
  'Sınav ve test uyarıları asla baskıcı, korkutucu veya stres yaratıcı dille ("sınavda vururlar", "şok olursun" vb.) yazılamaz. Tüm kritik uyarılar "💡 Dikkat Noktası" veya "⭐ Altın İpucu" başlıklarıyla sunulur. Yıldız ve ipucu zaman çubuğunda işaret olarak kalır; kaset bu işaretlerde kendiliğinden durmaz. Kart, çocuk işarete dokununca veya anlatımı kendisi durdurunca açılır. Kart "Anladım!" ile kapanır. Çocuk uyarılırken cesaretlendirilir ve merakı tetiklenir.';

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

const JUNIOR_GOLD_LEADS = [
  JUNIOR_HINT_BOX.gold.title,
  "⭐ Altın İpucu",
  JUNIOR_HINT_BOX.gold.spoken,
] as const;

const JUNIOR_TRAP_LEADS = [
  JUNIOR_HINT_BOX.trap.title,
  "💡 Dikkat Noktası",
  "Dikkat Noktası!",
  "Dikkat Noktası",
  JUNIOR_HINT_BOX.trap.spoken,
  "Tuzak:",
] as const;

export function juniorHintKindFromCaption(caption: string): JuniorHintKind | null {
  const text = caption.trim();
  if (JUNIOR_GOLD_LEADS.some((lead) => text.startsWith(lead))) {
    return "gold";
  }
  if (JUNIOR_TRAP_LEADS.some((lead) => text.startsWith(lead))) {
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

/** Tek numaralı ders birinci topluluk cümlesini, çift numaralı ders ikinci cümleyi alır. */
export function juniorHybridOpening(key: string): (typeof JUNIOR_HYBRID_OPENINGS)[number] {
  const match = /-(\d+)$/u.exec(key);
  const number = match ? Number(match[1]) : 1;
  return number % 2 === 1 ? JUNIOR_HYBRID_OPENINGS[0] : JUNIOR_HYBRID_OPENINGS[1];
}

/**
 * Rumuz yoksa ders anahtarının harf toplamı sıcak listedeki kalıbı seçer.
 * Rumuz varsa açılış bir kez «Merhaba {rumuz}, bu konuya birlikte bakacağız.» olur.
 */
export function juniorWarmOpening(key: string, nickname?: string | null): string {
  const name = juniorOpeningNickname(nickname);
  if (name) {
    return `Merhaba ${name}, bu konuya birlikte bakacağız.`;
  }
  let sum = 0;
  for (let index = 0; index < key.length; index += 1) {
    sum += key.charCodeAt(index);
  }
  return JUNIOR_WARM_OPENINGS[sum % JUNIOR_WARM_OPENINGS.length] ?? JUNIOR_WARM_OPENINGS[0];
}

/**
 * Ekranda görünen selam sesle aynı olmak zorundadır.
 * Mühürlü kasette açılış sabittir ve rumuz sese girmez; ekran da aynı sabit açılışı gösterir.
 * Ses üretilmeyen yolda (tarayıcı konuşması) rumuzlu açılış hem ekranda hem sesli okumada kullanılır.
 */
export function juniorLessonGreeting(input: {
  lessonKey: string;
  nickname?: string | null;
  sealedVoice: boolean;
}): string | null {
  if (input.sealedVoice) {
    return juniorHybridOpening(input.lessonKey);
  }
  return juniorOpeningNickname(input.nickname) ? juniorWarmOpening(input.lessonKey, input.nickname) : null;
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
 * Girişi topluluk açılışına bağlar.
 * Metin zaten hibrit açılışla başlıyorsa olduğu gibi kalır.
 * Eski sıcak kalıp düşer. Gövde sen dilinde kalır. Belge ve veli notu bu kapıdan geçmez.
 */
export function sealJuniorWarmWelcome(text: string, key: string): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (JUNIOR_HYBRID_OPENINGS.some((opening) => trimmed.startsWith(opening))) {
    return trimmed;
  }
  const openings = [...JUNIOR_WARM_OPENINGS].sort((left, right) => right.length - left.length);
  let body = trimmed.replace(/^Selam!\s*/u, "").replace(/^Sevgili çocuklar merhaba!\s*/u, "");
  for (const opening of openings) {
    if (!body.startsWith(opening)) {
      continue;
    }
    body = body.slice(opening.length).trim();
    break;
  }
  if (body) {
    body = `${body.charAt(0).toLocaleUpperCase("tr-TR")}${body.slice(1)}`;
  }
  return `${juniorHybridOpening(key)} ${body}`.replace(/\s+/g, " ").trim();
}

/** İpucu gövdesi birebir hitabı taşımıyorsa kilit cümlesini başına bağlar. */
export function ensureJuniorHybridHint(warning: string): string {
  const trimmed = warning.replace(/\s+/g, " ").trim();
  if (trimmed.toLocaleLowerCase("tr-TR").includes("sevgili arkadaşım")) {
    return trimmed;
  }
  return `${JUNIOR_HYBRID_HINT_LEAD} ${trimmed}`.replace(/\s+/g, " ").trim();
}

/**
 * Ardışık cümleler aynı emir köküyle bitmesin.
 * Kökler: söyle, kur, seç. Bu kapı süre doldurma izni değildir.
 */
export const JUNIOR_IMPERATIVE_STEMS = ["söyle", "kur", "seç"] as const;

const JUNIOR_IMPERATIVE_WORD: Readonly<Record<string, (typeof JUNIOR_IMPERATIVE_STEMS)[number]>> = {
  söyle: "söyle",
  söyler: "söyle",
  söylersin: "söyle",
  söyleyelim: "söyle",
  kur: "kur",
  kurar: "kur",
  kurarsın: "kur",
  seç: "seç",
  seçer: "seç",
  seçersin: "seç",
};

/** Somut çeşitlilik sözlüğü. Koç kuyruğu en az üç sayı ve üç nesne taşır. */
export const JUNIOR_CONCRETE_OBJECTS = [
  "kalem",
  "bardak",
  "defter",
  "elma",
  "merdiven",
  "harita",
  "lego",
  "bisiklet",
  "cetvel",
  "top",
] as const;

export function juniorSpeechSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?…])\s+/u)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter((part) => part.length > 0);
}

export function juniorSentenceImperativeStem(
  sentence: string,
): (typeof JUNIOR_IMPERATIVE_STEMS)[number] | null {
  const cleaned = sentence
    .replace(/[.!?…"'”’]+$/gu, "")
    .trim()
    .toLocaleLowerCase("tr-TR");
  const last = cleaned.split(/\s+/u).pop() ?? "";
  return JUNIOR_IMPERATIVE_WORD[last] ?? null;
}

export function juniorSentencesShareImperativeStem(left: string, right: string): boolean {
  const first = juniorSentenceImperativeStem(left);
  const second = juniorSentenceImperativeStem(right);
  return Boolean(first && second && first === second);
}

/** Ardışık iki cümle aynı emir köküyle bitemez. */
export function assertJuniorImperativeVariety(sentences: readonly string[]): void {
  for (let index = 1; index < sentences.length; index += 1) {
    const previous = sentences[index - 1] ?? "";
    const current = sentences[index] ?? "";
    if (juniorSentencesShareImperativeStem(previous, current)) {
      throw new Error("Ardışık cümleler aynı emir köküyle bitiyor.");
    }
  }
}

export function juniorConcreteVariety(text: string): { numbers: string[]; objects: string[] } {
  const folded = text.toLocaleLowerCase("tr-TR");
  const numbers = [...new Set(folded.match(/\d+/gu) ?? [])];
  const objects = JUNIOR_CONCRETE_OBJECTS.filter((object) => folded.includes(object));
  return { numbers, objects };
}

/** Gelişme dolgusu aynı kalıbı çevirmez: en az üç farklı sayı ve üç farklı nesne. */
export function assertJuniorConcreteVariety(text: string): void {
  const { numbers, objects } = juniorConcreteVariety(text);
  if (numbers.length < 3 || objects.length < 3) {
    throw new Error("Somut örnek çeşitliliği eksik. En az üç farklı sayı ve üç farklı nesne gerekir.");
  }
}

/** Devam cümleleri papağan kapısının üstündeki çeşitlilik kapısıdır. Süre motoru değildir. */
export function assertJuniorCoachVariety(lines: readonly string[]): void {
  const sentences = lines.flatMap((line) => juniorSpeechSentences(line));
  assertJuniorImperativeVariety(sentences);
  assertJuniorConcreteVariety(lines.join(" "));
}

/**
 * Sırf süreyi uzatmak için ders sonuna yapıştırılan basmakalıp koç satırları.
 * Kaset bu kalıpları taşımaz. Eksik saniye, konunun kendi cümlesinden kurulan hikâye omurgasıyla tutulur.
 */
export const JUNIOR_CANNED_COACH_MARKERS = [
  "masadaki 2 kalemi yan yana koy",
  "3 bardağın içinden dolu olanı seç",
  "defterdeki 4 satırı kendi sözünle söyle",
  "5 elmayı üst üste bir kule gibi kur",
  "merdivenin 8 basamağını parmağınla göster",
  "haritadaki 10 yolu sırayla say",
  "bisikletin 2 tekerleğini kısa bir hikâyeye bağla",
  "cetvelde 3 santimi defterin kenarına yaz",
  "topu 4 kez yere vurup yüksekliğini böl",
  "lego kulesinin 5 katını yan yana diz",
  "8 kalemin en kısasını cetvelle ölç",
  "10 bardaktaki suyu iki eşit gruba topla",
  "defterin 2 sayfasını bugünkü bir olaya anlat",
  "elmayı 3 dilime ayırıp tabağın ortasına koy",
  "merdivenden 4 basamak inip farkı çıkar",
  "haritada 5 şehri tek bir çizgiyle işaret et",
  "bisikletle 8 metre gidip ne değiştiğini dene",
  "cetveldeki 10 çizgiyi bir kez daha tut",
  "topun 2 rengini sırayla aç",
  "lego kutusundan 3 parçayı masanın kenarına kapat",
  "kalemle 4 köşeli bir çerçeve çevir",
  "bardaktaki 5 yudumu tek bir cümleye ekle",
  "defterden eski 8 kelimeyi yavaşça sil",
  "elmanın 10 çekirdeğini boş bir kâğıda boya",
  "merdivenin 2 korkuluğunu yeniden koy",
  "haritadan 3 nehri seç",
  "bisikletin 4 parçasının adını söyle",
  "cetvelle 5 kare kur",
  "topun 8 zıplamasını tek tek göster",
  "lego ile 10 basamaklı küçük bir kule say",
  "2 kalemi bugünkü işe bağla",
  "3 bardağı yan yana yaz",
  "4 elmayı merdivenin dibine diz",
  "defterde 5 satırı cetvelle ölç",
  "haritadaki 8 yolu iki gruba topla",
  "bisikletin 10 pedal çevirişini anlat",
  "topun içindeki 2 rengi masaya koy",
  "lego kulesinden 3 kat çıkar",
  "cetvelde 4 santimi işaret et",
  "kalem kutusundaki 5 rengi dene",
] as const;

export function juniorTextHasCannedCoach(text: string): boolean {
  const folded = text.toLocaleLowerCase("tr-TR");
  return JUNIOR_CANNED_COACH_MARKERS.some((marker) => folded.includes(marker));
}

/** Basmakalıp süre kuyruğu kaset metninde durursa fırın düşer. */
export function assertJuniorNoCannedCoach(text: string): void {
  if (juniorTextHasCannedCoach(text)) {
    throw new Error("Kaset süresi koç kalıbıyla doldurulmuş.");
  }
}

const JUNIOR_CLICHE_PATTERNS: readonly RegExp[] = [
  /[Bb]ak burası (?:senin için )?çok önemli\s*[:;,.!?…]*/gu,
  /[Aa]ferin sana\s*[:;,.!?…]*/gu,
  /[Şş]urası aklında kalsın(?:\s+tamam m[ıi])?\s*[:;,.!?…]*/gu,
];

/** Klişe köprüyü siler; arkadaki öğretim cümlesini bırakır. */
export function stripJuniorCliches(text: string): string {
  let next = text.replace(/\s+/g, " ").trim();
  for (const pattern of JUNIOR_CLICHE_PATTERNS) {
    next = next.replace(pattern, " ");
  }
  return next.replace(/\s{2,}/g, " ").replace(/\s+([,.!?…])/gu, "$1").trim();
}

export function juniorTextHasCliche(text: string): boolean {
  const folded = text.toLocaleLowerCase("tr-TR");
  return JUNIOR_CLICHE_PHRASES.some((phrase) => folded.includes(phrase));
}

/** Klişe doldurma derlemede durursa fırın düşer. */
export function assertJuniorNoCliche(text: string): void {
  if (juniorTextHasCliche(text)) {
    throw new Error("Klişe doldurma cümlesi içerikte duruyor.");
  }
}

/**
 * Aynı cümle veya aynı sayısal örnek en fazla iki kez.
 * Üçüncü kullanım derlemeyi düşürür.
 */
export function assertJuniorExampleRepeatLimit(text: string): void {
  const counts = new Map<string, number>();
  for (const sentence of juniorSpeechSentences(text)) {
    const key = sentence
      .replace(/[.!?…"'”’]+$/gu, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLocaleLowerCase("tr-TR");
    if (key.length < 28) {
      continue;
    }
    const next = (counts.get(key) ?? 0) + 1;
    counts.set(key, next);
    if (next >= 3) {
      throw new Error("Aynı örnek üçüncü kez kullanılıyor.");
    }
  }
  const folded = text.toLocaleLowerCase("tr-TR");
  const numeric = new Map<string, number>();
  const bump = (key: string) => {
    const next = (numeric.get(key) ?? 0) + 1;
    numeric.set(key, next);
    if (next >= 3) {
      throw new Error("Aynı sayısal örnek üçüncü kez kullanılıyor.");
    }
  };
  for (const match of folded.matchAll(/(\d+)\s*üssü\s*(\d+)/gu)) {
    bump(`${match[1]} üssü ${match[2]}`);
  }
  for (const object of JUNIOR_CONCRETE_OBJECTS) {
    const pattern = new RegExp(`(\\d+)\\s+${object}(?![\\p{L}])`, "gu");
    for (const match of folded.matchAll(pattern)) {
      bump(`${match[1]} ${object}`);
    }
  }
}

/**
 * Günlük sahne sözlüğü. Kavram anlatılırken en az üçü geçmelidir.
 * Kısa parçalar («ev», «su») başka kelimenin içine düşmesin diye harf sınırında aranır.
 */
export const JUNIOR_DAILY_SCENES = [
  "oda",
  "mutfak",
  "okul",
  "bahçe",
  "park",
  "market",
  "sınıf",
  "sokak",
  "lego",
  "kule",
  "kalem",
  "bardak",
  "defter",
  "elma",
  "bisiklet",
  "harita",
  "top",
  "masa",
  "pencere",
  "çanta",
  "kitap",
  "ekmek",
  "tabak",
  "meyve",
  "oyun",
  "ders",
  "evde",
  "yolda",
  "deniz",
  "orman",
  "dağ",
  "tarla",
  "gökyüzü",
  "yıldız",
  "gezegen",
  "dünya",
  "güneş",
  "toprak",
  "ağaç",
  "sofra",
  "arkadaş",
  "bitki",
  "hayvan",
  "çiçek",
  "yağmur",
  "nehir",
  "şehir",
  "ülke",
  "kapı",
  "lamba",
  "gece",
  "sabah",
  "akşam",
  "öğle",
  "gündüz",
  "çizim",
  "banyo",
  "diş",
  "yemek",
  "mide",
  "otobüs",
  "takım",
  "grup",
  "kurdele",
  "servis",
  "uçurtma",
  "kutu",
  "şişe",
  "lira",
  "kuruş",
  "silgi",
  "evin",
  "su",
  "kurs",
] as const;

export function juniorDailyScenes(text: string): string[] {
  const folded = text.toLocaleLowerCase("tr-TR");
  return JUNIOR_DAILY_SCENES.filter((scene) =>
    new RegExp(`(?<![\\p{L}])${scene}`, "u").test(folded),
  );
}

/** Kavram anlatımında en az üç farklı günlük sahne veya nesne gerekir. */
export function assertJuniorDailySceneVariety(text: string): void {
  if (juniorDailyScenes(text).length < 3) {
    throw new Error(
      "Somut örnek çeşitliliği eksik. En az üç farklı günlük hayat örneği veya görsel sahne gerekir.",
    );
  }
}

export function juniorHintBody(caption: string): string {
  let text = caption.trim();
  const prefixes = [...JUNIOR_GOLD_LEADS, ...JUNIOR_TRAP_LEADS];
  for (const prefix of prefixes) {
    if (text.startsWith(prefix)) {
      text = text.slice(prefix.length).trim();
      break;
    }
  }
  return text;
}
