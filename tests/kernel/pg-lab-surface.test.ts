import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isLabLoopbackUrl, LAB_POSTGRES_DEFAULT_URL } from "../../scripts/ops-migrate-lib";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("lab Postgres yüzeyi", () => {
  it("betik ve CI ayrı pg-lab işi taşır; bellek testleri hosted DB'ye düşmez", () => {
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    expect(pkg.scripts["ops:hosted-apply-preflight"]).toBe("tsx scripts/ops-hosted-apply-preflight.ts");
    expect(pkg.scripts["ops:pg-backup-restore"]).toBe("tsx scripts/ops-pg-backup-restore.ts");
    expect(pkg.scripts["ops:health-probe"]).toBe("tsx scripts/ops-health-probe.ts");
    expect(pkg.scripts["ops:revoke-academy-certificate"]).toBe(
      "tsx scripts/ops-revoke-academy-certificate.ts",
    );
    expect(pkg.scripts["ops:list-payment-anomalies"]).toBe(
      "tsx scripts/ops-list-payment-anomalies.ts",
    );
    expect(pkg.scripts["ops:lab-postgres"]).toBe("tsx scripts/ops-lab-postgres.ts");
    expect(pkg.scripts["test:pg"]).toBe("vitest run --config vitest.pg.config.ts");
    expect(pkg.scripts["verify:pg-lab"]).toBe("tsx scripts/ops-pg-lab-test.ts");
    expect(readSrc("scripts/ops-pg-lab-test.ts")).toContain('run("db:generate")');
    expect(pkg.scripts.test).not.toContain("vitest.pg.config");
    expect(readSrc("vitest.config.ts")).toContain("tests/**/*.pg.test.ts");
    expect(readSrc("vitest.pg.config.ts")).toContain("tests/**/*.pg.test.ts");
    expect(existsSync(join(ROOT, "docker-compose.postgres.yml"))).toBe(true);
    expect(readSrc("docker-compose.postgres.yml")).toContain("yetkin_rail_lab");
    expect(readSrc("docker-compose.postgres.yml")).toContain("5432:5432");
    expect(readSrc(".github/workflows/ci.yml")).toContain("pg-lab:");
    expect(readSrc(".github/workflows/ci.yml")).toContain("npm run ops:lab-postgres");
    expect(readSrc(".github/workflows/ci.yml")).toContain("npm run test:pg");
    expect(readSrc(".github/workflows/ci.yml")).toContain("postgresql-client");
    expect(readSrc(".github/workflows/ci.yml")).toContain("ops:hosted-apply-preflight");
    expect(readSrc(".github/workflows/ci.yml")).toContain("ops:pg-backup-restore");
    expect(readSrc(".github/workflows/ci.yml")).toContain("ops:list-payment-anomalies");
    expect(readSrc("scripts/ops-pg-lab-test.ts")).toContain("ops:pg-backup-restore");
    expect(readSrc("scripts/ops-pg-lab-test.ts")).toContain("ops:list-payment-anomalies");
    expect(readSrc("scripts/ops-lab-postgres.ts")).toContain("isLabLoopbackUrl");
    expect(readSrc("scripts/ops-lab-postgres.ts")).toContain("ensureLabAuthSchema");
    expect(readSrc("scripts/ops-lab-postgres.ts")).toContain("ensureLabPostgresRuntime");
    expect(readSrc("scripts/ops-lab-postgres.ts")).not.toContain("pooler.supabase.com");
  });

  it("lab URL yalnız loopback :5432 kabul eder; iç hakediş kilidi durur", () => {
    expect(isLabLoopbackUrl(LAB_POSTGRES_DEFAULT_URL)).toBe(true);
    expect(isLabLoopbackUrl("postgresql://postgres:postgres@localhost:5432/yetkin_rail_lab")).toBe(
      true,
    );
    expect(
      isLabLoopbackUrl(
        "postgresql://postgres:postgres@127.0.0.1:5432/yetkin_rail_lab?sslmode=disable",
      ),
    ).toBe(true);
    expect(
      isLabLoopbackUrl("postgresql://postgres:x@db.abcdefgh.supabase.co:5432/postgres"),
    ).toBe(false);
    expect(isLabLoopbackUrl("postgresql://postgres:postgres@127.0.0.1:5432/postgres")).toBe(false);
    expect(
      isLabLoopbackUrl("postgresql://postgres:x@127.0.0.1:6543/yetkin_rail_lab"),
    ).toBe(false);
    expect(readSrc("scripts/ops-lab-postgres.ts")).toContain("resetLabPublicSchema");
    expect(readSrc("scripts/ops-migrate-lib.ts")).toContain("CREATE ROLE anon NOLOGIN");
    expect(readSrc("scripts/ops-migrate-lib.ts")).toContain("CREATE ROLE authenticated NOLOGIN");
    expect(readSrc("lib/kernel/payments/marketplace-split.ts")).toContain('id: "split"');
  });
});
