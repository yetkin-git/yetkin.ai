export type AcademySyntaxTokenKind =
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "function"
  | "plain";

export type AcademySyntaxToken = {
  kind: AcademySyntaxTokenKind;
  value: string;
};

const PYTHON_KEYWORDS = new Set([
  "and",
  "as",
  "assert",
  "async",
  "await",
  "break",
  "class",
  "continue",
  "def",
  "del",
  "elif",
  "else",
  "except",
  "False",
  "finally",
  "for",
  "from",
  "global",
  "if",
  "import",
  "in",
  "is",
  "lambda",
  "None",
  "nonlocal",
  "not",
  "or",
  "pass",
  "raise",
  "return",
  "True",
  "try",
  "while",
  "with",
  "yield",
]);

const TS_KEYWORDS = new Set([
  "as",
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "from",
  "function",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "let",
  "new",
  "null",
  "of",
  "private",
  "protected",
  "public",
  "readonly",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "type",
  "typeof",
  "undefined",
  "var",
  "void",
  "while",
  "with",
  "yield",
]);

function isIdentStart(ch: string): boolean {
  return /[A-Za-z_$]/.test(ch);
}

function isIdentPart(ch: string): boolean {
  return /[A-Za-z0-9_$]/.test(ch);
}

function isDigit(ch: string): boolean {
  return ch >= "0" && ch <= "9";
}

function keywordsFor(language: string): Set<string> {
  const lang = language.trim().toLowerCase();
  if (lang === "py" || lang === "python") {
    return PYTHON_KEYWORDS;
  }
  return TS_KEYWORDS;
}

function scanString(source: string, start: number): number {
  const quote = source[start]!;
  const triple = source.slice(start, start + 3) === quote.repeat(3);
  let index = start + (triple ? 3 : 1);
  while (index < source.length) {
    const ch = source[index]!;
    if (ch === "\\" && !triple) {
      index += 2;
      continue;
    }
    if (triple && source.slice(index, index + 3) === quote.repeat(3)) {
      return index + 3;
    }
    if (!triple && ch === quote) {
      return index + 1;
    }
    index += 1;
  }
  return source.length;
}

function scanLineComment(source: string, start: number): number {
  let index = start;
  while (index < source.length && source[index] !== "\n") {
    index += 1;
  }
  return index;
}

function scanBlockComment(source: string, start: number): number {
  const close = source.indexOf("*/", start + 2);
  return close === -1 ? source.length : close + 2;
}

function lookIdent(source: string, start: number): string {
  let index = start;
  while (index < source.length && isIdentPart(source[index]!)) {
    index += 1;
  }
  return source.slice(start, index);
}

function nextNonSpace(source: string, start: number): string {
  let index = start;
  while (index < source.length && /\s/.test(source[index]!)) {
    index += 1;
  }
  return source[index] ?? "";
}

export function tokenizeAcademySyntax(source: string, language: string): AcademySyntaxToken[] {
  const keywords = keywordsFor(language);
  const lang = language.trim().toLowerCase();
  const python = lang === "py" || lang === "python";
  const tokens: AcademySyntaxToken[] = [];
  let index = 0;
  let plain = "";

  function flushPlain() {
    if (!plain) {
      return;
    }
    tokens.push({ kind: "plain", value: plain });
    plain = "";
  }

  function push(kind: AcademySyntaxTokenKind, value: string) {
    if (!value) {
      return;
    }
    flushPlain();
    tokens.push({ kind, value });
  }

  while (index < source.length) {
    const ch = source[index]!;
    const next = source[index + 1] ?? "";

    if (python && ch === "#") {
      const end = scanLineComment(source, index);
      push("comment", source.slice(index, end));
      index = end;
      continue;
    }
    if (!python && ch === "/" && next === "/") {
      const end = scanLineComment(source, index);
      push("comment", source.slice(index, end));
      index = end;
      continue;
    }
    if (!python && ch === "/" && next === "*") {
      const end = scanBlockComment(source, index);
      push("comment", source.slice(index, end));
      index = end;
      continue;
    }
    if (ch === "'" || ch === '"' || (!python && ch === "`")) {
      const end = scanString(source, index);
      push("string", source.slice(index, end));
      index = end;
      continue;
    }
    if (isDigit(ch)) {
      let end = index + 1;
      while (end < source.length && /[0-9_.]/.test(source[end]!)) {
        end += 1;
      }
      push("number", source.slice(index, end));
      index = end;
      continue;
    }
    if (isIdentStart(ch)) {
      const ident = lookIdent(source, index);
      if (keywords.has(ident)) {
        push("keyword", ident);
      } else if (nextNonSpace(source, index + ident.length) === "(") {
        push("function", ident);
      } else {
        plain += ident;
      }
      index += ident.length;
      continue;
    }
    plain += ch;
    index += 1;
  }
  flushPlain();
  return tokens;
}
