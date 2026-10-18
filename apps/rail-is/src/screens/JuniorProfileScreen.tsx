import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { V1HttpClient } from "../api/client";
import { RailV1HttpError } from "../api/errors";
import { colors } from "../ui/theme";
import { HonestErrorCard, UiButton } from "./ui-primitives";

/** Yürürlükteki aydınlatma. Metin `lib/copy/junior-guardian-notice.ts` ile aynı sürüm dizesidir. */
const JUNIOR_NOTICE_VERSION = "junior-notice-2026-10-09";
const PILOT_GRADE = 6;

type JuniorProfileCard = {
  id: string;
  nickname: string;
  grade: number;
  selected: boolean;
};

function failMessage(error: unknown): string {
  if (error instanceof RailV1HttpError) {
    return error.message;
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "Profil masası açılmadı.";
}

function readProfiles(data: Record<string, unknown>): JuniorProfileCard[] {
  if (!Array.isArray(data.profiles)) {
    return [];
  }
  const cards: JuniorProfileCard[] = [];
  for (const row of data.profiles) {
    if (!row || typeof row !== "object") {
      continue;
    }
    const item = row as Record<string, unknown>;
    if (typeof item.id !== "string" || typeof item.nickname !== "string" || typeof item.grade !== "number") {
      continue;
    }
    cards.push({
      id: item.id,
      nickname: item.nickname,
      grade: item.grade,
      selected: item.selected === true,
    });
  }
  return cards;
}

function readProfileId(data: Record<string, unknown>): string | null {
  const profile = data.profile;
  if (!profile || typeof profile !== "object") {
    return null;
  }
  const id = (profile as Record<string, unknown>).id;
  return typeof id === "string" && id.trim() ? id : null;
}

function parseYear(raw: string): number | null {
  const year = Number(raw.trim());
  if (!Number.isInteger(year)) {
    return null;
  }
  return year;
}

function parseSlugs(raw: string): string[] {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 3);
}

/**
 * Veli profil masası. Liste, oluşturma, seçme, onay, silme ve seçmeli ders
 * `/api/v1/junior-pilot/*` hop'larıdır. Kasa bu ekranda yoktur.
 */
