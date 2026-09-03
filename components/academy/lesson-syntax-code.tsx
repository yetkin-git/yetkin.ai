"use client";

import { useEffect, useRef } from "react";
import { tokenizeAcademySyntax } from "@/lib/academy/syntax-highlight";

export function LessonSyntaxCode({
  source,
  language,
  activeLine = null,
}: {
  source: string;
  language: string;
  activeLine?: number | null;
}) {
  const activeRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeLine, source]);

  const lines = source.split("\n");
  return (
    <code className="academy-player-syntax" data-academy-syntax-lang={language}>
      {lines.map((line, index) => {
        const tokens = tokenizeAcademySyntax(line, language);
        const active = activeLine === index;
        return (
          <span
            key={`line:${index}`}
            ref={active ? activeRef : undefined}
            className={active ? "academy-syntax-line academy-syntax-line-active" : "academy-syntax-line"}
            data-academy-code-line={index}
            data-academy-code-line-active={active ? "true" : undefined}
          >
            {tokens.map((token, tokenIndex) =>
              token.kind === "plain" ? (
                token.value
              ) : (
                <span key={`${index}:${tokenIndex}:${token.kind}`} className={`academy-syntax-${token.kind}`}>
                  {token.value}
                </span>
              ),
            )}
            {index < lines.length - 1 ? "\n" : null}
          </span>
        );
      })}
    </code>
  );
}
