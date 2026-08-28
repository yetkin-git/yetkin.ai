import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { toAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";
import { EMPTY_WALLET_STRIP, type WalletStripSnapshot } from "@/lib/dashboard/wallet-strip";
import { createPrismaStudioPorts } from "@/lib/studio/runtime";
import { createCitizenStorageGateway } from "@/lib/studio/citizen-storage";
import { locatorFromStudioAsset } from "@/lib/studio/storage";
import {
  STUDIO_GENERATION_UNIT_KEY,
  STUDIO_IMAGE_UNIT_KEY,
  STUDIO_MODULE_KEY,
  type StudioDigitalAssetRecord,
  type StudioDraftRecord,
  type StudioGenerationRecord,
} from "@/lib/studio/types";

export type StudioBoard = {
  drafts: StudioDraftRecord[];
  generations: StudioGenerationRecord[];
  assets: StudioDigitalAssetRecord[];
};

export type StudioCitizenDesk = {
  strip: WalletStripSnapshot;
  textFloorMinor: AmountMinor | null;
  imageFloorMinor: AmountMinor | null;
};

export async function loadStudioBoard(
  userId: string,
  accessToken?: string | null,
): Promise<StudioBoard | null> {
  try {
    const ports = createPrismaStudioPorts();
    const [drafts, generations, assets] = await Promise.all([
      ports.studio.listDraftsForUser(userId),
      ports.studio.listGenerationsForUser(userId),
      ports.studio.listDigitalAssetsForUser(userId),
    ]);
    return {
      drafts,
      generations,
      assets: await attachStudioAssetPreviews(assets, accessToken),
    };
  } catch {
    return null;
  }
}

async function attachStudioAssetPreviews(
  assets: StudioDigitalAssetRecord[],
  accessToken?: string | null,
): Promise<StudioDigitalAssetRecord[]> {
  if (!accessToken) {
    return assets;
  }
  let gateway: ReturnType<typeof createCitizenStorageGateway>;
  try {
    gateway = createCitizenStorageGateway(accessToken);
  } catch {
    return assets;
  }
  return Promise.all(
    assets.map(async (asset) => {
      const locator = locatorFromStudioAsset(asset);
      if (locator?.kind !== "object-store") {
        return asset;
      }
      try {
        const previewUrl = await gateway.createSignedReadUrl(locator.path);
        return { ...asset, previewUrl };
      } catch {
        return asset;
      }
    }),
  );
}

/**
 * Üretim öncesi bakiye + katalog tabanı. lockWallet yok — okuma cüzdan satırı yaratmaz.
 */
export async function loadStudioCitizenDesk(userId: string): Promise<StudioCitizenDesk> {
  let strip: WalletStripSnapshot = EMPTY_WALLET_STRIP;
  let textFloorMinor: AmountMinor | null = null;
  let imageFloorMinor: AmountMinor | null = null;

  try {
    const prisma = getPrisma();
    const wallet = await prisma.wallet.findUnique({
      where: { userId_currencyCode: { userId, currencyCode: SETTLEMENT_CURRENCY } },
    });
    strip = {
      live: true,
      amountMinor: toAmountMinor(wallet?.amountMinor ?? 0),
      currencyCode: SETTLEMENT_CURRENCY,
    };
  } catch {
    strip = EMPTY_WALLET_STRIP;
  }

  try {
    const catalog = createPrismaPriceCatalogStore();
    const [text, image] = await Promise.all([
      catalog.findActiveEntry(STUDIO_MODULE_KEY, STUDIO_GENERATION_UNIT_KEY),
      catalog.findActiveEntry(STUDIO_MODULE_KEY, STUDIO_IMAGE_UNIT_KEY),
    ]);
    textFloorMinor = text ? toAmountMinor(text.amountMinor) : null;
    imageFloorMinor = image ? toAmountMinor(image.amountMinor) : null;
  } catch {
    textFloorMinor = null;
    imageFloorMinor = null;
  }

  return { strip, textFloorMinor, imageFloorMinor };
}
