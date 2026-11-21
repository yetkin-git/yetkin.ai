import { LinkButton } from "@/components/ui/link-button";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

/** Belge vitrini kabuğu kesildiği için kamu doğrulama sayfası kendi üçlü köprüsünü basar. */
export function CertificateVerifyNav({ className }: { className?: string }) {
  const copy = SEN_VOICE.academy.verify;
  return (
    <nav aria-label={copy.navLabel} className={className ?? "flex flex-wrap items-center gap-2"}>
      <LinkButton href="/" variant="outline" size="sm">
        {copy.homeCta}
      </LinkButton>
      <LinkButton href="/academy" variant="outline" size="sm">
        {copy.academyCta}
      </LinkButton>
      <LinkButton href="/career" variant="outline" size="sm">
        {copy.careerCta}
      </LinkButton>
    </nav>
  );
}
