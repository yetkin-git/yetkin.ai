export const MODULE_ID = "devlabs" as const;

export const DEVLABS_HAPPY_PATH = ["project", "issue-key", "generate", "lint", "artifact"] as const;

export const DEVLABS_SANDBOX_KIND = "NARROW" as const;

export const DEVLABS_MODULE_KEY = "devlabs" as const;

export const DEVLABS_CODE_UNIT_KEY = "generation:code" as const;

export const DEVLABS_GENERATION_ROLE = "FAST_STREAM" as const;

export type DevLabsHappyPathStep = (typeof DEVLABS_HAPPY_PATH)[number];

export type DevLabsProjectStatus = "ACTIVE" | "ARCHIVED";
export type DevLabsSandboxKind = "NARROW";

export type DevLabsProjectRecord = {
  id: string;
  userId: string;
  name: string;
  summary: string;
  status: DevLabsProjectStatus;
  sandboxKind: DevLabsSandboxKind;
  createdAt: Date;
  updatedAt: Date;
};

export type DevLabsApiKeyRecord = {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  revokedAt: Date | null;
  createdAt: Date;
};

export type IssuedDevLabsApiKey = {
  record: DevLabsApiKeyRecord;
  plaintext: string;
};

export type DevLabsPulse = {
  projectsCount: number;
  activeKeysCount: number;
  revokedKeysCount: number;
  artifactsCount: number;
};

export type DevLabsArtifactRecord = {
  id: string;
  projectId: string;
  userId: string;
  apiKeyId: string;
  prompt: string;
  outputCode: string;
  linterOk: boolean;
  linterScore: number;
  linterReportJson: string;
  contentHash: string;
  roleKey: string;
  provider: string | null;
  model: string | null;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costMinor: number;
  debitMinor: number;
  currencyCode: string;
  usageId: string | null;
  ledgerDebitKey: string | null;
  createdAt: Date;
};

export type DevLabsStore = {
  insertProject(project: DevLabsProjectRecord): Promise<DevLabsProjectRecord>;
  getProject(id: string): Promise<DevLabsProjectRecord | null>;
  listProjectsByOwner(userId: string): Promise<DevLabsProjectRecord[]>;
  updateProject(
    id: string,
    patch: Partial<Pick<DevLabsProjectRecord, "name" | "summary" | "status" | "updatedAt">>,
  ): Promise<DevLabsProjectRecord>;
  insertApiKey(key: DevLabsApiKeyRecord): Promise<DevLabsApiKeyRecord>;
  getApiKey(id: string): Promise<DevLabsApiKeyRecord | null>;
  listApiKeysForProject(projectId: string): Promise<DevLabsApiKeyRecord[]>;
  updateApiKey(
    id: string,
    patch: Partial<Pick<DevLabsApiKeyRecord, "revokedAt">>,
  ): Promise<DevLabsApiKeyRecord>;
  insertArtifact(artifact: DevLabsArtifactRecord): Promise<DevLabsArtifactRecord>;
  getArtifact(id: string): Promise<DevLabsArtifactRecord | null>;
  listArtifactsForProject(projectId: string): Promise<DevLabsArtifactRecord[]>;
  pulseForUser(userId: string): Promise<DevLabsPulse>;
};
