import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { V1HttpClient } from "../api/client";
import { RailV1HttpError } from "../api/errors";
import {
  presentJuniorLessonPlay,
  presentJuniorProgressStatus,
  type JuniorPlayBeat,
  type JuniorPlayView,
} from "../ui/present-junior-lesson";
import { colors } from "../ui/theme";
import { HonestErrorCard, UiButton } from "./ui-primitives";

const DEFAULT_LESSON = "jr_06_mat-1";

function failMessage(error: unknown): string {
  if (error instanceof RailV1HttpError) {
    return error.message;
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "Ders açılamadı.";
}

/**
 * Junior dersi: gövde, imzalı medya adresi, dinleme kaydı ve pekiştirme.
 * Varsayılan anahtar mühürlü pilot derstir. Okuma `GET /api/v1/junior/lessons/{key}/play` hop'udur.
 * Mobil parite: `jr_06_mat-1` beş bölüm saatini ve bilye tepsisini çizer.
 * `jr_06_mat-2` ve `jr_06_mat-3` konu rozetini ve özet sahne kartını çizer.
 * Kelime saati hop'ta yoktur. Adres istemci tarafından kurulmaz.
 */

const MAT5_PUBLIC_TITLE = "6. Sınıf Matematik: Çarpanlar ve Katlar (Pilot Ders)";
const MAT5_RULE_BADGES = ["2", "3", "4", "5", "6", "9", "10"] as const;
const MAT6_TOPIC_BADGES = ["Asal", "1 değil", "2", "9 tuzak", "2×2×3"] as const;
const MAT7_TOPIC_BADGES = ["Ortak bölenler", "Ortak katlar", "Küçük liste", "Büyük liste", "8", "12"] as const;

function clockLabel(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function Mat5NativeScene({
  title,
  beats,
  activeIndex,
  onSelect,
}: {
  title?: string | null;
  beats: readonly JuniorPlayBeat[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const active = beats[activeIndex] ?? null;
  const showMarbles = activeIndex === 0 || beats.length === 0;
  const showBadges = activeIndex >= 2 || beats.length === 0;
  return (
    <View testID="dron-junior-mat5-scene" style={styles.sceneCard}>
      <Text style={styles.rowTitle}>{MAT5_PUBLIC_TITLE}</Text>
      <Text style={styles.muted}>
        {active ? `${clockLabel(active.startMs)} – ${clockLabel(active.endMs)} · ${active.title}` : title?.trim() || "12 Bilye Deneyi ve Çarpan"}
      </Text>
      {beats.length > 0 ? (
        <View testID="dron-junior-mat5-clock" style={styles.badgeRow}>
          {beats.map((beat, index) => (
            <Pressable key={`${beat.title}-${beat.startMs}`} onPress={() => onSelect(index)}>
              <Text style={index === activeIndex ? styles.ruleBadgeActive : styles.ruleBadge}>
                {index + 1}. {clockLabel(beat.startMs)}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {showMarbles ? (
        <>
          <Text style={styles.muted}>Bilye tepsisi: 12 bilye — çarpanları gruplara ayırarak bul.</Text>
          <View style={styles.marbleTray} accessibilityLabel="12 bilyelik tepsi">
            {Array.from({ length: 12 }, (_, index) => (
              <Text key={index} style={styles.marble}>
                ●
              </Text>
            ))}
          </View>
        </>
      ) : (
        <Text style={styles.rowTitle}>{active?.title}</Text>
      )}
      {showBadges ? (
        <>
          <Text style={styles.muted}>Dedektif tahtası: hangi kurala bakacağını rozet söyler.</Text>
          <View style={styles.badgeRow}>
            {MAT5_RULE_BADGES.map((rule) => (
              <Text key={rule} style={styles.ruleBadge}>
                {rule}
              </Text>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

function ThemeSummaryScene({
  testID,
  title,
  summary,
  badges,
  beats,
  activeIndex,
  onSelect,
}: {
  testID: string;
  title: string;
  summary: string;
  badges: readonly string[];
  beats: readonly JuniorPlayBeat[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const active = beats[activeIndex] ?? null;
  return (
    <View testID={testID} style={styles.sceneCard}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.muted}>
        {active ? `${clockLabel(active.startMs)} – ${clockLabel(active.endMs)} · ${active.title}` : summary}
      </Text>
      {beats.length > 0 ? (
        <View style={styles.badgeRow}>
          {beats.map((beat, index) => (
            <Pressable key={`${beat.title}-${beat.startMs}`} onPress={() => onSelect(index)}>
              <Text style={index === activeIndex ? styles.ruleBadgeActive : styles.ruleBadge}>
                {index + 1}. {clockLabel(beat.startMs)}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <View style={styles.badgeRow}>
        {badges.map((badge) => (
          <Text key={badge} style={styles.ruleBadge}>
            {badge}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function JuniorLessonScreen({
  api,
  profileId,
  onProfileIdChange,
}: {
  api: V1HttpClient;
  profileId: string;
  onProfileIdChange: (value: string) => void;
}) {
  const [lessonKey, setLessonKey] = useState(DEFAULT_LESSON);
  const [view, setView] = useState<JuniorPlayView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [note, setNote] = useState<string | null>(null);
  const [beatIndex, setBeatIndex] = useState(0);

  async function openLesson() {
    setPending(true);
    setError(null);
    setNote(null);
    try {
      const envelope = await api.getJuniorLessonPlay(lessonKey.trim(), profileId.trim() || null);
      const next = presentJuniorLessonPlay(envelope.data);
      if (!next) {
        setView(null);
        setError("Ders gövdesi okunamadı.");
        return;
      }
      setView(next);
      setChoices({});
      setBeatIndex(0);
    } catch (caught) {
      setView(null);
      setError(failMessage(caught));
    } finally {
      setPending(false);
    }
  }

  async function saveProgress() {
    if (!view) {
      return;
    }
    const id = profileId.trim();
    if (!id) {
      setNote("Anlatış, test ve ilerleme çocuk profiline yazılır. Önce hesap ve profil gerekir.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const envelope = await api.saveJuniorLessonProgress(view.lessonKey, { profileId: id });
      const status = presentJuniorProgressStatus(envelope.data);
      setNote(status === "done" ? "Bu ders bitti." : "Dinleme kaydı yazıldı.");
      if (status) {
        setView({ ...view, progressStatus: status });
      }
    } catch (caught) {
      setError(failMessage(caught));
    } finally {
      setPending(false);
    }
  }

  async function submitPractice() {
    if (!view) {
      return;
    }
    const id = profileId.trim();
    if (!id) {
      setNote("Anlatış, test ve ilerleme çocuk profiline yazılır. Önce hesap ve profil gerekir.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const envelope = await api.submitJuniorLessonPractice(view.lessonKey, {
        profileId: id,
        answers: view.practice.map((item) => ({
          id: item.id,
          choiceIndex: choices[item.id] ?? 0,
        })),
      });
      const result = envelope.data.result;
      const score = result && typeof result === "object" && "score" in result ? String(result.score) : "";
      setNote(score ? `Pekiştirme puanı ${score}.` : "Pekiştirme yazıldı.");
    } catch (caught) {
      setError(failMessage(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <View testID="dron-junior-lesson" style={styles.wrap}>
      <Text style={styles.title}>Junior ders</Text>
      <Text style={styles.muted}>Ücretsiz konu açılır. Kilitli konu paket sonrası imzalı adres ister.</Text>
      <TextInput
        testID="dron-junior-lesson-key"
        value={lessonKey}
        onChangeText={setLessonKey}
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        testID="dron-junior-profile-id"
        value={profileId}
        onChangeText={onProfileIdChange}
        autoCapitalize="none"
        placeholder="Çocuk profil kimliği"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <UiButton
        testID="dron-junior-open"
        label={pending ? "Açılıyor…" : "Dersi aç"}
        onPress={() => void openLesson()}
      />
      {error ? (
        <HonestErrorCard testID="dron-junior-error" title="Ders açılmadı" message={error} requestId={null} />
      ) : null}
      {!view && lessonKey.trim() === "jr_06_mat-2" ? (
        <ThemeSummaryScene
          testID="dron-junior-mat6-scene"
          title="Asal sayılar ve asal çarpanlar"
          summary="Eratosthenes kalburu yüzlük tabloda 2, 3, 5 ve 7'nin katlarını eler. 12 = 2 × 2 × 3."
          badges={MAT6_TOPIC_BADGES}
          beats={[]}
          activeIndex={0}
          onSelect={() => undefined}
        />
      ) : null}
      {!view && lessonKey.trim() === "jr_06_mat-3" ? (
        <ThemeSummaryScene
          testID="dron-junior-mat7-scene"
          title="Ortak bölen ve ortak kat"
          summary="8 ve 12 için ortak bölenler 1, 2 ve 4. Ortak katlar 24'te buluşur."
          badges={MAT7_TOPIC_BADGES}
          beats={[]}
          activeIndex={0}
          onSelect={() => undefined}
        />
      ) : null}
      {view ? (
        <View testID="dron-junior-body" style={styles.article}>
          <Text style={styles.kicker}>{view.courseTitle}</Text>
          <Text style={styles.rowTitle}>
            {view.lessonKey === "jr_06_mat-1" ? MAT5_PUBLIC_TITLE : view.title}
          </Text>
          {view.lessonKey === "jr_06_mat-1" ? (
            <Text style={styles.muted}>
              İlk açık pilot ders budur. 1–4 numaralı adresler önceki ders değildir.
            </Text>
          ) : null}
          <Text testID="dron-junior-script" style={styles.body}>
            {view.script}
          </Text>
          {view.steps.map((step) => (
            <Text key={step} style={styles.muted}>
              {step}
            </Text>
          ))}
          {view.lessonKey === "jr_06_mat-1" ? (
            <Mat5NativeScene
              title={view.graphic?.title}
              beats={view.beats}
              activeIndex={beatIndex}
              onSelect={setBeatIndex}
            />
          ) : view.lessonKey === "jr_06_mat-2" ? (
            <ThemeSummaryScene
              testID="dron-junior-mat6-scene"
              title="Asal sayılar ve asal çarpanlar"
              summary="Eratosthenes kalburu yüzlük tabloda 2, 3, 5 ve 7'nin katlarını eler. 12 = 2 × 2 × 3."
              badges={MAT6_TOPIC_BADGES}
              beats={view.beats}
              activeIndex={beatIndex}
              onSelect={setBeatIndex}
            />
          ) : view.lessonKey === "jr_06_mat-3" ? (
            <ThemeSummaryScene
              testID="dron-junior-mat7-scene"
              title="Ortak bölen ve ortak kat"
              summary="8 ve 12 için ortak bölenler 1, 2 ve 4. Ortak katlar 24'te buluşur."
              badges={MAT7_TOPIC_BADGES}
              beats={view.beats}
              activeIndex={beatIndex}
              onSelect={setBeatIndex}
            />
          ) : view.graphic ? (
            <View testID="dron-junior-graphic-scene" style={styles.sceneCard}>
              <Text style={styles.rowTitle}>{view.graphic.title || view.title}</Text>
              {view.graphic.subtitle ? <Text style={styles.muted}>{view.graphic.subtitle}</Text> : null}
            </View>
          ) : null}
          <Text testID="dron-junior-audio" style={styles.meta}>
            {view.audioUrl ? "Ses adresi hazır." : "Ses adresi yok."}
          </Text>
          {view.expiresAt ? <Text style={styles.meta}>Adresin süresi {view.expiresAt}</Text> : null}
          {view.progressStatus ? <Text style={styles.meta}>Durum: {view.progressStatus}</Text> : null}
          <UiButton
            testID="dron-junior-save"
            label="Dinledim, kaydet"
            onPress={() => void saveProgress()}
            tone="muted"
          />
          {view.practice.map((item) => (
            <View key={item.id} style={styles.question}>
              <Text style={styles.rowTitle}>{item.prompt}</Text>
              {item.choices.map((choice, index) => (
                <Pressable
                  key={`${item.id}-${index}`}
                  testID={`dron-junior-choice-${item.id}-${index}`}
                  onPress={() => setChoices((current) => ({ ...current, [item.id]: index }))}
                >
                  <Text style={choices[item.id] === index ? styles.chosen : styles.muted}>{choice}</Text>
                </Pressable>
              ))}
            </View>
          ))}
          {view.practice.length > 0 ? (
            <>
              <Text style={styles.muted}>{`Hızlı Konu Kontrolü (${view.practice.length} Soru)`}</Text>
              <UiButton
                testID="dron-junior-practice"
                label="Pekiştirmeyi gönder"
                onPress={() => void submitPractice()}
                tone="muted"
              />
            </>
          ) : null}
          {note ? (
            <Text testID="dron-junior-note" style={styles.meta}>
              {note}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginTop: 16 },
  title: { color: colors.text, fontSize: 20, fontWeight: "700" },
  kicker: { color: colors.accent, fontSize: 12, fontWeight: "700" },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: "600" },
  body: { color: colors.text, fontSize: 15, lineHeight: 22 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  meta: { color: colors.muted, fontSize: 12 },
  chosen: { color: colors.accent, fontSize: 14, fontWeight: "700" },
  input: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    color: colors.text,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  article: { gap: 8, marginTop: 8 },
  question: { gap: 4, marginTop: 8 },
  sceneCard: {
    gap: 8,
    marginTop: 8,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  marbleTray: { flexDirection: "row", flexWrap: "wrap", gap: 6, maxWidth: 220 },
  marble: { color: colors.accent, fontSize: 22, lineHeight: 24 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  ruleBadge: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: "hidden",
  },
  ruleBadgeActive: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: "hidden",
  },
});
