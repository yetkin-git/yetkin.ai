import { afterEach, describe, expect, it, vi } from "vitest";
import { createMemoryPaymentAnomalyStore } from "../helpers/memory-payment-anomaly";
import {
  evaluateClearedLicenseGaps,
  runLicenseGapScan,
  type LicenseGapSnapshot,
} from "@/lib/kernel/payments/license-gap";

const USER = "user-1";

function snapshot(overrides: Partial<LicenseGapSnapshot> = {}): LicenseGapSnapshot {
  return {
    orders: [
      {
        id: "po-academy",
        userId: USER,
        merchantOid: "AC1",
        purpose: "academy-license:ofis-yapay-zeka",
        amountMinor: 89000,
      },
      {
        id: "po-junior",
        userId: USER,
        merchantOid: "JR1",
        purpose: "junior-license:yearly",
        amountMinor: 149000,
      },
      {
        id: "po-wallet",
        userId: USER,
        merchantOid: "WL1",
        purpose: "wallet-top-up",
        amountMinor: 5000,
      },
    ],
    academySeats: [{ userId: USER, courseSlug: "ofis-yapay-zeka" }],
    juniorSeats: [
      {
        userId: USER,
        status: "ACTIVE",
        appliedMerchantOids: ["JR1"],
      },
    ],
    refundedMerchantOids: [],
    ...overrides,
  };
}

describe("CLEARED lisans sapması", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("eşleşen akademi ve junior siparişi alarm saymaz; cüzdan yüklemesi lisans değildir", () => {
    const evaluation = evaluateClearedLicenseGaps(snapshot());
    expect(evaluation.gaps).toEqual([]);
    expect(evaluation.compensated).toEqual([]);
  });

  it("CLEARED olup lisansı olmayan akademi ve junior siparişi ayırır", () => {
    const evaluation = evaluateClearedLicenseGaps(
      snapshot({
        academySeats: [],
        juniorSeats: [],
      }),
    );
    expect(evaluation.gaps.map((row) => `${row.product}:${row.reason}`)).toEqual([
      "academy:missing_purchase",
      "junior:missing_subscription",
    ]);
  });

  it("Junior oid işlenmiş ama paket ACTIVE değilse sapmadır", () => {
    const evaluation = evaluateClearedLicenseGaps(
      snapshot({
        juniorSeats: [
          { userId: USER, status: "PENDING", appliedMerchantOids: ["JR1"] },
        ],
      }),
    );
    expect(evaluation.gaps.map((row) => row.reason)).toEqual(["subscription_inactive"]);
  });

  it("SUCCEEDED iade eksik lisansı alarm dışına alır", () => {
    const evaluation = evaluateClearedLicenseGaps(
      snapshot({
        academySeats: [],
        refundedMerchantOids: ["AC1"],
      }),
    );
    expect(evaluation.gaps).toEqual([]);
    expect(evaluation.compensated.map((row) => row.merchantOid)).toEqual(["AC1"]);
  });

  it("sapmada license_gap anomali yazar ve error loglar; bakiye düzeltilmez", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const anomalies = createMemoryPaymentAnomalyStore();
    const result = await runLicenseGapScan(
      {
        anomalies,
        async loadSnapshot() {
          return snapshot({ academySeats: [], juniorSeats: [] });
        },
      },
      "license-gap-test",
    );
    expect(result.clearedLicenseOrders).toBe(2);
    expect(result.gaps).toBe(2);
    expect(result.anomaliesWritten).toBe(2);
    expect(anomalies.list().every((row) => row.kind === "license_gap")).toBe(true);
    expect(error.mock.calls.length).toBeGreaterThan(0);
    const lines = error.mock.calls.map((call) => String(call[0]));
    expect(lines.some((line) => line.includes("license.gap"))).toBe(true);
    expect(lines.some((line) => line.includes("missing_license"))).toBe(true);

    const replay = await runLicenseGapScan(
      {
        anomalies,
        async loadSnapshot() {
          return snapshot({ academySeats: [], juniorSeats: [] });
        },
      },
      "license-gap-test",
    );
    expect(replay.anomaliesWritten).toBe(0);
    expect(anomalies.list()).toHaveLength(2);
  });
});
