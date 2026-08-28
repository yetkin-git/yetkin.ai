"use client";

import { RoomErrorView } from "@/components/ui/room-error";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";

export default function CareerError({
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
      eyebrow="Kariyer"
      description={PUBLIC_SEN.error.rooms.career}
      backHref="/career"
      backLabel="Vize defteri"
    />
  );
}
