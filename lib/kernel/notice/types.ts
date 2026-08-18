import type { CitizenNoticeKind } from "@/lib/kernel/notice/kinds";

export type CitizenNotice = {
  kind: CitizenNoticeKind;
  userId: string;
  reference: string;
  applied: boolean;
  amountMinor?: number;
  requestId?: string;
};

export type CitizenNoticeSink = (notice: CitizenNotice) => void;
