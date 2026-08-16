import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("Inngest serve yüzeyi", () => {
  it("üretimde boş imza anahtarında serve() çağrılmaz", () => {
    const route = readSrc("app/api/(kernel)/jobs/inngest/route.ts");
    expect(route).toContain("shouldFailClosedInngestServe");
    expect(route).toContain("inngestNotConfiguredResponse");
    expect(route).toContain("registerVerticalEscrowRefundHooks");
    const serveIndex = route.indexOf("serve(");
    const guardIndex = route.indexOf("shouldFailClosedInngestServe");
    expect(serveIndex).toBeGreaterThan(-1);
    expect(guardIndex).toBeGreaterThan(-1);
    const handlerBind = route.slice(route.indexOf("function guard"));
    expect(handlerBind).toContain("shouldFailClosedInngestServe");
    expect(handlerBind).toContain("canInvokeInngestServe");
    expect(handlerBind).toContain("inngestNotConfiguredResponse");
    expect(handlerBind).toContain("getInngestHandlers()");
    expect(route).toContain("handlers ??=");
    expect(route).toContain('method: "GET" | "POST" | "PUT"');
    expect(readSrc("lib/kernel/jobs/inngest.ts")).toContain("Inngest Cloud anahtarları tanımlı değil.");
    expect(readSrc("lib/kernel/jobs/inngest.ts")).toContain("status: 503");
  });

  it("üretim kilidi SIGNING_KEY ve EVENT_KEY ister; INNGEST_DEV açmaz", () => {
    const guard = readSrc("lib/kernel/jobs/inngest-guard.ts");
    expect(guard).toContain("INNGEST_SIGNING_KEY");
    expect(guard).toContain("INNGEST_EVENT_KEY");
    expect(guard).toContain("isInngestSigningKeyConfigured");
    expect(guard).toContain("isInngestEventKeyConfigured");
    expect(guard).toContain("INNGEST_DEV üretimde bypass etmez");
    expect(guard).toContain("Sahte/doğrulanmamış event kabul edilmez");
    expect(guard).toContain("isInngestDevEnabled");
    expect(guard).toContain("canInvokeInngestServe");
  });
});
