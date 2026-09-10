/**
 * Mühürlü WAV parça saati — bake 3–5 sn nefes dilimlerini 0.4 sn sessizlikle dondurur.
 * Oynatıcı currentTime bu saniyelerle 1:1; kelime-oranlı duvar saati değildir.
 */

import officeAiLesson1TimingsJson from "./01_office_ai-1.json" with { type: "json" };
import officeAiLesson2TimingsJson from "./01_office_ai-2.json" with { type: "json" };
import officeAiLesson3TimingsJson from "./01_office_ai-3.json" with { type: "json" };
import officeAiLesson4TimingsJson from "./01_office_ai-4.json" with { type: "json" };
import officeAiLesson5TimingsJson from "./01_office_ai-5.json" with { type: "json" };
import officeAiLesson6TimingsJson from "./01_office_ai-6.json" with { type: "json" };
import ecommerceAiLesson1TimingsJson from "./02_ecommerce_ai-1.json" with { type: "json" };
import ecommerceAiLesson2TimingsJson from "./02_ecommerce_ai-2.json" with { type: "json" };
import ecommerceAiLesson3TimingsJson from "./02_ecommerce_ai-3.json" with { type: "json" };
import ecommerceAiLesson4TimingsJson from "./02_ecommerce_ai-4.json" with { type: "json" };
import ecommerceAiLesson5TimingsJson from "./02_ecommerce_ai-5.json" with { type: "json" };
import ecommerceAiLesson6TimingsJson from "./02_ecommerce_ai-6.json" with { type: "json" };
import socialMediaAiLesson1TimingsJson from "./03_social_media_ai-1.json" with { type: "json" };
import socialMediaAiLesson2TimingsJson from "./03_social_media_ai-2.json" with { type: "json" };
import socialMediaAiLesson3TimingsJson from "./03_social_media_ai-3.json" with { type: "json" };
import socialMediaAiLesson4TimingsJson from "./03_social_media_ai-4.json" with { type: "json" };
import socialMediaAiLesson5TimingsJson from "./03_social_media_ai-5.json" with { type: "json" };
import socialMediaAiLesson6TimingsJson from "./03_social_media_ai-6.json" with { type: "json" };
import chatbotNocodeLesson1TimingsJson from "./04_chatbot_nocode-1.json" with { type: "json" };
import chatbotNocodeLesson2TimingsJson from "./04_chatbot_nocode-2.json" with { type: "json" };
import chatbotNocodeLesson3TimingsJson from "./04_chatbot_nocode-3.json" with { type: "json" };
import chatbotNocodeLesson4TimingsJson from "./04_chatbot_nocode-4.json" with { type: "json" };
import chatbotNocodeLesson5TimingsJson from "./04_chatbot_nocode-5.json" with { type: "json" };
import chatbotNocodeLesson6TimingsJson from "./04_chatbot_nocode-6.json" with { type: "json" };
import promptPracticeLesson1TimingsJson from "./05_prompt_practice-1.json" with { type: "json" };
import promptPracticeLesson2TimingsJson from "./05_prompt_practice-2.json" with { type: "json" };
import promptPracticeLesson3TimingsJson from "./05_prompt_practice-3.json" with { type: "json" };
import promptPracticeLesson4TimingsJson from "./05_prompt_practice-4.json" with { type: "json" };
import promptPracticeLesson5TimingsJson from "./05_prompt_practice-5.json" with { type: "json" };
import promptPracticeLesson6TimingsJson from "./05_prompt_practice-6.json" with { type: "json" };

export type AcademySealedAudioPiece = {
  index: number;
  cueId: string;
  cueParagraphIndex: number;
  chunkIndex: number;
  start: number;
  end: number;
  text: string;
};

export type AcademySealedAudioTimings = {
  lessonKey: string;
  pauseSec: number;
  durationSec: number;
  cacheV: number;
  pieces: readonly AcademySealedAudioPiece[];
};

