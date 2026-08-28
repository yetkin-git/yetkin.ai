"use client";

import { RoomErrorView } from "@/components/ui/room-error";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";

export default function FreelancerError({
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
      eyebrow="Freelancer"
      description={PUBLIC_SEN.error.rooms.freelancer}
      backHref="/freelancer"
      backLabel="Freelancer tezgâhı"
    />
  );
}
