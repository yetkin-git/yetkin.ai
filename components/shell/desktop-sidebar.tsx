"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { SidebarNav } from "@/components/shell/sidebar-nav";
import { IconChevronLeft } from "@/components/ui/icons";
import { BrandIcon } from "@/components/ui/brand-icon";
import { cn } from "@/components/ui/cn";
import { YETKIN_BRAND, YETKIN_SHELL_TAGLINE } from "@/lib/copy/brand";
import {
  SIDEBAR_WIDTH_DEFAULT,
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_MIN,
  SIDEBAR_WIDTH_STEP,
  getSidebarLayoutClientSnapshot,
  getSidebarLayoutServerSnapshot,
  layoutFromDragX,
  nudgeSidebarWidth,
  resolveSidebarDisplayWidth,
  subscribeSidebarLayout,
  writeSidebarLayoutToStorage,
  type SidebarLayout,
} from "@/lib/ui/sidebar-layout";

type SidebarLayoutApi = {
  layout: SidebarLayout;
  displayWidth: number;
  dragging: boolean;
  beginResize: () => void;
  setDraft: (next: SidebarLayout) => void;
  commit: (next: SidebarLayout) => void;
  cancelResize: () => void;
};

const SidebarLayoutContext = createContext<SidebarLayoutApi | null>(null);

export function SidebarLayoutProvider({ children }: { children: ReactNode }) {
  const stored = useSyncExternalStore(
    subscribeSidebarLayout,
    getSidebarLayoutClientSnapshot,
    getSidebarLayoutServerSnapshot,
  );
  const [draft, setDraftState] = useState<SidebarLayout | null>(null);
  const [dragging, setDragging] = useState(false);
  const layout = draft ?? stored;
  const displayWidth = resolveSidebarDisplayWidth(layout);

  const commit = useCallback((next: SidebarLayout) => {
    writeSidebarLayoutToStorage(next);
    setDraftState(null);
    setDragging(false);
  }, []);

  const setDraft = useCallback((next: SidebarLayout) => {
    setDraftState(next);
  }, []);

  const beginResize = useCallback(() => {
    setDragging(true);
  }, []);

  const cancelResize = useCallback(() => {
    setDraftState(null);
    setDragging(false);
  }, []);

  useEffect(() => {
    if (!dragging) {
      return;
    }
    const previousCursor = document.body.style.cursor;
    const previousSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousSelect;
    };
  }, [dragging]);

  const value = useMemo(
    () => ({
      layout,
      displayWidth,
      dragging,
      beginResize,
      setDraft,
      commit,
      cancelResize,
    }),
    [layout, displayWidth, dragging, beginResize, setDraft, commit, cancelResize],
  );

  return <SidebarLayoutContext.Provider value={value}>{children}</SidebarLayoutContext.Provider>;
}

function useSidebarLayoutApi(): SidebarLayoutApi {
  const context = useContext(SidebarLayoutContext);
  if (!context) {
    throw new Error("SidebarLayoutProvider missing");
  }
  return context;
}

function BrandMark({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      href="/dashboard"
      title={collapsed ? YETKIN_BRAND : undefined}
      className={cn(
        "flex min-w-0 items-center py-0.5",
        collapsed ? "justify-center px-0" : "gap-2.5 px-1",
      )}
    >
      <BrandIcon className={cn("shrink-0", collapsed ? "h-10 w-10" : "h-8 w-8")} />
      <span className={cn("min-w-0", collapsed && "sr-only")}>
        <span className="block truncate text-sm font-semibold leading-snug tracking-tight text-white">
          {YETKIN_BRAND}
        </span>
        <span className="mt-0.5 block truncate text-[11px] leading-snug text-white/40">
          {YETKIN_SHELL_TAGLINE}
        </span>
      </span>
    </Link>
  );
}