function finiteNonNeg(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

function parsePiece(raw: unknown, index: number): AcademySealedAudioPiece | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const rec = raw as Record<string, unknown>;
  const cueId = typeof rec.cueId === "string" ? rec.cueId.trim() : "";
  const cueParagraphIndex = typeof rec.cueParagraphIndex === "number" ? rec.cueParagraphIndex : index;
  const chunkIndex = typeof rec.chunkIndex === "number" ? rec.chunkIndex : 0;
  const start = finiteNonNeg(rec.start);
  const end = finiteNonNeg(rec.end);
  const text = typeof rec.text === "string" ? rec.text.replace(/\s+/gu, " ").trim() : "";
  if (!cueId || start == null || end == null || end < start) {
    return null;
  }
  const pieceIndex = typeof rec.index === "number" && Number.isInteger(rec.index) ? rec.index : index;
  return {
    index: pieceIndex,
    cueId,
    cueParagraphIndex: Number.isInteger(cueParagraphIndex) && cueParagraphIndex >= 0 ? cueParagraphIndex : 0,
    chunkIndex: Number.isInteger(chunkIndex) && chunkIndex >= 0 ? chunkIndex : 0,
    start,
    end,
    text,
  };
}

export function parseAcademySealedAudioTimings(raw: unknown): AcademySealedAudioTimings | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const rec = raw as Record<string, unknown>;
  const lessonKey = typeof rec.lessonKey === "string" ? rec.lessonKey.trim() : "";
  const pauseSec = finiteNonNeg(rec.pauseSec);
  const durationSec = finiteNonNeg(rec.durationSec);
  const cacheV = finiteNonNeg(rec.cacheV);
  if (!lessonKey || pauseSec == null || durationSec == null || cacheV == null) {
    return null;
  }
  if (!Array.isArray(rec.pieces)) {
    return null;
  }
  const pieces: AcademySealedAudioPiece[] = [];
  for (let index = 0; index < rec.pieces.length; index += 1) {
    const piece = parsePiece(rec.pieces[index], index);
    if (!piece) {
      return null;
    }
    pieces.push(piece);
  }
  return { lessonKey, pauseSec, durationSec, cacheV, pieces };
}

