import { describe, expect, it } from "vitest";
import { sha256Hex } from "@/lib/kernel/crypto/sha256";
import { ACADEMY_COURSE_SEEDS } from "@/lib/academy/seed";
import { ACADEMY_COURSE_TITLES } from "@/lib/academy/course-titles";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";
import { publishedCoursesFromSeed } from "@/lib/academy/published-catalog";
import {
  ACADEMY_LEVEL_PATHWAYS,
  ACADEMY_PATHWAY_MASTERY_VERSION,
  academyCompletedSlugsFromCertificates,
  academyPathwayBySlug,
  academyPathwayCatalogSlugs,
  academyPathwayIsMastered,
  academyPathwayNextSlug,
  academyPathwayRingSlugs,
  academyProgressionBridgeView,
  academyProgressionHref,
  buildAcademyPathwayCatalog,
  canonicalAcademyPathwayMasteryHash,
} from "@/lib/academy/level-pathway";
import {
  academyPathwayMasteryHashMap,
  academyPathwayProofHashMap,
  resolveAcademyPathwayMastery,
  resolvePublicAcademyPathwayMastery,
} from "@/lib/academy/level-pathway-mastery";
import { createMemoryAcademyStore, memoryCourse } from "../helpers/memory-academy";
import type { AcademyCertificateRecord } from "@/lib/academy/types";

const BUYER = "pathway-buyer";
const STAMP = new Date("2026-08-22T12:00:00.000Z");

function dummyHash(seed: string): string {
  return sha256Hex(`pathway-cert:${seed}`);
}

function dummyCertificate(courseId: string, revoked = false): AcademyCertificateRecord {
  const hash = dummyHash(courseId);
  return {
    id: `cert-${courseId}`,
    userId: BUYER,
    courseId,
    purchaseId: `pur-${courseId}`,
    attemptId: `att-${courseId}`,
    title: "Ustalık belgesi",
    serialKey: hash,
    certificateHash: hash,
    curriculumSeal: hash,
    score: 80,
    issuedAt: STAMP,
    revokedAt: revoked ? STAMP : null,
    revokeReason: revoked ? "test" : null,
    createdAt: STAMP,
  };
}

