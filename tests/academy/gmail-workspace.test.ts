import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACADEMY_GMAIL_ACTION_GROUPS,
  ACADEMY_GMAIL_ACTION_HEAD,
  ACADEMY_GMAIL_CARRY_WATER_CLIP,
  ACADEMY_GMAIL_GEMINI_PROMPT,
  ACADEMY_GMAIL_INBOX_HEAD,
  ACADEMY_GMAIL_MAILS,
  ACADEMY_GMAIL_NATIVE_TOOL,
  ACADEMY_GMAIL_SAMPLE_LOCK,
  ACADEMY_GMAIL_WINDOW_TITLE,
  academyGmailStageKind,
} from "@/lib/academy/gmail-workspace";

const ROOT = process.cwd();

describe("Gmail + Gemini gelen kutusu tuvali", () => {
  it("satırlar Kaya, Yönetim, Banka, Bülten; aksiyon grupları üç ton", () => {
    expect(ACADEMY_GMAIL_WINDOW_TITLE).toBe("Gmail");
    expect(ACADEMY_GMAIL_NATIVE_TOOL).toBe("Gemini");
    expect(ACADEMY_GMAIL_INBOX_HEAD).toBe("Gelen Kutusu · son 24 saat");
    expect(ACADEMY_GMAIL_ACTION_HEAD).toBe("Aksiyon listesi · kutu yerinde");
    expect(ACADEMY_GMAIL_SAMPLE_LOCK).toBe("Örnek iletiler; kendi kutundaki işi koy.");
    expect(ACADEMY_GMAIL_MAILS.map((mail) => mail.from)).toEqual([
      "Kaya Gıda A.Ş.",
      "Yönetim Kurulu",
      "Banka Dekontu",
      "Haftalık Bülten",
    ]);
    expect(ACADEMY_GMAIL_MAILS.map((mail) => mail.cell)).toEqual(["A1", "B1", "C1", "D1"]);
    expect(ACADEMY_GMAIL_ACTION_GROUPS.map((group) => group.label)).toEqual([
      "ÖDEME / ONAY",
      "ACİL AKSİYON",
      "ARŞİVLİK",
    ]);
    expect(ACADEMY_GMAIL_ACTION_GROUPS.map((group) => group.tone)).toEqual(["acil", "bekle", "arsiv"]);
    expect(ACADEMY_GMAIL_CARRY_WATER_CLIP).toEqual([
      "Ctrl+C ile ileti kopyala",
      "Ekran görüntüsü al",
      "ChatGPT’ye yapıştır — kutu kopuk",
    ]);
    expect(ACADEMY_GMAIL_GEMINI_PROMPT).toMatch(/Gönderen \| İş \| Son tarih \| Taslak yanıt notu/u);
    expect(ACADEMY_GMAIL_GEMINI_PROMPT).toMatch(/Hiçbir taslağı gönderme/u);
    expect(ACADEMY_GMAIL_GEMINI_PROMPT).not.toMatch(/@Gmail/u);
    expect(ACADEMY_GMAIL_GEMINI_PROMPT).toBe(
      "Gelen kutumdaki son 24 saat içinde gelen e-postaları tara. Ödeme, onay veya acil aksiyon bekleyenleri tablo yap: Gönderen | İş | Son tarih | Taslak yanıt notu. Rutin dekont ve bültenleri Arşivlik yaz. Hiçbir taslağı gönderme.",
    );
  });

  it("sahne türü: taşıma su kopuk, Gemini aç inbox, yerleşik native", () => {
    expect(academyGmailStageKind({ section: "GİRİŞ KÖPRÜSÜ" })).toBe("disconnected");
    expect(academyGmailStageKind({ section: "TAŞIMA SU" })).toBe("disconnected");
    expect(academyGmailStageKind({ section: "HOŞ GELDİN" })).toBe("inbox");
    expect(academyGmailStageKind({ section: "GEMİNİ AÇ", hideReply: true })).toBe("inbox");
    expect(academyGmailStageKind({ section: "YERLEŞİK YOL" })).toBe("native");
    expect(academyGmailStageKind({ pane: "before", section: "FARK ORTADA" })).toBe("disconnected");
    expect(academyGmailStageKind({ pane: "after", section: "FARK ORTADA" })).toBe("native");
  });

  it("16:9 Gmail penceresi siyah boşluk bırakmaz; Gemini paneli dolgundur", () => {
    const gmail = readFileSync(join(ROOT, "components/academy/lesson-gmail-workspace.tsx"), "utf8");
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    expect(gmail).toContain("applyAcademyOfficeWinFit");
    expect(gmail).toContain("data-academy-office-win-fit");
    expect(gmail).toContain("data-academy-gmail-canvas");
    expect(gmail).toContain("data-academy-gmail-carry-panel");
    expect(gmail).toContain("data-academy-gmail-native");
    expect(gmail).toContain("data-academy-gmail-inbox");
    expect(gmail).toContain("LessonAiDesk");
    expect(gmail).toContain("LessonOfficeCopilotRibbon");
    expect(gmail).toContain('host="gmail"');
    expect(gmail).toContain("ACADEMY_GMAIL_MAILS.map");
    expect(gmail).toContain("ACADEMY_GMAIL_ACTION_GROUPS.map");
    expect(gmail).toContain("ACADEMY_GMAIL_CARRY_WATER_CLIP.map");
    expect(gmail).toContain("ACADEMY_GMAIL_SAMPLE_LOCK");
    expect(gmail).toContain("data-academy-gmail-sample-lock");
    expect(css).toMatch(
      /\.academy-player-karaoke \.academy-player-widescreen[\s\S]*?aspect-ratio:\s*16\s*\/\s*9/s,
    );
    expect(css).toMatch(/\.academy-player-waiter \.academy-outlook-win\s*\{[^}]*height:\s*100%/s);
    expect(css).toMatch(
      /\.academy-gmail-desk \.academy-outlook-canvas--compact[\s\S]*?background:\s*#122033/s,
    );
    expect(css).toMatch(
      /\.academy-gmail-desk \.academy-outlook-canvas > \.academy-gmail-carry[\s\S]*?background:\s*#122033/s,
    );
    expect(css).not.toMatch(
      /\.academy-gmail-desk \.academy-outlook-canvas[\s\S]{0,220}background:\s*#000(?:000)?/s,
    );
    expect(css).toMatch(/\.academy-gmail-copilot\s*\{[^}]*height:\s*100%/s);
    expect(css).toMatch(/\.academy-gmail-copilot\s*\{[^}]*background:\s*#152536/s);
    expect(css).toMatch(/\.academy-outlook-row\s*\{[^}]*background:\s*#163250/s);
    expect(css).toMatch(/\.academy-outlook-row\.unread\s*\{[^}]*background:\s*#1b3d63/s);
    expect(css).toMatch(/\.academy-gmail-carry-badge\s*\{[^}]*color:\s*#fb923c/s);
    expect(css).toMatch(
      /\.academy-player-waiter:not\(\.academy-player-compare\) \.academy-gmail-desk \.academy-outlook-row[\s\S]*?min-height:\s*3\.1rem/s,
    );
  });
});
