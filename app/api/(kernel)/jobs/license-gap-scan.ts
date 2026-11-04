import { createLicenseGapPorts } from "@/app/api/(kernel)/payments/license-gap-runtime";
import { inngest } from "@/lib/kernel/jobs/inngest";
import { runLicenseGapScan } from "@/lib/kernel/payments/license-gap";

/**
 * On beş dakikada bir CLEARED lisans sapması.
 * Vercel Hobby günde birden sık cron ifadesini reddeder; bu iş Inngest takvimindedir.
 * Inngest yokken yedek `GET /api/cron/license-gap` (günde bir).
 */
export const licenseGapScan = inngest.createFunction(
  {
    id: "license-gap-scan",
    name: "CLEARED lisans sapma alarmı",
    triggers: [{ cron: "TZ=Europe/Istanbul */15 * * * *" }],
  },
  async ({ step }) => {
    return step.run("scan-cleared-license-gaps", async () => {
      if (!process.env.DATABASE_URL?.trim()) {
        return {
          clearedLicenseOrders: 0,
          gaps: 0,
          compensated: 0,
          anomaliesWritten: 0,
        };
      }
      return runLicenseGapScan(createLicenseGapPorts(), "license-gap-cron");
    });
  },
);