describe("03.37 seviye yol haritası", () => {
  it("11 canlı dikey vize kapısını taşır; mühürlü SKU pathway halkasındadır", () => {
    const slugs = [...academyPathwayCatalogSlugs()];
    expect(ACADEMY_LEVEL_PATHWAYS).toHaveLength(11);
    expect(slugs.length).toBeGreaterThanOrEqual(20);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).toContain("python-temel");
    expect(slugs).toContain("ai-temel");
    expect(slugs).toContain("ux-temel");
    expect(slugs).toContain("excel-masterclass");
    expect(slugs).toContain("canva-masterclass");
    expect(ACADEMY_COURSE_SEEDS.map((row) => row.slug)).toEqual([...ACADEMY_GROWTH_SKU_SLUGS]);
    expect(
      ACADEMY_COURSE_SEEDS.filter((row) => !new Set(slugs).has(row.slug)).map((row) => row.slug),
    ).toEqual([]);
    expect(ACADEMY_LEVEL_PATHWAYS.map((row) => row.id)).toEqual([
      "python-yazilim-veri",
      "ai-agent-mimarligi",
      "yz-muhendislik-agent",
      "fullstack-web-api",
      "siber-guvenlik-pentest",
      "uiux-tasarim-sistemleri",
      "is-uretkenligi-veri",
      "dijital-pazarlama",
      "icerik-e-ticaret",
      "pratik-beceriler-vatandas",
      "pratik-linkedin-vatandas",
    ]);
    expect(ACADEMY_LEVEL_PATHWAYS[0]?.rings).toEqual({
      Temel: "python-temel",
      Orta: "python-orta",
      İleri: "python-ileri",
    });
    expect(ACADEMY_LEVEL_PATHWAYS[1]?.rings).toEqual({
      Temel: "ai-agent-temel",
      Orta: "ai-agent-orta",
      İleri: "ai-agent-ileri",
    });
    expect(ACADEMY_LEVEL_PATHWAYS[2]?.rings).toEqual({
      Temel: "ai-temel",
    });
    expect(ACADEMY_COURSE_TITLES["python-temel"]).toBe(
      "Python ile Programlama ve Problem Çözme",
    );
    const yz = academyPathwayBySlug("ai-temel");
    expect(yz?.id).toBe("yz-muhendislik-agent");
    expect(yz?.title).toContain("Yapay Zekâ");
    expect(academyPathwayNextSlug("ai-temel")).toBeNull();
    expect(academyPathwayNextSlug("ai-agent-temel")).toBe("ai-agent-orta");
    expect(academyPathwayNextSlug("ai-agent-orta")).toBe("ai-agent-ileri");
    expect(academyPathwayNextSlug("ai-agent-ileri")).toBeNull();
    expect(academyPathwayNextSlug("python-temel")).toBe("python-orta");
    expect(academyPathwayNextSlug("python-orta")).toBe("python-ileri");
    expect(academyPathwayNextSlug("python-ileri")).toBeNull();
    expect(academyPathwayNextSlug("fullstack-temel")).toBe("fullstack-orta");
    expect(academyPathwayNextSlug("fullstack-orta")).toBe("fullstack-ileri");
    expect(academyPathwayNextSlug("fullstack-ileri")).toBeNull();
    expect(academyPathwayNextSlug("security-temel")).toBe("security-orta");
    expect(academyPathwayNextSlug("security-orta")).toBe("security-ileri");
    expect(academyPathwayNextSlug("security-ileri")).toBeNull();
    expect(academyPathwayNextSlug("mlo-temel")).toBeNull();
    expect(academyProgressionHref("ai-ileri", false)).toBe("/academy/ai-ileri");
    expect(academyProgressionHref("ai-ileri", true)).toBe("/academy/ai-ileri/oyna");
  });

  it("katalog duvarı yok: halkalar görünür; trendScore / proofOfWorkHash vitrin halkasına basılmaz", () => {
    const courses = publishedCoursesFromSeed();
    const completed = new Set(["python-temel"]);
    const views = buildAcademyPathwayCatalog({
      courses,
      completedSlugs: completed,
      masteryHashByPathway: academyPathwayMasteryHashMap(),
      highlightLevel: "Temel",
    });
    expect(views).toHaveLength(11);
    expect(views[0]?.id).toBe("python-yazilim-veri");
    const python = views.find((row) => row.id === "python-yazilim-veri");
    expect(python).toBeTruthy();
    expect(python!.mastered).toBe(false);
    expect(python!.rings).toHaveLength(3);
    expect(python!.rings[0]?.completed).toBe(true);
    expect(python!.rings[0]).not.toHaveProperty("proofOfWorkHash");
    expect(python!.rings[0]).not.toHaveProperty("trendScore");
    expect(python!.rings[0]?.highlighted).toBe(true);
    expect(python!.rings[0]?.title).toBe(ACADEMY_COURSE_TITLES["python-temel"]);
    const yz = views.find((row) => row.id === "yz-muhendislik-agent");
    expect(yz!.rings).toHaveLength(1);
    expect(yz!.rings[0]?.slug).toBe("ai-temel");
    expect(yz!.rings[0]?.completed).toBe(false);
    expect(yz!.rings[0]?.title).toBe(ACADEMY_COURSE_TITLES["ai-temel"]);
  });

  it("Amiral Ders halkası mühürlenince Tam Kapsam hash'i kararlı basılır ve kamu özeti çözer", () => {
    const python = academyPathwayBySlug("python-temel");
    expect(python).toBeTruthy();
    const proofs = academyPathwayProofHashMap();
    const hash = canonicalAcademyPathwayMasteryHash(python!, proofs, sha256Hex);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).toBe(academyPathwayMasteryHashMap()["python-yazilim-veri"]);
    const publicView = resolvePublicAcademyPathwayMastery(hash!);
    expect(publicView?.pathwayId).toBe("python-yazilim-veri");
    expect(publicView?.pathwayTitle).toContain("Python");
    expect(JSON.stringify(publicView)).not.toContain("userId");
    expect(ACADEMY_PATHWAY_MASTERY_VERSION).toContain("pathway-mastery");
    expect(resolvePublicAcademyPathwayMastery("aa".repeat(32))).toBeNull();
    const yzHash = canonicalAcademyPathwayMasteryHash(
      academyPathwayBySlug("ai-temel")!,
      proofs,
      sha256Hex,
    );
    expect(yzHash).toMatch(/^[a-f0-9]{64}$/);
    expect(yzHash).toBe(academyPathwayMasteryHashMap()["yz-muhendislik-agent"]);
    expect(resolvePublicAcademyPathwayMastery(yzHash!)?.pathwayId).toBe("yz-muhendislik-agent");
  });

  it("adayın Amiral Ders belgesi varsa dikey mühür bağlanır; iptal düşer", async () => {
    const store = createMemoryAcademyStore();
    const python = academyPathwayBySlug("python-temel")!;
    const slugs = academyPathwayRingSlugs(python);
    for (const slug of slugs) {
      const seed = ACADEMY_COURSE_SEEDS.find((row) => row.slug === slug)!;
      await store.insertCourse(memoryCourse({ id: seed.id, slug: seed.slug, title: seed.title }));
      await store.insertCertificate(dummyCertificate(seed.id));
    }
    const mastery = await resolveAcademyPathwayMastery({
      academy: store,
      userId: BUYER,
      courseSlug: "python-temel",
    });
    expect(mastery?.pathwayId).toBe("python-yazilim-veri");
    expect(mastery?.masteryHash).toBe(academyPathwayMasteryHashMap()["python-yazilim-veri"]);
    expect(JSON.stringify(mastery)).not.toContain(BUYER);
    expect(JSON.stringify(mastery)).not.toContain("userId");

    const seed = ACADEMY_COURSE_SEEDS.find((row) => row.slug === "python-temel")!;
    await store.insertCertificate(dummyCertificate(seed.id, true));
    const revoked = await resolveAcademyPathwayMastery({
      academy: store,
      userId: BUYER,
      courseSlug: "python-temel",
    });
    expect(revoked).toBeNull();
  });

  it("ilerleme köprüsü bir üst lansman veya oynatıcıya bağlar", () => {
    const open = academyProgressionBridgeView({
      currentSlug: "ai-temel",
      completedSlugs: new Set(["ai-temel"]),
      nextOwned: false,
    });
    expect(open.nextSlug).toBeNull();
    expect(open.nextHref).toBeNull();
    expect(open.mastered).toBe(true);
    const pythonDone = academyProgressionBridgeView({
      currentSlug: "python-temel",
      completedSlugs: new Set(["python-temel"]),
      nextOwned: false,
    });
    expect(pythonDone.nextHref).toBe("/academy/python-orta");
    expect(pythonDone.mastered).toBe(false);
    const yz = academyPathwayBySlug("ai-temel")!;
    const all = new Set(academyPathwayRingSlugs(yz));
    expect(academyPathwayIsMastered(yz, all)).toBe(true);
    const done = academyProgressionBridgeView({
      currentSlug: "ai-temel",
      completedSlugs: all,
      nextOwned: false,
    });
    expect(done.nextHref).toBeNull();
    expect(done.mastered).toBe(true);
  });

  it("iptal edilen belge tamamlanmış halka sayılmaz", () => {
    const courses = [
      { id: "ac_ai", slug: "ai-temel" },
      { id: "ac_ai_orta", slug: "ai-orta" },
    ];
    const slugs = academyCompletedSlugsFromCertificates(
      [
        { courseId: "ac_ai", revokedAt: null },
        { courseId: "ac_ai_orta", revokedAt: STAMP },
      ],
      courses,
    );
    expect(slugs.has("ai-temel")).toBe(true);
    expect(slugs.has("ai-orta")).toBe(false);
  });
});
