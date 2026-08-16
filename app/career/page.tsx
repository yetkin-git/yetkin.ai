import { ProofList } from "@/components/career/proof-list";
import { loadCareerBoard } from "@/lib/career/load";
import { getSession } from "@/lib/kernel/auth/session";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { AuthNeeded } from "@/components/ui/auth-needed";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export default async function CareerPage() {
  const session = await getSession();
  const board = session ? await loadCareerBoard(session.id) : null;
  const copy = SEN_VOICE.career;

  return (
    <RoomFrame>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      {!session ? (
        <AuthNeeded message={copy.auth} />
      ) : board === null ? (
        <>
          <Badge tone="amber">{copy.unbound}</Badge>
          <ProofList stamps={[]} items={[]} showcase />
        </>
      ) : (
        <>
          <h2 className="text-lg font-semibold tracking-tight">{copy.proofsTitle}</h2>
          <ProofList stamps={board.stamps} items={board.portfolio} />
        </>
      )}
      <Card variant="glass">{copy.footnote}</Card>
    </RoomFrame>
  );
}
