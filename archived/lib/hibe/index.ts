export const MODULE_ID = "hibe" as const;

/** Faz 6B — katalog → profil eşleştirme → başvuru rehberi. Canlı devlet API yok. */
export const HIBE_HAPPY_PATH = ["catalog", "match", "application-guide"] as const;

export type HibeHappyPathStep = (typeof HIBE_HAPPY_PATH)[number];

export { HIBE_CATALOG_HONESTY, HIBE_MODULE_KEY } from "@/lib/hibe/types";
export { SEED_GRANT_PROGRAMS } from "@/lib/hibe/catalog";
export { DEFAULT_GRANT_MATCH_QUERY, matchGrantPrograms } from "@/lib/hibe/match";
export { buildHibePulse, openGrantApplicationGuide, searchGrantPrograms } from "@/lib/hibe/engine";
export { grantMatchInputSchema, openGrantApplicationInputSchema } from "@/lib/hibe/schemas";
export type {
  GrantApplicationRecord,
  GrantMatchQuery,
  GrantMatchResult,
  GrantProgramRecord,
  HibePulse,
  HibeStore,
} from "@/lib/hibe/types";
