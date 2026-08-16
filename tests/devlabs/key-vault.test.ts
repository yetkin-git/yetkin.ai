import { describe, expect, it } from "vitest";
import {
  createDevLabsProject,
  issueDevLabsApiKey,
  revokeDevLabsApiKey,
} from "@/lib/devlabs/engine";
import { hashDevLabsApiKey, toCitizenDevLabsApiKey } from "@/lib/devlabs/keys";
import { createMemoryDevLabsStore } from "../helpers/memory-devlabs";

const OWNER = "devlabs-owner";
const OTHER = "devlabs-other";

describe("DevLabs anahtar kasası", () => {
  it("proje açar, anahtarı bir kez düz metin basar, kasa yalnızca hash tutar", async () => {
    const ports = { devlabs: createMemoryDevLabsStore() };
    const project = await createDevLabsProject(ports, {
      ownerUserId: OWNER,
      name: "Dar sandbox",
      summary: "Anahtar kasası yüzeyi.",
    });
    expect(project.sandboxKind).toBe("NARROW");

    const issued = await issueDevLabsApiKey(ports, {
      projectId: project.id,
      actorUserId: OWNER,
      name: "ci",
    });
    expect(issued.plaintext.startsWith("yrk_")).toBe(true);
    expect(issued.record.keyHash).toBe(hashDevLabsApiKey(issued.plaintext));
    expect(issued.record.keyPrefix).toBe(issued.plaintext.slice(0, 12));
    expect(JSON.stringify(issued.record)).not.toContain(issued.plaintext);

    const citizen = toCitizenDevLabsApiKey(issued.record);
    expect(citizen).not.toHaveProperty("keyHash");
    expect(citizen).not.toHaveProperty("plaintext");
    expect(JSON.stringify(citizen)).not.toContain(issued.plaintext);
    expect(JSON.stringify(citizen)).not.toContain(issued.record.keyHash);

    const stored = await ports.devlabs.getApiKey(issued.record.id);
    expect(stored?.keyHash).toBe(issued.record.keyHash);
    expect(stored).not.toHaveProperty("plaintext");
  });

  it("iptal idempotenttir; yabancı kullanıcı anahtar basamaz", async () => {
    const ports = { devlabs: createMemoryDevLabsStore() };
    const project = await createDevLabsProject(ports, {
      ownerUserId: OWNER,
      name: "Kasa",
      summary: "Yetki mührü.",
    });
    await expect(
      issueDevLabsApiKey(ports, {
        projectId: project.id,
        actorUserId: OTHER,
        name: "hırsız",
      }),
    ).rejects.toThrow();

    const issued = await issueDevLabsApiKey(ports, {
      projectId: project.id,
      actorUserId: OWNER,
      name: "prod",
    });
    const revoked = await revokeDevLabsApiKey(ports, {
      keyId: issued.record.id,
      actorUserId: OWNER,
    });
    expect(revoked.revokedAt).not.toBeNull();
    const again = await revokeDevLabsApiKey(ports, {
      keyId: issued.record.id,
      actorUserId: OWNER,
    });
    expect(again.revokedAt?.getTime()).toBe(revoked.revokedAt?.getTime());
  });
});
