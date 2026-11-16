import "server-only";

import {
  careerDeskBenchLinks,
  careerDeskLabel,
  careerDeskStatusLabel,
  isCareerDeskKind,
  type CareerDeskStatus,
} from "@/lib/career/desk-brief";
import { getPrisma } from "@/lib/kernel/db";

export type CareerDeskTaskView = {
  id: string;
  title: string;
  brief: string;
  kindLabel: string;
  status: CareerDeskStatus;
  statusLabel: string;
  deliverySummary: string;
  benches: { label: string; href: string }[];
};

function asDeskStatus(value: string): CareerDeskStatus {
  if (value === "IN_PROGRESS" || value === "DELIVERED") {
    return value;
  }
  return "OPEN";
}

export async function loadCareerDeskTasks(userId: string): Promise<CareerDeskTaskView[]> {
  try {
    const rows = await getPrisma().careerDeskTask.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 12,
    });
    return rows.flatMap((row) => {
      if (!isCareerDeskKind(row.kind)) {
        return [];
      }
      const status = asDeskStatus(row.status);
      return [
        {
          id: row.id,
          title: row.title,
          brief: row.brief,
          kindLabel: careerDeskLabel(row.kind),
          status,
          statusLabel: careerDeskStatusLabel(status),
          deliverySummary: row.deliverySummary,
          benches: careerDeskBenchLinks(row.kind, row.id),
        },
      ];
    });
  } catch {
    return [];
  }
}
