"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { academyVerifyPath, isAcademyVerifyHash } from "@/lib/academy/lesson-note-paths";

export function CertificateVerifyForm() {
  const copy = ACADEMY_SEN.verify;
  const router = useRouter();
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const hash = raw.trim().toLowerCase();
    if (!isAcademyVerifyHash(hash)) {
      setError(copy.invalidFormat);
      return;
    }
    setError(null);
    router.push(academyVerifyPath(hash) as Route);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Label>
        {copy.hashFieldLabel}
        <Input
          value={raw}
          onChange={(event) => {
            setRaw(event.target.value);
            if (error) {
              setError(null);
            }
          }}
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          maxLength={80}
          placeholder={copy.hashPlaceholder}
          aria-invalid={Boolean(error)}
        />
      </Label>
      {error ? (
        <p role="alert" className="text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="sm">
        {copy.submitCta}
      </Button>
    </form>
  );
}
