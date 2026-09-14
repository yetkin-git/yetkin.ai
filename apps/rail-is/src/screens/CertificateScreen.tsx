import { StyleSheet, Text, View } from "react-native";
import { RAIL_IS_COPY } from "../ui/copy";
import type { AcademyCertificateView } from "../ui/present-academy-certificate";
import { colors } from "../ui/theme";
import { HonestErrorCard, UiButton } from "./ui-primitives";

export function CertificateScreen({
  view,
  onOpenVerify,
  onBack,
}: {
  view: AcademyCertificateView;
  onOpenVerify: (url: string) => void;
  onBack: () => void;
}) {
  const copy = RAIL_IS_COPY.certificate;
  if (view.kind === "idle" || view.kind === "loading") {
    return (
      <View
        testID={view.kind === "loading" ? view.testID : "dron-certificate-idle"}
        style={styles.wrap}
      >
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
  return (
    <View testID={view.testID} style={styles.wrap}>
      <Text style={styles.kicker}>{copy.seal}</Text>
      <Text style={styles.title}>{view.title}</Text>
      <Text style={styles.body}>{view.courseTitle}</Text>
      <Text style={styles.muted}>
        {copy.score} {view.score} · {view.sealStatus}
      </Text>
      <View testID="dron-certificate-seal" style={styles.seal}>
        <Text style={styles.sealLabel}>{copy.hashLabel}</Text>
        <Text selectable testID="dron-certificate-hash" style={styles.hash}>
          {view.certificateHash}
        </Text>
        <Text style={styles.muted}>{copy.qrHint}</Text>
        <Text selectable testID="dron-certificate-verify-url" style={styles.hash}>
          {view.verifyUrl}
        </Text>
      </View>
      <UiButton
        testID="dron-certificate-open-verify"
        label={copy.openVerify}
        onPress={() => onOpenVerify(view.verifyUrl)}
      />
      <UiButton testID="dron-certificate-back" label={RAIL_IS_COPY.back} tone="muted" onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  kicker: { color: colors.accent, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" },
  title: { color: colors.text, fontSize: 22, fontWeight: "600" },
  body: { color: colors.text, fontSize: 15, lineHeight: 22 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  seal: {
    backgroundColor: colors.surface,
    borderColor: colors.ok,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  sealLabel: { color: colors.ok, fontSize: 12, fontWeight: "600", letterSpacing: 0.4 },
  hash: { color: colors.text, fontSize: 12, fontFamily: "monospace" },
});
