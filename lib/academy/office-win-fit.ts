/**
 * Sinema masası simülatör penceresi — object-fit: contain / scale-down.
 * Flex share kartları ezmez; pencere doğal boyutta ölçülür, 16:9 tuvale sığacak
 * kadar tek ölçekle küçülür. Focus-zoom aynı matrise biner; AABB waiter dışına çıkmaz.
 */

export const ACADEMY_WIDESCREEN_RATIO = 16 / 9;
export const ACADEMY_WIDESCREEN_RATIO_MIN = 1.76;
export const ACADEMY_WIDESCREEN_RATIO_MAX = 1.79;

export type AcademyOfficeAabb = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type AcademyOfficeContainCamera = {
  scale: number;
  tx: number;
  ty: number;
  originX: number;
  originY: number;
  aabb: AcademyOfficeAabb;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function academyOfficeWinFitScale(input: {
  paneWidth: number;
  paneHeight: number;
  contentWidth: number;
  contentHeight: number;
}): number {
  const paneW = input.paneWidth;
  const paneH = input.paneHeight;
  if (paneW <= 0 || paneH <= 0) {
    return 1;
  }
  const contentW = Math.max(input.contentWidth, 1);
  const contentH = Math.max(input.contentHeight, 1);
  return Math.min(1, paneW / contentW, paneH / contentH);
}

/** Zoom dahil en büyük contain ölçeği — pane dışına taşmaz (1’in üstü letterbox varken). */
export function academyOfficeContainMaxScale(input: {
  paneWidth: number;
  paneHeight: number;
  contentWidth: number;
  contentHeight: number;
}): number {
  const paneW = input.paneWidth;
  const paneH = input.paneHeight;
  if (paneW <= 0 || paneH <= 0) {
    return 1;
  }
  return Math.min(paneW / Math.max(input.contentWidth, 1), paneH / Math.max(input.contentHeight, 1));
}

/**
 * Win-fit + focus-zoom tek matris. Zoom büyürse ölçek pane AABB’sine clamp edilir;
 * originRef merkeze çekilir, kutu waiter dışına çıkmaz.
 */
export function academyOfficeContainCamera(input: {
  paneWidth: number;
  paneHeight: number;
  contentWidth: number;
  contentHeight: number;
  originX?: number;
  originY?: number;
  zoom?: number;
  lockTopLeft?: boolean;
}): AcademyOfficeContainCamera {
  const paneW = input.paneWidth;
  const paneH = input.paneHeight;
  const contentW = Math.max(input.contentWidth, 1);
  const contentH = Math.max(input.contentHeight, 1);
  const fit = academyOfficeWinFitScale({
    paneWidth: paneW,
    paneHeight: paneH,
    contentWidth: contentW,
    contentHeight: contentH,
  });
  const zoom = Number.isFinite(input.zoom) ? Math.max(1, input.zoom as number) : 1;
  const maxScale = academyOfficeContainMaxScale({
    paneWidth: paneW,
    paneHeight: paneH,
    contentWidth: contentW,
    contentHeight: contentH,
  });
  const scale = Math.min(fit * zoom, maxScale);
  const lockTopLeft = input.lockTopLeft === true || zoom <= 1.001;
  const originX = lockTopLeft ? 0 : clamp(input.originX ?? contentW / 2, 0, contentW);
  const originY = lockTopLeft ? 0 : clamp(input.originY ?? contentH / 2, 0, contentH);
  const scaledW = contentW * scale;
  const scaledH = contentH * scale;
  let tx = 0;
  let ty = 0;
  if (!lockTopLeft) {
    tx = paneW / 2 - originX * scale;
    ty = paneH / 2 - originY * scale;
    const minTx = Math.min(0, paneW - scaledW);
    const maxTx = Math.max(0, paneW - scaledW);
    const minTy = Math.min(0, paneH - scaledH);
    const maxTy = Math.max(0, paneH - scaledH);
    tx = clamp(tx, minTx, maxTx);
    ty = clamp(ty, minTy, maxTy);
  }
  return {
    scale,
    tx,
    ty,
    originX,
    originY,
    aabb: { left: tx, top: ty, width: scaledW, height: scaledH },
  };
}

export function academyOfficeAabbInsidePane(
  aabb: AcademyOfficeAabb,
  pane: { width: number; height: number },
  epsilon = 0.51,
): boolean {
  return (
    aabb.left >= -epsilon &&
    aabb.top >= -epsilon &&
    aabb.left + aabb.width <= pane.width + epsilon &&
    aabb.top + aabb.height <= pane.height + epsilon
  );
}

export function academyOfficeWidescreenRatio(width: number, height: number): number {
  return width / Math.max(height, 1e-6);
}

export function academyOfficeIsWidescreenRatio(width: number, height: number): boolean {
  const ratio = academyOfficeWidescreenRatio(width, height);
  return ratio >= ACADEMY_WIDESCREEN_RATIO_MIN && ratio <= ACADEMY_WIDESCREEN_RATIO_MAX;
}

/** originRef merkezi → win yerel yüzdesi. Sabit `%38 32` / `%50 48` yok. */
export function academyOfficeFocusOriginCss(
  origin: Pick<DOMRect, "left" | "top" | "width" | "height">,
  win: Pick<DOMRect, "left" | "top" | "width" | "height">,
): string {
  const x = win.width <= 0 ? 50 : ((origin.left + origin.width / 2 - win.left) / win.width) * 100;
  const y = win.height <= 0 ? 50 : ((origin.top + origin.height / 2 - win.top) / win.height) * 100;
  return `${clamp(x, 0, 100).toFixed(2)}% ${clamp(y, 0, 100).toFixed(2)}%`;
}

export function applyAcademyOfficeWinFit(
  pane: HTMLElement,
  win: HTMLElement,
  options?: { zoom?: number; origin?: HTMLElement | null },
): number {
  win.style.transform = "";
  win.style.width = "";
  const paneWidth = pane.clientWidth;
  const paneHeight = pane.clientHeight;
  const contentWidth = Math.max(win.scrollWidth, win.offsetWidth);
  const contentHeight = Math.max(win.scrollHeight, win.offsetHeight);
  const zoom = options?.zoom ?? 1;
  let originX = 0;
  let originY = 0;
  let originCss = "0% 0%";
  if (zoom > 1.001 && options?.origin) {
    const originBox = options.origin.getBoundingClientRect();
    const winBox = win.getBoundingClientRect();
    originX = ((originBox.left + originBox.width / 2 - winBox.left) / Math.max(winBox.width, 1)) * contentWidth;
    originY = ((originBox.top + originBox.height / 2 - winBox.top) / Math.max(winBox.height, 1)) * contentHeight;
    originCss = academyOfficeFocusOriginCss(originBox, winBox);
  }
  const camera = academyOfficeContainCamera({
    paneWidth,
    paneHeight,
    contentWidth,
    contentHeight,
    originX,
    originY,
    zoom,
    lockTopLeft: zoom <= 1.001,
  });
  win.style.transformOrigin = "0 0";
  if (camera.scale < 0.999 || Math.abs(camera.tx) > 0.05 || Math.abs(camera.ty) > 0.05) {
    win.style.transform = `translate(${camera.tx}px, ${camera.ty}px) scale(${camera.scale})`;
  }
  win.dataset.academyOfficeFit = camera.scale.toFixed(4);
  win.dataset.academyOfficeOrigin = originCss;
  return camera.scale;
}
