import { StyleSheet, Text, View } from "react-native";
import type { WalletStripView } from "../ui/present-wallet";
import { colors } from "../ui/theme";
import { HonestErrorCard, UiButton } from "./ui-primitives";

export function WalletStripBanner({
  view,
  onTopUp,
  onRetry,
}: {
  view: WalletStripView;
  onTopUp: () => void;
  onRetry: () => void;
}) {
  if (view.kind === "loading" || view.kind === "idle") {
    return (
      <View testID={view.kind === "loading" ? view.testID : "dron-wallet-idle"} style={styles.card}>
        <Text style={styles.muted}>Cüzdan şeridi yükleniyor.</Text>
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
      />
    );
  }
  if (view.kind === "unbound") {
    return (
      <View testID={view.testID} style={styles.card}>
        <Text style={styles.unbound}>{view.title}</Text>
        <Text style={styles.body}>{view.message}</Text>
        <UiButton label={view.topUpLabel} onPress={onTopUp} tone="muted" />
        <Text style={styles.muted}>{view.topUpHint}</Text>
      </View>
    );
  }
  return (
    <View testID={view.testID} style={styles.card}>
      <Text style={styles.live}>{view.title}</Text>
      <Text style={styles.amount}>{view.amountLabel}</Text>
      <UiButton label={view.topUpLabel} onPress={onTopUp} />
      <Text style={styles.muted}>{view.topUpHint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  live: { color: colors.ok, fontSize: 12, fontWeight: "600", letterSpacing: 0.4 },
  unbound: { color: colors.unbound, fontSize: 14, fontWeight: "600" },
  amount: { color: colors.text, fontSize: 28, fontWeight: "600" },
  body: { color: colors.text, fontSize: 14, lineHeight: 20 },
  muted: { color: colors.muted, fontSize: 12, lineHeight: 18 },
});
