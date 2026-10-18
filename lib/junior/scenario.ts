import {
  JUNIOR_HYBRID_OPENINGS,
  JUNIOR_HYBRID_STEP_CLOSE,
  JUNIOR_NARRATION_MAX_MS,
  JUNIOR_NARRATION_MIN_MS,
  JUNIOR_RECAP_TITLE,
  JUNIOR_TELL_CLOSE,
  assertJuniorDailySceneVariety,
  assertJuniorExampleRepeatLimit,
  assertJuniorHintVoice,
  assertJuniorNoCannedCoach,
  assertJuniorNoCliche,
  ensureJuniorHybridHint,
  juniorHintCue,
  sealJuniorWarmWelcome,
  stripJuniorCliches,
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
  /**
   * Ders Notu hero kartının pedagojik ana sorusu.
   * Sahne / cue / life cümlelerinden türetilmez; bütüncül ders sorusudur.
   */
  heroQuestion?: string;
  /** Hero kart alt bant. Odak cümlesi; geçici anlatım değildir. */
  heroFocus?: string;
  /** Üçüncü bölümün çocuk yüzü. Boşsa tuzak kutusu. */
  hint?: JuniorHintKind;
  life: string;
  /** Konu sonu özetinin üç kritik noktası. */
  recap: readonly [string, string, string];
  conceptSeal: string;
  voiceSeal: string;
  /**
   * Yıldız panelinin özgün mikro sorusu.
   * Panel bu alanı, yoksa `voiceSeal` cümlesini okur. Kaset cümlesine yazılmaz.
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
  return `${conceptSeal.trim()} ${voiceSeal.trim()} ${JUNIOR_HYBRID_STEP_CLOSE} ${JUNIOR_TELL_CLOSE}`.trim();
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
 * Yapay metin şişirme mekanizması devre dışı bırakıldı.
 * Süre, yapay dolgu cümleleriyle değil tane tane konuşma temposuyla sağlanır.
 */
function storySpine(_input: JuniorLessonScenario): string[] {
  return [];
}

const JUNIOR_PARROT_FRAMES = [
  "Girişteki sahneyi aklında tut",
  "Aynı örneği yavaşça",
  "Kavramın şu cümlesini bir işe bağla",
  "Özet kartındaki şu maddeyi kendi cümlene taşı",
] as const;

function spokenStepLines(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=\p{L}[.!?…])\s+/u)
    .map((part) => part.trim())
    .filter((part) => part.length >= 8);
}

function stepKey(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLocaleLowerCase("tr-TR");
}

function firstSpoken(text: string): string {
  return spokenStepLines(text)[0] ?? text.replace(/\s+/g, " ").trim();
}

function uniqueStepLines(text: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const line of spokenStepLines(text)) {
    const key = stepKey(line);
    if (key.length < 8 || seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(line.replace(/\s+/g, " ").trim());
  }
  return out;
}

/**
 * 12 SoftStage adımı kaset sırasındadır (Giriş 0..1 → Kavram 2..3 → Çizim 4 → Örnek 5..7 → Uyarı 8 → Özet 9..11).
 * Her adımın açılışı dinlenen metinde ileriye doğru durur; otomatik kalıp cümle yapıştırılmaz.
 */
