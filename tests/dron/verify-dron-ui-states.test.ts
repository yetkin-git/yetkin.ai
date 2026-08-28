import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createV1HttpClient } from "../../apps/rail-is/src/api/client";
import { RailV1HttpError, RailV1ProtocolError } from "../../apps/rail-is/src/api/errors";
import {
  RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE,
  RAIL_V1_CLIENT_STALE,
  RAIL_V1_PARSE_FAIL,
  RAIL_V1_SESSION_REQUIRED,
  parseRailV1ClientJobBidsView,
  parseRailV1ContractsData,
  parseRailV1JobsData,
  parseRailV1WalletStripData,
  type ClientJobBidView,
  type FreelancerContractView,
  type RailV1Bid,
  type RailV1FailBody,
  type RailV1Job,
} from "../../apps/rail-is/src/contract/v1";
import { getOrCreateIntentIdempotencyKey } from "../../apps/rail-is/src/storage/idempotency";
import { createMemoryKvStore } from "../../apps/rail-is/src/storage/chunked-store";
import { classifyV1Failure } from "../../apps/rail-is/src/ui/classify";
import { RAIL_IS_COPY } from "../../apps/rail-is/src/ui/copy";
import {
  applyHomeFailures,
  dronAppReducer,
  initialDronAppState,
  isOwnerJob,
  visibleScreen,
} from "../../apps/rail-is/src/ui/dron-app-state";
import { assertBidAmountMinor, formatMinorLabel, parseMajorToAmountMinor } from "../../apps/rail-is/src/ui/money";
import { bidIntentId, emptyBidForm, presentBidError, presentBidSuccess } from "../../apps/rail-is/src/ui/present-bid";
import { presentBenchReady, benchLaneFor, canPostDelivery, canReleaseEscrow } from "../../apps/rail-is/src/ui/present-bench";
import { assertDeliveryNote, deliveryIntentId, emptyDeliveryForm } from "../../apps/rail-is/src/ui/present-delivery";
import { emptyReleaseForm, releaseIntentId } from "../../apps/rail-is/src/ui/present-release";
import { acceptIntentId, emptyAcceptForm, presentAcceptError } from "../../apps/rail-is/src/ui/present-accept";
import { presentOwnerBidsReady } from "../../apps/rail-is/src/ui/present-owner-bids";
import { presentJobListError, presentJobListReady } from "../../apps/rail-is/src/ui/present-job-list";
import { presentWalletStrip, webWalletUrl } from "../../apps/rail-is/src/ui/present-wallet";

const ROOT = process.cwd();
const REQUEST_ID = "550e8400-e29b-41d4-a716-446655440000";
const USER = { id: "11111111-1111-4111-8111-111111111111", email: "usta@yetkin.rail" };
const JOB: RailV1Job = {
  id: "fj_lab_1",
  clientId: "client_1",
  title: "İkon seti",
  brief: "16 SVG ikon, 24px ızgara, Quiet Luxury.",
  budgetMinor: 90_000,
  currencyCode: "TRY",
  status: "OPEN",
  createdAt: "2026-08-18T00:00:00.000Z",
  updatedAt: "2026-08-18T00:00:00.000Z",
};
const BID: RailV1Bid = {
  id: "fb_lab_1",
  jobId: JOB.id,
  bidderId: USER.id,
  amountMinor: 9_000,
  currencyCode: "TRY",
  coverNote: "teslim notu",
  status: "SUBMITTED",
  createdAt: "2026-08-18T00:00:00.000Z",
  updatedAt: "2026-08-18T00:00:00.000Z",
};
const CONTRACT: FreelancerContractView = {
  id: "fc_lab_1",
  jobId: JOB.id,
  bidId: BID.id,
  clientId: "client_1",
  freelancerId: USER.id,
  escrowHoldId: "eh_lab_1",
  status: "FUNDED",
  currencyCode: "TRY",
  grossMinor: 10_000,
  holdMinor: 1_000,
  netMinor: 9_000,
  holdBps: 1000,
  fundedAt: "2026-08-18T00:00:00.000Z",
  releasedAt: null,
  refundedAt: null,
  createdAt: "2026-08-18T00:00:00.000Z",
  updatedAt: "2026-08-18T00:00:00.000Z",
  deliveredAt: null,
};

function failEnvelope(error: string): RailV1FailBody {
  return {
    ok: false,
    error,
    requestId: REQUEST_ID,
    apiVersion: "1",
    data: null,
  };
}

function httpError(status: number, error: string): RailV1HttpError {
  return new RailV1HttpError(status, failEnvelope(error));
}

