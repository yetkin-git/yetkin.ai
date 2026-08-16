"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DEVLABS_SEN } from "@/lib/copy/sen-voice/devlabs";

export function RevokeKeyButton({ keyId, revoked }: { keyId: string; revoked: boolean }) {
  const router = useRouter();
  const copy = DEVLABS_SEN.vault;
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (revoked) {
    return <p className="text-xs">{copy.revoked}</p>;
  }

  async function onRevoke() {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/devlabs/keys/${keyId}/revoke`, { method: "POST" });
    const body = (await response.json()) as { ok: boolean; error?: string };
    setPending(false);
    if (!body.ok) {
      setError(body.error ?? "İptal başarısız.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-1">
      <Button type="button" variant="ghost" onClick={() => void onRevoke()} disabled={pending}>
        {pending ? copy.revoking : copy.revoke}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
