import { VERTICAL_ROOMS, type VerticalRoomId } from "@/lib/kernel/modules";
import {
  FROZEN_DISK_ROOM_CATALOG,
  type FrozenShellRoomId,
} from "@/lib/kernel/compliance/circuit-breakers";
import { isYetkinIlanPath } from "@/lib/kernel/yetkinilan";

export type ThemedSurfaceId = VerticalRoomId | FrozenShellRoomId | "kernel";

export const ROOM_NAV_ACCENT: Record<VerticalRoomId, string> = {
  dashboard: "bg-[var(--safir)] text-white",
  academy: "bg-[#0f766e] text-white",
  career: "bg-[#1e3a5f] text-white",
  freelancer: "bg-[#c2410c] text-white",
};

const WORKING_BY_PATH = [...VERTICAL_ROOMS].sort((a, b) => b.path.length - a.path.length);
const FROZEN_BY_PATH = [...FROZEN_DISK_ROOM_CATALOG].sort(
  (a, b) => Math.max(b.path.length, b.diskPath.length) - Math.max(a.path.length, a.diskPath.length),
);

export function roomIdFromPath(pathname: string | null): ThemedSurfaceId {
  if (!pathname) {
    return "kernel";
  }
  if (isYetkinIlanPath(pathname)) {
    return "pazaryeri";
  }
  for (const room of WORKING_BY_PATH) {
    if (pathname === room.path || pathname.startsWith(`${room.path}/`)) {
      return room.id;
    }
  }
  for (const room of FROZEN_BY_PATH) {
    if (
      pathname === room.path ||
      pathname.startsWith(`${room.path}/`) ||
      pathname === room.diskPath ||
      pathname.startsWith(`${room.diskPath}/`)
    ) {
      return room.id;
    }
  }
  return "kernel";
}

export function roomLabelFromId(id: ThemedSurfaceId): string {
  if (id === "kernel") {
    return "Çekirdek";
  }
  const working = VERTICAL_ROOMS.find((room) => room.id === id);
  if (working) {
    return working.label;
  }
  return FROZEN_DISK_ROOM_CATALOG.find((room) => room.id === id)?.label ?? "Oda";
}
