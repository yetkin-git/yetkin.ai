import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SYSTEM_DOCS_DIR = ".system_docs";

type SystemDocSpec = {
  file: string;
  why: string;
  mustContain: readonly string[];
};

const SYSTEM_DOCS: readonly SystemDocSpec[] = [
  {
    file: "ANAYASA.md",
    why: "12 oda tavanı, amountMinor, service_role yasağı ve S43 kırmızı çizgilerinin insan SSOT'udur. Yoksa proje anayasasız derlenmiş sayılır.",
    mustContain: [
      "12 oda",
      "amountMinor",
      "amountKurus",
      "service_role",
      "S43",
      "talent",
      "chess",
      "SUPABASE_SERVICE_ROLE_KEY",
      "Idempotency-Key",
      "INNGEST_SIGNING_KEY",
      "INNGEST_EVENT_KEY",
      "http_idempotency_records",
      "data_base64",
      "exec yoktur",
      "JWKS",
      "unsafe-eval",
      "SUPABASE_JWT_SECRET",
      "üç halka",
      ".system_docs",
      "çift zarf",
      "Üçüncü zarf",
    ],
  },
  {
    file: "MANIFESTO.md",
    why: "Anayasa'nın neden var olduğunu söyler; yerine geçmez. Vizyon sapması 13. oda baskısını doğurur.",
    mustContain: ["12 oda", "T-02", "Anayasa", ".system_docs/ANAYASA.md"],
  },
  {
    file: "OPS_RUNBOOK.md",
    why: "Operatör bağlama SSOT'udur (env, Direct Port, Super Admin, PayTR, Inngest, Storage CORS). Credential icat edilmez.",
    mustContain: [
      ".env.local",
      "SUPER_ADMIN_USER_ID",
      "ops:migrate",
      "/register",
      "00000000-0000-4000-8000-000000000001",
      "handle_new_user",
      "DIRECT_URL",
      "IPv6",
      "P1001",
      "DIRECT_PORT_OPERATOR_PROTOCOL",
      "Test-NetConnection",
      "IPv4 add-on",
      "20260814090000_academy_course_seed.sql",
      "20260814100000_handle_user_email_update.sql",
      "20260814110000_freelancer_job_seed.sql",
      "handle_user_email_update",
      "/academy",
      "/freelancer",
      "/yetkinilan",
      "session-mode",
      "PENDING",
      "credit etmez",
      "markFailed",
      "amountMinor",
      "/auth/callback",
      "/sifre-yenile",
      "emailRedirectTo",
      "exchangeCodeForSession",
      "503",
      "requestId",
      "verify:no-secrets",
      "STUDIO_IMAGE_DATA_BASE64_MAX_CHARS",
      "Idempotency-Key",
      "fail-closed",
      "rail-temel",
      "INNGEST_SIGNING_KEY",
      "studio_digital_assets_data_base64_max_chars",
      "http_idempotency_records",
      "academy_lesson_completions",
      "curriculum_seal",
      "corporate_job_offers",
      "PAYTR_SANDBOX",
      "PAYTR_ALLOW_MOCK_CHECKOUT",
      "/api/payments/webhooks/paytr",
      "supabase/storage/studio-assets.sql",
      "Storage CORS",
      "NEXT_PUBLIC_APP_URL",
      "E2E_BASE_URL",
      "2097152",
      "ops:storage-cors",
      "ops:runtime-readiness",
      "503 çıkış",
      "Access-Control-Allow-Origin: *",
      "yalnız PUT",
      "üç halka",
    ],
  },
  {
    file: "STORAGE_CONTRACT.md",
    why: "Studio nesne depo, imzalı PUT, CORS ve service_role yok sözleşmesidir. Kör data_base64 DROP yoktur.",
    mustContain: [
      "studio-assets",
      "createSignedUploadUrl",
      "2097152",
      "1572864",
      "content_hash",
      "byte_size",
      "SUPABASE_SERVICE_ROLE_KEY",
      "auth.uid()",
      "ops:migrate",
      "NEXT_PUBLIC_APP_URL",
      "assertStudioStorageCorsHeaders",
      "Allowed Methods",
      "Access-Control-Allow-Origin: *",
    ],
  },
  {
    file: "README.md",
    why: "Kalıcı belge klasörünün kendisini ve /docs günlük alan ayrımını tarif eder. Yoksa ajan tekrar /docs'a fixture bağlar.",
    mustContain: [".system_docs", "/docs", "OPS_RUNBOOK.md", "ANAYASA.md"],
  },
];

function missingSystemDocMessage(file: string, why: string): string {
  return [
    `Sistem belgesi eksik: .system_docs/${file}`,
    `Neden zorunlu: ${why}`,
    "Kalıcı belgeler /.system_docs altındadır. /docs günlük raporlama alanıdır; build fixture değildir.",
  ].join("\n");
}

