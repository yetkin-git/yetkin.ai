import {
  JUNIOR_HINT_BOX,
  JUNIOR_NARRATION_AIM_MS,
  JUNIOR_NARRATION_MAX_MS,
  JUNIOR_NARRATION_MIN_MS,
  JUNIOR_RECAP_TITLE,
  JUNIOR_TEACHER_CUES,
  JUNIOR_TELL_CLOSE,
  assertJuniorHintVoice,
  bindJuniorTeacherCue,
  juniorHintCue,
  sealJuniorWarmWelcome,
  type JuniorHintKind,
} from "@/lib/junior/content-rules";
import { juniorLessonNote } from "@/lib/junior/lesson-note";
import { juniorPlayerTimeline } from "@/lib/junior/player-clock";
import { chunkJuniorLocalSpeech } from "@/lib/junior/speech";
import {
  JUNIOR_VECTOR_STEP_COUNT,
  type JuniorLessonScript,
  type JuniorPlayerSteps,
  type JuniorVectorScene,
} from "@/lib/junior/types";
import { sealJuniorTeacherIntro } from "@/lib/junior/voice";

export { JUNIOR_TELL_CLOSE };

/**
 * Tek senaryo. Dinleme, okul notu ve günlük kullanım bu parçalardan üretilir.
 * Aynı cümle üç alana ayrı kopya olarak yazılmaz.
 * Üç aşama: Giriş (oryantasyon), Gelişme (tam anlatım — sıfır papağan tekrar), Sonuç (özet).
 * SoftStage hâlâ 12 vektör adımı taşır; adımlar bu üç evreye dizilir.
 */
export type JuniorLessonScenario = {
  key: string;
  title: string;
  teaser: string;
  /** Sıcak karşılama. Mühürlü açılış ve günlük meraktır. */
  welcome: string;
  concept: string;
  example: string;
  warning: string;
  /** Üçüncü bölümün çocuk yüzü. Boşsa tuzak kutusu. */
  hint?: JuniorHintKind;
  life: string;
  /** Konu sonu özetinin üç kritik noktası. */
  recap: readonly [string, string, string];
  conceptSeal: string;
  voiceSeal: string;
  /**
   * Sonuç evresinde bir kez söylenen net yönlendirme.
   * Boşsa genel «kendi cümlenle söyle» kalır.
   */
  echoPrompt?: string;
  outcomes: readonly string[];
  scene: JuniorVectorScene;
  parentNote?: string;
  /**
   * Seçmeli hazırlık metni. Süre bandına kalıp dolgu ile çekilmez.
   * Çekirdek konu bu alanı taşımaz.
   */
  band?: "draft";
};

function seal(conceptSeal: string, voiceSeal: string): string {
  return `Buna Kavramsal Anlayış deriz. ${conceptSeal} Anlatışına İfade Gücü deriz. ${voiceSeal} ${JUNIOR_TELL_CLOSE}`;
}

/** Cümleyi kelimenin ortasından kesmez. Sığmazsa son tam cümlede durur. */
function wholeSentences(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) {
    return clean;
  }
  const parts = clean.split(/(?<=[.!?])\s+/u);
  const kept: string[] = [];
  for (const part of parts) {
    const piece = part.trim();
    if (!/[.!?]$/u.test(piece)) {
      break;
    }
    const next = [...kept, piece].join(" ");
    if (next.length > max) {
      break;
    }
    kept.push(piece);
  }
  if (kept.length > 0) {
    return kept.join(" ");
  }
  const first = parts[0]?.trim() ?? clean;
  return /[.!?]$/u.test(first) ? first : clean;
}

function spokenMs(mebNote: string, lifeUse: string): number {
  const note = juniorLessonNote(mebNote, lifeUse);
  const chunks = chunkJuniorLocalSpeech(note);
  return juniorPlayerTimeline(note, chunks, JUNIOR_VECTOR_STEP_COUNT).durationMs;
}

/** Oynatıcı saati. Mühür, metin bandını bu süreden okur. */
export function juniorNarrationDurationMs(mebNote: string, lifeUse: string): number {
  return spokenMs(mebNote, lifeUse);
}

