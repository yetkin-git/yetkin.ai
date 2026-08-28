import { describe, expect, it } from "vitest";
import {
  isNoticeMailConfigured,
  readNoticeMailConfig,
} from "@/lib/kernel/notice/mail";

describe("SMTP boş / kısmi dürüst atlama", () => {
  it("host+from yoksa unconfigured; partial host tek başına null", () => {
    expect(readNoticeMailConfig({})).toBeNull();
    expect(isNoticeMailConfigured({})).toBe(false);
    expect(
      readNoticeMailConfig({
        NOTICE_SMTP_HOST: "smtp.example.test",
      }),
    ).toBeNull();
    expect(
      readNoticeMailConfig({
        NOTICE_MAIL_FROM: "ops@example.test",
      }),
    ).toBeNull();
    expect(
      readNoticeMailConfig({
        NOTICE_SMTP_HOST: "smtp.example.test",
        NOTICE_MAIL_FROM: "ops@example.test",
      }),
    ).toEqual({
      host: "smtp.example.test",
      port: 587,
      user: "",
      pass: "",
      from: "ops@example.test",
    });
    expect(
      readNoticeMailConfig({
        NOTICE_SMTP_HOST: "smtp.example.test",
        NOTICE_MAIL_FROM: "ops@example.test",
        NOTICE_SMTP_PORT: "not-a-port",
      }),
    ).toBeNull();
  });
});
