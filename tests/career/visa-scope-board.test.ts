import { describe, expect, it } from "vitest";
import { FREELANCER_GUARANTEED_NEED_IDS, isOpenTrialNeed } from "@/lib/kernel/catalog-ids";
import {
  FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY,
  YZ_LISTING_VISA_SUBJECT,
} from "@/lib/career/listing-visa-scope";
import {
  buildCareerVisaScopeBoard,
  listingVisaScopeSign,
} from "@/lib/career/visa-scope-board";

describe("vize-ilan kapsama tabelası", () => {
  it("yalnız müfredat SKU kapılarını listeler; boş damgada kapı kapalıdır", () => {
    const doors = buildCareerVisaScopeBoard([]);
    expect(doors.map((door) => door.pathwayId)).toEqual([...FREELANCER_GUARANTEED_NEED_IDS]);
    expect(doors.map((door) => door.pathwayId)).toContain(FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY);
    expect(doors.every((door) => !door.open)).toBe(true);
    expect(doors.every((door) => !isOpenTrialNeed(door.pathwayId))).toBe(true);
    expect(doors.every((door) => door.courses.length > 0)).toBe(true);
    expect(doors.every((door) => door.benefits.map((row) => row.id).join() === "employer-network,sealed-cv,project-proof")).toBe(
      true,
    );
    expect(doors.every((door) => door.publicTalentHref === null)).toBe(true);
  });

  it("ilan tabelası kilitli dikeyin kurslarını gösterir", () => {
    const sign = listingVisaScopeSign(YZ_LISTING_VISA_SUBJECT);
    expect(sign.pathwayId).toBe("chatbot-musteri-hizmetleri");
    expect(sign.courses.some((course) => course.slug === "04_chatbot_nocode")).toBe(true);
    expect(sign.courses[0]?.href).toMatch(/^\/academy\//);
    expect(sign.courses[0]?.title).toBeTruthy();
  });
});
