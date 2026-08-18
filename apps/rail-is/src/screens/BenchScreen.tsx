import { StyleSheet, Text, TextInput, View } from "react-native";
import { RAIL_IS_COPY } from "../ui/copy";
import { formatMinorLabel } from "../ui/money";
import {
  benchLaneLabel,
  canPostDelivery,
  canReleaseEscrow,
  type BenchItem,
  type BenchLane,
  type BenchView,
} from "../ui/present-bench";
import { emptyDeliveryForm, type DeliveryFormView } from "../ui/present-delivery";
import { emptyReleaseForm, type ReleaseFormView } from "../ui/present-release";
import { colors } from "../ui/theme";
import { HonestErrorCard, UiButton } from "./ui-primitives";

const LANE_ORDER: BenchLane[] = [
  "in_progress",
  "delivered",
  "released",
  "refunded",
  "disputed",
];

export function BenchScreen({
  view,
  deliveryById,
  releaseById,
  onRetry,
  onDeliveryNote,
  onDeliver,
  onRelease,
}: {
  view: BenchView;
  deliveryById: Record<string, DeliveryFormView>;
  releaseById: Record<string, ReleaseFormView>;
  onRetry: () => void;
  onDeliveryNote: (contractId: string, value: string) => void;
  onDeliver: (contractId: string) => void;
  onRelease: (contractId: string) => void;
}) {
  if (view.kind === "loading" || view.kind === "idle") {
    return (
      <View testID={view.kind === "loading" ? view.testID : "dron-bench-idle"} style={styles.block}>
        <Text style={styles.title}>{RAIL_IS_COPY.bench.title}</Text>
        <Text style={styles.muted}>{RAIL_IS_COPY.bench.loading}</Text>
      </View>
    );
  }
  if (view.kind === "error") {
    return (
      <HonestErrorCard
        testID={view.testID}
        title={view.title}
        message={view.message}
        requestId={view.requestId}
        onRetry={onRetry}
        retryLabel={RAIL_IS_COPY.retry}
      />
    );
  }
  if (view.kind === "empty") {
    return (
      <View testID={view.testID} style={styles.block}>
        <Text style={styles.title}>{RAIL_IS_COPY.bench.title}</Text>
        <Text style={styles.body}>{view.title}</Text>
        <Text style={styles.muted}>{view.hint}</Text>
        {view.refreshError ? <Text style={styles.danger}>{view.refreshError}</Text> : null}
        <UiButton label={RAIL_IS_COPY.bench.refresh} onPress={onRetry} tone="muted" />
      </View>
    );
  }
  return (
    <View testID={view.testID} style={styles.block}>
      <Text style={styles.title}>{view.title}</Text>
      {view.refreshError ? <Text style={styles.danger}>{view.refreshError}</Text> : null}
      {LANE_ORDER.map((lane) => {
        const rows = view.lanes[lane];
        if (rows.length === 0) {
          return null;
        }
        return (
          <View key={lane} testID={`dron-bench-lane-${lane}`} style={styles.lane}>
            <Text style={styles.laneTitle}>{benchLaneLabel(lane)}</Text>
            {rows.map((item) => (
              <BenchRow
                key={item.contract.id}
                item={item}
                delivery={deliveryById[item.contract.id] ?? emptyDeliveryForm(item.contract.id)}
                release={releaseById[item.contract.id] ?? emptyReleaseForm(item.contract.id)}
                onDeliveryNote={onDeliveryNote}
                onDeliver={onDeliver}
                onRelease={onRelease}
              />
            ))}
          </View>
        );
      })}
      <Text style={styles.hint}>{RAIL_IS_COPY.bench.escrowOpaque}</Text>
    </View>
  );
}

