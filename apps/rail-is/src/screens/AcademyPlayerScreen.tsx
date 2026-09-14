import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { DronAcademyCatalogItem } from "../ui/academy-catalog";
import { RAIL_IS_COPY } from "../ui/copy";
import type { AcademyPlayerView } from "../ui/present-academy-player";
import type { AcademyPulseView } from "../ui/present-academy-pulse";
import { dronAcademyPunchcardsForLesson, dronActivePunchcard } from "../ui/academy-punchcards";
import { colors } from "../ui/theme";
import { DRON_CHECKOUT_CONSENT_VERSION } from "./WalletTopUpScreen";
import { HonestErrorCard, UiButton } from "./ui-primitives";

export type DronAcademyPurchaseBody = {
  distanceContractAccepted: true;
  digitalImmediatePerformanceAccepted: true;
  consentVersion: typeof DRON_CHECKOUT_CONSENT_VERSION;
  path: "training";
  lockId?: string;
  billing: {
    invoiceType: "individual";
    fullName: string;
    tckn: string | null;
    phone: string;
    address: string;
  };
};

export function AcademyPlayerScreen({
  catalog,
  pulse,
  view,
  purchasePending,
  purchaseError,
  onSelectCourse,
  onSelectLesson,
  onCompleteLesson,
  onOpenExam,
  onOpenCertificate,
  onPurchase,
  onBack,
}: {
  catalog: readonly DronAcademyCatalogItem[];
  pulse: AcademyPulseView;
  view: AcademyPlayerView;
  purchasePending: boolean;
  purchaseError: string | null;
  onSelectCourse: (courseId: string) => void;
  onSelectLesson: (lessonKey: string) => void;
  onCompleteLesson: () => void;
  onOpenExam: () => void;
  onOpenCertificate: (hash: string) => void;
  onPurchase: (body: DronAcademyPurchaseBody) => void;
  onBack: () => void;
}) {
  const copy = RAIL_IS_COPY.academy;
  if (view.kind === "idle") {
    return (
      <View testID={view.testID} style={styles.wrap}>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.body}>{copy.catalogHint}</Text>
        <PulseStrip pulse={pulse} onContinue={onSelectCourse} />
        {catalog.map((item) => (
          <Pressable
            key={item.slug}
            testID={`dron-academy-course-${item.slug}`}
            accessibilityRole="button"
            onPress={() => onSelectCourse(item.slug)}
            style={styles.row}
          >
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Text style={styles.muted}>{item.slug}</Text>
            <Text style={styles.meta}>{copy.open}</Text>
          </Pressable>
        ))}
      </View>
    );
  }
  if (view.kind === "loading") {
    return (
      <View testID={view.testID} style={styles.wrap}>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.muted}>{view.title}</Text>
      </View>
    );
  }
  if (view.kind === "error") {
    return (
      <View style={styles.wrap}>
        <HonestErrorCard
          testID={view.testID}
          title={view.title}
          message={view.message}
          requestId={view.requestId}
          onRetry={onBack}
          retryLabel={RAIL_IS_COPY.back}
        />
      </View>
    );
  }
  if (view.kind === "need_purchase") {
    return (
      <View testID={view.testID} style={styles.wrap}>
        <Text style={styles.title}>{view.title}</Text>
        <Text style={styles.body}>{view.message}</Text>
        <PurchaseFields
          pending={purchasePending}
          error={purchaseError}
          onSubmit={(billing) =>
            onPurchase({
              ...billing,
              path: "training",
            })
          }
        />
        <UiButton testID="dron-academy-purchase-back" label={RAIL_IS_COPY.back} tone="muted" onPress={onBack} />
      </View>
    );
  }
  const selected = view.lessons.find((lesson) => lesson.key === view.selectedLessonKey) ?? null;
  const punchcards = selected ? dronAcademyPunchcardsForLesson(selected.key) : [];
  const activePunchcard = dronActivePunchcard(punchcards, 0);
  return (
    <View testID={view.testID} style={styles.wrap}>
      <Text style={styles.kicker}>{view.courseSlug}</Text>
      <Text style={styles.title}>{view.courseTitle}</Text>
      <Text style={styles.muted}>
        {view.completedCount}/{view.totalCount}
      </Text>
      {view.lessons.map((lesson) => (
        <Pressable
          key={lesson.key}
          testID={`dron-academy-lesson-${lesson.key}`}
          accessibilityRole="button"
          onPress={() => onSelectLesson(lesson.key)}
          style={[styles.row, lesson.key === view.selectedLessonKey ? styles.rowActive : null]}
        >
          <Text style={styles.rowTitle}>{lesson.title}</Text>
          <Text style={styles.muted}>
            {lesson.completed ? "Tamamlandı" : lesson.open ? "Açık" : "Kilitli"}
          </Text>
        </Pressable>
      ))}
      {selected ? (
        <View testID="dron-academy-lesson-body" style={styles.article}>
          <Text style={styles.rowTitle}>{selected.title}</Text>
          {punchcards.length > 0 ? (
            <View testID="dron-academy-punchcards" style={styles.punchcards}>
              {punchcards.map((card) => {
                const active = card.id === activePunchcard?.id;
                return (
                  <Text
                    key={card.id}
                    testID={`dron-academy-punchcard-${card.id}`}
                    style={[styles.punchcard, active ? styles.punchcardActive : null]}
                  >
                    {card.label}
                  </Text>
                );
              })}
            </View>
          ) : null}
          <Text style={styles.body}>{selected.body || copy.listenHint}</Text>
          <Text style={styles.muted}>{copy.listenHint}</Text>
          {view.error ? (
            <Text testID="dron-academy-player-error-text" style={styles.error}>
              {view.error}
            </Text>
          ) : null}
          <UiButton
            testID="dron-academy-complete"
            label={view.pending ? copy.completing : copy.complete}
            disabled={view.pending || selected.completed || !selected.open}
            onPress={onCompleteLesson}
          />
        </View>
      ) : null}
      {view.curriculumComplete ? (
        <UiButton testID="dron-academy-open-exam" label={copy.examCta} onPress={onOpenExam} />
      ) : null}
      {view.certificateHash ? (
        <UiButton
          testID="dron-academy-open-certificate"
          label={RAIL_IS_COPY.exam.openCertificate}
          tone="muted"
          onPress={() => onOpenCertificate(view.certificateHash!)}
        />
      ) : null}
      <UiButton testID="dron-academy-player-back" label={RAIL_IS_COPY.back} tone="muted" onPress={onBack} />
    </View>
  );
}