function walkTs(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".expo") {
        continue;
      }
      files.push(...walkTs(full));
    } else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
      files.push(full.replace(/\\/g, "/"));
    }
  }
  return files;
}

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function loggedIn(jobs = [JOB]) {
  let state = dronAppReducer(initialDronAppState, { type: "SESSION_OK", user: USER });
  state = dronAppReducer(state, { type: "HOME_LOADED", jobs, strip: { live: true, amountMinor: 0, currencyCode: "TRY" } });
  return state;
}

describe("UI tanığı — Native Dron mutlu yol zarf durumları", () => {
  it("ekran dosyaları durur; sahte liste/WebView/jobs/{id} GET/toFixed yoktur", () => {
    const screens = [
      "apps/rail-is/App.tsx",
      "apps/rail-is/src/screens/LoginScreen.tsx",
      "apps/rail-is/src/screens/JobListScreen.tsx",
      "apps/rail-is/src/screens/JobDetailScreen.tsx",
      "apps/rail-is/src/screens/OwnerBidsScreen.tsx",
      "apps/rail-is/src/screens/BenchScreen.tsx",
      "apps/rail-is/src/screens/WalletStripBanner.tsx",
      "apps/rail-is/src/screens/UpdateRequiredScreen.tsx",
      "apps/rail-is/src/ui/dron-app-state.ts",
      "apps/rail-is/src/runtime/use-dron-app.ts",
    ];
    for (const file of screens) {
      expect(existsSync(join(ROOT, file)), file).toBe(true);
    }

    const uiTree = walkTs(join(ROOT, "apps/rail-is/src")).concat(
      join(ROOT, "apps/rail-is/App.tsx").replace(/\\/g, "/"),
    );
    for (const file of uiTree) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/toFixed\s*\(/);
      expect(source, file).not.toContain("react-native-webview");
      expect(source, file).not.toContain("WebView");
      expect(source, file).not.toContain("fj_mock");
      expect(source, file).not.toContain("MOCK_JOBS");
      expect(source, file).not.toMatch(/jobs:\s*\[\s*\]/);
      expect(source, file).not.toMatch(/contracts:\s*\[\s*\]/);
      expect(source, file).not.toContain("/deliver");
      const allowReleasePath =
        file.includes("/api/hops.ts") ||
        file.includes("/api/client.ts") ||
        file.includes("/contract/v1.ts");
      if (!allowReleasePath) {
        expect(source, file).not.toMatch(/\/api\/v1\/freelancer\/contracts\/[^"'`]+\/release/);
      }
      expect(source, file).not.toMatch(/\/api\/v1\/freelancer\/jobs\/\$\{[^}]+\}(?!\/(?:bids|accept))/);
      expect(source, file).not.toMatch(/from\s+["'][^"']*lib\/kernel/);
      expect(source, file).not.toMatch(/from\s+["']@\/lib\//);
    }

    const runtime = readSrc("apps/rail-is/src/runtime/create-dron-runtime.ts");
    expect(runtime).toContain("refreshDronAccessToken");
    expect(runtime).toContain("readDronAccessToken");
    const hook = readSrc("apps/rail-is/src/runtime/use-dron-app.ts");
    expect(hook).toContain("getOrCreateIntentIdempotencyKey");
    expect(hook).toContain("Linking.openURL");
    expect(hook).toContain("signInWithPassword");
    expect(hook).toContain("getSession");
    expect(hook).toContain("listContracts");
    expect(hook).toContain("postDelivery");
    expect(hook).toContain("submitDelivery");
    expect(hook).toContain("postRelease");
    expect(hook).toContain("submitRelease");
    expect(hook).toContain("postAccept");
    expect(hook).toContain("submitAccept");
    expect(hook).toContain("listOwnerJobBids");
    expect(hook).toContain("getWalletStrip");
    expect(hook).toContain("RAIL_IS_BENCH_POLL_MS");
    expect(hook).toContain("AppState");
    expect(readSrc("apps/rail-is/App.tsx")).toContain("RefreshControl");
    expect(readSrc("apps/rail-is/App.tsx")).toContain("BenchScreen");
    const wallet = readSrc("apps/rail-is/src/ui/present-wallet.ts");
    expect(wallet).toContain("/cuzdan");
    expect(readSrc("apps/rail-is/src/ui/copy.ts")).toContain("Lütfen uygulamayı güncelleyiniz");
    expect(readSrc("apps/rail-is/src/ui/copy.ts")).toContain("Cüzdan henüz yüklenemedi");
    expect(readSrc("apps/rail-is/src/ui/copy.ts")).toContain("Liste henüz yüklenemedi.");
    expect(readSrc("apps/rail-is/src/ui/copy.ts")).toContain("Tezgâh henüz yüklenemedi.");
  });

  it("yükleniyor / başarı / dürüst boş / parse hata kartı ayrışır; hata jobs:[] değildir", () => {
    const loading = dronAppReducer(initialDronAppState, { type: "JOBS_LOADING" });
    expect(loading.jobsView).toMatchObject({ kind: "loading", testID: "dron-job-list-loading" });

    const ready = presentJobListReady([JOB]);
    expect(ready).toMatchObject({ kind: "ready", testID: "dron-job-list-ready" });
    if (ready.kind === "ready") {
      expect(ready.jobs[0]?.brief).toBe(JOB.brief);
    }

    const empty = presentJobListReady([]);
    expect(empty).toMatchObject({ kind: "empty", testID: "dron-job-list-empty" });
    expect(empty).not.toHaveProperty("jobs");

    const protocol = presentJobListError(new RailV1ProtocolError(RAIL_V1_PARSE_FAIL, 200));
    expect(protocol).toMatchObject({
      kind: "error",
      testID: "dron-job-list-error",
      title: RAIL_IS_COPY.jobs.errorTitle,
      message: RAIL_V1_PARSE_FAIL,
    });
    expect(protocol).not.toHaveProperty("jobs");
  });

  it("HTTP 401 girişe döner; 426 kilit ekranı 'Lütfen uygulamayı güncelleyiniz'", () => {
    const withUser = dronAppReducer(initialDronAppState, { type: "SESSION_OK", user: USER });
    const expired = dronAppReducer(withUser, {
      type: "JOBS_FAIL",
      error: httpError(401, RAIL_V1_SESSION_REQUIRED),
    });
    expect(expired.phase).toBe("login");
    expect(visibleScreen(expired)).toBe("login");
    expect(expired.user).toBeNull();
    expect(expired.jobsView.kind).toBe("idle");
    expect(expired.loginError).toBe(RAIL_V1_SESSION_REQUIRED);

    const stale = dronAppReducer(withUser, {
      type: "JOBS_FAIL",
      error: httpError(426, RAIL_V1_CLIENT_STALE),
    });
    expect(stale.phase).toBe("stale");
    expect(visibleScreen(stale)).toBe("stale");
    expect(stale.staleTitle).toBe("Lütfen uygulamayı güncelleyiniz");
    expect(stale.staleBody).toBe(RAIL_V1_CLIENT_STALE);
    expect(classifyV1Failure(httpError(426, RAIL_V1_CLIENT_STALE)).kind).toBe("stale");
  });

  it("400/403/409/500 teklifte zarf cümlesini basar; sahte başarı yok", () => {
    const form = emptyBidForm({ amountMajor: "90", coverNote: "teslim notu" });
    const cases: Array<[number, string]> = [
      [400, "Teklif alanları geçersiz."],
      [403, "Nitelikli ilana teklif için geçerli Kariyer Vizesi (akademi sertifikası) gerekir."],
      [409, "Idempotency-Key aynı anahtarla farklı gövde kullanılamaz."],
      [500, "Sunucu hatası."],
    ];
    for (const [status, message] of cases) {
      const view = presentBidError(form, httpError(status, message));
      expect(view.success).toBeNull();
      expect(view.fakeSuccess).toBe(false);
      expect(view.testID).toBe("dron-bid-error");
      expect(view.error).toContain(message);
      expect(view.conflict).toBe(status === 409);
    }

    const ok = presentBidSuccess(form, BID);
    expect(ok.testID).toBe("dron-bid-success");
    expect(ok.success?.bidId).toBe(BID.id);
    expect(ok.error).toBeNull();
    expect(ok.fakeSuccess).toBe(false);

    let state = loggedIn();
    state = dronAppReducer(state, { type: "SELECT_JOB", job: JOB });
    state = dronAppReducer(state, {
      type: "BID_FAIL",
      error: httpError(403, "Nitelikli ilana teklif için geçerli Kariyer Vizesi (akademi sertifikası) gerekir."),
    });
    expect(visibleScreen(state)).toBe("job");
    expect(state.bidView.success).toBeNull();
    expect(state.bidView.error).toContain("Kariyer Vizesi");
  });

  it("cüzdan live:false sıfır bakiye değildir; live:true + 0 canlı sıfırdır", () => {
    const unbound = presentWalletStrip({ live: false, amountMinor: 0, currencyCode: "TRY" });
    expect(unbound).toMatchObject({
      kind: "unbound",
      testID: "dron-wallet-unbound",
      title: "Cüzdan henüz yüklenemedi",
      live: false,
      amountLabel: null,
    });
    expect(JSON.stringify(unbound)).not.toContain("₺0,00");

    const liveZero = presentWalletStrip({ live: true, amountMinor: 0, currencyCode: "TRY" });
    expect(liveZero).toMatchObject({
      kind: "live",
      testID: "dron-wallet-live",
      live: true,
      amountMinor: 0,
      amountLabel: "₺0,00",
    });

    const live = presentWalletStrip({ live: true, amountMinor: 12_500, currencyCode: "TRY" });
    expect(live.kind === "live" && live.amountLabel).toBe("₺125,00");
    expect(webWalletUrl("http://192.168.1.5:3000/")).toBe("http://192.168.1.5:3000/cuzdan");
  });

  it("jobs data.jobs yoksa protokol hatasıdır; boş home uydurulmaz", async () => {
    expect(() => parseRailV1JobsData({ notJobs: true })).toThrow(RAIL_V1_PARSE_FAIL);
    expect(() => parseRailV1WalletStripData({ strip: { live: false } })).toThrow(RAIL_V1_PARSE_FAIL);
    expect(parseRailV1JobsData({ jobs: [] })).toEqual({ jobs: [] });

    const fetchImpl: typeof fetch = async () =>
      new Response(JSON.stringify({ ok: true, error: null, requestId: REQUEST_ID, apiVersion: "1", data: {} }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    const client = createV1HttpClient({
      baseUrl: "http://localhost:3000",
      getAccessToken: () => "token",
      fetch: fetchImpl,
    });
    await expect(client.listOpenJobs()).rejects.toBeInstanceOf(RailV1ProtocolError);
  });

  it("amountMinor tam sayıdır; niyet UUID'si yeniden çizimde değişmez", async () => {
    expect(parseMajorToAmountMinor("90")).toBe(9_000);
    expect(parseMajorToAmountMinor("90,50")).toBe(9_050);
    expect(() => parseMajorToAmountMinor("9.50.1")).toThrow();
    expect(() => assertBidAmountMinor(24_999)).toThrow(/250/);
    expect(assertBidAmountMinor(25_000)).toBe(25_000);
    expect(formatMinorLabel(2_000_000, "TRY")).toBe("₺20.000,00");
    expect(() => formatMinorLabel(10.5, "TRY")).toThrow(/tam sayı/);

    const store = createMemoryKvStore();
    const intent = bidIntentId(JOB.id);
    expect(intent).toBe("bid.fj_lab_1");
    const first = await getOrCreateIntentIdempotencyKey(store, intent);
    const second = await getOrCreateIntentIdempotencyKey(store, intent);
    expect(first).toBe(second);
  });

  it("home paralel hata: 426 kilit, 401 giriş, 500 dürüst kart", () => {
    const ready = loggedIn();
    const stale = applyHomeFailures(ready, httpError(500, "Liste düştü."), httpError(426, RAIL_V1_CLIENT_STALE));
    expect(stale.phase).toBe("stale");
    expect(visibleScreen(stale)).toBe("stale");

    const session = applyHomeFailures(ready, httpError(401, RAIL_V1_SESSION_REQUIRED), null);
    expect(session.phase).toBe("login");

    const local = applyHomeFailures(
      ready,
      new RailV1ProtocolError(RAIL_V1_PARSE_FAIL, 200),
      httpError(500, "Veritabanı erişilemez."),
      new RailV1ProtocolError(RAIL_V1_PARSE_FAIL, 200),
    );
    expect(local.phase).toBe("ready");
    expect(local.jobsView.kind).toBe("error");
    expect(local.jobsView).not.toHaveProperty("jobs");
    expect(local.walletView.kind).toBe("error");
    expect(local.walletView).toMatchObject({ amountLabel: null });
    expect(local.benchView.kind).toBe("error");
    expect(local.benchView).not.toHaveProperty("items");
  });

  it("detay listeden brief taşır; SELECT_JOB ayrı hop icat etmez", () => {
    let state = loggedIn();
    expect(visibleScreen(state)).toBe("jobs");
    state = dronAppReducer(state, { type: "SELECT_JOB", job: JOB });
    expect(visibleScreen(state)).toBe("job");
    expect(state.selectedJob?.brief).toBe(JOB.brief);
    expect(state.bidView.success).toBeNull();
    expect(readSrc("apps/rail-is/src/screens/JobDetailScreen.tsx")).toContain("job.brief");
    expect(readSrc("apps/rail-is/src/screens/JobDetailScreen.tsx")).not.toContain("/api/v1/");
    expect(readSrc("apps/rail-is/src/screens/JobDetailScreen.tsx")).not.toContain("listOpenJobs");
  });

  it("İşlerim şeritleri status+deliveredAt ile dürüst ayrılır; parse fail sahte liste basmaz", () => {
    expect(benchLaneFor(CONTRACT)).toBe("in_progress");
    expect(benchLaneFor({ ...CONTRACT, deliveredAt: "2026-08-18T12:00:00.000Z" })).toBe("delivered");
    expect(
      benchLaneFor({
        ...CONTRACT,
        status: "RELEASED",
        releasedAt: "2026-08-18T13:00:00.000Z",
        deliveredAt: "2026-08-18T12:00:00.000Z",
      }),
    ).toBe("released");
    expect(benchLaneFor({ ...CONTRACT, status: "REFUNDED", refundedAt: "2026-08-18T13:00:00.000Z" })).toBe(
      "refunded",
    );
    expect(benchLaneFor({ ...CONTRACT, status: "DISPUTED" })).toBe("disputed");

    const ready = presentBenchReady([CONTRACT], USER.id);
    expect(ready).toMatchObject({ kind: "ready", testID: "dron-bench-ready" });
    if (ready.kind === "ready") {
      expect(ready.lanes.in_progress).toHaveLength(1);
      expect(ready.lanes.delivered).toHaveLength(0);
      expect(ready.items[0]?.title).toBeNull();
      expect(ready.items[0]?.role).toBe("freelancer");
    }

    const empty = presentBenchReady([], USER.id);
    expect(empty).toMatchObject({ kind: "empty", testID: "dron-bench-empty" });
    expect(empty).not.toHaveProperty("items");

    expect(() => parseRailV1ContractsData({ notContracts: true })).toThrow(RAIL_V1_PARSE_FAIL);
    expect(() => parseRailV1ContractsData({ contracts: [{ ...CONTRACT, deliveredAt: undefined }] })).toThrow(
      RAIL_V1_PARSE_FAIL,
    );
    expect(parseRailV1ContractsData({ contracts: [CONTRACT] })).toEqual({ contracts: [CONTRACT] });

    let state = loggedIn();
    state = dronAppReducer(state, { type: "CONTRACTS_OK", contracts: [CONTRACT] });
    state = dronAppReducer(state, { type: "HOME_TAB", tab: "bench" });
    expect(visibleScreen(state)).toBe("bench");
    expect(state.benchView.kind).toBe("ready");

    const kept = dronAppReducer(state, {
      type: "CONTRACTS_FAIL",
      error: new RailV1ProtocolError(RAIL_V1_PARSE_FAIL, 200),
      keepSnapshot: true,
    });
    expect(kept.benchView.kind).toBe("ready");
    if (kept.benchView.kind === "ready") {
      expect(kept.benchView.items[0]?.contract.id).toBe(CONTRACT.id);
      expect(kept.benchView.refreshError).toBe(RAIL_V1_PARSE_FAIL);
    }

    const wiped = dronAppReducer(loggedIn(), {
      type: "CONTRACTS_FAIL",
      error: new RailV1ProtocolError(RAIL_V1_PARSE_FAIL, 200),
    });
    expect(wiped.benchView.kind).toBe("error");
    expect(wiped.benchView).not.toHaveProperty("items");
    expect(wiped.benchView).toMatchObject({
      testID: "dron-bench-error",
      title: RAIL_IS_COPY.bench.errorTitle,
    });

    const denied = dronAppReducer(state, {
      type: "CONTRACTS_FAIL",
      error: httpError(401, RAIL_V1_SESSION_REQUIRED),
    });
    expect(denied.phase).toBe("login");
    expect(denied.benchView.kind).toBe("idle");
  });

  it("İşi Teslim Et yalnız usta+devam şeridinde; 400/403/409/500 sahte yeşil basmaz", () => {
    const ready = presentBenchReady([CONTRACT], USER.id);
    expect(ready.kind).toBe("ready");
    if (ready.kind !== "ready") {
      throw new Error("tezgâh ready değil");
    }
    expect(canPostDelivery(ready.items[0]!)).toBe(true);
    expect(
      canPostDelivery({
        ...ready.items[0]!,
        role: "client",
      }),
    ).toBe(false);
    expect(
      canPostDelivery({
        ...ready.items[0]!,
        lane: "delivered",
        contract: { ...CONTRACT, deliveredAt: "2026-08-18T12:00:00.000Z" },
      }),
    ).toBe(false);

    expect(() => assertDeliveryNote("kısa")).toThrow(/8/);
    expect(assertDeliveryNote("teslim kaniti notu")).toBe("teslim kaniti notu");
    expect(deliveryIntentId(CONTRACT.id)).toBe("delivery.fc_lab_1");

    let state = loggedIn();
    state = dronAppReducer(state, { type: "CONTRACTS_OK", contracts: [CONTRACT] });
    state = dronAppReducer(state, { type: "HOME_TAB", tab: "bench" });
    state = dronAppReducer(state, { type: "DELIVERY_NOTE", contractId: CONTRACT.id, value: "teslim kaniti notu" });
    expect(state.deliveryById[CONTRACT.id]?.fakeSuccess).toBe(false);

    for (const status of [400, 403, 409, 500] as const) {
      const failed = dronAppReducer(state, {
        type: "DELIVERY_FAIL",
        contractId: CONTRACT.id,
        error: httpError(status, `teslim ${status}`),
      });
      const form = failed.deliveryById[CONTRACT.id];
      expect(form?.fakeSuccess).toBe(false);
      expect(form?.error).toBe(`teslim ${status}`);
      expect(form?.testID).toBe("dron-delivery-error");
      expect(failed.benchView.kind).toBe("ready");
      if (failed.benchView.kind === "ready") {
        expect(failed.benchView.lanes.in_progress).toHaveLength(1);
        expect(failed.benchView.lanes.delivered).toHaveLength(0);
      }
    }

    const pending = dronAppReducer(state, { type: "DELIVERY_STARTED", contractId: CONTRACT.id });
    expect(pending.deliveryById[CONTRACT.id]?.pending).toBe(true);
    expect(pending.deliveryById[CONTRACT.id]?.fakeSuccess).toBe(false);

    let after = dronAppReducer(pending, { type: "DELIVERY_OK", contractId: CONTRACT.id });
    expect(after.deliveryById[CONTRACT.id]).toBeUndefined();
    after = dronAppReducer(after, {
      type: "CONTRACTS_OK",
      contracts: [{ ...CONTRACT, deliveredAt: "2026-08-18T12:00:00.000Z" }],
    });
    expect(after.benchView.kind).toBe("ready");
    if (after.benchView.kind === "ready") {
      expect(after.benchView.lanes.in_progress).toHaveLength(0);
      expect(after.benchView.lanes.delivered).toHaveLength(1);
      expect(after.benchView.lanes.delivered[0]?.contract.deliveredAt).toBe("2026-08-18T12:00:00.000Z");
    }
    expect(emptyDeliveryForm(CONTRACT.id).fakeSuccess).toBe(false);
    expect(readSrc("apps/rail-is/src/screens/BenchScreen.tsx")).toContain("canPostDelivery");
    expect(readSrc("apps/rail-is/src/screens/BenchScreen.tsx")).toContain("HonestErrorCard");
    expect(readSrc("apps/rail-is/src/runtime/use-dron-app.ts")).toContain("listContracts");
    expect(readSrc("apps/rail-is/src/runtime/use-dron-app.ts")).not.toContain("lane: \"delivered\"");
  });

  it("Teslimatı Onayla ve Öde yalnız işveren+teslim şeridinde; 400/403/409/500 sahte yeşil basmaz", () => {
    const delivered = {
      ...CONTRACT,
      clientId: USER.id,
      freelancerId: "usta_1",
      deliveredAt: "2026-08-18T12:00:00.000Z",
    };
    const ready = presentBenchReady([delivered], USER.id);
    expect(ready.kind).toBe("ready");
    if (ready.kind !== "ready") {
      throw new Error("tezgâh ready değil");
    }
    expect(canReleaseEscrow(ready.items[0]!)).toBe(true);
    expect(
      canReleaseEscrow({
        ...ready.items[0]!,
        role: "freelancer",
      }),
    ).toBe(false);
    expect(
      canReleaseEscrow({
        ...ready.items[0]!,
        lane: "in_progress",
        contract: { ...delivered, deliveredAt: null },
      }),
    ).toBe(false);
    expect(
      canReleaseEscrow({
        ...ready.items[0]!,
        lane: "released",
        contract: {
          ...delivered,
          status: "RELEASED",
          releasedAt: "2026-08-18T13:00:00.000Z",
        },
      }),
    ).toBe(false);
    expect(releaseIntentId(CONTRACT.id)).toBe("release.fc_lab_1");
    expect(emptyReleaseForm(CONTRACT.id).fakeSuccess).toBe(false);

    let state = loggedIn();
    state = dronAppReducer(state, { type: "CONTRACTS_OK", contracts: [delivered] });
    state = dronAppReducer(state, { type: "HOME_TAB", tab: "bench" });
    expect(state.benchView.kind).toBe("ready");
    if (state.benchView.kind === "ready") {
      expect(state.benchView.lanes.delivered).toHaveLength(1);
      expect(state.benchView.lanes.released).toHaveLength(0);
    }

    for (const status of [400, 403, 409, 500] as const) {
      const failed = dronAppReducer(state, {
        type: "RELEASE_FAIL",
        contractId: delivered.id,
        error: httpError(status, `release ${status}`),
      });
      const form = failed.releaseById[delivered.id];
      expect(form?.fakeSuccess).toBe(false);
      expect(form?.error).toBe(`release ${status}`);
      expect(form?.testID).toBe("dron-release-error");
      expect(failed.benchView.kind).toBe("ready");
      if (failed.benchView.kind === "ready") {
        expect(failed.benchView.lanes.delivered).toHaveLength(1);
        expect(failed.benchView.lanes.released).toHaveLength(0);
      }
    }

    const pending = dronAppReducer(state, { type: "RELEASE_STARTED", contractId: delivered.id });
    expect(pending.releaseById[delivered.id]?.pending).toBe(true);
    expect(pending.releaseById[delivered.id]?.fakeSuccess).toBe(false);

    let after = dronAppReducer(pending, { type: "RELEASE_OK", contractId: delivered.id });
    expect(after.releaseById[delivered.id]).toBeUndefined();
    expect(after.benchView.kind).toBe("ready");
    if (after.benchView.kind === "ready") {
      expect(after.benchView.lanes.released).toHaveLength(0);
      expect(after.benchView.lanes.delivered).toHaveLength(1);
    }
    after = dronAppReducer(after, {
      type: "CONTRACTS_OK",
      contracts: [
        {
          ...delivered,
          status: "RELEASED",
          releasedAt: "2026-08-18T13:00:00.000Z",
        },
      ],
    });
    after = dronAppReducer(after, {
      type: "WALLET_OK",
      strip: { live: true, amountMinor: 90_000, currencyCode: "TRY" },
    });
    expect(after.benchView.kind).toBe("ready");
    if (after.benchView.kind === "ready") {
      expect(after.benchView.lanes.delivered).toHaveLength(0);
      expect(after.benchView.lanes.released).toHaveLength(1);
      expect(after.benchView.lanes.released[0]?.contract.status).toBe("RELEASED");
    }
    expect(after.walletView).toMatchObject({ kind: "live", testID: "dron-wallet-live" });
    expect(readSrc("apps/rail-is/src/screens/BenchScreen.tsx")).toContain("canReleaseEscrow");
    expect(readSrc("apps/rail-is/src/screens/BenchScreen.tsx")).toContain("RAIL_IS_COPY.release.errorTestID");
    expect(readSrc("apps/rail-is/src/ui/copy.ts")).toContain("dron-release-error");
    expect(readSrc("apps/rail-is/src/runtime/use-dron-app.ts")).toContain("getWalletStrip");
    expect(readSrc("apps/rail-is/src/runtime/use-dron-app.ts")).not.toContain("lane: \"released\"");
  });

  it("Teklifi kabul et yalnız işveren dalında; 503 pazaryeri sahte yeşil basmaz; 2xx Tezgâh'a geçer", () => {
    const ownerJob: RailV1Job = { ...JOB, clientId: USER.id };
    const ownerBid: ClientJobBidView = {
      bidId: BID.id,
      amountMinor: 9_000,
      coverNote: "Teslim 5 gün.",
      createdAt: "2026-08-18T00:00:00.000Z",
    };
    expect(isOwnerJob(ownerJob, USER.id)).toBe(true);
    expect(isOwnerJob(JOB, USER.id)).toBe(false);
    expect(acceptIntentId(ownerJob.id, ownerBid.bidId)).toBe("accept.fj_lab_1.fb_lab_1");
    expect(emptyAcceptForm().fakeSuccess).toBe(false);

    const empty = presentOwnerBidsReady([]);
    expect(empty).toMatchObject({ kind: "empty", testID: "dron-owner-bids-empty" });
    expect(empty).not.toHaveProperty("bids");

    const ready = presentOwnerBidsReady([ownerBid]);
    expect(ready).toMatchObject({ kind: "ready", testID: "dron-owner-bids-ready" });
    if (ready.kind === "ready") {
      expect(ready.bids[0]?.bidId).toBe(ownerBid.bidId);
      expect(ready.bids[0]).not.toHaveProperty("bidderId");
    }

    expect(() =>
      parseRailV1ClientJobBidsView({
        bids: [{ ...ownerBid, bidderId: "usta-1" }],
      }),
    ).toThrow(RAIL_V1_PARSE_FAIL);
    expect(parseRailV1ClientJobBidsView({ bids: [ownerBid] })).toEqual({ bids: [ownerBid] });

    let state = loggedIn([ownerJob]);
    state = dronAppReducer(state, { type: "SELECT_JOB", job: ownerJob });
    expect(visibleScreen(state)).toBe("job");
    state = dronAppReducer(state, { type: "OWNER_BIDS_OK", bids: [ownerBid] });
    expect(state.ownerBidsView.kind).toBe("ready");
    state = dronAppReducer(state, { type: "ACCEPT_CONFIRM_OPEN", bidId: ownerBid.bidId });
    expect(state.acceptView.confirmOpen).toBe(true);
    expect(state.acceptView.selectedBidId).toBe(ownerBid.bidId);

    const insufficient = presentAcceptError(
      emptyAcceptForm(),
      httpError(503, RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE),
    );
    expect(insufficient.fakeSuccess).toBe(false);
    expect(insufficient.paymentsUnconfigured).toBe(true);
    expect(insufficient.insufficientBalance).toBe(false);
    expect(insufficient.testID).toBe("dron-accept-payments-closed");
    expect(insufficient.error).toBe("Ödeme henüz bağlanmadı");

    const failed = dronAppReducer(state, {
      type: "ACCEPT_FAIL",
      error: httpError(503, RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE),
    });
    expect(failed.acceptView.fakeSuccess).toBe(false);
    expect(failed.acceptView.paymentsUnconfigured).toBe(true);
    expect(failed.acceptView.insufficientBalance).toBe(false);
    expect(failed.selectedJob?.id).toBe(ownerJob.id);
    expect(visibleScreen(failed)).toBe("job");

    const pending = dronAppReducer(state, { type: "ACCEPT_STARTED" });
    expect(pending.acceptView.pending).toBe(true);
    expect(pending.acceptView.fakeSuccess).toBe(false);
    let after = dronAppReducer(pending, { type: "ACCEPT_OK" });
    expect(visibleScreen(after)).toBe("bench");
    expect(after.homeTab).toBe("bench");
    expect(after.selectedJob).toBeNull();
    expect(after.acceptView.fakeSuccess).toBe(false);
    after = dronAppReducer(after, {
      type: "CONTRACTS_OK",
      contracts: [{ ...CONTRACT, clientId: USER.id, freelancerId: "usta_1" }],
    });
    after = dronAppReducer(after, {
      type: "WALLET_OK",
      strip: { live: true, amountMinor: 0, currencyCode: "TRY" },
    });
    expect(after.benchView.kind).toBe("ready");
    if (after.benchView.kind === "ready") {
      expect(after.benchView.items[0]?.role).toBe("client");
      expect(after.benchView.lanes.in_progress).toHaveLength(1);
    }
    expect(after.walletView).toMatchObject({ kind: "live", testID: "dron-wallet-live" });

    expect(readSrc("apps/rail-is/App.tsx")).toContain("OwnerBidsScreen");
    expect(readSrc("apps/rail-is/src/screens/OwnerBidsScreen.tsx")).toContain("RAIL_IS_COPY.accept.submit");
    expect(readSrc("apps/rail-is/src/ui/copy.ts")).toContain("Teklifi kabul et");
    expect(readSrc("apps/rail-is/src/screens/OwnerBidsScreen.tsx")).not.toContain("/api/v1/");
    expect(readSrc("apps/rail-is/src/screens/JobDetailScreen.tsx")).not.toContain("listOwnerJobBids");
    expect(readSrc("apps/rail-is/src/runtime/use-dron-app.ts")).toContain("listOwnerJobBids");
    expect(readSrc("apps/rail-is/src/runtime/use-dron-app.ts")).toContain("postAccept");
    expect(readSrc("apps/rail-is/src/runtime/use-dron-app.ts")).not.toContain("lane: \"in_progress\"");
  });
});
