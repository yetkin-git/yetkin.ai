"use client";

import { RoomErrorView } from "@/components/ui/room-error";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";

export default function MagazamError({
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
      eyebrow="Mağazam"
      description={PUBLIC_SEN.error.rooms.magazam}
      backHref="/panel/e-ticaret"
      backLabel={PUBLIC_SEN.error.panelBack}
      retryLabel={PUBLIC_SEN.error.panelRetry}
    />
  );
}
