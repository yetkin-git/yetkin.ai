import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertJuniorQuizTargetWritable,
  JUNIOR_QUIZ_LIVE_OVERWRITE_ENV,
  JUNIOR_QUIZ_LIVE_OVERWRITE_FLAG,
  juniorQuizOverwriteDecision,
} from "../../scripts/junior-quiz-live-guard";

const ROOT = process.cwd();
const SUBJECTS = ["mat", "fen", "turkce", "sosyal", "ing"] as const;

describe("Junior quiz üretici koruması (T-16)", () => {
  it("boş hedef yazmaya açıktır", () => {
    expect(juniorQuizOverwriteDecision({ existingFiles: [], argv: [], env: {} })).toEqual({ ok: true, existing: 0 });
  });

  it("canlı dosya varken bayrak veya ortam değişkeni tek başına yetmez", () => {
    const files = ["1.ts", "index.ts"];
    const flagOnly = juniorQuizOverwriteDecision({
      existingFiles: files,
      argv: [JUNIOR_QUIZ_LIVE_OVERWRITE_FLAG],
      env: {},
    });
    expect(flagOnly.ok).toBe(false);
    const envOnly = juniorQuizOverwriteDecision({
      existingFiles: files,
      argv: [],
      env: { [JUNIOR_QUIZ_LIVE_OVERWRITE_ENV]: "1" },
    });
    expect(envOnly.ok).toBe(false);
    const wrongEnv = juniorQuizOverwriteDecision({
      existingFiles: files,
      argv: [JUNIOR_QUIZ_LIVE_OVERWRITE_FLAG],
      env: { [JUNIOR_QUIZ_LIVE_OVERWRITE_ENV]: "0" },
    });
    expect(wrongEnv.ok).toBe(false);
  });

  it("bayrak ve ortam değişkeni birlikte verilirse ezme açılır", () => {
    const decision = juniorQuizOverwriteDecision({
      existingFiles: ["1.ts"],
      argv: [JUNIOR_QUIZ_LIVE_OVERWRITE_FLAG],
      env: { [JUNIOR_QUIZ_LIVE_OVERWRITE_ENV]: "1" },
    });
    expect(decision).toEqual({ ok: true, existing: 1 });
  });

  it("ret mesajı bayrağı ve ortam değişkenini adlandırır", () => {
    const decision = juniorQuizOverwriteDecision({ existingFiles: ["1.ts"], argv: [], env: {} });
    expect(decision.ok).toBe(false);
    if (!decision.ok) {
      expect(decision.reason).toContain(JUNIOR_QUIZ_LIVE_OVERWRITE_FLAG);
      expect(decision.reason).toContain(`${JUNIOR_QUIZ_LIVE_OVERWRITE_ENV}=1`);
    }
  });

  it("var olmayan hedef klasör engellenmez", () => {
    const missing = join(ROOT, "lib", "junior", "quiz", "__yok_bu_klasor_hic_olmadi__");
    expect(existsSync(missing)).toBe(false);
    expect(() => assertJuniorQuizTargetWritable(missing, [], {})).not.toThrow();
  });

  it("depodaki canlı Junior quiz klasörleri üreticiyle ezilemez", () => {
    for (const subject of SUBJECTS) {
      const live = join(ROOT, "lib", "junior", "quiz", subject);
      expect(existsSync(join(live, "index.ts")), subject).toBe(true);
      expect(() => assertJuniorQuizTargetWritable(live, [], {}), subject).toThrow(/canlı \.ts dosyası/);
    }
  });

  it("beş üretici ortak yazıcıyı kullanır; koruma mkdirSync'ten önce durur", () => {
    const writer = readFileSync(join(ROOT, "scripts", "junior-quiz-archive-write.ts"), "utf8");
    expect(writer).toContain('from "./junior-quiz-live-guard"');
    const guardAt = writer.indexOf("assertJuniorQuizTargetWritable(outDir);");
    const mkdirAt = writer.indexOf("mkdirSync(outDir");
    expect(guardAt).toBeGreaterThan(-1);
    expect(guardAt).toBeLessThan(mkdirAt);
    for (const subject of SUBJECTS) {
      const source = readFileSync(join(ROOT, "scripts", `generate-junior-${subject}-quiz-archive.ts`), "utf8");
      expect(source, subject).toContain('from "./junior-quiz-archive-write"');
      expect(source, subject).toContain("writeJuniorQuizArchive(");
      expect(source, subject).not.toContain("mkdirSync(");
    }
  });
});
