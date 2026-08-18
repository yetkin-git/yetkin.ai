import type {
  ClientJobBidView,
  FreelancerContractView,
  RailV1Bid,
  RailV1Job,
  RailV1SessionUser,
  RailV1WalletStrip,
} from "../contract/v1";
import { classifyV1Failure, pickGlobalGate, type ClassifiedV1Failure } from "./classify";
import { RAIL_IS_COPY } from "./copy";
import {
  emptyAcceptForm,
  presentAcceptConfirmClose,
  presentAcceptConfirmOpen,
  presentAcceptError,
  presentAcceptPending,
  type AcceptFormView,
} from "./present-accept";
import {
  emptyBidForm,
  presentBidError,
  presentBidPending,
  presentBidSuccess,
  type BidFormView,
} from "./present-bid";
import {
  emptyDeliveryForm,
  presentDeliveryError,
  presentDeliveryPending,
  type DeliveryFormView,
} from "./present-delivery";
import {
  emptyReleaseForm,
  presentReleaseError,
  presentReleasePending,
  type ReleaseFormView,
} from "./present-release";
import {
  presentBenchError,
  presentBenchFromFailure,
  presentBenchLoading,
  presentBenchReady,
  withBenchRefreshError,
  type BenchView,
} from "./present-bench";
import {
  presentJobListError,
  presentJobListFromFailure,
  presentJobListLoading,
  presentJobListReady,
  type JobListView,
} from "./present-job-list";
import {
  presentOwnerBidsFromFailure,
  presentOwnerBidsLoading,
  presentOwnerBidsReady,
  type OwnerBidsView,
} from "./present-owner-bids";
import {
  presentWalletError,
  presentWalletFromFailure,
  presentWalletLoading,
  presentWalletStrip,
  type WalletStripView,
} from "./present-wallet";

export type DronPhase = "boot" | "login" | "ready" | "stale";
export type DronHomeTab = "jobs" | "bench";

export type DronAppState = {
  phase: DronPhase;
  user: RailV1SessionUser | null;
  bootMessage: string;
  loginEmail: string;
  loginPassword: string;
  loginPending: boolean;
  loginError: string | null;
  homeTab: DronHomeTab;
  jobsView: JobListView;
  walletView: WalletStripView;
  benchView: BenchView;
  selectedJob: RailV1Job | null;
  bidView: BidFormView;
  ownerBidsView: OwnerBidsView;
  acceptView: AcceptFormView;
  deliveryById: Record<string, DeliveryFormView>;
  releaseById: Record<string, ReleaseFormView>;
  staleTitle: string;
  staleBody: string;
};

export type DronAppEvent =
  | { type: "BOOT" }
  | { type: "CONFIG_LOGIN"; message: string }
  | { type: "NEED_LOGIN"; message?: string }
  | { type: "LOGIN_EMAIL"; value: string }
  | { type: "LOGIN_PASSWORD"; value: string }
  | { type: "LOGIN_STARTED" }
  | { type: "LOGIN_FAIL"; message: string }
  | { type: "SESSION_OK"; user: RailV1SessionUser }
  | { type: "SESSION_FAIL"; error: unknown }
  | { type: "HOME_TAB"; tab: DronHomeTab }
  | { type: "JOBS_LOADING" }
  | { type: "JOBS_OK"; jobs: RailV1Job[] }
  | { type: "JOBS_FAIL"; error: unknown }
  | { type: "WALLET_LOADING" }
  | { type: "WALLET_OK"; strip: RailV1WalletStrip }
  | { type: "WALLET_FAIL"; error: unknown }
  | { type: "CONTRACTS_LOADING" }
  | { type: "CONTRACTS_OK"; contracts: FreelancerContractView[] }
  | { type: "CONTRACTS_FAIL"; error: unknown; keepSnapshot?: boolean }
  | { type: "HOME_LOADED"; jobs: RailV1Job[]; strip: RailV1WalletStrip }
  | { type: "SELECT_JOB"; job: RailV1Job }
  | { type: "BACK_TO_JOBS" }
  | { type: "BID_AMOUNT"; value: string }
  | { type: "BID_NOTE"; value: string }
  | { type: "BID_STARTED" }
  | { type: "BID_OK"; bid: RailV1Bid }
  | { type: "BID_FAIL"; error: unknown }
  | { type: "BID_LOCAL_FAIL"; message: string }
  | { type: "BID_RESET_FORM" }
  | { type: "OWNER_BIDS_LOADING" }
  | { type: "OWNER_BIDS_OK"; bids: ClientJobBidView[] }
  | { type: "OWNER_BIDS_FAIL"; error: unknown }
  | { type: "ACCEPT_CONFIRM_OPEN"; bidId: string }
  | { type: "ACCEPT_CONFIRM_CLOSE" }
  | { type: "ACCEPT_STARTED" }
  | { type: "ACCEPT_OK" }
  | { type: "ACCEPT_FAIL"; error: unknown }
  | { type: "ACCEPT_LOCAL_FAIL"; message: string }
  | { type: "DELIVERY_NOTE"; contractId: string; value: string }
  | { type: "DELIVERY_STARTED"; contractId: string }
  | { type: "DELIVERY_OK"; contractId: string }
  | { type: "DELIVERY_FAIL"; contractId: string; error: unknown }
  | { type: "DELIVERY_LOCAL_FAIL"; contractId: string; message: string }
  | { type: "RELEASE_STARTED"; contractId: string }
  | { type: "RELEASE_OK"; contractId: string }
  | { type: "RELEASE_FAIL"; contractId: string; error: unknown }
  | { type: "SIGN_OUT" };

