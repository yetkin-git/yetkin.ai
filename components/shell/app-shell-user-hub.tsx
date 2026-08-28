import { Suspense } from "react";
import { getSession } from "@/lib/kernel/auth/session";
import { isSuperAdminActor } from "@/lib/kernel/auth/super-admin";
import { UserHub } from "@/components/shell/user-hub";
import { HeaderWalletChip } from "@/components/shell/header-wallet-chip";
import { EMPTY_WALLET_STRIP } from "@/lib/dashboard/wallet-strip";
import { readWalletStripSnapshot } from "@/lib/dashboard/load-wallet-strip";

async function AppShellWalletChipLive() {
  const session = await getSession();
  if (!session) {
    return <HeaderWalletChip embedded strip={EMPTY_WALLET_STRIP} />;
  }
  let strip = EMPTY_WALLET_STRIP;
  try {
    strip = await readWalletStripSnapshot(session.id);
  } catch {
    strip = EMPTY_WALLET_STRIP;
  }
  return <HeaderWalletChip embedded strip={strip} />;
}

/** Oturum adası — kabuk geometrisi beklenmez; yalnız sağ küme askıya iner. */
export async function AppShellUserHub() {
  const session = await getSession();
  const signedIn = session != null;
  return (
    <UserHub
      showAdmin={session ? isSuperAdminActor(session) : false}
      userEmail={session?.email ?? null}
      walletChip={
        signedIn ? (
          <Suspense fallback={<HeaderWalletChip embedded strip={EMPTY_WALLET_STRIP} pending />}>
            <AppShellWalletChipLive />
          </Suspense>
        ) : (
          <HeaderWalletChip embedded strip={EMPTY_WALLET_STRIP} />
        )
      }
    />
  );
}
