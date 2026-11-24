import { redirect } from "next/navigation";
import { requirePageSession } from "@/lib/kernel/auth/session";

export default async function MagazamListPage() {
  await requirePageSession();
  redirect("/panel/e-ticaret");
}
