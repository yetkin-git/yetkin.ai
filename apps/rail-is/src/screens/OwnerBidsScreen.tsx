import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { RailV1Job } from "../contract/v1";
import { RAIL_IS_COPY } from "../ui/copy";
import { formatMinorLabel } from "../ui/money";
import type { AcceptFormView } from "../ui/present-accept";
import type { OwnerBidsView } from "../ui/present-owner-bids";
import { colors } from "../ui/theme";
import { HonestErrorCard, UiButton } from "./ui-primitives";

export function OwnerBidsScreen({
  job,
  ownerBids,
  accept,
  walletLive,
  walletAmountMinor,
  onBack,
  onRetry,
  onOpenConfirm,
  onCloseConfirm,
  onConfirm,
  onTopUp,
}: {
  job: RailV1Job;
  ownerBids: OwnerBidsView;
  accept: AcceptFormView;
  walletLive: boolean;
  walletAmountMinor: number | null;
  onBack: () => void;
  onRetry: () => void;
  onOpenConfirm: (bidId: string) => void;
  onCloseConfirm: () => void;
  onConfirm: () => void;
  onTopUp: () => void;
}) {
  const selected =
    ownerBids.kind === "ready"
      ? ownerBids.bids.find((bid) => bid.bidId === accept.selectedBidId)
      : undefined;
  const amountLabel = selected
    ? formatMinorLabel(selected.amountMinor, job.currencyCode)
    : null;
  const stripShort =
    walletLive &&
    walletAmountMinor != null &&
    selected != null &&
    walletAmountMinor < selected.amountMinor;

  return (
    <View testID="dron-owner-bids" style={styles.wrap}>
      <UiButton label={RAIL_IS_COPY.back} onPress={onBack} tone="muted" />
      <Text style={styles.kicker}>{job.status}</Text>
      <Text style={styles.title}>{job.title}</Text>
      <Text style={styles.label}>{RAIL_IS_COPY.job.briefLabel}</Text>
      <Text style={styles.brief}>{job.brief}</Text>
      <Text style={styles.meta}>
        {RAIL_IS_COPY.job.budgetLabel}: {formatMinorLabel(job.budgetMinor, job.currencyCode)}
      </Text>
      <Text style={styles.section}>{RAIL_IS_COPY.ownerBids.title}</Text>
      <Text style={styles.hint}>{RAIL_IS_COPY.ownerBids.noPii}</Text>
      {ownerBids.kind === "loading" || ownerBids.kind === "idle" ? (
        <Text testID={ownerBids.kind === "loading" ? ownerBids.testID : "dron-owner-bids-idle"} style={styles.muted}>
          {RAIL_IS_COPY.ownerBids.loading}
        </Text>
      ) : null}
      {ownerBids.kind === "error" ? (
        <HonestErrorCard
          testID={ownerBids.testID}
          title={ownerBids.title}
          message={ownerBids.message}
          requestId={ownerBids.requestId}
          onRetry={onRetry}
          retryLabel={RAIL_IS_COPY.retry}
        />
      ) : null}
      {ownerBids.kind === "empty" ? (
        <View testID={ownerBids.testID} style={styles.empty}>
          <Text style={styles.body}>{ownerBids.title}</Text>
          <Text style={styles.muted}>{ownerBids.hint}</Text>
        </View>
      ) : null}
      {ownerBids.kind === "ready"
        ? ownerBids.bids.map((bid) => (
            <View key={bid.bidId} testID={`dron-owner-bid-${bid.bidId}`} style={styles.card}>
              <Text style={styles.amount}>{formatMinorLabel(bid.amountMinor, job.currencyCode)}</Text>
              <Text style={styles.label}>{RAIL_IS_COPY.ownerBids.coverLabel}</Text>
              <Text style={styles.body}>{bid.coverNote}</Text>
              <Text style={styles.muted}>{bid.createdAt}</Text>
              {job.status === "OPEN" ? (
                <UiButton
                  testID={`dron-accept-open-${bid.bidId}`}
                  label={RAIL_IS_COPY.accept.submit}
                  disabled={accept.pending}
                  onPress={() => onOpenConfirm(bid.bidId)}
                />
              ) : null}
            </View>
          ))
        : null}
      {accept.error ? (
        <View testID={accept.testID} style={styles.errorCard}>
          <Text style={styles.errorTitle}>{RAIL_IS_COPY.accept.errorTitle}</Text>
          <Text style={styles.error}>{accept.error}</Text>
          {accept.insufficientBalance ? (
            <>
              <Text style={styles.muted}>{RAIL_IS_COPY.accept.insufficientHint}</Text>
              <UiButton
                testID="dron-accept-top-up"
                label={RAIL_IS_COPY.wallet.topUp}
                onPress={onTopUp}
              />
            </>
          ) : null}
        </View>
      ) : null}
      <Modal
        visible={accept.confirmOpen}
        transparent
        animationType="fade"
        onRequestClose={onCloseConfirm}
      >
        <Pressable style={styles.modalBackdrop} onPress={onCloseConfirm}>
          <Pressable testID={RAIL_IS_COPY.accept.modalTestID} style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.modalTitle}>{RAIL_IS_COPY.accept.confirmTitle}</Text>
            <Text style={styles.body}>
              {RAIL_IS_COPY.accept.confirmBody.replace("{amount}", amountLabel ?? "—")}
            </Text>
            {!walletLive ? <Text style={styles.error}>{RAIL_IS_COPY.accept.unboundBlock}</Text> : null}
            {stripShort ? <Text style={styles.muted}>{RAIL_IS_COPY.accept.stripHint}</Text> : null}
            <UiButton
              testID="dron-accept-confirm"
              label={accept.pending ? RAIL_IS_COPY.accept.pending : RAIL_IS_COPY.accept.confirm}
              disabled={accept.pending || !walletLive || !selected}
              onPress={onConfirm}
            />
            <UiButton label={RAIL_IS_COPY.accept.cancel} onPress={onCloseConfirm} tone="muted" />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  kicker: { color: colors.accent, fontSize: 12, letterSpacing: 1 },
  title: { color: colors.text, fontSize: 24, fontWeight: "600" },
  label: { color: colors.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6 },
  brief: { color: colors.text, fontSize: 15, lineHeight: 22 },
  meta: { color: colors.accent, fontSize: 14 },
  section: { color: colors.text, fontSize: 18, fontWeight: "600", marginTop: 8 },
  hint: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  body: { color: colors.text, fontSize: 15, lineHeight: 22 },
  empty: { gap: 6 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  amount: { color: colors.accent, fontSize: 18, fontWeight: "600" },
  errorCard: {
    backgroundColor: colors.surface,
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  errorTitle: { color: colors.danger, fontSize: 16, fontWeight: "600" },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(11, 18, 32, 0.72)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: "600" },
});
