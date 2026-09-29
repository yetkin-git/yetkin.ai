import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * EC-102 çalışma sekmesi gövdesi.
 * Tek kaynak `lib/academy/spoken-scripts/<lessonKey>.md`. Sekme kopyası tutulmaz.
 */
export function ecommerceSpokenMarkdown(lessonKey: string): string {
  const path = join(process.cwd(), "lib/academy/spoken-scripts", `${lessonKey.trim()}.md`);
  const raw = readFileSync(path, "utf8")
    .replace(/<!--[\s\S]*?-->/gu, "")
    .trim();
  if (!raw) {
    throw new Error(`spoken script missing: ${lessonKey}`);
  }
  return `\n${raw}\n`;
}
