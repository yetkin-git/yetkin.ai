import { ForbiddenError } from "@/lib/kernel/http/errors";

/**
 * Nesne-seviyesi yetki — Prisma BYPASSRLS olduğu için asıl sınır burasıdır.
 * Dikey odalar resource/action tanımlar; çekirdek rol ve matrisi tek kapıdan çözer.
 */

export type Actor = {
  readonly userId: string | null;
};

export const ACTOR_ROLES = ["owner", "participant", "third_party"] as const;
export type ActorRole = (typeof ACTOR_ROLES)[number];

export const RESOURCE_ACTIONS = [
  "read.summary",
  "read.secrets",
  "read.own_entry",
  "award",
] as const;
export type ResourceAction = (typeof RESOURCE_ACTIONS)[number];

export type ResourceRef = {
  readonly type: string;
  readonly id: string;
  readonly ownerId: string;
  readonly participantIds?: readonly string[];
};

export type Authorization = {
  readonly allowed: boolean;
  readonly role: ActorRole;
  readonly action: ResourceAction;
  readonly resourceType: string;
};

const ACTION_ROLES: Record<ResourceAction, ReadonlySet<ActorRole>> = {
  "read.summary": new Set(["owner", "participant", "third_party"]),
  "read.secrets": new Set(["owner"]),
  "read.own_entry": new Set(["owner", "participant"]),
  award: new Set(["owner"]),
};

export function actorFromUserId(userId: string | null | undefined): Actor {
  return { userId: userId ?? null };
}

export function resolveActorRole(actor: Actor, resource: ResourceRef): ActorRole {
  const userId = actor.userId;
  if (userId && userId === resource.ownerId) {
    return "owner";
  }
  if (userId && resource.participantIds?.includes(userId)) {
    return "participant";
  }
  return "third_party";
}

export function authorize(
  actor: Actor,
  action: ResourceAction,
  resource: ResourceRef,
): Authorization {
  const role = resolveActorRole(actor, resource);
  return {
    allowed: ACTION_ROLES[action].has(role),
    role,
    action,
    resourceType: resource.type,
  };
}

export function assertAuthorized(
  actor: Actor,
  action: ResourceAction,
  resource: ResourceRef,
): Authorization {
  const decision = authorize(actor, action, resource);
  if (!decision.allowed) {
    throw new ForbiddenError();
  }
  return decision;
}
