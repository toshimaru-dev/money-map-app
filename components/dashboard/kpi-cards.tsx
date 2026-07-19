import type { ComponentType } from "react"

import { CalendarIcon, FlagIcon, TrendingUpIcon, WarningTriangleIcon } from "../icons"
import { formatManYen, type DashboardMetrics, type ZoneStatus } from "../../lib/dashboard-metrics"

const TONE_CLASSES: Record<ZoneStatus, { bg: string; fg: string; text: string }> = {
  good: { bg: "bg-brand-green/20", fg: "text-brand-green", text: "text-brand-green" },
  warning: { bg: "bg-brand-amber/25", fg: "text-brand-amber", text: "text-brand-amber" },
  danger: { bg: "bg-brand-coral/20", fg: "text-brand-coral", text: "text-brand-coral" },
}

function KpiCard({
  icon: Icon,
  tone,
  label,
  value,
  subtext,
}: {
  icon: ComponentType<{ className?: string }>
  tone: ZoneStatus
  label: string
  value: string
  subtext: string
}) {
  const toneClasses = TONE_CLASSES[tone]
  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-mm-soft transition-shadow hover:shadow-mm-hover">
      <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClasses.bg} ${toneClasses.fg}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm text-mm-ink-secondary">{label}</p>
        <p className="mt-1 font-[family-name:var(--font-number)] text-3xl font-semibold text-mm-ink">
          {value}
        </p>
      </div>
      <p className={`text-xs font-medium ${toneClasses.text}`}>{subtext}</p>
    </div>
  )
}

export function KpiCards({ metrics }: { metrics: DashboardMetrics }) {
  const lifetimeTone: ZoneStatus = metrics.lifetimeCashFlow >= 0 ? "good" : "danger"
  const cautionTone: ZoneStatus = metrics.cautionPeriod
    ? "warning"
    : metrics.deficitPeriod
      ? "danger"
      : "good"
  const deficitTone: ZoneStatus = metrics.deficitPeriod ? "danger" : "good"

  const goalSubtext =
    metrics.goalProbabilityTone === "good"
      ? "順調です！この調子！"
      : metrics.goalProbabilityTone === "warning"
        ? "改善の余地があります"
        : "見直しが必要です"

  const lifetimeSubtext =
    lifetimeTone === "good" ? "黒字で着地する見込みです" : "赤字で着地する見込みです"

  const cautionValue = metrics.cautionPeriod
    ? `${metrics.cautionPeriod.startYear}〜${metrics.cautionPeriod.endYear}年`
    : metrics.deficitPeriod
      ? "警告エリアへ直行"
      : "特になし"
  const cautionSubtext = metrics.cautionPeriod
    ? "対策で改善できます"
    : metrics.deficitPeriod
      ? "赤字エリアをご確認ください"
      : "この調子で安心です"

  const deficitValue = metrics.deficitPeriod ? `${metrics.deficitPeriod.years}年間` : "0年間"
  const deficitSubtext = metrics.deficitPeriod
    ? `${metrics.deficitPeriod.startYear}年〜${metrics.deficitPeriod.endYear}年`
    : "リスクは低めです"

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        icon={FlagIcon}
        tone={metrics.goalProbabilityTone}
        label="目標達成の確率"
        value={`${metrics.goalProbability}%`}
        subtext={goalSubtext}
      />
      <KpiCard
        icon={TrendingUpIcon}
        tone={lifetimeTone}
        label="生涯収支（予測）"
        value={formatManYen(metrics.lifetimeCashFlow, { signed: true })}
        subtext={lifetimeSubtext}
      />
      <KpiCard
        icon={CalendarIcon}
        tone={cautionTone}
        label="注意すべき時期"
        value={cautionValue}
        subtext={cautionSubtext}
      />
      <KpiCard
        icon={WarningTriangleIcon}
        tone={deficitTone}
        label="赤字の可能性がある期間"
        value={deficitValue}
        subtext={deficitSubtext}
      />
    </div>
  )
}
