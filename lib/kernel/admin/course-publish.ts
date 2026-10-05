import { z } from "zod";
import {
  courseRegistryBySlug,
  courseRegistryRowId,
  courseRegistryUnitKey,
} from "@yetkin/kernel/catalog-ids/course-registry";
import type { SessionUser } from "@/lib/kernel/auth/ids";
import { AuthRequiredError } from "@/lib/kernel/auth/require-session";
import { assertSuperAdminActor } from "@/lib/kernel/auth/super-admin";
import { BadRequestError, NotFoundError } from "@/lib/kernel/http/errors";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { logEvent } from "@/lib/kernel/observability/log";
import { ACADEMY_MODULE_KEY } from "@/lib/kernel/catalog/academy-module-key";
import { COURSE_PUBLISH_PATH } from "@/lib/kernel/admin/types";

export { COURSE_PUBLISH_PATH };

export const COURSE_PUBLISH_UNAUTHORIZED = "Oturum gerekli.";
export const COURSE_PUBLISH_INVALID = "Yayın gövdesi geçersiz.";
export const COURSE_PUBLISH_REASON_REQUIRED = "Yayın kararı kısa bir gerekçe ister.";
export const COURSE_PUBLISH_UNKNOWN_SLUG = "Bu kurs kayıt defterinde yok.";

const REASON_MIN = 8;
const REASON_MAX = 500;

export const coursePublishBodySchema = z
  .object({
    slug: z.string().trim().min(1).max(80),
    published: z.boolean(),
    reason: z.string().trim().min(REASON_MIN).max(REASON_MAX),
  })
  .strict();

export type CoursePublishCatalogRow = {
  id: string;
  moduleKey: string;
  unitKey: string;
  unitType: "MINOR" | "BPS";
  amountMinor: number;
  currencyCode: string;
  isActive: boolean;
  updatedBy: string | null;
};

export type CoursePublishCourseRow = {
  id: string;
  slug: string;
  isPublished: boolean;
};

export type CoursePublishInsert = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  catalogUnitKey: string;
  globalRank: number;
  localRank: number;
  trendScore: number;
  isPublished: boolean;
};

/** Katalog yazımı yalnız aktifliktir. Tutar ve updatedBy bu gövdede yoktur. */
export type CoursePublishCatalogWrite = {
  id: string;
  isActive: boolean;
  amountMinor: number;
  currencyCode: string;
  moduleKey: string;
  unitKey: string;
  unitType: "MINOR" | "BPS";
  updatedBy: string | null;
};

export type CoursePublishDraft = {
  slug: string;
  published: boolean;
  reason: string;
  actorUserId: string;
  insert: CoursePublishInsert | null;
  courseId: string | null;
  catalog: CoursePublishCatalogWrite | null;
};

export type CoursePublishStore = {
  findCourse(slug: string): Promise<CoursePublishCourseRow | null>;
  findCatalog(moduleKey: string, unitKey: string): Promise<CoursePublishCatalogRow | null>;
  commit(draft: CoursePublishDraft): Promise<void>;
};

export type CoursePublishResult = {
  slug: string;
  published: boolean;
  catalogActive: boolean | null;
};

function ranksFor(slug: string, seedRanks: { globalRank: number; localRank: number } | null) {
  if (seedRanks) {
    return {
      globalRank: seedRanks.globalRank,
      localRank: seedRanks.localRank,
      trendScore: seedRanks.globalRank * seedRanks.localRank,
    };
  }
  if (slug === "01_office_ai_ileri") {
    return { globalRank: 14, localRank: 2, trendScore: 28 };
  }
  return { globalRank: 99, localRank: 99, trendScore: 99 * 99 };
}

/**
 * Süper Admin yayın anahtarı.
 * `academy_courses.is_published` yazılır. Varsa `course:<slug>` satırının `is_active` değeri aynı yöne çekilir.
 * Fiyat tutarı ve mühür kilitleri bu komutta yoktur.
 */
