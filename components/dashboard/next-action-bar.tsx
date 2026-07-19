import { ChevronRightIcon, CompassIcon } from "../icons"

export function NextActionBar({ onOpenPlan }: { onOpenPlan: () => void }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-3xl bg-mm-soft-orange p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-orange shadow-mm-soft">
          <CompassIcon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-mm-ink">
            ライフイベントやプランを調整すると、航路が変わります
          </p>
          <p className="mt-0.5 text-xs text-mm-ink-secondary">
            結婚・住宅購入・教育費などのイベントをシミュレーションしてみましょう。
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenPlan}
        className="flex shrink-0 items-center gap-1 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-amber px-4 py-2.5 text-sm font-semibold text-white shadow-mm-soft transition-transform hover:scale-[1.02]"
      >
        プランを調整する
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
