import { StyleSheet, Text, View } from "react-native";
import { RAIL_IS_COPY } from "../ui/copy";
import { colors } from "../ui/theme";

export function UpdateRequiredScreen({ title, body }: { title: string; body: string }) {
  return (
    <View testID={RAIL_IS_COPY.stale.testID} style={styles.wrap} accessibilityRole="alert">
      <Text style={styles.kicker}>{RAIL_IS_COPY.brand}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center", gap: 12, padding: 24 },
  kicker: { color: colors.accent, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" },
  title: { color: colors.text, fontSize: 26, fontWeight: "600" },
  body: { color: colors.muted, fontSize: 15, lineHeight: 22 },
});
