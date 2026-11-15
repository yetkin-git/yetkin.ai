import "server-only";

import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { isSuperAdminActor, type SuperAdminActor } from "@/lib/kernel/auth/super-admin";
import { getPrisma } from "@/lib/kernel/db";
import {
  socialConnectionCards,
  type SocialBoardView,
  type SocialModule,
  type SocialPlatform,
  type SocialPostStatus,
  type SocialQueueItemView,
} from "@/lib/kernel/admin/social-desk";
import { loadMergedSocialEnv, socialKeyReport } from "@/lib/kernel/admin/social-env";

export type SocialBoardResult =
  | { access: "forbidden" }
  | { access: "unavailable"; connections: SocialBoardView["connections"] }
  | { access: "ok"; board: SocialBoardView };

export async function loadSocialBoard(actor: SuperAdminActor): Promise<SocialBoardResult> {
  if (!isSupabaseUserId(actor.id) || !isSuperAdminActor(actor)) {
    return { access: "forbidden" };
  }
  const connections = socialConnectionCards(socialKeyReport(loadMergedSocialEnv()));
  try {
    const rows = await getPrisma().socialPostQueueItem.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
    });
    return {
      access: "ok",
      board: {
        connections,
        items: rows.map(
          (row): SocialQueueItemView => ({
            id: row.id,
            module: row.module as SocialModule,
            platform: row.platform as SocialPlatform,
            title: row.title,
            body: row.body,
            imageUrl: row.imageUrl,
            imagePrompt: row.imagePrompt,
            targetUrl: row.targetUrl,
            status: row.status as SocialPostStatus,
            externalPostId: row.externalPostId,
            lastError: row.lastError,
            createdAt: row.createdAt.toISOString(),
          }),
        ),
      },
    };
  } catch {
    return { access: "unavailable", connections };
  }
}
