import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("Studio/DevLabs ücretli komut idempotency yüzeyi", () => {
  it("generate HTTP yüzeyi donmuş 410 stub'dur; komut anahtarı motorlarda durur", () => {
    const routes = ["app/api/_gone/[...path]/route.ts"];
    for (const file of routes) {
      const source = readSrc(file);
      expect(source, file).toContain("frozenRoomGone");
      expect(source, file).not.toContain("settleHttpIdempotency");
    }
  });

  it("motorlar LLM'den önce rezervasyon açar; generation/artifact id = commandKey", () => {
    const studio = readSrc("archived/lib/studio/engine.ts");
    const image = readSrc("archived/lib/studio/image-engine.ts");
    const bench = readSrc("archived/lib/devlabs/bench.ts");
    for (const source of [studio, image, bench]) {
      expect(source).toContain("requirePaidCommandKey");
      expect(source).toContain("commands.begin");
      expect(source).toContain("saveProviderOutput");
      expect(source).toContain("markSettled");
    }
    expect(studio).toContain("const generationId = commandKey");
    expect(image).toContain("const generationId = commandKey");
    expect(bench).toContain("const artifactId = commandKey");
    expect(studio.indexOf("commands.begin")).toBeLessThan(
      studio.indexOf("const invoke = ports.invokeLlm"),
    );
  });

  it("istemci çift tıklamada aynı Idempotency-Key başlığını basar", () => {
    const panels = [
      "archived/components/studio/generate-panel.tsx",
      "archived/components/studio/image-generate-panel.tsx",
      "archived/components/devlabs/code-bench-panel.tsx",
    ];
    for (const file of panels) {
      const source = readSrc(file);
      expect(source, file).toContain("useIdempotencyKey");
      expect(source, file).toContain("idempotency.headers()");
    }
  });
});
