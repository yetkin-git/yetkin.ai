/**
 * `dron:new` saf planı. Disk yazmaz.
 * Üretilen hop `RAIL_V1_HOPS_META` kuyruğuna girer. `dronForbidden` yazılmaz.
 */

export type DronScaffoldInput = {
  id: string;
  kayitSource: string;
  onboardingSource: string;
  envExampleSource: string;
  runbookSource: string;
  opsDronSource: string;
  hopCount: number;
};

export type DronScaffoldFile = {
  path: string;
  contents: string;
};

const ID_RE = /^[a-z][a-z0-9-]{1,31}$/;

function newline(source: string): string {
  return source.includes("\r\n") ? "\r\n" : "\n";
}

export function assertDronId(id: string): string {
  const trimmed = id.trim();
  if (!ID_RE.test(trimmed)) {
    throw new Error("Kullanım: npm run dron:new -- --id=ornek-dron  (kebab-case, 2–32 karakter)");
  }
  return trimmed;
}

export function dronEnvName(id: string): string {
  return `DRON_${id.toUpperCase().replace(/-/g, "_")}_OPEN`;
}

export function dronExpoEnvName(id: string): string {
  return `EXPO_PUBLIC_${dronEnvName(id)}`;
}

export function dronHopId(id: string): string {
  return `${id}-pulse`;
}

