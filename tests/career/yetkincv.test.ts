import { describe, expect, it } from "vitest";
import { gradeAcademyExam } from "@/lib/academy/exam";
import { buildCareerRoadmap } from "@/lib/career/roadmap";
import { buildCareerSwot } from "@/lib/career/swot";
import {
  computeYetkinCvHash,
  gradeYetkinCvExam,
  parseYetkinCvStart,
  toYetkinCvSwotInput,
  yetkinCvPublicQuestions,
  yetkinCvQuestions,
  yetkinCvSignals,
  type YetkinCvAnswer,
} from "@/lib/career/yetkincv";

describe("YetkinCV sınavı", () => {
  it("puanı akademi sınav motoruyla aynı tam sayı formülünden üretir", () => {
    const questions = yetkinCvQuestions("ecommerce");
    expect(questions).not.toBeNull();
    const bank = questions ?? [];
    const answers: YetkinCvAnswer[] = bank.map((question, index) => ({
      questionId: question.id,
      choiceIndex: index === 0 ? question.correctIndex : 0,
    }));
    const local = gradeYetkinCvExam(bank, answers);
    const engine = gradeAcademyExam(
      bank.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        choices: [...question.choices],
        correctIndex: question.correctIndex,
      })),
      answers,
    );
    expect(local).toEqual(engine);
    expect(local.score).toBeGreaterThanOrEqual(0);
    expect(local.score).toBeLessThanOrEqual(100);
  });

  it("doğru şıkkı kamu sorusuna koymaz ve CV metnini sinyal sözlüğüne hapseder", () => {
    const questions = yetkinCvQuestions("office") ?? [];
    const pub = yetkinCvPublicQuestions(questions);
    expect(JSON.stringify(pub)).not.toContain("correctIndex");
    expect(yetkinCvSignals("Depoda stok ve iade tuttum. Şirket logosu yok.")).toEqual([
      "stok ve sipariş",
    ]);
    const parsed = parseYetkinCvStart({
      roleId: "freelancer",
      verticalId: "software",
      cvText: "kısa",
    });
    expect(parsed.ok).toBe(false);
  });

  it("mühür kodu skora bağlıdır ve SWOT pratiği kapalı akademiye gitmez", () => {
    const issuedAt = new Date("2026-11-18T10:00:00.000Z");
    const base = {
      userId: "user-1",
      sittingId: "sitting-1",
      roleId: "corporate",
      verticalId: "ecommerce",
      score: 80,
      issuedAt,
      cvDigest: "a".repeat(64),
      skillSeal: "stock:100:1/1",
    };
    const hash = computeYetkinCvHash(base);
    expect(hash).toHaveLength(64);
    expect(computeYetkinCvHash({ ...base, score: 40 })).not.toBe(hash);
    const swotInput = toYetkinCvSwotInput({
      score: 40,
      roleId: "corporate",
      verticalId: "ecommerce",
      skills: [{ label: "Stok", score: 0 }],
      certificateHash: hash,
      cvSignals: ["stok ve sipariş"],
    });
    expect(swotInput?.verifyHref).toBeNull();
    const swot = buildCareerSwot({
      stampTitles: [],
      certificateTitles: [],
      tezgahToolCounts: {},
      yetkinCv: swotInput,
    });
    const roadmap = buildCareerRoadmap({
      stampTitles: [],
      certificateTitles: [],
      tezgahToolCounts: {},
      yetkinCv: swotInput,
    });
    const blob = JSON.stringify({ swot, roadmap });
    expect(blob).not.toContain("/academy");
    expect(roadmap[0]?.href).toBe("/e-ticaret");
    expect(roadmap[2]?.href).toBe("/career#yetkincv");
    expect(swot.weaknesses.some((row) => row.label.includes("Stok"))).toBe(true);
  });
});
