import { describe, expect, it } from "vitest";
import { ACADEMY_LESSON_LISTEN_ENABLED } from "@/lib/academy/lesson-listen";

describe("akademi pedagoji mühürü — Faz 4 boş davranış", () => {
  it("dinle kapalıdır; fabrika mühürü nightly/prebuild kapısı değildir", () => {
    expect(ACADEMY_LESSON_LISTEN_ENABLED).toBe(false);
  });
});
