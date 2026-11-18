import { permanentRedirect } from "next/navigation";
import { parseSha256Hex } from "@/lib/kernel/crypto/sha256";

/**
 * Kısa paylaşım alias'ı `/verify/[hash]`.
 * HTTP 301 `next.config.ts` redirects'tedir; bu sayfa belge isteği kaçarsa
 * kanonik `/vize/[hash]` adresine kalıcı yönlendirir.
 */
export default async function VerifyHashAliasPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = await params;
  const parsed = parseSha256Hex(hash);
  permanentRedirect(parsed ? `/vize/${parsed}` : "/vize");
}
