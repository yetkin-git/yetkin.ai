import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/** Çalışan 4 oda — lib/kernel/rooms.ssot.ts SSOT. eslint kopya dizi tutmaz. */
/** BOUNDED_CONTEXTS — Proof / Marketplace / Payments. Tablo sahipliği scripts/verify-boundaries.ts [context.prisma]. */
const roomsSsotSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "lib/kernel/rooms.ssot.ts"),
  "utf8",
);

function parseSsotIds(exportName, idPattern) {
  const match = roomsSsotSource.match(
    new RegExp(`export const ${exportName} = \\[([\\s\\S]*?)\\] as const;`),
  );
  if (!match?.[1]) {
    throw new Error(`eslint.config.mjs: rooms.ssot.ts ${exportName} parse edilemedi`);
  }
  return [...match[1].matchAll(idPattern)].map((row) => row[1]);
}

const VERTICAL_ROOMS = parseSsotIds("VERTICAL_ROOMS", /\bid:\s*"([a-z0-9-]+)"/g);
const FROZEN_DISK_ROOMS = parseSsotIds("FROZEN_DISK_ROOMS", /"([a-z0-9-]+)"/g);
/** Canlı oda duvarı yalnız 4 çalışan oda. Donmuş 8 oda sicil/denylist; lib/ override üretmez. */
const LIVE_ROOMS = VERTICAL_ROOMS;

const MUSEUM_MSG =
  "OPS: yetkin_muze müze importu yasaktır. Rail build dışı. Anayasa maddesi değildir.";
const KERNEL_MSG =
  "Anayasa A8: lib/kernel dikey oda import etmez. Kontrat kernel’de kalır.";
const MODULE_ENGINE_MSG =
  "Anayasa A8: dikey oda başka odanın engine/runtime/prisma-store dosyasını import etmez. İletişim HTTP veya kernel kontratı.";
const CATALOG_LEAK_MSG =
  "Anayasa A8: kariyer/freelancer lib/academy import etmez. Kimlik lib/kernel/catalog-ids.";
const EARNINGS_WALL_MSG =
  "D2.3 oda duvarı (room.wall / EARNINGS_WALL): freelancer ↛ kariyer. Teklif kapısı HTTP; emanet çekirdektedir.";
const UI_SERVER_MSG =
  "UI katmanı Prisma / server-only yazma motoru import etmez. Yazma tekil API rotasından gider.";

const museumPaths = [
  { name: "yetkin_muze", message: MUSEUM_MSG },
  { name: "yetkin.ai", message: MUSEUM_MSG },
];
const museumPatterns = [
  {
    group: [
      "yetkin_muze/*",
      "@/yetkin_muze",
      "@/yetkin_muze/*",
      "yetkin.ai/*",
      "@/yetkin.ai",
      "@/yetkin.ai/*",
    ],
    message: MUSEUM_MSG,
  },
];

function restrictedImports({ paths = [], patterns = [] } = {}) {
  return [
    "error",
    {
      paths: [...museumPaths, ...paths],
      patterns: [...museumPatterns, ...patterns],
    },
  ];
}

function kernelVerticalPatterns() {
  return [...LIVE_ROOMS, ...FROZEN_DISK_ROOMS].flatMap((id) => [`@/lib/${id}`, `@/lib/${id}/*`]);
}

function otherModuleEnginePatterns(self) {
  return LIVE_ROOMS.filter((id) => id !== self).flatMap((id) => [
    `@/lib/${id}/engine`,
    `@/lib/${id}/runtime`,
    `@/lib/${id}/prisma-store`,
    `@/lib/${id}/prisma-*`,
    `@/lib/${id}/*-engine`,
  ]);
}

function earningsWallPatterns(self) {
  if (self === "freelancer") {
    return [
      {
        group: ["@/lib/career", "@/lib/career/*"],
        message: EARNINGS_WALL_MSG,
      },
    ];
  }
  return [];
}