/**
 * İleri adım. Örneği, kavramı ve özeti ikinci kez kalıp çerçevede okumaz.
 * Başlık, işin adıdır. Cümle çocuğa tek kişi olarak söylenir.
 */
const JUNIOR_FORWARD_COACH = [
  "Bu işin adı {title}. Adı bir kez söyle, sonra kendi sahneni kur.",
  "Hadi, acele etme. Önce ne yaptığını kendi sözünle söyle.",
  "Bir sahne seç. O sahnede tek bir adım kur. İkinci adıma geçmeden dur.",
  "Bu adımı bir arkadaşına anlatır gibi söyle. Kitap cümlesini okuma.",
  "Kendi sözün kalsın. Başka birinin cümlesini taşıma.",
  "Nerede takıldığını fark edersen, oraya kısa bir durum koy.",
  "Durum oturunca, dikkat noktasını yol göstererek söyle. Korkutma.",
  "Üç karttan birini seç. Kartı ezberleme. Kartın işini söyle.",
  "Şimdi aynı işi evde bir kez kur. Yeni bir eşya seç.",
  "Eşyayı seçince dur. Ne değişti, ne aynı kaldı, onu söyle.",
  "{title} işini yarın nerede kullanacağını bir cümleyle söyle.",
  "Cümlede sen ol. Kalabalık bir sınıfa değil, tek kişiye söylüyorsun.",
  "Yanlış olursa yeniden kurarsın. Azar yok. Küçük bir sonraki adım var.",
  "Bir nefes al. Sonra işi baştan, yavaşça, kendi sıranla kur.",
  "Sırayı bozma. Önce parçayı gör, sonra işi söyle.",
  "Parçayı görünce adını koy. Ad, işin kendisi değildir. İşi de söyle.",
  "İşi söyleyince bir kez uygula. Uygulama kısa olsun.",
  "Uygulama bitince kendine sor. Bu adımı neden böyle kurdum?",
  "Cevap tek cümle olsun. Uzun bir ezber istemem.",
  "Şimdi o cümleyi bir de evdeki bir işe bağla.",
  "{title} adını yeniden söyle. Bu kez adın altındaki işi ekle.",
  "İşi eklerken acele etme. Bir kelimeyi atladıysan geri dön.",
  "Geri dönünce utanma. Öğretmenin yanında, yol açık.",
  "Yol açıkken tek bir hata seç. O hatayı nasıl düzeltirsin, onu söyle.",
  "Düzeltmeyi korku cümlesiyle kurma. Merak cümlesiyle kur.",
  "Merak cümlesi bittikten sonra üç karttan birine dön.",
  "Karttaki işi kendi hayatından bir sahneye taşı.",
  "Sahne senin odanda ya da okul yolunda olabilir. Birini seç.",
  "Seçtiğin yerde işi bir kez daha, yeni sözle kur.",
  "Yeni söz, eski cümlenin kopyası olmasın. Aynı iş, yeni cümle.",
  "Bitirmeden önce ne öğrendiğini söyle. Tanımı değil, yaptığın işi söyle.",
  "{title} burada kapanır. Kendi cümlen kalsın.",
  "Bir kez daha dur. İşin adını söyle, sonra o adı bir harekete çevir.",
  "Hareket küçük olsun. Büyük bir gösteri istemem. Tek adım yeter.",
  "Adımı kurunca sesli söyle. Fısıltı da olur. Önemli olan senin cümlen.",
  "Cümlen bitince kendine gülümse. Doğru parça görünsün, eksik parça azar olmasın.",
  "Eksik parçayı bir sonraki küçük adım olarak söyle. Korku katma.",
  "Şimdi o adımı okul çantanda bir eşyayla kur. Eşya senin olsun.",
  "Eşya değişince iş değişmez. Değişen, senin kurduğun cümledir.",
  "Cümleyi kurarken aceleci bir kelimeyi at. Yerine sakin bir kelime koy.",
  "Sakin kelime oturunca işi bir arkadaşına değil, kendine anlat.",
  "Kendine anlatırken dürüst ol. Bildiğin yeri söyle, takıldığın yeri de söyle.",
  "Takıldığın yer utanç değildir. Orası senin yeni adımındır.",
  "Yeni adımı tek nefeste söyle. Nefes bitince sus. Eklemeye çalışma.",
  "Sustuktan sonra üç karttan birine son kez bak. Kartı okuma. İşini söyle.",
  "{title} işi bugün senin elinde. Yarın da aynı işi yeni bir cümleyle kurarsın.",
  "Yarınki cümle bugünkü cümlenin kopyası olmasın. Aynı iş, taze söz.",
  "Taze sözü kurmadan önce bir yer seç. Oda, bahçe ya da okul yolu.",
  "Seçtiğin yerde kim var, onu da söyle. Tek kişi yeter.",
  "O kişiye işi anlatırken sen hitabını koru. Kalabalık bir söylev kurma.",
  "Söylev değil, kısa bir yol tarifi olsun. Bir adım, bir cümle.",
  "Yol tarifi bitince ne kolaylaştı, onu söyle. Zorluğu büyütme.",
  "Kolaylaşan yeri bir cümleyle söyle. Abartma.",
  "Kutlama bitince kapanışa gel. Ne öğrendiğini, yaptığın işle söyle.",
  "{title} dersi burada biter. Kendi cümlen yanımda kalsın.",
] as const;

