/**
 * İstemci kaydırıcısının sunucu simülasyonuyla aynı girdileri.
 * Kanal komisyonu, düz kargo ve kayıtlı iade oranı; desi baremi bu hesaba girmez.
 */

export type ChannelPreviewEconomics = {
  commissionBps: number;
  cargoMinorPerOrder: number;
  returnRateBps: number;
  adCostMinorPerOrder: number;
};

export function campaignPreviewInput(input: {
  priceMinor: number;
  discountBps: number;
  costMinor: number;
  vatBps: number;
  channel: ChannelPreviewEconomics;
  costIncludesVat?: boolean;
}) {
  return {
    priceMinor: input.priceMinor,
    discountBps: input.discountBps,
    cogsMinor: input.costMinor,
    commissionBps: input.channel.commissionBps,
    cargoMinor: input.channel.cargoMinorPerOrder,
    returnBps: input.channel.returnRateBps,
    adCostMinor: input.channel.adCostMinorPerOrder,
    vatBps: input.vatBps,
    costIncludesVat: input.costIncludesVat === true,
  };
}
