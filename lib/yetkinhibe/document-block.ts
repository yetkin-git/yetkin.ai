export type DocumentBlock =
  | { kind: "h1" | "h2" | "p"; text: string }
  | { kind: "table"; headers: readonly string[]; rows: readonly (readonly string[])[] };
