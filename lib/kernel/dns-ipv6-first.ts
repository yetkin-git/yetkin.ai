import dns from "node:dns";
import { isRuntimePoolerUrl } from "@/lib/kernel/postgres-url";

/**
 * Direct host (`db.<ref>.supabase.co`) çoğu projede yalnız AAAA yayınlar.
 * Node varsayılanı ipv4first ise getaddrinfo ENOENT / P1001 düşer.
 * Vercel runtime `DATABASE_URL` transaction pooler (`*.pooler.supabase.com:6543`)
 * IPv4 A kaydı kullanır — ipv6first pooler'da soğuk başlangıcı kırar.
 */
export function preferIpv6ForDirectHost(
  url: string | undefined = process.env.DATABASE_URL,
): void {
  if (url?.trim() && isRuntimePoolerUrl(url)) {
    dns.setDefaultResultOrder("ipv4first");
    return;
  }
  dns.setDefaultResultOrder("ipv6first");
}
