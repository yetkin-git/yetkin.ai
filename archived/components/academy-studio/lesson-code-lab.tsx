"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { IconCopy } from "@/components/ui/icons";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import {
  academyLabLanguageLabel,
  runAcademyLabSource,
  type AcademyLabRunResult,
  type AcademyLabSource,
} from "@/archived/lib/academy-studio/lesson-code-lab-run";

export function LessonCodeLab({
  lessonKey,
  seed,
}: {
  lessonKey: string;
  seed: AcademyLabSource | null;
}) {
  const copy = ACADEMY_SEN.player;
  const [source, setSource] = useState(seed?.source ?? "");
  const [stdin, setStdin] = useState("");
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<AcademyLabRunResult | null>(null);
  const language = seed?.language ?? "kod";
  const needsStdin = useMemo(() => /\binput\s*\(/u.test(source), [source]);

  useEffect(() => {
    setSource(seed?.source ?? "");
    setStdin("");
    setCopied(false);
    setResult(null);
  }, [lessonKey, seed?.source]);

  if (!seed) {
    return (
      <section className="academy-code-lab" data-academy-code-lab="">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          {copy.labEyebrow}
        </p>
        <p className="mt-3 text-[15px] text-[var(--muted)]">{copy.labEmpty}</p>
      </section>
    );
  }

  function onRun() {
    setResult(runAcademyLabSource(language, source, stdin));
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setResult({
        ok: false,
        kind: "error",
        stdout: "",
        stderr: copy.labCopyFail,
      });
    }
  }

  return (
    <section className="academy-code-lab" data-academy-code-lab="">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          {copy.labEyebrow}
          <span className="ml-2 font-mono lowercase tracking-[0.08em]">{academyLabLanguageLabel(language)}</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant="ghost" className="min-h-9 rounded-full px-3 text-[13px]" onClick={onCopy}>
            <IconCopy className="mr-1.5 h-3.5 w-3.5" />
            {copied ? copy.labCopied : copy.labCopy}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="min-h-9 rounded-full px-3 text-[13px]"
            onClick={() => {
              setSource(seed.source);
              setResult(null);
            }}
          >
            {copy.labReset}
          </Button>
          <Button type="button" size="sm" className="min-h-9 rounded-full px-4 text-[13px]" onClick={onRun}>
            {copy.labRun}
          </Button>
        </div>
      </div>
      <textarea
        className="academy-code-lab-editor mt-3 font-mono"
        spellCheck={false}
        value={source}
        aria-label={copy.labEyebrow}
        onChange={(event) => setSource(event.target.value)}
      />
      {needsStdin ? (
        <label className="mt-3 block text-[12px] text-[var(--muted)]">
          {copy.labStdin}
          <span className="ml-2 font-normal">{copy.labStdinHint}</span>
          <textarea
            className="academy-code-lab-stdin mt-1.5 font-mono"
            spellCheck={false}
            value={stdin}
            onChange={(event) => setStdin(event.target.value)}
          />
        </label>
      ) : null}
      {result ? (
        <pre
          className={`academy-code-lab-output mt-3 font-mono ${result.ok ? "" : "academy-code-lab-output--error"}`}
          data-academy-code-lab-output=""
          data-lab-kind={result.kind}
        >
          {result.stdout ? `${copy.labOutput}\n${result.stdout}` : null}
          {result.stdout && result.stderr ? "\n" : null}
          {result.stderr}
        </pre>
      ) : null}
    </section>
  );
}
