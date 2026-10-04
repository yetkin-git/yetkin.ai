"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  JUNIOR_BADGE_LABELS,
  JUNIOR_GRADE_MAX,
  JUNIOR_GRADE_MIN,
  JUNIOR_PILOT_GRADE,
  JUNIOR_PROFILES_PATH,
  juniorBirthYearChoices,
  juniorDefaultBirthYear,
} from "@/lib/junior/limits";
import type { JuniorProfileView, JuniorXpView } from "@/lib/junior/types";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type Envelope = { ok?: boolean; error?: string | null };

async function readError(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as Envelope | null;
  return body?.error || "İşlem tamamlanamadı.";
}

export function ProfileSwitcher({
  profiles,
  xp,
  ready,
}: {
  profiles: JuniorProfileView[];
  xp: JuniorXpView;
  ready: boolean;
}) {
  const router = useRouter();
  const years = juniorBirthYearChoices();
  const [nickname, setNickname] = useState("");
  const [grade, setGrade] = useState(String(JUNIOR_PILOT_GRADE));
  const [birthYear, setBirthYear] = useState(String(juniorDefaultBirthYear()));
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    if (!consent || pending) {
      setError("Veli onayı olmadan profil açılmaz.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch(
        JUNIOR_PROFILES_PATH,
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            nickname,
            grade: Number(grade),
            birthYear: Number(birthYear),
            consent: true,
          }),
        }),
      );
      if (!response.ok) {
        setError(await readError(response));
        return;
      }
      setNickname("");
      setConsent(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function onSelect(profileId: string) {
    setError("");
    const response = await fetch(
      JUNIOR_PROFILES_PATH,
      withRailApiVersion({
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profileId }),
      }),
    );
    if (!response.ok) {
      setError(await readError(response));
      return;
    }
    router.refresh();
  }

  const badgeLine = xp.badges
    .map((badge) => JUNIOR_BADGE_LABELS[badge as keyof typeof JUNIOR_BADGE_LABELS] ?? badge)
    .join(" · ");

  return (
    <section className="junior-shield-card rounded-[1.6rem] border border-[var(--border)] p-4 shadow-[var(--shadow-card)]">
      <h2 className="text-lg font-semibold">Çocuk profili</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Hesap senindir. Çocuğun ayrı e-postası yok. Buradaki puan cüzdan değildir.
      </p>
      {profiles.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              type="button"
              onClick={() => void onSelect(profile.id)}
              className={
                profile.selected
                  ? "rounded-full bg-[var(--safir)] px-4 py-2 text-sm font-semibold text-white"
                  : "rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-semibold"
              }
            >
              {profile.nickname} · {profile.grade}. sınıf
            </button>
          ))}
        </div>
      ) : null}
      <p className="mt-3 text-sm">
        Oyun puanı: <strong>{xp.points}</strong>
        {badgeLine ? <span className="text-[var(--muted)]"> · {badgeLine}</span> : null}
      </p>
      {ready ? (
        <form onSubmit={onCreate} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Takma ad
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              maxLength={20}
              placeholder="Örneğin Ege"
              className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-white px-3 py-2"
              required
            />
          </label>
          <label className="text-sm font-medium">
            Sınıf
            <select
              value={grade}
              onChange={(event) => setGrade(event.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-white px-3 py-2"
            >
              {Array.from({ length: JUNIOR_GRADE_MAX - JUNIOR_GRADE_MIN + 1 }, (_, index) => {
                const value = JUNIOR_GRADE_MIN + index;
                return (
                  <option key={value} value={value}>
                    {value}. sınıf
                  </option>
                );
              })}
            </select>
          </label>
          <label className="text-sm font-medium">
            Doğum yılı
            <select
              value={birthYear}
              onChange={(event) => setBirthYear(event.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-white px-3 py-2"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-start gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-1"
            />
            <span>Bu profili ben, veli olarak açıyorum. Çocuğun sesi saklanmaz. Ders, onay olmadan açılmaz.</span>
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending || !consent}>
              {pending ? "Kaydediliyor" : "Profili ekle"}
            </Button>
          </div>
        </form>
      ) : null}
      {error ? <p className="mt-3 text-sm text-[var(--rose)]">{error}</p> : null}
    </section>
  );
}