const JUNIOR_PARROT_FRAMES = [
  "Girişteki sahneyi aklında tut",
  "Aynı örneği yavaşça",
  "Kavramın şu cümlesini bir işe bağla",
  "Özet kartındaki şu maddeyi kendi cümlene taşı",
] as const;

function forwardCoach(input: JuniorLessonScenario): string[] {
  const title = input.title.replace(/\s+/g, " ").trim();
  const example = input.example.replace(/\s+/g, " ").trim();
  return JUNIOR_FORWARD_COACH.map((stem) => stem.replaceAll("{title}", title)).filter((line) => {
    if (example.length > 40 && line.includes(example)) {
      return false;
    }
    return !JUNIOR_PARROT_FRAMES.some((frame) => line.includes(frame));
  });
}

/** 12 SoftStage adımı → 3 evre (Giriş 0–1, Gelişme 2–8, Sonuç 9–11). */
function buildSteps(input: JuniorLessonScenario, kind: JuniorHintKind): JuniorPlayerSteps {
  const [first, second, third] = input.recap;
  const hint = `${JUNIOR_HINT_BOX[kind].spoken} ${wholeSentences(input.warning, 160)}`;
  return [
    wholeSentences(input.welcome, 180),
    wholeSentences(input.life, 180),
    wholeSentences(bindJuniorTeacherCue(JUNIOR_TEACHER_CUES[0], input.concept), 180),
    wholeSentences(second, 180),
    "Hadi şimdi ekrandaki çizime birlikte bakalım!",
    wholeSentences(input.example, 180),
    "Örnek yerine oturdu; dikkat noktasına geçiyoruz.",
    hint,
    "Gelişme bitti; özet kartına geliyoruz.",
    `${JUNIOR_RECAP_TITLE} ${wholeSentences(first, 160)}`,
    `${JUNIOR_RECAP_TITLE} ${wholeSentences(second, 160)}`,
    `${JUNIOR_RECAP_TITLE} ${wholeSentences(third, 160)}`,
  ];
}

