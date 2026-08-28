/**
 * Super Admin lab bağışı — academy_purchases sa_grant satırı.
 * Nakit defteri (ledger_entries / wallets CREDIT-DEBIT) yazılmaz.
 */

import { createAcademyGrantPurchase, isZeroFeeAcademyGrantOpen } from "@/lib/academy/access";
import { ACADEMY_GRANT_LOCK_PREFIX, isAcademyGrantPurchase } from "@/lib/academy/enrolment";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";
import type { AcademyPurchaseRecord } from "@/lib/academy/types";

export { ACADEMY_GRANT_LOCK_PREFIX };

export type SuperAdminGrantCourseSeed = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  catalogUnitKey: string;
  globalRank: number;
  localRank: number;
  trendScore: number;
};

export type SuperAdminGrantAction =
  | "insert-grant"
  | "insert-course-and-grant"
  | "skip-existing-grant"
  | "skip-commercial";

export type SuperAdminGrantPlanItem = {
  slug: string;
  courseId: string;
  action: SuperAdminGrantAction;
};

export type SuperAdminGrantPort = {
  findUserByEmail(email: string): Promise<{ id: string; email: string } | null>;
  findUserById(id: string): Promise<{ id: string; email: string } | null>;
  listCoursesBySlugs(slugs: readonly string[]): Promise<{ id: string; slug: string }[]>;
  listPurchasesForUser(userId: string): Promise<{ courseId: string; priceLockId: string }[]>;
  insertCourse(seed: SuperAdminGrantCourseSeed): Promise<void>;
  insertGrant(purchase: AcademyPurchaseRecord): Promise<void>;
  countLedgerEntries(userId: string): Promise<number>;
  countWalletRows(userId: string): Promise<number>;
};

export type SuperAdminGrantResult = {
  userId: string;
  email: string;
  items: Array<SuperAdminGrantPlanItem & { applied: boolean }>;
  ledgerCountBefore: number;
  ledgerCountAfter: number;
  walletCountBefore: number;
  walletCountAfter: number;
};

export function assertLabAcademyGrantEnvironment(
  nodeEnv: string | undefined = process.env.NODE_ENV,
): void {
  if (!isZeroFeeAcademyGrantOpen(nodeEnv)) {
    throw new Error("Üretimde sıfır harçlı Super Admin akademi bağışı kapalıdır.");
  }
}

export function parseSuperAdminGrantEmailArg(
  argv: string[],
  envEmail: string | undefined,
): string {
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];
    if (token === "--email" && next) {
      return next.trim().toLowerCase();
    }
    if (token?.startsWith("--email=")) {
      return token.slice("--email=".length).trim().toLowerCase();
    }
  }
  return envEmail?.trim().toLowerCase() ?? "";
}

export function planSuperAdminAcademyGrants(input: {
  slugs: readonly string[];
  seeds: readonly SuperAdminGrantCourseSeed[];
  liveCourses: readonly { id: string; slug: string }[];
  purchases: readonly { courseId: string; priceLockId: string }[];
}): SuperAdminGrantPlanItem[] {
  const seedBySlug = new Map(input.seeds.map((row) => [row.slug, row] as const));
  const liveBySlug = new Map(input.liveCourses.map((row) => [row.slug, row] as const));
  const purchaseByCourseId = new Map(input.purchases.map((row) => [row.courseId, row] as const));
  const items: SuperAdminGrantPlanItem[] = [];
  for (const slug of input.slugs) {
    const seed = seedBySlug.get(slug);
    if (!seed) {
      throw new Error(`Büyüme tohumu yok: ${slug}`);
    }
    const live = liveBySlug.get(slug);
    const courseId = live?.id ?? seed.id;
    const purchase = purchaseByCourseId.get(courseId);
    if (purchase) {
      items.push({
        slug,
        courseId,
        action: isAcademyGrantPurchase(purchase) ? "skip-existing-grant" : "skip-commercial",
      });
      continue;
    }
    items.push({
      slug,
      courseId,
      action: live ? "insert-grant" : "insert-course-and-grant",
    });
  }
  return items;
}

export async function resolveSuperAdminGrantUser(
  port: Pick<SuperAdminGrantPort, "findUserByEmail" | "findUserById">,
  input: { email: string; userId?: string },
): Promise<{ id: string; email: string }> {
  const email = input.email.trim().toLowerCase();
  if (email) {
    const byEmail = await port.findUserByEmail(email);
    if (byEmail) {
      return { id: byEmail.id, email: byEmail.email.trim().toLowerCase() };
    }
  }
  const userId = input.userId?.trim() ?? "";
  if (userId) {
    const byId = await port.findUserById(userId);
    if (byId) {
      return { id: byId.id, email: byId.email.trim().toLowerCase() };
    }
  }
  throw new Error(
    "Super Admin kullanıcı satırı yok. /register ile aç, SUPER_ADMIN_USER_ID veya --email ver.",
  );
}

export async function runSuperAdminAcademyGrants(
  port: SuperAdminGrantPort,
  input: {
    email: string;
    userId?: string;
    nodeEnv?: string;
    slugs?: readonly string[];
    seeds: readonly SuperAdminGrantCourseSeed[];
    now?: Date;
  },
): Promise<SuperAdminGrantResult> {
  assertLabAcademyGrantEnvironment(input.nodeEnv);
  const user = await resolveSuperAdminGrantUser(port, {
    email: input.email,
    userId: input.userId,
  });
  const slugs = input.slugs ?? ACADEMY_GROWTH_SKU_SLUGS;
  const liveCourses = await port.listCoursesBySlugs(slugs);
  const purchases = await port.listPurchasesForUser(user.id);
  const plan = planSuperAdminAcademyGrants({
    slugs,
    seeds: input.seeds,
    liveCourses,
    purchases,
  });
  const seedBySlug = new Map(input.seeds.map((row) => [row.slug, row] as const));
  const ledgerCountBefore = await port.countLedgerEntries(user.id);
  const walletCountBefore = await port.countWalletRows(user.id);
  const items: SuperAdminGrantResult["items"] = [];
  const now = input.now ?? new Date();
  for (const row of plan) {
    if (row.action === "skip-existing-grant" || row.action === "skip-commercial") {
      items.push({ ...row, applied: false });
      continue;
    }
    const seed = seedBySlug.get(row.slug);
    if (!seed) {
      throw new Error(`Büyüme tohumu yok: ${row.slug}`);
    }
    if (row.action === "insert-course-and-grant") {
      await port.insertCourse(seed);
    }
    await port.insertGrant(createAcademyGrantPurchase(user.id, row.courseId, now));
    items.push({ ...row, applied: true });
  }
  const ledgerCountAfter = await port.countLedgerEntries(user.id);
  const walletCountAfter = await port.countWalletRows(user.id);
  if (ledgerCountAfter !== ledgerCountBefore || walletCountAfter !== walletCountBefore) {
    throw new Error("Super Admin bağışı nakit defterine yazdı — A1/A5 ihlali, işlem durdu.");
  }
  return {
    userId: user.id,
    email: user.email,
    items,
    ledgerCountBefore,
    ledgerCountAfter,
    walletCountBefore,
    walletCountAfter,
  };
}
