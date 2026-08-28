"use client";

import { RoomErrorView } from "@/components/ui/room-error";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";

export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <RoomErrorView
      error={error}
      retry={retry}
      eyebrow="Anasayfa"
      description={PUBLIC_SEN.error.rooms.dashboard}
      backHref="/dashboard"
      backLabel="Panele dön"
    />
  );
}
