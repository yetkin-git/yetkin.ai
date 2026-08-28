import { describe, expect, it } from "vitest";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";

const REQUEST_ID = "550e8400-e29b-41d4-a716-446655440000";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("vatandaş zarfı v1", () => {
  it("v1 data alanlarını body'ye indirir; lock okunur", async () => {
    const envelope = await readCitizenEnvelope(
      jsonResponse({
        ok: true,
        error: null,
        requestId: REQUEST_ID,
        apiVersion: "1",
        data: { lock: { id: "lock_1" }, applied: true },
      }),
    );
    expect(envelope.ok).toBe(true);
    expect(envelope.body.lock).toEqual({ id: "lock_1" });
    expect(envelope.body.applied).toBe(true);
  });

  it("versiyonsuz kök alanları parse fail'dir", async () => {
    const envelope = await readCitizenEnvelope(
      jsonResponse({ ok: true, lock: { id: "lock_2" }, requestId: REQUEST_ID }),
    );
    expect(envelope.ok).toBe(false);
    expect(envelope.error).toBe("v1 zarfı okunamadı.");
  });

  it("v1 hata zarfı error metnini taşır", async () => {
    const envelope = await readCitizenEnvelope(
      jsonResponse(
        {
          ok: false,
          error: "Bakiye yetersiz.",
          requestId: REQUEST_ID,
          apiVersion: "1",
          data: null,
        },
        409,
      ),
    );
    expect(envelope).toMatchObject({
      status: 409,
      ok: false,
      error: "Bakiye yetersiz.",
    });
  });

  it("parseRailClientJson ile aynı T'ye iner", () => {
    const v1 = parseRailClientJson<{ lock: { id: string } }>({
      ok: true,
      error: null,
      requestId: REQUEST_ID,
      apiVersion: "1",
      data: { lock: { id: "x" } },
    });
    expect(v1).toEqual({ ok: true, data: { lock: { id: "x" } }, envelope: "v1" });
  });
});
