import { describe, expect, it } from "vitest";
import {
  paytrClearingScanResult,
  selectPaytrClearingCandidates,
} from "@/lib/kernel/jobs/paytr-clearing-scan";

describe("PayTR valör tarama sınırları", () => {
  it("boş, null, yalnızca boşluk merchantOid için aday üretmez; dispatched 0", () => {
    const pending = selectPaytrClearingCandidates([
      { merchantOid: "" },
      { merchantOid: "   " },
      { merchantOid: null },
      { merchantOid: undefined },
      {},
    ]);
    expect(pending).toEqual([]);
    expect(paytrClearingScanResult(pending)).toEqual({ dispatched: 0 });
  });

  it("hatalı satırlar elenir, yalnız dolu oid dispatched sayılır", () => {
    const pending = selectPaytrClearingCandidates([
      { merchantOid: "" },
      { merchantOid: "  WALLET-1  " },
      { merchantOid: null },
      { merchantOid: "WALLET-2" },
    ]);
    expect(pending).toEqual([{ merchantOid: "WALLET-1" }, { merchantOid: "WALLET-2" }]);
    expect(paytrClearingScanResult(pending)).toEqual({ dispatched: 2 });
  });

  it("aday yokken sendEvent çağrılmaz sözleşmesi: dispatched 0", () => {
    expect(paytrClearingScanResult([])).toEqual({ dispatched: 0 });
  });
});
