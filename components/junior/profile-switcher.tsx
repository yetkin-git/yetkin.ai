"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  JUNIOR_GUARDIAN_NOTICE_HREF,
  JUNIOR_GUARDIAN_NOTICE_TITLE,
} from "@/lib/copy/junior-guardian-notice";
import { JUNIOR_GUARDIAN_NOTICE, guardianBirthYearBounds } from "@/lib/junior/guardian-notice";
import {
  JUNIOR_BADGE_LABELS,
  JUNIOR_PILOT_GRADE,
  JUNIOR_PILOT_SHELF_LINE,
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
  planActive = false,
  gradeSwitchRights = 0,
}: {
  profiles: JuniorProfileView[];
  xp: JuniorXpView;
  ready: boolean;
  planActive?: boolean;
  gradeSwitchRights?: number;
}) {
  const router = useRouter();
  const years = juniorBirthYearChoices();
  const selected = profiles.find((profile) => profile.selected) ?? profiles[0] ?? null;
  const [open, setOpen] = useState(profiles.length === 0);
  const [nickname, setNickname] = useState("");
  const [birthYear, setBirthYear] = useState(String(juniorDefaultBirthYear()));
  const [consent, setConsent] = useState(false);
  const guardianYears = useMemo(() => {
    const bounds = guardianBirthYearBounds();
    const years: number[] = [];
    for (let year = bounds.max; year >= bounds.min; year -= 1) {
      years.push(year);
    }
    return years;
  }, []);
  const [guardianYear, setGuardianYear] = useState(String(new Date().getFullYear() - 30));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const showForm = ready && (profiles.length === 0 || open);

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
            grade: JUNIOR_PILOT_GRADE,
            birthYear: Number(birthYear),
            consent: true,
            consentVersion: JUNIOR_GUARDIAN_NOTICE.version,
            guardianBirthYear: Number(guardianYear),
          }),
        }),
      );
      if (!response.ok) {
        setError(await readError(response));
        return;
      }
      setNickname("");
      setConsent(false);
      setOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function onRenew(event: FormEvent) {
    event.preventDefault();
    if (!selected || !consent || pending) {
      setError("Veli onayı olmadan ders açılmaz.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch(
        JUNIOR_PROFILES_PATH,
        withRailApiVersion({
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            profileId: selected.id,
            consent: true,
            consentVersion: JUNIOR_GUARDIAN_NOTICE.version,
            guardianBirthYear: Number(guardianYear),
          }),
        }),
      );
      if (!response.ok) {
        setError(await readError(response));
        return;
      }
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
    setOpen(false);
    router.refresh();
  }

  const badgeLine = xp.badges
    .map((badge) => JUNIOR_BADGE_LABELS[badge as keyof typeof JUNIOR_BADGE_LABELS] ?? badge)
    .join(" · ");

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const profileForm = (
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
          value={String(JUNIOR_PILOT_GRADE)}
          disabled
          className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-white px-3 py-2"
        >
          <option value={String(JUNIOR_PILOT_GRADE)}>6. sınıf</option>
        </select>
      </label>
      <p className="text-sm text-[var(--muted)] sm:col-span-2">{JUNIOR_PILOT_SHELF_LINE}</p>
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
      <label className="text-sm font-medium sm:col-span-2">
        Veli doğum yılı
        <select
          value={guardianYear}
          onChange={(event) => setGuardianYear(event.target.value)}
          className="mt-1 w-full rounded-xl border border-[var(--border-strong)] bg-white px-3 py-2"
        >
          {guardianYears.map((year) => (
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
        <span>
          <Link href={JUNIOR_GUARDIAN_NOTICE_HREF} className="font-semibold text-[var(--safir-deep)] hover:underline">
            {JUNIOR_GUARDIAN_NOTICE_TITLE}
          </Link>
          {" metnini okudum. Bu profili ben, veli olarak açıyorum. Çocuğun sesi saklanmaz. Ders, onay olmadan açılmaz."}
        </span>
      </label>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending || !consent}>
          {pending ? "Kaydediliyor" : "Profili ekle"}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={selected ? `${selected.nickname} - ${selected.grade}. Sınıf` : "Profil ekle"}
        title="Profili değiştir veya ekle"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1.5 rounded-full bg-[var(--safir-soft)] px-3 py-1.5 text-sm font-semibold text-[var(--safir-deep)]"
      >
        {selected ? `${selected.nickname} - ${selected.grade}. Sınıf` : "Profil ekle"}
        <span aria-hidden className="text-[10px]">{open ? "▴" : "▾"}</span>
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label="Öğrenci profili"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-30 grid w-[min(36rem,calc(100vw-2rem))] gap-4 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-card)]"
        >
          <p className="text-sm">
            Oyun Puanı: <strong>{xp.points}</strong>
            {badgeLine ? <span className="text-[var(--muted)]"> · {badgeLine}</span> : null}
          </p>
          <p className="text-sm text-[var(--muted)]">
            Hesap senindir. Çocuğun ayrı e-postası yok. Buradaki puan cüzdan değildir.
          </p>
          <p className="text-sm text-[var(--muted)]">
            {JUNIOR_PILOT_SHELF_LINE}
            {planActive || gradeSwitchRights >= 0
              ? " Paket ve sınıf hakkı, raftaki metni başka sınıfa çevirmez."
              : ""}
          </p>
          {selected ? (
            <div>
              <h2 className="text-base font-semibold">Profil değiştir veya ekle</h2>
              <div className="mt-3 flex flex-wrap gap-2">
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
            </div>
          ) : null}
          {selected ? (
            <form onSubmit={onRenew} className="grid gap-2 text-sm">
              <p className="text-[var(--muted)]">
                Eski profilde ders açılmazsa yürürlükteki aydınlatmayı yeniden onayla.
              </p>
              <Button type="submit" variant="outline" disabled={pending || !consent}>
                Aydınlatmayı bu profile işle
              </Button>
            </form>
          ) : null}
          {showForm ? profileForm : null}
          {!showForm && !selected ? (
            <p className="text-sm text-[var(--muted)]">Profil kaydı şu an yazılamıyor.</p>
          ) : null}
          {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
