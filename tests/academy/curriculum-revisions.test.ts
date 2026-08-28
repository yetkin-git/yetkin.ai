import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ConflictError, NotFoundError } from "@/lib/kernel/http/errors";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import {
  ACADEMY_LESSON_CONTENT_VERSION_BASE,
  approveAcademyCurriculumRevision,
  bumpAcademyContentVersion,
  enqueueAcademyCurriculumRevision,
  getAcademyLessonContentVersion,
  listAcademySeedUpdateLog,
  listPendingAcademyCurriculumRevisions,
  resetAcademyCurriculumRevisionsForTests,
  REVISION_APPROVE_FORBIDDEN,
  REVISION_APPROVE_UNAUTHORIZED,
  runAcademyCurriculumRevisionApprove,
} from "@/archived/lib/academy-studio/curriculum-revisions";
import { ACADEMY_REVIEW_REVISION_TAG } from "@/archived/lib/academy-studio/moderation";

const ADMIN_ID = "11111111-1111-4111-8111-111111111111";
const CITIZEN_ID = "22222222-2222-4222-8222-222222222222";
const ORIGINAL_ADMIN = process.env.SUPER_ADMIN_USER_ID;

function queued(lessonKey: string | null = "python-temel-1") {
  return enqueueAcademyCurriculumRevision({
    reviewId: `rev-${lessonKey ?? "course"}`,
    userId: "buyer-1",
    courseId: "course-1",
    courseSlug: "python-temel",
    lessonKey,
    stars: 2,
    comment: "Parametre tablosu eksik, şema da çelişiyor.",
    decision: ACADEMY_REVIEW_REVISION_TAG,
  });
}

describe("03.33 müfredat revizyon kuyruğu", () => {
  beforeEach(() => {
    resetAcademyCurriculumRevisionsForTests();
  });

  afterEach(() => {
    if (ORIGINAL_ADMIN == null) {
      delete process.env.SUPER_ADMIN_USER_ID;
    } else {
      process.env.SUPER_ADMIN_USER_ID = ORIGINAL_ADMIN;
    }
  });

  it("v1.0 tabanını v1.1’e çeker", () => {
    expect(ACADEMY_LESSON_CONTENT_VERSION_BASE).toBe("v1.0");
    expect(bumpAcademyContentVersion("v1.0")).toBe("v1.1");
    expect(bumpAcademyContentVersion("v1.1")).toBe("v1.2");
    expect(getAcademyLessonContentVersion("python-temel-1")).toBe("v1.0");
  });

  it("yalnız REVİZYON_TALEBİ kuyruğa düşer; onay sürümü ve tohum günlüğünü yazar", () => {
    expect(
      enqueueAcademyCurriculumRevision({
        reviewId: "r-a",
        userId: "u",
        courseId: "course-1",
        courseSlug: "python-temel",
        lessonKey: "python-temel-1",
        stars: 4,
        comment: "yanılgı",
        decision: "KULLANICI_YANILGISI",
      }),
    ).toBeNull();
    expect(listPendingAcademyCurriculumRevisions()).toHaveLength(0);

    const row = queued();
    expect(row?.tag).toBe(ACADEMY_SEN.review.revisionTag);
    expect(listPendingAcademyCurriculumRevisions()).toHaveLength(1);

    const approved = approveAcademyCurriculumRevision({
      revisionId: row!.id,
      approvedBy: ADMIN_ID,
    });
    expect(approved.revision.status).toBe("APPROVED");
    expect(approved.revision.fromVersion).toBe("v1.0");
    expect(approved.revision.toVersion).toBe("v1.1");
    expect(getAcademyLessonContentVersion("python-temel-1")).toBe("v1.1");
    expect(approved.log.note).toContain("v1.0 → v1.1");
    expect(listAcademySeedUpdateLog()).toHaveLength(1);
    expect(listPendingAcademyCurriculumRevisions()).toHaveLength(0);
    expect(() =>
      approveAcademyCurriculumRevision({ revisionId: row!.id, approvedBy: ADMIN_ID }),
    ).toThrow(ConflictError);
  });

  it("olmayan talep 404; oturumsuz 401; gayri-admin 403", async () => {
    expect(() =>
      approveAcademyCurriculumRevision({ revisionId: "yok", approvedBy: ADMIN_ID }),
    ).toThrow(NotFoundError);

    process.env.SUPER_ADMIN_USER_ID = ADMIN_ID;
    const queuedRow = queued("python-temel-2");
    const unauth = await runAcademyCurriculumRevisionApprove({
      session: null,
      body: { revisionId: queuedRow!.id },
    });
    expect(unauth.status).toBe(401);
    expect(await unauth.json()).toMatchObject({
      ok: false,
      error: REVISION_APPROVE_UNAUTHORIZED,
      apiVersion: "1",
      data: null,
    });

    const forbidden = await runAcademyCurriculumRevisionApprove({
      session: { id: CITIZEN_ID, email: "vatandas@yetkin.rail" },
      body: { revisionId: queuedRow!.id },
    });
    expect(forbidden.status).toBe(403);
    expect(await forbidden.json()).toMatchObject({
      ok: false,
      error: REVISION_APPROVE_FORBIDDEN,
      apiVersion: "1",
      data: null,
    });
    expect(getAcademyLessonContentVersion("python-temel-2")).toBe("v1.0");

    const ok = await runAcademyCurriculumRevisionApprove({
      session: { id: ADMIN_ID, email: "admin@yetkin.rail" },
      body: { revisionId: queuedRow!.id },
    });
    expect(ok.status).toBe(200);
    const body = (await ok.json()) as { ok: boolean; data: { revision: { toVersion: string } } };
    expect(body.ok).toBe(true);
    expect(body.data.revision.toVersion).toBe("v1.1");
  });
});