const TIMINGS_BY_LESSON_KEY: Readonly<Record<string, AcademySealedAudioTimings>> = {
  "01_office_ai-1": parseAcademySealedAudioTimings(officeAiLesson1TimingsJson) ?? {
    lessonKey: "01_office_ai-1",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "01_office_ai-2": parseAcademySealedAudioTimings(officeAiLesson2TimingsJson) ?? {
    lessonKey: "01_office_ai-2",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "01_office_ai-3": parseAcademySealedAudioTimings(officeAiLesson3TimingsJson) ?? {
    lessonKey: "01_office_ai-3",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "01_office_ai-4": parseAcademySealedAudioTimings(officeAiLesson4TimingsJson) ?? {
    lessonKey: "01_office_ai-4",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "01_office_ai-5": parseAcademySealedAudioTimings(officeAiLesson5TimingsJson) ?? {
    lessonKey: "01_office_ai-5",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "01_office_ai-6": parseAcademySealedAudioTimings(officeAiLesson6TimingsJson) ?? {
    lessonKey: "01_office_ai-6",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "02_ecommerce_ai-1": parseAcademySealedAudioTimings(ecommerceAiLesson1TimingsJson) ?? {
    lessonKey: "02_ecommerce_ai-1",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "02_ecommerce_ai-2": parseAcademySealedAudioTimings(ecommerceAiLesson2TimingsJson) ?? {
    lessonKey: "02_ecommerce_ai-2",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "02_ecommerce_ai-3": parseAcademySealedAudioTimings(ecommerceAiLesson3TimingsJson) ?? {
    lessonKey: "02_ecommerce_ai-3",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "02_ecommerce_ai-4": parseAcademySealedAudioTimings(ecommerceAiLesson4TimingsJson) ?? {
    lessonKey: "02_ecommerce_ai-4",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "02_ecommerce_ai-5": parseAcademySealedAudioTimings(ecommerceAiLesson5TimingsJson) ?? {
    lessonKey: "02_ecommerce_ai-5",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "02_ecommerce_ai-6": parseAcademySealedAudioTimings(ecommerceAiLesson6TimingsJson) ?? {
    lessonKey: "02_ecommerce_ai-6",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "03_social_media_ai-1": parseAcademySealedAudioTimings(socialMediaAiLesson1TimingsJson) ?? {
    lessonKey: "03_social_media_ai-1",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "03_social_media_ai-2": parseAcademySealedAudioTimings(socialMediaAiLesson2TimingsJson) ?? {
    lessonKey: "03_social_media_ai-2",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "03_social_media_ai-3": parseAcademySealedAudioTimings(socialMediaAiLesson3TimingsJson) ?? {
    lessonKey: "03_social_media_ai-3",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "03_social_media_ai-4": parseAcademySealedAudioTimings(socialMediaAiLesson4TimingsJson) ?? {
    lessonKey: "03_social_media_ai-4",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "03_social_media_ai-5": parseAcademySealedAudioTimings(socialMediaAiLesson5TimingsJson) ?? {
    lessonKey: "03_social_media_ai-5",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "03_social_media_ai-6": parseAcademySealedAudioTimings(socialMediaAiLesson6TimingsJson) ?? {
    lessonKey: "03_social_media_ai-6",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "04_chatbot_nocode-1": parseAcademySealedAudioTimings(chatbotNocodeLesson1TimingsJson) ?? {
    lessonKey: "04_chatbot_nocode-1",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "04_chatbot_nocode-2": parseAcademySealedAudioTimings(chatbotNocodeLesson2TimingsJson) ?? {
    lessonKey: "04_chatbot_nocode-2",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "04_chatbot_nocode-3": parseAcademySealedAudioTimings(chatbotNocodeLesson3TimingsJson) ?? {
    lessonKey: "04_chatbot_nocode-3",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "04_chatbot_nocode-4": parseAcademySealedAudioTimings(chatbotNocodeLesson4TimingsJson) ?? {
    lessonKey: "04_chatbot_nocode-4",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "04_chatbot_nocode-5": parseAcademySealedAudioTimings(chatbotNocodeLesson5TimingsJson) ?? {
    lessonKey: "04_chatbot_nocode-5",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "04_chatbot_nocode-6": parseAcademySealedAudioTimings(chatbotNocodeLesson6TimingsJson) ?? {
    lessonKey: "04_chatbot_nocode-6",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "05_prompt_practice-1": parseAcademySealedAudioTimings(promptPracticeLesson1TimingsJson) ?? {
    lessonKey: "05_prompt_practice-1",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "05_prompt_practice-2": parseAcademySealedAudioTimings(promptPracticeLesson2TimingsJson) ?? {
    lessonKey: "05_prompt_practice-2",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "05_prompt_practice-3": parseAcademySealedAudioTimings(promptPracticeLesson3TimingsJson) ?? {
    lessonKey: "05_prompt_practice-3",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "05_prompt_practice-4": parseAcademySealedAudioTimings(promptPracticeLesson4TimingsJson) ?? {
    lessonKey: "05_prompt_practice-4",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "05_prompt_practice-5": parseAcademySealedAudioTimings(promptPracticeLesson5TimingsJson) ?? {
    lessonKey: "05_prompt_practice-5",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
  "05_prompt_practice-6": parseAcademySealedAudioTimings(promptPracticeLesson6TimingsJson) ?? {
    lessonKey: "05_prompt_practice-6",
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [],
  },
};

export function loadAcademySealedAudioTimings(lessonKey: string): AcademySealedAudioTimings | null {
  const row = TIMINGS_BY_LESSON_KEY[lessonKey.trim()];
  if (!row || row.pieces.length === 0 || !(row.durationSec > 0)) {
    return null;
  }
  return row;
}

export function academySealedAudioParagraphCount(
  cues: readonly { paragraphs?: readonly string[] }[],
): number {
  return cues.reduce((sum, cue) => sum + (cue.paragraphs?.length ?? 0), 0);
}

export function applyAcademySealedAudioTimingsToCues<T extends { id: string; start: number; end: number }>(
  cues: readonly T[],
  timings: AcademySealedAudioTimings | null,
): readonly T[] {
  if (!timings || timings.pieces.length === 0) {
    return cues;
  }
  return cues.map((cue) => {
    const group = timings.pieces.filter((piece) => piece.cueId === cue.id);
    if (group.length === 0) {
      return cue;
    }
    const start = group[0]!.start;
    const end = group[group.length - 1]!.end;
    return { ...cue, start, end };
  });
}