export function JuniorProfileScreen({
  api,
  selectedId,
  onSelectedId,
}: {
  api: V1HttpClient;
  selectedId: string;
  onSelectedId: (profileId: string) => void;
}) {
  const [profiles, setProfiles] = useState<JuniorProfileCard[]>([]);
  const [nickname, setNickname] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [guardianYear, setGuardianYear] = useState("");
  const [electiveSlugs, setElectiveSlugs] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function loadProfiles() {
    setError(null);
    try {
      const envelope = await api.getJuniorProfiles();
      const next = readProfiles(envelope.data);
      setProfiles(next);
      const serverSelected = envelope.data.selectedId;
      if (typeof serverSelected === "string" && serverSelected.trim()) {
        onSelectedId(serverSelected);
      }
      if (next.length === 0) {
        setNote("Bu hesapta çocuk profili yok.");
      }
    } catch (caught) {
      setError(failMessage(caught));
    }
  }

  useEffect(() => {
    void loadProfiles();
  }, [api]);

  async function createProfile() {
    const childYear = parseYear(birthYear);
    const parentYear = parseYear(guardianYear);
    if (!nickname.trim() || childYear == null || parentYear == null) {
      setNote("Takma ad, çocuk doğum yılı ve veli doğum yılı gerekir.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const envelope = await api.createJuniorProfile({
        nickname: nickname.trim(),
        grade: PILOT_GRADE,
        birthYear: childYear,
        consent: true,
        consentVersion: JUNIOR_NOTICE_VERSION,
        guardianBirthYear: parentYear,
      });
      const id = readProfileId(envelope.data);
      if (id) {
        onSelectedId(id);
      }
      await loadProfiles();
      setNote("Profil açıldı.");
    } catch (caught) {
      setError(failMessage(caught));
    } finally {
      setPending(false);
    }
  }

  async function selectProfile(profileId: string) {
    setPending(true);
    setError(null);
    try {
      await api.selectJuniorProfile({ profileId });
      onSelectedId(profileId);
      await loadProfiles();
      setNote("Bu profil seçildi.");
    } catch (caught) {
      setError(failMessage(caught));
    } finally {
      setPending(false);
    }
  }

  async function confirmConsent() {
    const parentYear = parseYear(guardianYear);
    if (!selectedId.trim() || parentYear == null) {
      setNote("Onay için seçili profil ve veli doğum yılı gerekir.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await api.confirmJuniorProfileConsent({
        profileId: selectedId.trim(),
        consent: true,
        consentVersion: JUNIOR_NOTICE_VERSION,
        guardianBirthYear: parentYear,
      });
      setNote("Veli onayı yazıldı.");
    } catch (caught) {
      setError(failMessage(caught));
    } finally {
      setPending(false);
    }
  }

  async function eraseProfile() {
    if (!selectedId.trim()) {
      setNote("Silmek için seçili profil gerekir.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await api.eraseJuniorProfile({ profileId: selectedId.trim() });
      onSelectedId("");
      await loadProfiles();
      setNote("Profil kapatıldı.");
    } catch (caught) {
      setError(failMessage(caught));
    } finally {
      setPending(false);
    }
  }

  async function saveElectives() {
    if (!selectedId.trim()) {
      setNote("Seçmeli ders için seçili profil gerekir.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await api.saveJuniorElectives({
        profileId: selectedId.trim(),
        slugs: parseSlugs(electiveSlugs),
      });
      await loadProfiles();
      setNote("Seçmeli dersler yazıldı.");
    } catch (caught) {
      setError(failMessage(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <View testID="dron-junior-profiles" style={styles.wrap}>
      <Text style={styles.title}>Çocuk profilleri</Text>
      <Text style={styles.muted}>
        Liste ve yazma v1 hop'udur. Geçerli yıllık paket yoksa sunucu 403 döner. Kasa bu ekranda yoktur.
      </Text>
      <Text style={styles.meta}>Aydınlatma {JUNIOR_NOTICE_VERSION}</Text>
      {error ? (
        <HonestErrorCard
          testID="dron-junior-profile-error"
          title="Profil masası açılmadı"
          message={error}
          requestId={null}
          onRetry={() => void loadProfiles()}
        />
      ) : null}
      {profiles.map((profile) => (
        <Pressable
          key={profile.id}
          testID={`dron-junior-profile-${profile.id}`}
          onPress={() => void selectProfile(profile.id)}
          style={styles.row}
        >
          <Text style={styles.rowTitle}>
            {profile.nickname} · {profile.grade}. sınıf
            {profile.id === selectedId || profile.selected ? " · seçili" : ""}
          </Text>
        </Pressable>
      ))}
      <TextInput
        testID="dron-junior-nickname"
        value={nickname}
        onChangeText={setNickname}
        placeholder="Takma ad"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <TextInput
        testID="dron-junior-birth-year"
        value={birthYear}
        onChangeText={setBirthYear}
        keyboardType="number-pad"
        placeholder="Çocuk doğum yılı"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <TextInput
        testID="dron-junior-guardian-year"
        value={guardianYear}
        onChangeText={setGuardianYear}
        keyboardType="number-pad"
        placeholder="Veli doğum yılı"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <UiButton
        testID="dron-junior-create"
        label={pending ? "Yazılıyor…" : "Profil aç"}
        onPress={() => void createProfile()}
      />
      <UiButton
        testID="dron-junior-consent"
        label="Veli onayını yaz"
        onPress={() => void confirmConsent()}
        tone="muted"
      />
      <TextInput
        testID="dron-junior-electives"
        value={electiveSlugs}
        onChangeText={setElectiveSlugs}
        autoCapitalize="none"
        placeholder="Seçmeli ders kodları, virgülle"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <UiButton
        testID="dron-junior-save-electives"
        label="Seçmeli dersleri yaz"
        onPress={() => void saveElectives()}
        tone="muted"
      />
      <UiButton
        testID="dron-junior-erase"
        label="Seçili profili kapat"
        onPress={() => void eraseProfile()}
        tone="danger"
      />
      {note ? (
        <Text testID="dron-junior-profile-note" style={styles.meta}>
          {note}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginTop: 16 },
  title: { color: colors.text, fontSize: 20, fontWeight: "700" },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  meta: { color: colors.muted, fontSize: 12 },
  row: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: "600" },
  input: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