export async function setAcademyCoursePublished(
  store: CoursePublishStore,
  input: {
    slug: string;
    published: boolean;
    reason: string;
    actorUserId: string;
    actorEmail?: string | null;
    actorEmailConfirmedAt?: string | null;
  },
): Promise<CoursePublishResult> {
  assertSuperAdminActor({
    id: input.actorUserId,
    email: input.actorEmail,
    emailConfirmedAt: input.actorEmailConfirmedAt,
  });

  const parsed = coursePublishBodySchema.safeParse({
    slug: input.slug,
    published: input.published,
    reason: input.reason,
  });
  if (!parsed.success) {
    const reasonIssue = parsed.error.issues.some((issue) => issue.path[0] === "reason");
    throw new BadRequestError(reasonIssue ? COURSE_PUBLISH_REASON_REQUIRED : COURSE_PUBLISH_INVALID);
  }

  const card = courseRegistryBySlug(parsed.data.slug);
  if (!card) {
    throw new NotFoundError(COURSE_PUBLISH_UNKNOWN_SLUG);
  }

  const unitKey = courseRegistryUnitKey(card.slug);
  const [course, catalog] = await Promise.all([
    store.findCourse(card.slug),
    store.findCatalog(ACADEMY_MODULE_KEY, unitKey),
  ]);

  const ranks = ranksFor(card.slug, card.seedRanks);
  const draft: CoursePublishDraft = {
    slug: card.slug,
    published: parsed.data.published,
    reason: parsed.data.published
      ? `Yayında. ${parsed.data.reason}`
      : `Pasif. ${parsed.data.reason}`,
    actorUserId: input.actorUserId,
    insert: course
      ? null
      : {
          id: courseRegistryRowId(card.slug),
          slug: card.slug,
          title: card.title,
          summary: card.summary,
          catalogUnitKey: unitKey,
          globalRank: ranks.globalRank,
          localRank: ranks.localRank,
          trendScore: ranks.trendScore,
          isPublished: parsed.data.published,
        },
    courseId: course?.id ?? null,
    catalog: catalog
      ? {
          id: catalog.id,
          isActive: parsed.data.published,
          amountMinor: catalog.amountMinor,
          currencyCode: catalog.currencyCode,
          moduleKey: catalog.moduleKey,
          unitKey: catalog.unitKey,
          unitType: catalog.unitType,
          updatedBy: catalog.updatedBy,
        }
      : null,
  };

  await store.commit(draft);
  logEvent({
    level: "info",
    event: "academy.course.publish",
    userId: input.actorUserId,
    action: parsed.data.published ? "publish" : "unpublish",
    reason: parsed.data.reason,
    route: COURSE_PUBLISH_PATH,
    applied: true,
  });

  return {
    slug: card.slug,
    published: parsed.data.published,
    catalogActive: catalog ? parsed.data.published : null,
  };
}

export async function runCoursePublish(input: {
  session: SessionUser | null;
  body: unknown;
  getStore: () => CoursePublishStore;
}) {
  try {
    if (!input.session) {
      throw new AuthRequiredError(COURSE_PUBLISH_UNAUTHORIZED);
    }
    const parsed = coursePublishBodySchema.safeParse(input.body);
    if (!parsed.success) {
      const reasonIssue = parsed.error.issues.some((issue) => issue.path[0] === "reason");
      return jsonFail(
        reasonIssue ? COURSE_PUBLISH_REASON_REQUIRED : COURSE_PUBLISH_INVALID,
        400,
      );
    }
    const result = await setAcademyCoursePublished(input.getStore(), {
      slug: parsed.data.slug,
      published: parsed.data.published,
      reason: parsed.data.reason,
      actorUserId: input.session.id,
      actorEmail: input.session.email,
      actorEmailConfirmedAt: input.session.emailConfirmedAt,
    });
    return jsonOk({
      slug: result.slug,
      published: result.published,
      catalogActive: result.catalogActive,
    });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
