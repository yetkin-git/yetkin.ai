import { StatusBar } from "expo-status-bar";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { DRON_TEZGAH_STORE_ISOLATED } from "./src/api/hops";
import { AcademyPlayerScreen } from "./src/screens/AcademyPlayerScreen";
import { BenchScreen } from "./src/screens/BenchScreen";
import { CertificateScreen } from "./src/screens/CertificateScreen";
import { ExamScreen } from "./src/screens/ExamScreen";
import { JobDetailScreen } from "./src/screens/JobDetailScreen";
import { JobListScreen } from "./src/screens/JobListScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { OwnerBidsScreen } from "./src/screens/OwnerBidsScreen";
import { Phase2LockScreen } from "./src/screens/Phase2LockScreen";
import { UpdateRequiredScreen } from "./src/screens/UpdateRequiredScreen";
import { UiButton } from "./src/screens/ui-primitives";
import { WalletStripBanner } from "./src/screens/WalletStripBanner";
import { WalletTopUpScreen } from "./src/screens/WalletTopUpScreen";
import { useDronApp } from "./src/runtime/use-dron-app";
import { dronAcademyCatalog } from "./src/ui/academy-catalog";
import { RAIL_IS_COPY } from "./src/ui/copy";
import { isOwnerJob } from "./src/ui/dron-app-state";
import { colors } from "./src/ui/theme";

/**
 * Mutlu yol (T3): giriş → cüzdan yükleme → Akademi satın alma → ders → sınav → mühür.
 * Closed Testing: Tezgâh sekmeleri gizlidir (`DRON_TEZGAH_STORE_ISOLATED`).
 * Kaçak HOME_TAB kilit kartına düşer; 410 hop UI'ya bağlanmaz.
 * Cüzdan yükleme v1 hop + HMAC /kasa. Native IAP yok.
 */
