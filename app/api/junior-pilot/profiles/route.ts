import { requireSession, type SessionUser } from "@/lib/kernel/auth/session";
import { juniorLockedResponse } from "@/lib/junior/surface-lock";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { createPrismaJuniorStore } from "@/lib/junior/load";
import { isJuniorPlanActive } from "@/lib/junior/plan";
import { juniorProfileSelectSchema } from "@/lib/junior/profile-rules";
import type { JuniorStore } from "@/lib/junior/ports";
import {
  confirmJuniorGuardianConsent,
  createJuniorProfile,
  eraseJuniorChildProfile,
  readJuniorHome,
  selectJuniorProfile,
} from "@/lib/junior/service";

export const auth = "session" as const;

/** Geçerli yıllık paket profil masasını açar. Sınıf kuralı oluşturma gövdesindedir. */
async function openJuniorProfileDesk(
  requestId: string,
  request: Request,
  user: SessionUser,
): Promise<{ store: JuniorStore; locked: Response | null }> {
  const store = createPrismaJuniorStore();
  const subscription = await store.getSubscription(user.id);
  const locked = juniorLockedResponse(requestId, request, user, "profile", {
    planCovers: isJuniorPlanActive(subscription, new Date()),
  });
  return { store, locked };
}

export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const { store, locked } = await openJuniorProfileDesk(requestId, request, user);
    if (locked) {
      return locked;
    }
    const home = await readJuniorHome(store, user.id);
    return jsonOk(
      {
        profiles: home.profiles,
        selectedId: home.selected?.id ?? null,
        xp: home.xp,
        courses: home.courses,
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const { store, locked } = await openJuniorProfileDesk(requestId, request, user);
    if (locked) {
      return locked;
    }
    const result = await createJuniorProfile(
      store,
      user.id,
      await request.json().catch(() => ({})),
    );
    if (!result.ok) {
      return jsonFail(result.error, result.status, requestId, request);
    }
    return jsonOk({ profile: result.data.profile }, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

export async function PATCH(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const { store, locked } = await openJuniorProfileDesk(requestId, request, user);
    if (locked) {
      return locked;
    }
    const parsed = juniorProfileSelectSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Profil seçilemedi.", 400, requestId, request);
    }
    const result = await selectJuniorProfile(store, user.id, parsed.data.profileId);
    if (!result.ok) {
      return jsonFail(result.error, result.status, requestId, request);
    }
    return jsonOk({ profile: result.data.profile }, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

export async function PUT(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const { store, locked } = await openJuniorProfileDesk(requestId, request, user);
    if (locked) {
      return locked;
    }
    const result = await confirmJuniorGuardianConsent(
      store,
      user.id,
      await request.json().catch(() => ({})),
    );
    if (!result.ok) {
      return jsonFail(result.error, result.status, requestId, request);
    }
    return jsonOk({ profile: result.data.profile }, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

export async function DELETE(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const { store, locked } = await openJuniorProfileDesk(requestId, request, user);
    if (locked) {
      return locked;
    }
    const parsed = juniorProfileSelectSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Profil seçilemedi.", 400, requestId, request);
    }
    const result = await eraseJuniorChildProfile(store, user.id, parsed.data.profileId);
    if (!result.ok) {
      return jsonFail(result.error, result.status, requestId, request);
    }
    return jsonOk({ erased: true, profileId: result.data.profileId }, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
