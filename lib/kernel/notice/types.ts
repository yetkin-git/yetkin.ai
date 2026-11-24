import type { CitizenNoticeKind } from "@/lib/kernel/notice/kinds";
import type { CommerceDailyBriefNoticeBody } from "@/lib/kernel/notice/kinds";

export type CitizenNotice = {
  kind: CitizenNoticeKind;
  userId: string;
  reference: string;
  applied: boolean;
  amountMinor?: number;
  requestId?: string;
  /** `commerce_daily_brief` için özet gövdesi. Diğer türlerde yoktur. */
  commerceBrief?: CommerceDailyBriefNoticeBody;
};

export type CitizenNoticeSink = (notice: CitizenNotice) => void;
