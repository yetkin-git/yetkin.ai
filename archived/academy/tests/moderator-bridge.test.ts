import { describe, expect, it } from "vitest";
import {
  ACADEMY_MODERATOR_BRIDGE_TEMPLATE,
  academyLessonMainIdea,
  academyModeratorBridgeMessage,
  appendAcademyModeratorBridgeLog,
  buildAcademyModeratorBridge,
} from "@/archived/lib/academy-studio/moderator-bridge";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

describe("akademi moderatör köprüsü", () => {
  it("SEN şablonuna uygun Sokratik geçiş metni üretir", () => {
    const message = academyModeratorBridgeMessage(
      "Kurulum ve ilk program",
      "print ile ilk programı",
    );
    expect(message).toBe(
      "Bir önceki bölümde Kurulum ve ilk program başlığını ele alıp temel çıkarım olarak print ile ilk programı noktasına vardık, hocam doğru mu anlamışız?",
    );
    expect(ACADEMY_MODERATOR_BRIDGE_TEMPLATE).toContain("[önceki_konu]");
    expect(ACADEMY_MODERATOR_BRIDGE_TEMPLATE).toContain("[ana_fikir]");
    expect(ACADEMY_SEN.moderatorBridge.confirmCta).toBe("Evet, doğru anlamışız");
    expect(ACADEMY_SEN.moderatorBridge.skipCta).toBe("Yeni bölüme geç");
  });

  it("pusuladan ana fikri çıkarır", () => {
    expect(academyLessonMainIdea("python-temel-1")).toBe("print ile ilk programı");
    expect(academyLessonMainIdea("bilinmeyen-ders")).toBe("masadaki işi dürüstçe bitirmeyi");
  });

  it("ders geçişinde köprü payload üretir; aynı derste sessiz kalır", () => {
    const payload = buildAcademyModeratorBridge({
      fromLesson: { key: "python-temel-1", title: "Kurulum ve ilk program" },
      toLesson: { key: "python-temel-2", title: "Değişkenler ve tipler" },
      startListen: true,
    });
    expect(payload).not.toBeNull();
    expect(payload?.fromLessonKey).toBe("python-temel-1");
    expect(payload?.toLessonKey).toBe("python-temel-2");
    expect(payload?.startListen).toBe(true);
    expect(payload?.message).toContain("Kurulum ve ilk program");
    expect(payload?.message).toContain("print ile ilk programı");
    expect(payload?.message).toContain("hocam doğru mu anlamışız?");

    expect(
      buildAcademyModeratorBridge({
        fromLesson: { key: "python-temel-1", title: "Kurulum" },
        toLesson: { key: "python-temel-1", title: "Kurulum" },
        startListen: false,
      }),
    ).toBeNull();
  });

  it("moderatör günlüğüne konuşmacı satırı ekler", () => {
    const log = appendAcademyModeratorBridgeLog([], {
      speaker: "moderator",
      text: "özet",
      at: 1,
      id: "b1",
    });
    expect(log).toHaveLength(1);
    expect(log[0]?.speaker).toBe("moderator");
    expect(log[0]?.text).toBe("özet");
  });
});
