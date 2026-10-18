import type { ExpoConfig } from "expo/config";

/**
 * Rail İş (Diyar B) — mutlu yol ekranları.
 * Expo Web ürün değildir. IAP / Push / ikinci bundle yoktur.
 * Cüzdan yükleme: POST /api/v1/wallet/top-up + HMAC /kasa pasaportu. Native IAP yok.
 * T3 Akademi oynatıcı / sınav / mühür Dron UI'dadır.
 * Closed Testing: Tezgâh yüzeyi izole (`tezgahStoreIsolated`).
 * EAS profilleri `apps/rail-is/eas.json`. CI eas/eas-cli koşmaz; binary operatör basar.
 * Play Closed Testing: production submit `track: internal`.
 * TestFlight: production profili store IPA basar. `extra.eas.projectId` uydurulmaz — `eas init` bağlar.
 * Özel şifreleme yok: `ITSAppUsesNonExemptEncryption` false.
 */
const config: ExpoConfig = {
  name: "yetkin.ai",
  slug: "rail-is",
  scheme: "rail-is",
  version: "0.0.1",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: false,
    bundleIdentifier: "rail.yetkin.is",
    buildNumber: "1",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "rail.yetkin.is",
    versionCode: 1,
    predictiveBackGestureEnabled: false,
  },
  plugins: ["expo-secure-store"],
  extra: {
    diyar: "B",
    product: "rail-is",
    publishFrozenUntilFaz1Close: false,
    tezgahStoreIsolated: true,
  },
};

export default config;
