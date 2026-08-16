import { VERTICAL_ROOMS, type VerticalRoomId } from "@/lib/kernel/modules";
import { isYetkinIlanPath } from "@/lib/kernel/yetkinilan";

export type ThemedSurfaceId = VerticalRoomId | "kernel";

export const ROOM_NAV_ACCENT: Record<VerticalRoomId, string> = {
  dashboard: "bg-[var(--safir)] text-white",
  studio: "bg-[#7c5cff] text-white",
  academy: "bg-[#0f766e] text-white",
  career: "bg-[#1e3a5f] text-white",
  freelancer: "bg-[#c2410c] text-white",
  devlabs: "bg-[#3fb950] text-[#0d1117]",
  kurumsal: "bg-[#1e3a8a] text-white",
  hibe: "bg-[#0e4d92] text-white",
  arena: "bg-[#f5b942] text-[#140e08]",
  pazaryeri: "bg-[#b45309] text-white",
  junior: "bg-[#f43f5e] text-white",
  social: "bg-[#a21caf] text-white",
};

const ROOMS_BY_PATH_LENGTH = [...VERTICAL_ROOMS].sort((a, b) => b.path.length - a.path.length);

export function roomIdFromPath(pathname: string | null): ThemedSurfaceId {
  if (!pathname) {
    return "kernel";
  }
  if (isYetkinIlanPath(pathname)) {
    return "pazaryeri";
  }
  for (const room of ROOMS_BY_PATH_LENGTH) {
    if (pathname === room.path || pathname.startsWith(`${room.path}/`)) {
      return room.id;
    }
  }
  return "kernel";
}

export function roomLabelFromId(id: ThemedSurfaceId): string {
  if (id === "kernel") {
    return "Çekirdek";
  }
  return VERTICAL_ROOMS.find((room) => room.id === id)?.label ?? "Oda";
}