function academyCatalogLeakPatterns(self) {
  if (self === "career" || self === "freelancer") {
    return [
      {
        group: ["@/lib/academy", "@/lib/academy/*"],
        message: CATALOG_LEAK_MSG,
      },
    ];
  }
  return [];
}

const uiServerPaths = [
  { name: "@prisma/client", message: UI_SERVER_MSG },
  { name: "server-only", message: UI_SERVER_MSG },
  { name: "@/lib/kernel/db", message: UI_SERVER_MSG },
  { name: "@/lib/kernel/admin", message: UI_SERVER_MSG },
  { name: "@/lib/kernel/admin/catalog-write", message: UI_SERVER_MSG },
  { name: "@/lib/kernel/admin/prisma-catalog-write", message: UI_SERVER_MSG },
  { name: "@/lib/kernel/identity", message: UI_SERVER_MSG },
  { name: "@/lib/kernel/identity/display-name-write", message: UI_SERVER_MSG },
  { name: "@/lib/kernel/identity/billing-info-write", message: UI_SERVER_MSG },
  { name: "@/lib/kernel/identity/prisma-display-name-write", message: UI_SERVER_MSG },
  { name: "@/lib/kernel/identity/prisma-billing-info-store", message: UI_SERVER_MSG },
];

const uiServerPatterns = [
  {
    group: [
      "@/generated/prisma",
      "@/generated/prisma/*",
      "@/lib/**/prisma-store",
      "@/lib/**/prisma-*",
      "@/lib/**/runtime",
      "@/lib/**/engine",
      "@/lib/**/*-engine",
      "@/lib/kernel/admin/catalog-write",
      "@/lib/kernel/identity/display-name-write",
      "@/lib/kernel/identity/billing-info-write",
    ],
    message: UI_SERVER_MSG,
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "prefer-const": "error",
      "no-restricted-imports": restrictedImports(),
    },
  },
  {
    files: ["lib/kernel/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports({
        patterns: [{ group: kernelVerticalPatterns(), message: KERNEL_MSG }],
      }),
    },
  },
  ...LIVE_ROOMS.map((id) => ({
    files: [`lib/${id}/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": restrictedImports({
        paths: LIVE_ROOMS.filter((other) => other !== id).map((other) => ({
          name: `@/lib/${other}`,
          message: MODULE_ENGINE_MSG,
        })),
        patterns: [
          { group: otherModuleEnginePatterns(id), message: MODULE_ENGINE_MSG },
          ...earningsWallPatterns(id),
          ...academyCatalogLeakPatterns(id),
        ],
      }),
    },
  })),
  {
    files: ["lib/copy/**/*.{ts,tsx}", "lib/showcase/**/*.{ts,tsx}", "lib/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports({
        paths: LIVE_ROOMS.map((id) => ({
          name: `@/lib/${id}`,
          message: MODULE_ENGINE_MSG,
        })),
        patterns: [
          {
            group: LIVE_ROOMS.flatMap((id) => [
              `@/lib/${id}/engine`,
              `@/lib/${id}/runtime`,
              `@/lib/${id}/prisma-store`,
              `@/lib/${id}/prisma-*`,
              `@/lib/${id}/*-engine`,
            ]),
            message: MODULE_ENGINE_MSG,
          },
        ],
      }),
    },
  },
  {
    files: ["components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports({
        paths: uiServerPaths,
        patterns: uiServerPatterns,
      }),
    },
  },
  {
    files: ["app/**/*.{ts,tsx}"],
    ignores: ["app/api/**"],
    rules: {
      "no-restricted-imports": restrictedImports({
        paths: uiServerPaths,
        patterns: uiServerPatterns,
      }),
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "generated/**",
    "node_modules/**",
    "yetkin_muze/**",
    "scripts/**",
    "coverage/**",
    "apps/**",
    "archived/**",
  ]),
]);

export default eslintConfig;