function BenchRow({
  item,
  delivery,
  release,
  onDeliveryNote,
  onDeliver,
  onRelease,
}: {
  item: BenchItem;
  delivery: DeliveryFormView;
  release: ReleaseFormView;
  onDeliveryNote: (contractId: string, value: string) => void;
  onDeliver: (contractId: string) => void;
  onRelease: (contractId: string) => void;
}) {
  const { contract, role } = item;
  const roleLabel =
    role === "freelancer" ? RAIL_IS_COPY.bench.roleFreelancer : RAIL_IS_COPY.bench.roleClient;
  const statusLabel =
    contract.status === "RELEASED"
      ? RAIL_IS_COPY.release.success
      : contract.status === "FUNDED"
        ? RAIL_IS_COPY.bench.funded
        : contract.status;
  const showDelivery = canPostDelivery(item);
  const showRelease = canReleaseEscrow(item);
  return (
    <View testID={`dron-bench-row-${contract.id}`} style={styles.row}>
      <Text style={styles.rowTitle}>{item.title ?? RAIL_IS_COPY.bench.untitled}</Text>
      <Text style={styles.meta}>
        {roleLabel} · {statusLabel}
      </Text>
      <Text style={styles.meta}>
        {formatMinorLabel(contract.netMinor, contract.currencyCode)} net
      </Text>
      {contract.deliveredAt ? (
        <Text style={styles.muted}>Teslim {contract.deliveredAt}</Text>
      ) : null}
      {showDelivery ? (
        <View
          testID={delivery.pending ? "dron-delivery-pending" : RAIL_IS_COPY.delivery.formTestID}
          style={styles.delivery}
        >
          <Text style={styles.muted}>{RAIL_IS_COPY.delivery.hint}</Text>
          <TextInput
            testID={`dron-delivery-note-${contract.id}`}
            multiline
            placeholder={RAIL_IS_COPY.delivery.note}
            placeholderTextColor={colors.muted}
            value={delivery.note}
            onChangeText={(value) => onDeliveryNote(contract.id, value)}
            editable={!delivery.pending}
            style={styles.note}
          />
          {delivery.error ? (
            <HonestErrorCard
              testID={RAIL_IS_COPY.delivery.errorTestID}
              title={RAIL_IS_COPY.delivery.errorTitle}
              message={delivery.error}
              requestId={delivery.requestId}
            />
          ) : null}
          <UiButton
            testID={`dron-delivery-submit-${contract.id}`}
            label={delivery.pending ? RAIL_IS_COPY.delivery.pending : RAIL_IS_COPY.delivery.submit}
            disabled={delivery.pending}
            onPress={() => onDeliver(contract.id)}
          />
        </View>
      ) : null}
      {showRelease ? (
        <View
          testID={release.pending ? "dron-release-pending" : RAIL_IS_COPY.release.formTestID}
          style={styles.delivery}
        >
          <Text style={styles.muted}>{RAIL_IS_COPY.release.hint}</Text>
          <Text style={styles.meta}>
            {RAIL_IS_COPY.release.gross}: {formatMinorLabel(contract.grossMinor, contract.currencyCode)}
          </Text>
          <Text style={styles.meta}>
            {RAIL_IS_COPY.release.hold}: {formatMinorLabel(contract.holdMinor, contract.currencyCode)}
          </Text>
          <Text style={styles.meta}>
            {RAIL_IS_COPY.release.net}: {formatMinorLabel(contract.netMinor, contract.currencyCode)}
          </Text>
          {release.error ? (
            <HonestErrorCard
              testID={RAIL_IS_COPY.release.errorTestID}
              title={RAIL_IS_COPY.release.errorTitle}
              message={release.error}
              requestId={release.requestId}
            />
          ) : null}
          <UiButton
            testID={`dron-release-submit-${contract.id}`}
            label={release.pending ? RAIL_IS_COPY.release.pending : RAIL_IS_COPY.release.submit}
            disabled={release.pending}
            onPress={() => onRelease(contract.id)}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 12 },
  title: { color: colors.text, fontSize: 22, fontWeight: "600" },
  body: { color: colors.text, fontSize: 15, lineHeight: 22 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  hint: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  danger: { color: colors.danger, fontSize: 13, lineHeight: 18 },
  lane: { gap: 8 },
  laneTitle: {
    color: colors.accent,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  row: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: "600" },
  meta: { color: colors.accent, fontSize: 13 },
  delivery: { gap: 8, marginTop: 8 },
  note: {
    backgroundColor: colors.bg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 88,
    textAlignVertical: "top",
  },
});
