"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/cn";
import {
  applyBreadcrumbOverrides,
  breadcrumbsFromPathname,
  isAcademyCurriculumPlayerPath,
  type BreadcrumbOverride,
} from "@/lib/ui/breadcrumbs";

type BreadcrumbOverrideValue = {
  overrides: readonly BreadcrumbOverride[];
  register: (item: BreadcrumbOverride) => () => void;
};

const BreadcrumbOverrideContext = createContext<BreadcrumbOverrideValue>({
  overrides: [],
  register: () => () => undefined,
});

export function BreadcrumbOverrideProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<BreadcrumbOverride[]>([]);

  const register = useCallback((item: BreadcrumbOverride) => {
    setOverrides((current) => {
      const rest = current.filter((row) => row.href !== item.href);
      return [...rest, item];
    });
    return () => {
      setOverrides((current) => current.filter((row) => row.href !== item.href));
    };
  }, []);

  const value = useMemo(() => ({ overrides, register }), [overrides, register]);

  return (
    <BreadcrumbOverrideContext.Provider value={value}>{children}</BreadcrumbOverrideContext.Provider>
  );
}

export function BreadcrumbPageLabel({ href, label }: { href: string; label: string }) {
  const { register } = useContext(BreadcrumbOverrideContext);

  useEffect(() => {
    return register({ href, label });
  }, [href, label, register]);

  return null;
}

export function HeaderBreadcrumb() {
  const pathname = usePathname();
  const { overrides } = useContext(BreadcrumbOverrideContext);
  if (isAcademyCurriculumPlayerPath(pathname)) {
    return null;
  }
  const crumbs = applyBreadcrumbOverrides(breadcrumbsFromPathname(pathname), overrides);
  const lastIndex = crumbs.length - 1;

  return (
    <nav aria-label="Sayfa yolu" className="min-w-0 flex-1">
      <ol className="flex min-w-0 flex-nowrap items-center gap-1.5 text-sm">
        {crumbs.map((crumb, index) => {
          const last = index === lastIndex;
          return (
            <li
              key={`${crumb.href}:${index}`}
              className={cn(
                "flex min-w-0 items-center gap-1.5",
                last ? "flex-1 overflow-hidden" : "max-w-[min(42%,11rem)] sm:max-w-[16rem]",
              )}
            >
              {index > 0 ? (
                <span className="shrink-0 text-[var(--muted)]" aria-hidden>
                  /
                </span>
              ) : null}
              {last ? (
                <span
                  className="block min-w-0 truncate font-semibold tracking-tight text-[var(--foreground)]"
                  aria-current="page"
                  title={crumb.label}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="block min-w-0 truncate text-[var(--muted)] transition hover:text-[var(--safir)]"
                  title={crumb.label}
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
