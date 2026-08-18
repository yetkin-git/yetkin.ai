import type { ExpoConfig } from "expo/config";

/**
 * Rail İş (Diyar B) — mutlu yol ekranları.
 * Expo Web ürün değildir. IAP / Push / ikinci bundle yoktur.
 * Cüzdan yükleme Amiral /cuzdan (sistem tarayıcısı).
 * Faz 1 kapanana kadar yayın hattı donuk: eas.json / EAS build / expo publish yok.
 */
const config: ExpoConfig = {
  name: "Rail İş",
  slug: "rail-is",
  scheme: "rail-is",
  version: "0.0.1",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: false,
    bundleIdentifier: "rail.yetkin.is",
  },
  android: {
    package: "rail.yetkin.is",
    predictiveBackGestureEnabled: false,
  },
  plugins: ["expo-secure-store"],
  extra: {
    diyar: "B",
    product: "rail-is",
    publishFrozenUntilFaz1Close: true,
  },
};

export default config;
