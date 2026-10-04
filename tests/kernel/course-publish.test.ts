import { describe, expect, it } from "vitest";
import { NotFoundError } from "@/lib/kernel/http/errors";
import {
  COURSE_PUBLISH_REASON_REQUIRED,
  setAcademyCoursePublished,
  type CoursePublishDraft,
  type CoursePublishStore,
} from "@/lib/kernel/admin/course-publish";
import { CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT } from "@/lib/kernel/auth/super-admin";

const ADMIN_ID = "11111111-1111-4111-8111-111111111111";
const CONFIRMED = "2026-01-01T00:00:00.000Z";
const ADMIN = {
  id: ADMIN_ID,
  email: CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT,
  emailConfirmedAt: CONFIRMED,
};
const CITIZEN = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "vatandas@yetkin.rail",
  emailConfirmedAt: CONFIRMED,
};

function memoryStore(input?: {
  published?: boolean;
  amountMinor?: number;
  updatedBy?: string | null;
  catalog?: boolean;
  course?: boolean;
}): { store: CoursePublishStore; drafts: CoursePublishDraft[] } {
  const drafts: CoursePublishDraft[] = [];
  const amountMinor = input?.amountMinor ?? 99_000;
  const updatedBy = input?.updatedBy === undefined ? "operator-1" : input.updatedBy;
  const store: CoursePublishStore = {
    async findCourse(slug) {
      if (input?.course === false) {
        return null;
      }
      return { id: `ac_${slug}`, slug, isPublished: input?.published ?? true };
    },
    async findCatalog() {
      if (input?.catalog === false) {
        return null;
      }
      return {
        id: "cat_academy_course_02_ecommerce_ai",
        moduleKey: "academy",
        unitKey: "course:02_ecommerce_ai",
        unitType: "MINOR",
        amountMinor,
        currencyCode: "TRY",
        isActive: true,
        updatedBy,
      };
    },
    async commit(draft) {
      drafts.push(draft);
    },
  };
  return { store, drafts };
}

describe("süper admin yayın anahtarı", () => {
  it("pasife alırken tutarı ve updatedBy değerini yerinde bırakır", async () => {
    const { store, drafts } = memoryStore({ amountMinor: 99_000, updatedBy: "operator-1" });
    const result = await setAcademyCoursePublished(store, {
      ...ADMIN,
      actorUserId: ADMIN.id,
      actorEmail: ADMIN.email,
      actorEmailConfirmedAt: ADMIN.emailConfirmedAt,
      slug: "02_ecommerce_ai",
      published: false,
      reason: "Vitrinden bir süre çekiyorum.",
    });
    expect(result).toEqual({
      slug: "02_ecommerce_ai",
      published: false,
      catalogActive: false,
    });
    const draft = drafts[0];
    expect(draft?.insert).toBeNull();
    expect(draft?.catalog?.isActive).toBe(false);
    expect(draft?.catalog?.amountMinor).toBe(99_000);
    expect(draft?.catalog?.updatedBy).toBe("operator-1");
    expect(draft?.reason.startsWith("Pasif.")).toBe(true);
    expect(JSON.stringify(draft?.catalog)).not.toContain("newAmount");
  });

  it("satır yoksa kursu ekler; fiyat satırı yoksa tutar uydurmaz", async () => {
    const { store, drafts } = memoryStore({ course: false, catalog: false });
    const result = await setAcademyCoursePublished(store, {
      actorUserId: ADMIN.id,
      actorEmail: ADMIN.email,
      actorEmailConfirmedAt: ADMIN.emailConfirmedAt,
      slug: "02_ecommerce_ai",
      published: true,
      reason: "Satırı ilk kez açıyorum.",
    });
    expect(result.catalogActive).toBeNull();
    expect(drafts[0]?.insert?.isPublished).toBe(true);
    expect(drafts[0]?.insert?.id).toBe("ac_02_ecommerce_ai");
    expect(drafts[0]?.catalog).toBeNull();
  });

  it("kayıt defterinde olmayan slug ve kısa gerekçe yazılmaz", async () => {
    const { store } = memoryStore();
    await expect(
      setAcademyCoursePublished(store, {
        actorUserId: ADMIN.id,
        actorEmail: ADMIN.email,
        actorEmailConfirmedAt: ADMIN.emailConfirmedAt,
        slug: "python-temel",
        published: true,
        reason: "Bu kursu açıyorum.",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      setAcademyCoursePublished(store, {
        actorUserId: ADMIN.id,
        actorEmail: ADMIN.email,
        actorEmailConfirmedAt: ADMIN.emailConfirmedAt,
        slug: "02_ecommerce_ai",
        published: false,
        reason: "kısa",
      }),
    ).rejects.toThrow(COURSE_PUBLISH_REASON_REQUIRED);
  });

  it("vatandaş bu komutu çağıramaz", async () => {
    const { store, drafts } = memoryStore();
    await expect(
      setAcademyCoursePublished(store, {
        actorUserId: CITIZEN.id,
        actorEmail: CITIZEN.email,
        actorEmailConfirmedAt: CITIZEN.emailConfirmedAt,
        slug: "02_ecommerce_ai",
        published: false,
        reason: "Vatandaş kapatamaz.",
      }),
    ).rejects.toThrow(/Super Admin/);
    expect(drafts).toHaveLength(0);
  });
});