function PulseStrip({
  pulse,
  onContinue,
}: {
  pulse: AcademyPulseView;
  onContinue: (courseId: string) => void;
}) {
  if (pulse.kind === "loading") {
    return (
      <Text testID={pulse.testID} style={styles.muted}>
        {pulse.title}
      </Text>
    );
  }
  if (pulse.kind === "error") {
    return (
      <HonestErrorCard
        testID={pulse.testID}
        title={pulse.title}
        message={pulse.message}
        requestId={pulse.requestId}
      />
    );
  }
  if (pulse.kind !== "ready") {
    return null;
  }
  return (
    <View testID={pulse.testID} style={styles.pulse}>
      <Text style={styles.muted}>
        Satın alma {pulse.purchasesCount} · Sertifika {pulse.certificatesHeld}
      </Text>
      {pulse.lastCourseSlug ? (
        <UiButton
          testID="dron-academy-continue"
          label={RAIL_IS_COPY.academy.continue}
          onPress={() => onContinue(pulse.lastCourseSlug!)}
        />
      ) : null}
    </View>
  );
}

function PurchaseFields({
  pending,
  error,
  onSubmit,
}: {
  pending: boolean;
  error: string | null;
  onSubmit: (body: Omit<DronAcademyPurchaseBody, "path" | "lockId">) => void;
}) {
  const copy = RAIL_IS_COPY.wallet;
  const academy = RAIL_IS_COPY.academy;
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [distance, setDistance] = useState(false);
  const [digital, setDigital] = useState(false);

  function submit() {
    if (!distance || !digital || !fullName.trim() || !phone.trim() || address.trim().length < 8) {
      return;
    }
    onSubmit({
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
    <View style={styles.wrap}>
      <TextInput
        testID="dron-academy-purchase-name"
        placeholder={copy.topUpName}
        placeholderTextColor={colors.muted}
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
        editable={!pending}
      />
      <TextInput
        testID="dron-academy-purchase-phone"
        keyboardType="phone-pad"
        placeholder={copy.topUpPhone}
        placeholderTextColor={colors.muted}
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        editable={!pending}
      />
      <TextInput
        testID="dron-academy-purchase-address"
        placeholder={copy.topUpAddress}
        placeholderTextColor={colors.muted}
        value={address}
        onChangeText={setAddress}
        style={styles.input}
        editable={!pending}
      />
      <UiButton
        testID="dron-academy-purchase-distance"
        label={copy.topUpConsentDistance}
        tone={distance ? "accent" : "muted"}
        onPress={() => setDistance((value) => !value)}
      />
      <UiButton
        testID="dron-academy-purchase-digital"
        label={copy.topUpConsentDigital}
        tone={digital ? "accent" : "muted"}
        onPress={() => setDigital((value) => !value)}
      />
      {error ? (
        <Text testID="dron-academy-purchase-error" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <UiButton
        testID="dron-academy-purchase-submit"
        label={pending ? academy.purchasing : academy.purchase}
        disabled={pending}
        onPress={submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  kicker: { color: colors.accent, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" },
  title: { color: colors.text, fontSize: 22, fontWeight: "600" },
  body: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  meta: { color: colors.accent, fontSize: 13 },
  error: { color: colors.danger, fontSize: 13 },
  pulse: { gap: 8 },
  row: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  rowActive: { borderColor: colors.accent },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: "600" },
  article: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  punchcards: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 8,
  },
  punchcard: {
    color: colors.muted,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  punchcardActive: {
    color: colors.accent,
    borderColor: colors.accent,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