function buildSteps(input: JuniorLessonScenario, kind: JuniorHintKind): JuniorPlayerSteps {
  const concept = input.concept.trim();
  const hintLead = juniorHintCue(kind);
  const [first, second, third] = input.recap;
  const draw = "Hadi şimdi ekrandaki çizime birlikte bakalım!";
  const recap1 = `1. ${first.trim()}`;
  const recap2 = `2. ${second.trim()}`;
  const recap3 = `3. ${third.trim()}`;
  const ordered = [
    ...spokenStepLines(input.welcome),
    ...spokenStepLines(input.life),
    ...spokenStepLines(concept),
    draw,
    ...spokenStepLines(input.example),
    ...spokenStepLines(hintLead),
    ...spokenStepLines(input.warning),
    JUNIOR_RECAP_TITLE,
    ...spokenStepLines(recap1),
    ...spokenStepLines(recap2),
    ...spokenStepLines(recap3),
  ];
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const line of ordered) {
    const key = stepKey(line);
    if (key.length < 8 || seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(line.replace(/\s+/g, " ").trim());
  }
  const cLines = uniqueStepLines(concept);
  const eLines = uniqueStepLines(input.example);
  const cMid = cLines[Math.min(cLines.length - 1, Math.max(1, Math.floor(cLines.length / 2)))] ?? cLines[0] ?? concept;
  const eSecond = eLines[Math.min(eLines.length - 1, Math.max(1, Math.floor(eLines.length / 3)))] ?? eLines[0] ?? input.example;
  const eThird =
    eLines[Math.min(eLines.length - 1, Math.max(2, Math.floor((2 * eLines.length) / 3)))] ?? eSecond;

  const targetBeats = [
    firstSpoken(input.welcome),
    firstSpoken(input.life),
    cLines[0] ?? firstSpoken(concept),
    cMid,
    draw,
    eLines[0] ?? firstSpoken(input.example),
    eSecond,
    eThird,
    firstSpoken(input.warning),
    firstSpoken(recap1),
    firstSpoken(recap2),
    firstSpoken(recap3),
  ];
  const targetKeys = new Set(targetBeats.map(stepKey));
  if (targetKeys.size < JUNIOR_VECTOR_STEP_COUNT) {
    for (const line of unique) {
      if (targetKeys.size >= JUNIOR_VECTOR_STEP_COUNT) {
        break;
      }
      targetKeys.add(stepKey(line));
    }
  }
  const merged = unique.filter((line) => targetKeys.has(stepKey(line))).slice(0, JUNIOR_VECTOR_STEP_COUNT);
  if (merged.length !== JUNIOR_VECTOR_STEP_COUNT) {
    throw new Error(`${input.key} görsel adım seçimi ${merged.length}. Kaset sırasında 12 cümle gerekir.`);
  }
  return merged.map((line) => wholeSentences(line, 220)) as unknown as JuniorPlayerSteps;
}

