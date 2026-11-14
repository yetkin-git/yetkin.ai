import { describe, expect, it } from "vitest";
import { fetchPublicHomepage } from "@/lib/tezgah/tetkik/fetch-html";
import {
  inspectTetkikUrl,
  isBlockedTetkikIp,
  resolveTetkikHost,
  TetkikAccessError,
} from "@/lib/tezgah/tetkik/guard";
import { TETKIK_MAX_HTML_BYTES, TETKIK_USER_AGENT } from "@/lib/tezgah/tetkik/rubric";

const PUBLIC = ["93.184.216.34"];

function rejectReason(raw: string): string {
  const inspected = inspectTetkikUrl(raw);
  return inspected.ok ? "allowed" : inspected.reason;
}

describe("tetkik SSRF kalkanı", () => {
  it("özel ağ, metadata, kimlik ve http adresini reddeder", () => {
    expect(rejectReason("http://ornek.test/")).toBe("scheme");
    expect(rejectReason("https://user:pass@ornek.test/")).toBe("credentials");
    expect(rejectReason("https://ornek.test:8443/")).toBe("port");
    expect(rejectReason("https://localhost/")).toBe("host");
    expect(rejectReason("https://metadata.google.internal/")).toBe("host");
    expect(rejectReason("https://127.0.0.1/")).toBe("private");
    expect(rejectReason("https://10.1.2.3/")).toBe("private");
    expect(rejectReason("https://192.168.0.8/")).toBe("private");
    expect(rejectReason("https://172.16.0.4/")).toBe("private");
    expect(rejectReason("https://169.254.169.254/latest/meta-data")).toBe("private");
    expect(rejectReason("https://2130706433/")).toBe("private");
    expect(rejectReason("https://[::1]/")).toBe("private");
    expect(rejectReason("https://[::ffff:127.0.0.1]/")).toBe("private");
    expect(inspectTetkikUrl("https://ornek.test/").ok).toBe(true);
    expect(isBlockedTetkikIp("::ffff:7f00:1")).toBe(true);
    expect(isBlockedTetkikIp("8.8.8.8")).toBe(false);
    expect(isBlockedTetkikIp("fd00::1")).toBe(true);
  });

  it("DNS özel ağa çözülürse istek atılmaz", async () => {
    const calls: string[] = [];
    await expect(
      resolveTetkikHost("ornek.test", async () => ["10.0.0.4", "93.184.216.34"]),
    ).resolves.toBe("private");
    const inspected = inspectTetkikUrl("https://ornek.test/");
    expect(inspected.ok).toBe(true);
    if (!inspected.ok) {
      return;
    }
    await expect(
      fetchPublicHomepage(inspected.url, {
        lookup: async () => ["192.168.1.9"],
        clock: () => 1_000,
        fetch: async (url) => {
          calls.push(String(url));
          return new Response("yok", { status: 200, headers: { "content-type": "text/html" } });
        },
      }),
    ).rejects.toMatchObject({ kind: "rejected" });
    expect(calls).toEqual([]);
  });

  it("yönlendirme metadata adresine veya http'ye çıkmaz", async () => {
    const seen: RequestInit[] = [];
    const fetchImpl = async (_url: string | URL | Request, init?: RequestInit) => {
      seen.push(init ?? {});
      return new Response(null, {
        status: 302,
        headers: { location: "https://169.254.169.254/latest/meta-data" },
      });
    };
    const inspected = inspectTetkikUrl("https://iyi.test/");
    expect(inspected.ok).toBe(true);
    if (!inspected.ok) {
      return;
    }
    await expect(
      fetchPublicHomepage(inspected.url, {
        fetch: fetchImpl,
        lookup: async () => PUBLIC,
        clock: () => 1_000,
      }),
    ).rejects.toBeInstanceOf(TetkikAccessError);
    expect(seen).toHaveLength(1);
    expect(seen[0]?.redirect).toBe("manual");
    expect(new Headers(seen[0]?.headers).get("user-agent")).toBe(TETKIK_USER_AGENT);

    const httpHop = async () =>
      new Response(null, { status: 302, headers: { location: "http://127.0.0.1/" } });
    await expect(
      fetchPublicHomepage(inspected.url, {
        fetch: httpHop,
        lookup: async () => PUBLIC,
        clock: () => 1_000,
      }),
    ).rejects.toMatchObject({ kind: "rejected" });
  });

  it("üçten fazla yönlendirme ve 1,5 MB üstü gövde okunmaz", async () => {
    let hop = 0;
    const inspected = inspectTetkikUrl("https://hop0.test/");
    expect(inspected.ok).toBe(true);
    if (!inspected.ok) {
      return;
    }
    await expect(
      fetchPublicHomepage(inspected.url, {
        lookup: async () => PUBLIC,
        clock: () => 1_000,
        fetch: async () => {
          hop += 1;
          return new Response(null, {
            status: 302,
            headers: { location: `https://hop${hop}.test/` },
          });
        },
      }),
    ).rejects.toMatchObject({ kind: "unreadable" });
    expect(hop).toBe(4);

    const chunk = new Uint8Array(TETKIK_MAX_HTML_BYTES + 1);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(chunk);
        controller.close();
      },
    });
    await expect(
      fetchPublicHomepage(inspected.url, {
        lookup: async () => PUBLIC,
        clock: () => 1_000,
        fetch: async () => new Response(stream, { status: 200, headers: { "content-type": "text/html" } }),
      }),
    ).rejects.toMatchObject({ kind: "unreadable" });
  });
});
