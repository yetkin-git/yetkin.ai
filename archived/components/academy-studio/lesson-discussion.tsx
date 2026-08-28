"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LinkButton } from "@/components/ui/link-button";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { isAcademyCitizenTextClean } from "@/archived/lib/academy-studio/moderation";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";
import type { Route } from "next";

type DiscussionItem = {
  id: string;
  kind: "review" | "comment";
  stars: number | null;
  body: string;
  authorLabel: string;
  createdAt: string;
  reply: string | null;
};

function asDiscussionItems(value: unknown): DiscussionItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const items: DiscussionItem[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object") {
      continue;
    }
    const record = row as Record<string, unknown>;
    if (typeof record.id !== "string" || typeof record.body !== "string") {
      continue;
    }
    items.push({
      id: record.id,
      kind: record.kind === "review" ? "review" : "comment",
      stars: typeof record.stars === "number" ? record.stars : null,
      body: record.body,
      authorLabel: typeof record.authorLabel === "string" ? record.authorLabel : "Katılımcı",
      createdAt: typeof record.createdAt === "string" ? record.createdAt : "",
      reply: typeof record.reply === "string" ? record.reply : null,
    });
  }
  return items;
}

export function LessonDiscussion({
  courseId,
  courseSlug,
  lessonKey,
  canWrite,
}: {
  courseId: string;
  courseSlug: string;
  lessonKey: string;
  canWrite: boolean;
}) {
  const copy = ACADEMY_SEN.player;
  const reviewCopy = ACADEMY_SEN.review;
  const [items, setItems] = useState<DiscussionItem[]>([]);
  const [writeOpen, setWriteOpen] = useState(canWrite);
  const [body, setBody] = useState("");
  const [stars, setStars] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setWriteOpen(canWrite);
  }, [canWrite]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const response = await fetch(
        `/api/academy/discussion?courseId=${encodeURIComponent(courseId)}&lessonKey=${encodeURIComponent(lessonKey)}`,
        withRailApiVersion({ method: "GET" }),
      );
      const envelope = await readCitizenEnvelope(response);
      if (cancelled || !envelope.ok) {
        return;
      }
      setItems(asDiscussionItems(envelope.body.items));
      if (!canWrite && envelope.body.canWrite === true) {
        setWriteOpen(true);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [canWrite, courseId, lessonKey]);

  async function onSubmit() {
    setPending(true);
    setError(null);
    if (!isAcademyCitizenTextClean(body)) {
      setPending(false);
      setError(reviewCopy.policyReject);
      return;
    }
    try {
      if (stars != null) {
        const reviewResponse = await fetch(
          "/api/academy/reviews",
          withRailApiVersion({
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              courseId,
              lessonKey,
              stars,
              comment: body,
            }),
          }),
        );
        const reviewEnvelope = await readCitizenEnvelope(reviewResponse);
        if (!reviewEnvelope.ok) {
          setPending(false);
          setError(reviewEnvelope.error || copy.discussionFail);
          return;
        }
      } else {
        const response = await fetch(
          "/api/academy/discussion",
          withRailApiVersion({
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ courseId, lessonKey, body }),
          }),
        );
        const envelope = await readCitizenEnvelope(response);
        if (!envelope.ok) {
          setPending(false);
          setError(envelope.error || copy.discussionFail);
          return;
        }
      }
      setBody("");
      setStars(null);
      const refresh = await fetch(
        `/api/academy/discussion?courseId=${encodeURIComponent(courseId)}&lessonKey=${encodeURIComponent(lessonKey)}`,
        withRailApiVersion({ method: "GET" }),
      );
      const refreshed = await readCitizenEnvelope(refresh);
      setPending(false);
      if (refreshed.ok) {
        setItems(asDiscussionItems(refreshed.body.items));
      }
    } catch {
      setPending(false);
      setError(UX_SEN.http.network);
    }
  }

  return (
    <section className="academy-lesson-discussion mt-8 space-y-4" data-academy-lesson-discussion="">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="px-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)] sm:px-0">
          {copy.discussionEyebrow}
        </p>
        <p className="text-[12px] text-[var(--muted)]">{copy.discussionCount(items.length)}</p>
      </div>
      {writeOpen ? (
        <form
          className="space-y-3 rounded-2xl border border-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-4 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit();
          }}
        >
          <div className="flex flex-wrap gap-1" role="radiogroup" aria-label={reviewCopy.stars(stars ?? 0)}>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={stars === value}
                onClick={() => setStars((current) => (current === value ? null : value))}
                className={`h-9 w-9 rounded-full text-sm font-semibold ${
                  stars != null && value <= stars
                    ? "bg-[var(--gold-soft)] text-[var(--gold)]"
                    : "bg-[var(--surface-muted)] text-[var(--muted)]"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <label className="block space-y-1 text-sm text-[var(--foreground)]">
            <span>{reviewCopy.commentLabel}</span>
            <Textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={copy.discussionPlaceholder}
              rows={3}
              maxLength={800}
            />
          </label>
          {error ? (
            <p aria-live="assertive" className="text-sm text-[var(--rose)]">
              {error}
            </p>
          ) : null}
          <Button type="submit" size="sm" disabled={pending || body.trim().length === 0}>
            {pending ? copy.discussionPending : copy.discussionSubmit}
          </Button>
        </form>
      ) : (
        <div className="space-y-2 text-[14px] leading-6 text-[var(--muted)]">
          <p>{copy.discussionLocked}</p>
          <LinkButton href={`/academy/${courseSlug}` as Route} variant="outline" size="sm">
            {ACADEMY_SEN.player.catalogCta}
          </LinkButton>
        </div>
      )}
      {items.length === 0 ? (
        <p className="text-[14px] leading-6 text-[var(--muted)]">{copy.discussionEmpty}</p>
      ) : (
        <ol className="space-y-3">
          {items.map((item) => (
            <li
              key={`${item.kind}:${item.id}`}
              className="rounded-2xl border border-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-4 py-3"
            >
              <p className="text-[12px] text-[var(--muted)]">
                {item.authorLabel}
                {item.stars != null ? ` · ${reviewCopy.stars(item.stars)}` : ""}
              </p>
              <p className="mt-1 text-[15px] leading-6 text-[var(--foreground)]">{item.body}</p>
              {item.reply ? (
                <p className="mt-2 text-[13px] leading-6 text-[var(--muted)]">{item.reply}</p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
