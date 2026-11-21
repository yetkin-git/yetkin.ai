import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readDoc(file: string): string {
  return readFileSync(join(process.cwd(), ".system_docs", file), "utf8");
}

describe("belge vitrin tutarlılığı", () => {
  it("README, runbook ve anayasa 2 aktif oda ile canlı Tezgâh der", () => {
    const readme = readDoc("README.md");
    const runbook = readDoc("OPS_RUNBOOK.md");
    const constitution = readDoc("ANAYASA.md");
    const opsDb = readDoc("ops/ops-db.md");
    const studio = readDoc("AKADEMI_URETIM_ANAYASASI.md");
    for (const doc of [readme, runbook, constitution]) {
      expect(doc).toContain("2 aktif oda + askıdaki Akademi");
      expect(doc).toContain("AI Tezgâh canlı");
    }
    expect(readme).not.toContain("Akademi mühürlü yayın **6** eğitim");
    expect(readme).not.toContain("Akademi mühürlü WAV **18**");
    expect(readme).not.toContain("Kamu vitrini Panel + Akademi + Kariyer");
    expect(runbook).toContain("01_office_ai-1");
    expect(runbook).toContain("ops/ops-db.md");
    expect(runbook).not.toContain("Video katmanı terk edilmiştir");
    expect(runbook).toContain("## §2 Migrate");
    expect(runbook).toContain("### §2.1 Operatör sıfır-hata");
    expect(runbook).toContain("### §5.1 503 çıkış");
    expect(runbook).toContain("## §9 Depolama");
    expect(runbook).toContain("## §12 Kurtarma");
    expect(opsDb).toContain("tezgah_daily_quotas");
    expect(opsDb).toContain("tetkik_domain_claims");
    expect(opsDb).toContain("ai_product_model_settings");
    expect(opsDb).toContain("lesson-audios");
    expect(studio).toContain("## Akademi TTS bağları");
    expect(opsDb).toContain("AKADEMI_URETIM_ANAYASASI.md");
    expect(opsDb).not.toContain("Junior 410.");
    expect(opsDb).not.toContain("Tezgâh izole durur");
  });
});