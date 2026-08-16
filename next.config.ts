import type { NextConfig } from "next";
import { EDGE_SECURITY_HEADER_ENTRIES } from "./lib/kernel/security/edge-guard";

/**
 * yetkin.ai müze klasörü build, webpack ve izleme kapsamı dışındadır (S9-B).
 * İnce alias seti anayasa §2.1 — KAPAT oda yönlendirmesi yazılmaz.
 * §2.5 `/kayit` CEO tedavi kilidi ile 9. ince alias'tır (`/giris` çifti).
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  outputFileTracingExcludes: {
    "*": ["yetkin.ai/**"],
  },
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  async redirects() {
    return [
      { source: "/kariyer", destination: "/career", permanent: true },
      { source: "/ogren", destination: "/academy", permanent: true },
      { source: "/yetkinx", destination: "/social", permanent: true },
      { source: "/corporate", destination: "/kurumsal", permanent: true },
      { source: "/profile", destination: "/profil", permanent: true },
      { source: "/passport", destination: "/pasaport", permanent: true },
      { source: "/market", destination: "/yetkinilan", permanent: true },
      { source: "/giris", destination: "/login", permanent: true },
      // §2.5 vatandaş çifti — CEO tedavi kilidi: 8 tavanına /kayit eklenir.
      { source: "/kayit", destination: "/register", permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: "/yetkinilan", destination: "/pazaryeri" },
      { source: "/yetkinilan/:path*", destination: "/pazaryeri/:path*" },
    ];
  },
  async headers() {
    // CSP nonce SSOT `proxy.ts` / `buildEdgeCsp`'dir. Statik CSP çift başlık
    // üretir ve nonce'u ezer; burada yalnız nonce'suz yedek başlıklar kalır.
    const securityHeaders = EDGE_SECURITY_HEADER_ENTRIES.map(([key, value]) => ({
      key,
      value,
    }));
    if (process.env.NODE_ENV === "production") {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
