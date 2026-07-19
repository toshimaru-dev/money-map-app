"use client"

import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { ChevronRightIcon, CompassIcon, PiggyBankIcon, ReceiptIcon, WalletIcon } from "../icons"
import type { YearlyResult } from "../../engine/types"
import { formatManYen, type DashboardMetrics } from "../../lib/dashboard-metrics"

function cashflowSign(value: number): "good" | "flat" | "danger" {
  if (value > 0) return "good"
  if (value < 0) return "danger"
  return "flat"
}

const SIGN_COLOR: Record<"good" | "flat" | "danger", string> = {
  good: "#22c55e",
  flat: "#9a8c82",
  danger: "#fb7185",
}

function buildGradientStops(results: YearlyResult[]) {
  if (results.length === 0) return []
  const n = results.length
  const stops: { offset: number; color: string }[] = []
  let previousSign = cashflowSign(results[0].netCashFlow)
  stops.push({ offset: 0, color: SIGN_COLOR[previousSign] })

  results.forEach((result, index) => {
    const sign = cashflowSign(result.netCashFlow)
    if (sign !== previousSign) {
      const offset = n === 1 ? 0 : index / (n - 1)
      stops.push({ offset, color: SIGN_COLOR[previousSign] })
      stops.push({ offset, color: SIGN_COLOR[sign] })
      previousSign = sign
    }
  })
  stops.push({ offset: 1, color: SIGN_COLOR[previousSign] })
  return stops
}

