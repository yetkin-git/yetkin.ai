"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cockpitHref } from "@/components/commerce/href";
import { cn } from "@/components/ui/cn";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export function StoreSubnav({ storeId }: { storeId: string }) {
  const pathname = usePathname();
  const copy = SEN_VOICE.magazam.subnav;
  const items = [
    { href: `/magazam/${storeId}`, label: copy.home, exact: true },
    { href: `/magazam/${storeId}/urunler`, label: copy.products, exact: false },
    { href: `/magazam/${storeId}/stok`, label: copy.stock, exact: false },
    { href: `/magazam/${storeId}/kanallar`, label: copy.channels, exact: false },
    { href: `/magazam/${storeId}/lisans`, label: copy.license, exact: false },
  ];
  return (
    <nav className="flex flex-wrap gap-2" aria-label={copy.home}>
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={cockpitHref(item.href)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium",
              active
                ? "bg-[var(--safir)] text-white"
                : "bg-[var(--surface-muted)] text-[var(--foreground)] hover:bg-[var(--safir-soft)]",
            )}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