const IDLE_BENCH: BenchView = { kind: "idle", testID: "dron-bench-idle" };
const IDLE_OWNER_BIDS: OwnerBidsView = { kind: "idle", testID: "dron-owner-bids-idle" };

export function isOwnerJob(job: RailV1Job, userId: string | null | undefined): boolean {
  return Boolean(userId) && job.clientId === userId;
}

export const initialDronAppState: DronAppState = {
  phase: "boot",
  user: null,
  bootMessage: RAIL_IS_COPY.boot,
  loginEmail: "",
  loginPassword: "",
  loginPending: false,
  loginError: null,
  homeTab: "jobs",
  jobsView: { kind: "idle", testID: "dron-job-list-idle" },
  walletView: { kind: "idle", testID: "dron-wallet-idle" },
  benchView: IDLE_BENCH,
  selectedJob: null,
  bidView: emptyBidForm(),
  ownerBidsView: IDLE_OWNER_BIDS,
  acceptView: emptyAcceptForm(),
  deliveryById: {},
  releaseById: {},
  staleTitle: RAIL_IS_COPY.stale.title,
  staleBody: RAIL_IS_COPY.stale.body,
};

function loginSurface(state: DronAppState, message: string | null): DronAppState {
  return {
    ...state,
    phase: "login",
    user: null,
    loginPending: false,
    loginError: message,
    loginPassword: "",
    selectedJob: null,
    homeTab: "jobs",
    jobsView: { kind: "idle", testID: "dron-job-list-idle" },
    walletView: { kind: "idle", testID: "dron-wallet-idle" },
    benchView: IDLE_BENCH,
    bidView: emptyBidForm(),
    ownerBidsView: IDLE_OWNER_BIDS,
    acceptView: emptyAcceptForm(),
    deliveryById: {},
    releaseById: {},
  };
}

function staleSurface(state: DronAppState, failure?: ClassifiedV1Failure): DronAppState {
  return {
    ...state,
    phase: "stale",
    selectedJob: null,
    staleTitle: RAIL_IS_COPY.stale.title,
    staleBody: failure?.envelopeError || RAIL_IS_COPY.stale.body,
    loginPending: false,
  };
}

function applyGlobalOr(state: DronAppState, error: unknown, local: (next: DronAppState) => DronAppState): DronAppState {
  const failure = classifyV1Failure(error);
  if (failure.kind === "stale") {
    return staleSurface(state, failure);
  }
  if (failure.kind === "session") {
    return loginSurface(state, failure.message);
  }
  return local(state);
}

function contractsFailView(state: DronAppState, error: unknown, keepSnapshot: boolean): BenchView {
  const failure = classifyV1Failure(error);
  if (keepSnapshot && (state.benchView.kind === "ready" || state.benchView.kind === "empty")) {
    return withBenchRefreshError(state.benchView, failure.message);
  }
  return presentBenchFromFailure(failure);
}

export function applyHomeFailures(
  state: DronAppState,
  jobsError: unknown | null,
  walletError: unknown | null,
  contractsError: unknown | null = null,
): DronAppState {
  const failures: ClassifiedV1Failure[] = [];
  if (jobsError) {
    failures.push(classifyV1Failure(jobsError));
  }
  if (walletError) {
    failures.push(classifyV1Failure(walletError));
  }
  if (contractsError) {
    failures.push(classifyV1Failure(contractsError));
  }
  const gate = pickGlobalGate(failures);
  if (gate === "stale") {
    const stale = failures.find((item) => item.kind === "stale");
    return staleSurface(state, stale);
  }
  if (gate === "session") {
    const session = failures.find((item) => item.kind === "session");
    return loginSurface(state, session?.message ?? null);
  }
  let next = { ...state, phase: "ready" as const, loginPending: false, loginError: null };
  if (jobsError) {
    next = { ...next, jobsView: presentJobListError(jobsError) };
  }
  if (walletError) {
    next = { ...next, walletView: presentWalletError(walletError) };
  }
  if (contractsError) {
    next = { ...next, benchView: presentBenchError(contractsError) };
  }
  return next;
}

