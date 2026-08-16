import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ProofShareActions } from "@/components/social/proof-share-actions";
import { loadProofItem } from "@/lib/social/load";
import { getSession } from "@/lib/kernel/auth/session";

export default async function SocialProofPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const item = session ? await loadProofItem(id) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Mühürlü kanıt</p>
      {!session ? (
        <Card>
          Kanıt oturum ister.{" "}
          <Link href="/login" className="text-[var(--safir)] hover:underline">
            Giriş
          </Link>
        </Card>
      ) : !item ? (
        <Card>Kanıt bulunamadı, gizlendi veya veritabanı bağlı değil.</Card>
      ) : (
        <>
          <h1 className="text-2xl font-semibold">{item.title}</h1>
          <Card>
            <p>{item.body}</p>
            <p className="mt-2 font-mono text-xs text-[var(--foreground)]">{item.passportVisaKey}</p>
            <p className="mt-1 text-xs">{item.sealedAt}</p>
          </Card>
          <Card title="İç paylaşım">
            <ProofShareActions itemId={item.id} />
          </Card>
        </>
      )}
      <Link href="/social" className="text-sm text-[var(--safir)] hover:underline">
        Meydana dön
      </Link>
    </div>
  );
}
