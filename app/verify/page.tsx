import { permanentRedirect } from "next/navigation";
import { ACADEMY_STAMP_SURFACE_PATH } from "@/lib/kernel/passport/types";

/** Kısa paylaşım alias'ı — kanonik sicil `/academy/dogrula`. */
export default function VerifyLandingAliasPage() {
  permanentRedirect(`${ACADEMY_STAMP_SURFACE_PATH}/dogrula`);
}
