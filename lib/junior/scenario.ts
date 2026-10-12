import {
  JUNIOR_HYBRID_OPENINGS,
  JUNIOR_HYBRID_STEP_CLOSE,
  JUNIOR_NARRATION_MAX_MS,
  JUNIOR_NARRATION_MIN_MS,
  JUNIOR_RECAP_TITLE,
  JUNIOR_TEACHER_CUES,
  JUNIOR_TELL_CLOSE,
  assertJuniorDailySceneVariety,
  assertJuniorExampleRepeatLimit,
  assertJuniorHintVoice,
  assertJuniorImperativeVariety,
  assertJuniorNoCannedCoach,
  assertJuniorNoCliche,
  bindJuniorTeacherCue,
  ensureJuniorHybridHint,
  juniorHintCue,
  juniorSentencesShareImperativeStem,
  juniorSpeechSentences,
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

/**
 * Mühürlü kaset cümlesi.
 * echoPrompt yıldız panelindedir; sese yazılmaz.
 */
function sealedCassettePrompt(_source: JuniorLessonScenario): string {
  return "Şimdi bunu kendi cümlenle tek bir cümleyle söyle.";
}

function seal(conceptSeal: string, voiceSeal: string): string {
  return `Buna Kavramsal Anlayış deriz. ${conceptSeal} Anlatışına İfade Gücü deriz. ${voiceSeal} ${JUNIOR_HYBRID_STEP_CLOSE} ${JUNIOR_TELL_CLOSE}`;
}

/** Adım metninin sonuna birlikte başarma cümlesini bir kez bağlar. */
function closeStep(text: string, max: number): string {
  const body = wholeSentences(text, max);
  if (body.includes(JUNIOR_HYBRID_STEP_CLOSE)) {
    return body;
  }
  return `${body} ${JUNIOR_HYBRID_STEP_CLOSE}`.trim();
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
 * 5 dakikanın altındaki çekirdeği, konunun kendi cümleleriyle hikâye gibi kapatır.
 * Kalem, bardak ve benzeri basmakalıp koç satırı üretmez. 7,5 dakikaya şişmez.
 */
function storySpine(input: JuniorLessonScenario): string[] {
  const title = input.title.replace(/\s+/g, " ").trim();
  const chapters = (input.outcomes.length >= 3 ? input.outcomes : input.recap)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0);
  const frames: readonly ((line: string, n: number) => string)[] = [
    (line, n) =>
      `Hikâyenin ${n}. odasında ${title} konusu şu cümleyle durur: ${line} Bir an orada kal, sonra kapıyı arala.`,
    (line, n) =>
      `${n}. odanın duvarında aynı konunun yeni bir parçası var. ${line} Bunu günlük sahnenle yan yana koy ve nefes al.`,
    (line, n) =>
      `Şimdi ${n}. adımda yürüyoruz. ${title} burada şunu söyler: ${line} Cümleyi acele etmeden bir kez daha gözünde tut.`,
    (line, n) =>
      `Öğretmenin yanındaki yerde ${n}. durak açılıyor. ${line} Bu durak yeni bir kural değildir; konunun kendi cümlesidir.`,
    (line, n) =>
      `${title} hikâyesinde ${n}. sahne sakin başlar. ${line} Sahne bitince bir sonraki cümleye geçersin, elin boş kalmaz.`,
    (line, n) =>
      `Birlikte ${n}. cümleyi hikâyenin içine oturtalım. ${line} Oturunca başını kaldır, sıradaki oda ışığını bekler.`,
    (line, n) =>
      `${n}. ışık yandığında okunan cümle budur. ${line} Işık sönmeden önce cümleyi ${title} konusuna bağla.`,
    (line, n) =>
      `Hikâye ${n}. köşeyi dönüyor. ${line} Köşe dönünce özet kartına bir adım daha yaklaşırsın.`,
    (line, n) =>
      `${title} için ${n}. hatırlatma kendi cümlesinden gelir. ${line} Hatırlatma bitince sesini alçalt, düşünmeye yer kalsın.`,
    (line, n) =>
      `Son odalardan ${n}. sırasında şunu bırakıyorum. ${line} Bırakılan cümle yarınki işin değil, bugünkü konunun parçasıdır.`,
    (line, n) =>
      `${n}. pencereden ${title} konusuna bak. ${line} Pencere kapanmadan önce cümleyi kendi günündeki bir anın yanına bırak.`,
    (line, n) =>
      `Hikâye ${n}. nefeste toparlanır. ${line} Toparlanınca özet kartındaki sırayı bozmadan ilerle.`,
  ];
  const used = new Map<string, number>();
  const numeric = new Map<string, number>();
  const lines: string[] = [];
  const numericKeys = (line: string) => {
    const folded = line.toLocaleLowerCase("tr-TR");
    return [...folded.matchAll(/(\d+)\s*üssü\s*(\d+)/gu)].map((match) => `${match[1]} üssü ${match[2]}`);
  };
  for (let index = 0; index < frames.length; index += 1) {
    let chosen: string | null = null;
    for (let hop = 0; hop < chapters.length; hop += 1) {
      const line = chapters[(index + hop) % chapters.length] ?? title;
      const count = used.get(line) ?? 0;
      if (count >= 2) {
        continue;
      }
      const keys = numericKeys(line);
      if (keys.some((key) => (numeric.get(key) ?? 0) >= 2)) {
        continue;
      }
      chosen = line;
      used.set(line, count + 1);
      for (const key of keys) {
        numeric.set(key, (numeric.get(key) ?? 0) + 1);
      }
      break;
    }
    const frame = frames[index];
    if (!chosen || !frame) {
      break;
    }
    lines.push(frame(chosen, lines.length + 1));
  }
  const bridges: readonly ((n: number) => string)[] = [
    (n) =>
      `Hikâye ${n}. kapıda durur. ${title} burada yeni bir kural açmaz; az önce kurulan resmi gözünde tutarsın.`,
    (n) =>
      `${n}. adımda sesini yavaşlat. ${title} konusunu kendi gününden bir sahneye yaslarsın ve nefes alırsın.`,
    (n) =>
      `Pencereden ${n}. kez bakmak zorunda değilsin. ${title} cümlesi zaten yerinde; sadece sırayı bozmadan ilerlersin.`,
    (n) =>
      `${title} için ${n}. ara, düşünmeye ayrılmış kısa bir boşluktur. Boşluk bitince özet kartına bir adım yaklaşırsın.`,
    (n) =>
      `Oda ışığı ${n}. kez değişmez. ${title} aynı kapıda durur; sen sadece cümleyi ağır ağır içinden geçirirsin.`,
    (n) =>
      `${n}. köşede acele yoktur. ${title} konusunun son cümlesi yaklaşırken elin boş kalmaz, kulağın açık kalır.`,
  ];
  for (const bridge of bridges) {
    lines.push(bridge(lines.length + 1));
  }
  return lines;
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

/**
 * 12 SoftStage adımı kaset sırasındadır (Giriş → Gelişme → Sonuç).
 * Kasetten kopuk köprü cümlesi adım olmaz; her adımın açılışı dinlenen metinde ileriye doğru durur.
 */
function buildSteps(input: JuniorLessonScenario, kind: JuniorHintKind): JuniorPlayerSteps {
  const concept = bindJuniorTeacherCue(JUNIOR_TEACHER_CUES[0], input.concept.trim());
  const hintLead = juniorHintCue(kind);
  const [first, second, third] = input.recap;
  const draw = "Hadi şimdi ekrandaki çizime birlikte bakalım!";
  const recap1 = `1. ${bindJuniorTeacherCue(JUNIOR_TEACHER_CUES[1], first.trim())}`;
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
  const pins = [
    firstSpoken(input.welcome),
    firstSpoken(input.life),
    firstSpoken(concept),
    draw,
    firstSpoken(input.example),
    firstSpoken(hintLead),
    firstSpoken(input.warning),
    JUNIOR_RECAP_TITLE,
    firstSpoken(recap1),
    firstSpoken(recap2),
    firstSpoken(recap3),
  ];
  const pinKeys = new Set(pins.map(stepKey));
  const conceptAt = unique.findIndex((line) => stepKey(line) === stepKey(firstSpoken(concept)));
  const recapAt = unique.findIndex((line) => stepKey(line) === stepKey(JUNIOR_RECAP_TITLE));
  const pinned = unique.filter((line) => pinKeys.has(stepKey(line)));
  const middle = unique.filter(
    (line, index) => index > conceptAt && recapAt >= 0 && index < recapAt && !pinKeys.has(stepKey(line)),
  );
  const need = 12 - pinned.length;
  const extras: string[] = [];
  if (need > 0) {
    const pool = middle.length > 0 ? middle : unique.filter((line) => !pinKeys.has(stepKey(line)));
    for (const line of pool) {
      if (extras.length >= need) {
        break;
      }
      extras.push(line);
    }
  }
  const chosen = new Set([...pinned, ...extras].map(stepKey));
  const merged = unique.filter((line) => chosen.has(stepKey(line))).slice(0, 12);
  if (merged.length !== JUNIOR_VECTOR_STEP_COUNT) {
    throw new Error(`${input.key} görsel adım seçimi ${merged.length}. Kaset sırasında 12 cümle gerekir.`);
  }
  return merged.map((line) => closeStep(line, 220)) as unknown as JuniorPlayerSteps;
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
  const important = JUNIOR_TEACHER_CUES[0];
  const keep = JUNIOR_TEACHER_CUES[1];
  const concept = bindJuniorTeacherCue(important, source.concept.trim());
  const recapBlock = `${JUNIOR_RECAP_TITLE} ${source.recap
    .map((line, index) => `${index + 1}. ${index === 0 ? bindJuniorTeacherCue(keep, line.trim()) : line.trim()}`)
    .join(" ")}`;
  const draw = "Hadi şimdi ekrandaki çizime birlikte bakalım!";
  const life = source.life.trim();
  // listenText (kaset) ile mebNote aynı cümle sırasını taşır — cue haritası birebir kalsın.
  // Üç evre: Giriş (welcome + life) → Gelişme (concept → örnek → uyarı) → Sonuç (özet).
  const hintBlock = `${juniorHintCue(kind)} ${warning}`;
  const prompt = sealedCassettePrompt(source);
  const base = [welcome, life, concept, draw, source.example.trim(), hintBlock, recapBlock, prompt];
  const steps = buildSteps({ ...source, welcome, warning }, kind);
  // Taslak bant şişmez. Çekirdek 5 dakikanın altındaysa konunun kendi cümlesi hikâye gibi eklenir.
  // Hedef 7,5 dakika koç kalıbıyla doldurulmaz. Aynı cümle omurgada en fazla iki kez durur.
  const pool = source.band === "draft" ? [] : storySpine(source);
  const extras: string[] = [];
  const compose = () => `${[...base, ...extras].join("\n\n")}\n\n${closing}`;
  let mebNote = compose();
  let spineCursor = 0;
  let previousSentence = juniorSpeechSentences(prompt).at(-1) ?? prompt;
  while (spokenMs(mebNote, life) < JUNIOR_NARRATION_MIN_MS && spineCursor < pool.length) {
    const next = pool[spineCursor];
    spineCursor += 1;
    if (!next) {
      break;
    }
    const sentences = juniorSpeechSentences(next);
    const clashes = sentences.some((sentence, index) => {
      const prior = index === 0 ? previousSentence : (sentences[index - 1] ?? previousSentence);
      return juniorSentencesShareImperativeStem(prior, sentence);
    });
    if (clashes) {
      continue;
    }
    extras.push(next);
    previousSentence = sentences.at(-1) ?? previousSentence;
    mebNote = compose();
    if (spokenMs(mebNote, life) > JUNIOR_NARRATION_MAX_MS) {
      extras.pop();
      mebNote = compose();
      break;
    }
  }
  const spineSentences = extras.flatMap((line) => juniorSpeechSentences(line));
  if (spineSentences.length > 0) {
    assertJuniorImperativeVariety([prompt, ...spineSentences]);
  }
  const durationMs = spokenMs(mebNote, life);
  if (source.band === "draft") {
    if (durationMs > JUNIOR_NARRATION_MAX_MS) {
      const minutes = (durationMs / 60000).toFixed(2);
      throw new Error(`${source.key} taslak anlatımı ${minutes} dk. Tavan 12 dakika.`);
    }
  } else if (durationMs < JUNIOR_NARRATION_MIN_MS || durationMs > JUNIOR_NARRATION_MAX_MS) {
    const minutes = (durationMs / 60000).toFixed(2);
    throw new Error(`${source.key} anlatımı ${minutes} dk. Bant 5 ile 12 dakika. Hedef 7 ile 8 dakika.`);
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
    prompt,
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
  if (steps.some((step) => !step.endsWith(JUNIOR_HYBRID_STEP_CLOSE))) {
    throw new Error(`${source.key} adım kapanışı eksik.`);
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
