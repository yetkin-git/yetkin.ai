import { FreePreviewLink } from "@/components/academy/free-preview-link";
import { WorkfileDownload } from "@/components/academy/workfile-download";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

/**
 * Kurs antresi — sabit kapak yerine ilk dersin yerel MP4 oynatıcısı.
 * Tam ders `playerHref` adresindedir; bu adres ücretsiz önizleme yoludur.
 */
export function FreePreviewStage({
  mp4Src,
  poster,
  playerHref,
  signedIn,
  loginHref,
  registerHref,
  offerWorkfile,
}: {
  mp4Src: string;
  poster: string | null;
  playerHref: string;
  signedIn: boolean;
  loginHref: string;
  registerHref: string;
  offerWorkfile: boolean;
}) {
  const copy = ACADEMY_SEN.course;
  return (
    <section className="space-y-3" data-academy-preview-stage="" aria-labelledby="academy-preview-stage-title">
      <h2 id="academy-preview-stage-title" className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
        {copy.previewStageTitle}
      </h2>
      <p className="text-sm leading-6 text-[var(--muted)]">{copy.previewStageLead}</p>
      <video
        className="aspect-video w-full rounded-2xl bg-black"
        data-academy-preview-video=""
        controls
        playsInline
        preload="metadata"
        poster={poster ?? undefined}
        src={mp4Src}
        aria-label={copy.previewStageTitle}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <FreePreviewLink href={playerHref} surface="stage" className="w-full sm:w-auto" />
        {offerWorkfile ? (
          <WorkfileDownload signedIn={signedIn} loginHref={loginHref} registerHref={registerHref} />
        ) : null}
      </div>
    </section>
  );
}
