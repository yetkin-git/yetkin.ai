import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ServiceUnavailableError,
} from "@/lib/kernel/http/errors";
import type { SocialDraft, SocialEdit, SocialPostStatus } from "@/lib/kernel/admin/social-desk";
import { publishTextIssue } from "@/lib/kernel/admin/social-desk";
import { loadMergedSocialEnv, readSocialCredentials } from "@/lib/kernel/admin/social-env";
import { publishSocialDraft, type SocialPublishOutcome } from "@/lib/kernel/admin/social-publish";

export async function createSocialDrafts(actorUserId: string, drafts: SocialDraft[]): Promise<number> {
  const prisma = getPrisma();
  try {
    await prisma.$transaction(
      drafts.map((draft) =>
        prisma.socialPostQueueItem.create({
          data: {
            module: draft.module,
            platform: draft.platform,
            title: draft.title,
            body: draft.body,
            imagePrompt: draft.imagePrompt,
            targetUrl: draft.targetUrl,
            status: "DRAFT",
            actorUserId,
          },
        }),
      ),
    );
  } catch {
    throw new ServiceUnavailableError("Sosyal masa yazılamadı.");
  }
  return drafts.length;
}

export async function saveSocialDraft(edit: SocialEdit): Promise<void> {
  const prisma = getPrisma();
  const row = await prisma.socialPostQueueItem.findUnique({ where: { id: edit.id } });
  if (!row) {
    throw new NotFoundError("Taslak yok.");
  }
  if (row.status === "PUBLISHED") {
    throw new ConflictError("Yayınlanmış satır değişmez.");
  }
  await prisma.socialPostQueueItem.update({
    where: { id: edit.id },
    data: {
      title: edit.title,
      body: edit.body,
      imageUrl: edit.imageUrl,
      imagePrompt: edit.imagePrompt,
      targetUrl: edit.targetUrl,
      lastError: "",
    },
  });
}

export async function publishSocialQueueItem(edit: SocialEdit): Promise<{
  published: boolean;
  status: SocialPostStatus;
  reason: string;
  externalPostId: string | null;
}> {
  const prisma = getPrisma();
  const row = await prisma.socialPostQueueItem.findUnique({ where: { id: edit.id } });
  if (!row) {
    throw new NotFoundError("Taslak yok.");
  }
  if (row.status === "PUBLISHED") {
    throw new ConflictError("Bu satır zaten yayında.");
  }
  const issue = publishTextIssue(row.platform, edit.body);
  await prisma.socialPostQueueItem.update({
    where: { id: edit.id },
    data: {
      title: edit.title,
      body: edit.body,
      imageUrl: edit.imageUrl,
      imagePrompt: edit.imagePrompt,
      targetUrl: edit.targetUrl,
      lastError: issue ?? "",
    },
  });
  if (issue) {
    throw new BadRequestError(issue);
  }
  if (row.platform === "INSTAGRAM" && !edit.imageUrl) {
    const reason = "Instagram görsel URL ister. Görselsiz paylaşım yazılmaz.";
    await prisma.socialPostQueueItem.update({
      where: { id: edit.id },
      data: { lastError: reason },
    });
    return { published: false, status: row.status, reason, externalPostId: null };
  }
  let outcome: SocialPublishOutcome;
  try {
    outcome = await publishSocialDraft(
      {
        platform: row.platform,
        title: edit.title,
        body: edit.body,
        imageUrl: edit.imageUrl,
        targetUrl: edit.targetUrl,
      },
      readSocialCredentials(loadMergedSocialEnv()),
    );
  } catch {
    const reason = "Yayın çağrısı tamamlanamadı.";
    await prisma.socialPostQueueItem.update({
      where: { id: edit.id },
      data: { status: "FAILED", lastError: reason },
    });
    return { published: false, status: "FAILED", reason, externalPostId: null };
  }
  if (!outcome.ok) {
    const status: SocialPostStatus = outcome.attempted ? "FAILED" : row.status;
    await prisma.socialPostQueueItem.update({
      where: { id: edit.id },
      data: {
        status,
        lastError: outcome.reason.slice(0, 500),
        externalPostId: outcome.externalPostId,
      },
    });
    return {
      published: false,
      status,
      reason: outcome.reason,
      externalPostId: outcome.externalPostId,
    };
  }
  await prisma.socialPostQueueItem.update({
    where: { id: edit.id },
    data: {
      status: "PUBLISHED",
      externalPostId: outcome.externalPostId,
      lastError: "",
      publishedAt: new Date(),
    },
  });
  return {
    published: true,
    status: "PUBLISHED",
    reason: "",
    externalPostId: outcome.externalPostId,
  };
}
