import { Card } from "@/components/ui/card";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";

export function RoomSeal({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: string;
}) {
  return (
    <RoomFrame className="max-w-3xl">
      <PageHeader eyebrow={eyebrow} title={title} />
      <Card variant="glass">{children}</Card>
    </RoomFrame>
  );
}
