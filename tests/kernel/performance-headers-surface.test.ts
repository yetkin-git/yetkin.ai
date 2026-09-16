import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("amiral performans mühürleri — Gzip / cache / istek", () => {
  it("next.config Gzip ve immutable Cache-Control basar", () => {
    const config = readSrc("next.config.ts");
    expect(config).toContain("compress: true");
    expect(config).toContain('source: "/_next/static/:path*"');
    expect(config).toContain('source: "/_next/image/:path*"');
    expect(config).toContain('source: "/icon.svg"');
    expect(config).toContain('source: "/apple-icon.png"');
    expect(config).toContain('source: "/favicon.ico"');
    expect(config).toContain("minimumCacheTTL: 31536000");
    expect(config).toContain("public, max-age=31536000, immutable");
    expect(config).toContain("/:all*(ico|png|jpg|jpeg|gif|webp|avif|svg|woff|woff2|ttf|otf|mp3|mp4)");
    expect(config).toContain("/media/academy/audio/:path*");
    expect(config).toContain("/academy/cinema/:path*");
  });

  it("kenar matcher statik gövdeyi worker dışına alır", () => {
    const proxy = readSrc("proxy.ts");
    expect(proxy).toContain("favicon.ico|media/");
    expect(proxy).toContain("icon.svg|apple-icon.png");
    expect(proxy).toContain("ico|png|jpg|jpeg|gif|webp|avif|svg|woff|woff2|ttf|otf|mp3|mp4");
  });

  it("kamu yasal nav prefetch basmaz; mailto Cloudflare decode tetiklemez", () => {
    const footer = readSrc("components/legal/legal-site-footer.tsx");
    const strip = readSrc("components/legal/legal-colophon-strip.tsx");
    expect(footer).toContain("prefetch={false}");
    expect(strip).toContain("prefetch={false}");
    expect(footer).toContain('href={link.href.replace("@", "%40")}');
    expect(strip).toContain('href={link.href.replace("@", "%40")}');
    expect(readSrc("lib/copy/json-ld.ts")).toContain("u0040");
    expect(readSrc("app/globals.css")).toContain('"Segoe UI"');
    expect(readSrc("app/globals.css")).not.toContain("@font-face");
    expect(readSrc("app/layout.tsx")).not.toContain("next/font");
  });
});
