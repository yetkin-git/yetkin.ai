export const MODULE_ID = "devlabs" as const;

/** S59-A — generate + linter + artifact; exec yok. */
export { DEVLABS_HAPPY_PATH, DEVLABS_SANDBOX_KIND, DEVLABS_MODULE_KEY, DEVLABS_CODE_UNIT_KEY } from "@/lib/devlabs/types";
export type { DevLabsHappyPathStep } from "@/lib/devlabs/types";

export { createDevLabsProject, issueDevLabsApiKey, revokeDevLabsApiKey } from "@/lib/devlabs/engine";
export { generateDevLabsCode } from "@/lib/devlabs/bench";
export { lintConstitutionalSource } from "@/lib/devlabs/constitutional-linter";
export {
  createProjectInputSchema,
  issueApiKeyInputSchema,
  generateDevLabsCodeInputSchema,
} from "@/lib/devlabs/schemas";
export { hashDevLabsApiKey, toCitizenDevLabsApiKey } from "@/lib/devlabs/keys";
export type {
  DevLabsApiKeyRecord,
  DevLabsArtifactRecord,
  DevLabsProjectRecord,
  DevLabsPulse,
  DevLabsStore,
  IssuedDevLabsApiKey,
} from "@/lib/devlabs/types";
