"use client";

import { RoomErrorView } from "@/components/ui/room-error";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";

export default function AcademyError({
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
      eyebrow="Akademi"
      description={PUBLIC_SEN.error.rooms.academy}
      backHref="/academy"
      backLabel="Akademi kataloğu"
    />
  );
}
