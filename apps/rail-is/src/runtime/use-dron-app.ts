import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { AppState, Linking, type AppStateStatus } from "react-native";
import { RAIL_IS_BENCH_POLL_MS } from "../api/hops";
import type { RailV1Job } from "../contract/v1";
import { getOrCreateIntentIdempotencyKey, rotateIntentIdempotencyKey } from "../storage/idempotency";
import { classifyV1Failure } from "../ui/classify";
import { RAIL_IS_COPY } from "../ui/copy";
import { dronAppReducer, initialDronAppState, isOwnerJob, visibleScreen } from "../ui/dron-app-state";
import { assertBidAmountMinor, assertCoverNote, parseMajorToAmountMinor } from "../ui/money";
import { acceptIntentId } from "../ui/present-accept";
import { bidIntentId } from "../ui/present-bid";
import { assertDeliveryNote, deliveryIntentId } from "../ui/present-delivery";
import { releaseIntentId } from "../ui/present-release";
import { createDronRuntime, type DronRuntime } from "./create-dron-runtime";

function loginFailMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    const message = error.message.trim();
    if (message) {
      return message;
    }
  }
  return RAIL_IS_COPY.login.fail;
}

export function useDronApp() {
  const runtimeRef = useRef<DronRuntime | null>(null);
  if (runtimeRef.current === null) {
    runtimeRef.current = createDronRuntime();
  }
  const runtime = runtimeRef.current;
  const [state, dispatch] = useReducer(dronAppReducer, initialDronAppState);
  const [refreshing, setRefreshing] = useState(false);
  const generation = useRef(0);
  const phaseRef = useRef(state.phase);
  phaseRef.current = state.phase;

  const loadHome = useCallback(async (options?: { silent?: boolean }) => {
    const api = runtime.api;
    if (!api) {
      dispatch({ type: "CONFIG_LOGIN", message: RAIL_IS_COPY.login.apiMissing });
      return;
    }
    const silent = Boolean(options?.silent);
    const token = generation.current;
    if (!silent) {
      dispatch({ type: "JOBS_LOADING" });
      dispatch({ type: "WALLET_LOADING" });
      dispatch({ type: "CONTRACTS_LOADING" });
    }
    const settled = await Promise.allSettled([
      api.listOpenJobs(),
      api.getWalletStrip(),
      api.listContracts(),
    ]);
    if (token !== generation.current) {
      return;
    }
    const jobsOutcome = settled[0];
    const walletOutcome = settled[1];
    const contractsOutcome = settled[2];
    const jobsError = jobsOutcome.status === "rejected" ? jobsOutcome.reason : null;
    const walletError = walletOutcome.status === "rejected" ? walletOutcome.reason : null;
    const contractsError = contractsOutcome.status === "rejected" ? contractsOutcome.reason : null;
    if (jobsError || walletError || contractsError) {
      const jobsFail = jobsError ? classifyV1Failure(jobsError) : null;
      const walletFail = walletError ? classifyV1Failure(walletError) : null;
      const contractsFail = contractsError ? classifyV1Failure(contractsError) : null;
      if (jobsFail?.kind === "stale" || walletFail?.kind === "stale" || contractsFail?.kind === "stale") {
        dispatch({
          type: "JOBS_FAIL",
          error:
            jobsFail?.kind === "stale"
              ? jobsError
              : walletFail?.kind === "stale"
                ? walletError
                : contractsError,
        });
        return;
      }
      if (jobsFail?.kind === "session" || walletFail?.kind === "session" || contractsFail?.kind === "session") {
        await runtime.auth?.auth.signOut();
        const sessionFail =
          jobsFail?.kind === "session" ? jobsFail : walletFail?.kind === "session" ? walletFail : contractsFail;
        dispatch({
          type: "NEED_LOGIN",
          message: sessionFail?.message,
        });
        return;
      }
    }
    if (jobsOutcome.status === "fulfilled") {
      dispatch({ type: "JOBS_OK", jobs: jobsOutcome.value.data.jobs });
    } else if (jobsError) {
      dispatch({ type: "JOBS_FAIL", error: jobsError });
    }
    if (walletOutcome.status === "fulfilled") {
      dispatch({ type: "WALLET_OK", strip: walletOutcome.value.data.strip });
    } else if (walletError && classifyV1Failure(walletError).kind !== "session") {
      dispatch({ type: "WALLET_FAIL", error: walletError });
    }
    if (contractsOutcome.status === "fulfilled") {
      dispatch({ type: "CONTRACTS_OK", contracts: contractsOutcome.value.data.contracts });
    } else if (contractsError && classifyV1Failure(contractsError).kind !== "session") {
      dispatch({ type: "CONTRACTS_FAIL", error: contractsError, keepSnapshot: silent });
    }
  }, [runtime]);

  const refreshBench = useCallback(async () => {
    const api = runtime.api;
    if (!api || phaseRef.current !== "ready") {
      return;
    }
    const token = generation.current;
    try {
      const result = await api.listContracts();
      if (token !== generation.current) {
        return;
      }
      dispatch({ type: "CONTRACTS_OK", contracts: result.data.contracts });
    } catch (error) {
      if (token !== generation.current) {
        return;
      }
      const failure = classifyV1Failure(error);
      if (failure.kind === "stale") {
        dispatch({ type: "CONTRACTS_FAIL", error });
        return;
      }
      if (failure.kind === "session") {
        await runtime.auth?.auth.signOut();
        dispatch({ type: "NEED_LOGIN", message: failure.message });
        return;
      }
      dispatch({ type: "CONTRACTS_FAIL", error, keepSnapshot: true });
    }
  }, [runtime]);

  const refreshWallet = useCallback(async () => {
    const api = runtime.api;
    if (!api || phaseRef.current !== "ready") {
      return;
    }
    const token = generation.current;
    try {
      const result = await api.getWalletStrip();
      if (token !== generation.current) {
        return;
      }
      dispatch({ type: "WALLET_OK", strip: result.data.strip });
    } catch (error) {
      if (token !== generation.current) {
        return;
      }
      const failure = classifyV1Failure(error);
      if (failure.kind === "stale") {
        dispatch({ type: "WALLET_FAIL", error });
        return;
      }
      if (failure.kind === "session") {
        await runtime.auth?.auth.signOut();
        dispatch({ type: "NEED_LOGIN", message: failure.message });
        return;
      }
      dispatch({ type: "WALLET_FAIL", error });
    }
  }, [runtime]);

  const loadOwnerBids = useCallback(
    async (jobId: string, options?: { silent?: boolean }) => {
      const api = runtime.api;
      if (!api) {
        return;
      }
      const token = generation.current;
      if (!options?.silent) {
        dispatch({ type: "OWNER_BIDS_LOADING" });
      }
      try {
        const result = await api.listOwnerJobBids(jobId);
        if (token !== generation.current) {
          return;
        }
        dispatch({ type: "OWNER_BIDS_OK", bids: result.data.bids });
      } catch (error) {
        if (token !== generation.current) {
          return;
        }
        const failure = classifyV1Failure(error);
        if (failure.kind === "stale") {
          dispatch({ type: "OWNER_BIDS_FAIL", error });
          return;
        }
        if (failure.kind === "session") {
          await runtime.auth?.auth.signOut();
          dispatch({ type: "NEED_LOGIN", message: failure.message });
          return;
        }
        dispatch({ type: "OWNER_BIDS_FAIL", error });
      }
    },
    [runtime],
  );

  const boot = useCallback(async () => {
    generation.current += 1;
    const token = generation.current;
    dispatch({ type: "BOOT" });
    if (runtime.configError) {
      dispatch({ type: "CONFIG_LOGIN", message: runtime.configError });
      return;
    }
    const api = runtime.api;
    const auth = runtime.auth;
    if (!api || !auth) {
      dispatch({ type: "CONFIG_LOGIN", message: runtime.configError ?? RAIL_IS_COPY.login.unbound });
      return;
    }
    try {
      const access = await readAccess(auth);
      if (token !== generation.current) {
        return;
      }
      if (!access) {
        dispatch({ type: "NEED_LOGIN" });
        return;
      }
      const session = await api.getSession();
      if (token !== generation.current) {
        return;
      }
      dispatch({ type: "SESSION_OK", user: session.data.user });
      await loadHome();
    } catch (error) {
      if (token !== generation.current) {
        return;
      }
      const failure = classifyV1Failure(error);
      if (failure.kind === "session") {
        await auth.auth.signOut();
        dispatch({ type: "NEED_LOGIN", message: failure.message });
        return;
      }
      dispatch({ type: "SESSION_FAIL", error });
    }
  }, [loadHome, runtime]);

  useEffect(() => {
    void boot();
  }, [boot]);

  const selectedJobRef = useRef(state.selectedJob);
  selectedJobRef.current = state.selectedJob;
  const userRef = useRef(state.user);
  userRef.current = state.user;

  useEffect(() => {
    if (state.phase !== "ready" || !state.user) {
      return;
    }
    const onActive = () => {
      if (AppState.currentState === "active") {
        void refreshBench();
        void refreshWallet();
        const job = selectedJobRef.current;
        const user = userRef.current;
        if (job && user && isOwnerJob(job, user.id)) {
          void loadOwnerBids(job.id, { silent: true });
        }
      }
    };
    const interval = setInterval(() => {
      if (AppState.currentState === "active" && phaseRef.current === "ready") {
        void refreshBench();
      }
    }, RAIL_IS_BENCH_POLL_MS);
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (next === "active") {
        onActive();
      }
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [loadOwnerBids, refreshBench, refreshWallet, state.phase, state.user]);

  const signIn = useCallback(async () => {
    const auth = runtime.auth;
    const api = runtime.api;
    if (!auth || !api) {
      dispatch({
        type: "LOGIN_FAIL",
        message: runtime.configError ?? RAIL_IS_COPY.login.unbound,
      });
      return;
    }
    dispatch({ type: "LOGIN_STARTED" });
    const { error } = await auth.auth.signInWithPassword({
      email: state.loginEmail.trim(),
      password: state.loginPassword,
    });
    if (error) {
      dispatch({ type: "LOGIN_FAIL", message: loginFailMessage(error) });
      return;
    }
    try {
      const session = await api.getSession();
      dispatch({ type: "SESSION_OK", user: session.data.user });
      await loadHome();
    } catch (sessionError) {
      await auth.auth.signOut();
      const failure = classifyV1Failure(sessionError);
      if (failure.kind === "stale") {
        dispatch({ type: "SESSION_FAIL", error: sessionError });
        return;
      }
      dispatch({ type: "LOGIN_FAIL", message: RAIL_IS_COPY.login.sessionFail });
    }
  }, [loadHome, runtime, state.loginEmail, state.loginPassword]);

  const signOut = useCallback(async () => {
    generation.current += 1;
    await runtime.auth?.auth.signOut();
    dispatch({ type: "SIGN_OUT" });
  }, [runtime]);

  const submitBid = useCallback(async () => {
    const job = state.selectedJob;
    const api = runtime.api;
    if (!job || !api) {
      return;
    }
    let amountMinor: number;
    let coverNote: string;
    try {
      amountMinor = assertBidAmountMinor(parseMajorToAmountMinor(state.bidView.amountMajor), job.budgetMinor);
      coverNote = assertCoverNote(state.bidView.coverNote);
    } catch (error) {
      dispatch({
        type: "BID_LOCAL_FAIL",
        message: error instanceof Error ? error.message : RAIL_IS_COPY.bid.invalidAmount,
      });
      return;
    }
    dispatch({ type: "BID_STARTED" });
    const intent = bidIntentId(job.id);
    const idempotencyKey = await getOrCreateIntentIdempotencyKey(runtime.store, intent);
    try {
      const result = await api.submitBid(
        job.id,
        { amountMinor, coverNote },
        { idempotencyKey },
      );
      await rotateIntentIdempotencyKey(runtime.store, intent);
      dispatch({ type: "BID_OK", bid: result.data.bid });
      void loadHome({ silent: true });
    } catch (error) {
      const failure = classifyV1Failure(error);
      if (failure.kind === "session") {
        await runtime.auth?.auth.signOut();
      }
      dispatch({ type: "BID_FAIL", error });
    }
  }, [loadHome, runtime, state.bidView.amountMajor, state.bidView.coverNote, state.selectedJob]);

  const openNewBidIntent = useCallback(async () => {
    const job = state.selectedJob;
    if (!job) {
      return;
    }
    await rotateIntentIdempotencyKey(runtime.store, bidIntentId(job.id));
    dispatch({ type: "BID_RESET_FORM" });
  }, [runtime.store, state.selectedJob]);

  const submitDelivery = useCallback(
    async (contractId: string) => {
      const api = runtime.api;
      if (!api) {
        return;
      }
      const form = state.deliveryById[contractId];
      let note: string;
      try {
        note = assertDeliveryNote(form?.note ?? "");
      } catch (error) {
        dispatch({
          type: "DELIVERY_LOCAL_FAIL",
          contractId,
          message: error instanceof Error ? error.message : RAIL_IS_COPY.delivery.noteBand,
        });
        return;
      }
      dispatch({ type: "DELIVERY_STARTED", contractId });
      const intent = deliveryIntentId(contractId);
      const idempotencyKey = await getOrCreateIntentIdempotencyKey(runtime.store, intent);
      try {
        await api.postDelivery(
          contractId,
          { kind: "DELIVERY", body: note },
          { idempotencyKey },
        );
      } catch (error) {
        const failure = classifyV1Failure(error);
        if (failure.kind === "session") {
          await runtime.auth?.auth.signOut();
        }
        dispatch({ type: "DELIVERY_FAIL", contractId, error });
        return;
      }
      const token = generation.current;
      try {
        const refreshed = await api.listContracts();
        if (token !== generation.current) {
          return;
        }
        await rotateIntentIdempotencyKey(runtime.store, intent);
        dispatch({ type: "CONTRACTS_OK", contracts: refreshed.data.contracts });
        dispatch({ type: "DELIVERY_OK", contractId });
      } catch (error) {
        if (token !== generation.current) {
          return;
        }
        const failure = classifyV1Failure(error);
        if (failure.kind === "stale") {
          dispatch({ type: "CONTRACTS_FAIL", error });
          return;
        }
        if (failure.kind === "session") {
          await runtime.auth?.auth.signOut();
          dispatch({ type: "NEED_LOGIN", message: failure.message });
          return;
        }
        dispatch({ type: "DELIVERY_FAIL", contractId, error });
        dispatch({ type: "CONTRACTS_FAIL", error, keepSnapshot: true });
      }
    },
    [runtime, state.deliveryById],
  );

  const submitRelease = useCallback(
    async (contractId: string) => {
      const api = runtime.api;
      if (!api) {
        return;
      }
      dispatch({ type: "RELEASE_STARTED", contractId });
      const intent = releaseIntentId(contractId);
      const idempotencyKey = await getOrCreateIntentIdempotencyKey(runtime.store, intent);
      try {
        await api.postRelease(contractId, { idempotencyKey });
      } catch (error) {
        const failure = classifyV1Failure(error);
        if (failure.kind === "session") {
          await runtime.auth?.auth.signOut();
        }
        dispatch({ type: "RELEASE_FAIL", contractId, error });
        return;
      }
      const token = generation.current;
      const settled = await Promise.allSettled([api.listContracts(), api.getWalletStrip()]);
      if (token !== generation.current) {
        return;
      }
      const contractsOutcome = settled[0];
      const walletOutcome = settled[1];
      if (contractsOutcome.status === "fulfilled") {
        await rotateIntentIdempotencyKey(runtime.store, intent);
        dispatch({ type: "CONTRACTS_OK", contracts: contractsOutcome.value.data.contracts });
        dispatch({ type: "RELEASE_OK", contractId });
      } else {
        const error = contractsOutcome.reason;
        const failure = classifyV1Failure(error);
        if (failure.kind === "stale") {
          dispatch({ type: "CONTRACTS_FAIL", error });
          return;
        }
        if (failure.kind === "session") {
          await runtime.auth?.auth.signOut();
          dispatch({ type: "NEED_LOGIN", message: failure.message });
          return;
        }
        dispatch({ type: "RELEASE_FAIL", contractId, error });
        dispatch({ type: "CONTRACTS_FAIL", error, keepSnapshot: true });
      }
      if (walletOutcome.status === "fulfilled") {
        dispatch({ type: "WALLET_OK", strip: walletOutcome.value.data.strip });
      } else {
        const error = walletOutcome.reason;
        const failure = classifyV1Failure(error);
        if (failure.kind === "stale") {
          dispatch({ type: "WALLET_FAIL", error });
          return;
        }
        if (failure.kind === "session") {
          await runtime.auth?.auth.signOut();
          dispatch({ type: "NEED_LOGIN", message: failure.message });
          return;
        }
        dispatch({ type: "WALLET_FAIL", error });
      }
    },
    [runtime],
  );

  const selectJob = useCallback(
    (job: RailV1Job) => {
      dispatch({ type: "SELECT_JOB", job });
      if (isOwnerJob(job, userRef.current?.id)) {
        void loadOwnerBids(job.id);
      }
    },
    [loadOwnerBids],
  );

  const submitAccept = useCallback(async () => {
    const job = state.selectedJob;
    const api = runtime.api;
    const bidId = state.acceptView.selectedBidId;
    if (!job || !api || !bidId) {
      return;
    }
    if (!isOwnerJob(job, state.user?.id)) {
      dispatch({ type: "ACCEPT_LOCAL_FAIL", message: RAIL_IS_COPY.accept.errorTitle });
      return;
    }
    if (job.status !== "OPEN") {
      dispatch({ type: "ACCEPT_LOCAL_FAIL", message: RAIL_IS_COPY.job.openOnly });
      return;
    }
    const selected =
      state.ownerBidsView.kind === "ready"
        ? state.ownerBidsView.bids.find((bid) => bid.bidId === bidId)
        : undefined;
    if (!selected) {
      dispatch({ type: "ACCEPT_CONFIRM_CLOSE" });
      return;
    }
    dispatch({ type: "ACCEPT_STARTED" });
    const intent = acceptIntentId(job.id, bidId);
    const idempotencyKey = await getOrCreateIntentIdempotencyKey(runtime.store, intent);
    try {
      await api.postAccept(job.id, { bidId }, { idempotencyKey });
    } catch (error) {
      const failure = classifyV1Failure(error);
      if (failure.kind === "session") {
        await runtime.auth?.auth.signOut();
      }
      dispatch({ type: "ACCEPT_FAIL", error });
      return;
    }
    const token = generation.current;
    const settled = await Promise.allSettled([api.listContracts(), api.getWalletStrip()]);
    if (token !== generation.current) {
      return;
    }
    const contractsOutcome = settled[0];
    const walletOutcome = settled[1];
    if (contractsOutcome.status === "fulfilled") {
      await rotateIntentIdempotencyKey(runtime.store, intent);
      dispatch({ type: "CONTRACTS_OK", contracts: contractsOutcome.value.data.contracts });
      dispatch({ type: "ACCEPT_OK" });
    } else {
      const error = contractsOutcome.reason;
      const failure = classifyV1Failure(error);
      if (failure.kind === "stale") {
        dispatch({ type: "CONTRACTS_FAIL", error });
        return;
      }
      if (failure.kind === "session") {
        await runtime.auth?.auth.signOut();
        dispatch({ type: "NEED_LOGIN", message: failure.message });
        return;
      }
      dispatch({ type: "ACCEPT_FAIL", error });
      dispatch({ type: "CONTRACTS_FAIL", error, keepSnapshot: true });
    }
    if (walletOutcome.status === "fulfilled") {
      dispatch({ type: "WALLET_OK", strip: walletOutcome.value.data.strip });
    } else {
      const error = walletOutcome.reason;
      const failure = classifyV1Failure(error);
      if (failure.kind === "stale") {
        dispatch({ type: "WALLET_FAIL", error });
        return;
      }
      if (failure.kind === "session") {
        await runtime.auth?.auth.signOut();
        dispatch({ type: "NEED_LOGIN", message: failure.message });
        return;
      }
      dispatch({ type: "WALLET_FAIL", error });
    }
  }, [runtime, state.acceptView.selectedBidId, state.ownerBidsView, state.selectedJob, state.user?.id, state.walletView.kind]);

  const openWebWallet = useCallback(async () => {
    const url = runtime.webWalletUrl;
    if (!url) {
      dispatch({ type: "WALLET_FAIL", error: new Error(RAIL_IS_COPY.login.apiMissing) });
      return;
    }
    await Linking.openURL(url);
  }, [runtime.webWalletUrl]);

  const refreshHome = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadHome({ silent: true });
    } finally {
      setRefreshing(false);
    }
  }, [loadHome]);

  return {
    state,
    screen: visibleScreen(state),
    dispatch,
    signIn,
    signOut,
    loadHome,
    refreshHome,
    refreshBench,
    refreshing,
    submitBid,
    submitDelivery,
    submitRelease,
    submitAccept,
    selectJob,
    loadOwnerBids,
    openNewBidIntent,
    openWebWallet,
    boot,
  };
}

async function readAccess(auth: NonNullable<DronRuntime["auth"]>): Promise<string | null> {
  const { data } = await auth.auth.getSession();
  return data.session?.access_token?.trim() || null;
}
