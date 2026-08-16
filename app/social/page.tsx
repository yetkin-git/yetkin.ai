import { ProofFeedList } from "@/components/social/proof-feed-list";
import { ProofSyncButton } from "@/components/social/proof-sync-button";
import { loadAndSyncAuthorSquare, loadProofFeedPage } from "@/lib/social/load";
import { getSession } from "@/lib/kernel/auth/session";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { AuthNeeded } from "@/components/ui/auth-needed";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export default async function SocialPage() {
  const session = await getSession();
  const feed = session ? await loadProofFeedPage() : null;
  const mine = session ? await loadAndSyncAuthorSquare(session.id) : null;
  const copy = SEN_VOICE.social;

  return (
    <RoomFrame>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      {!session ? (
        <>
          <AuthNeeded message={copy.auth} />
          <ProofFeedList items={[]} />
        </>
      ) : feed === null ? (
        <>
          <Badge tone="amber">{copy.unbound}</Badge>
          <ProofFeedList items={[]} />
        </>
      ) : (
        <>
          <Card variant="featured" title={copy.syncTitle}>
            <ProofSyncButton />
            {mine && mine.length > 0 ? (
              <p className="mt-3 text-sm">{copy.mineCount(mine.length)}</p>
            ) : null}
          </Card>
          <ProofFeedList items={feed} />
        </>
      )}
    </RoomFrame>
  );
}
