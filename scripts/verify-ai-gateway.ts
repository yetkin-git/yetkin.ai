#!/usr/bin/env tsx
/**
 * AI Gümrük Kapısı mührü.
 * lib/ ve app/ altında doğrudan sağlayıcı erişimi build'i kırar.
 * İzinli yuva: lib/kernel/ai/llm-gateway.ts + lib/kernel/ai/providers/*
 * VIDEO_GEN mühürlü-ölü: factory yok.
 * VOICE_TTS canlı factory: yalnız generateSpeech gümrük kapısı.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["lib", "app"];
const ROLE_LEAK_DIRS = ["lib", "app", "components"];
const FILE_RE = /\.(ts|tsx)$/;

const ALLOWLIST = new Set([
  "lib/kernel/ai/llm-gateway.ts",
  "lib/kernel/ai/providers/gemini.ts",
  "lib/kernel/ai/providers/openai.ts",
  "lib/kernel/ai/providers/anthropic.ts",
  "lib/kernel/ai/providers/sovereign.ts",
]);

const SEALED_ROLE_ALLOW_PREFIX = "lib/kernel/ai/";
const TTS_MODEL_ALLOW_PREFIX = "lib/kernel/ai/";

const FORBIDDEN = [
  { pattern: "new GoogleGenAI(", label: "doğrudan GoogleGenAI client factory" },
  { pattern: "api.openai.com", label: "raw OpenAI fetch çağrısı" },
  { pattern: "api.anthropic.com", label: "raw Anthropic fetch çağrısı" },
] as const;

const FACTORY_FORBIDDEN = [
  { pattern: "generateVideos(", label: "video factory (generateVideos)" },
  { pattern: "generateVideo(", label: "video factory (generateVideo)" },
  { pattern: "generateAudio(", label: "paralel ses factory (generateAudio)" },
  { pattern: "export async function generateVideo", label: "generateVideo gümrük export" },
  { pattern: "export async function generateVoice", label: "generateVoice gümrük export" },
  { pattern: "export async function generateAudio", label: "generateAudio gümrük export" },
  { pattern: "elevenlabs", label: "ElevenLabs entegrasyonu" },
  { pattern: "api.elevenlabs.io", label: "ElevenLabs HTTP" },
  { pattern: "texttospeech.googleapis.com", label: "Cloud TTS HTTP" },
  { pattern: "@google-cloud/text-to-speech", label: "Cloud TTS paket" },
  { pattern: "veo-3.0", label: "Veo model id (ölü yuva tahriki)" },
] as const;

const TTS_MODEL_PATTERNS = ["preview-tts", "flash-tts"] as const;

const CANONICAL_ROLES = [
  "EXECUTIVE_BRAIN",
  "DEEP_RESEARCH",
  "FAST_STREAM",
  "LITE_STREAM",
  "IMAGE_GEN",
  "VIDEO_GEN",
  "VOICE_TTS",
  "OPEN_LOCAL",
] as const;

const LIVE_ROLES = [
  "EXECUTIVE_BRAIN",
  "DEEP_RESEARCH",
  "FAST_STREAM",
  "LITE_STREAM",
  "IMAGE_GEN",
  "VOICE_TTS",
  "OPEN_LOCAL",
] as const;

const SEALED_DEAD_ROLES = ["VIDEO_GEN"] as const;

function walk(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === "yetkin_muze" || entry === "yetkin.ai" || entry === "node_modules") {
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

for (const scanDir of ROLE_LEAK_DIRS) {
  for (const file of walk(join(ROOT, scanDir))) {
    const rel = relative(ROOT, file).replace(/\\/g, "/");
    const source = readFileSync(file, "utf8");
    const sourceLower = source.toLowerCase();
    for (const { pattern, label } of FACTORY_FORBIDDEN) {
      if (sourceLower.includes(pattern.toLowerCase())) {
        violations.push(`${rel} — ${label}: \`${pattern}\``);
      }
    }
    if (!rel.startsWith(TTS_MODEL_ALLOW_PREFIX)) {
      for (const pattern of TTS_MODEL_PATTERNS) {
        if (sourceLower.includes(pattern)) {
          violations.push(`${rel} — TTS model id dikeyde: \`${pattern}\``);
        }
      }
    }
    if (rel.startsWith(SEALED_ROLE_ALLOW_PREFIX)) {
      continue;
    }
    for (const role of SEALED_DEAD_ROLES) {
      if (source.includes(role)) {
        violations.push(`${rel} — dikey/modül mühürlü ölü role erişiyor: ${role}`);
      }
    }
  }
}

const gateway = join(ROOT, "lib/kernel/ai/llm-gateway.ts");
const gatewaySrc = existsSync(gateway) ? readFileSync(gateway, "utf8") : "";
if (!gatewaySrc.includes("export async function invokeLlm")) {
  violations.push("lib/kernel/ai/llm-gateway.ts — invokeLlm kayboldu");
}
if (!gatewaySrc.includes("export async function generateImage")) {
  violations.push("lib/kernel/ai/llm-gateway.ts — generateImage kayboldu");
}
if (!gatewaySrc.includes("export async function generateSpeech")) {
  violations.push("lib/kernel/ai/llm-gateway.ts — generateSpeech kayboldu");
}
if (!gatewaySrc.includes("assertLiveAiModelRole")) {
  violations.push("lib/kernel/ai/llm-gateway.ts — mühürlü rol assertLiveAiModelRole kayboldu");
}

const types = join(ROOT, "lib/kernel/ai/types.ts");
const typesSrc = existsSync(types) ? readFileSync(types, "utf8") : "";
if (!typesSrc.includes("generateVideo?: never")) {
  violations.push("lib/kernel/ai/types.ts — generateVideo?: never tipi kayboldu");
}
if (!typesSrc.includes("generateSpeech?")) {
  violations.push("lib/kernel/ai/types.ts — generateSpeech factory tipi kayboldu");
}
if (typesSrc.includes("generateSpeech?: never")) {
  violations.push("lib/kernel/ai/types.ts — VOICE_TTS generateSpeech?: never ile yeniden mühürlendi");
}
if (!typesSrc.includes("role?: AiLiveModelRoleKey")) {
  violations.push("lib/kernel/ai/types.ts — invokeLlm rol tipi AiLiveModelRoleKey değil");
}

const rolesPath = join(ROOT, "lib/kernel/ai/model-roles.ts");
const roles = existsSync(rolesPath) ? readFileSync(rolesPath, "utf8") : "";
for (const role of CANONICAL_ROLES) {
  if (!roles.includes(role)) {
    violations.push(`lib/kernel/ai/model-roles.ts — kanonik rol eksik: ${role}`);
  }
}
for (const role of LIVE_ROLES) {
  if (!roles.includes(`"${role}"`)) {
    violations.push(`lib/kernel/ai/model-roles.ts — canlı rol eksik: ${role}`);
  }
}
if (!roles.includes("AI_LIVE_MODEL_ROLE_KEYS")) {
  violations.push("lib/kernel/ai/model-roles.ts — AI_LIVE_MODEL_ROLE_KEYS kayboldu");
}
if (!roles.includes("AI_SEALED_DEAD_ROLE_KEYS")) {
  violations.push("lib/kernel/ai/model-roles.ts — AI_SEALED_DEAD_ROLE_KEYS kayboldu");
}
if (!roles.includes("class AiGatewayForbiddenError")) {
  violations.push("lib/kernel/ai/model-roles.ts — AiGatewayForbiddenError kayboldu");
}
if (!roles.includes("export function assertLiveAiModelRole")) {
  violations.push("lib/kernel/ai/model-roles.ts — assertLiveAiModelRole kayboldu");
}
if (!roles.includes("Kesilmiş ölü yuva")) {
  violations.push("lib/kernel/ai/model-roles.ts — mühürlü-ölü yuva açıklaması kayboldu");
}
if (!roles.includes("gemini-3.1-flash-tts-preview")) {
  violations.push("lib/kernel/ai/model-roles.ts — VOICE_TTS varsayılan TTS modeli kayboldu");
}

const gemini = join(ROOT, "lib/kernel/ai/providers/gemini.ts");
const geminiSrc = existsSync(gemini) ? readFileSync(gemini, "utf8") : "";
if (!geminiSrc.includes("async generateSpeech")) {
  violations.push("lib/kernel/ai/providers/gemini.ts — generateSpeech kayboldu");
}
if (!geminiSrc.includes("process.env.GEMINI_API_KEY")) {
  violations.push("lib/kernel/ai/providers/gemini.ts — GEMINI_API_KEY okuma kayboldu");
}

if (violations.length > 0) {
  console.error(
    [
      "verify:ai-gateway BAŞARISIZ — LLM Gümrük Kapısı bypass edildi:",
      ...violations.map((row) => `  ✗ ${row}`),
      "",
      "Tüm LLM çağrıları lib/kernel/ai/llm-gateway.ts → invokeLlm() üzerinden geçmelidir.",
      "Görsel üretim lib/kernel/ai/llm-gateway.ts → generateImage() factory'sinden geçer.",
      "Ses üretimi lib/kernel/ai/llm-gateway.ts → generateSpeech() factory'sinden geçer.",
      "VIDEO_GEN mühürlü-ölü yuvadır; factory ve dikey çağrı yasaktır.",
    ].join("\n"),
  );
  process.exit(1);
}

console.log(
  "verify:ai-gateway OK — gümrük mühürlü; VIDEO_GEN fail-closed; VOICE_TTS generateSpeech factory.",
);
