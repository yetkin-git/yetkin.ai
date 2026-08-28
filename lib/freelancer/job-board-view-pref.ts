export const JOB_BOARD_VIEW_STORAGE_KEY = "yetkin.freelancer.jobBoardView.v1" as const;

export type JobBoardViewMode = "grid" | "list";

export const JOB_BOARD_DEFAULT_VIEW: JobBoardViewMode = "grid";

export function parseJobBoardViewMode(raw: string | null | undefined): JobBoardViewMode {
  return raw === "list" ? "list" : "grid";
}

function readRawFromStorage(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(JOB_BOARD_VIEW_STORAGE_KEY);
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();
let windowBound = false;
let sessionView: JobBoardViewMode | null = null;

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function onStorage(event: StorageEvent): void {
  if (event.key !== JOB_BOARD_VIEW_STORAGE_KEY && event.key !== null) {
    return;
  }
  sessionView = parseJobBoardViewMode(
    event.key === null ? readRawFromStorage() : event.newValue,
  );
  emit();
}

/** useSyncExternalStore — localStorage aynı sekmede persist + çapraz sekme. */
export function subscribeJobBoardView(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  if (typeof window !== "undefined" && !windowBound) {
    window.addEventListener("storage", onStorage);
    windowBound = true;
  }
  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0 && typeof window !== "undefined" && windowBound) {
      window.removeEventListener("storage", onStorage);
      windowBound = false;
    }
  };
}

export function getJobBoardViewClientSnapshot(): JobBoardViewMode {
  return sessionView ?? parseJobBoardViewMode(readRawFromStorage());
}

export function getJobBoardViewServerSnapshot(): JobBoardViewMode {
  return JOB_BOARD_DEFAULT_VIEW;
}

export function writeJobBoardViewToStorage(view: JobBoardViewMode): void {
  const next = parseJobBoardViewMode(view);
  sessionView = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(JOB_BOARD_VIEW_STORAGE_KEY, next);
    } catch {
      /* kota / gizli tarama — tercih oturumda kalır */
    }
  }
  emit();
}
