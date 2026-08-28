import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  INITIAL_NAV_HISTORY,
  NAV_HISTORY_STATE_KEY,
  NAV_HISTORY_STORAGE_KEY,
  applyNavHistoryPush,
  applyNavHistoryTraverse,
  asNavigationLike,
  hydrateNavHistorySnapshot,
  indexOfNavigationEntry,
  mergeNavHistoryStamp,
  navHistoryFlags,
  parseStoredNavHistorySnapshot,
  readNavHistoryStamp,
  readNavigationSnapshot,
} from "@/lib/ui/nav-history";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("üst şerit geçmiş okları", () => {
  it("ilk girişte her iki ok da pasiftir; oda/kurs itişinde geri açılır", () => {
    expect(navHistoryFlags(INITIAL_NAV_HISTORY)).toEqual({
      canGoBack: false,
      canGoForward: false,
    });
    const afterCourse = applyNavHistoryPush(INITIAL_NAV_HISTORY);
    expect(afterCourse).toEqual({ index: 1, length: 2 });
    expect(navHistoryFlags(afterCourse)).toEqual({ canGoBack: true, canGoForward: false });
  });

  it("geri gezintisi ileri yığını korur; ortadan yeni itiş ileri yığını keser", () => {
    const deep = applyNavHistoryPush(applyNavHistoryPush(INITIAL_NAV_HISTORY));
    expect(deep).toEqual({ index: 2, length: 3 });
    const backOnce = applyNavHistoryTraverse(deep, 1);
    expect(navHistoryFlags(backOnce)).toEqual({ canGoBack: true, canGoForward: true });
    const atStart = applyNavHistoryTraverse(backOnce, 0);
    expect(navHistoryFlags(atStart)).toEqual({ canGoBack: false, canGoForward: true });
    const branched = applyNavHistoryPush(atStart);
    expect(branched).toEqual({ index: 1, length: 2 });
    expect(navHistoryFlags(branched)).toEqual({ canGoBack: true, canGoForward: false });
  });

  it("Navigation API girdilerinden aynı köken imlecini okur", () => {
    const entries = [
      { url: "https://yetkin.local/academy", key: "a", id: "a" },
      { url: "https://yetkin.local/academy/yz-icerik", key: "b", id: "b" },
    ];
    const snapshot = readNavigationSnapshot({
      currentEntry: entries[1]!,
      entries: () => entries,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    });
    expect(snapshot).toEqual({ index: 1, length: 2 });
    expect(navHistoryFlags(snapshot!)).toEqual({ canGoBack: true, canGoForward: false });
    expect(indexOfNavigationEntry(entries, entries[0]!)).toBe(0);
    expect(asNavigationLike({ entries: () => [] })).toBeNull();
  });

  it("history.state mührünü Next durumunun üzerine yazar; yenilemede uzunluğu korur", () => {
    const merged = mergeNavHistoryStamp({ next: { tree: "rsc" } }, { index: 2 });
    expect(readNavHistoryStamp(merged)).toEqual({ index: 2 });
    expect(merged).toMatchObject({ next: { tree: "rsc" }, [NAV_HISTORY_STATE_KEY]: { index: 2 } });
    expect(hydrateNavHistorySnapshot(merged, { index: 0, length: 4 })).toEqual({
      index: 2,
      length: 4,
    });
    expect(hydrateNavHistorySnapshot(null, { index: 3, length: 4 })).toEqual(INITIAL_NAV_HISTORY);
    expect(parseStoredNavHistorySnapshot('{"index":1,"length":3}')).toEqual({
      index: 1,
      length: 3,
    });
    expect(parseStoredNavHistorySnapshot("{")).toBeNull();
    expect(NAV_HISTORY_STORAGE_KEY).toBe("yetkin-rail.shell.nav-history");
  });

  it("üst şeritte breadcrumb soluna yuvarlak geri/ileri bağlar; router.back/forward kullanır", () => {
    const header = readSrc("components/shell/header-bar.tsx");
    const controls = readSrc("components/shell/nav-history-controls.tsx");
    const icons = readSrc("components/ui/icons.tsx");
    expect(header.indexOf("<NavHistoryControls")).toBeGreaterThan(-1);
    expect(header.indexOf("<NavHistoryControls")).toBeLessThan(header.indexOf("<HeaderBreadcrumb"));
    expect(controls).toContain('"use client"');
    expect(controls).toContain("useRouter");
    expect(controls).toContain("usePathname");
    expect(controls).toContain("useEffect");
    expect(controls).toContain("startTransition");
    expect(controls).toContain("persistSnapshot");
    expect(controls).not.toContain("useLayoutEffect");
    expect(controls).not.toContain("useInsertionEffect");
    expect(controls).toContain("router.back()");
    expect(controls).toContain("router.forward()");
    expect(controls).toContain('label="Geri"');
    expect(controls).toContain('label="İleri"');
    expect(controls).toContain("aria-label={label}");
    expect(controls).toContain("h-11 w-11");
    expect(controls).toContain("rounded-full");
    expect(controls).toContain("disabled:opacity-30");
    expect(controls).toContain("IconChevronLeft");
    expect(controls).toContain("IconChevronRight");
    expect(controls).not.toContain("history.back");
    expect(controls).not.toContain("history.forward");
    expect(icons).toContain("export function IconChevronRight");
  });
});
