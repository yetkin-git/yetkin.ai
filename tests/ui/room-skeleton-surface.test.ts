import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const LOADING_MAP: { file: string; needle: string }[] = [
  { file: "app/loading.tsx", needle: 'variant="public"' },
  { file: "app/(auth)/loading.tsx", needle: "AuthPageSkeleton" },
  { file: "app/(kernel)/loading.tsx", needle: 'variant="sanctuary"' },
  { file: "app/(public)/legal/loading.tsx", needle: 'variant="legal"' },
  { file: "app/dashboard/loading.tsx", needle: 'variant="cockpit"' },
  { file: "app/career/loading.tsx", needle: 'variant="hub"' },
  { file: "app/hibe/loading.tsx", needle: 'variant="metrics"' },
  { file: "app/hibe/[slug]/loading.tsx", needle: 'variant="detail"' },
  { file: "app/arena/loading.tsx", needle: 'variant="prize"' },
  { file: "app/arena/[id]/loading.tsx", needle: 'variant="detail"' },
  { file: "app/arena/yeni/loading.tsx", needle: 'variant="form"' },
  { file: "app/junior/loading.tsx", needle: 'variant="youth"' },
  { file: "app/junior/ebeveyn/loading.tsx", needle: 'variant="shield"' },
  { file: "app/social/loading.tsx", needle: 'variant="hub"' },
  { file: "app/social/[id]/loading.tsx", needle: 'variant="detail"' },
  { file: "app/kurumsal/loading.tsx", needle: 'variant="metrics"' },
  { file: "app/kurumsal/ilan/[id]/loading.tsx", needle: 'variant="detail"' },
  { file: "app/kurumsal/ilan/yeni/loading.tsx", needle: 'variant="form"' },
];

describe("RoomSkeleton CLS mührü", () => {
  it("paylaşılan RoomSkeleton varyantlıdır; client değildir", () => {
    const skeleton = readSrc("components/ui/room-skeleton.tsx");
    expect(skeleton).toContain("animate-pulse");
    expect(skeleton).toContain("RoomSkeletonVariant");
    expect(skeleton).toContain("cockpit");
    expect(skeleton).toContain("sanctuary");
    expect(skeleton).toContain("max-w-3xl");
    expect(skeleton).not.toContain("use client");
    expect(skeleton).not.toContain("yetkin.ai");
  });

  it("eksik oda ve sığınak loading.tsx haritası izomorftur", () => {
    for (const row of LOADING_MAP) {
      expect(existsSync(join(ROOT, row.file)), row.file).toBe(true);
      const source = readSrc(row.file);
      expect(source, row.file).toContain(row.needle);
      expect(source, row.file).not.toContain("use client");
    }
    expect(readSrc("app/dashboard/loading.tsx")).toContain("RoomSkeleton");
    expect(readSrc("app/career/loading.tsx")).toContain("RoomSkeleton");
    expect(LOADING_MAP).toHaveLength(18);
  });
});