export function juniorLessonFromScenario(input: JuniorLessonScenario): JuniorLessonScript {
  const closing = seal(input.conceptSeal, input.voiceSeal);
  const kind = input.hint ?? "trap";
  const warning = input.warning.trim();
  assertJuniorHintVoice(warning);
  const welcome = sealJuniorTeacherIntro(
    sealJuniorWarmWelcome(input.welcome.trim(), input.key),
    input.key,
  );
  const important = JUNIOR_TEACHER_CUES[0];
  const keep = JUNIOR_TEACHER_CUES[1];
  const concept = bindJuniorTeacherCue(important, input.concept.trim());
  const recapBlock = `${JUNIOR_RECAP_TITLE} ${input.recap
    .map((line, index) => `${index + 1}. ${index === 0 ? bindJuniorTeacherCue(keep, line.trim()) : line.trim()}`)
    .join(" ")}`;
  const draw = "Hadi şimdi ekrandaki çizime birlikte bakalım!";
  const life = input.life.trim();
  // listenText (kaset) ile mebNote aynı cümle sırasını taşır — cue haritası birebir kalsın.
  // Üç evre: Giriş (welcome + life) → Gelişme (concept → örnek → uyarı) → Sonuç (özet).
  const hintBlock = `${juniorHintCue(kind)} ${warning}`;
  const prompt =
    input.echoPrompt?.trim() || "Şimdi bunu kendi cümlenle tek bir cümleyle söyle.";
  const base = [welcome, life, concept, draw, input.example.trim(), hintBlock, recapBlock, prompt];
  const steps = buildSteps({ ...input, welcome }, kind);
  // Taslak bant şişmez. Çekirdek bant, örneği ikinci kez okumadan ileri adımla dolar.
  const pool = input.band === "draft" ? [] : forwardCoach(input);
  const extras: string[] = [];
  const compose = () => `${[...base, ...extras].join("\n\n")}\n\n${closing}`;
  let mebNote = compose();
  while (spokenMs(mebNote, life) < JUNIOR_NARRATION_AIM_MS && extras.length < pool.length) {
    const next = pool[extras.length];
    if (!next) {
      break;
    }
    extras.push(next);
    mebNote = compose();
    if (spokenMs(mebNote, life) > JUNIOR_NARRATION_MAX_MS) {
      extras.pop();
      mebNote = compose();
      break;
    }
  }
  const durationMs = spokenMs(mebNote, life);
  if (input.band === "draft") {
    if (durationMs > JUNIOR_NARRATION_MAX_MS) {
      const minutes = (durationMs / 60000).toFixed(2);
      throw new Error(`${input.key} taslak anlatımı ${minutes} dk. Tavan 12 dakika.`);
    }
  } else if (durationMs < JUNIOR_NARRATION_MIN_MS || durationMs > JUNIOR_NARRATION_MAX_MS) {
    const minutes = (durationMs / 60000).toFixed(2);
    throw new Error(`${input.key} anlatımı ${minutes} dk. Bant 5 ile 12 dakika. Hedef 7 ile 8 dakika.`);
  }
  const listenText = [
    welcome,
    life,
    concept,
    draw,
    input.example.trim(),
    juniorHintCue(kind),
    warning,
    recapBlock,
    prompt,
    ...extras,
    closing,
  ].join(" ");
  assertJuniorHintVoice(listenText);
  assertJuniorHintVoice(mebNote);
  if (/sevgili çocuklar/iu.test(listenText) || /sevgili çocuklar/iu.test(mebNote)) {
    throw new Error(`${input.key} çoğul hitap taşıyor.`);
  }
  if (listenText.includes("yüksek sesle say") || mebNote.includes("yüksek sesle say")) {
    throw new Error(`${input.key} konu dışı süre dolgusu taşıyor.`);
  }
  for (const frame of JUNIOR_PARROT_FRAMES) {
    if (listenText.includes(frame) || mebNote.includes(frame)) {
      throw new Error(`${input.key} kalıp tekrar taşıyor.`);
    }
  }
  const exampleOnce = input.example.replace(/\s+/g, " ").trim();
  if (exampleOnce.length > 40) {
    for (const line of extras) {
      if (line.includes(exampleOnce)) {
        throw new Error(`${input.key} örneği ikinci kez okunuyor.`);
      }
    }
  }
  if (steps.length !== JUNIOR_VECTOR_STEP_COUNT) {
    throw new Error(`${input.key} adım sayısı ${JUNIOR_VECTOR_STEP_COUNT} olmalı.`);
  }
  return {
    key: input.key,
    title: input.title,
    teaser: input.teaser,
    listenText,
    outcomes: input.outcomes,
    scene: input.scene,
    steps,
    mebNote,
    lifeUse: input.life,
    parentNote: input.parentNote,
  };
}
