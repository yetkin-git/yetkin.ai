import { describe, expect, it } from "vitest";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { academyInstructorBySlug } from "@/lib/academy/instructors";
import {
  ACADEMY_REVIEW_DECISION_A,
  ACADEMY_REVIEW_DECISION_B,
  ACADEMY_REVIEW_DECISION_C,
  ACADEMY_REVIEW_REVISION_TAG,
  classifyAcademyReviewDecision,
} from "@/archived/lib/academy-studio/moderation";
import { sealedAcademyReviewDecisionReply } from "@/archived/lib/academy-studio/reviews";
import { parseAcademyReviewAiDecision } from "@/archived/lib/academy-studio/reviews-engine";

describe("03.33 üç kanallı yorum kararı", () => {
  it("kategori A — kullanıcı yanılgısına nazik düzeltme basar", () => {
    const verdict = classifyAcademyReviewDecision({
      comment: "Satın alma belge basıyor sanıyordum, baraj 50 değil mi?",
      stars: 3,
      courseSlug: "python-temel",
      courseLevel: "Temel",
    });
    expect(verdict.decision).toBe(ACADEMY_REVIEW_DECISION_A);
    expect(verdict.correction).toContain("70");
    const instructor = academyInstructorBySlug("python-temel");
    const reply = sealedAcademyReviewDecisionReply({
      decision: ACADEMY_REVIEW_DECISION_A,
      instructor,
      correction: verdict.correction,
    });
    expect(reply).toContain("yanılgı");
    expect(reply).toContain("70");
  });

  it("kategori B — kapsam dışı / üst seviye yönlendirmesi kilit cümleyi basar", () => {
    const verdict = classifyAcademyReviewDecision({
      comment: "Neden Kubernetes bu Temel derste yok, anlatılmalıydı.",
      stars: 4,
      courseSlug: "python-temel",
      courseLevel: "Temel",
    });
    expect(verdict.decision).toBe(ACADEMY_REVIEW_DECISION_B);
    const instructor = academyInstructorBySlug("python-temel");
    expect(
      sealedAcademyReviewDecisionReply({ decision: ACADEMY_REVIEW_DECISION_B, instructor }),
    ).toContain(ACADEMY_SEN.review.outOfScope);
  });

  it("kategori C — haklı eksiği REVİZYON_TALEBİ etiketler", () => {
    const verdict = classifyAcademyReviewDecision({
      comment: "Parametre tablosu eksik, şema da çelişiyor.",
      stars: 2,
      courseSlug: "python-temel",
      courseLevel: "Temel",
    });
    expect(verdict.decision).toBe(ACADEMY_REVIEW_DECISION_C);
    expect(verdict.decision).toBe(ACADEMY_REVIEW_REVISION_TAG);
    expect(sealedAcademyReviewDecisionReply({
      decision: ACADEMY_REVIEW_DECISION_C,
      instructor: academyInstructorBySlug("python-temel"),
    })).toBe(ACADEMY_SEN.review.revisionQueued);
  });

  it("övgü ve boş yorum karara düşmez", () => {
    expect(
      classifyAcademyReviewDecision({
        comment: "Anlatım saha gibi durdu.",
        stars: 5,
        courseSlug: "python-temel",
        courseLevel: "Temel",
      }).decision,
    ).toBeNull();
    expect(
      classifyAcademyReviewDecision({ comment: "", stars: 5, courseSlug: "python-temel" }).decision,
    ).toBeNull();
  });

  it("kendi müfredatındaki konu kapsam dışı sayılmaz", () => {
    expect(
      classifyAcademyReviewDecision({
        comment: "Kubernetes kısmı netti.",
        stars: 5,
        courseSlug: "devops-ileri",
        courseLevel: "İleri",
      }).decision,
    ).toBeNull();
  });

  it("LLM JSON süzgeci A/B/C harfini karara çevirir; boş category düşer", () => {
    expect(parseAcademyReviewAiDecision('{"category":"C","correction":""}')).toEqual({
      decision: ACADEMY_REVIEW_DECISION_C,
      correction: null,
    });
    expect(
      parseAcademyReviewAiDecision('```json\n{"category":"A","correction":"Baraj 70 puandır."}\n```'),
    ).toEqual({
      decision: ACADEMY_REVIEW_DECISION_A,
      correction: "Baraj 70 puandır.",
    });
    expect(parseAcademyReviewAiDecision('{"category":"","correction":""}')).toBeNull();
    expect(parseAcademyReviewAiDecision("teşekkürler")).toBeNull();
  });
});
