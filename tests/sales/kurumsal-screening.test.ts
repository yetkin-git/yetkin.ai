import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  YETKINCV_CV_MAX,
  YETKINCV_CV_MIN,
  YETKINCV_PASS_SCORE,
  yetkinCvQuestionsForSkills,
  yetkinCvSkillBreakdown,
  yetkinCvSkillCatalog,
} from "@/lib/career/yetkincv";
import { YETKINCV_VERTICALS } from "@/lib/career/yetkincv-options";
import {
  KURUMSAL_CV_MAX,
  KURUMSAL_CV_MIN,
  KURUMSAL_DEFAULT_MIN_SCORE,
  KURUMSAL_JOB_VERTICALS,
  formatSkillScoreLine,
  isKurumsalJobOpen,
  kurumsalJobSlugBase,
  kurumsalJobVertical,
  parseCriteriaWeights,
  parseKurumsalDeadline,
  parseKurumsalJobDraft,
  rankJobApplications,
  weightedScreeningScore,
} from "@/lib/sales/kurumsal-screening";

describe("kurumsal ilan eleme", () => {
  it("barajı geçen ilk N adayı kısa listeye alır, kalanı eler", () => {
    const rows = [
      { id: "a", weightedScore: 90, createdAt: new Date("2026-11-01T10:00:00Z") },
      { id: "b", weightedScore: 80, createdAt: new Date("2026-11-01T11:00:00Z") },
      { id: "c", weightedScore: 70, createdAt: new Date("2026-11-01T12:00:00Z") },
      { id: "d", weightedScore: 60, createdAt: new Date("2026-11-01T09:00:00Z") },
      { id: "e", weightedScore: null, createdAt: new Date("2026-11-01T08:00:00Z") },
    ];
    const ranked = rankJobApplications(rows, 70, 2);
    expect(ranked.map((row) => [row.id, row.band, row.rank])).toEqual([
      ["a", "SHORTLISTED", 1],
      ["b", "SHORTLISTED", 2],
      ["c", "QUALIFIED_NOT_SHORTLISTED", 3],
      ["d", "BELOW_THRESHOLD", 4],
      ["e", "PENDING_TEST", null],
    ]);
  });

  it("eşit puanda daha erken başvuruyu öne alır", () => {
    const ranked = rankJobApplications(
      [
        { id: "late", weightedScore: 88, createdAt: new Date("2026-11-02T10:00:00Z") },
        { id: "early", weightedScore: 88, createdAt: new Date("2026-11-01T10:00:00Z") },
      ],
      70,
      1,
    );
    expect(ranked[0]?.id).toBe("early");
    expect(ranked[0]?.band).toBe("SHORTLISTED");
    expect(ranked[1]?.band).toBe("QUALIFIED_NOT_SHORTLISTED");
  });

  it("dikeyler YetkinCV bankasıyla ve CV bandı sınav motoruyla aynıdır", () => {
    expect(KURUMSAL_DEFAULT_MIN_SCORE).toBe(YETKINCV_PASS_SCORE);
    expect(KURUMSAL_CV_MIN).toBe(YETKINCV_CV_MIN);
    expect(KURUMSAL_CV_MAX).toBe(YETKINCV_CV_MAX);
    for (const row of KURUMSAL_JOB_VERTICALS) {
      expect(YETKINCV_VERTICALS.some((item) => item.id === row.yetkinCvVerticalId)).toBe(true);
    }
  });

  it("slug Türkçe başlıktan okunur adres üretir", () => {
    expect(kurumsalJobSlugBase("Depo Sorumlusu")).toBe("depo-sorumlusu");
  });

  it("migrasyon sahte ilan basmaz ve FORCE RLS taşır", () => {
    const sql = readFileSync(
      join(process.cwd(), "prisma/migrations/20261118230000_kurumsal_ilan_eleme/migration.sql"),
      "utf8",
    );
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("kurumsal_job_postings");
    expect(sql).toContain("kurumsal_job_applications");
    expect(sql).toContain("rls_deny_unscoped");
    expect(sql).toContain("job-screening-pack");
    expect(sql).toContain("290000");
    expect(sql).not.toMatch(/INSERT INTO "kurumsal_job_postings"/);
    expect(sql).not.toMatch(/INSERT INTO "kurumsal_job_applications"/);
  });

  it("ağırlık migrasyonu kolon ekler, FORCE RLS yineler ve sahte satır basmaz", () => {
    const sql = readFileSync(
      join(process.cwd(), "prisma/migrations/20261118260000_kurumsal_agirlikli_eleme/migration.sql"),
      "utf8",
    );
    expect(sql).toContain("criteria_weights");
    expect(sql).toContain("skill_scores");
    expect(sql).toContain("weighted_score");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("rls_deny_unscoped");
    expect(sql).not.toMatch(/INSERT INTO "kurumsal_job_postings"/);
    expect(sql).not.toMatch(/INSERT INTO "kurumsal_job_applications"/);
  });

  it("ağırlıklı puan alt testlerin yuvarlanmış toplamıdır", () => {
    const criteria = [
      { key: "python", weight: 50 },
      { key: "english", weight: 30 },
      { key: "excel", weight: 20 },
    ];
    expect(weightedScreeningScore(criteria, { python: 85, english: 65, excel: 45 })).toBe(71);
    expect(weightedScreeningScore(criteria, { python: 100, english: 0, excel: 100 })).toBe(70);
    expect(weightedScreeningScore(criteria.slice(0, 2), { python: 100, english: 100 })).toBeNull();
  });

  it("yetkinlik anahtarı vaka bankasından gelir, uydurma etiket yazılmaz", () => {
    const office = yetkinCvSkillCatalog("office");
    expect(office).not.toBeNull();
    const bank = office ?? [];
    expect(bank.length).toBeGreaterThanOrEqual(3);
    const rejected = parseCriteriaWeights(
      [
        { key: "python", label: "Python & Veri Analizi", weight: 50 },
        { key: bank[0]?.key, weight: 30 },
        { key: bank[1]?.key, weight: 20 },
      ],
      bank,
    );
    expect(rejected.ok).toBe(false);
    const accepted = parseCriteriaWeights(
      [
        { key: bank[0]?.key, label: "Python & Veri Analizi", weight: 50 },
        { key: bank[1]?.key, weight: 30 },
        { key: bank[2]?.key, weight: 20 },
      ],
      bank,
    );
    expect(accepted.ok).toBe(true);
    if (accepted.ok) {
      expect(accepted.value[0]?.label).toBe(bank[0]?.label);
      expect(accepted.value.map((row) => row.weight)).toEqual([50, 30, 20]);
    }
  });

  it("alt puan, seçilen soruların floor kırılımından gelir", () => {
    const office = yetkinCvSkillCatalog("office");
    expect(office).not.toBeNull();
    const picked = (office ?? []).slice(0, 3);
    const criteria = picked.map((skill, index) => ({ ...skill, weight: [50, 30, 20][index] ?? 0 }));
    const questions = yetkinCvQuestionsForSkills(
      "office",
      criteria.map((row) => row.key),
    );
    expect(questions).not.toBeNull();
    const bank = questions ?? [];
    const firstSkill = criteria[0]?.key;
    const answers = bank.map((question) => {
      const wrong = question.correctIndex === 0 ? 1 : 0;
      return {
        questionId: question.id,
        choiceIndex: question.skillId === firstSkill ? question.correctIndex : wrong,
      };
    });
    const breakdown = yetkinCvSkillBreakdown(bank, answers);
    const scores = Object.fromEntries(breakdown.map((row) => [row.id, row.score]));
    expect(scores[criteria[0]?.key ?? ""]).toBe(100);
    expect(weightedScreeningScore(criteria, scores)).toBe(50);
    expect(formatSkillScoreLine(criteria, scores)).toBe(
      `${criteria[0]?.label}: 100 · ${criteria[1]?.label}: 0 · ${criteria[2]?.label}: 0`,
    );
  });

  it("son başvuru gün sonuna kadar açık kalır; geçmiş ve bozuk tarih reddedilir", () => {
    const now = new Date("2026-11-18T12:00:00+03:00");
    expect(parseKurumsalDeadline("2026-12-31", now).ok).toBe(true);
    expect(parseKurumsalDeadline("2026-11-01", now).ok).toBe(false);
    expect(parseKurumsalDeadline("2026-02-31", now).ok).toBe(false);
    expect(parseKurumsalDeadline("", now)).toEqual({ ok: true, value: null });
    expect(isKurumsalJobOpen({ isActive: true, deadlineAt: null }, now)).toBe(true);
    expect(
      isKurumsalJobOpen({ isActive: true, deadlineAt: new Date("2026-11-18T10:00:00+03:00") }, now),
    ).toBe(false);
    const skills = yetkinCvSkillCatalog("ecommerce") ?? [];
    const parsed = parseKurumsalJobDraft(
      {
        companyName: "Ada Ltd",
        title: "Depo sorumlusu",
        vertical: "ECOMMERCE",
        description: "Depo sayımı, iade ve kanal stoğu aynı kaynaktan yürür. Ölçülmeyen vaat yazılmaz.",
        taxNumber: "1111111114",
        criteriaWeights: [
          { key: skills[0]?.key, weight: 50 },
          { key: skills[1]?.key, weight: 30 },
          { key: skills[2]?.key, weight: 20 },
        ],
        minScore: 75,
        shortlistLimit: 5,
        deadlineAt: "2026-12-31",
      },
      (vertical) => {
        const row = kurumsalJobVertical(vertical);
        return row ? yetkinCvSkillCatalog(row.yetkinCvVerticalId) : null;
      },
      now,
    );
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.deadlineAt).toBeInstanceOf(Date);
    }
  });

  it("kapanış migrasyonu yalnız tarihi ekler ve sahte ilan basmaz", () => {
    const sql = readFileSync(
      join(process.cwd(), "prisma/migrations/20261118270000_kurumsal_job_deadline/migration.sql"),
      "utf8",
    );
    expect(sql).toContain("deadline_at");
    expect(sql).not.toMatch(/INSERT INTO/);
    expect(sql).not.toContain("criteria_weights");
  });
});
