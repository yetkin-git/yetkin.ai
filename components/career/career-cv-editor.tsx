"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SmartTextarea } from "@/components/ui/smart-textarea";
import { emptyCareerCv, type CareerCvView } from "@/lib/career/cv-model";
import { TALENT_DIRECTORY_PROVINCES } from "@/lib/career/talent-directory";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

export function CareerCvEditor({
  initialCv = null,
  importText = null,
}: {
  initialCv?: CareerCvView | null;
  importText?: string | null;
}) {
  const [cv, setCv] = useState<CareerCvView>(initialCv ?? emptyCareerCv());
  const [skillsText, setSkillsText] = useState((initialCv?.skills ?? []).join(", "));
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!importText?.trim()) {
      return;
    }
    setCv((prev) => ({ ...prev, summary: importText.slice(0, 4000) }));
    setNotice("AI Koç taslağı özet alanına aktarıldı. Kaydetmeyi unutma.");
  }, [importText]);

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      const skills = skillsText
        .split(",")
        .map((row) => row.trim())
        .filter(Boolean)
        .slice(0, 40);
      const response = await fetch(
        "/api/career/cv",
        withRailApiVersion({
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            fullName: cv.fullName,
            headline: cv.headline,
            city: cv.city,
            summary: cv.summary,
            experiences: cv.experiences,
            educations: cv.educations,
            skills,
            languages: cv.languages,
            links: cv.links,
            contactOptIn: cv.contactOptIn,
          }),
        }),
      );
      const parsed = parseRailClientJson<{ cv: CareerCvView }>(await response.json().catch(() => null));
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }
      setCv(parsed.data.cv);
      setSkillsText(parsed.data.cv.skills.join(", "));
      setNotice("CV kaydedildi.");
    } catch {
      setError("CV kaydedilemedi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card eyebrow="YetkinCV" title="YetkinCV stüdyosu">
      <form className="space-y-3" onSubmit={(event) => void onSave(event)}>
        <p className="text-sm text-[var(--muted)]">
          Başlık, şehir, özet ve yetkinlik etiketlerini kaydet. PDF/DOCX buradan iner. İl filtresi şehir
          alanını okur.
        </p>
        <Input
          value={cv.fullName}
          onChange={(event) => setCv((prev) => ({ ...prev, fullName: event.target.value }))}
          placeholder="Ad Soyad"
          maxLength={120}
          required
        />
        <Input
          value={cv.headline}
          onChange={(event) => setCv((prev) => ({ ...prev, headline: event.target.value }))}
          placeholder="Başlık / hedef rol"
          maxLength={200}
        />
        <label className="block text-sm text-[var(--muted)]">
          Şehir
          <select
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            value={cv.city}
            onChange={(event) => setCv((prev) => ({ ...prev, city: event.target.value }))}
          >
            <option value="">Seçilmedi</option>
            {TALENT_DIRECTORY_PROVINCES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
        <SmartTextarea
          value={cv.summary}
          onChange={(event) => setCv((prev) => ({ ...prev, summary: event.target.value }))}
          placeholder="Özet (en fazla 4000 karakter)"
          maxLength={4000}
          rows={6}
        />
        <Input
          value={skillsText}
          onChange={(event) => setSkillsText(event.target.value)}
          placeholder="Yetkinlik etiketleri (virgülle)"
          maxLength={800}
        />
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={cv.contactOptIn}
            onChange={(event) => setCv((prev) => ({ ...prev, contactOptIn: event.target.checked }))}
          />
          Kamu kartında iletişim talebi formuna izin ver (KVKK)
        </label>
        {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
        {notice ? <p className="text-sm text-[var(--emerald)]">{notice}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending} size="sm">
            {pending ? "Kaydediliyor…" : "CV'yi kaydet"}
          </Button>
          <a
            className="inline-flex items-center rounded-md border border-[var(--border)] px-3 py-1.5 text-sm"
            href="/api/career/cv/export?format=pdf"
          >
            PDF İndir
          </a>
          <a
            className="inline-flex items-center rounded-md border border-[var(--border)] px-3 py-1.5 text-sm"
            href="/api/career/cv/export?format=docx"
          >
            DOCX İndir
          </a>
        </div>
      </form>
    </Card>
  );
}
