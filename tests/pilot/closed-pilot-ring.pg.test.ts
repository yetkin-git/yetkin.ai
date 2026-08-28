import { describe, expect, it } from "vitest";
import { revokeAcademyCertificate } from "@/lib/academy/certificate-lifecycle";
import {
  resolvePublicAcademyCertificate,
  toPublicAcademyCertificateWire,
} from "@/lib/academy/certificate-verify";
import { completeAcademyCurriculum } from "@/lib/academy/curriculum-engine";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import {
  getAcademyIssuedCertificateProof,
  listAcademyIssuedCertificateProofs,
} from "@/lib/academy/issued-certificates";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { railV1PublicAcademyCertificateDataSchema } from "@/lib/kernel/http/v1-contract";
import { createPrismaAcademyPorts } from "@/lib/academy/runtime";
import { issueCareerVisaStamp } from "@/lib/career/engine";
import { createPrismaCareerPorts } from "@/lib/career/runtime";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import {
  acceptFreelancerBid,
  createFreelancerJob,
  releaseFreelancerContract,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";
import { FREELANCER_JOB_MIN_MINOR } from "@/lib/freelancer/schemas";
import { submitAcademyExamWithFreshSitting } from "../helpers/academy-exam-sitting";
import {
  creditLabWallet,
  insertLabCitizen,
  labPrisma,
  labUserId,
  labWalletMinor,
} from "../helpers/pg-lab";

const COURSE_ID = "ac_rail_temel";
const COURSE_PRICE = 25_000;

describe("Kapalı pilot halkası — gerçek Postgres", () => {
  it("Akademi → hash doğrulama → kariyer vizesi → ilan/teklif; release split; iptal kamu revoked basar", async () => {
    const learnerId = labUserId("learner");
    const clientId = labUserId("client");
    const workerId = labUserId("worker");
    await insertLabCitizen({ id: learnerId, email: `learner-${learnerId}@lab.rail` });
    await insertLabCitizen({ id: clientId, email: `client-${clientId}@lab.rail` });
    await insertLabCitizen({ id: workerId, email: `worker-${workerId}@lab.rail` });
    await creditLabWallet({ userId: learnerId, amountMinor: 100_000, purpose: "pilot-learner" });
    await creditLabWallet({ userId: clientId, amountMinor: 100_000, purpose: "pilot-client" });

    const academy = createPrismaAcademyPorts();
    const locked = await lockAcademyCoursePrice(academy, { courseId: COURSE_ID, userId: learnerId });
    const purchased = await purchaseAcademyCourse(academy, {
      courseId: COURSE_ID,
      userId: learnerId,
      lockId: locked.lock.id,
      platformUserId: PLATFORM_TREASURY_USER_ID,
    });
    expect(purchased.applied).toBe(true);
    expect(purchased.purchase.status).toBe("SETTLED");
    expect(purchased.purchase.amountMinor).toBe(COURSE_PRICE);
    expect(await labWalletMinor(learnerId)).toBe(100_000 - COURSE_PRICE);

    await completeAcademyCurriculum(academy, { courseId: COURSE_ID, userId: learnerId });
    const exam = await submitAcademyExamWithFreshSitting(academy, {
      courseId: COURSE_ID,
      userId: learnerId,
    });
    expect(exam.passed).toBe(true);
    expect(exam.certificate?.certificateHash).toMatch(/^[a-f0-9]{64}$/);
    const hash = exam.certificate!.certificateHash!;

    const publicValid = await resolvePublicAcademyCertificate(academy.academy, hash);
    expect(publicValid.status).toBe("found");
    if (publicValid.status === "found") {
      expect(publicValid.view.sealStatus).toBe("valid");
      expect(publicValid.view.integrityKind).toBe("sha256-content-digest");
      expect(JSON.stringify(publicValid.view)).not.toContain(learnerId);
    }

    const career = createPrismaCareerPorts();
    const visa = await issueCareerVisaStamp(career, {
      sourceKind: "ACADEMY_CERTIFICATE",
      sourceId: exam.certificate!.id,
      actorUserId: learnerId,
    });
    expect(visa.applied).toBe(true);
    expect(visa.stamp.certificateHash).toBe(hash);

    const freelancer = createPrismaFreelancerPorts();
    const job = await createFreelancerJob(freelancer, {
      clientId,
      title: "Kapalı pilot ikon seti",
      brief: "Kamu hash sonrası teklif halkası.",
      budgetMinor: FREELANCER_JOB_MIN_MINOR,
    });
    const bid = await submitFreelancerBid(freelancer, {
      jobId: job.id,
      bidderId: workerId,
      amountMinor: FREELANCER_JOB_MIN_MINOR,
      coverNote: "Hazırım.",
    });
    const accepted = await acceptFreelancerBid(freelancer, {
      jobId: job.id,
      bidId: bid.id,
      actorUserId: clientId,
      holdBps: HOLD_BPS_DEFAULT,
    });
    expect(accepted.applied).toBe(true);
    expect(accepted.contract.status).toBe("FUNDED");
    expect(await labWalletMinor(clientId)).toBe(100_000 - FREELANCER_JOB_MIN_MINOR);
    expect(await labWalletMinor(workerId)).toBe(0);

    const released = await releaseFreelancerContract(freelancer, {
      contractId: accepted.contract.id,
      actorUserId: clientId,
    });
    expect(released.status).toBe("RELEASED");
    expect(await labWalletMinor(workerId)).toBe(0);
    const workerCredits = await labPrisma().ledgerEntry.findMany({
      where: { userId: workerId, direction: "CREDIT" },
    });
    expect(workerCredits).toHaveLength(0);
    const hold = await labPrisma().escrowHold.findUniqueOrThrow({
      where: { id: accepted.contract.escrowHoldId },
    });
    expect(hold.status).toBe("RELEASED");
    expect(hold.grossMinor).toBe(hold.holdMinor + hold.netMinor);

    const revokedAt = new Date("2026-08-20T01:00:00.000Z");
    const revoked = await revokeAcademyCertificate(academy.academy, {
      hash,
      reason: "Kapalı pilot iptal denemesi.",
      now: revokedAt,
    });
    expect(revoked.applied).toBe(true);
    expect(revoked.certificate.certificateHash).toBe(hash);

    const publicRevoked = await resolvePublicAcademyCertificate(academy.academy, hash);
    expect(publicRevoked.status).toBe("found");
    if (publicRevoked.status === "found") {
      expect(publicRevoked.view.sealStatus).toBe("revoked");
      expect(publicRevoked.view.revokedAt?.toISOString()).toBe(revokedAt.toISOString());
    }
    expect(await listAcademyIssuedCertificateProofs(learnerId)).toEqual([]);
    expect(await getAcademyIssuedCertificateProof(exam.certificate!.id)).toBeNull();
    await expect(
      issueCareerVisaStamp(career, {
        sourceKind: "ACADEMY_CERTIFICATE",
        sourceId: exam.certificate!.id,
        actorUserId: learnerId,
      }),
    ).rejects.toThrow("Mühürlü kanıt bulunamadı");
    const stampAfter = await labPrisma().careerVisaStamp.findUniqueOrThrow({
      where: { id: visa.stamp.id },
    });
    expect(stampAfter.certificateHash).toBe(hash);
    if (publicRevoked.status === "found") {
      const wire = toPublicAcademyCertificateWire(publicRevoked.view);
      expect(railV1PublicAcademyCertificateDataSchema.safeParse(wire)).toMatchObject({
        success: true,
        data: { sealStatus: "revoked", certificateHash: hash },
      });
    }
    expect(SEN_VOICE.academy.verify.revoked).toBe("İptal edildi");
    expect(SEN_VOICE.academy.verify.revokedBody).toMatch(/sicil bu belgeyi iptal etti/);
    expect(await labPrisma().ledgerEntry.findMany({ where: { userId: workerId } })).toEqual([]);
  });

  it("ikinci kohort üyesi akademi halkasını bağımsız tekrarlar", async () => {
    const learnerId = labUserId("learner-2");
    await insertLabCitizen({ id: learnerId, email: `learner2-${learnerId}@lab.rail` });
    await creditLabWallet({ userId: learnerId, amountMinor: 100_000, purpose: "pilot-learner-2" });
    const academy = createPrismaAcademyPorts();
    const locked = await lockAcademyCoursePrice(academy, { courseId: COURSE_ID, userId: learnerId });
    const purchased = await purchaseAcademyCourse(academy, {
      courseId: COURSE_ID,
      userId: learnerId,
      lockId: locked.lock.id,
      platformUserId: PLATFORM_TREASURY_USER_ID,
    });
    expect(purchased.applied).toBe(true);
    await completeAcademyCurriculum(academy, { courseId: COURSE_ID, userId: learnerId });
    const exam = await submitAcademyExamWithFreshSitting(academy, {
      courseId: COURSE_ID,
      userId: learnerId,
    });
    expect(exam.passed).toBe(true);
    const publicValid = await resolvePublicAcademyCertificate(
      academy.academy,
      exam.certificate!.certificateHash!,
    );
    expect(publicValid.status).toBe("found");
    if (publicValid.status === "found") {
      expect(publicValid.view.sealStatus).toBe("valid");
    }
  });
});
