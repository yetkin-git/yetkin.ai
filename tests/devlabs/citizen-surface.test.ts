import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
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
  "app/devlabs/page.tsx",
  "app/devlabs/loading.tsx",
  "app/devlabs/projeler/[id]/page.tsx",
  "app/devlabs/projeler/[id]/loading.tsx",
  "components/devlabs/code-bench-panel.tsx",
  "components/devlabs/issue-key-form.tsx",
  "components/devlabs/lab-vitrine.tsx",
  "components/devlabs/project-create-form.tsx",
  "components/devlabs/revoke-key-button.tsx",
  "components/devlabs/workbench-honesty-steps.tsx",
  "lib/copy/sen-voice/devlabs.ts",
  "lib/kernel/modules.ts",
];

describe("DevLabs vatandaş yüzeyi, icra dürüstlüğü ve SEN aksı", () => {
  it("oda loading.tsx iskeleti izomorftur (CLS)", () => {
    const files = [
      "app/devlabs/loading.tsx",
      "app/devlabs/projeler/[id]/loading.tsx",
      "components/devlabs/devlabs-room-skeleton.tsx",
    ];
    for (const file of files) {
      expect(existsSync(join(ROOT, file)), file).toBe(true);
    }
    const skeleton = readSrc("components/devlabs/devlabs-room-skeleton.tsx");
    expect(skeleton).toContain("animate-pulse");
    expect(skeleton).toContain("variant");
    expect(skeleton).not.toContain("use client");
    expect(readSrc("app/devlabs/loading.tsx")).toContain("DevlabsRoomSkeleton");
    expect(readSrc("app/devlabs/loading.tsx")).not.toContain("use client");
    expect(readSrc("app/devlabs/projeler/[id]/loading.tsx")).toContain("DevlabsRoomSkeleton");
    expect(readSrc("app/devlabs/projeler/[id]/loading.tsx")).not.toContain("use client");
  });

  it("/devlabs yüzeyleri siz kaçakları taşımaz; SEN_VOICE ve no-exec mühürü bağlar", () => {
    expect(SEN_VOICE.devlabs.catalog.description).toContain(
      "sunucuda kod çalıştırılmaz (exec yoktur)",
    );
    expect(SEN_VOICE.devlabs.honesty.steps[0]?.label).toBe("Exec Yoktur / Çalıştırma Yapılmaz");
    expect(SEN_VOICE.devlabs.honesty.steps[0]?.detail).toContain("exec yoktur");
    expect(SEN_VOICE.devlabs.honesty.steps[1]?.detail).toContain("yrk_");
    expect(SEN_VOICE.devlabs.honesty.steps[1]?.detail).toContain("yalnız hash");
    expect(SEN_VOICE.devlabs.honesty.steps[2]?.detail).toContain("Proje Oluştur");
    expect(SEN_VOICE.devlabs.honesty.steps[2]?.detail).toContain("Üret (Generate)");
    expect(SEN_VOICE.devlabs.honesty.steps[2]?.detail).toContain("Linter / Denetle");
    expect(SEN_VOICE.devlabs.honesty.steps[2]?.detail).toContain("Çıktı Kasa / Artifact");
    expect(SEN_VOICE.devlabs.vault.copy).toBe("Anahtarı kopyala");
    expect(SEN_VOICE.devlabs.vault.hide).toBe("Anahtarı gizle");
    expect(DEVLABS_HAPPY_PATH).toEqual(["project", "issue-key", "generate", "lint", "artifact"]);

    const room = VERTICAL_ROOMS.find((row) => row.id === "devlabs");
    expect(room?.blurb).toContain("exec yoktur");
    expect(room?.blurb).not.toContain("yönetin");

    for (const file of SEN_SURFACES) {
      const source = readSrc(file);
      for (const leak of SIZ_LEAKS) {
        expect(source, `${file} → ${leak}`).not.toContain(leak);
      }
    }
    expect(readSrc("app/devlabs/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("app/devlabs/page.tsx")).toContain("WorkbenchHonestySteps");
    expect(readSrc("app/devlabs/page.tsx")).toContain("ProductionFlowStrip");
    expect(readSrc("app/devlabs/projeler/[id]/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("app/devlabs/projeler/[id]/page.tsx")).toContain("WorkbenchHonestySteps");
    expect(readSrc("app/devlabs/projeler/[id]/page.tsx")).toContain("IssueKeyForm");
    expect(readSrc("components/devlabs/code-bench-panel.tsx")).toContain("QuickTopUpModal");
    expect(readSrc("components/devlabs/issue-key-form.tsx")).toContain("aria-live");
    expect(readSrc("components/devlabs/issue-key-form.tsx")).toContain("copy.copy");
    expect(readSrc("components/devlabs/issue-key-form.tsx")).toContain("copy.hide");
    expect(readSrc("components/devlabs/issue-key-form.tsx")).toContain('kind: "sealed"');
  });

  it("HMAC kasa: basımda plaintext bir kez; vatandaş yüzeyi hash taşımaz", () => {
    expect(readSrc("app/api/devlabs/projects/[id]/keys/route.ts")).toContain("toCitizenDevLabsApiKey");
    expect(readSrc("app/api/devlabs/projects/[id]/keys/route.ts")).toContain("plaintext");
    expect(readSrc("app/api/devlabs/projects/[id]/route.ts")).toContain("toCitizenDevLabsApiKey");
    expect(readSrc("app/api/devlabs/projects/[id]/route.ts")).not.toContain("keyHash");
    expect(readSrc("app/api/devlabs/keys/[id]/revoke/route.ts")).toContain("toCitizenDevLabsApiKey");
    expect(readSrc("lib/devlabs/constitutional-linter.ts")).toContain("eval");
    expect(readSrc("lib/devlabs/constitutional-linter.ts")).toContain("child_process");
    expect(readSrc("lib/devlabs/bench.ts")).toContain("Exec yoktur");

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