export function dronAppReducer(state: DronAppState, event: DronAppEvent): DronAppState {
  switch (event.type) {
    case "BOOT":
      return { ...initialDronAppState, loginEmail: state.loginEmail };
    case "CONFIG_LOGIN":
      return loginSurface(state, event.message);
    case "NEED_LOGIN":
      return loginSurface(state, event.message ?? null);
    case "LOGIN_EMAIL":
      return { ...state, loginEmail: event.value };
    case "LOGIN_PASSWORD":
      return { ...state, loginPassword: event.value };
    case "LOGIN_STARTED":
      return { ...state, phase: "login", loginPending: true, loginError: null };
    case "LOGIN_FAIL":
      return { ...state, phase: "login", loginPending: false, loginError: event.message };
    case "SESSION_OK":
      return {
        ...state,
        phase: "ready",
        user: event.user,
        loginPending: false,
        loginError: null,
        loginPassword: "",
      };
    case "SESSION_FAIL":
      return applyGlobalOr(state, event.error, (next) =>
        loginSurface(next, classifyV1Failure(event.error).message),
      );
    case "HOME_TAB":
      return {
        ...state,
        homeTab: event.tab,
        selectedJob: null,
        ownerBidsView: IDLE_OWNER_BIDS,
        acceptView: emptyAcceptForm(),
      };
    case "JOBS_LOADING":
      return { ...state, jobsView: presentJobListLoading() };
    case "JOBS_OK":
      return { ...state, phase: "ready", jobsView: presentJobListReady(event.jobs) };
    case "JOBS_FAIL":
      return applyGlobalOr(state, event.error, (next) => ({
        ...next,
        phase: "ready",
        jobsView: presentJobListFromFailure(classifyV1Failure(event.error)),
      }));
    case "WALLET_LOADING":
      return { ...state, walletView: presentWalletLoading() };
    case "WALLET_OK":
      return { ...state, walletView: presentWalletStrip(event.strip) };
    case "WALLET_FAIL":
      return applyGlobalOr(state, event.error, (next) => ({
        ...next,
        walletView: presentWalletFromFailure(classifyV1Failure(event.error)),
      }));
    case "CONTRACTS_LOADING":
      return { ...state, benchView: presentBenchLoading() };
    case "CONTRACTS_OK": {
      const userId = state.user?.id;
      if (!userId) {
        return { ...state, benchView: presentBenchError(new Error(RAIL_IS_COPY.login.sessionFail)) };
      }
      return { ...state, phase: "ready", benchView: presentBenchReady(event.contracts, userId) };
    }
    case "CONTRACTS_FAIL":
      return applyGlobalOr(state, event.error, (next) => ({
        ...next,
        phase: "ready",
        benchView: contractsFailView(next, event.error, Boolean(event.keepSnapshot)),
      }));
    case "HOME_LOADED":
      return {
        ...state,
        phase: "ready",
        jobsView: presentJobListReady(event.jobs),
        walletView: presentWalletStrip(event.strip),
      };
    case "SELECT_JOB":
      return {
        ...state,
        selectedJob: event.job,
        bidView: emptyBidForm(),
        ownerBidsView: IDLE_OWNER_BIDS,
        acceptView: emptyAcceptForm(),
      };
    case "BACK_TO_JOBS":
      return {
        ...state,
        selectedJob: null,
        bidView: emptyBidForm(),
        ownerBidsView: IDLE_OWNER_BIDS,
        acceptView: emptyAcceptForm(),
      };
    case "BID_AMOUNT":
      return { ...state, bidView: { ...state.bidView, amountMajor: event.value, success: null } };
    case "BID_NOTE":
      return { ...state, bidView: { ...state.bidView, coverNote: event.value, success: null } };
    case "BID_STARTED":
      return { ...state, bidView: presentBidPending(state.bidView) };
    case "BID_OK":
      return { ...state, bidView: presentBidSuccess(state.bidView, event.bid) };
    case "BID_FAIL":
      return applyGlobalOr(state, event.error, (next) => ({
        ...next,
        bidView: presentBidError(next.bidView, event.error),
      }));
    case "BID_LOCAL_FAIL":
      return {
        ...state,
        bidView: {
          ...state.bidView,
          testID: "dron-bid-error",
          pending: false,
          success: null,
          fakeSuccess: false,
          conflict: false,
          error: event.message,
        },
      };
    case "BID_RESET_FORM":
      return { ...state, bidView: emptyBidForm({ amountMajor: state.bidView.amountMajor }) };
    case "OWNER_BIDS_LOADING":
      return { ...state, ownerBidsView: presentOwnerBidsLoading() };
    case "OWNER_BIDS_OK":
      return { ...state, ownerBidsView: presentOwnerBidsReady(event.bids) };
    case "OWNER_BIDS_FAIL":
      return applyGlobalOr(state, event.error, (next) => ({
        ...next,
        ownerBidsView: presentOwnerBidsFromFailure(classifyV1Failure(event.error)),
      }));
    case "ACCEPT_CONFIRM_OPEN":
      return { ...state, acceptView: presentAcceptConfirmOpen(state.acceptView, event.bidId) };
    case "ACCEPT_CONFIRM_CLOSE":
      return { ...state, acceptView: presentAcceptConfirmClose(state.acceptView) };
    case "ACCEPT_STARTED":
      return { ...state, acceptView: presentAcceptPending(state.acceptView) };
    case "ACCEPT_OK":
      return {
        ...state,
        selectedJob: null,
        homeTab: "bench",
        ownerBidsView: IDLE_OWNER_BIDS,
        acceptView: emptyAcceptForm(),
      };
    case "ACCEPT_FAIL":
      return applyGlobalOr(state, event.error, (next) => ({
        ...next,
        acceptView: presentAcceptError(next.acceptView, event.error),
      }));
    case "ACCEPT_LOCAL_FAIL":
      return {
        ...state,
        acceptView: {
          ...state.acceptView,
          testID: RAIL_IS_COPY.accept.errorTestID,
          pending: false,
          confirmOpen: false,
          fakeSuccess: false,
          insufficientBalance: false,
          error: event.message,
          requestId: null,
        },
      };
    case "DELIVERY_NOTE": {
      const current = state.deliveryById[event.contractId] ?? emptyDeliveryForm(event.contractId);
      return {
        ...state,
        deliveryById: {
          ...state.deliveryById,
          [event.contractId]: {
            ...current,
            note: event.value,
            error: null,
            fakeSuccess: false,
          },
        },
      };
    }
    case "DELIVERY_STARTED": {
      const current = state.deliveryById[event.contractId] ?? emptyDeliveryForm(event.contractId);
      return {
        ...state,
        deliveryById: {
          ...state.deliveryById,
          [event.contractId]: presentDeliveryPending(current),
        },
      };
    }
    case "DELIVERY_OK": {
      const next = { ...state.deliveryById };
      delete next[event.contractId];
      return { ...state, deliveryById: next };
    }
    case "DELIVERY_FAIL": {
      const failure = classifyV1Failure(event.error);
      if (failure.kind === "stale") {
        return staleSurface(state, failure);
      }
      if (failure.kind === "session") {
        return loginSurface(state, failure.message);
      }
      const current = state.deliveryById[event.contractId] ?? emptyDeliveryForm(event.contractId);
      return {
        ...state,
        deliveryById: {
          ...state.deliveryById,
          [event.contractId]: presentDeliveryError(current, event.error),
        },
      };
    }
    case "DELIVERY_LOCAL_FAIL": {
      const current = state.deliveryById[event.contractId] ?? emptyDeliveryForm(event.contractId);
      return {
        ...state,
        deliveryById: {
          ...state.deliveryById,
          [event.contractId]: {
            ...current,
            testID: RAIL_IS_COPY.delivery.errorTestID,
            pending: false,
            fakeSuccess: false,
            error: event.message,
            requestId: null,
          },
        },
      };
    }
    case "RELEASE_STARTED": {
      const current = state.releaseById[event.contractId] ?? emptyReleaseForm(event.contractId);
      return {
        ...state,
        releaseById: {
          ...state.releaseById,
          [event.contractId]: presentReleasePending(current),
        },
      };
    }
    case "RELEASE_OK": {
      const next = { ...state.releaseById };
      delete next[event.contractId];
      return { ...state, releaseById: next };
    }
    case "RELEASE_FAIL": {
      const failure = classifyV1Failure(event.error);
      if (failure.kind === "stale") {
        return staleSurface(state, failure);
      }
      if (failure.kind === "session") {
        return loginSurface(state, failure.message);
      }
      const current = state.releaseById[event.contractId] ?? emptyReleaseForm(event.contractId);
      return {
        ...state,
        releaseById: {
          ...state.releaseById,
          [event.contractId]: presentReleaseError(current, event.error),
        },
      };
    }
    case "SIGN_OUT":
      return loginSurface(initialDronAppState, null);
  }
}

export function visibleScreen(
  state: DronAppState,
): "boot" | "login" | "stale" | "jobs" | "job" | "bench" {
  if (state.phase === "boot") {
    return "boot";
  }
  if (state.phase === "stale") {
    return "stale";
  }
  if (state.phase === "login" || !state.user) {
    return "login";
  }
  if (state.selectedJob) {
    return "job";
  }
  if (state.homeTab === "bench") {
    return "bench";
  }
  return "jobs";
}
