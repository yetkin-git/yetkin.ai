"use client";

import type { ComponentProps, ReactNode } from "react";
import type { Route } from "next";
import { LinkButton } from "@/components/ui/link-button";
import { trackBeginCheckout } from "@/lib/kernel/telemetry/funnel";

type BeginCheckoutLinkProps = Omit<ComponentProps<typeof LinkButton>, "href" | "onClick"> & {
  href: Route;
  itemId: string;
  itemName?: string | null;
  valueMinor?: number | null;
  currency?: string | null;
  children: ReactNode;
};

/** Satın alma bağlantısı. Tıklama `begin_checkout` basar, sonra hedefe gider. */
export function BeginCheckoutLink({
  href,
  itemId,
  itemName,
  valueMinor,
  currency,
  children,
  ...rest
}: BeginCheckoutLinkProps) {
  return (
    <LinkButton
      href={href}
      onClick={() => {
        trackBeginCheckout({ itemId, itemName, valueMinor, currency });
      }}
      {...rest}
    >
      {children}
    </LinkButton>
  );
}