export default function App() {
  const app = useDronApp();
  const { state, screen } = app;
  const homeReady =
    screen === "jobs" ||
    screen === "bench" ||
    screen === "academy" ||
    screen === "player" ||
    screen === "exam" ||
    screen === "certificate";
  const catalog = dronAcademyCatalog();
  const tezgahOpen = !DRON_TEZGAH_STORE_ISOLATED;
  const tezgahLocked =
    DRON_TEZGAH_STORE_ISOLATED && (screen === "jobs" || screen === "bench" || screen === "job");

  if (screen === "stale") {
    return (
      <View style={styles.root}>
        <UpdateRequiredScreen title={state.staleTitle} body={state.staleBody} />
        <StatusBar style="light" />
      </View>
    );
  }

  if (screen === "boot") {
    return (
      <View style={styles.root}>
        <View style={styles.center}>
          <Text style={styles.brand}>{RAIL_IS_COPY.brand}</Text>
          <Text style={styles.muted}>{state.bootMessage}</Text>
        </View>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          homeReady ? (
            <RefreshControl
              refreshing={app.refreshing}
              onRefresh={() => void app.refreshHome()}
              tintColor={colors.accent}
            />
          ) : undefined
        }
      >
        <View style={styles.header}>
          <Text style={styles.brand}>{RAIL_IS_COPY.brand}</Text>
          <Text style={styles.kicker}>{RAIL_IS_COPY.diyar}</Text>
          {state.user ? (
            <View style={styles.headerRow}>
              <Text style={styles.muted}>{state.user.email}</Text>
              <UiButton label={RAIL_IS_COPY.signOut} onPress={() => void app.signOut()} tone="muted" />
            </View>
          ) : null}
        </View>
        {screen === "login" ? (
          <LoginScreen
            email={state.loginEmail}
            password={state.loginPassword}
            pending={state.loginPending}
            error={state.loginError}
            onEmail={(value) => app.dispatch({ type: "LOGIN_EMAIL", value })}
            onPassword={(value) => app.dispatch({ type: "LOGIN_PASSWORD", value })}
            onSubmit={() => void app.signIn()}
          />
        ) : null}
        {homeReady ? (
          <View style={styles.stack}>
            <WalletStripBanner
              view={state.walletView}
              onTopUp={() => app.dispatch({ type: "TOP_UP_OPEN" })}
              onRetry={() => void app.loadHome()}
            />
            {state.topUpOpen ? (
              <WalletTopUpScreen
                pending={app.topUpPending}
                error={app.topUpError}
                onSubmit={(body) => void app.beginWalletTopUp(body)}
                onClose={() => app.dispatch({ type: "TOP_UP_CLOSE" })}
              />
            ) : null}
            {tezgahOpen ? (
              <View style={styles.tabs}>
                <UiButton
                  testID="dron-home-tab-academy"
                  label={RAIL_IS_COPY.academy.tab}
                  onPress={() => app.dispatch({ type: "HOME_TAB", tab: "academy" })}
                  tone={state.homeTab === "academy" ? "accent" : "muted"}
                />
                <UiButton
                  testID="dron-home-tab-jobs"
                  label={RAIL_IS_COPY.bench.jobsTab}
                  onPress={() => app.dispatch({ type: "HOME_TAB", tab: "jobs" })}
                  tone={state.homeTab === "jobs" ? "accent" : "muted"}
                />
                <UiButton
                  testID="dron-home-tab-bench"
                  label={RAIL_IS_COPY.bench.tab}
                  onPress={() => app.dispatch({ type: "HOME_TAB", tab: "bench" })}
                  tone={state.homeTab === "bench" ? "accent" : "muted"}
                />
              </View>
            ) : null}
            {tezgahLocked ? <Phase2LockScreen /> : null}
            {screen === "academy" || screen === "player" ? (
              <AcademyPlayerScreen
                catalog={catalog}
                pulse={state.academyPulseView}
                view={state.curriculumView}
                purchasePending={app.purchasePending}
                purchaseError={app.purchaseError}
                onSelectCourse={(courseId) => void app.openAcademyCourse(courseId)}
                onSelectLesson={(lessonKey) => app.dispatch({ type: "ACADEMY_LESSON_SELECT", lessonKey })}
                onCompleteLesson={() => void app.completeAcademyLesson()}
                onOpenExam={() => void app.openAcademyExam()}
                onOpenCertificate={(hash) => void app.openAcademyCertificate(hash)}
                onPurchase={(body) => void app.purchaseAcademyCourse(body)}
                onBack={() => app.dispatch({ type: "ACADEMY_BACK" })}
              />
            ) : null}
            {screen === "exam" ? (
              <ExamScreen
                view={state.examView}
                onAnswer={(questionId, choiceIndex) =>
                  app.dispatch({ type: "ACADEMY_EXAM_ANSWER", questionId, choiceIndex })
                }
                onSubmit={() => void app.submitAcademyExam()}
                onOpenCertificate={(hash) => void app.openAcademyCertificate(hash)}
                onBack={() => app.dispatch({ type: "ACADEMY_BACK" })}
              />
            ) : null}
            {screen === "certificate" ? (
              <CertificateScreen
                view={state.certificateView}
                onOpenVerify={(url) => void app.openCertificateVerify(url)}
                onBack={() => app.dispatch({ type: "ACADEMY_BACK" })}
              />
            ) : null}
            {tezgahOpen && screen === "jobs" ? (
              <JobListScreen
                view={state.jobsView}
                onOpenJob={(job) => void app.selectJob(job)}
                onRetry={() => void app.loadHome()}
              />
            ) : null}
            {tezgahOpen && screen === "bench" ? (
              <BenchScreen
                view={state.benchView}
                deliveryById={state.deliveryById}
                releaseById={state.releaseById}
                onRetry={() => void app.loadHome()}
                onDeliveryNote={(contractId, value) =>
                  app.dispatch({ type: "DELIVERY_NOTE", contractId, value })
                }
                onDeliver={(contractId) => void app.submitDelivery(contractId)}
                onRelease={(contractId) => void app.submitRelease(contractId)}
              />
            ) : null}
          </View>
        ) : null}
        {tezgahLocked && screen === "job" ? <Phase2LockScreen /> : null}
        {tezgahOpen &&
        screen === "job" &&
        state.selectedJob &&
        isOwnerJob(state.selectedJob, state.user?.id) ? (
          <OwnerBidsScreen
            job={state.selectedJob}
            ownerBids={state.ownerBidsView}
            accept={state.acceptView}
            onBack={() => app.dispatch({ type: "BACK_TO_JOBS" })}
            onRetry={() => void app.loadOwnerBids(state.selectedJob!.id)}
            onOpenConfirm={(bidId) => app.dispatch({ type: "ACCEPT_CONFIRM_OPEN", bidId })}
            onCloseConfirm={() => app.dispatch({ type: "ACCEPT_CONFIRM_CLOSE" })}
            onConfirm={() => void app.submitAccept()}
          />
        ) : null}
        {tezgahOpen &&
        screen === "job" &&
        state.selectedJob &&
        !isOwnerJob(state.selectedJob, state.user?.id) ? (
          <JobDetailScreen
            job={state.selectedJob}
            bid={state.bidView}
            onAmount={(value) => app.dispatch({ type: "BID_AMOUNT", value })}
            onNote={(value) => app.dispatch({ type: "BID_NOTE", value })}
            onSubmit={() => void app.submitBid()}
            onBack={() => app.dispatch({ type: "BACK_TO_JOBS" })}
            onNewIntent={() => void app.openNewBidIntent()}
          />
        ) : null}
      </ScrollView>
      <StatusBar style="light" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 20,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  header: { gap: 4 },
  headerRow: { marginTop: 8, gap: 8 },
  brand: { color: colors.text, fontSize: 28, fontWeight: "600" },
  kicker: { color: colors.accent, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" },
  muted: { color: colors.muted, fontSize: 13 },
  stack: { gap: 16 },
  tabs: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
});