function CashflowTrendCard({ results, metrics }: { results: YearlyResult[]; metrics: DashboardMetrics }) {
  const gradientStops = buildGradientStops(results)
  const dangerSegment = metrics.segments.find((segment) => segment.status === "danger")

  return (
    <div className="rounded-3xl bg-white p-5 shadow-mm-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-mm-ink">キャッシュフローの推移</h3>
        <div className="flex items-center gap-3 text-[11px] text-mm-ink-secondary">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-brand-green" />
            黒字
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-mm-ink-caption" />
            収支トントン
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-brand-coral" />
            赤字
          </span>
        </div>
      </div>
      <div className="mt-3 h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={results} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="mm-cashflow-fill" x1="0" y1="0" x2="1" y2="0">
                {gradientStops.map((stop, index) => (
                  <stop key={index} offset={stop.offset} stopColor={stop.color} stopOpacity={0.35} />
                ))}
              </linearGradient>
              <linearGradient id="mm-cashflow-stroke" x1="0" y1="0" x2="1" y2="0">
                {gradientStops.map((stop, index) => (
                  <stop key={index} offset={stop.offset} stopColor={stop.color} />
                ))}
              </linearGradient>
            </defs>
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#9a8c82" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#9a8c82" }} axisLine={false} tickLine={false} width={40} />
            {dangerSegment && (
              <ReferenceArea
                x1={dangerSegment.startYear}
                x2={dangerSegment.endYear}
                fill="#fb7185"
                fillOpacity={0.12}
                label={{ value: "⚠ 警告エリア", position: "insideTop", fontSize: 10, fill: "#e11d48" }}
              />
            )}
            <Tooltip
              labelFormatter={(label) => `${label}年`}
              formatter={(value) => [formatManYen(Number(value)), "年間収支"]}
              contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid #f6e9da" }}
            />
            <Area
              type="monotone"
              dataKey="netCashFlow"
              stroke="url(#mm-cashflow-stroke)"
              strokeWidth={2.5}
              fill="url(#mm-cashflow-fill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function AssetBalanceCard({ results, metrics }: { results: YearlyResult[]; metrics: DashboardMetrics }) {
  const amountLabel = `${metrics.assetChangeAmount >= 0 ? "+" : ""}${Math.round(metrics.assetChangeAmount).toLocaleString("ja-JP")}万円`
  const showPercent = metrics.assetChangePercent !== null && Math.abs(metrics.assetChangePercent) < 999
  const changeLabel = showPercent
    ? `${amountLabel} (${metrics.assetChangePercent! >= 0 ? "+" : ""}${metrics.assetChangePercent!.toFixed(1)}%)`
    : amountLabel

  return (
    <div className="rounded-3xl bg-white p-5 shadow-mm-soft">
      <h3 className="text-sm font-semibold text-mm-ink">資産残高（予測）</h3>
      <p className="mt-2 font-[family-name:var(--font-number)] text-3xl font-semibold text-mm-ink">
        {Math.round(metrics.finalTotalAssets).toLocaleString("ja-JP")}万円
      </p>
      <p className={`mt-1 text-xs font-medium ${metrics.assetChangeAmount >= 0 ? "text-brand-green" : "text-brand-coral"}`}>
        開始時点から {changeLabel}
      </p>
      <div className="mt-3 h-[110px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={results} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#9a8c82" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#9a8c82" }} axisLine={false} tickLine={false} width={44} />
            <Tooltip
              labelFormatter={(label) => `${label}年`}
              formatter={(value) => [formatManYen(Number(value)), "資産残高"]}
              contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid #f6e9da" }}
            />
            <Line type="monotone" dataKey="totalAssets" stroke="#f97316" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function HouseholdStatusCard({ metrics, onOpenPlan }: { metrics: DashboardMetrics; onOpenPlan: () => void }) {
  const rows = [
    {
      label: "収入",
      value: metrics.monthlyIncomeAvg,
      icon: WalletIcon,
      tone: "bg-brand-green/15 text-brand-green",
    },
    {
      label: "支出",
      value: metrics.monthlyExpenseAvg,
      icon: ReceiptIcon,
      tone: "bg-brand-coral/15 text-brand-coral",
    },
    {
      label: "貯蓄・投資",
      value: metrics.monthlySavingsAvg,
      icon: PiggyBankIcon,
      tone: "bg-brand-blue/15 text-brand-blue",
    },
  ]

  return (
    <div className="rounded-3xl bg-white p-5 shadow-mm-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-mm-ink">家計の状況（平均/月）</h3>
        <button
          type="button"
          onClick={onOpenPlan}
          className="flex items-center text-xs font-semibold text-brand-orange hover:underline"
        >
          詳細を見る
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${row.tone}`}>
              <row.icon className="h-4 w-4" />
            </span>
            <span className="flex-1 text-sm text-mm-ink-secondary">{row.label}</span>
            <span
              className={`font-[family-name:var(--font-number)] text-sm font-semibold ${
                row.value < 0 ? "text-brand-coral" : "text-mm-ink"
              }`}
            >
              {row.value.toFixed(1)}万円
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SimulateCtaCard({ onOpenPlan }: { onOpenPlan: () => void }) {
  return (
    <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-brand-orange to-brand-amber p-5 text-white shadow-mm-soft">
      <div>
        <CompassIcon className="h-7 w-7" />
        <h3 className="mt-3 text-base font-bold leading-snug">
          未来の選択で、
          <br />
          航路はもっと良くなる！
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-white/90">
          いくつかの選択で将来の結果をシミュレーションしてみましょう。
        </p>
      </div>
      <button
        type="button"
        onClick={onOpenPlan}
        className="mt-4 flex items-center justify-center gap-1 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-orange shadow-mm-soft transition-transform hover:scale-[1.02]"
      >
        シミュレーションする
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

export function AnalyticsRow({
  results,
  metrics,
  onOpenPlan,
}: {
  results: YearlyResult[]
  metrics: DashboardMetrics
  onOpenPlan: () => void
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      <CashflowTrendCard results={results} metrics={metrics} />
      <AssetBalanceCard results={results} metrics={metrics} />
      <HouseholdStatusCard metrics={metrics} onOpenPlan={onOpenPlan} />
      <SimulateCtaCard onOpenPlan={onOpenPlan} />
    </div>
  )
}
