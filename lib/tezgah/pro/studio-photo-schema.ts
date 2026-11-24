import { z } from "zod";
import { STUDIO_GALLERY_COUNTS, STUDIO_SCENES } from "@/lib/tezgah/pro/options";

function enumIds<T extends string>(ids: readonly T[]): [T, ...T[]] {
  const [first, ...rest] = ids;
  if (!first) {
    throw new Error("Sahne listesi boş.");
  }
  return [first, ...rest];
}

export const studioPhotoGenerateRequestSchema = z.strictObject({
  productName: z.string().trim().min(2).max(80),
  features: z.string().trim().min(2).max(400),
  scene: z.enum(enumIds(STUDIO_SCENES.map((scene) => scene.value))),
  galleryCount: z
    .union([z.string(), z.number()])
    .transform((value) => String(value).trim())
    .refine((value) => STUDIO_GALLERY_COUNTS.some((row) => row.value === value), {
      message: "Galeri adedi geçersiz.",
    })
    .transform((value) => Number(value)),
});

export type StudioPhotoGenerateRequest = z.infer<typeof studioPhotoGenerateRequestSchema>;
