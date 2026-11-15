import type { ReactNode } from "react";
import { RoomFrame } from "@/components/ui/page-header";
import { StoreSubnav } from "@/components/commerce/store-subnav";

export function CommerceFrame({
  storeId,
  children,
}: {
  storeId?: string;
  children: ReactNode;
}) {
  return (
    <RoomFrame>
      {storeId ? <StoreSubnav storeId={storeId} /> : null}
      {children}
    </RoomFrame>
  );
}
