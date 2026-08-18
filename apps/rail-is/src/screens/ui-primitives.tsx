import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../ui/theme";

export function UiButton({
  label,
  onPress,
  disabled,
  tone = "accent",
  testID,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: "accent" | "danger" | "muted";
  testID?: string;
}) {
  const background =
    tone === "danger" ? colors.danger : tone === "muted" ? colors.border : colors.accent;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, { backgroundColor: background, opacity: disabled ? 0.5 : 1 }]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

export function HonestErrorCard({
  testID,
  title,
  message,
  requestId,
  onRetry,
  retryLabel,
}: {
  testID: string;
  title: string;
  message: string;
  requestId?: string | null;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <Pressable testID={testID} style={styles.card} accessibilityRole="alert">
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{message}</Text>
      {requestId ? <Text style={styles.meta}>requestId {requestId}</Text> : null}
      {onRetry ? <UiButton label={retryLabel ?? "Yeniden dene"} onPress={onRetry} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  label: {
    color: colors.bg,
    fontSize: 15,
    fontWeight: "600",
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: "600",
  },
  cardBody: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  meta: {
    color: colors.muted,
    fontSize: 11,
  },
});
