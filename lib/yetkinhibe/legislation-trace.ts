export const UNSOURCED_FIGURE_LINE = "Kaynak doğrulanmadığı için tutar ve oran basılmadı.";

export type CatalogTraceInput = {
  title: string;
  sourceLabel: string;
  officialInfoUrl: string;
  sourceVerifiedAt?: string | null;
  dataVersion?: number | null;
  madde?: string | null;
  poolLabel?: string;
  ceilingLabel?: string;
  ratioLabel?: string;
};

export function hasCatalogTrace(program: {
  officialInfoUrl: string;
  sourceVerifiedAt?: string | null;
}): boolean {
  return (
    program.officialInfoUrl.startsWith("https://") &&
    typeof program.sourceVerifiedAt === "string" &&
    /^\d{4}-\d{2}-\d{2}/.test(program.sourceVerifiedAt)
  );
}

export function catalogFigureLines(program: CatalogTraceInput): readonly string[] {
  if (!hasCatalogTrace(program)) {
    return [UNSOURCED_FIGURE_LINE];
  }
  return [program.poolLabel, program.ceilingLabel, program.ratioLabel].filter(
    (line): line is string => typeof line === "string" && line.length > 0,
  );
}

/** Her rapora eklenen mevzuat dipnotu. Kaynaksız oran cümlesi kurmaz. */
export function formatLegislationNote(programs: readonly CatalogTraceInput[]): string {
  const lines = ["Mevzuat ve Doğrulama İzi"];
  const sourced = programs.filter((program) => hasCatalogTrace(program));
  if (sourced.length === 0) {
    lines.push("Bu raporda katalog tutarı veya oranı yok. Kaynaksız sayı basılmadı.");
    return lines.join("\n");
  }
  for (const program of sourced) {
    const verifiedAt = program.sourceVerifiedAt ?? "";
    const date = verifiedAt.slice(0, 10);
    const version = typeof program.dataVersion === "number" ? String(program.dataVersion) : "yok";
    lines.push(`${program.sourceLabel} — ${program.title}`);
    lines.push(`kaynak: ${program.officialInfoUrl}`);
    lines.push(`dogrulamaTarihi: ${verifiedAt}`);
    lines.push(`dataVersion: ${version}`);
    lines.push(`madde: ${program.madde && program.madde.length > 0 ? program.madde : "yok"}`);
    lines.push(`Bu oran katalog satırı ${date} tarihli doğrulamadır.`);
  }
  return lines.join("\n");
}
