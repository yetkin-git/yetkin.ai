import { evaluateJuniorAge } from "@/lib/junior/age-gate";

export type MebTrackBand = "ortaokul" | "lise";

export type MebTrack = {
  key: string;
  band: MebTrackBand;
  title: string;
  summary: string;
  minAge: number;
  maxAge: number;
};

/** MEB odaklı dar katalog — tam LMS / sınav motoru değildir. */
export const MEB_TRACKS: readonly MebTrack[] = [
  {
    key: "meb-ortaokul-beceri",
    band: "ortaokul",
    title: "Ortaokul beceri izi",
    summary: "5–8. sınıf: temel dijital okuryazarlık, problem çözme, güvenli paylaşım.",
    minAge: 10,
    maxAge: 13,
  },
  {
    key: "meb-lise-yetenek",
    band: "lise",
    title: "Lise yetenek izi",
    summary: "9–12. sınıf: proje disiplini, meslek keşfi, mühürlü kanıt alıştırması.",
    minAge: 14,
    maxAge: 17,
  },
] as const;

export function mebTrackForAge(dateOfBirthIso: string, now = new Date()): MebTrack {
  const { years } = evaluateJuniorAge(dateOfBirthIso, now);
  const track = MEB_TRACKS.find((row) => years >= row.minAge && years <= row.maxAge);
  if (!track) {
    throw new Error("Bu yaş için MEB izi yok.");
  }
  return track;
}

export function listMebTracksForAge(dateOfBirthIso: string, now = new Date()): MebTrack[] {
  const { years, isEligibleMinor } = evaluateJuniorAge(dateOfBirthIso, now);
  if (!isEligibleMinor) {
    return [];
  }
  return MEB_TRACKS.filter((row) => years >= row.minAge && years <= row.maxAge);
}
