import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { MODULE_ID } from "@/lib/freelancer";
import {
  FREELANCER_CATALOG_SEEDS,
  FREELANCER_ESCROW_HOLD_UNIT_KEY,
  FREELANCER_JOB_FLOOR_UNIT_KEY,
  FREELANCER_JOB_SEEDS,
  FREELANCER_SEED_CLIENT_ID,
  FREELANCER_SEED_CURRENCY,
  FREELANCER_SEED_MODULE_KEY,
} from "@/lib/freelancer/seed";
import {
  FREELANCER_JOB_MAX_MINOR,
  FREELANCER_JOB_MIN_MINOR,
} from "@/lib/freelancer/schemas";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { HOLD_BPS_DEFAULT, HOLD_BPS_MAX, HOLD_BPS_MIN } from "@/lib/kernel/pricing/hold-bps";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function freelancerSeedSql(): string {
  const dir = join(ROOT, "supabase", "migrations");
  const file = readdirSync(dir).find((name) => name.endsWith("freelancer_job_seed.sql"));
  expect(file).toBe("20260814110000_freelancer_job_seed.sql");
  return readFileSync(join(dir, file!), "utf8");
}

describe("freelancer ilan tohumu yüzeyi", () => {
  it("beş OPEN dikey ilan taşır; bütçe bandı ve hold katalogda, sahte sözleşme yok", () => {
    expect(FREELANCER_JOB_SEEDS).toHaveLength(5);
    expect(FREELANCER_CATALOG_SEEDS).toHaveLength(2);
    expect(FREELANCER_SEED_MODULE_KEY).toBe(MODULE_ID);
    expect(FREELANCER_SEED_CURRENCY).toBe("TRY");
    expect(FREELANCER_SEED_CLIENT_ID).toBe(PLATFORM_TREASURY_USER_ID);
    expect(FREELANCER_JOB_FLOOR_UNIT_KEY).toBe("job-posting:floor");
    expect(FREELANCER_ESCROW_HOLD_UNIT_KEY).toBe("escrow:hold");

    const ids = FREELANCER_JOB_SEEDS.map((row) => row.id);
    expect(ids).toEqual([
      "fj_rail_icon_set",
      "fj_rail_ql_banners",
      "fj_rail_academy_copy",
      "fj_rail_devlabs_prompts",
      "fj_rail_seal_social",
    ]);
    const titles = FREELANCER_JOB_SEEDS.map((row) => row.title);
    expect(titles).toContain("Yapay Zekâ Destekli İkon ve İllüstrasyon Seti Teslimi");
    expect(titles).toContain(`${YETKIN_BRAND} Quiet Luxury Tanıtım Görselleri ve Banner Üretimi`);
    expect(titles).toContain("Akademi Müfredat Özet Metinlerinin Düzenlenmesi");
    expect(titles).toContain("DevLabs Örnek Prompt Şablonları Dokümantasyonu");
    expect(titles).toContain("Mühürlü Kanıt Sosyal Medya Şablon Tasarımları");
    for (const row of FREELANCER_JOB_SEEDS) {
      expect(row.title.length).toBeGreaterThanOrEqual(3);
      expect(row.brief.length).toBeGreaterThanOrEqual(8);
      expect(row.brief.length).toBeLessThanOrEqual(4000);
      expect(row.budgetMinor).toBeGreaterThanOrEqual(FREELANCER_JOB_MIN_MINOR);
      expect(row.budgetMinor).toBeLessThanOrEqual(FREELANCER_JOB_MAX_MINOR);
      expect(row.visaPathwayId).toBe("yz-muhendislik-agent");
    }

    const floor = FREELANCER_CATALOG_SEEDS.find((row) => row.unitKey === FREELANCER_JOB_FLOOR_UNIT_KEY);
    const hold = FREELANCER_CATALOG_SEEDS.find((row) => row.unitKey === FREELANCER_ESCROW_HOLD_UNIT_KEY);
    expect(floor?.unitType).toBe("MINOR");
    expect(floor?.seedMinMinor).toBe(FREELANCER_JOB_MIN_MINOR);
    expect(floor?.seedMaxMinor).toBe(FREELANCER_JOB_MAX_MINOR);
    expect(hold?.unitType).toBe("BPS");
    expect(hold?.seedAmountMinor).toBe(HOLD_BPS_DEFAULT);
    expect(hold?.seedMinMinor).toBe(HOLD_BPS_MIN);
    expect(hold?.seedMaxMinor).toBe(HOLD_BPS_MAX);
  });

  it("ops SQL sicil anahtarları ve tutarlarla hizalıdır; sahte nakit/sözleşme/vize basmaz", () => {
    const sql = freelancerSeedSql();
    expect(sql).toMatch(/ON CONFLICT \(module_key, unit_key\) DO UPDATE/);
    expect(sql).toMatch(/price_catalog_entries\.updated_by IS NOT NULL/);
    expect(sql).toMatch(/THEN price_catalog_entries\.amount_minor/);
    expect(sql).toMatch(/updated_by = price_catalog_entries\.updated_by/);
    expect(sql).toMatch(/ON CONFLICT \(id\) DO UPDATE/);
    expect(sql).toContain("'freelancer'");
    expect(sql).toContain(FREELANCER_SEED_CLIENT_ID);
    expect(sql).not.toMatch(/INSERT INTO public\.users/i);
    expect(sql).not.toMatch(/INSERT INTO public\.wallets/i);
    expect(sql).not.toMatch(/INSERT INTO public\.freelancer_bids/i);
    expect(sql).not.toMatch(/INSERT INTO public\.freelancer_contracts/i);
    expect(sql).not.toMatch(/INSERT INTO public\.escrow_holds/i);
    expect(sql).not.toMatch(/INSERT INTO public\.ledger_entries/i);
    expect(sql).not.toMatch(/INSERT INTO public\.career_visa_stamps/i);
    expect(sql).not.toMatch(/UPDATE public\.wallets/i);

    for (const row of FREELANCER_CATALOG_SEEDS) {
      expect(sql).toContain(row.id);
      expect(sql).toContain(row.unitKey);
      expect(sql).toContain(`'${row.unitType}'`);
      expect(sql).toContain(String(row.seedAmountMinor));
      expect(sql).toContain(String(row.seedMinMinor));
      expect(sql).toContain(String(row.seedMaxMinor));
      expect(sql).toContain(row.description);
    }
    for (const row of FREELANCER_JOB_SEEDS) {
      expect(sql).toContain(row.id);
      expect(sql).toContain(row.title);
      expect(sql).toContain(row.brief);
      expect(sql).toContain(String(row.budgetMinor));
    }
  });

  it("vitrin loadOpenJobs ile DB ilanını basar; boş listede showcase yok, dürüst CTA var", () => {
    const page = readSrc("app/freelancer/page.tsx");
    const load = readSrc("lib/freelancer/load.ts");
    const list = readSrc("components/freelancer/job-list.tsx");
    const detail = readSrc("app/freelancer/jobs/[id]/page.tsx");
    const store = readSrc("lib/freelancer/prisma-store.ts");

    expect(page).toContain("loadOpenJobs");
    expect(page).toContain("SEN_VOICE");
    expect(readSrc("lib/copy/sen-voice/freelancer.ts")).toContain("Canlı sicil");
    expect(page).not.toContain("FREELANCER_SHOWCASE");
    expect(load).toContain("listOpenJobs");
    expect(store).toContain('status: "OPEN"');
    expect(list).not.toContain("FREELANCER_SHOWCASE");
    expect(list).not.toContain("Vitrine");
    expect(list).toContain("jobs.length === 0");
    expect(list).toContain("emptyHint");
    expect(list).toContain('href="/freelancer/new"');
    expect(list).toContain("FreelancerJobCard");
    expect(readSrc("components/freelancer/job-card.tsx")).toContain("/freelancer/jobs/${job.id}");
    expect(detail).toContain("loadJobBoard");
    expect(detail).toContain("BidForm");
  });
});
