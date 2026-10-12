/**
 * Mikro-adım izi.
 * JuniorProgress kazanım satırıdır; defter ve ses oraya yazılmaz.
 * Tamamlanan adım bu yerel izde yeşil onay olarak durur. Ertesi gün aynı adımdan açılır.
 * Young bandı aynı biçimi `yetkin.young.micro.v1` anahtarında tutar.
 */

export type MicroLessonBand = "junior" | "young";

export type MicroProgressRecord = {
  completed: number[];
  holding: number | null;
};

const EMPTY: MicroProgressRecord = { completed: [], holding: null };

export function microProgressStorageKey(
  band: MicroLessonBand,
  profileId: string,
  lessonKey: string,
): string {
  const profile = profileId.trim() || "anon";
  const lesson = lessonKey.trim() || "ders";
  return `yetkin.${band}.micro.v1:${profile}:${lesson}`;
}

function storageOrNull(): Pick<Storage, "getItem" | "setItem"> | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function parseRecord(raw: string | null): MicroProgressRecord {
  if (!raw) {
    return { completed: [], holding: null };
  }
  try {
    const value = JSON.parse(raw) as Partial<MicroProgressRecord>;
    const completed = Array.isArray(value.completed)
      ? [...new Set(value.completed.filter((index) => Number.isInteger(index) && index >= 0))]
      : [];
    const holding =
      typeof value.holding === "number" && Number.isInteger(value.holding) && value.holding >= 0
        ? value.holding
        : null;
    return { completed, holding };
  } catch {
    return { completed: [], holding: null };
  }
}

export function readMicroProgress(
  band: MicroLessonBand,
  profileId: string,
  lessonKey: string,
  storage: Pick<Storage, "getItem"> | null = storageOrNull(),
): MicroProgressRecord {
  if (!storage) {
    return { ...EMPTY, completed: [] };
  }
  return parseRecord(storage.getItem(microProgressStorageKey(band, profileId, lessonKey)));
}

export function writeMicroProgress(
  band: MicroLessonBand,
  profileId: string,
  lessonKey: string,
  record: MicroProgressRecord,
  storage: Pick<Storage, "setItem"> | null = storageOrNull(),
): void {
  if (!storage) {
    return;
  }
  try {
    storage.setItem(
      microProgressStorageKey(band, profileId, lessonKey),
      JSON.stringify({ completed: record.completed, holding: record.holding }),
    );
  } catch {
    /* gizli pencere veya dolu disk izi düşürmez */
  }
}

export function holdMicroStep(record: MicroProgressRecord, stepIndex: number): MicroProgressRecord {
  if (record.completed.includes(stepIndex)) {
    return record;
  }
  return { completed: record.completed, holding: stepIndex };
}

export function completeMicroStep(record: MicroProgressRecord, stepIndex: number): MicroProgressRecord {
  const completed = record.completed.includes(stepIndex)
    ? record.completed
    : [...record.completed, stepIndex].sort((left, right) => left - right);
  return {
    completed,
    holding: record.holding === stepIndex ? null : record.holding,
  };
}

/** İlk tamamlanmamış adım. Hepsi bittiyse başa dönülmez; `done` işaretlenir. */
export function resumeCursor(
  record: MicroProgressRecord,
  stepCount: number,
): { stepIndex: number; holding: boolean; done: boolean } {
  const count = Math.max(1, stepCount);
  if (record.holding != null && record.holding < count && !record.completed.includes(record.holding)) {
    return { stepIndex: record.holding, holding: true, done: false };
  }
  for (let index = 0; index < count; index += 1) {
    if (!record.completed.includes(index)) {
      return { stepIndex: index, holding: false, done: false };
    }
  }
  return { stepIndex: 0, holding: false, done: true };
}
