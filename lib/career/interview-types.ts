export const CAREER_INTERVIEW_STATUSES = ["PENDING", "ACCEPTED", "DECLINED"] as const;
export type CareerInterviewStatus = (typeof CAREER_INTERVIEW_STATUSES)[number];

export type CareerInterviewInviteView = {
  id: string;
  requesterName: string;
  /** Aday panelinde gösterilir; adayın kendi e-postası basılmaz. */
  requesterEmail: string;
  message: string;
  status: CareerInterviewStatus;
  sealHash: string | null;
  createdAt: string;
  respondedAt: string | null;
};
