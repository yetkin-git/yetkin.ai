import { Card } from "@/components/ui/card";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";

export default function PublicTalentLoading() {
  return (
    <main className="relative mx-auto max-w-3xl px-6 pb-20 pt-16">
      <Card className="h-48 animate-pulse">
        <p>{CAREER_SEN.publicPage.title}</p>
      </Card>
    </main>
  );
}
