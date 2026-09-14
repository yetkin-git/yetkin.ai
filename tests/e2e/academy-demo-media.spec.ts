import { expect, test } from "@playwright/test";

/**
 * 01_office_ai demo medyası — oturum istemez.
 * Eski intro MP4 taslağı durmaz. WAV hâlâ public demo dosyasıdır.
 */
const channel = process.env.PW_CHANNEL?.trim();
if (channel === "chrome" || channel === "msedge") {
  test.use({ channel });
}

test.describe("akademi 01_office_ai demo medya oynatımı", () => {
  test("eski office-ai-intro.mp4 taslak görseli durmaz", async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/academy/demo/office-ai-intro.mp4`);
    expect(response.status()).toBe(404);
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
