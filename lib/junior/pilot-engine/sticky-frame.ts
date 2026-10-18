import type { SceneGraphState } from "@/lib/junior/pilot-engine/state-reducer";

/**
 * Tuvalde çizilecek somut görsel yük var mı?
 * SET_STAGE sonrası boş layout'lar (bilyesiz tepsi, rakamsız dedektif, görünür
 * çarpan ağacı yok) "zifiri siyah" kabul edilir — sticky hold bunları atlar.
 */
export function sceneHasRenderableContent(state: SceneGraphState): boolean {
  switch (state.layout) {
    case "marble-tray":
      return state.marblesSpawned;
    case "factor-vs-multiple":
      return state.factorTree.visible || state.multipleTower.visible;
    case "detective-last-digit":
    case "detective-digit-sum":
      return state.detective.digits.length > 0;
    case "trap-vs-truth":
      // Digits state'te olsa bile UI revealed olmadan boş panel basar.
      return state.detective.revealed === true;
    case "summary-board":
      return state.summaryCards.length > 0;
    case "prime-factor-tree": {
      const card = state.primeFactor;
      return (
        card.visible &&
        Boolean(
          (card.composite &&
            (card.composite.factors.length > 0 || card.composite.branches.length > 0)) ||
            (card.prime && (card.prime.factors.length > 0 || card.prime.nodes.length > 0)),
        )
      );
    }
    case "common-divisor":
      return state.commonDivisor.visible && (state.commonDivisor.left > 0 || state.commonDivisor.right > 0);
    case "circle-measure":
      return (
        state.circle.visible &&
        (state.circle.radius > 0 ||
          state.circle.diameter > 0 ||
          state.circle.circumference > 0 ||
          state.circle.marks.length > 0)
      );
    case "habitat":
      return (
        state.habitat.visible &&
        (state.habitat.birds > 0 || state.habitat.plants > 0 || state.habitat.threats.length > 0)
      );
    case "fuel":
      return (
        state.fuel.visible &&
        (state.fuel.distanceKm > 0 || state.fuel.fuelLitres > 0 || state.fuel.cleanStack.length > 0)
      );
    case "fraction":
      return (
        state.fraction.visible &&
        (state.fraction.leftNumerator > 0 ||
          state.fraction.resultNumerator > 0 ||
          state.fraction.productNumerator > 0 ||
          state.fraction.parts > 0 ||
          state.fraction.note.length > 0)
      );
    case "number-line":
      return (
        state.numberLine.visible &&
        (state.numberLine.focusLabel.length > 0 ||
          state.numberLine.relations.length > 0 ||
          state.numberLine.focus > 0)
      );
    case "angle":
      return (
        state.angle.visible &&
        (state.angle.acute > 0 ||
          state.angle.triangle.length > 0 ||
          state.angle.names.length > 0 ||
          state.angle.note.length > 0)
      );
    case "area":
      return (
        state.area.visible &&
        (state.area.base > 0 ||
          state.area.parallelogram > 0 ||
          state.area.squareArea > 0 ||
          state.area.donumCount > 0)
      );
    case "force":
      return state.force.visible && (state.force.sameA > 0 || state.force.showBalance || state.force.note.length > 0);
    case "speed":
      return (
        state.speed.visible &&
        (state.speed.distance > 0 || state.speed.showDisplacement || state.speed.path > 0)
      );
    default:
      return false;
  }
}

export type StickyFrameResolution = {
  /** Sahne tuvaline basılacak durum (canlı veya asılı önceki kare). */
  display: SceneGraphState;
  /** Sonraki kareye kadar saklanacak dolu durum. */
  nextHeld: SceneGraphState | null;
  /** true → canlı state boş; önceki dolu kare asılı. */
  sticky: boolean;
};

/**
 * Sahne asılı kalma (sticky frame retention).
 * Canlı state boşken son dolu kareyi tutar; yeni görsel cue gelince anında geçer.
 * `forceClear` (manuel seek / ders sonu / yeniden başlat) asıyı sıfırlar.
 */
export function resolveStickyFrame(
  live: SceneGraphState,
  held: SceneGraphState | null,
  opts?: { forceClear?: boolean },
): StickyFrameResolution {
  if (opts?.forceClear) {
    if (sceneHasRenderableContent(live)) {
      return { display: live, nextHeld: live, sticky: false };
    }
    return { display: live, nextHeld: null, sticky: false };
  }

  if (sceneHasRenderableContent(live)) {
    return { display: live, nextHeld: live, sticky: false };
  }

  if (held && sceneHasRenderableContent(held)) {
    return { display: held, nextHeld: held, sticky: true };
  }

  return { display: live, nextHeld: held, sticky: false };
}
