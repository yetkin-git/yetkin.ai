import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import { ASSISTANT_SEN } from "@/lib/copy/sen-voice/assistant";
import { AUTH_SEN } from "@/lib/copy/sen-voice/auth";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";
import { CUZDAN_SEN } from "@/lib/copy/sen-voice/cuzdan";
import { DASHBOARD_SEN, dashboardWelcomeTitle } from "@/lib/copy/sen-voice/dashboard";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import { NOTICE_SEN } from "@/lib/copy/sen-voice/notice";
import { PASAPORT_SEN } from "@/lib/copy/sen-voice/pasaport";
import { PROFIL_SEN } from "@/lib/copy/sen-voice/profil";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";

/**
 * Rail SEN aksı — yalnız canlı 4 oda + sığınaklar.
 * 410 envanteri bu barrel'da yoktur; donmuş oda copy yalnız
 * `archived/lib/copy/sen-voice/` altındadır. `verify:sen-axis` taramaz.
 */
export const SEN_VOICE = {
  academy: ACADEMY_SEN,
  admin: ADMIN_SEN,
  assistant: ASSISTANT_SEN,
  auth: AUTH_SEN,
  career: CAREER_SEN,
  cuzdan: CUZDAN_SEN,
  dashboard: DASHBOARD_SEN,
  freelancer: FREELANCER_SEN,
  notice: NOTICE_SEN,
  pasaport: PASAPORT_SEN,
  profil: PROFIL_SEN,
  public: PUBLIC_SEN,
  ux: UX_SEN,
} as const;

export {
  ACADEMY_SEN,
  ADMIN_SEN,
  ASSISTANT_SEN,
  AUTH_SEN,
  CAREER_SEN,
  CUZDAN_SEN,
  DASHBOARD_SEN,
  dashboardWelcomeTitle,
  FREELANCER_SEN,
  NOTICE_SEN,
  PASAPORT_SEN,
  PROFIL_SEN,
  PUBLIC_SEN,
  UX_SEN,
};
