import { StyleSheet, Text, View } from "react-native";
import { RAIL_IS_COPY } from "../ui/copy";
import { colors } from "../ui/theme";

/**
 * Closed Testing yedek yüzeyi — Tezgâh hop'u 410 basmaz, HTTP atılmaz.
 * Sekmeler gizlidir; bu kart yalnız kaçak HOME_TAB / SELECT_JOB için durur.
 */
export function Phase2LockScreen() {
  const copy = RAIL_IS_COPY.phase2Lock;
  return (
    <View testID={copy.testID} style={styles.card} accessibilityRole="summary">
      <Text style={styles.kicker}>{copy.kicker}</Text>
      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.body}>{copy.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 10,
  },
  kicker: {
    color: colors.accent,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: { color: colors.text, fontSize: 22, fontWeight: "600" },
  body: { color: colors.muted, fontSize: 15, lineHeight: 22 },
});
