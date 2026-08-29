import { describe, expect, it } from "vitest";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import {
  acceptFreelancerBid,
  createFreelancerJob,
  releaseFreelancerContract,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
import {
  isCareerUniqueViolation,
  issueCareerVisaStamp,
  syncCareerVisaStamps,
  tryIssueCareerVisaStamp,
} from "@/lib/career/engine";
import { careerPulseFromLiveBoard, projectLiveCareerBoard } from "@/lib/career/live";
import type { CareerVisaStampRecord } from "@/lib/career/types";
import { createMemoryEscrowStore, createMemoryFreelancerStore, createMemoryLedgerStore, withMemoryAcceptAtomic } from "../helpers/memory-money";
import { createMemoryAcademyStore, memoryCourse } from "../helpers/memory-academy";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "../helpers/memory-pricing";
import { createMemoryCareerProofStore, createMemoryCareerStore } from "../helpers/memory-career";

const BUYER = "buyer-1";
const CLIENT = "client-1";
const FREELANCER = "freelancer-1";
const PLATFORM = PLATFORM_TREASURY_USER_ID;
const STRANGER = "stranger-1";
const CERT_HASH = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

describe("kariyer vize mühürü", () => {
  it("akademi sertifikasını pasaport vizesine ve portföy satırına dönüştürür", async () => {
    const course = memoryCourse();
    const academyPorts = {
      ledger: createMemoryLedgerStore([
        { userId: BUYER, amountMinor: 100_000 },
        { userId: PLATFORM, amountMinor: 0 },
      ]),
      catalog: createMemoryPriceCatalogStore([
        { moduleKey: ACADEMY_MODULE_KEY, unitKey: course.catalogUnitKey, amountMinor: 10_000 },
      ]),
      locks: createMemoryCheckoutPriceLockStore(),
      academy: createMemoryAcademyStore(),
    };
    await academyPorts.academy.insertCourse(course);
    const locked = await lockAcademyCoursePrice(academyPorts, { courseId: course.id, userId: BUYER });
    const purchased = await purchaseAcademyCourse(academyPorts, {
      courseId: course.id,
      userId: BUYER,
      lockId: locked.lock.id,
      platformUserId: PLATFORM,
    });
    expect(purchased.certificate).toBeNull();
    const issuedAt = new Date("2026-08-14T00:02:00.000Z");
    const certificate = await academyPorts.academy.insertCertificate({
      id: "cert-manual",
      userId: BUYER,
      courseId: course.id,
      purchaseId: purchased.purchase.id,
      attemptId: "attempt-1",
      title: course.title,
      serialKey: CERT_HASH,
      certificateHash: CERT_HASH,
      curriculumSeal: null,
      score: 75,
      issuedAt,
      revokedAt: null,
      revokeReason: null,
      createdAt: issuedAt,
    });

    const proofs = createMemoryCareerProofStore([
      {
        sourceKind: "ACADEMY_CERTIFICATE",
        sourceId: certificate.id,
        userId: BUYER,
        actorUserIds: [BUYER],
        title: certificate.title,
        issuedAt: certificate.issuedAt,
        certificateHash: CERT_HASH,
      },
    ]);
    const careerPorts = { career: createMemoryCareerStore(), proofs };

    const issued = await issueCareerVisaStamp(careerPorts, {
      sourceKind: "ACADEMY_CERTIFICATE",
      sourceId: certificate.id,
      actorUserId: BUYER,
    });
    expect(issued.applied).toBe(true);
    expect(issued.healed).toBe(false);
    expect(issued.stamp.moduleId).toBe("academy");
    expect(issued.stamp.visaKey).toBe(`academy.certificate:${certificate.id}`);
    expect(issued.stamp.certificateHash).toBe(CERT_HASH);
    expect(issued.portfolioItem.visaStampId).toBe(issued.stamp.id);

    const again = await issueCareerVisaStamp(careerPorts, {
      sourceKind: "ACADEMY_CERTIFICATE",
      sourceId: certificate.id,
      actorUserId: BUYER,
    });
    expect(again.applied).toBe(false);
    expect(again.healed).toBe(false);
    expect(again.stamp.id).toBe(issued.stamp.id);
    expect((await careerPorts.career.listStampsForUser(BUYER)).length).toBe(1);
  });

  it("FUNDED kanıt sayılmaz; iç hakediş kilidi RELEASE vizesini keser", async () => {
    const money = withMemoryAcceptAtomic({
      ledger: createMemoryLedgerStore([
        { userId: CLIENT, amountMinor: 100_000 },
        { userId: FREELANCER, amountMinor: 0 },
        { userId: PLATFORM, amountMinor: 0 },
      ]),
      escrow: createMemoryEscrowStore(),
      freelancer: createMemoryFreelancerStore(),
    });
    const job = await createFreelancerJob(money, {
      clientId: CLIENT,
      title: "API mühürü",
      brief: "Teslim testli olacak.",
      budgetMinor: 25_000,
    });
    const bid = await submitFreelancerBid(money, {
      jobId: job.id,
      bidderId: FREELANCER,
      amountMinor: 25_000,
      coverNote: "Hazırım.",
    });
    const { contract } = await acceptFreelancerBid(money, {
      jobId: job.id,
      bidId: bid.id,
      actorUserId: CLIENT,
      holdBps: HOLD_BPS_DEFAULT,
      platformUserId: PLATFORM,
    });

    const proofs = createMemoryCareerProofStore();
    const careerPorts = { career: createMemoryCareerStore(), proofs };

    await expect(
      issueCareerVisaStamp(careerPorts, {
        sourceKind: "FREELANCER_RELEASE",
        sourceId: contract.id,
        actorUserId: CLIENT,
      }),
    ).rejects.toThrow(/Mühürlü kanıt/);

    await releaseFreelancerContract(money, {
      contractId: contract.id,
      actorUserId: CLIENT,
      platformUserId: PLATFORM,
    });
    expect(money.ledger.snapshot(FREELANCER).amountMinor).toBe(0);

    proofs.add({
      sourceKind: "FREELANCER_RELEASE",
      sourceId: contract.id,
      userId: FREELANCER,
      actorUserIds: [FREELANCER, CLIENT],
      title: job.title,
      issuedAt: new Date(),
      certificateHash: null,
    });

    const issued = await issueCareerVisaStamp(careerPorts, {
      sourceKind: "FREELANCER_RELEASE",
      sourceId: contract.id,
      actorUserId: CLIENT,
    });
    expect(issued.applied).toBe(true);
    expect(issued.healed).toBe(false);
    expect(issued.stamp.userId).toBe(FREELANCER);
    expect(issued.stamp.moduleId).toBe("freelancer");
    expect(issued.portfolioItem.title).toBe("API mühürü");

    await expect(
      issueCareerVisaStamp(careerPorts, {
        sourceKind: "FREELANCER_RELEASE",
        sourceId: contract.id,
        actorUserId: STRANGER,
      }),
    ).rejects.toThrow(/yetkiniz yok/);
  });

  it("sync kullanıcının mühürlü kanıtlarını tek seferde vizeye basar", async () => {
    const now = new Date("2026-08-14T12:00:00.000Z");
    const proofs = createMemoryCareerProofStore([
      {
        sourceKind: "ACADEMY_CERTIFICATE",
        sourceId: "cert-1",
        userId: BUYER,
        actorUserIds: [BUYER],
        title: "Rail temeli",
        issuedAt: now,
        certificateHash: CERT_HASH,
      },
      {
        sourceKind: "FREELANCER_RELEASE",
        sourceId: "contract-1",
        userId: BUYER,
        actorUserIds: [BUYER],
        title: "Landing teslim",
        issuedAt: now,
        certificateHash: null,
      },
    ]);
    const careerPorts = { career: createMemoryCareerStore(), proofs };
    const stamps = await syncCareerVisaStamps(careerPorts, { userId: BUYER, now });
    expect(stamps).toHaveLength(2);
    const again = await syncCareerVisaStamps(careerPorts, { userId: BUYER, now });
    expect(again).toHaveLength(2);
    expect((await careerPorts.career.listPortfolioForUser(BUYER)).length).toBe(2);
  });
});

function academyProof(sourceId = "cert-heal", title = "Rail temeli") {
  const issuedAt = new Date("2026-08-14T12:00:00.000Z");
  return {
    sourceKind: "ACADEMY_CERTIFICATE" as const,
    sourceId,
    userId: BUYER,
    actorUserIds: [BUYER],
    title,
    issuedAt,
    certificateHash: CERT_HASH,
  };
}

function orphanStamp(sourceId = "cert-heal"): CareerVisaStampRecord {
  const issuedAt = new Date("2026-08-14T12:00:00.000Z");
  return {
    id: "stamp-orphan",
    userId: BUYER,
    sourceKind: "ACADEMY_CERTIFICATE",
    sourceId,
    visaKey: `academy.certificate:${sourceId}`,
    moduleId: "academy",
    title: "Rail temeli",
    certificateHash: null,
    issuedAt,
    createdAt: issuedAt,
  };
}

describe("kariyer vize mühürü — atomik yazma ve heal", () => {
  it("damga yazılıp portföy düşerse stamp satırını geri alır", async () => {
    const career = createMemoryCareerStore();
    career.failNextPortfolioInsert();
    const proofs = createMemoryCareerProofStore([academyProof()]);
    await expect(
      issueCareerVisaStamp(
        { career, proofs },
        {
          sourceKind: "ACADEMY_CERTIFICATE",
          sourceId: "cert-heal",
          actorUserId: BUYER,
        },
      ),
    ).rejects.toThrow(/portföy yazımı düştü/);
    expect(await career.getStampBySource(BUYER, "ACADEMY_CERTIFICATE", "cert-heal")).toBeNull();
    expect((await career.listPortfolioForUser(BUYER)).length).toBe(0);
  });

  it("damga var portföy yoksa throw etmez; aynı atomik birimde satırı basar", async () => {
    const career = createMemoryCareerStore();
    const stamp = orphanStamp();
    await career.insertStamp(stamp);
    expect(await career.getPortfolioItemByStampId(stamp.id)).toBeNull();

    const proofs = createMemoryCareerProofStore([academyProof()]);
    const healed = await issueCareerVisaStamp(
      { career, proofs },
      { sourceKind: "ACADEMY_CERTIFICATE", sourceId: "cert-heal", actorUserId: BUYER },
    );
    expect(healed.applied).toBe(false);
    expect(healed.healed).toBe(true);
    expect(healed.stamp.id).toBe(stamp.id);
    expect(healed.portfolioItem.visaStampId).toBe(stamp.id);
    expect(healed.stamp.certificateHash).toBe(CERT_HASH);
    expect((await career.listStampsForUser(BUYER)).length).toBe(1);
    expect((await career.listPortfolioForUser(BUYER)).length).toBe(1);

    const again = await issueCareerVisaStamp(
      { career, proofs },
      { sourceKind: "ACADEMY_CERTIFICATE", sourceId: "cert-heal", actorUserId: BUYER },
    );
    expect(again.applied).toBe(false);
    expect(again.healed).toBe(false);
    expect(again.portfolioItem.id).toBe(healed.portfolioItem.id);
  });

  it("sync yarım damgayı onarır; tryIssue kanıt yokluğunu yutar, heal'i yutmaz", async () => {
    const career = createMemoryCareerStore();
    await career.insertStamp(orphanStamp("cert-1"));
    const now = new Date("2026-08-14T12:00:00.000Z");
    const proofs = createMemoryCareerProofStore([
      academyProof("cert-1"),
      academyProof("cert-2", "Ray sinyal"),
    ]);
    const stamps = await syncCareerVisaStamps({ career, proofs }, { userId: BUYER, now });
    expect(stamps).toHaveLength(2);
    expect((await career.listPortfolioForUser(BUYER)).length).toBe(2);
    expect(await career.getPortfolioItemByStampId("stamp-orphan")).not.toBeNull();

    const missing = await tryIssueCareerVisaStamp(
      { career, proofs: createMemoryCareerProofStore() },
      { sourceKind: "ACADEMY_CERTIFICATE", sourceId: "ghost", actorUserId: BUYER },
    );
    expect(missing).toBeNull();

    const orphan = createMemoryCareerStore();
    await orphan.insertStamp(orphanStamp("cert-try"));
    const healed = await tryIssueCareerVisaStamp(
      { career: orphan, proofs: createMemoryCareerProofStore([academyProof("cert-try")]) },
      { sourceKind: "ACADEMY_CERTIFICATE", sourceId: "cert-try", actorUserId: BUYER },
    );
    expect(healed).not.toBeNull();
    expect(healed?.healed).toBe(true);
    expect(healed?.portfolioItem.visaStampId).toBe("stamp-orphan");
  });

  it("eşzamanlı unique (P2002) sonrası mevcut çifti okur; kaybeden yeni damga basmaz", async () => {
    const career = createMemoryCareerStore();
    const proofs = createMemoryCareerProofStore([academyProof()]);
    const winner = await issueCareerVisaStamp(
      { career, proofs },
      { sourceKind: "ACADEMY_CERTIFICATE", sourceId: "cert-heal", actorUserId: BUYER },
    );
    career.skipNextStampLookup();
    const raced = await issueCareerVisaStamp(
      { career, proofs },
      { sourceKind: "ACADEMY_CERTIFICATE", sourceId: "cert-heal", actorUserId: BUYER },
    );
    expect(isCareerUniqueViolation(Object.assign(new Error("x"), { code: "P2002" }))).toBe(true);
    expect(isCareerUniqueViolation(new Error("Vize portföy satırı eksik."))).toBe(false);
    expect(raced.applied).toBe(false);
    expect(raced.healed).toBe(false);
    expect(raced.stamp.id).toBe(winner.stamp.id);
    expect(raced.portfolioItem.id).toBe(winner.portfolioItem.id);
    expect((await career.listStampsForUser(BUYER)).length).toBe(1);
  });

  it("P2002 damga yarışından sonra portföy yoksa heal eder", async () => {
    const career = createMemoryCareerStore();
    const stamp = orphanStamp();
    await career.insertStamp(stamp);
    career.skipNextStampLookup();
    const proofs = createMemoryCareerProofStore([academyProof()]);
    const raced = await issueCareerVisaStamp(
      { career, proofs },
      { sourceKind: "ACADEMY_CERTIFICATE", sourceId: "cert-heal", actorUserId: BUYER },
    );
    expect(raced.applied).toBe(false);
    expect(raced.healed).toBe(true);
    expect(raced.stamp.id).toBe(stamp.id);
    expect(raced.portfolioItem.visaStampId).toBe(stamp.id);
  });

  it("sertifika basılı vize yoksa yetkilendirilmiş sync ilk okumada damgayı basar", async () => {
    const career = createMemoryCareerStore();
    const proofs = createMemoryCareerProofStore([academyProof("cert-read")]);
    expect(await career.getStampBySource(BUYER, "ACADEMY_CERTIFICATE", "cert-read")).toBeNull();

    const stamps = await syncCareerVisaStamps({ career, proofs }, { userId: BUYER });
    expect(stamps).toHaveLength(1);
    expect(stamps[0]?.certificateHash).toBe(CERT_HASH);
    expect(stamps[0]?.sourceId).toBe("cert-read");
    expect((await career.listPortfolioForUser(BUYER)).length).toBe(1);

    const again = await syncCareerVisaStamps({ career, proofs }, { userId: BUYER });
    expect(again[0]?.id).toBe(stamps[0]?.id);
    expect((await career.listStampsForUser(BUYER)).length).toBe(1);
  });

  it("damga ve portföy varken certificateHash yoksa ilk okuma hash bağını onarır", async () => {
    const career = createMemoryCareerStore();
    const stamp = orphanStamp("cert-hash");
    await career.insertStamp(stamp);
    await career.insertPortfolioItem({
      id: "item-orphan",
      userId: BUYER,
      visaStampId: stamp.id,
      title: stamp.title,
      createdAt: stamp.createdAt,
    });
    const proofs = createMemoryCareerProofStore([academyProof("cert-hash")]);
    const healed = await issueCareerVisaStamp(
      { career, proofs },
      { sourceKind: "ACADEMY_CERTIFICATE", sourceId: "cert-hash", actorUserId: BUYER },
    );
    expect(healed.applied).toBe(false);
    expect(healed.healed).toBe(true);
    expect(healed.stamp.certificateHash).toBe(CERT_HASH);
    expect(healed.portfolioItem.id).toBe("item-orphan");
  });

  it("iptal kanıtı vize defteri ve nabızdan düşer; zombi damga projeksiyona girmez", async () => {
    const career = createMemoryCareerStore();
    const proofs = createMemoryCareerProofStore([academyProof("cert-live")]);
    await issueCareerVisaStamp(
      { career, proofs },
      { sourceKind: "ACADEMY_CERTIFICATE", sourceId: "cert-live", actorUserId: BUYER },
    );
    const live = await projectLiveCareerBoard({ career, proofs }, BUYER);
    expect(live.stamps).toHaveLength(1);
    expect(live.stamps[0]?.certificateHash).toBe(CERT_HASH);
    expect(careerPulseFromLiveBoard(live).visaCount).toBe(1);

    proofs.remove("ACADEMY_CERTIFICATE", "cert-live");
    const after = await projectLiveCareerBoard({ career, proofs }, BUYER);
    expect(after.stamps).toHaveLength(0);
    expect(after.portfolio).toHaveLength(0);
    expect(careerPulseFromLiveBoard(after)).toEqual({
      visaCount: 0,
      portfolioCount: 0,
      lastVisaTitle: null,
    });
    expect((await career.listStampsForUser(BUYER)).length).toBe(1);
  });
});

