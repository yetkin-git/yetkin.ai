/**
 * Ders kod laboratuvarı — tarayıcıda canlı deneme.
 * Harici kütüphane (pandas, FastAPI) yoksa dürüst önizleme basılır;
 * üretim API’si ve gümrük çağrılmaz.
 */

import type { AcademyLessonBlock } from "@/lib/academy/lesson-media";
import type { AcademyLessonPractice } from "@/lib/academy/lesson-body";

export type AcademyLabRunKind = "ran" | "json" | "preview" | "error";

export type AcademyLabRunResult = {
  ok: boolean;
  kind: AcademyLabRunKind;
  stdout: string;
  stderr: string;
};

export type AcademyLabSource = {
  language: string;
  source: string;
};

const HOST_IMPORT =
  /\b(?:import\s+(?:pandas|fastapi|pydantic|sqlite3|sqlalchemy|numpy|flask)|from\s+(?:pandas|fastapi|pydantic|pathlib|sqlalchemy)\s+import)\b/u;

const JS_HOST = /\b(?:fetch\s*\(|document\.|window\.|localStorage|button\.|status\.|req\.|res\.|schema\.safeParse)/u;

export function academyLabLanguageLabel(language: string): string {
  const key = language.trim().toLowerCase();
  if (key === "py" || key === "python") {
    return "python";
  }
  if (key === "ts" || key === "typescript") {
    return "typescript";
  }
  if (key === "tsx") {
    return "tsx";
  }
  if (key === "js" || key === "javascript") {
    return "javascript";
  }
  if (key === "json") {
    return "json";
  }
  if (key === "http") {
    return "http";
  }
  return key || "kod";
}

export function pickAcademyLabSource(input: {
  blocks: readonly AcademyLessonBlock[];
  practice?: AcademyLessonPractice | null;
}): AcademyLabSource | null {
  const code = input.blocks.find((block) => block.kind === "code");
  if (code && code.kind === "code" && code.source.trim()) {
    return { language: code.language, source: code.source };
  }
  const practice = input.practice?.code;
  if (practice && practice.source.trim()) {
    return { language: practice.language, source: practice.source };
  }
  return null;
}

export function extractAcademyLabCommentHints(source: string): string {
  const hints: string[] = [];
  for (const line of source.split(/\r?\n/u)) {
    const match = line.match(/#\s*(?:Beklenen çıktı:\s*)?(.+?)\s*$/u);
    if (!match) {
      continue;
    }
    const body = line.replace(/#.*$/u, "").trim();
    const note = match[1]?.trim() ?? "";
    if (!body && note && !/^sepet\[/u.test(note) && !/→|-->/u.test(note)) {
      hints.push(note);
    }
    if (/Beklenen çıktı/iu.test(line) && note) {
      hints.push(note.replace(/^Beklenen çıktı:\s*/iu, ""));
    }
  }
  return hints.join("\n");
}

export function runAcademyLabSource(
  language: string,
  source: string,
  stdin = "",
): AcademyLabRunResult {
  const lang = academyLabLanguageLabel(language);
  const trimmed = source.replace(/\r\n/g, "\n").trim();
  if (!trimmed) {
    return { ok: false, kind: "error", stdout: "", stderr: "Çalıştırılacak kod yok." };
  }
  if (lang === "json") {
    return runJson(trimmed);
  }
  if (lang === "http") {
    return {
      ok: true,
      kind: "preview",
      stdout: trimmed,
      stderr: "HTTP örneği tarayıcı laboratuvarında ağ çağrısı yapmaz. İmzayı oku, kopyala, kendi kapında dene.",
    };
  }
  if (lang === "tsx") {
    return previewOnly(trimmed, "TSX tarayıcı laboratuvarında derlenmez. Kopyala, kendi Next odanda dene.");
  }
  if (lang === "python") {
    return runPythonSubset(trimmed, stdin);
  }
  if (lang === "javascript" || lang === "typescript") {
    return runJsSubset(trimmed, lang === "typescript");
  }
  return previewOnly(trimmed, "Bu dil laboratuvarda çalıştırılmaz. Kopyala ve kendi ortamında dene.");
}

function runJson(source: string): AcademyLabRunResult {
  try {
    const parsed = JSON.parse(source) as unknown;
    return {
      ok: true,
      kind: "json",
      stdout: JSON.stringify(parsed, null, 2),
      stderr: "",
    };
  } catch (error) {
    return {
      ok: false,
      kind: "error",
      stdout: "",
      stderr: error instanceof Error ? error.message : "JSON çözülemedi.",
    };
  }
}

function previewOnly(source: string, stderr: string): AcademyLabRunResult {
  const hints = extractAcademyLabCommentHints(source);
  return {
    ok: true,
    kind: "preview",
    stdout: hints || "Örnek kayıt laboratuvar önizlemesindedir. Kopyala, kendi ortamında çalıştır.",
    stderr,
  };
}

function runJsSubset(source: string, typescript: boolean): AcademyLabRunResult {
  if (JS_HOST.test(source) || /\bimport\s+/u.test(source) || /\bexport\s+/u.test(source)) {
    return previewOnly(
      source,
      "Bu örnek tarayıcı laboratuvarının dışındaki kapıya (fetch, DOM, şema) bağlı. Kopyala, kendi odanda dene.",
    );
  }
  const prepared = typescript ? stripTsNoise(source) : source;
  const logs: string[] = [];
  try {
    const fn = new Function(
      "console",
      `"use strict";\n${prepared}\n`,
    ) as (consoleLike: { log: (...args: unknown[]) => void }) => void;
    fn({
      log: (...args: unknown[]) => {
        logs.push(args.map(formatLabValue).join(" "));
      },
    });
    return {
      ok: true,
      kind: "ran",
      stdout: logs.join("\n") || "Tamam — ifade doğrulandı, standart çıktı yok.",
      stderr: "",
    };
  } catch (error) {
    return {
      ok: false,
      kind: "error",
      stdout: logs.join("\n"),
      stderr: error instanceof Error ? error.message : "Çalıştırma düştü.",
    };
  }
}

function stripTsNoise(source: string): string {
  return source
    .replace(/^\s*(?:export\s+)?(?:type|interface)\s+[\s\S]*?(?:;|\{[\s\S]*?\})\s*$/gmu, "")
    .replace(/:\s*(?:string|number|boolean|void|Phase|CartItem)(?:\s*\|\s*(?:string|number|boolean|Phase))*\s*/gu, " ")
    .replace(/\bas\s+[A-Za-z_][\w.]*/gu, "");
}

function runPythonSubset(source: string, stdin: string): AcademyLabRunResult {
  if (HOST_IMPORT.test(source)) {
    return previewOnly(
      source,
      "Bu örnek pandas / FastAPI / yol kütüphanesi ister. Laboratuvar harici paketi yüklemez. Kopyala, kendi Python odanda dene.",
    );
  }
  const js = transpileAcademyPythonSubset(source);
  if (!js) {
    return previewOnly(
      source,
      "Bu Python dilimi laboratuvar alt kümesinin dışında. Kopyala, kendi yorumlayıcında dene.",
    );
  }
  const stdinLines = stdin
    .split(/\r?\n/u)
    .map((line) => line.trimEnd())
    .filter((line, index, all) => !(index === all.length - 1 && line === ""));
  const logs: string[] = [];
  try {
    const fn = new Function(
      "stdout",
      "stdinLines",
      `"use strict";
const int = Object.assign(function int(value) {
  const n = Number.parseInt(String(value).trim(), 10);
  if (!Number.isFinite(n)) {
    throw new TypeError("ValueError");
  }
  return n;
}, { __name__: "int" });
const float = Object.assign(function float(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new TypeError("ValueError");
  }
  return n;
}, { __name__: "float" });
const str = Object.assign(function str(value) { return String(value); }, { __name__: "str" });
const bool = Object.assign(function bool(value) { return Boolean(value); }, { __name__: "bool" });
function len(value) { return value.length; }
function round(value, digits) {
  if (digits == null) return Math.round(Number(value));
  const p = 10 ** digits;
  return Math.round(Number(value) * p) / p;
}
function type(value) {
  if (typeof value === "boolean") return bool;
  if (typeof value === "number") return Number.isInteger(value) ? int : float;
  if (typeof value === "string") return str;
  return Object;
}
function print(...args) {
  stdout.push(args.map((item) => {
    if (item === true) return "True";
    if (item === false) return "False";
    if (item === null || item === undefined) return "None";
    if (typeof item === "object") return JSON.stringify(item).replace(/"/g, "'").replace(/:/g, ": ").replace(/,/g, ", ");
    return String(item);
  }).join(" "));
}
let __stdinAt = 0;
function input(_prompt) {
  const line = stdinLines[__stdinAt++] ?? "";
  return String(line);
}
${js}
`,
    ) as (stdout: string[], stdinLines: string[]) => void;
    fn(logs, stdinLines.length > 0 ? stdinLines : ["1"]);
    return {
      ok: true,
      kind: "ran",
      stdout: logs.join("\n") || "Tamam — ifade doğrulandı, standart çıktı yok.",
      stderr: "",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Çalıştırma düştü.";
    const mapped = message.includes("ValueError") ? "ValueError" : message;
    return {
      ok: false,
      kind: "error",
      stdout: logs.join("\n"),
      stderr: mapped,
    };
  }
}

export function transpileAcademyPythonSubset(source: string): string | null {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  const indents: number[] = [0];
  let open = 0;
  for (const raw of lines) {
    const withoutComment = raw.replace(/(^|[^"'])#.*$/u, "$1").trimEnd();
    if (!withoutComment.trim()) {
      continue;
    }
    const indent = raw.match(/^ */u)?.[0].length ?? 0;
    if (indent % 4 !== 0) {
      return null;
    }
    let line = withoutComment.trim();
    line = stripPyDefAnnotations(line);
    line = rewritePyFString(line);
    line = line.replace(/\bTrue\b/gu, "true").replace(/\bFalse\b/gu, "false").replace(/\bNone\b/gu, "null");
    line = line.replace(/\bis\s+not\b/gu, "!==").replace(/\bis\b/gu, "===");
    line = line.replace(/\.strip\(\)/gu, ".trim()");
    const continuation =
      line.startsWith("elif ") || line === "else:" || /^except\b/u.test(line);
    if (!continuation) {
      while (indent < (indents[indents.length - 1] ?? 0)) {
        out.push("}");
        indents.pop();
        open -= 1;
      }
    }
    if (/^(import |from )/u.test(line)) {
      return null;
    }
    if (line.startsWith("assert ")) {
      out.push(`if (!(${line.slice(7)})) throw new Error("AssertionError");`);
      continue;
    }
    if (line.startsWith("print(") && line.endsWith(")")) {
      out.push(line + ";");
      continue;
    }
    const forRange = line.match(/^for\s+(\w+)\s+in\s+range\(([^)]+)\):$/u);
    if (forRange) {
      const [, name, args] = forRange;
      const parts = splitPyArgs(args ?? "");
      let header = "";
      if (parts.length === 1) {
        header = `for (let ${name} = 0; ${name} < (${parts[0]}); ${name}++) {`;
      } else if (parts.length === 2) {
        header = `for (let ${name} = (${parts[0]}); ${name} < (${parts[1]}); ${name}++) {`;
      } else if (parts.length === 3) {
        header = `for (let ${name} = (${parts[0]}); ${name} < (${parts[1]}); ${name} += (${parts[2]})) {`;
      } else {
        return null;
      }
      out.push(header);
      indents.push(indent + 4);
      open += 1;
      continue;
    }
    if (line.startsWith("if ") && line.endsWith(":")) {
      out.push(`if (${line.slice(3, -1).trim()}) {`);
      indents.push(indent + 4);
      open += 1;
      continue;
    }
    if (line.startsWith("elif ") && line.endsWith(":")) {
      out.push(`} else if (${line.slice(5, -1).trim()}) {`);
      continue;
    }
    if (line === "else:") {
      out.push("} else {");
      continue;
    }
    if (line.startsWith("while ") && line.endsWith(":")) {
      out.push(`for (let __w = 0; __w < 64 && (${line.slice(6, -1).trim()}); __w++) {`);
      indents.push(indent + 4);
      open += 1;
      continue;
    }
    if (line.startsWith("def ") && line.endsWith(":")) {
      const def = line.match(/^def\s+(\w+)\s*\((.*)\)\s*:$/u);
      if (!def) {
        return null;
      }
      out.push(`function ${def[1]}(${def[2]}) {`);
      indents.push(indent + 4);
      open += 1;
      continue;
    }
    if (line.startsWith("try:")) {
      out.push("try {");
      indents.push(indent + 4);
      open += 1;
      continue;
    }
    if (/^except\s+\w+\s*:$/u.test(line) || line === "except:") {
      out.push("} catch (__err) {");
      continue;
    }
    if (line === "break") {
      out.push("break;");
      continue;
    }
    if (line === "continue") {
      out.push("continue;");
      continue;
    }
    if (line.startsWith("return")) {
      out.push(`${line};`);
      continue;
    }
    if (/^[A-Za-z_]\w*\s*(\+=|-=|\*=|\/=|=)/u.test(line)) {
      const assign = line.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/u);
      if (assign && !/[+\-*/]=/u.test(line)) {
        out.push(`var ${assign[1]} = ${assign[2]};`);
      } else {
        out.push(`${line};`);
      }
      continue;
    }
    return null;
  }
  while (open > 0) {
    out.push("}");
    open -= 1;
  }
  return out.join("\n");
}

function stripPyDefAnnotations(line: string): string {
  if (!line.startsWith("def ")) {
    return line;
  }
  return line.replace(/:\s*[A-Za-z_][\w.\[\], ]*/gu, "").replace(/\s*->\s*[A-Za-z_][\w.\[\]]*\s*(?=:)/u, "");
}

function rewritePyFString(line: string): string {
  return line.replace(/\bf(["'])(.*?)\1/gu, (_all, _q: string, body: string) => {
    const js = body.replace(/\{([^}]+)\}/gu, "${$1}");
    return `\`${js}\``;
  });
}

function splitPyArgs(args: string): string[] {
  return args
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function formatLabValue(value: unknown): string {
  if (value === true) {
    return "true";
  }
  if (value === false) {
    return "false";
  }
  if (value === null || value === undefined) {
    return "null";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}
