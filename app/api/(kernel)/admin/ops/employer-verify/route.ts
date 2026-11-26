import { parseKurumsalEmployerVerifyBody } from "@/lib/kernel/admin/ops-desk";
import { SUPER_ADMIN_AUDIT_SEAL_MISSED, writeSuperAdminAudit } from "@/lib/kernel/admin/audit-log";
import { bindSuperAdminAuditWriter } from "@/lib/kernel/admin/prisma-super-admin-audit";
import { requireSuperAdmin } from "@/lib/kernel/auth/session";
import { getPrisma } from "@/lib/kernel/db";
import { ConflictError, NotFoundError } from "@/lib/kernel/http/errors";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { isKurumsalTaxNumber } from "@/lib/sales/kurumsal-screening";

/**
 * Kurumsal işveren kimlik doğrulaması — süper yönetici mührü.
 *
 * Neden gerekli: `/ilan/[slug]` sayfası `robots: index` kararını
 * `job.verifiedEmployerAt != null` üzerinden veriyor ve doğrulanmamış ilanı
 * "Kurumsal kimlik doğrulaması beklemede" şeridiyle **noindex** basıyor. Ama bu
 * kolonu yazan tek bir yol yoktu: rozet hiçbir zaman kazanılamıyor, ilanlar
 * kalıcı olarak aranamıyordu. Bu rota kolonu kapalı devreden çıkarır.
 *
 * Dürüstlük sınırı: otomatik sicil sorgusu yoktur. Operatör vergi/MERSİS numarasını
 * resmî kaynaktan karşılaştırır ve gerekçeyi yazar; gerekçe denetim kaydına düşer.
 * Numara biçimsel olarak geçersizse doğrulama **yapılmaz** (uydurma rozet basılmaz).
 *
 * Faz 2 (Y-03): mühür basıldığında aynı `ownerUserId` + `taxNumber` altındaki
 * tüm aktif ilanlar da doğrulanır (işveren seviyesi miras).
 */
export const auth = "admin" as const;

export async function POST(request: Request) {
  try {
    const session = await requireSuperAdmin(request);
    const body: unknown = await request.json().catch(() => null);
    const parsed = parseKurumsalEmployerVerifyBody(body);
    if ("error" in parsed) {
      return jsonFail(parsed.error, 400, undefined, request);
    }
    const prisma = getPrisma();
    const result = await prisma.$transaction(async (tx) => {
      const job = await tx.kurumsalJobPosting.findUnique({
        where: { id: parsed.jobId },
        select: {
          id: true,
          taxNumber: true,
          verifiedEmployerAt: true,
          companyName: true,
          ownerUserId: true,
          isActive: true,
        },
      });
      if (!job) {
        throw new NotFoundError("İlan yok.");
      }
      if (!isKurumsalTaxNumber(job.taxNumber)) {
        // Güncelleme rotası yok: numara ilan açılırken girilir. Eski/boş ilan
        // doğrulanamaz; operatör ilanı numarayla yeniden açar.
        throw new ConflictError(
          "İlanda vergi / MERSİS numarası yok veya geçersiz. Doğrulanamaz; numarayla yeni ilan açılmalı.",
        );
      }
      if (job.verifiedEmployerAt) {
        throw new ConflictError("İşveren zaten doğrulanmış.");
      }
      const at = new Date();
      const peerUpdate = await tx.kurumsalJobPosting.updateMany({
        where: {
          ownerUserId: job.ownerUserId,
          taxNumber: job.taxNumber,
          verifiedEmployerAt: null,
        },
        data: { verifiedEmployerAt: at },
      });
      const sealed = await writeSuperAdminAudit(bindSuperAdminAuditWriter(tx), {
        actorUserId: session.id,
        action: "employer_verify",
        target: job.id,
        detail: `${job.companyName} · ${job.taxNumber} · peers=${peerUpdate.count} · ${parsed.reason}`,
      });
      // Denetim mührü yazılamazsa doğrulama geri alınır (fail-closed).
      if (!sealed) {
        throw new ConflictError(SUPER_ADMIN_AUDIT_SEAL_MISSED);
      }
      return { at, verifiedCount: peerUpdate.count };
    });
    return jsonOk(
      {
        applied: true,
        verifiedEmployerAt: result.at.toISOString(),
        verifiedCount: result.verifiedCount,
      },
      200,
      undefined,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}
