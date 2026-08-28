import { describe, expect, it } from "vitest";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import {
  actorFromUserId,
  assertAuthorized,
  authorize,
  resolveActorRole,
} from "@/lib/kernel/security/authorize";

const OWNER = "owner-1";
const BIDDER = "bidder-1";
const STRANGER = "stranger-1";

const job = {
  type: "freelancer.job",
  id: "job-1",
  ownerId: OWNER,
  participantIds: [BIDDER],
};

const bid = {
  type: "freelancer.bid",
  id: "bid-1",
  ownerId: OWNER,
  participantIds: [BIDDER],
};

describe("authorize(actor, action, resource)", () => {
  it("ilan sahibi sırları okur; teklifçi yalnız kendi kaydını; üçüncü şahıs özeti", () => {
    expect(resolveActorRole(actorFromUserId(OWNER), job)).toBe("owner");
    expect(resolveActorRole(actorFromUserId(BIDDER), job)).toBe("participant");
    expect(resolveActorRole(actorFromUserId(STRANGER), job)).toBe("third_party");
    expect(resolveActorRole(actorFromUserId(null), job)).toBe("third_party");

    expect(authorize(actorFromUserId(OWNER), "read.secrets", job).allowed).toBe(true);
    expect(authorize(actorFromUserId(BIDDER), "read.secrets", job).allowed).toBe(false);
    expect(authorize(actorFromUserId(null), "read.secrets", job).allowed).toBe(false);

    expect(authorize(actorFromUserId(BIDDER), "read.own_entry", bid).allowed).toBe(true);
    expect(authorize(actorFromUserId(STRANGER), "read.own_entry", bid).allowed).toBe(false);
    expect(authorize(actorFromUserId(null), "read.own_entry", bid).allowed).toBe(false);

    expect(authorize(actorFromUserId(null), "read.summary", job).allowed).toBe(true);
    expect(authorize(actorFromUserId(STRANGER), "award", job).allowed).toBe(false);
    expect(authorize(actorFromUserId(OWNER), "award", job).allowed).toBe(true);
  });

  it("izin yoksa ForbiddenError", () => {
    expect(() => assertAuthorized(actorFromUserId(STRANGER), "read.secrets", job)).toThrow(
      ForbiddenError,
    );
    expect(assertAuthorized(actorFromUserId(OWNER), "read.secrets", job).role).toBe("owner");
  });
});