function SidebarResizeHandle() {
  const { layout, displayWidth, dragging, beginResize, setDraft, commit, cancelResize } =
    useSidebarLayoutApi();
  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  const originRef = useRef(layout);
  const movedRef = useRef(false);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    movedRef.current = false;
    originRef.current = layoutRef.current;
    event.currentTarget.setPointerCapture(event.pointerId);
    beginResize();
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }
    movedRef.current = true;
    setDraft(layoutFromDragX(event.clientX, originRef.current));
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (movedRef.current) {
      commit(layoutFromDragX(event.clientX, originRef.current));
      return;
    }
    cancelResize();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      commit(nudgeSidebarWidth(layoutRef.current, -SIDEBAR_WIDTH_STEP));
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      commit(nudgeSidebarWidth(layoutRef.current, SIDEBAR_WIDTH_STEP));
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      commit({ width: SIDEBAR_WIDTH_MIN, collapsed: false });
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      commit({ width: SIDEBAR_WIDTH_MAX, collapsed: false });
    }
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Menü genişliğini ayarla"
      aria-valuemin={SIDEBAR_WIDTH_MIN}
      aria-valuemax={SIDEBAR_WIDTH_MAX}
      aria-valuenow={displayWidth}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={() => commit({ width: SIDEBAR_WIDTH_DEFAULT, collapsed: false })}
      onKeyDown={onKeyDown}
      className={cn(
        "group absolute inset-y-0 right-0 z-10 w-2 cursor-col-resize touch-none outline-none",
        dragging && "bg-[var(--safir)]/25",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 w-px bg-white/0 transition-colors",
          "group-hover:bg-white/35 group-focus-visible:bg-[var(--safir)]",
          dragging && "bg-[var(--safir)]",
        )}
      />
    </div>
  );
}

export function DesktopSidebar() {
  const { layout, displayWidth, dragging, commit } = useSidebarLayoutApi();

  return (
    <aside
      data-sidebar-collapsed={layout.collapsed ? "true" : "false"}
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden flex-col overflow-hidden border-r border-white/5 bg-[var(--surface-ink)] lg:flex",
        !dragging && "transition-[width] duration-200 ease-out",
      )}
      style={{ width: displayWidth }}
    >
      <div className={cn("py-4", layout.collapsed ? "px-2" : "px-4")}>
        <BrandMark collapsed={layout.collapsed} />
      </div>
      <div className={cn("min-h-0 flex-1 overflow-y-auto pb-2", layout.collapsed ? "px-2" : "px-3")}>
        <SidebarNav collapsed={layout.collapsed} />
      </div>
      <div
        className={cn(
          "shrink-0 border-t border-white/5",
          layout.collapsed ? "px-2 py-3" : "px-3 py-3.5",
        )}
      >
        <button
          type="button"
          onClick={() => commit({ width: layout.width, collapsed: !layout.collapsed })}
          aria-pressed={layout.collapsed}
          aria-label={layout.collapsed ? "Menüyü genişlet" : "Menüyü daralt"}
          title={layout.collapsed ? "Menüyü genişlet" : "Menüyü daralt"}
          className={cn(
            "flex w-full items-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white",
            layout.collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-2.5 py-2.5",
          )}
        >
          <IconChevronLeft
            className={cn("h-4 w-4 shrink-0 transition-transform", layout.collapsed && "rotate-180")}
          />
          <span className={cn("truncate text-[13px] font-medium", layout.collapsed && "sr-only")}>
            {layout.collapsed ? "Menüyü genişlet" : "Menüyü daralt"}
          </span>
        </button>
      </div>
      <SidebarResizeHandle />
    </aside>
  );
}

export function ShellMain({ children }: { children: ReactNode }) {
  const { displayWidth, dragging } = useSidebarLayoutApi();

  return (
    <div
      className={cn(
        "relative lg:[padding-left:var(--rail-sidebar-width)]",
        !dragging && "lg:transition-[padding-left] lg:duration-200 lg:ease-out",
      )}
      style={{ "--rail-sidebar-width": `${displayWidth}px` } as CSSProperties}
    >
      {children}
    </div>
  );
}
