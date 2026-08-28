/** İlan bağımsız ön takım — kesin paylar FUNDED sözleşmede kilitlenir; burada yalnız hazır kıta. */

export const STANDALONE_SQUAD_STORAGE_KEY = "yetkin-rail.freelancer.standalone-squads";

export type StandaloneSquadMemberDraft = {
  /** E-posta veya kullanıcı kimliği daveti */
  invite: string;
  /** Rol etiketi (tasarımcı, backend, …) */
  role: string;
  sharePercent: number;
};

export type StandaloneSquadDraft = {
  id: string;
  name: string;
  leadSharePercent: number;
  members: StandaloneSquadMemberDraft[];
  createdAt: string;
};

const MAX_SQUADS = 20;
const MAX_PARTNERS = 11;

function isFinitePercent(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

export function parseStandaloneSquadDraft(raw: unknown): StandaloneSquadDraft | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const record = raw as Record<string, unknown>;
  if (typeof record.id !== "string" || !record.id.trim()) {
    return null;
  }
  if (typeof record.name !== "string" || !record.name.trim()) {
    return null;
  }
  if (!isFinitePercent(record.leadSharePercent)) {
    return null;
  }
  if (!Array.isArray(record.members)) {
    return null;
  }
  const members: StandaloneSquadMemberDraft[] = [];
  for (const row of record.members.slice(0, MAX_PARTNERS)) {
    if (!row || typeof row !== "object") {
      continue;
    }
    const member = row as Record<string, unknown>;
    if (typeof member.invite !== "string" || !member.invite.trim()) {
      continue;
    }
    if (!isFinitePercent(member.sharePercent)) {
      continue;
    }
    members.push({
      invite: member.invite.trim(),
      role: typeof member.role === "string" ? member.role.trim() : "",
      sharePercent: member.sharePercent,
    });
  }
  if (members.length === 0) {
    return null;
  }
  return {
    id: record.id.trim(),
    name: record.name.trim(),
    leadSharePercent: record.leadSharePercent,
    members,
    createdAt: typeof record.createdAt === "string" ? record.createdAt : new Date(0).toISOString(),
  };
}

export function parseStoredStandaloneSquads(raw: string | null): StandaloneSquadDraft[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    const out: StandaloneSquadDraft[] = [];
    for (const row of parsed) {
      const draft = parseStandaloneSquadDraft(row);
      if (draft) {
        out.push(draft);
      }
      if (out.length >= MAX_SQUADS) {
        break;
      }
    }
    return out;
  } catch {
    return [];
  }
}

export function percentToShareBps(percent: number): number {
  return Math.round(percent * 100);
}

export function shareBpsToPercent(bps: number): number {
  return Math.round((bps / 100) * 10) / 10;
}

/** UI yüzdelerinden shareBps listesi (lider + üyeler); toplam 10_000’e yuvarlanır. */
export function draftMembersToShareBps(draft: StandaloneSquadDraft): Array<{
  invite: string;
  role: string;
  shareBps: number;
}> {
  const rows = [
    { invite: "lead", role: "Lider", sharePercent: draft.leadSharePercent },
    ...draft.members,
  ];
  const mapped = rows.map((row) => ({
    invite: row.invite,
    role: row.role,
    shareBps: percentToShareBps(row.sharePercent),
  }));
  const sum = mapped.reduce((acc, row) => acc + row.shareBps, 0);
  if (sum !== 10_000 && mapped[0]) {
    mapped[0].shareBps += 10_000 - sum;
  }
  return mapped;
}

const listeners = new Set<() => void>();
let sessionCache: StandaloneSquadDraft[] | null = null;
let windowBound = false;

function readRawFromStorage(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(STANDALONE_SQUAD_STORAGE_KEY);
  } catch {
    return null;
  }
}

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

function onStorageEvent(event: StorageEvent): void {
  if (event.key !== STANDALONE_SQUAD_STORAGE_KEY && event.key !== null) {
    return;
  }
  sessionCache = parseStoredStandaloneSquads(
    event.key === null ? readRawFromStorage() : event.newValue,
  );
  emitChange();
}

export function subscribeStandaloneSquads(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  if (typeof window !== "undefined" && !windowBound) {
    window.addEventListener("storage", onStorageEvent);
    windowBound = true;
  }
  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0 && typeof window !== "undefined" && windowBound) {
      window.removeEventListener("storage", onStorageEvent);
      windowBound = false;
    }
  };
}

export function getStandaloneSquadsClientSnapshot(): StandaloneSquadDraft[] {
  if (sessionCache) {
    return sessionCache;
  }
  sessionCache = parseStoredStandaloneSquads(readRawFromStorage());
  return sessionCache;
}

export function getStandaloneSquadsServerSnapshot(): StandaloneSquadDraft[] {
  return [];
}

export function writeStandaloneSquadsToStorage(squads: StandaloneSquadDraft[]): void {
  const next = squads.slice(0, MAX_SQUADS);
  sessionCache = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STANDALONE_SQUAD_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* kota / gizli tarama — oturum belleğinde kalır */
    }
  }
  emitChange();
}

export function upsertStandaloneSquad(draft: StandaloneSquadDraft): StandaloneSquadDraft[] {
  const current = getStandaloneSquadsClientSnapshot();
  const without = current.filter((row) => row.id !== draft.id);
  const next = [draft, ...without].slice(0, MAX_SQUADS);
  writeStandaloneSquadsToStorage(next);
  return next;
}

export function removeStandaloneSquad(id: string): StandaloneSquadDraft[] {
  const next = getStandaloneSquadsClientSnapshot().filter((row) => row.id !== id);
  writeStandaloneSquadsToStorage(next);
  return next;
}

export function mintStandaloneSquadId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `squad_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
