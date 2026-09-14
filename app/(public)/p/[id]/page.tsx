import { permanentRedirect } from "next/navigation";
import { parsePublicTalentId, publicTalentPath, PUBLIC_TALENT_PATH } from "@/lib/career/public-talent";

/**
 * Kısa paylaşım alias'ı `/p/[id]`.
 * HTTP 301 `next.config.ts` redirects'tedir; bu sayfa belge isteği kaçarsa
 * kanonik `/vize/[id]` adresine kalıcı yönlendirir.
 */
export default async function PublicTalentAliasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const parsed = parsePublicTalentId(id);
  if (!parsed) {
    permanentRedirect(PUBLIC_TALENT_PATH);
  }
  permanentRedirect(publicTalentPath(parsed));
}
