import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DEVLABS_SEN } from "@/archived/lib/copy/sen-voice/devlabs";
import { VERTICAL_ROOMS } from "@/lib/kernel/modules";
import { toCitizenDevLabsApiKey } from "@/lib/devlabs/keys";
import { DEVLABS_HAPPY_PATH } from "@/lib/devlabs/types";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const SIZ_LEAKS = [
  "Projenizi",
  "projeleriniz",
  "yönetin",
  "tarif edin",
  "Anahtarınızı",
  "kopyalayın",
  "yetkiniz",
  "yapın",
];

const SEN_SURFACES = [
  "archived/app/devlabs/page.tsx",
  "archived/app/devlabs/loading.tsx",
  "archived/app/devlabs/projeler/[id]/page.tsx",
  "archived/app/devlabs/projeler/[id]/loading.tsx",
  "archived/components/devlabs/code-bench-panel.tsx",
  "archived/components/devlabs/issue-key-form.tsx",
  "archived/components/devlabs/lab-vitrine.tsx",
  "archived/components/devlabs/project-create-form.tsx",
  "archived/components/devlabs/revoke-key-button.tsx",
  "archived/components/devlabs/workbench-honesty-steps.tsx",
  "archived/lib/copy/sen-voice/devlabs.ts",
  "lib/kernel/modules.ts",
];

describe("DevLabs vatandaş yüzeyi, icra dürüstlüğü ve SEN aksı", () => {
  it("oda loading.tsx iskeleti izomorftur (CLS)", () => {
    const files = [
      "archived/app/devlabs/loading.tsx",
      "archived/app/devlabs/projeler/[id]/loading.tsx",
      "archived/components/devlabs/devlabs-room-skeleton.tsx",
    ];
    for (const file of files) {
      expect(existsSync(join(ROOT, file)), file).toBe(true);
    }
    const skeleton = readSrc("archived/components/devlabs/devlabs-room-skeleton.tsx");
    expect(skeleton).toContain("animate-pulse");
    expect(skeleton).toContain("variant");
    expect(skeleton).not.toContain("use client");
    expect(readSrc("archived/app/devlabs/loading.tsx")).toContain("DevlabsRoomSkeleton");
    expect(readSrc("archived/app/devlabs/loading.tsx")).not.toContain("use client");
    expect(readSrc("archived/app/devlabs/projeler/[id]/loading.tsx")).toContain("DevlabsRoomSkeleton");
    expect(readSrc("archived/app/devlabs/projeler/[id]/loading.tsx")).not.toContain("use client");
  });

  it("/devlabs yüzeyleri siz kaçakları taşımaz; SEN_VOICE ve no-exec mühürü bağlar", () => {
    expect(DEVLABS_SEN.catalog.description).toContain(
      "sunucuda kod çalıştırılmaz (exec yoktur)",
    );
    expect(DEVLABS_SEN.honesty.steps[0]?.label).toBe("Exec Yoktur / Çalıştırma Yapılmaz");
    expect(DEVLABS_SEN.honesty.steps[0]?.detail).toContain("exec yoktur");
    expect(DEVLABS_SEN.honesty.steps[1]?.detail).toContain("yrk_");
    expect(DEVLABS_SEN.honesty.steps[1]?.detail).toContain("yalnız hash");
    expect(DEVLABS_SEN.honesty.steps[2]?.detail).toContain("Proje Oluştur");
    expect(DEVLABS_SEN.honesty.steps[2]?.detail).toContain("Üret (Generate)");
    expect(DEVLABS_SEN.honesty.steps[2]?.detail).toContain("Linter / Denetle");
    expect(DEVLABS_SEN.honesty.steps[2]?.detail).toContain("Çıktı Kasa / Artifact");
    expect(DEVLABS_SEN.vault.copy).toBe("Anahtarı kopyala");
    expect(DEVLABS_SEN.vault.hide).toBe("Anahtarı gizle");
    expect(DEVLABS_HAPPY_PATH).toEqual(["project", "issue-key", "generate", "lint", "artifact"]);

    expect(VERTICAL_ROOMS.find((row) => row.id === "devlabs")).toBeUndefined();

    for (const file of SEN_SURFACES) {
      const source = readSrc(file);
      for (const leak of SIZ_LEAKS) {
        expect(source, `${file} → ${leak}`).not.toContain(leak);
      }
    }
    expect(readSrc("archived/app/devlabs/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("archived/app/devlabs/page.tsx")).toContain("WorkbenchHonestySteps");
    expect(readSrc("archived/app/devlabs/page.tsx")).toContain("ProductionFlowStrip");
    expect(readSrc("archived/app/devlabs/projeler/[id]/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("archived/app/devlabs/projeler/[id]/page.tsx")).toContain("WorkbenchHonestySteps");
    expect(readSrc("archived/app/devlabs/projeler/[id]/page.tsx")).toContain("IssueKeyForm");
    expect(readSrc("archived/components/devlabs/code-bench-panel.tsx")).toContain("QuickTopUpModal");
    expect(readSrc("archived/components/devlabs/issue-key-form.tsx")).toContain("aria-live");
    expect(readSrc("archived/components/devlabs/issue-key-form.tsx")).toContain("copy.copy");
    expect(readSrc("archived/components/devlabs/issue-key-form.tsx")).toContain("copy.hide");
    expect(readSrc("archived/components/devlabs/issue-key-form.tsx")).toContain('kind: "sealed"');
  });

  it("HMAC kasa: basımda plaintext bir kez; vatandaş yüzeyi hash taşımaz", () => {
    expect(readSrc("archived/app/api/devlabs/projects/[id]/keys/route.ts")).toContain("toCitizenDevLabsApiKey");
    expect(readSrc("archived/app/api/devlabs/projects/[id]/keys/route.ts")).toContain("plaintext");
    expect(readSrc("archived/app/api/devlabs/projects/[id]/route.ts")).toContain("toCitizenDevLabsApiKey");
    expect(readSrc("archived/app/api/devlabs/projects/[id]/route.ts")).not.toContain("keyHash");
    expect(readSrc("archived/app/api/devlabs/keys/[id]/revoke/route.ts")).toContain("toCitizenDevLabsApiKey");
    expect(readSrc("archived/lib/devlabs/constitutional-linter.ts")).toContain("eval");
    expect(readSrc("archived/lib/devlabs/constitutional-linter.ts")).toContain("child_process");
    expect(readSrc("archived/lib/devlabs/bench.ts")).toContain("Exec yoktur");

    const citizen = toCitizenDevLabsApiKey({
      id: "k1",
      projectId: "p1",
      userId: "u1",
      name: "ci",
      keyPrefix: "yrk_live_ab",
      keyHash: "deadbeef",
      revokedAt: null,
      createdAt: new Date("2026-08-15T00:00:00.000Z"),
    });
    expect(citizen).not.toHaveProperty("keyHash");
    expect(citizen).not.toHaveProperty("plaintext");
    expect(JSON.stringify(citizen)).not.toContain("deadbeef");
  });
});
