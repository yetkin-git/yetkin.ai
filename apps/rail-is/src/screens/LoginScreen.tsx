import { StyleSheet, Text, TextInput, View } from "react-native";
import { RAIL_IS_COPY } from "../ui/copy";
import { colors } from "../ui/theme";
import { UiButton } from "./ui-primitives";

export function LoginScreen({
  email,
  password,
  pending,
  error,
  onEmail,
  onPassword,
  onSubmit,
}: {
  email: string;
  password: string;
  pending: boolean;
  error: string | null;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
  onSubmit: () => void;
}) {
  const copy = RAIL_IS_COPY.login;
  return (
    <View testID={copy.testID} style={styles.wrap}>
      <Text style={styles.kicker}>{RAIL_IS_COPY.diyar}</Text>
      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.body}>{copy.body}</Text>
      <TextInput
        testID="dron-login-email"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder={copy.email}
        placeholderTextColor={colors.muted}
        value={email}
        onChangeText={onEmail}
        style={styles.input}
        editable={!pending}
      />
      <TextInput
        testID="dron-login-password"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        placeholder={copy.password}
        placeholderTextColor={colors.muted}
        value={password}
        onChangeText={onPassword}
        style={styles.input}
        editable={!pending}
      />
      {error ? (
        <Text testID="dron-login-error" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <UiButton
        testID="dron-login-submit"
        label={pending ? copy.pending : copy.submit}
        disabled={pending || !email.trim() || !password}
        onPress={onSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  kicker: { color: colors.accent, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" },
  title: { color: colors.text, fontSize: 28, fontWeight: "600" },
  body: { color: colors.muted, fontSize: 14, lineHeight: 20 },
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
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
});
