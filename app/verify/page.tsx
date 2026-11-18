import { permanentRedirect } from "next/navigation";

/** Kısa paylaşım alias'ı — kanonik mühür merkezi `/vize`. */
export default function VerifyLandingAliasPage() {
  permanentRedirect("/vize");
}
