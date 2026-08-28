"use client";

import { startTransition, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { IconChevronLeft, IconChevronRight } from "@/components/ui/icons";
import { cn } from "@/components/ui/cn";
import {
  INITIAL_NAV_HISTORY,
  NAV_HISTORY_STORAGE_KEY,
  applyNavHistoryPush,
  applyNavHistoryTraverse,
  asNavigationLike,
  hydrateNavHistorySnapshot,
  mergeNavHistoryStamp,
  navHistoryFlags,
  parseStoredNavHistorySnapshot,
  readNavHistoryStamp,
  readNavigationSnapshot,
  type NavHistorySnapshot,
} from "@/lib/ui/nav-history";

function persistSnapshot(snapshot: NavHistorySnapshot) {
  try {
    sessionStorage.setItem(NAV_HISTORY_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* gizli / kota */
  }
}

function readStoredSnapshot(): NavHistorySnapshot | null {
  try {
    return parseStoredNavHistorySnapshot(sessionStorage.getItem(NAV_HISTORY_STORAGE_KEY));
  } catch {
    return null;
  }
}

function stampHistory(snapshot: NavHistorySnapshot, replaceState: History["replaceState"]) {
  replaceState(mergeNavHistoryStamp(window.history.state, { index: snapshot.index }), "");
}

function readBrowserNavigation() {
  return asNavigationLike((window as Window & { navigation?: unknown }).navigation);
}

function readLiveSnapshot(): NavHistorySnapshot {
  return (
    readNavigationSnapshot(readBrowserNavigation()) ??
    hydrateNavHistorySnapshot(window.history.state, readStoredSnapshot())
  );
}

function sameSnapshot(a: NavHistorySnapshot, b: NavHistorySnapshot) {
  return a.index === b.index && a.length === b.length;
}

function HistoryButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--muted)] transition",
        "hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
        "disabled:pointer-events-none disabled:opacity-30",
      )}
    >
      {children}
    </button>
  );
}

export function NavHistoryControls() {
  const router = useRouter();
  const pathname = usePathname();
  const [snapshot, setSnapshot] = useState<NavHistorySnapshot>(INITIAL_NAV_HISTORY);
  const { canGoBack, canGoForward } = navHistoryFlags(snapshot);

  useEffect(() => {
    const next = readLiveSnapshot();
    persistSnapshot(next);
    startTransition(() => {
      setSnapshot((prev) => (sameSnapshot(prev, next) ? prev : next));
    });
  }, [pathname]);

  useEffect(() => {
    const navigation = readBrowserNavigation();
    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);
    let current = hydrateNavHistorySnapshot(window.history.state, readStoredSnapshot());
    let primed = false;
    let publishTimer: ReturnType<typeof setTimeout> | null = null;

    const publish = (next: NavHistorySnapshot) => {
      persistSnapshot(next);
      if (publishTimer !== null) {
        clearTimeout(publishTimer);
      }
      publishTimer = setTimeout(() => {
        publishTimer = null;
        startTransition(() => {
          setSnapshot((prev) => (sameSnapshot(prev, next) ? prev : next));
        });
      }, 0);
    };

    const commit = (next: NavHistorySnapshot) => {
      const changed = !primed || !sameSnapshot(current, next);
      primed = true;
      current = next;
      if (!changed) {
        return;
      }
      publish(next);
    };

    const writeStamp = () => {
      stampHistory(current, originalReplaceState);
    };

    const syncFromApi = () => readNavigationSnapshot(navigation);

    const apiStart = syncFromApi();
    if (apiStart) {
      commit(apiStart);
    } else {
      commit(current);
      writeStamp();
    }

    window.history.pushState = (data, unused, url) => {
      const before = current;
      originalPushState(data, unused, url);
      const api = syncFromApi();
      if (api && (api.index !== before.index || api.length !== before.length)) {
        commit(api);
        return;
      }
      commit(applyNavHistoryPush(before));
      writeStamp();
    };

    window.history.replaceState = (data, unused, url) => {
      originalReplaceState(data, unused, url);
      const api = syncFromApi();
      if (api) {
        commit(api);
        return;
      }
      writeStamp();
    };

    const onPopState = (event: PopStateEvent) => {
      const api = syncFromApi();
      if (api) {
        commit(api);
        return;
      }
      const stamped = readNavHistoryStamp(event.state);
      commit(applyNavHistoryTraverse(current, stamped?.index ?? null));
    };

    const onNavChange = () => {
      const api = syncFromApi();
      if (api) {
        commit(api);
      }
    };

    window.addEventListener("popstate", onPopState);
    navigation?.addEventListener("currententrychange", onNavChange);

    return () => {
      if (publishTimer !== null) {
        clearTimeout(publishTimer);
      }
      window.removeEventListener("popstate", onPopState);
      navigation?.removeEventListener("currententrychange", onNavChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  return (
    <div role="group" aria-label="Sayfa geçmişi" className="flex shrink-0 items-center gap-0.5">
      <HistoryButton
        label="Geri"
        disabled={!canGoBack}
        onClick={() => {
          if (!canGoBack) {
            return;
          }
          router.back();
        }}
      >
        <IconChevronLeft className="h-4 w-4" />
      </HistoryButton>
      <HistoryButton
        label="İleri"
        disabled={!canGoForward}
        onClick={() => {
          if (!canGoForward) {
            return;
          }
          router.forward();
        }}
      >
        <IconChevronRight className="h-4 w-4" />
      </HistoryButton>
    </div>
  );
}