function readSystemDoc(spec: SystemDocSpec): string {
  const full = join(ROOT, SYSTEM_DOCS_DIR, spec.file);
  if (!existsSync(full)) {
    throw new Error(missingSystemDocMessage(spec.file, spec.why));
  }
  return readFileSync(full, "utf8");
}

function walkFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") {
        continue;
      }
      out.push(...walkFiles(full));
    } else if (entry.endsWith(".test.ts")) {
      out.push(full);
    }
  }
  return out;
}

describe("Sistem Belge Sözleşmesi", () => {
  it("beş sistem dosyası durur; eksikte hangi dosyanın neden zorunlu olduğu yazılır", () => {
    expect(SYSTEM_DOCS.map((row) => row.file)).toEqual([
      "ANAYASA.md",
      "MANIFESTO.md",
      "OPS_RUNBOOK.md",
      "STORAGE_CONTRACT.md",
      "README.md",
    ]);
    for (const spec of SYSTEM_DOCS) {
      const message = missingSystemDocMessage(spec.file, spec.why);
      expect(message).toContain(`.system_docs/${spec.file}`);
      expect(message).toContain(`Neden zorunlu: ${spec.why}`);
      expect(readSystemDoc(spec).length).toBeGreaterThan(200);
    }
    expect(() =>
      readSystemDoc({
        file: "__yok__.md",
        why: "Bu cümle operatöre hangi belgenin neden zorunlu olduğunu söyler.",
        mustContain: [],
      }),
    ).toThrow(
      /Sistem belgesi eksik: \.system_docs\/__yok__\.md\nNeden zorunlu: Bu cümle operatöre hangi belgenin neden zorunlu olduğunu söyler\./,
    );
  });

  it("ANAYASA 12 oda tavanı, amountMinor, service_role yasağı ve S43 çeker", () => {
    const anayasa = readSystemDoc(SYSTEM_DOCS[0]!);
    for (const needle of SYSTEM_DOCS[0]!.mustContain) {
      expect(anayasa, needle).toContain(needle);
    }
    expect(anayasa).toMatch(/amountKurus[\s\S]{0,80}yasak/i);
    expect(anayasa).not.toContain("docs/ANAYASA.md");
    expect(anayasa).not.toContain("docs/07_OPS_RUNBOOK.md");
    expect(anayasa).not.toContain("docs/08_STORAGE_CONTRACT.md");
  });

  it("OPS_RUNBOOK operatör bağını ve fail-closed cümlelerini taşır", () => {
    const runbook = readSystemDoc(SYSTEM_DOCS[2]!);
    for (const needle of SYSTEM_DOCS[2]!.mustContain) {
      expect(runbook, needle).toContain(needle);
    }
    expect(runbook).not.toContain('phase: "11"');
    expect(runbook).not.toContain("phase: 11");
    expect(runbook).not.toContain("dosya yoksa seremoni açık değildir");
  });

  it("STORAGE_CONTRACT imzalı PUT ve service_role yok tarif eder", () => {
    const contract = readSystemDoc(SYSTEM_DOCS[3]!);
    for (const needle of SYSTEM_DOCS[3]!.mustContain) {
      expect(contract, needle).toContain(needle);
    }
  });

  it("MANIFESTO ve README kalıcı/günlük ayrımını taşır", () => {
    const manifesto = readSystemDoc(SYSTEM_DOCS[1]!);
    const readme = readSystemDoc(SYSTEM_DOCS[4]!);
    for (const needle of SYSTEM_DOCS[1]!.mustContain) {
      expect(manifesto, needle).toContain(needle);
    }
    for (const needle of SYSTEM_DOCS[4]!.mustContain) {
      expect(readme, needle).toContain(needle);
    }
  });

  it("testler /docs markdown'ını okumaz; yalnız .system_docs doğrulanır", () => {
    const banned = [
      /read(?:FileSync|Src)\([^)]*docs\//,
      /existsSync\([^)]*docs\//,
      /["']docs\/ANAYASA\.md["']/,
      /["']docs\/07_OPS_RUNBOOK\.md["']/,
      /["']docs\/08_STORAGE_CONTRACT\.md["']/,
      /["']docs\/tedavi_raporu_[^"']+\.md["']/,
      /["']docs\/07_tedavi_raporu_[^"']+\.md["']/,
    ];
    const self = join(ROOT, "tests/kernel/system-docs-contract-surface.test.ts").replace(/\\/g, "/");
    for (const file of walkFiles(join(ROOT, "tests"))) {
      if (file.replace(/\\/g, "/") === self) {
        continue;
      }
      const source = readFileSync(file, "utf8");
      const rel = file.replace(`${ROOT}\\`, "").replace(`${ROOT}/`, "").replace(/\\/g, "/");
      for (const pattern of banned) {
        expect(source, `${rel} ${pattern}`).not.toMatch(pattern);
      }
    }
  });
});
