import { describe, expect, it } from "vitest";
import {
  juniorPilotMediaRejected,
  juniorPilotPlayRejection,
} from "@/lib/junior/pilot-play-error";

const clear = { errorCode: null, networkState: 1 };

describe("Junior pilot play() ret sınıfları", () => {
  it("jest kilidini sonraki tıklamaya bırakır", () => {
    expect(juniorPilotPlayRejection(new DOMException("autoplay", "NotAllowedError"), clear)).toBe("gesture");
    expect(juniorPilotPlayRejection(new DOMException("abort", "AbortError"), clear)).toBe("gesture");
  });

  it("kaynak yoksa veya desteklenmiyorsa hazırlanıyor der", () => {
    expect(
      juniorPilotPlayRejection(new DOMException("no source", "NotSupportedError"), clear),
    ).toBe("preparing");
    expect(
      juniorPilotMediaRejected({ errorCode: 4, networkState: 0 }),
    ).toBe(true);
    expect(
      juniorPilotPlayRejection(new Error("404"), { errorCode: 4, networkState: 3 }),
    ).toBe("preparing");
    expect(juniorPilotMediaRejected({ errorCode: null, networkState: 3 })).toBe(true);
    expect(juniorPilotPlayRejection(new Error("decode"), { errorCode: null, networkState: 2 })).toBe(
      "preparing",
    );
  });
});
