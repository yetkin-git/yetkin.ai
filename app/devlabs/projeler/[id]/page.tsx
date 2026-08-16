import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IssueKeyForm } from "@/components/devlabs/issue-key-form";
import { RevokeKeyButton } from "@/components/devlabs/revoke-key-button";
import { CodeBenchPanel } from "@/components/devlabs/code-bench-panel";
import { ProductionFlowStrip, WorkbenchHonestySteps } from "@/components/devlabs/workbench-honesty-steps";
import { loadProjectBoard } from "@/lib/devlabs/load";
import { requirePageSession } from "@/lib/kernel/auth/session";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { IconKey, IconLock } from "@/components/ui/icons";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export default async function DevlabsProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requirePageSession();
  const board = await loadProjectBoard(id);
  if (!board) {
    notFound();
  }
  if (session.id !== board.project.userId) {
    notFound();
  }

  const copy = SEN_VOICE.devlabs;
  const vault = copy.vault;
  const artifacts = copy.artifacts;

  return (
    <RoomFrame>
      <PageHeader
        eyebrow={copy.project.eyebrow}
        title={board.project.name}
        description={`${board.project.summary} ${copy.project.descriptionSuffix}`}
        actions={
          <LinkButton href="/devlabs" variant="outline" size="sm">
            {copy.project.back}
          </LinkButton>
        }
      />
      <WorkbenchHonestySteps />
      <ProductionFlowStrip />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="featured" title={vault.issueTitle} eyebrow={vault.issueEyebrow}>
          <p className="mb-3 flex items-center gap-2 text-sm">
            <IconKey className="h-4 w-4 text-[var(--safir-deep)]" />
            {vault.issueHint}
          </p>
          <IssueKeyForm projectId={board.project.id} />
        </Card>
        <Card variant="glass" title={vault.listTitle} eyebrow={vault.listEyebrow} bodyClassName="text-[var(--foreground)]">
          {board.keys.length === 0 ? (
            <p>{vault.empty}</p>
          ) : (
            <ul className="space-y-3">
              {board.keys.map((key) => (
                <li key={key.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {key.name} · {key.keyPrefix}…
                      </p>
                      <div className="mt-2">
                        <Badge tone={key.revokedAt ? "rose" : "emerald"}>
                          {key.revokedAt ? vault.cancelled : vault.active}
                        </Badge>
                      </div>
                    </div>
                    <IconLock className="h-4 w-4 text-[var(--muted)]" />
                  </div>
                  <div className="mt-3">
                    <RevokeKeyButton keyId={key.id} revoked={key.revokedAt !== null} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <Card variant="featured" title={copy.bench.title} eyebrow={copy.bench.eyebrow}>
        <CodeBenchPanel projectId={board.project.id} keys={board.keys} />
      </Card>
      {board.artifacts.length > 0 ? (
        <Card variant="glass" title={artifacts.title} bodyClassName="text-[var(--foreground)]">
          <ul className="space-y-3">
            {board.artifacts.map((artifact) => (
              <li key={artifact.id} className="rounded-xl border border-[var(--border)] p-3">
                <p className="text-sm">{artifact.prompt}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Linter {artifact.linterOk ? artifacts.linterOk : artifacts.linterFail} · skor {artifact.linterScore} ·
                  SHA256 {artifact.contentHash.slice(0, 16)}…
                </p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </RoomFrame>
  );
}
