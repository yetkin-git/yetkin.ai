import dns from "node:dns";

/**
 * Direct host (`db.<ref>.supabase.co`) çoğu projede yalnız AAAA yayınlar.
 * Node varsayılanı ipv4first ise getaddrinfo ENOENT / P1001 düşer; havuz :6543 yasaktır.
 */
export function preferIpv6ForDirectHost(): void {
  dns.setDefaultResultOrder("ipv6first");
}
