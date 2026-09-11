import Image from "next/image";
import {
  academyCourseCoverAvifFromPath,
  academyCourseCoverSrcSet,
} from "@/lib/academy/course-cover";
import { cn } from "@/components/ui/cn";

const COVER_WIDTH = 1280;
const COVER_HEIGHT = 720;

/**
 * Vitrin kapağı — Next.js Image + AVIF/WebP `srcSet` (640/960/1280).
 * Kaynak zaten 30–50 KB; `unoptimized` Cloudflare immutable cache’i korur.
 */
export function CourseCoverImage({
  src,
  alt,
  eager = false,
  highPriority = false,
  fill = false,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  eager?: boolean;
  highPriority?: boolean;
  fill?: boolean;
  sizes: string;
  className?: string;
}) {
  const avifSrc = academyCourseCoverAvifFromPath(src);
  const lcpSrc = highPriority && avifSrc ? avifSrc : src;
  const avifSrcSet = avifSrc ? academyCourseCoverSrcSet(avifSrc) : null;
  const webpSrcSet = academyCourseCoverSrcSet(src);
  const image = (
    <Image
      src={lcpSrc}
      alt={alt}
      {...(fill
        ? { fill: true as const }
        : { width: COVER_WIDTH, height: COVER_HEIGHT })}
      unoptimized
      loading={eager || highPriority ? "eager" : "lazy"}
      fetchPriority={highPriority ? "high" : "low"}
      decoding="async"
      sizes={sizes}
      className={cn(fill && "object-cover", className)}
    />
  );
  if (!avifSrcSet && !webpSrcSet) {
    return image;
  }
  return (
    <picture className="contents">
      {avifSrcSet ? <source srcSet={avifSrcSet} sizes={sizes} type="image/avif" /> : null}
      {webpSrcSet ? <source srcSet={webpSrcSet} sizes={sizes} type="image/webp" /> : null}
      {image}
    </picture>
  );
}
