import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import { GA4_BREAKDOWN_LIMIT, GA4_CACHE_FAILURE_MS, GA4_CACHE_SUCCESS_MS } from "@/lib/kernel/telemetry/ga4-admin-types";
import {
  clearGa4DataCache,
  createGa4ReadMemory,
  loadAdminGa4Board,
  runRealtimeReport,
  runReport,
  type Ga4DataPort,
  type Ga4Env,
  type Ga4ReadOptions,
} from "@/lib/kernel/telemetry/ga4-data-client";
import { formatGa4Count, labelGa4Channel, labelGa4Country } from "@/lib/kernel/telemetry/ga4-display";

const ROOT = process.cwd();
const ADMIN = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "yapinet360@gmail.com",
  emailConfirmedAt: "2026-01-01T00:00:00.000Z",
};
const CITIZEN = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "yetkin.vision@gmail.com",
  emailConfirmedAt: "2026-01-01T00:00:00.000Z",
};
const NOW = new Date("2026-09-12T12:00:00.000Z");

function pem(): string {
  return ["-----BEGIN ", "PRIVATE KEY-----", "\nnot-a-real-key\n", "-----END ", "PRIVATE KEY-----"].join("");
}

function serviceJson(): string {
  return JSON.stringify({
    type: "service_account",
    client_email: "ga4-reader@example.iam.gserviceaccount.com",
    private_key: pem(),
    project_id: "example-project",
  });
}

function baseEnv(extra: Ga4Env = {}): Ga4Env {
  return {
    GA4_PROPERTY_ID: "123456789",
    GOOGLE_SERVICE_ACCOUNT_JSON: serviceJson(),
    ...extra,
  };
}

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function walkSources(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(join(ROOT, dir))) {
    if (entry === "node_modules" || entry === ".next") {
      continue;
    }
    const relative = `${dir}/${entry}`;
    const stat = statSync(join(ROOT, relative));
    if (stat.isDirectory()) {
      files.push(...walkSources(relative));
      continue;
    }
    if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
      files.push(relative);
    }
  }
  return files;
}

function options(port: Ga4DataPort, extra: Partial<Ga4ReadOptions> = {}): Ga4ReadOptions {
  return {
    env: baseEnv(),
    now: NOW,
    port,
    memory: createGa4ReadMemory(),
    clock: () => 1_000,
    ...extra,
  };
}

afterEach(() => {
  clearGa4DataCache();
});

