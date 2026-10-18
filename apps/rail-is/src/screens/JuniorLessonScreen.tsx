import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { V1HttpClient } from "../api/client";
import { RailV1HttpError } from "../api/errors";
import {
  presentJuniorLessonPlay,
  presentJuniorProgressStatus,
  type JuniorPlayView,
} from "../ui/present-junior-lesson";
import { colors } from "../ui/theme";
import { HonestErrorCard, UiButton } from "./ui-primitives";

const DEFAULT_LESSON = "jr_06_mat-5";

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
 * Bilye tepsisi ve dedektif tahtası bu ekranda çizilmez; hop o sahneyi şart koşmaz.
 * Adres istemci tarafından kurulmaz; oyun hop'unun verdiği alan kullanılır.
 */
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
      setNote("İlerleme için çocuk profil kimliği gerekir.");
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
      setNote("Pekiştirme için çocuk profil kimliği gerekir.");
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
      {view ? (
        <View testID="dron-junior-body" style={styles.article}>
          <Text style={styles.kicker}>{view.courseTitle}</Text>
          <Text style={styles.rowTitle}>{view.title}</Text>
          <Text testID="dron-junior-script" style={styles.body}>
            {view.script}
          </Text>
          {view.steps.map((step) => (
            <Text key={step} style={styles.muted}>
              {step}
            </Text>
          ))}
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
            <UiButton
              testID="dron-junior-practice"
              label="Pekiştirmeyi gönder"
              onPress={() => void submitPractice()}
              tone="muted"
            />
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
});
