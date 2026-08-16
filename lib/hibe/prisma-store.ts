import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { parseCurrencyCode } from "@/lib/kernel/money/currency";
import type {
  GrantApplicationRecord,
  GrantProgramRecord,
  HibeStore,
} from "@/lib/hibe/types";

function toProgram(row: {
  id: string;
  slug: string;
  title: string;
  summary: string;
  agency: GrantProgramRecord["agency"];
  jurisdiction: string;
  applicantKind: GrantProgramRecord["applicantKind"];
  sectorTags: string[];
  requiresTaxId: boolean;
  applicationGuide: string;
  maxAwardMinor: number | null;
  currencyCode: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}): GrantProgramRecord {
  return {
    ...row,
    maxAwardMinor: row.maxAwardMinor == null ? null : toAmountMinor(row.maxAwardMinor),
    currencyCode: parseCurrencyCode(row.currencyCode),
  };
}

function toApplication(row: {
  id: string;
  userId: string;
  programId: string;
  companyHint: string | null;
  status: GrantApplicationRecord["status"];
  openedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): GrantApplicationRecord {
  return { ...row };
}

export function createPrismaHibeStore(): HibeStore {
  const prisma = getPrisma();
  return {
    async insertProgram(program) {
      const row = await prisma.grantProgram.create({
        data: {
          id: program.id,
          slug: program.slug,
          title: program.title,
          summary: program.summary,
          agency: program.agency,
          jurisdiction: program.jurisdiction,
          applicantKind: program.applicantKind,
          sectorTags: program.sectorTags,
          requiresTaxId: program.requiresTaxId,
          applicationGuide: program.applicationGuide,
          maxAwardMinor: program.maxAwardMinor,
          currencyCode: program.currencyCode,
          isPublished: program.isPublished,
          createdAt: program.createdAt,
          updatedAt: program.updatedAt,
        },
      });
      return toProgram(row);
    },
    async getProgram(id) {
      const row = await prisma.grantProgram.findUnique({ where: { id } });
      return row ? toProgram(row) : null;
    },
    async getProgramBySlug(slug) {
      const row = await prisma.grantProgram.findUnique({ where: { slug } });
      return row ? toProgram(row) : null;
    },
    async listPublishedPrograms() {
      const rows = await prisma.grantProgram.findMany({
        where: { isPublished: true },
        orderBy: { title: "asc" },
      });
      return rows.map(toProgram);
    },
    async insertApplication(application) {
      const row = await prisma.grantApplication.create({
        data: {
          id: application.id,
          userId: application.userId,
          programId: application.programId,
          companyHint: application.companyHint,
          status: application.status,
          openedAt: application.openedAt,
          completedAt: application.completedAt,
          createdAt: application.createdAt,
          updatedAt: application.updatedAt,
        },
      });
      return toApplication(row);
    },
    async getApplication(id) {
      const row = await prisma.grantApplication.findUnique({ where: { id } });
      return row ? toApplication(row) : null;
    },
    async getApplicationByUserAndProgram(userId, programId) {
      const row = await prisma.grantApplication.findUnique({
        where: { userId_programId: { userId, programId } },
      });
      return row ? toApplication(row) : null;
    },
    async listApplicationsForUser(userId) {
      const rows = await prisma.grantApplication.findMany({
        where: { userId },
        orderBy: { openedAt: "desc" },
      });
      return rows.map(toApplication);
    },
    async updateApplication(id, patch) {
      const row = await prisma.grantApplication.update({
        where: { id },
        data: patch,
      });
      return toApplication(row);
    },
    async pulseCountsForUser(userId) {
      const [applicationsOpen, applicationsDone] = await Promise.all([
        prisma.grantApplication.count({ where: { userId, status: "GUIDE_OPEN" } }),
        prisma.grantApplication.count({ where: { userId, status: "CHECKLIST_DONE" } }),
      ]);
      return { applicationsOpen, applicationsDone };
    },
  };
}