export function juniorLessonFromScenario(input: JuniorLessonScenario): JuniorLessonScript {
  const source: JuniorLessonScenario = {
    ...input,
    welcome: stripJuniorCliches(input.welcome),
    concept: stripJuniorCliches(input.concept),
    example: stripJuniorCliches(input.example),
    warning: stripJuniorCliches(input.warning),
    life: stripJuniorCliches(input.life),
    recap: [
      stripJuniorCliches(input.recap[0]),
      stripJuniorCliches(input.recap[1]),
      stripJuniorCliches(input.recap[2]),
    ],
    echoPrompt: input.echoPrompt ? stripJuniorCliches(input.echoPrompt) : undefined,
    outcomes: input.outcomes.map((line) => stripJuniorCliches(line)),
  };
  const closing = seal(stripJuniorCliches(source.conceptSeal), stripJuniorCliches(source.voiceSeal));
  const kind = source.hint ?? "trap";
  const warning = ensureJuniorHybridHint(source.warning.trim());
  assertJuniorHintVoice(warning);
  const welcome = sealJuniorTeacherIntro(
    sealJuniorWarmWelcome(source.welcome.trim(), source.key),
    source.key,
  );
  const concept = source.concept.trim();
  const recapBlock = `${JUNIOR_RECAP_TITLE} ${source.recap
    .map((line, index) => `${index + 1}. ${line.trim()}`)
    .join(" ")}`;
  const draw = "Hadi şimdi ekrandaki çizime birlikte bakalım!";
  const life = source.life.trim();
  // listenText (kaset) ile mebNote aynı cümle sırasını taşır — cue haritası birebir kalsın.
  // Üç evre: Giriş (welcome + life) → Gelişme (concept → örnek → uyarı) → Sonuç (özet + kapanış).
  const hintBlock = `${juniorHintCue(kind)} ${warning}`;
  const base = [welcome, life, concept, draw, source.example.trim(), hintBlock, recapBlock];
  const steps = buildSteps({ ...source, welcome, warning }, kind);
  const extras = storySpine(source);
  const mebNote = `${[...base, ...extras].join("\n\n")}\n\n${closing}`;
  const durationMs = spokenMs(mebNote, life);
  if (source.band === "draft") {
    if (durationMs > JUNIOR_NARRATION_MAX_MS) {
      const minutes = (durationMs / 60000).toFixed(2);
      throw new Error(`${source.key} taslak anlatımı ${minutes} dk. Tavan 12 dakika.`);
    }
  } else if (durationMs < JUNIOR_NARRATION_MIN_MS || durationMs > JUNIOR_NARRATION_MAX_MS) {
    const minutes = (durationMs / 60000).toFixed(2);
    throw new Error(`${source.key} anlatımı ${minutes} dk. Bant 3 ile 12 dakika.`);
  }
  const listenText = [
    welcome,
    life,
    concept,
    draw,
    source.example.trim(),
    juniorHintCue(kind),
    warning,
    recapBlock,
    ...extras,
    closing,
  ].join(" ");
  assertJuniorHintVoice(listenText);
  assertJuniorHintVoice(mebNote);
  assertJuniorNoCannedCoach(listenText);
  assertJuniorNoCannedCoach(mebNote);
  assertJuniorNoCliche(listenText);
  assertJuniorNoCliche(mebNote);
  assertJuniorExampleRepeatLimit(extras.join("\n"));
  try {
    assertJuniorDailySceneVariety(
      [source.welcome, source.concept, source.life, source.example].join("\n"),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "çeşitlilik";
    throw new Error(`${source.key}: ${message}`);
  }
  if (!JUNIOR_HYBRID_OPENINGS.some((opening) => listenText.startsWith(opening))) {
    throw new Error(`${source.key} topluluk açılışı yok.`);
  }
  if (
    !listenText.toLocaleLowerCase("tr-TR").includes("sevgili arkadaşım") ||
    !mebNote.toLocaleLowerCase("tr-TR").includes("sevgili arkadaşım")
  ) {
    throw new Error(`${source.key} birebir ipucu hitabı yok.`);
  }
  if (!listenText.includes(JUNIOR_HYBRID_STEP_CLOSE) || !mebNote.includes(JUNIOR_HYBRID_STEP_CLOSE)) {
    throw new Error(`${source.key} birlikte kapanış yok.`);
  }
  if (steps.some((step) => step.trim().length === 0)) {
    throw new Error(`${source.key} boş adım taşıyor.`);
  }
  if (listenText.includes("yüksek sesle say") || mebNote.includes("yüksek sesle say")) {
    throw new Error(`${source.key} konu dışı süre dolgusu taşıyor.`);
  }
  for (const frame of JUNIOR_PARROT_FRAMES) {
    if (listenText.includes(frame) || mebNote.includes(frame)) {
      throw new Error(`${source.key} kalıp tekrar taşıyor.`);
    }
  }
  const exampleOnce = source.example.replace(/\s+/g, " ").trim();
  if (exampleOnce.length > 40) {
    for (const line of extras) {
      if (line.includes(exampleOnce)) {
        throw new Error(`${source.key} örneği ikinci kez okunuyor.`);
      }
    }
  }
  if (steps.length !== JUNIOR_VECTOR_STEP_COUNT) {
    throw new Error(`${source.key} adım sayısı ${JUNIOR_VECTOR_STEP_COUNT} olmalı.`);
  }
  return {
    key: source.key,
    title: source.title,
    teaser: source.teaser,
    listenText,
    outcomes: source.outcomes,
    scene: source.scene,
    steps,
    mebNote,
    lifeUse: source.life,
    parentNote: input.parentNote,
  };
}
