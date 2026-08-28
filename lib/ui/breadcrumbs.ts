import type { Route } from "next";
import { academyCourseTitleBySlug } from "@/lib/academy/course-titles";
import { KERNEL_SURFACES, VERTICAL_ROOMS } from "@/lib/kernel/modules";
import { FROZEN_DISK_ROOM_CATALOG } from "@/lib/kernel/compliance/circuit-breakers";
import { PAZARYERI_DISK_PATH, YETKINILAN_PATH } from "@/lib/kernel/yetkinilan";

export type BreadcrumbCrumb = {
  href: Route;
  label: string;
};

export type BreadcrumbOverride = {
  href: string;
  label: string;
};

export const BREADCRUMB_HOME_HREF = "/dashboard" as Route;
export const BREADCRUMB_HOME_LABEL = "Anasayfa";

const HOME: BreadcrumbCrumb = {
  href: BREADCRUMB_HOME_HREF,
  label: BREADCRUMB_HOME_LABEL,
};

const STATIC_SEGMENT_LABELS: Record<string, string> = {
  certificates: "Sertifikalar",
  oyna: "Müfredat",
  dogrula: "Doğrula",
  new: "İlan oluştur",
  tezgah: "Tezgâh",
  siparisler: "Siparişler",
  ebeveyn: "Ebeveyn",
  yeni: "Yeni",
};

const COLLECTION_SEGMENTS: Record<string, string> = {
  jobs: "İlan",
  contracts: "Sözleşme",
  projeler: "Proje",
  ilan: "İlan",
};

type SurfaceMatch = {
  id: string;
  href: Route;
  label: string;
};

const ROOM_SURFACES: readonly SurfaceMatch[] = [
  ...VERTICAL_ROOMS.filter((room) => room.id !== "dashboard"),
  ...FROZEN_DISK_ROOM_CATALOG,
].map((room) => ({
  id: room.id,
  href: room.path as Route,
  label: room.label,
}));

const KERNEL_MATCHES: readonly SurfaceMatch[] = KERNEL_SURFACES.map((surface) => ({
  id: surface.id,
  href: surface.path as Route,
  label: surface.label,
}));

const SURFACES_BY_HREF_LENGTH = [...ROOM_SURFACES, ...KERNEL_MATCHES].sort(
  (a, b) => b.href.length - a.href.length,
);

export function normalizeBreadcrumbPath(pathname: string | null | undefined): string {
  if (!pathname || pathname === "/") {
    return BREADCRUMB_HOME_HREF;
  }
  let path = pathname.split("?")[0]?.split("#")[0] ?? pathname;
  if (path.length > 1) {
    path = path.replace(/\/+$/, "");
  }
  if (path === PAZARYERI_DISK_PATH || path.startsWith(`${PAZARYERI_DISK_PATH}/`)) {
    return `${YETKINILAN_PATH}${path.slice(PAZARYERI_DISK_PATH.length)}`;
  }
  return path || BREADCRUMB_HOME_HREF;
}

export function breadcrumbsFromPathname(pathname: string | null | undefined): BreadcrumbCrumb[] {
  const path = normalizeBreadcrumbPath(pathname);
  if (path === BREADCRUMB_HOME_HREF) {
    return [HOME];
  }

  const surface = matchSurface(path);
  if (!surface) {
    const segs = path.split("/").filter(Boolean);
    const leaf = segs[segs.length - 1] ?? path;
    return [HOME, { href: path as Route, label: resolveSegmentLabel("kernel", leaf) }];
  }

  const roomCrumb: BreadcrumbCrumb = { href: surface.href, label: surface.label };
  if (path === surface.href) {
    return [HOME, roomCrumb];
  }

  const remaining = path.slice(surface.href.length).replace(/^\//, "");
  return [HOME, roomCrumb, ...walkRemaining(surface.href, remaining, surface.id)];
}

export function applyBreadcrumbOverrides(
  crumbs: readonly BreadcrumbCrumb[],
  overrides: readonly BreadcrumbOverride[],
): BreadcrumbCrumb[] {
  if (overrides.length === 0) {
    return [...crumbs];
  }
  const byHref = new Map(overrides.map((row) => [normalizeHref(row.href), row.label]));
  return crumbs.map((crumb) => {
    const label = byHref.get(normalizeHref(crumb.href));
    return label ? { ...crumb, label } : crumb;
  });
}

function matchSurface(path: string): SurfaceMatch | null {
  for (const surface of SURFACES_BY_HREF_LENGTH) {
    if (path === surface.href || path.startsWith(`${surface.href}/`)) {
      return surface;
    }
  }
  return null;
}

function walkRemaining(roomHref: string, remaining: string, roomId: string): BreadcrumbCrumb[] {
  const segments = remaining.split("/").filter(Boolean).map(decodeSeg);
  const crumbs: BreadcrumbCrumb[] = [];
  let href = roomHref;
  let index = 0;

  while (index < segments.length) {
    const segment = segments[index]!;
    const next = segments[index + 1];
    const collectionLabel = COLLECTION_SEGMENTS[segment];

    if (collectionLabel && next) {
      href = joinHref(href, segment, next);
      crumbs.push({
        href,
        label: STATIC_SEGMENT_LABELS[next] ?? resolveResourceLabel(roomId, next, collectionLabel),
      });
      index += 2;
      continue;
    }

    if (STATIC_SEGMENT_LABELS[segment] && next && looksLikeOpaqueId(next)) {
      href = joinHref(href, segment, next);
      crumbs.push({ href, label: STATIC_SEGMENT_LABELS[segment]! });
      index += 2;
      continue;
    }

    href = joinHref(href, segment);
    crumbs.push({
      href,
      label: resolveSegmentLabel(roomId, segment),
    });
    index += 1;
  }

  return crumbs;
}

function resolveSegmentLabel(roomId: string, segment: string): string {
  const staticLabel = STATIC_SEGMENT_LABELS[segment];
  if (staticLabel) {
    return staticLabel;
  }
  if (roomId === "academy") {
    const title = academyCourseTitleBySlug(segment);
    if (title) {
      return title;
    }
  }
  if (looksLikeOpaqueId(segment)) {
    return "Kayıt";
  }
  return humanizeSegment(segment);
}

function resolveResourceLabel(roomId: string, id: string, fallback: string): string {
  if (roomId === "academy") {
    const title = academyCourseTitleBySlug(id);
    if (title) {
      return title;
    }
  }
  return fallback;
}

export function looksLikeOpaqueId(segment: string): boolean {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(segment)) {
    return true;
  }
  if (/^[0-9a-f]{32,64}$/i.test(segment)) {
    return true;
  }
  if (/^c[a-z0-9]{24,}$/i.test(segment)) {
    return true;
  }
  return /^[a-z]{1,5}_[a-z0-9]+(?:_[a-z0-9]+)*$/i.test(segment) && !segment.includes("-");
}

function humanizeSegment(segment: string): string {
  return segment.replace(/[-_]+/g, " ").trim() || segment;
}

function decodeSeg(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function joinHref(base: string, ...parts: string[]): Route {
  const suffix = parts.filter(Boolean).join("/");
  const href = suffix ? `${base.replace(/\/+$/, "")}/${suffix}` : base;
  return href as Route;
}

function normalizeHref(href: string): string {
  const path = href.split("?")[0]?.split("#")[0] ?? href;
  if (path.length > 1) {
    return path.replace(/\/+$/, "");
  }
  return path || "/";
}
