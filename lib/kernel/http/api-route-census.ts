/**
 * Hop meta ile oda hop’ları tek yönlüdür: odanın saydığı her id meta’da vardır.
 * Meta’da olup oda listesinde olmayan id çekirdek hop’tur.
 * Her `app/api` fiili ya hop metasında ya da web-only sicilindedir.
 * İkisi birden aynı fiili taşıyamaz. Diskte olmayan kayıt da duramaz.
 */

import { DRON_KAYIT } from "@/lib/dronlar/kayit";
import { RAIL_V1_CORE_HOP_SENTENCE, RAIL_V1_CORE_HOPS } from "@/lib/kernel/http/v1-core-hops";
import { RAIL_V1_HOPS_META } from "@/lib/kernel/http/v1-hops-meta";
import {
  FROZEN_PRODUCT_WRITE_KEYS,
  WEB_BFF_NON_HOP_ROUTES,
  WEB_ONLY_WRITE_ROUTES,
  webOnlyRouteKey,
  type WebBffRouteRecord,
} from "@/lib/kernel/http/web-only-write-routes";

export const RAIL_V1_HOP_META_COUNT = 33;

export type ApiRouteCensusInput = {
  file: string;
  path: string;
  methods: readonly string[];
};

export type SicilAuditRow = {
  file: string;
  ruleId: "hop.sicil" | "route.census";
  spec: string;
};

export function railV1HopPublicPath(v1PathTemplate: string): string {
  return v1PathTemplate.replace(/^\/api\/v1(?=\/|$)/, "/api").replace(/\{([A-Za-z0-9_]+)\}/g, "[$1]");
}

export function findPublishedHopId(method: string, publicPath: string): string | null {
  const verb = method.toUpperCase();
  const hop = RAIL_V1_HOPS_META.find(
    (row) => row.method === verb && railV1HopPublicPath(row.v1PathTemplate) === publicPath,
  );
  return hop?.id ?? null;
}

export function auditDronHopAlignment(): SicilAuditRow[] {
  const errors: SicilAuditRow[] = [];
  const file = "lib/dronlar/kayit.ts";
  const metaIds = RAIL_V1_HOPS_META.map((hop) => hop.id);
  if (metaIds.length !== RAIL_V1_HOP_META_COUNT || new Set(metaIds).size !== metaIds.length) {
    errors.push({
      file: "lib/kernel/http/v1-hops-meta.ts",
      ruleId: "hop.sicil",
      spec: `RAIL_V1_HOPS_META ${RAIL_V1_HOP_META_COUNT} tekil kayıt bekler; bulunan ${metaIds.length}`,
    });
  }
  const metaSet = new Set<string>(metaIds);
  const roomHopOwner = new Map<string, string>();
  for (const room of DRON_KAYIT) {
    for (const hopId of room.hops) {
      const previous = roomHopOwner.get(hopId);
      if (previous) {
        errors.push({
          file,
          ruleId: "hop.sicil",
          spec: `${hopId} hem ${previous} hem ${room.id} oda listesinde`,
        });
      }
      roomHopOwner.set(hopId, room.id);
      if (!metaSet.has(hopId)) {
        errors.push({
          file,
          ruleId: "hop.sicil",
          spec: `${room.id} hop’u meta’da yok: ${hopId}`,
        });
      }
    }
  }
  const coreIds = RAIL_V1_CORE_HOPS.map((hop) => hop.id);
  if (new Set(coreIds).size !== coreIds.length) {
    errors.push({
      file: "lib/kernel/http/v1-core-hops.ts",
      ruleId: "hop.sicil",
      spec: "çekirdek hop id tekrarı",
    });
  }
  const coreSet = new Set<string>(coreIds);
  for (const hop of RAIL_V1_CORE_HOPS) {
    if (!hop.note.includes(RAIL_V1_CORE_HOP_SENTENCE)) {
      errors.push({
        file: "lib/kernel/http/v1-core-hops.ts",
        ruleId: "hop.sicil",
        spec: `${hop.id} çekirdek cümlesi yok`,
      });
    }
    if (!metaSet.has(hop.id)) {
      errors.push({
        file: "lib/kernel/http/v1-core-hops.ts",
        ruleId: "hop.sicil",
        spec: `çekirdek hop meta’da yok: ${hop.id}`,
      });
    }
  }
  for (const hopId of metaIds) {
    const inRoom = roomHopOwner.has(hopId);
    const inCore = coreSet.has(hopId);
    if (inRoom && inCore) {
      errors.push({
        file: "lib/kernel/http/v1-core-hops.ts",
        ruleId: "hop.sicil",
        spec: `${hopId} hem oda listesinde hem çekirdek hop`,
      });
    } else if (!inRoom && !inCore) {
      errors.push({
        file: "lib/kernel/http/v1-core-hops.ts",
        ruleId: "hop.sicil",
        spec: `${hopId} oda listesinde yok ve çekirdek hop diye bağlı değil`,
      });
    }
  }
  return errors;
}

