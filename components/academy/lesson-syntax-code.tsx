import { tokenizeAcademySyntax } from "@/lib/academy/syntax-highlight";

export function LessonSyntaxCode({
  source,
  language,
}: {
  source: string;
  language: string;
}) {
  const tokens = tokenizeAcademySyntax(source, language);
  return (
    <code className="academy-player-syntax" data-academy-syntax-lang={language}>
      {tokens.map((token, index) =>
        token.kind === "plain" ? (
          token.value
        ) : (
          <span key={`${index}:${token.kind}`} className={`academy-syntax-${token.kind}`}>
            {token.value}
          </span>
        ),
      )}
    </code>
  );
}
