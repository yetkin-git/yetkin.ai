/**
 * Sinema masası simülatör penceresi — object-fit: contain / scale-down.
 * Flex share kartları ezmez; pencere doğal boyutta ölçülür, 16:9 tuvale sığacak
 * kadar tek ölçekle küçülür. Excel ızgarası aynı matematiği yatayda zaten kullanır.
 */

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

export function applyAcademyOfficeWinFit(pane: HTMLElement, win: HTMLElement): number {
  win.style.transform = "";
  win.style.width = "";
  const scale = academyOfficeWinFitScale({
    paneWidth: pane.clientWidth,
    paneHeight: pane.clientHeight,
    contentWidth: Math.max(win.scrollWidth, win.offsetWidth),
    contentHeight: Math.max(win.scrollHeight, win.offsetHeight),
  });
  win.style.transformOrigin = "top left";
  if (scale < 0.999) {
    win.style.transform = `scale(${scale})`;
  }
  win.dataset.academyOfficeFit = scale.toFixed(4);
  return scale;
}
