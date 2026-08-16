"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import { RIBBON_ROOMS } from "@/lib/kernel/modules";
import {
  DEFAULT_RIBBON_ORDER,
  applyStoredRibbonOrder,
  moveRibbonRoom,
  readRibbonOrderFromStorage,
  writeRibbonOrderToStorage,
  type RibbonRoomId,
} from "@/lib/dashboard/ribbon-order";
import { ROOM_ICONS } from "@/components/ui/icons";
import { cn } from "@/components/ui/cn";

const RIBBON_DND_MIME = "application/x-yetkin-ribbon-room";

export function ModuleRibbon() {
  const [order, setOrder] = useState<RibbonRoomId[]>(() => [...DEFAULT_RIBBON_ORDER]);
  const [draggingId, setDraggingId] = useState<RibbonRoomId | null>(null);
  const [overId, setOverId] = useState<RibbonRoomId | null>(null);
  const ignoreClickRef = useRef(false);

  useEffect(() => {
    setOrder(applyStoredRibbonOrder(DEFAULT_RIBBON_ORDER, readRibbonOrderFromStorage()));
  }, []);

  const rooms = useMemo(() => {
    const byId = new Map(RIBBON_ROOMS.map((room) => [room.id, room]));
    return order.flatMap((id) => {
      const room = byId.get(id);
      return room ? [room] : [];
    });
  }, [order]);

  const persist = useCallback((next: RibbonRoomId[]) => {
    setOrder(next);
    writeRibbonOrderToStorage(next);
  }, []);

  const onDragStart = useCallback((event: DragEvent<HTMLLIElement>, id: RibbonRoomId) => {
    ignoreClickRef.current = true;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(RIBBON_DND_MIME, id);
    event.dataTransfer.setData("text/plain", id);
    setDraggingId(id);
  }, []);

  const onDragOver = useCallback((event: DragEvent<HTMLLIElement>, id: RibbonRoomId) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setOverId(id);
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLLIElement>, toId: RibbonRoomId) => {
      event.preventDefault();
      const fromId = event.dataTransfer.getData(RIBBON_DND_MIME) || event.dataTransfer.getData("text/plain");
      persist(moveRibbonRoom(order, fromId, toId));
      setDraggingId(null);
      setOverId(null);
    },
    [order, persist],
  );

  const onDragEnd = useCallback(() => {
    setDraggingId(null);
    setOverId(null);
  }, []);

  return (
    <div>
      <nav aria-label="On bir asil oda" className="overflow-x-auto scrollbar-none">
        <ul className="flex flex-wrap items-center gap-2.5">
          {rooms.map((room) => {
            const Icon = ROOM_ICONS[room.id];
            const dragging = draggingId === room.id;
            const over = overId === room.id && draggingId !== room.id;
            return (
              <li
                key={room.id}
                draggable
                onDragStart={(event) => onDragStart(event, room.id)}
                onDragOver={(event) => onDragOver(event, room.id)}
                onDragLeave={() => {
                  setOverId((current) => (current === room.id ? null : current));
                }}
                onDrop={(event) => onDrop(event, room.id)}
                onDragEnd={onDragEnd}
                aria-grabbed={dragging}
                className={cn(dragging && "opacity-50", over && "scale-[1.03]")}
              >
                <Link
                  href={room.path}
                  draggable={false}
                  title="Sürükleyerek sıranı değiştir"
                  onClick={(event) => {
                    if (ignoreClickRef.current) {
                      event.preventDefault();
                      ignoreClickRef.current = false;
                    }
                  }}
                  className={cn(
                    "inline-flex cursor-grab items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-xs font-semibold text-[var(--foreground)] shadow-sm transition hover:border-[var(--safir)] hover:text-[var(--safir-deep)] active:cursor-grabbing",
                    over && "border-[var(--safir)] ring-2 ring-[var(--safir-soft)]",
                  )}
                >
                  <Icon className="h-3.5 w-3.5 text-[var(--safir-deep)]" />
                  {room.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <p className="mt-2 text-[11px] leading-5 text-[var(--muted)]">
        Rozetleri sürükleyip bırakarak sıranı belirle; tercih bu tarayıcıda saklanır.
      </p>
    </div>
  );
}
