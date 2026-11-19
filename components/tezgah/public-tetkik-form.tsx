"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Button } from "@/components/ui/button";
import { IconArrow, IconSearch } from "@/components/ui/icons";
import { INPUT_SURFACE_CLASS } from "@/components/ui/input";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

const CRITERIA = [
  { label: "SEO uyumu", tone: "bg-blue-50 text-blue-700" },
  { label: "İkna gücü", tone: "bg-emerald-50 text-emerald-700" },
  { label: "Dönüşüm", tone: "bg-amber-50 text-amber-700" },
] as const;

export function PublicTetkikForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch(
        "/api/tezgah/tetkik/publish",
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url }),
        }),
      );
      const body = (await response.json()) as {
        ok?: boolean;
        error?: string;
        data?: { path?: string };
      };
      const path = body.data?.path;
      if (!response.ok || body.ok === false || typeof path !== "string" || !path.startsWith("/tetkik/")) {
        setError(typeof body.error === "string" ? body.error : "Skor uydurulmadı.");
        return;
      }
      router.push(path as Route);
    } catch {
      setError("Site okunamadı. Skor uydurulmadı.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="relative mt-8 space-y-4">
      <label className="block text-sm font-medium" htmlFor="tetkik-url">
        <span className="inline-flex items-center gap-1.5">
          <IconSearch className="h-3.5 w-3.5 text-blue-600" />
          Site adresi
        </span>
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          id="tetkik-url"
          name="url"
          type="url"
          required
          inputMode="url"
          autoComplete="url"
          placeholder="https://ornek.com"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className={`${INPUT_SURFACE_CLASS} min-h-14 px-4 text-lg`}
        />
        <Button
          type="submit"
          disabled={pending}
          size="lg"
          className="min-h-14 shrink-0 !bg-[var(--safir)] px-6 !text-white shadow-lg hover:!bg-[var(--safir-deep)] disabled:opacity-70"
        >
          {pending ? "Ölçülüyor" : "Analizi Başlat"}
          <IconArrow className="h-4 w-4" />
        </Button>
      </div>
      <ul className="flex flex-wrap gap-2">
        {CRITERIA.map((item) => (
          <li
            key={item.label}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${item.tone}`}
          >
            {item.label}
          </li>
        ))}
      </ul>
      <p className="text-sm leading-6 text-slate-600">
        Sitenizin SEO uyumunu, ikna gücünü ve satışa dönüşüm performansını derinlemesine analiz eder; eksiklerinizi
        hazır çözümlerle sunar.
      </p>
      {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
    </form>
  );
}
