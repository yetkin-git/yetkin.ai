import { expect, test } from "@playwright/test";

/**
 * 01_office_ai 1. Ders demo medyası — oturum istemez.
 * `/oyna` kenar 307'dir; bu kapı public MP4/WAV'ın HTML5 ile yüklendiğini ve
 * kullanıcı jestiyle play() sonrası zamanın ilerlediğini doğrular.
 */
const channel = process.env.PW_CHANNEL?.trim();
if (channel === "chrome" || channel === "msedge") {
  test.use({ channel });
}

test.describe("akademi 01_office_ai demo medya oynatımı", () => {
  test("office-ai-intro.mp4 metadata yükler ve Play sonrası akar", async ({ page, baseURL }) => {
    const src = `${baseURL}/academy/demo/office-ai-intro.mp4`;
    await page.setContent(`<!doctype html>
<html><body>
<video id="demo-video" src="${src}" controls playsinline muted preload="metadata"></video>
<button id="demo-video-play" type="button">Oynat</button>
<script>
  document.getElementById("demo-video-play").addEventListener("click", () => {
    void document.getElementById("demo-video").play();
  });
</script>
</body></html>`);
    await page.waitForFunction(() => {
      const video = document.getElementById("demo-video");
      return video instanceof HTMLVideoElement && Number.isFinite(video.duration) && video.duration > 0;
    });
    await page.locator("#demo-video-play").click();
    await page.waitForFunction(() => {
      const video = document.getElementById("demo-video");
      return video instanceof HTMLVideoElement && !video.paused && video.currentTime > 0.1;
    });
    const result = await page.locator("#demo-video").evaluate((node) => {
      const video = node as HTMLVideoElement;
      return {
        duration: video.duration,
        currentTime: video.currentTime,
        paused: video.paused,
        readyState: video.readyState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
      };
    });
    expect(result.duration).toBeGreaterThan(5);
    expect(result.videoWidth).toBeGreaterThan(0);
    expect(result.videoHeight).toBeGreaterThan(0);
    expect(result.readyState).toBeGreaterThanOrEqual(2);
    expect(result.paused).toBe(false);
    expect(result.currentTime).toBeGreaterThan(0.1);
  });

  test("office-ai-podcast.wav metadata yükler ve Play sonrası akar", async ({ page, baseURL }) => {
    const src = `${baseURL}/academy/demo/office-ai-podcast.wav`;
    await page.setContent(`<!doctype html>
<html><body>
<audio id="demo-audio" src="${src}" controls preload="metadata"></audio>
<button id="demo-audio-play" type="button">Oynat</button>
<script>
  document.getElementById("demo-audio-play").addEventListener("click", () => {
    void document.getElementById("demo-audio").play();
  });
</script>
</body></html>`);
    await page.waitForFunction(() => {
      const audio = document.getElementById("demo-audio");
      return audio instanceof HTMLAudioElement && Number.isFinite(audio.duration) && audio.duration > 0;
    });
    await page.locator("#demo-audio-play").click();
    await page.waitForFunction(() => {
      const audio = document.getElementById("demo-audio");
      return audio instanceof HTMLAudioElement && !audio.paused && audio.currentTime > 0.1;
    });
    const result = await page.locator("#demo-audio").evaluate((node) => {
      const audio = node as HTMLAudioElement;
      return {
        duration: audio.duration,
        currentTime: audio.currentTime,
        paused: audio.paused,
        readyState: audio.readyState,
      };
    });
    expect(result.duration).toBeGreaterThan(3);
    expect(result.readyState).toBeGreaterThanOrEqual(2);
    expect(result.paused).toBe(false);
    expect(result.currentTime).toBeGreaterThan(0.1);
  });
});
