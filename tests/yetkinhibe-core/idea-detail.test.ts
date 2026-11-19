import { describe, expect, it } from "vitest";
import { assessIdeaDetail } from "@/lib/yetkinhibe/idea-detail";

describe("assessIdeaDetail", () => {
  it("boş metni idle sayar", () => {
    expect(assessIdeaDetail("")).toBe("idle");
    expect(assessIdeaDetail("   ")).toBe("idle");
  });

  it("kısa metni short sayar", () => {
    expect(assessIdeaDetail("kısa fikir")).toBe("short");
    expect(assessIdeaDetail("a b c")).toBe("short");
  });

  it("yeterli detayı ready sayar", () => {
    expect(assessIdeaDetail("Soğuk zincir deposu kurup bölgesel satış yapacağım")).toBe("ready");
  });
});
