import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { RAIL_IS_COPY } from "../ui/copy";
import { colors } from "../ui/theme";
import { UiButton } from "./ui-primitives";

export const DRON_CHECKOUT_CONSENT_VERSION = "2026-09-05" as const;

export type DronWalletTopUpBody = {
  amountMinor: number;
  distanceContractAccepted: true;
  digitalImmediatePerformanceAccepted: true;
  consentVersion: typeof DRON_CHECKOUT_CONSENT_VERSION;
  billing: {
    invoiceType: "individual";
    fullName: string;
    tckn: string | null;
    phone: string;
    address: string;
  };
};

export function WalletTopUpScreen({
  pending,
  error,
  onSubmit,
  onClose,
}: {
  pending: boolean;
  error: string | null;
  onSubmit: (body: DronWalletTopUpBody) => void;
  onClose: () => void;
}) {
  const copy = RAIL_IS_COPY.wallet;
  const [amountMajor, setAmountMajor] = useState("100");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [distance, setDistance] = useState(false);
  const [digital, setDigital] = useState(false);

  function submit() {
    const amountMinor = Math.round(Number.parseFloat(amountMajor.replace(",", ".")) * 100);
    if (!Number.isFinite(amountMinor) || amountMinor < 1_000 || amountMinor > 2_000_000) {
      return;
    }
    if (!distance || !digital || !fullName.trim() || !phone.trim() || address.trim().length < 8) {
      return;
    }
    onSubmit({
      amountMinor,
      distanceContractAccepted: true,
      digitalImmediatePerformanceAccepted: true,
      consentVersion: DRON_CHECKOUT_CONSENT_VERSION,
      billing: {
        invoiceType: "individual",
        fullName: fullName.trim(),
        tckn: null,
        phone: phone.trim(),
        address: address.trim(),
      },
    });
  }

  return (
    <View testID="dron-wallet-top-up" style={styles.wrap}>
      <Text style={styles.title}>{copy.topUpTitle}</Text>
      <Text style={styles.body}>{copy.topUpHint}</Text>
      <TextInput
        testID="dron-wallet-top-up-amount"
        keyboardType="decimal-pad"
        placeholder={copy.topUpAmount}
        placeholderTextColor={colors.muted}
        value={amountMajor}
        onChangeText={setAmountMajor}
        style={styles.input}
        editable={!pending}
      />
      <TextInput
        testID="dron-wallet-top-up-name"
        placeholder={copy.topUpName}
        placeholderTextColor={colors.muted}
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
        editable={!pending}
      />
      <TextInput
        testID="dron-wallet-top-up-phone"
        keyboardType="phone-pad"
        placeholder={copy.topUpPhone}
        placeholderTextColor={colors.muted}
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        editable={!pending}
      />
      <TextInput
        testID="dron-wallet-top-up-address"
        placeholder={copy.topUpAddress}
        placeholderTextColor={colors.muted}
        value={address}
        onChangeText={setAddress}
        style={styles.input}
        editable={!pending}
      />
      <UiButton
        testID="dron-wallet-top-up-distance"
        label={copy.topUpConsentDistance}
        tone={distance ? "accent" : "muted"}
        onPress={() => setDistance((value) => !value)}
      />
      <UiButton
        testID="dron-wallet-top-up-digital"
        label={copy.topUpConsentDigital}
        tone={digital ? "accent" : "muted"}
        onPress={() => setDigital((value) => !value)}
      />
      {error ? (
        <Text testID="dron-wallet-top-up-error" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <UiButton
        testID="dron-wallet-top-up-submit"
        label={pending ? copy.topUpPending : copy.topUpSubmit}
        disabled={pending}
        onPress={submit}
      />
      <UiButton testID="dron-wallet-top-up-close" label={RAIL_IS_COPY.back} tone="muted" onPress={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  title: { color: colors.text, fontSize: 22, fontWeight: "600" },
  body: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  error: { color: colors.danger, fontSize: 13 },
});
