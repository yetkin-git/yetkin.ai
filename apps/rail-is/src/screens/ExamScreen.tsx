import { Pressable, StyleSheet, Text, View } from "react-native";
import { RAIL_IS_COPY } from "../ui/copy";
import type { AcademyExamView } from "../ui/present-academy-exam";
import { colors } from "../ui/theme";
import { HonestErrorCard, UiButton } from "./ui-primitives";

export function ExamScreen({
  view,
  onAnswer,
  onSubmit,
  onOpenCertificate,
  onBack,
}: {
  view: AcademyExamView;
  onAnswer: (questionId: string, choiceIndex: number) => void;
  onSubmit: () => void;
  onOpenCertificate: (hash: string) => void;
  onBack: () => void;
}) {
  const copy = RAIL_IS_COPY.exam;
  if (view.kind === "idle" || view.kind === "loading") {
    return (
      <View testID={view.kind === "loading" ? view.testID : "dron-exam-idle"} style={styles.wrap}>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.muted}>{view.kind === "loading" ? view.title : copy.loading}</Text>
      </View>
    );
  }
  if (view.kind === "error") {
    return (
      <View style={styles.wrap}>
        <HonestErrorCard
          testID={view.testID}
          title={view.title}
          message={view.message}
          requestId={view.requestId}
          onRetry={onBack}
          retryLabel={RAIL_IS_COPY.back}
        />
      </View>
    );
  }
  if (view.kind === "submitted") {
    return (
      <View testID={view.testID} style={styles.wrap}>
        <Text style={styles.title}>{view.passed ? copy.passed : copy.failed}</Text>
        <Text style={styles.body}>
          {view.score} / {view.passScore}
        </Text>
        {view.passed && view.certificateHash ? (
          <UiButton
            testID="dron-exam-open-certificate"
            label={copy.openCertificate}
            onPress={() => onOpenCertificate(view.certificateHash!)}
          />
        ) : null}
        <UiButton testID="dron-exam-back" label={RAIL_IS_COPY.back} tone="muted" onPress={onBack} />
      </View>
    );
  }
  return (
    <View testID={view.testID} style={styles.wrap}>
      <Text style={styles.title}>{view.title}</Text>
      {view.questions.map((question, index) => (
        <View key={question.id} testID={`dron-exam-question-${question.id}`} style={styles.card}>
          <Text style={styles.rowTitle}>
            {index + 1}. {question.prompt}
          </Text>
          {question.choices.map((choice, choiceIndex) => {
            const selected = view.answers[question.id] === choiceIndex;
            return (
              <Pressable
                key={`${question.id}-${choiceIndex}`}
                testID={`dron-exam-choice-${question.id}-${choiceIndex}`}
                accessibilityRole="button"
                onPress={() => onAnswer(question.id, choiceIndex)}
                style={[styles.choice, selected ? styles.choiceOn : null]}
              >
                <Text style={styles.body}>{choice}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
      {view.error ? (
        <Text testID="dron-exam-error-text" style={styles.error}>
          {view.error}
        </Text>
      ) : null}
      <UiButton
        testID="dron-exam-submit"
        label={view.pending ? copy.pending : copy.submit}
        disabled={view.pending}
        onPress={onSubmit}
      />
      <UiButton testID="dron-exam-back" label={RAIL_IS_COPY.back} tone="muted" onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  title: { color: colors.text, fontSize: 22, fontWeight: "600" },
  body: { color: colors.text, fontSize: 14, lineHeight: 20 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: "600" },
  error: { color: colors.danger, fontSize: 13 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  choice: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  choiceOn: { borderColor: colors.accent, backgroundColor: colors.bg },
});
