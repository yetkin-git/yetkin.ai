import { describe, expect, it } from "vitest";
import {
  FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY,
  YZ_LISTING_VISA_SUBJECT,
} from "@/lib/career/listing-visa-scope";
import {
  buildCareerVisaScopeBoard,
  listingVisaScopeSign,
} from "@/lib/career/visa-scope-board";

describe("vize-ilan kapsama tabelası", () => {
  it("freelancer kapılarını listeler; boş damgada kapı kapalıdır", () => {
    const doors = buildCareerVisaScopeBoard([]);
    expect(doors.map((door) => door.pathwayId)).toContain(FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY);
    expect(doors.every((door) => !door.open)).toBe(true);
    expect(doors.every((door) => door.courses.length > 0)).toBe(true);
  });

  it("ilan tabelası kilitli dikeyin kurslarını gösterir", () => {
    const sign = listingVisaScopeSign(YZ_LISTING_VISA_SUBJECT);
    expect(sign.pathwayId).toBe("ai-agent-entegrasyon");
    expect(sign.courses.some((course) => course.slug === "ai-temel")).toBe(true);
    expect(sign.courses[0]?.href).toMatch(/^\/academy\//);
    expect(sign.courses[0]?.title).toBeTruthy();
  });
});
