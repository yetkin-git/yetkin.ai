import { describe, expect, it } from "vitest";
import { juniorLessonMediaIsPublicPreview } from "@/lib/junior/media-visibility";
import { JUNIOR_SCENE_PLATES, juniorSceneMediaForBeat } from "@/lib/junior/scene-media";

describe("junior sahne medyası — kamu kapısı", () => {
  it("erişim hakkı olan derste kilitli ve ücretsiz tüm plaka ve videolar kendi adımında URL üretir", () => {
    const mat8 = juniorSceneMediaForBeat("jr_06_mat-8", 4);
    expect(mat8.imageSrc).toMatch(/\/media\/junior\/scenes\/jr_06_mat-8\/step-5\.jpg$/u);
    expect(mat8.videoSrc).toBeNull();

    const fen10 = juniorSceneMediaForBeat("jr_06_fen-10", 4);
    expect(fen10.imageSrc).toMatch(/\/media\/junior\/scenes\/jr_06_fen-10\/step-5\.jpg$/u);
    expect(fen10.videoSrc).toMatch(/\/media\/junior\/scenes\/jr_06_fen-10\/step-5\.mp4$/u);

    expect(juniorSceneMediaForBeat("jr_06_mat-8", 9)).toEqual({ videoSrc: null, imageSrc: null });
  });

  it("diskte olmayan plaka adresi üretmez; adım vektör sahneye düşer", () => {
    expect(juniorSceneMediaForBeat("jr_06_mat-4", 4)).toEqual({ videoSrc: null, imageSrc: null });
    expect(juniorSceneMediaForBeat("jr_06_mat-7", 4)).toEqual({ videoSrc: null, imageSrc: null });
    expect(juniorSceneMediaForBeat("jr_06_mat-19", 4)).toEqual({ videoSrc: null, imageSrc: null });
    expect(juniorSceneMediaForBeat("jr_06_fen-2", 5)).toEqual({ videoSrc: null, imageSrc: null });
  });

  it("ücretsiz derslerin mp4 yolu dosya yokken de bağlıdır; JPG'ye düşer", () => {
    const media = juniorSceneMediaForBeat("jr_06_fen-1", 5);
    expect(media.videoSrc).toMatch(/\/media\/junior\/scenes\/jr_06_fen-1\/step-6\.mp4$/u);
    expect(media.imageSrc).toMatch(/\/media\/junior\/scenes\/jr_06_fen-1\/step-6\.jpg$/u);
  });

  it("kayıtlı tüm plaka ve videolar ilgili adımda URL döner", () => {
    for (const plate of JUNIOR_SCENE_PLATES) {
      const media = juniorSceneMediaForBeat(plate.lessonKey, plate.step - 1);
      expect(media.imageSrc).toMatch(
        new RegExp(`/media/junior/scenes/${plate.lessonKey}/step-${plate.step}\\.jpg$`, "u"),
      );
    }
    const publicPlates = JUNIOR_SCENE_PLATES.filter((plate) =>
      juniorLessonMediaIsPublicPreview(plate.lessonKey),
    )
      .map((plate) => `${plate.lessonKey}/step-${plate.step}`)
      .sort();
    expect(juniorLessonMediaIsPublicPreview("jr_06_mat-1")).toBe(true);
    expect(juniorLessonMediaIsPublicPreview("jr_06_mat-4")).toBe(false);
    expect(publicPlates).toEqual(["jr_06_fen-1/step-6"]);
  });
});
