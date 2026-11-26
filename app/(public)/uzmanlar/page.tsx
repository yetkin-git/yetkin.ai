import { permanentRedirect } from "next/navigation";

/** Eski kamu dizini — kanonik vitrin `/career/vitrin`. */
export default function UzmanlarRedirectPage() {
  permanentRedirect("/career/vitrin");
}
