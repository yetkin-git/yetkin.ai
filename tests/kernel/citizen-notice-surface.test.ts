import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CITIZEN_NOTICE_KINDS } from "@/lib/kernel/notice";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("vatandaş bildirim asgarisi yüzeyi", () => {
  it("beş olay, Resend yok, yeni Prisma modeli yok", () => {
    expect([...CITIZEN_NOTICE_KINDS]).toHaveLength(5);
    const emit = readSrc("lib/kernel/notice/emit.ts");
    expect(emit).toContain("citizen.notice.");
    expect(emit).toContain("NODE_ENV === \"test\"");
    expect(emit).not.toMatch(/from ["']resend["']/i);

    const mail = readSrc("lib/kernel/notice/mail.ts");
    expect(mail).toContain("NOTICE_SMTP_HOST");
    expect(mail).toContain("smtp_unconfigured");
    expect(mail).not.toContain("RESEND_API_KEY");
    expect(mail).not.toMatch(/from ["']resend["']/i);
    expect(mail).not.toContain("nodemailer");

    const schema = readSrc("prisma/schema/kernel.prisma");
    expect(schema).not.toMatch(/model\s+CitizenNotice/);
    expect(schema).not.toMatch(/model\s+Notification/);
    expect(schema).not.toMatch(/model\s+EmailOutbox/);
  });

  it("freelancer motoru teklif/kabul/teslim basar; çekirdek RELEASE basar", () => {
    const engine = readSrc("lib/freelancer/engine.ts");
    expect(engine).toContain("bid_received");
    expect(engine).toContain("bid_accepted");
    expect(engine).toContain("result.applied");
    const messages = readSrc("lib/freelancer/messages.ts");
    expect(messages).toContain("delivery_posted");
    expect(messages).toContain("DELIVERY");
    const escrow = readSrc("lib/kernel/escrow/engine.ts");
    expect(escrow).toContain("escrow_released");
    expect(escrow).not.toContain("freelancerContract");
  });
});
