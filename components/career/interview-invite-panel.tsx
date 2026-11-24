"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CareerInterviewInviteView } from "@/lib/career/interview-types";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

export function InterviewInvitePanel({
  initialInvites,
}: {
  initialInvites: CareerInterviewInviteView[];
}) {
  const [invites, setInvites] = useState(initialInvites);
  const [pendingId, setPendingId] = useState("");
  const [error, setError] = useState("");

  async function respond(inviteId: string, decision: "ACCEPTED" | "DECLINED") {
    setPendingId(inviteId);
    setError("");
    try {
      const response = await fetch(
        "/api/career/interview",
        withRailApiVersion({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inviteId, decision }),
        }),
      );
      const parsed = parseRailClientJson<{
        id: string;
        status: "ACCEPTED" | "DECLINED";
        respondedAt: string | null;
        requesterName: string;
      }>(await response.json().catch(() => null));
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }
      setInvites((rows) =>
        rows.map((row) =>
          row.id === inviteId
            ? {
                ...row,
                status: parsed.data.status,
                respondedAt: parsed.data.respondedAt,
              }
            : row,
        ),
      );
    } catch {
      setError("Yanıt kaydedilemedi.");
    } finally {
      setPendingId("");
    }
  }

  if (invites.length === 0) {
    return null;
  }

  return (
    <Card title="Görüşme davetleri" eyebrow="Vitrin">
      <p className="mb-3 text-sm text-[var(--muted)]">
        İşveren görüşme daveti gönderdi. Para platformdan geçmez. Senin e-postan bu kartta yoktur.
      </p>
      {error ? <p className="mb-2 text-sm text-rose-700">{error}</p> : null}
      <ul className="grid gap-3">
        {invites.map((invite) => (
          <li
            key={invite.id}
            className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-muted)] p-3"
          >
            <p className="text-sm font-medium">{invite.requesterName}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{invite.requesterEmail}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-5">{invite.message}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              {invite.status === "PENDING"
                ? "Bekliyor"
                : invite.status === "ACCEPTED"
                  ? "Kabul edildi"
                  : "Reddedildi"}
            </p>
            {invite.status === "PENDING" ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={pendingId === invite.id}
                  onClick={() => void respond(invite.id, "ACCEPTED")}
                >
                  Kabul Et
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pendingId === invite.id}
                  onClick={() => void respond(invite.id, "DECLINED")}
                >
                  Reddet
                </Button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </Card>
  );
}
