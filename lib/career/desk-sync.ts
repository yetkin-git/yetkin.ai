import "server-only";

import {
  planCareerDeskMutation,
  type CareerDeskCommand,
  type CareerDeskStatus,
} from "@/lib/career/desk-brief";
import { getPrisma } from "@/lib/kernel/db";

export type CareerDeskCommit =
  | { ok: true; status: CareerDeskStatus; replayed: boolean }
  | { ok: false; status: 404 | 409; error: string };

function asDeskStatus(value: string): CareerDeskStatus {
  if (value === "IN_PROGRESS" || value === "DELIVERED") {
    return value;
  }
  return "OPEN";
}

/** Görev satırını ve esnafın gelen kutu kaydını aynı duruma çeker. */
export async function commitCareerDeskCommand(
  userId: string,
  taskId: string,
  command: CareerDeskCommand,
): Promise<CareerDeskCommit> {
  const task = await getPrisma().careerDeskTask.findFirst({
    where: { id: taskId, userId },
  });
  if (!task) {
    return { ok: false, status: 404, error: "Görev çalışma odasında yok." };
  }
  const plan = planCareerDeskMutation(
    {
      status: asDeskStatus(task.status),
      deliveryTool: task.deliveryTool,
      deliveryFilename: task.deliveryFilename,
      deliverySummary: task.deliverySummary,
      deliveryBody: task.deliveryBody,
    },
    command,
  );
  if (!plan.ok) {
    return { ok: false, status: 409, error: "Bu durum geçişi kapalı." };
  }
  if (!plan.replayed) {
    const db = getPrisma();
    await db.$transaction([
      db.careerDeskTask.update({
        where: { id: task.id },
        data: {
          status: plan.next.status,
          deliveryTool: plan.next.deliveryTool,
          deliveryFilename: plan.next.deliveryFilename,
          deliverySummary: plan.next.deliverySummary,
          deliveryBody: plan.next.deliveryBody,
        },
      }),
      db.commerceInboxEntry.update({
        where: { id: task.inboxEntryId },
        data: {
          expertStatus: plan.inboxStatus,
          expertNote: plan.inboxNote,
        },
      }),
    ]);
  }
  return { ok: true, status: plan.next.status, replayed: plan.replayed };
}
