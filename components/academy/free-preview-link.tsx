import type { Route } from "next";
import { LinkButton } from "@/components/ui/link-button";
import { IconPlay } from "@/components/ui/icons";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

/**
 * Anayasa B4 — kurs detayında birincil önizleme.
 * Hedef oturumsuz oynatıcıdır; ders 1 orada açılır.
 */
export function FreePreviewLink({
  href,
  surface,
  size = "lg",
  className = "",
}: {
  href: string;
  surface: "hero" | "purchase" | "expired";
  size?: "sm" | "lg";
  className?: string;
}) {
  return (
    <LinkButton
      href={href as Route}
      size={size}
      variant="success"
      className={className}
      data-academy-preview-cta={surface}
    >
      <IconPlay className="h-4 w-4" aria-hidden />
      {ACADEMY_SEN.course.heroPreviewCta}
    </LinkButton>
  );
}
