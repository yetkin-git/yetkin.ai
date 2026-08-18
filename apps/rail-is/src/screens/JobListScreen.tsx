import { Pressable, StyleSheet, Text, View } from "react-native";
import type { RailV1Job } from "../contract/v1";
import { RAIL_IS_COPY } from "../ui/copy";
import { formatMinorLabel } from "../ui/money";
import type { JobListView } from "../ui/present-job-list";
import { colors } from "../ui/theme";
import { HonestErrorCard } from "./ui-primitives";

export function JobListScreen({
  view,
  onOpenJob,
  onRetry,
}: {
  view: JobListView;
  onOpenJob: (job: RailV1Job) => void;
  onRetry: () => void;
}) {
  if (view.kind === "loading" || view.kind === "idle") {
    return (
      <View testID={view.kind === "loading" ? view.testID : "dron-job-list-idle"} style={styles.block}>
        <Text style={styles.title}>{RAIL_IS_COPY.jobs.title}</Text>
        <Text style={styles.muted}>{RAIL_IS_COPY.jobs.loading}</Text>
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
        <Text style={styles.title}>{RAIL_IS_COPY.jobs.title}</Text>
        <Text style={styles.body}>{view.title}</Text>
        <Text style={styles.muted}>{view.hint}</Text>
      </View>
    );
  }
  return (
    <View testID={view.testID} style={styles.block}>
      <Text style={styles.title}>{view.title}</Text>
      {view.jobs.map((job) => (
        <Pressable
          key={job.id}
          testID={`dron-job-row-${job.id}`}
          accessibilityRole="button"
          onPress={() => onOpenJob(job)}
          style={styles.row}
        >
          <Text style={styles.rowTitle}>{job.title}</Text>
          <Text style={styles.muted} numberOfLines={2}>
            {job.brief}
          </Text>
          <Text style={styles.meta}>
            {formatMinorLabel(job.budgetMinor, job.currencyCode)} · {job.status}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 12 },
  title: { color: colors.text, fontSize: 22, fontWeight: "600" },
  body: { color: colors.text, fontSize: 15, lineHeight: 22 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 18 },
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
});
