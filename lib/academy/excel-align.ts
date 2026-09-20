/**
 * Seçim kutusu geometrisi — yaprak SSOT.
 * excel-workspace cinema kataloğunu çeker; Outlook/PPTX hizası o grafa girmez (TDZ yasak).
 */

export type AcademyExcelAlignBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/**
 * Seçim kutusunu wrap yerel pikseline çevirir — CSS scale zoom’u ayırır.
 * Overlay `academy-excel-grid-wrap` içinde `left` / `width` olarak basılır.
 */
export function academyExcelAlignBox(
  cell: Pick<DOMRect, "left" | "top" | "width" | "height">,
  wrap: Pick<DOMRect, "left" | "top" | "width" | "height">,
  layout: { offsetWidth: number; offsetHeight: number; scrollLeft: number; scrollTop: number },
): AcademyExcelAlignBox {
  const scaleX = layout.offsetWidth > 0 ? wrap.width / layout.offsetWidth : 1;
  const scaleY = layout.offsetHeight > 0 ? wrap.height / layout.offsetHeight : 1;
  const sx = Number.isFinite(scaleX) && scaleX !== 0 ? scaleX : 1;
  const sy = Number.isFinite(scaleY) && scaleY !== 0 ? scaleY : 1;
  return {
    left: (cell.left - wrap.left) / sx + layout.scrollLeft,
    top: (cell.top - wrap.top) / sy + layout.scrollTop,
    width: cell.width / sx,
    height: cell.height / sy,
  };
}
