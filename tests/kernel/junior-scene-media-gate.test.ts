import { describe, expect, it } from "vitest";
import { juniorLessonMediaIsPublicPreview } from "@/lib/junior/media-visibility";
import { JUNIOR_SCENE_PLATES, juniorSceneMediaForBeat } from "@/lib/junior/scene-media";

describe("junior sahne medyası — kamu kapısı", () => {
  it("kilitli dersin sahnesi görsel ve video üretmez; oynatıcı vektör sahneye düşer", () => {
    expect(juniorSceneMediaForBeat("jr_06_mat-6", 0)).toEqual({ videoSrc: null, imageSrc: null });
    expect(juniorSceneMediaForBeat("jr_06_fen-10", 4)).toEqual({ videoSrc: null, imageSrc: null });
  });

  it("ücretsiz önizleme dersinin sahne görseli kamu medya yolunu verir", () => {
    const media = juniorSceneMediaForBeat("jr_06_mat-14", 4);
    expect(media.imageSrc).toMatch(/\/media\/junior\/scenes\/jr_06_mat-14\/step-5\.jpg$/u);
    expect(media.videoSrc).toBeNull();
  });

  it("ücretsiz derslerin mp4 yolu dosya yokken de bağlıdır; JPG'ye düşer", () => {
    const media = juniorSceneMediaForBeat("jr_06_fen-1", 5);
    expect(media.videoSrc).toMatch(/\/media\/junior\/scenes\/jr_06_fen-1\/step-6\.mp4$/u);
    expect(media.imageSrc).toMatch(/\/media\/junior\/scenes\/jr_06_fen-1\/step-6\.jpg$/u);
  });

  it("yayına giren sahne seti yalnız ücretsiz önizleme derslerinin plakalarıdır", () => {
    const publicPlates = JUNIOR_SCENE_PLATES.filter((plate) =>
      juniorLessonMediaIsPublicPreview(plate.lessonKey),
    )
      .map((plate) => `${plate.lessonKey}/step-${plate.step}`)
      .sort();
    expect(publicPlates).toEqual(["jr_06_fen-1/step-6", "jr_06_mat-14/step-5"]);
  });
});