function indexWebRoutes(rows: readonly WebBffRouteRecord[]): Map<string, WebBffRouteRecord[]> {
  const index = new Map<string, WebBffRouteRecord[]>();
  for (const row of rows) {
    const key = webOnlyRouteKey(row.method, row.path);
    const bucket = index.get(key);
    if (bucket) {
      bucket.push(row);
    } else {
      index.set(key, [row]);
    }
  }
  return index;
}

function auditFrozenProductWrites(): SicilAuditRow[] {
  const errors: SicilAuditRow[] = [];
  const file = "lib/kernel/http/web-only-write-routes.ts";
  for (const key of FROZEN_PRODUCT_WRITE_KEYS) {
    const space = key.indexOf(" ");
    const method = key.slice(0, space);
    const path = key.slice(space + 1);
    const row = WEB_ONLY_WRITE_ROUTES.find((item) => webOnlyRouteKey(item.method, item.path) === key);
    if (!row || row.status !== "product-write") {
      errors.push({
        file,
        ruleId: "route.census",
        spec: `${key} product-write olarak dondurulmadı`,
      });
    }
    const hopId = findPublishedHopId(method, path);
    if (hopId) {
      errors.push({
        file,
        ruleId: "route.census",
        spec: `${key} hop ${hopId} içinde; dondurma bozuldu`,
      });
    }
  }
  return errors;
}

export function auditApiRouteCensus(routes: readonly ApiRouteCensusInput[]): SicilAuditRow[] {
  const errors = [...auditDronHopAlignment(), ...auditFrozenProductWrites()];
  const webIndex = indexWebRoutes(WEB_BFF_NON_HOP_ROUTES);
  const seen = new Set<string>();
  for (const route of routes) {
    if (route.methods.length === 0) {
      errors.push({
        file: route.file,
        ruleId: "route.census",
        spec: `${route.path} HTTP fiili yok`,
      });
    }
    for (const method of route.methods) {
      const key = webOnlyRouteKey(method, route.path);
      if (seen.has(key)) {
        errors.push({
          file: route.file,
          ruleId: "route.census",
          spec: `çift fiil ${key}`,
        });
      }
      seen.add(key);
      const hopId = findPublishedHopId(method, route.path);
      const listed = webIndex.get(key) ?? [];
      if (hopId && listed.length > 0) {
        errors.push({
          file: route.file,
          ruleId: "route.census",
          spec: `${key} hem hop ${hopId} hem web-only`,
        });
      }
      if (!hopId && listed.length === 0) {
        errors.push({
          file: route.file,
          ruleId: "route.census",
          spec: `${key} sicil ve web-only listesinde yok`,
        });
      }
      if (listed.length > 1) {
        errors.push({
          file: "lib/kernel/http/web-only-write-routes.ts",
          ruleId: "route.census",
          spec: `${key} web-only listesinde tekrar`,
        });
      }
    }
  }
  for (const row of WEB_BFF_NON_HOP_ROUTES) {
    const key = webOnlyRouteKey(row.method, row.path);
    if (!seen.has(key)) {
      errors.push({
        file: "lib/kernel/http/web-only-write-routes.ts",
        ruleId: "route.census",
        spec: `${key} diskte yok`,
      });
    }
  }
  return errors;
}
