import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/** Anayasa §2.8 — 12 dikey oda. Kernel bunları import etmez. */
const VERTICAL_ROOMS = [
  "dashboard",
  "studio",
  "academy",
  "career",
  "freelancer",
  "devlabs",
  "kurumsal",
  "hibe",
  "arena",
  "pazaryeri",
  "junior",
  "social",
];

const MUSEUM_MSG = "S9-B: yetkin.ai müze importu yasaktır. Rail build dışı.";
const KERNEL_MSG =
  "Anayasa §2.8: lib/kernel dikey oda import etmez. Kontrat kernel’de kalır.";
const MODULE_ENGINE_MSG =
  "Anayasa §2.8: dikey oda başka odanın engine/runtime/prisma-store dosyasını import etmez. İletişim HTTP veya kernel kontratı.";
const EARNINGS_WALL_MSG =
  "D2.3 oda duvarı (room.wall / EARNINGS_WALL): freelancer ↛ kurumsal/kariyer; kurumsal ↛ freelancer/kariyer. Teklif kapısı HTTP; emanet çekirdektedir.";
const UI_SERVER_MSG =
  "UI katmanı Prisma / server-only yazma motoru import etmez. Yazma tekil API rotasından gider.";

const museumPaths = [{ name: "yetkin.ai", message: MUSEUM_MSG }];
const museumPatterns = [
  { group: ["yetkin.ai/*", "@/yetkin.ai", "@/yetkin.ai/*"], message: MUSEUM_MSG },
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
  return VERTICAL_ROOMS.flatMap((id) => [`@/lib/${id}`, `@/lib/${id}/*`]);
}

function otherModuleEnginePatterns(self) {
  return VERTICAL_ROOMS.filter((id) => id !== self).flatMap((id) => [
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
        group: ["@/lib/kurumsal", "@/lib/kurumsal/*", "@/lib/career", "@/lib/career/*"],
        message: EARNINGS_WALL_MSG,
      },
    ];
  }
  if (self === "kurumsal") {
    return [
      {
        group: ["@/lib/freelancer", "@/lib/freelancer/*", "@/lib/career", "@/lib/career/*"],
        message: EARNINGS_WALL_MSG,
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
  { name: "@/lib/kernel/identity/prisma-display-name-write", message: UI_SERVER_MSG },
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
  ...VERTICAL_ROOMS.map((id) => ({
    files: [`lib/${id}/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": restrictedImports({
        paths: VERTICAL_ROOMS.filter((other) => other !== id).map((other) => ({
          name: `@/lib/${other}`,
          message: MODULE_ENGINE_MSG,
        })),
        patterns: [
          { group: otherModuleEnginePatterns(id), message: MODULE_ENGINE_MSG },
          ...earningsWallPatterns(id),
        ],
      }),
    },
  })),
  {
    files: ["lib/copy/**/*.{ts,tsx}", "lib/showcase/**/*.{ts,tsx}", "lib/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports({
        paths: VERTICAL_ROOMS.map((id) => ({
          name: `@/lib/${id}`,
          message: MODULE_ENGINE_MSG,
        })),
        patterns: [
          {
            group: VERTICAL_ROOMS.flatMap((id) => [
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
    "yetkin.ai/**",
    "scripts/**",
    "coverage/**",
  ]),
]);

export default eslintConfig;
