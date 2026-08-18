import { StyleSheet, Text, TextInput, View } from "react-native";
import type { RailV1Job } from "../contract/v1";
import { RAIL_IS_COPY } from "../ui/copy";
import { formatMinorLabel } from "../ui/money";
import type { BidFormView } from "../ui/present-bid";
import { colors } from "../ui/theme";
import { UiButton } from "./ui-primitives";

export function JobDetailScreen({
  job,
  bid,
  onAmount,
  onNote,
  onSubmit,
  onBack,
  onNewIntent,
}: {
  job: RailV1Job;
  bid: BidFormView;
  onAmount: (value: string) => void;
  onNote: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  onNewIntent: () => void;
}) {
  return (
    <View testID="dron-job-detail" style={styles.wrap}>
      <UiButton label={RAIL_IS_COPY.back} onPress={onBack} tone="muted" />
      <Text style={styles.kicker}>{job.status}</Text>
      <Text style={styles.title}>{job.title}</Text>
      <Text style={styles.label}>{RAIL_IS_COPY.job.briefLabel}</Text>
      <Text style={styles.brief}>{job.brief}</Text>
      <Text style={styles.meta}>
        {RAIL_IS_COPY.job.budgetLabel}: {formatMinorLabel(job.budgetMinor, job.currencyCode)}
      </Text>
      <Text style={styles.section}>{RAIL_IS_COPY.bid.title}</Text>
      <Text style={styles.hint}>{RAIL_IS_COPY.bid.amountHint}</Text>
      <TextInput
        testID="dron-bid-amount"
        keyboardType="decimal-pad"
        placeholder={RAIL_IS_COPY.bid.amountLabel}
        placeholderTextColor={colors.muted}
        value={bid.amountMajor}
        onChangeText={onAmount}
        style={styles.input}
        editable={!bid.pending}
      />
      <TextInput
        testID="dron-bid-note"
        multiline
        placeholder={RAIL_IS_COPY.bid.coverLabel}
        placeholderTextColor={colors.muted}
        value={bid.coverNote}
        onChangeText={onNote}
        style={[styles.input, styles.note]}
        editable={!bid.pending}
      />
      {bid.error ? (
        <Text testID={bid.testID} style={styles.error}>
          {bid.error}
        </Text>
      ) : null}
      {bid.success ? (
        <Text testID={bid.testID} style={styles.ok}>
          {RAIL_IS_COPY.bid.success} {bid.success.bidId} · {bid.success.amountLabel}
        </Text>
      ) : null}
      <UiButton
        testID="dron-bid-submit"
        label={bid.pending ? RAIL_IS_COPY.bid.pending : RAIL_IS_COPY.bid.submit}
        disabled={bid.pending}
        onPress={onSubmit}
      />
      {bid.conflict ? (
        <UiButton label={RAIL_IS_COPY.bid.newIntent} onPress={onNewIntent} tone="muted" />
      ) : null}
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
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  note: { minHeight: 96, textAlignVertical: "top" },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
  ok: { color: colors.ok, fontSize: 14, lineHeight: 20 },
});
