import { permanentRedirect } from "next/navigation";
import { PUBLIC_TALENT_PATH } from "@/lib/career/public-talent";

export default function PublicTalentAliasLandingPage() {
  permanentRedirect(PUBLIC_TALENT_PATH);
}
