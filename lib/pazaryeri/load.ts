import "server-only";

import { createPrismaPazaryeriPorts } from "@/lib/pazaryeri/runtime";
import type {
  MarketplaceOfferRecord,
  MarketplaceOrderRecord,
  MarketplaceProductRecord,
} from "@/lib/pazaryeri/types";

export async function loadListedProducts(): Promise<MarketplaceProductRecord[] | null> {
  try {
    const ports = createPrismaPazaryeriPorts();
    return await ports.pazaryeri.listListedProducts();
  } catch {
    return null;
  }
}

export async function loadProductBySlug(slug: string): Promise<MarketplaceProductRecord | null> {
  try {
    const ports = createPrismaPazaryeriPorts();
    return (await ports.pazaryeri.getProductBySlug(slug)) ?? (await ports.pazaryeri.getProduct(slug));
  } catch {
    return null;
  }
}

export async function loadSellerProducts(userId: string): Promise<MarketplaceProductRecord[] | null> {
  try {
    const ports = createPrismaPazaryeriPorts();
    return await ports.pazaryeri.listProductsBySeller(userId);
  } catch {
    return null;
  }
}

export async function loadOrdersForUser(userId: string): Promise<MarketplaceOrderRecord[] | null> {
  try {
    const ports = createPrismaPazaryeriPorts();
    return await ports.pazaryeri.listOrdersForUser(userId);
  } catch {
    return null;
  }
}

export async function loadPurchaseForUserProduct(
  userId: string,
  productId: string,
): Promise<MarketplaceOrderRecord | null> {
  try {
    const ports = createPrismaPazaryeriPorts();
    return await ports.pazaryeri.getOrderByBuyerAndProduct(userId, productId);
  } catch {
    return null;
  }
}

export async function loadOffersForProduct(productId: string): Promise<MarketplaceOfferRecord[] | null> {
  try {
    const ports = createPrismaPazaryeriPorts();
    return await ports.pazaryeri.listOffersForProduct(productId);
  } catch {
    return null;
  }
}