export function dronTitle(id: string): string {
  return id
    .split("-")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

export function dronModelName(id: string): string {
  return `${dronTitle(id).replace(/\s+/g, "")}Pulse`;
}

export function dronHopExportName(id: string): string {
  const [head, ...rest] = id.split("-");
  const camel = [
    head ?? id,
    ...rest.map((part) => part.slice(0, 1).toUpperCase() + part.slice(1)),
  ].join("");
  return `${camel}PulseHop`;
}

function frozenIds(kayitSource: string): string[] {
  const match = kayitSource.match(/export const FROZEN_DISK_ROOMS = \[([\s\S]*?)\] as const;/);
  if (!match?.[1]) {
    return [];
  }
  return [...match[1].matchAll(/"([a-z0-9-]+)"/g)].map((row) => row[1] ?? "");
}

function insertBefore(source: string, marker: string, block: string): string {
  const index = source.indexOf(marker);
  if (index < 0) {
    throw new Error(`işaret yok: ${marker}`);
  }
  return `${source.slice(0, index)}${block}${source.slice(index)}`;
}

function insertAfterLine(source: string, marker: string, line: string): string {
  const index = source.indexOf(marker);
  if (index < 0) {
    throw new Error(`işaret yok: ${marker}`);
  }
  const nl = newline(source);
  const lineEnd = source.indexOf(nl, index);
  if (lineEnd < 0) {
    throw new Error(`işaret satırı kapanmıyor: ${marker}`);
  }
  return `${source.slice(0, lineEnd + nl.length)}${line}${nl}${source.slice(lineEnd + nl.length)}`;
}

function bumpKayitCount(source: string, from: number): string {
  const needle = `**${from} kayıt**`;
  if (!source.includes(needle)) {
    throw new Error(`kayıt sayısı bulunamadı: ${needle}`);
  }
  return source.replace(needle, `**${from + 1} kayıt**`);
}

function kayitRow(id: string, nl: string): string {
  const env = dronEnvName(id);
  const hop = dronHopId(id);
  return [
    "  {",
    `    id: "${id}",`,
    `    path: "/${id}",`,
    `    label: "${dronTitle(id)}",`,
    `    blurb: "Kapalı dron — bayrak ile açılır",`,
    `    hops: ["${hop}"],`,
    `    sahipEkip: "gövde",`,
    "    kapali: true,",
    "    vitrin: true,",
    `    bayrakEnv: "${env}",`,
    "  },",
    "",
  ].join(nl);
}

function prismaDraft(id: string): string {
  const model = dronModelName(id);
  const table = `${id.replace(/-/g, "_")}_pulse`;
  return `// Taslak oda şeması — npm run dron:new üretir.
// Çekirdek (User, Wallet, LedgerEntry, PaymentOrder) bu tabloya yazmaz.
// FK ve sahip delegate oda açılınca lib/${id} sahibine bağlanır.
// datasource ve generator base.prisma'dadır.

model ${model} {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@map("${table}")
}
`;
}

function libIndex(id: string): string {
  const env = dronEnvName(id);
  const hop = dronHopId(id);
  return `export const MODULE_ID = ${JSON.stringify(id)} as const;

/** Kapalı doğar. Açmak: ${env}=1. Nabız hop'u ${hop}; yol RAIL_V1_HOPS_META. */
export const DRON_HAPPY_PATH = ["pulse"] as const;
`;
}

function roomHop(id: string): string {
  const hop = dronHopId(id);
  const exportName = dronHopExportName(id);
  return `import type { RailV1HopMeta } from "../v1-hops-meta";

/** ${id} nabız hop'u. Oda kapısı ${dronEnvName(id)}. */
export const ${exportName} = {
  id: "${hop}",
  method: "GET",
  v1PathTemplate: "/api/v1/${id}/pulse",
  v1Auth: "bearer",
  cookieAuth: false,
} as const satisfies RailV1HopMeta;
`;
}

function roomSchema(id: string): string {
  const exportName = dronHopExportName(id).replace(/Hop$/, "DataSchema");
  return `import { z } from "zod";

/** ${id} nabız gövdesi. dronId sabittir. Sözleşme bind'i ortak zarfı kullanır. */
export const ${exportName} = z.strictObject({
  pulse: z.strictObject({
    live: z.boolean(),
    dronId: z.literal("${id}"),
    userId: z.uuid(),
  }),
});
`;
}

function apiRoute(id: string): string {
  return `import { DronBayrakları } from "@/lib/dronlar/kayit";
import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { EDGE_API_FROZEN_ROOM_ERROR } from "@/lib/kernel/security/edge-api-auth";

export const auth = "session" as const;

/** Kapalı oda 410. Açıkken nabız RAIL_V1_HOPS_META nabız şemasına uyar. */
export async function GET(request: Request) {
  try {
    if (DronBayrakları.isKapali(${JSON.stringify(id)})) {
      return jsonFail(EDGE_API_FROZEN_ROOM_ERROR, 410, undefined, request);
    }
    const user = await requireSession(request);
    return jsonOk(
      {
        pulse: {
          live: false,
          dronId: ${JSON.stringify(id)},
          userId: user.id,
        },
      },
      200,
      undefined,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
`;
}

function expoPackage(id: string): string {
  const pkg = {
    name: `yetkin-dron-${id}`,
    version: "0.0.1",
    private: true,
    description: `${dronTitle(id)} dron kabuğu. Hop yolu @yetkin/kernel RAIL_V1_HOPS_META. Kapalıyken hop çağrılmaz.`,
    main: "index.ts",
    scripts: {
      start: "expo start",
      android: "expo start --android",
      ios: "expo start --ios",
      typecheck: "tsc --noEmit",
    },
    dependencies: {
      "@yetkin/kernel": "file:../../packages/kernel",
      expo: "~57.0.14",
      react: "19.2.8",
      "react-native": "0.86.2",
    },
    devDependencies: {
      "@types/react": "~19.2.2",
      typescript: "~5.9.2",
    },
  };
  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function expoTsconfig(): string {
  return `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "strict": true,
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "noEmit": true,
    "skipLibCheck": true,
    "noUncheckedIndexedAccess": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "paths": {
      "@yetkin/kernel": ["../../packages/kernel/src/index.ts"],
      "@yetkin/kernel/*": ["../../packages/kernel/src/*"]
    }
  },
  "include": ["index.ts", "App.tsx"]
}
`;
}

function expoIndex(): string {
  return `import { registerRootComponent } from "expo";
import App from "./App";

registerRootComponent(App);
`;
}

function expoApp(id: string): string {
  const hop = dronHopId(id);
  const expoEnv = dronExpoEnvName(id);
  return `import { Text, View } from "react-native";
import { RAIL_V1_HOPS_META } from "@yetkin/kernel/http/v1-hops-meta";

const HOP_ID = ${JSON.stringify(hop)};

function isRoomOpen(raw: string | undefined): boolean {
  const flag = raw?.trim().toLowerCase();
  return flag === "1" || flag === "true" || flag === "open";
}

/** Kapalıyken null. Açıkken yol yalnız sicildendir. HTTP bu kabukta yok. */
export function pulsePathIfOpen(raw: string | undefined): string | null {
  if (!isRoomOpen(raw)) {
    return null;
  }
  const hop = RAIL_V1_HOPS_META.find((row) => row.id === HOP_ID);
  if (!hop) {
    throw new Error("Hop sicilde yok.");
  }
  return hop.v1PathTemplate;
}

export default function App() {
  const path = pulsePathIfOpen(process.env.${expoEnv});
  if (!path) {
    return (
      <View>
        <Text>Oda kapalı</Text>
      </View>
    );
  }
  return (
    <View>
      <Text>{path}</Text>
    </View>
  );
}
`;
}

function expoAppJson(id: string): string {
  return `${JSON.stringify(
    {
      expo: {
        name: dronTitle(id),
        slug: id,
        version: "0.0.1",
      },
    },
    null,
    2,
  )}\n`;
}

export function planDronScaffold(input: DronScaffoldInput): DronScaffoldFile[] {
  const id = assertDronId(input.id);
  if (new RegExp(`\\bid:\\s*"${id}"`).test(input.kayitSource)) {
    throw new Error(`Dron zaten kayıtlı: ${id}`);
  }
  if (frozenIds(input.kayitSource).includes(id)) {
    throw new Error(`${id} donmuş disk odasıdır; yeni dron olamaz.`);
  }
  if (!Number.isInteger(input.hopCount) || input.hopCount < 1) {
    throw new Error("hop sayısı geçersiz");
  }
  const hopExport = dronHopExportName(id);
  if (input.onboardingSource.includes(hopExport)) {
    throw new Error(`Hop zaten sicil kuyruğunda: ${hopExport}`);
  }

  const kayitStart = input.kayitSource.indexOf("export const DRON_KAYIT = [");
  const kayitEnd = kayitStart < 0 ? -1 : input.kayitSource.indexOf("] as const;", kayitStart);
  if (kayitStart < 0 || kayitEnd < 0) {
    throw new Error("DRON_KAYIT kapanışı beklenen biçimde değil; kayit.ts elle güncellenir.");
  }
  const nl = newline(input.kayitSource);
  const kayitSource = `${input.kayitSource.slice(0, kayitEnd)}${kayitRow(id, nl)}${input.kayitSource.slice(kayitEnd)}`;

  const onboardingSource = insertBefore(
    insertAfterLine(
      input.onboardingSource,
      "// dron:new imports",
      `import { ${hopExport} } from "./onboarding/${id}-hop";`,
    ),
    "// dron:new hops",
    `${hopExport},${nl}  `,
  );

  const envName = dronEnvName(id);
  const envExampleSource = insertBefore(
    input.envExampleSource,
    "# dron:new flags",
    `${envName}="false"${newline(input.envExampleSource)}`,
  );

  return [
    { path: "lib/dronlar/kayit.ts", contents: kayitSource },
    { path: "packages/kernel/src/http/dron-onboarding-hops.ts", contents: onboardingSource },
    { path: ".env.example", contents: envExampleSource },
    { path: ".system_docs/OPS_RUNBOOK.md", contents: bumpKayitCount(input.runbookSource, input.hopCount) },
    { path: ".system_docs/ops/ops-dron.md", contents: bumpKayitCount(input.opsDronSource, input.hopCount) },
    { path: `prisma/schema/${id}.prisma`, contents: prismaDraft(id) },
    { path: `lib/${id}/index.ts`, contents: libIndex(id) },
    { path: `app/api/${id}/pulse/route.ts`, contents: apiRoute(id) },
    { path: `packages/kernel/src/http/onboarding/${id}-hop.ts`, contents: roomHop(id) },
    { path: `packages/kernel/src/http/onboarding/${id}-schema.ts`, contents: roomSchema(id) },
    { path: `apps/${id}/package.json`, contents: expoPackage(id) },
    { path: `apps/${id}/tsconfig.json`, contents: expoTsconfig() },
    { path: `apps/${id}/index.ts`, contents: expoIndex() },
    { path: `apps/${id}/App.tsx`, contents: expoApp(id) },
    { path: `apps/${id}/app.json`, contents: expoAppJson(id) },
  ];
}
