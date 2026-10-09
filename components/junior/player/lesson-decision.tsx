export function JuniorLessonDecision({
  onTell,
  onReplay,
}: {
  onTell: () => void;
  onReplay: () => void;
}) {
  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto"
      data-junior-lesson-decision=""
    >
      <div className="grid w-full max-w-sm gap-2 px-4">
        <button
          type="button"
          data-junior-ready-tell=""
          className="cursor-pointer rounded-xl bg-[#15803d] px-3 py-3 text-sm font-bold text-white shadow-sm"
          onClick={onTell}
        >
          Hazırım, Sana Anlatayım! 🎙️
        </button>
        <button
          type="button"
          data-junior-replay-lesson=""
          className="cursor-pointer rounded-xl border border-[var(--border)] bg-white px-3 py-3 text-sm font-bold text-[var(--safir-deep)] shadow-sm"
          onClick={onReplay}
        >
          Bir Kez Daha Dinlemek İstiyorum
        </button>
      </div>
    </div>
  );
}
