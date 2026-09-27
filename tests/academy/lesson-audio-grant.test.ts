import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "../../proxy";
import {
  ACADEMY_AUDIO_GRANT_TTL_SEC,
  decideAcademyAudioPublicRequest,
  withAcademyAudioGrant,
} from "@/lib/academy/lesson-audio-grant";
import { academyLessonAudioPlaybackSrc } from "@/lib/academy/lesson-audio";

const ENV = { NODE_ENV: "test", VITEST: "true" } as const;

describe("ders sesi imza kapısı", () => {
  it("imzasız adres yasaktır; imzalı mühürlü adres geçer", async () => {
    const src = await withAcademyAudioGrant(
      academyLessonAudioPlaybackSrc("01_office_ai", "01_office_ai-1"),
      Date.now(),
      ENV,
    );
    expect(src).toContain("/media/academy/audio/01_office_ai/01_office_ai-1.mp3");
    expect(src).toContain("g=");
    const signed = new URL(src!, "https://yetkin.ai");
    expect(await decideAcademyAudioPublicRequest(signed, Date.now(), ENV)).toBe("allow");

    const naked = new URL("https://yetkin.ai/media/academy/audio/01_office_ai/01_office_ai-1.mp3");
    expect(await decideAcademyAudioPublicRequest(naked, Date.now(), ENV)).toBe("forbidden");

    const off201 = await withAcademyAudioGrant(
      "/media/academy/audio/01_office_ai_ileri/01_office_ai_ileri-1.mp3",
      Date.now(),
      ENV,
    );
    expect(off201).toContain("g=");
    const off201Url = new URL(off201!, "https://yetkin.ai");
    expect(await decideAcademyAudioPublicRequest(off201Url, Date.now(), ENV)).toBe("allow");
  });

  it("süresi dolmuş imza geçmez", async () => {
    const now = Date.now();
    const src = await withAcademyAudioGrant(
      "/media/academy/audio/01_office_ai/01_office_ai-1.mp3",
      now,
      ENV,
    );
    const url = new URL(src!, "https://yetkin.ai");
    const later = now + (ACADEMY_AUDIO_GRANT_TTL_SEC + 120) * 1000;
    expect(await decideAcademyAudioPublicRequest(url, later, ENV)).toBe("forbidden");
  });

  it("kenar imzasız isteği 403 döner", async () => {
    const denied = await proxy(
      new NextRequest(new URL("https://yetkin.ai/media/academy/audio/01_office_ai/01_office_ai-1.mp3")),
    );
    expect(denied.status).toBe(403);
    expect(denied.headers.get("cache-control")).toBe("no-store");

    const off201 = await proxy(
      new NextRequest(
        new URL("https://yetkin.ai/media/academy/audio/01_office_ai_ileri/01_office_ai_ileri-1.mp3"),
      ),
    );
    expect(off201.status).toBe(403);
    expect(off201.headers.get("cache-control")).toBe("no-store");
  });
});
