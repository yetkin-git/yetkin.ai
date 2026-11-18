import { describe, expect, it } from "vitest";
import {
  CAREER_JOB_MATCH_EMPTY,
  matchCandidateToJob,
  projectCareerJobMatchBoard,
  type JobMatchDraft,
} from "@/lib/career/job-matcher";

const NOW = new Date("2026-11-18T00:00:00Z");
const DAY_MS = 86_400_000;

const COACH_JOB: JobMatchDraft = {
  slug: "python-rolu",
  title: "Yazılım uzmanı",
  companyName: "Ada",
  minScore: 75,
  deadlineAt: new Date(NOW.getTime() + 42 * DAY_MS),
  criteria: [
    { key: "prompt", label: "Python", weight: 70 },
    { key: "review", label: "İnceleme", weight: 20 },
    { key: "test", label: "Test", weight: 10 },
  ],
  practiceHref: "/tezgah",
};

const COACH_SCORES = [
  { id: "prompt", label: "Python", score: 60 },
  { id: "review", label: "İnceleme", score: 70 },
  { id: "test", label: "Test", score: 80 },
];

describe("kariyer ilan eşlemesi", () => {
  it("barajı geçen ağırlıklı puanı doğrudan başvuruya yazar", () => {
    const card = matchCandidateToJob(
      {
        ...COACH_JOB,
        deadlineAt: null,
        criteria: [
          { key: "a", label: "A", weight: 50 },
          { key: "b", label: "B", weight: 30 },
          { key: "c", label: "C", weight: 20 },
        ],
      },
      [
        { id: "a", label: "A", score: 90 },
        { id: "b", label: "B", score: 80 },
        { id: "c", label: "C", score: 65 },
      ],
      NOW,
    );
    expect(card?.kind).toBe("ready");
    if (card?.kind === "ready") {
      expect(card.status).toBe("Doğrudan Başvuruya Uygun");
      expect(card.badge).toBe("YetkinCV Puanın Uygun (82/75)");
      expect(card.applyPath).toBe("/ilan/python-rolu");
    }
  });

  it("baraja yakın ilanda en yüksek ağırlıklı açığı ve kalan günü yazar", () => {
    const card = matchCandidateToJob(COACH_JOB, COACH_SCORES, NOW);
    expect(card?.kind).toBe("coach");
    if (card?.kind === "coach") {
      expect(card.status).toBe("Geliştirilebilir / Koçluk Fırsatı");
      expect(card.badge).toBe("Baraja 11 Puan Kaldı · Son 42 Gün");
      expect(card.gapLine).toBe("Python puanını +15 artırmalısın");
      expect(card.roadmap[0]?.body).toContain("Python puanını +15 artırmalısın");
      expect(card.roadmap.map((row) => row.id)).toEqual(["d30", "d60", "d90"]);
    }
  });

  it("kapanış tarihi yoksa koçluk bandını, süresi geçmiş ilanı hiç açmaz", () => {
    expect(matchCandidateToJob({ ...COACH_JOB, deadlineAt: null }, COACH_SCORES, NOW)).toBeNull();
    expect(
      matchCandidateToJob(
        { ...COACH_JOB, deadlineAt: new Date(NOW.getTime() - 1_000) },
        [
          { id: "prompt", label: "Python", score: 100 },
          { id: "review", label: "İnceleme", score: 100 },
          { id: "test", label: "Test", score: 100 },
        ],
        NOW,
      ),
    ).toBeNull();
    expect(matchCandidateToJob({ ...COACH_JOB, minScore: 90 }, COACH_SCORES, NOW)).toBeNull();
  });

  it("açık ilan yoksa sahte kart basmaz", () => {
    const board = projectCareerJobMatchBoard({
      openCount: 0,
      jobs: [],
      skillScores: COACH_SCORES,
      now: NOW,
    });
    expect(board).toEqual({ state: "empty", message: CAREER_JOB_MATCH_EMPTY });
    expect(JSON.stringify(board)).not.toMatch(/Python|Yazılım uzmanı/);
  });
});
