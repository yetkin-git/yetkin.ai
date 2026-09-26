// @vitest-environment happy-dom
import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AccountClosePanel } from "@/components/kernel/account-close-panel";
import { WalletRefundButton } from "@/components/kernel/wallet-refund-button";
import { ActionBridgeProvider } from "@/components/ui/action-bridge";
import { CUZDAN_SEN } from "@/lib/copy/sen-voice/cuzdan";
import { WALLET_REFUND_PATH } from "@/lib/kernel/identity/types";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { formatMinor } from "@/lib/kernel/money/format";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));

const BALANCE = 2_500;
const AMOUNT = formatMinor(BALANCE, SETTLEMENT_CURRENCY);

function refundEnvelope() {
  return {
    ok: true,
    error: null,
    requestId: "req-refund",
    apiVersion: "1",
    data: {
      refund: { refundedMinor: BALANCE, requestedMinor: BALANCE, balanceMinor: 0 },
    },
  };
}

function buttonNamed(name: string): HTMLButtonElement {
  const found = [...document.querySelectorAll("button")].find((el) => el.textContent?.trim() === name);
  if (!(found instanceof HTMLButtonElement)) {
    throw new Error(`Düğme yok: ${name}`);
  }
  return found;
}

describe("cüzdan iade onay modalı", () => {
  (
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  let root: Root | null = null;
  let host: HTMLDivElement | null = null;
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      json: async () => refundEnvelope(),
    });
    vi.stubGlobal("fetch", fetchMock);
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    host?.remove();
    root = null;
    host = null;
    vi.unstubAllGlobals();
  });

  async function mount(node: ReactNode) {
    await act(async () => {
      root?.render(createElement(ActionBridgeProvider, null, node));
    });
  }

  async function click(name: string) {
    await act(async () => {
      buttonNamed(name).click();
    });
  }

  it("onay metni bakiyeyi yazar", () => {
    expect(CUZDAN_SEN.refundConfirmTitle).toBe("Cüzdan Bakiyesi İadesi");
    expect(CUZDAN_SEN.refundConfirmBody(AMOUNT)).toBe(
      `Cüzdanınızdaki ${AMOUNT} tutarındaki kullanılmamış bakiye kartınıza iade edilecektir. İadeler PayTR altyapısıyla 1-3 iş günü içerisinde hesabına yansır. İşlemi onaylıyor musunuz?`,
    );
  });

  it.each([
    ["cüzdan", createElement(WalletRefundButton, { balanceMinor: BALANCE })],
    ["hesap kapatma", createElement(AccountClosePanel, { balanceMinor: BALANCE })],
  ])("%s: Vazgeç iadeyi açmaz, Evet İade Et akışı ve toast çalışır", async (_label, node) => {
    await mount(node);
    await click(CUZDAN_SEN.refundCta);
    expect(document.body.textContent).toContain(CUZDAN_SEN.refundConfirmTitle);
    expect(document.body.textContent).toContain(CUZDAN_SEN.refundConfirmBody(AMOUNT));

    await click(CUZDAN_SEN.refundConfirmCancel);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(document.body.textContent).not.toContain(CUZDAN_SEN.refundConfirmTitle);

    await click(CUZDAN_SEN.refundCta);
    await click(CUZDAN_SEN.refundConfirmAccept);
    await act(async () => {
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(WALLET_REFUND_PATH);
    const done = CUZDAN_SEN.refundDone(AMOUNT);
    expect(document.body.textContent).toContain(done);
    expect(document.querySelector(".action-bridge-toast")?.textContent).toContain(done);
  });
});
