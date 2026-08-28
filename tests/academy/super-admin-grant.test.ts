import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_GRANT_LOCK_PREFIX } from "@/lib/academy/enrolment";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import type { AcademyPurchaseRecord } from "@/lib/academy/types";
import {
  assertLabAcademyGrantEnvironment,
  parseSuperAdminGrantEmailArg,
  planSuperAdminAcademyGrants,
  runSuperAdminAcademyGrants,
  type SuperAdminGrantCourseSeed,
  type SuperAdminGrantPort,
} from "../../scripts/ops-super-admin-academy-grant-lib";

const ROOT = process.cwd();
const NOW = new Date("2026-08-27T12:00:00.000Z");

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const SEEDS: SuperAdminGrantCourseSeed[] = ACADEMY_GROWTH_SKU_SLUGS.map((slug, index) => ({
  id: `ac_${slug.replace("-", "_")}`,
  slug,
  title: slug,
  summary: slug,
  catalogUnitKey: `course:${slug}`,
  globalRank: 1,
  localRank: index + 1,
  trendScore: index + 1,
}));

function memoryPort(input: {
  user: { id: string; email: string };
  courses?: { id: string; slug: string }[];
  purchases?: { courseId: string; priceLockId: string }[];
  ledger?: number;
  wallets?: number;
  onGrant?: (purchase: AcademyPurchaseRecord) => void;
}): SuperAdminGrantPort {
  const courses = [...(input.courses ?? [])];
  const purchases = [...(input.purchases ?? [])];
  let ledger = input.ledger ?? 0;
  const wallets = input.wallets ?? 0;
  return {
    async findUserByEmail(email) {
      return email === input.user.email ? input.user : null;
    },
    async findUserById(id) {
      return id === input.user.id ? input.user : null;
    },
    async listCoursesBySlugs(slugs) {
      return courses.filter((row) => slugs.includes(row.slug));
    },
    async listPurchasesForUser() {
      return purchases;
    },
    async insertCourse(seed) {
      courses.push({ id: seed.id, slug: seed.slug });
    },
    async insertGrant(purchase) {
      expect(purchase.amountMinor).toBe(toAmountMinor(0));
      expect(purchase.priceLockId.startsWith(ACADEMY_GRANT_LOCK_PREFIX)).toBe(true);
      purchases.push({ courseId: purchase.courseId, priceLockId: purchase.priceLockId });
      input.onGrant?.(purchase);
    },
    async countLedgerEntries() {
      return ledger;
    },
    async countWalletRows() {
      return wallets;
    },
  };
}

describe("Super Admin akademi lab bağışı", () => {
  it("üretimde kapalıdır; --email okur", () => {
    expect(() => assertLabAcademyGrantEnvironment("production")).toThrow(/Üretimde/);
    expect(assertLabAcademyGrantEnvironment("development")).toBeUndefined();
    expect(parseSuperAdminGrantEmailArg(["--email", "A@B.COM"], "")).toBe("a@b.com");
    expect(parseSuperAdminGrantEmailArg(["--email=Ops@Yetkin.AI"], "x@y.z")).toBe("ops@yetkin.ai");
    expect(parseSuperAdminGrantEmailArg([], "  Y@Z.COM ")).toBe("y@z.com");
  });

  it("eksik kursa course+grant, mevcut bağışı atlar, ticari kaydı ezmez", () => {
    const python = SEEDS[0]!;
    const plan = planSuperAdminAcademyGrants({
      slugs: ["python-temel", "ai-temel"],
      seeds: SEEDS,
      liveCourses: [{ id: python.id, slug: python.slug }],
      purchases: [{ courseId: python.id, priceLockId: `${ACADEMY_GRANT_LOCK_PREFIX}u:${python.id}` }],
    });
    expect(plan).toEqual([
      { slug: "python-temel", courseId: python.id, action: "skip-existing-grant" },
      {
        slug: "ai-temel",
        courseId: SEEDS.find((row) => row.slug === "ai-temel")!.id,
        action: "insert-course-and-grant",
      },
    ]);
    const commercial = planSuperAdminAcademyGrants({
      slugs: ["python-temel"],
      seeds: SEEDS,
      liveCourses: [{ id: python.id, slug: python.slug }],
      purchases: [{ courseId: python.id, priceLockId: "lock_paytr" }],
    });
    expect(commercial[0]?.action).toBe("skip-commercial");
  });

  it("bağış yazar, nakit sayacı değişmez", async () => {
    const written: AcademyPurchaseRecord[] = [];
    const port = memoryPort({
      user: { id: "user-1", email: "yapinet360@gmail.com" },
      courses: SEEDS.map((row) => ({ id: row.id, slug: row.slug })),
      onGrant: (purchase) => written.push(purchase),
    });
    const result = await runSuperAdminAcademyGrants(port, {
      email: "yapinet360@gmail.com",
      nodeEnv: "development",
      seeds: SEEDS,
      now: NOW,
    });
    expect(result.items.every((row) => row.applied)).toBe(true);
    expect(result.items.map((row) => row.slug)).toEqual([...ACADEMY_GROWTH_SKU_SLUGS]);
    expect(written).toHaveLength(4);
    expect(written.every((row) => row.amountMinor === 0)).toBe(true);
    expect(result.ledgerCountBefore).toBe(0);
    expect(result.ledgerCountAfter).toBe(0);
    expect(result.walletCountBefore).toBe(0);
    expect(result.walletCountAfter).toBe(0);
  });

  it("nakit sayacı kayarsa durur", async () => {
    const port = memoryPort({
      user: { id: "user-1", email: "a@b.com" },
      courses: SEEDS.map((row) => ({ id: row.id, slug: row.slug })),
      ledger: 0,
    });
    const original = port.countLedgerEntries;
    let calls = 0;
    port.countLedgerEntries = async () => {
      calls += 1;
      return calls === 1 ? 0 : 1;
    };
    await expect(
      runSuperAdminAcademyGrants(port, {
        email: "a@b.com",
        nodeEnv: "development",
        seeds: SEEDS,
        slugs: ["ai-temel"],
        now: NOW,
      }),
    ).rejects.toThrow(/nakit defterine yazdı/);
    port.countLedgerEntries = original;
  });

  it("CLI nakit INSERT taşımaz; npm script kilitlidir", () => {
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    expect(pkg.scripts["ops:super-admin-academy-grant"]).toBe(
      "tsx scripts/ops-super-admin-academy-grant.ts",
    );
    const cli = readSrc("scripts/ops-super-admin-academy-grant.ts");
    const lib = readSrc("scripts/ops-super-admin-academy-grant-lib.ts");
    expect(cli).not.toMatch(/INSERT INTO\s+ledger_entries/i);
    expect(cli).not.toMatch(/INSERT INTO\s+wallets/i);
    expect(cli).not.toMatch(/UPDATE\s+wallets/i);
    expect(lib).not.toMatch(/INSERT INTO\s+ledger_entries/i);
    expect(lib).not.toMatch(/INSERT INTO\s+wallets/i);
    expect(cli).toContain("sa_grant");
    expect(cli).toContain("amount_minor");
    expect(lib).toContain("createAcademyGrantPurchase");
  });
});
