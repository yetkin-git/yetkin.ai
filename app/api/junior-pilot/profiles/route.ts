import { requireSession } from "@/lib/kernel/auth/session";
import { juniorLockedResponse } from "@/lib/junior/surface-lock";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { createPrismaJuniorStore } from "@/lib/junior/load";
import { juniorProfileSelectSchema } from "@/lib/junior/profile-rules";
import {
  confirmJuniorGuardianConsent,
  createJuniorProfile,
  eraseJuniorChildProfile,
  readJuniorHome,
  selectJuniorProfile,
} from "@/lib/junior/service";

export const auth = "session" as const;

export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const locked = juniorLockedResponse(requestId, request, user);
    if (locked) {
      return locked;
    }
    const home = await readJuniorHome(createPrismaJuniorStore(), user.id);
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
    const locked = juniorLockedResponse(requestId, request, user);
    if (locked) {
      return locked;
    }
    const result = await createJuniorProfile(
      createPrismaJuniorStore(),
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
    const locked = juniorLockedResponse(requestId, request, user);
    if (locked) {
      return locked;
    }
    const parsed = juniorProfileSelectSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Profil seçilemedi.", 400, requestId, request);
    }
    const result = await selectJuniorProfile(createPrismaJuniorStore(), user.id, parsed.data.profileId);
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
    const locked = juniorLockedResponse(requestId, request, user);
    if (locked) {
      return locked;
    }
    const result = await confirmJuniorGuardianConsent(
      createPrismaJuniorStore(),
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
    const locked = juniorLockedResponse(requestId, request, user);
    if (locked) {
      return locked;
    }
    const parsed = juniorProfileSelectSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Profil seçilemedi.", 400, requestId, request);
    }
    const result = await eraseJuniorChildProfile(createPrismaJuniorStore(), user.id, parsed.data.profileId);
    if (!result.ok) {
      return jsonFail(result.error, result.status, requestId, request);
    }
    return jsonOk({ erased: true, profileId: result.data.profileId }, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
