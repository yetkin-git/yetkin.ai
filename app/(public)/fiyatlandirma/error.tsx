"use client";

import { RoomErrorView } from "@/components/ui/room-error";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";

export default function FiyatlandirmaError({
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
      eyebrow="Fiyatlar"
      description={PUBLIC_SEN.error.rooms.fiyatlandirma}
      backHref="/dashboard"
      backLabel={PUBLIC_SEN.error.panelBack}
      retryLabel={PUBLIC_SEN.error.panelRetry}
    />
  );
}