describe("GA4 Data API okuyucusu", () => {
  it("kimlik boşsa veya bozuksa API çağrılmaz ve sayı uydurulmaz", async () => {
    const calls = { realtime: 0, report: 0 };
    const port: Ga4DataPort = {
      runRealtimeReport: async () => {
        calls.realtime += 1;
        return { rows: [{ metricValues: [{ value: "9" }] }] };
      },
      runReport: async () => {
        calls.report += 1;
        return { rows: [] };
      },
    };
    const memory = createGa4ReadMemory();
    const missing = await loadAdminGa4Board(ADMIN, "7d", {
      env: { GA4_PROPERTY_ID: "", GOOGLE_SERVICE_ACCOUNT_JSON: "" },
      port,
      memory,
      now: NOW,
    });
    const measurementId = await runRealtimeReport({
      env: baseEnv({ GA4_PROPERTY_ID: "G-ABC12345" }),
      port,
      memory,
      now: NOW,
    });
    const brokenJson = await runReport("today", {
      env: baseEnv({
        GOOGLE_SERVICE_ACCOUNT_JSON: "{",
        GOOGLE_SERVICE_ACCOUNT_JSON_BASE64: Buffer.from(serviceJson(), "utf8").toString("base64"),
      }),
      port,
      memory,
      now: NOW,
    });

    expect(missing).toEqual({ access: "unavailable" });
    expect(measurementId).toEqual({ access: "unavailable", reason: "config" });
    expect(brokenJson).toEqual({ access: "unavailable", reason: "config" });
    expect(calls).toEqual({ realtime: 0, report: 0 });
    expect(JSON.stringify(missing)).not.toContain("private_key");
    expect(JSON.stringify(measurementId)).not.toContain("not-a-real-key");
  });

  it("süper yönetici değilse rapor açılmaz", async () => {
    let called = 0;
    const port: Ga4DataPort = {
      runRealtimeReport: async () => {
        called += 1;
        return { rows: [] };
      },
      runReport: async () => {
        called += 1;
        return { rows: [] };
      },
    };
    const board = await loadAdminGa4Board(CITIZEN, "30d", options(port));
    const malformed = await loadAdminGa4Board(
      { id: "not-a-user", email: ADMIN.email, emailConfirmedAt: ADMIN.emailConfirmedAt },
      "today",
      options(port),
    );
    expect(board).toEqual({ access: "forbidden" });
    expect(malformed).toEqual({ access: "forbidden" });
    expect(called).toBe(0);
  });

  it("anlık kullanıcı ve İstanbul penceresindeki kanal/ülke oturumu okunur", async () => {
    const seen: { realtime: unknown[]; report: unknown[] } = { realtime: [], report: [] };
    const port: Ga4DataPort = {
      runRealtimeReport: async (request) => {
        seen.realtime.push(request);
        return { rows: [{ metricValues: [{ value: "0" }] }] };
      },
      runReport: async (request) => {
        seen.report.push(request);
        const dimension = request.dimensions?.[0]?.name;
        if (dimension === "sessionDefaultChannelGroup") {
          return {
            rows: [
              { dimensionValues: [{ value: "Organic Search" }], metricValues: [{ value: "4" }] },
              { dimensionValues: [{ value: "Direct" }], metricValues: [{ value: "2" }] },
            ],
          };
        }
        return {
          rows: [{ dimensionValues: [{ value: "Turkey" }], metricValues: [{ value: "6" }] }],
        };
      },
    };

    const board = await loadAdminGa4Board(ADMIN, "7d", options(port));
    expect(board.access).toBe("ok");
    if (board.access !== "ok") {
      return;
    }
    expect(board.realtime).toEqual({
      access: "ok",
      value: { activeUsers: 0, windowMinutes: 30 },
    });
    expect(board.fromYmd).toBe("2026-09-06");
    expect(board.toYmd).toBe("2026-09-12");
    expect(board.traffic).toEqual({
      access: "ok",
      value: {
        channels: [
          { label: "Organic Search", sessions: 4 },
          { label: "Direct", sessions: 2 },
        ],
        countries: [{ label: "Turkey", sessions: 6 }],
      },
    });

    expect(seen.realtime).toHaveLength(1);
    expect(seen.report).toHaveLength(2);
    const realtime = seen.realtime[0] as { metrics?: { name?: string }[]; dimensions?: unknown };
    expect(realtime.metrics).toEqual([{ name: "activeUsers" }]);
    expect(realtime.dimensions).toBeUndefined();
    expect(JSON.stringify(seen)).not.toContain("client_id");
    expect(JSON.stringify(seen)).not.toContain("user_id");
    const encoded = JSON.stringify(seen.report);
    expect(encoded).toContain("sessionDefaultChannelGroup");
    expect(encoded).toContain("country");
    expect(encoded).toContain("2026-09-06");
    expect(encoded).toContain("2026-09-12");
    expect(encoded).toContain(`"limit":${GA4_BREAKDOWN_LIMIT}`);
  });

  it("bozuk metrik sıfır sayılmaz; boş satır gerçek sıfırdır", async () => {
    const broken: Ga4DataPort = {
      runRealtimeReport: async () => ({ rows: [{ metricValues: [{ value: "12.5" }] }] }),
      runReport: async () => ({ rows: [] }),
    };
    const empty: Ga4DataPort = {
      runRealtimeReport: async () => ({ rows: [] }),
      runReport: async (request) => {
        if (request.dimensions?.[0]?.name === "country") {
          return { rows: [] };
        }
        return { rows: [] };
      },
    };
    const bad = await runRealtimeReport(options(broken));
    const none = await loadAdminGa4Board(ADMIN, "today", options(empty));
    expect(bad).toEqual({ access: "unavailable", reason: "upstream" });
    expect(JSON.stringify(bad)).not.toContain("12");
    expect(none.access).toBe("ok");
    if (none.access !== "ok") {
      return;
    }
    expect(none.realtime).toEqual({ access: "ok", value: { activeUsers: 0, windowMinutes: 30 } });
    expect(none.fromYmd).toBe("2026-09-12");
    expect(none.toYmd).toBe("2026-09-12");
    expect(none.traffic).toEqual({ access: "ok", value: { channels: [], countries: [] } });
  });

  it("başarılı okuma önbelleğe alınır; hata kısa süre tutulur", async () => {
    let clock = 5_000;
    let realtimeCalls = 0;
    let reportCalls = 0;
    const port: Ga4DataPort = {
      runRealtimeReport: async () => {
        realtimeCalls += 1;
        if (realtimeCalls === 1) {
          throw new Error("secret-token-should-not-leak");
        }
        return { rows: [{ metricValues: [{ value: "3" }] }] };
      },
      runReport: async () => {
        reportCalls += 1;
        return { rows: [{ dimensionValues: [{ value: "Direct" }], metricValues: [{ value: "1" }] }] };
      },
    };
    const memory = createGa4ReadMemory();
    const shared = options(port, { memory, clock: () => clock });
    const first = await runRealtimeReport(shared);
    const second = await runRealtimeReport(shared);
    expect(first).toEqual({ access: "unavailable", reason: "upstream" });
    expect(second).toEqual(first);
    expect(realtimeCalls).toBe(1);
    expect(JSON.stringify(first)).not.toContain("secret-token");

    clock += GA4_CACHE_FAILURE_MS + 1;
    const third = await runRealtimeReport(shared);
    expect(third).toEqual({ access: "ok", snapshot: { activeUsers: 3, windowMinutes: 30 } });
    expect(realtimeCalls).toBe(2);
    const fourth = await runRealtimeReport(shared);
    expect(fourth).toEqual(third);
    expect(realtimeCalls).toBe(2);

    clock += GA4_CACHE_SUCCESS_MS + 1;
    await runReport("30d", shared);
    await runReport("30d", shared);
    expect(reportCalls).toBe(2);
    clock += GA4_CACHE_SUCCESS_MS + 1;
    await runReport("30d", shared);
    expect(reportCalls).toBe(4);
  });

  it("aynı anda iki anlık okuma tek isteğe iner", async () => {
    let release: (rows: { metricValues: { value: string }[] }[]) => void = () => {};
    const gate = new Promise<{ rows: { metricValues: { value: string }[] }[] }>((resolve) => {
      release = (rows) => resolve({ rows });
    });
    let calls = 0;
    const port: Ga4DataPort = {
      runRealtimeReport: async () => {
        calls += 1;
        return gate;
      },
      runReport: async () => ({ rows: [] }),
    };
    const shared = options(port);
    const first = runRealtimeReport(shared);
    const second = runRealtimeReport(shared);
    release([{ metricValues: [{ value: "8" }] }]);
    const [left, right] = await Promise.all([first, second]);
    expect(calls).toBe(1);
    expect(left).toEqual({ access: "ok", snapshot: { activeUsers: 8, windowMinutes: 30 } });
    expect(right).toEqual(left);
  });

  it("Base64 JSON ve PEM kaçışlı anahtar kapıyı açar; dosya yolu okunmaz", async () => {
    let calls = 0;
    const port: Ga4DataPort = {
      runRealtimeReport: async () => {
        calls += 1;
        return { rows: [{ metricValues: [{ value: "1" }] }] };
      },
      runReport: async () => ({ rows: [] }),
    };
    const encoded = Buffer.from(serviceJson(), "utf8").toString("base64url");
    const fromBase64 = await runRealtimeReport(
      options(port, {
        env: {
          GA4_PROPERTY_ID: "properties/123456789",
          GOOGLE_SERVICE_ACCOUNT_JSON_BASE64: encoded,
        },
      }),
    );
    const escaped = ["-----BEGIN ", "PRIVATE KEY-----", "\\nnot-a-real-key\\n", "-----END ", "PRIVATE KEY-----"].join(
      "",
    );
    const fromPair = await runRealtimeReport(
      options(port, {
        env: {
          GA4_PROPERTY_ID: "123456789",
          GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL: "ga4-reader@example.iam.gserviceaccount.com",
          GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: escaped,
        },
        memory: createGa4ReadMemory(),
      }),
    );
    expect(fromBase64.access).toBe("ok");
    expect(fromPair.access).toBe("ok");
    expect(calls).toBe(2);
    expect(readSrc("lib/kernel/telemetry/ga4-data-client.ts")).not.toContain("readFileSync");
    expect(readSrc("lib/kernel/telemetry/ga4-data-client.ts")).not.toContain("GOOGLE_APPLICATION_CREDENTIALS");
  });

  it("anlık kart düşse de kaynak kartı durur; ikisi de düşünce sayı yoktur", async () => {
    const port: Ga4DataPort = {
      runRealtimeReport: async () => {
        throw new Error("quota");
      },
      runReport: async (request) => {
        if (request.dimensions?.[0]?.name === "country") {
          return { rows: [{ dimensionValues: [{ value: "Germany" }], metricValues: [{ value: "2" }] }] };
        }
        return { rows: [{ dimensionValues: [{ value: "Referral" }], metricValues: [{ value: "2" }] }] };
      },
    };
    const partial = await loadAdminGa4Board(ADMIN, "7d", options(port));
    expect(partial.access).toBe("ok");
    if (partial.access !== "ok") {
      return;
    }
    expect(partial.realtime.access).toBe("unavailable");
    expect(partial.traffic.access).toBe("ok");
    expect(JSON.stringify(partial.realtime)).not.toMatch(/[0-9]/);

    const down: Ga4DataPort = {
      runRealtimeReport: async () => {
        throw new Error("down");
      },
      runReport: async () => {
        throw new Error("down");
      },
    };
    const board = await loadAdminGa4Board(ADMIN, "7d", options(down));
    expect(board).toEqual({ access: "unavailable" });
    expect(JSON.stringify(board)).not.toContain("0");
  });

  it("yanıt gecikirse sayı uydurmadan kapanır", async () => {
    const port: Ga4DataPort = {
      runRealtimeReport: () => new Promise(() => {}),
      runReport: () => new Promise(() => {}),
    };
    const stalled = await runRealtimeReport(options(port, { timeoutMs: 25 }));
    expect(stalled).toEqual({ access: "unavailable", reason: "upstream" });
    expect(JSON.stringify(stalled)).not.toContain("ga4-timeout");
  });

  it("paket yalnız sunucu okuyucusundadır; pano huni ile defteri karıştırmaz", () => {
    const client = readSrc("lib/kernel/telemetry/ga4-data-client.ts");
    const page = readSrc("app/(kernel)/admin/page.tsx");
    const board = readSrc("components/kernel/admin-ga4-board.tsx");
    const csp = readSrc("lib/kernel/telemetry/csp.ts");
    expect(client.startsWith('import "server-only"')).toBe(true);
    expect(client).toContain("isSuperAdminActor");
    expect(client).toContain("runRealtimeReport");
    expect(client).toContain("fallback: true");
    expect(client).not.toContain("client_id");
    expect(client).not.toContain("user_id");
    expect(csp).not.toContain("analyticsdata.googleapis.com");

    const funnelAt = page.indexOf("<AdminFunnelBoard");
    const ga4At = page.indexOf("<AdminGa4Board");
    const catalogAt = page.indexOf("<AdminCatalogList");
    expect(funnelAt).toBeGreaterThan(-1);
    expect(ga4At).toBeGreaterThan(funnelAt);
    expect(catalogAt).toBeGreaterThan(ga4At);
    expect(page.match(/<AdminGa4Board/g)).toHaveLength(3);
    expect(page).toContain("loadAdminGa4Board");
    expect(page).toContain("<Suspense");
    expect(page).toContain("pending");
    const parallel = page.slice(page.indexOf("Promise.all"), page.indexOf("const entries"));
    expect(parallel).not.toContain("loadAdminGa4Board");
    expect(page).not.toContain("@google-analytics/data");
    expect(page).not.toContain("google-analytics");
    expect(board).not.toContain("@google-analytics/data");
    expect(board).not.toContain("ga4-data-client");
    expect(board).not.toContain('import "server-only"');
    expect(board).toContain("copy.unavailable");
    expect(ADMIN_SEN.ga4.unavailable).toBe("Ölçüm yapılamadı / Yapılandırma bekleniyor.");
    expect(ADMIN_SEN.ga4.pending).toBe("Ölçüm okunuyor.");
    expect(ADMIN_SEN.ga4.title).toBe("GA4 Canlı Trafik ve Kaynak Analizi");
    expect(readSrc("next.config.ts")).toContain('"@google-analytics/data"');
    expect(readSrc(".env.example")).toContain('GA4_PROPERTY_ID=""');
    expect(readSrc(".env.example")).toContain('GOOGLE_SERVICE_ACCOUNT_JSON=""');

    const offenders = ["lib", "app", "components"].flatMap(walkSources).filter((relative) => {
      if (relative === "lib/kernel/telemetry/ga4-data-client.ts") {
        return false;
      }
      return readSrc(relative).includes("@google-analytics/data");
    });
    expect(offenders).toEqual([]);

    expect(labelGa4Channel("Organic Search")).toBe("Organik arama");
    expect(labelGa4Channel("Newsletter")).toBe("Newsletter");
    expect(labelGa4Country("(not set)")).toBe("Belirsiz");
    expect(labelGa4Country("Turkey")).toBe("Turkey");
    expect(formatGa4Count(0)).toBe("0");
    expect(formatGa4Count(1200)).toBe("1.200");
  });
});
