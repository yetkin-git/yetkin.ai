import { describe, expect, it } from "vitest";
import { fetchPublicHomepage } from "@/lib/tezgah/tetkik/fetch-html";
import {
  inspectTetkikUrl,
  isBlockedTetkikIp,
  resolveTetkikHost,
  TetkikAccessError,
} from "@/lib/tezgah/tetkik/guard";
import {
  createPinnedTarget,
  isPinnedTarget,
  pickPinnedAddress,
  pinnedLookup,
} from "@/lib/tezgah/tetkik/pinned-dispatcher";
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

  it("üçten fazla yönlendirme ve 1,5 MB üstü gövde okunmaz", async () => {    let hop = 0;
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

  it("DNS tek kez çözülür ve doğrulanmış IP bağlantıya sabitlenir (TOCTOU)", async () => {
    // Rebinding senaryosu: ilk çözüm public, ikinci çözüm özel ağ.
    const lookups: string[] = [];
    let hop = 0;
    const rebindingLookup = async () => {
      hop += 1;
      lookups.push(`lookup#${hop}`);
      return hop === 1 ? PUBLIC : ["127.0.0.1"];
    };
    const seen: Array<{ url: string; init: RequestInit | undefined }> = [];
    const inspected = inspectTetkikUrl("https://rebind.test/");
    expect(inspected.ok).toBe(true);
    if (!inspected.ok) {
      return;
    }
    const page = await fetchPublicHomepage(inspected.url, {
      lookup: rebindingLookup,
      clock: () => 1_000,
      fetch: async (url, init) => {
        seen.push({ url: String(url), init });
        return new Response("<html></html>", {
          status: 200,
          headers: { "content-type": "text/html" },
        });
      },
    });
    // Tek çözüm: fetch sırasında ikinci DNS sorgusu yapılmadı.
    expect(lookups).toEqual(["lookup#1"]);
    expect(page.htmlBytes).toBeGreaterThan(0);
    expect(seen).toHaveLength(1);
  });

  it("doğrulanmış public IP yoksa bağlantı hiç açılmaz (fail-closed)", async () => {
    const inspected = inspectTetkikUrl("https://bos.test/");
    expect(inspected.ok).toBe(true);
    if (!inspected.ok) {
      return;
    }
    const calls: string[] = [];
    // Yalnız özel ağ dönerse bağlantı atılmaz.
    await expect(
      fetchPublicHomepage(inspected.url, {
        lookup: async () => ["10.0.0.5"],
        clock: () => 1_000,
        fetch: async (url) => {
          calls.push(String(url));
          return new Response("ok", { status: 200, headers: { "content-type": "text/html" } });
        },
      }),
    ).rejects.toMatchObject({ kind: "rejected" });
    expect(calls).toEqual([]);
  });

  it("pinleme fabrikası null dönerse bağlantı atılmaz", async () => {
    const inspected = inspectTetkikUrl("https://pin.test/");
    expect(inspected.ok).toBe(true);
    if (!inspected.ok) {
      return;
    }
    const calls: string[] = [];
    await expect(
      fetchPublicHomepage(inspected.url, {
        lookup: async () => PUBLIC,
        clock: () => 1_000,
        pinnedDispatcher: () => null,
        fetch: async (url) => {
          calls.push(String(url));
          return new Response("ok", { status: 200, headers: { "content-type": "text/html" } });
        },
      }),
    ).rejects.toMatchObject({ kind: "rejected" });
    expect(calls).toEqual([]);
  });

  it("sabitlenen hedef public IPv4'ü önceler; IPv6 yedeği korunur", () => {
    expect(
      pickPinnedAddress({ addresses: ["2606:4700::1111", "93.184.216.34"], url: new URL("https://a.test/") }),
    ).toEqual({ address: "93.184.216.34", family: 4 });
    expect(
      pickPinnedAddress({ addresses: ["2606:4700::1111"], url: new URL("https://a.test/") }),
    ).toEqual({ address: "2606:4700::1111", family: 6 });
    expect(pickPinnedAddress({ addresses: [], url: new URL("https://a.test/") })).toBeNull();
    // `lookup` kancası sabit IP döndürür, ikinci DNS yok.
    const pinned = createPinnedTarget({
      addresses: ["93.184.216.34"],
      url: new URL("https://a.test/"),
    });
    expect(isPinnedTarget(pinned)).toBe(true);
    const resolved: string[] = [];
    pinnedLookup(pinned as { address: string; family: 4; hostname: string })(
      "a.test",
      undefined,
      (error, address) => {
        expect(error).toBeNull();
        resolved.push(String(address));
      },
    );
    expect(resolved).toEqual(["93.184.216.34"]);
    // Host uyuşmazsa sabit IP sızmaz.
    pinnedLookup(pinned as { address: string; family: 4; hostname: string })(
      "baska.test",
      undefined,
      (error) => {
        expect(error?.message).toBe("pinned_lookup_host_mismatch");
      },
    );
  });
});
