import { describe, expect, it } from "vitest";
import {
  buildCredentialJsonLd,
  buildJobPostingJsonLd,
  buildTalentDirectoryJsonLd,
} from "@/lib/copy/json-ld";
import {
  resolveTalentDirectoryPagination,
  TALENT_DIRECTORY_PAGE_SIZE_DEFAULT,
  TALENT_DIRECTORY_PAGE_SIZE_MAX,
  TALENT_DIRECTORY_TAKE_MAX,
} from "@/lib/career/talent-directory-load";
import { yetkinCvStartSchema, yetkinCvSubmitSchema, parseYetkinCvStart } from "@/lib/career/yetkincv";

describe("Y8 / F2.3 — JSON-LD yardımcıları", () => {
  it("JobPosting şeması üretir", () => {
    const node = buildJobPostingJsonLd({
      title: "Depo Sorumlusu",
      description: "Ağırlıklı YetkinCV eleme ile başvuru.",
      slug: "depo-sorumlusu-abc",
      companyName: "Örnek A.Ş.",
      datePosted: "2026-11-24T10:00:00.000Z",
      validThrough: "2026-12-31T20:59:59.999Z",
    });
    expect(node["@type"]).toBe("JobPosting");
    expect(node.title).toBe("Depo Sorumlusu");
    expect(node.hiringOrganization).toMatchObject({ name: "Örnek A.Ş." });
  });

  it("ItemList + Person hasCredential üretir", () => {
    const node = buildTalentDirectoryJsonLd({
      name: "Uzmanlar",
      path: "/uzmanlar",
      experts: [
        {
          name: "Rozet sahibi",
          path: "/vize/" + "a".repeat(64),
          credentialName: "E-Ticaret · Operasyon",
          credentialUrl: "/vize/" + "a".repeat(64),
        },
      ],
    });
    expect(node["@type"]).toBe("ItemList");
    const first = (node.itemListElement as { item: { "@type": string; hasCredential: { "@type": string } } }[])[0];
    expect(first?.item["@type"]).toBe("Person");
    expect(first?.item.hasCredential["@type"]).toBe("EducationalOccupationalCredential");
  });

  it("EducationalOccupationalCredential üretir", () => {
    const node = buildCredentialJsonLd({
      name: "YetkinCV 90/100",
      description: "E-Ticaret",
      path: "/vize/" + "b".repeat(64),
      issuedAt: "2026-11-24T10:00:00.000Z",
      score: 90,
    });
    expect(node["@type"]).toBe("EducationalOccupationalCredential");
    expect(node.credentialCategory).toBe("certificate");
  });
});

describe("O2 / F2.7 — dizin sayfalama", () => {
  it("varsayılan page/pageSize ve üst sınır uygular", () => {
    expect(resolveTalentDirectoryPagination({})).toEqual({
      page: 1,
      pageSize: TALENT_DIRECTORY_PAGE_SIZE_DEFAULT,
      take: TALENT_DIRECTORY_PAGE_SIZE_DEFAULT,
      skip: 0,
    });
    expect(resolveTalentDirectoryPagination({ page: 2, pageSize: 999 }).take).toBe(
      TALENT_DIRECTORY_PAGE_SIZE_MAX,
    );
    expect(TALENT_DIRECTORY_TAKE_MAX).toBe(200);
    expect(resolveTalentDirectoryPagination({ page: "3", take: "10" })).toMatchObject({
      page: 3,
      take: 10,
      skip: 20,
    });
  });
});

describe("O8 — YetkinCV Zod standardizasyonu", () => {
  it("start/submit Zod şemalarıyla uyumlu", () => {
    expect(yetkinCvStartSchema.safeParse({ roleId: "x", verticalId: "y", cvText: "kısa" }).success).toBe(
      false,
    );
    const start = parseYetkinCvStart({
      roleId: "corporate",
      verticalId: "ecommerce",
      cvText: "a".repeat(40),
    });
    expect(start.ok).toBe(true);
    expect(
      yetkinCvSubmitSchema.safeParse({
        sittingId: "sitting01",
        answers: [{ questionId: "q1", choiceIndex: 1 }],
      }).success,
    ).toBe(true);
    expect(
      yetkinCvSubmitSchema.safeParse({
        sittingId: "bad",
        answers: [{ questionId: "q1", choiceIndex: 99 }],
      }).success,
    ).toBe(false);
  });
});
