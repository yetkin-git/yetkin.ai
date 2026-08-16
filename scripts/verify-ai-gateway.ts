#!/usr/bin/env tsx
/**
 * AI Gümrük Kapısı mührü.
 * lib/ ve app/ altında doğrudan sağlayıcı erişimi build'i kırar.
 * İzinli yuva: lib/kernel/ai/llm-gateway.ts + lib/kernel/ai/providers/*
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["lib", "app"];
const FILE_RE = /\.(ts|tsx)$/;

const ALLOWLIST = new Set([
  "lib/kernel/ai/llm-gateway.ts",
  "lib/kernel/ai/providers/gemini.ts",
  "lib/kernel/ai/providers/openai.ts",
  "lib/kernel/ai/providers/anthropic.ts",
  "lib/kernel/ai/providers/sovereign.ts",
]);

const FORBIDDEN = [
  { pattern: "new GoogleGenAI(", label: "doğrudan GoogleGenAI client factory" },
  { pattern: "api.openai.com", label: "raw OpenAI fetch çağrısı" },
  { pattern: "api.anthropic.com", label: "raw Anthropic fetch çağrısı" },
] as const;

function walk(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === "yetkin.ai" || entry === "node_modules") {
        continue;
      }
      files.push(...walk(fullPath));
    } else if (FILE_RE.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

const violations: string[] = [];

for (const scanDir of SCAN_DIRS) {
  for (const file of walk(join(ROOT, scanDir))) {
    const rel = relative(ROOT, file).replace(/\\/g, "/");
    if (ALLOWLIST.has(rel)) {
      continue;
    }
    const source = readFileSync(file, "utf8");
    for (const { pattern, label } of FORBIDDEN) {
      if (source.includes(pattern)) {
        violations.push(`${rel} — ${label}: \`${pattern}\``);
      }
    }
  }
}

const gateway = join(ROOT, "lib/kernel/ai/llm-gateway.ts");
if (!existsSync(gateway) || !readFileSync(gateway, "utf8").includes("export async function invokeLlm")) {
  violations.push("lib/kernel/ai/llm-gateway.ts — invokeLlm kayboldu");
}
if (!existsSync(gateway) || !readFileSync(gateway, "utf8").includes("export async function generateImage")) {
  violations.push("lib/kernel/ai/llm-gateway.ts — generateImage kayboldu");
}

const roles = readFileSync(join(ROOT, "lib/kernel/ai/model-roles.ts"), "utf8");
for (const role of [
  "EXECUTIVE_BRAIN",
  "DEEP_RESEARCH",
  "FAST_STREAM",
  "LITE_STREAM",
  "IMAGE_GEN",
  "VIDEO_GEN",
  "VOICE_TTS",
  "OPEN_LOCAL",
]) {
  if (!roles.includes(role)) {
    violations.push(`lib/kernel/ai/model-roles.ts — kanonik rol eksik: ${role}`);
  }
}

if (violations.length > 0) {
  console.error(
    [
      "verify:ai-gateway BAŞARISIZ — LLM Gümrük Kapısı bypass edildi:",
      ...violations.map((row) => `  ✗ ${row}`),
      "",
      "Tüm LLM çağrıları lib/kernel/ai/llm-gateway.ts → invokeLlm() üzerinden geçmelidir.",
      "Görsel üretim lib/kernel/ai/llm-gateway.ts → generateImage() factory'sinden geçer.",
    ].join("\n"),
  );
  process.exit(1);
}

console.log("verify:ai-gateway OK — tüm sağlayıcı erişimi tek gümrük kapısında mühürlü.");
