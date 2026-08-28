import type { NextConfig } from "next";
import { EDGE_SECURITY_HEADER_ENTRIES } from "./lib/kernel/security/edge-security-headers";

/**
 * yetkin_muze müze klasörü build, webpack ve izleme kapsamı dışındadır (OPS; Anayasa maddesi değildir).
 * Git ve indeks: kök `.gitignore` + `.cursorindexingignore`.
 * apps/** (Rail İş dron) Amiral derlemesinden dışarıdadır — Faz 1 kapanana kadar yayın hattı donuk.
 * İnce alias seti anayasa §2.1 — donmuş oda (`/yetkinx`, `/yetkinilan`, `/market`, `/corporate`)
 * canlı yola rewrite edilmez; kenar 410. KAPAT oda yönlendirmesi yazılmaz.
 * §2.5 `/kayit` CEO tedavi kilidi ile ince alias'tır (`/giris` çifti).
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  // Sol ray altını kapatan N / Route / Turbopack geliştirici kutusu kapalıdır.
  devIndicators: false,
  // Dev sunucusu localhost iken 127.0.0.1 (Playwright, canlı tur) HMR/chunk CORS'unu kesmesin.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  outputFileTracingExcludes: {
    "*": [
      "yetkin_muze/**",
      "apps/**",
      "archived/**",
      "lib/studio/**",
      "lib/devlabs/**",
      "lib/kurumsal/**",
      "lib/hibe/**",
      "lib/arena/**",
      "lib/pazaryeri/**",
      "lib/junior/**",
      "lib/social/**",
    ],
  },
  outputFileTracingIncludes: {
    "*": [
      "./node_modules/@prisma/client/runtime/**",
      "./node_modules/@prisma/adapter-pg/**",
      "./generated/prisma/**",
      "./node_modules/@digabi/noto-sans/WOFF/NotoSans-Regular.woff",
    ],
  },
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "@prisma/client-runtime-utils",
    "pg",
    "@digabi/noto-sans",
  ],
  turbopack: {
    resolveAlias: {
      "@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm":
        "./node_modules/@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.js",
      "@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs":
        "./node_modules/@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.js",
      "@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs":
        "./node_modules/@prisma/client/runtime/query_compiler_fast_bg.postgresql.js",
    },
  },
  async redirects() {
    return [
      { source: "/kariyer", destination: "/career", permanent: true },
      { source: "/ogren", destination: "/academy", permanent: true },
      { source: "/profile", destination: "/profil", permanent: true },
      { source: "/passport", destination: "/pasaport", permanent: true },
      { source: "/giris", destination: "/login", permanent: true },
      // §2.5 vatandaş çifti — CEO tedavi kilidi: 8 tavanına /kayit eklenir.
      { source: "/kayit", destination: "/register", permanent: true },
    ];
  },
  async rewrites() {
    return [];
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
