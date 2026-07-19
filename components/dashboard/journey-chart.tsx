"use client"

import { useId, useMemo, useState } from "react"
import {
  Area,
  ComposedChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { LifeEvent, YearlyResult } from "../../engine/types"
import type { DashboardMetrics, ZoneStatus } from "../../lib/dashboard-metrics"
import { ExternalLinkIcon, FlagIcon, InfoIcon, MapPinIcon } from "../icons"

const STATUS_COLOR: Record<ZoneStatus, string> = {
  good: "#22c55e",
  warning: "#fbbf24",
  danger: "#fb7185",
}

const STATUS_LABEL: Record<ZoneStatus, string> = {
  good: "順調（黒字）",
  warning: "注意（収支が厳しい）",
  danger: "警告（赤字の可能性）",
}

function statusOf(result: YearlyResult): ZoneStatus {
  if (result.totalAssets < 0) return "danger"
  if (result.netCashFlow < 0) return "warning"
  return "good"
}

const SERIES_COLOR = {
  cash: "#60a5fa",
  investment: "#22c55e",
} as const

function formatMan(value: number): string {
  return `${Math.round(value).toLocaleString("ja-JP")}万円`
}

function formatAxisMan(value: number): string {
  if (Math.abs(value) >= 10000) return `${(value / 10000).toLocaleString("ja-JP")}億`
  return value.toLocaleString("ja-JP")
}

function tickInterval(count: number): number {
  if (count <= 12) return 0
  return Math.ceil(count / 12) - 1
}

/** Hard-stop gradient so the line changes color exactly where the status changes. */
function buildStrokeStops(results: YearlyResult[]) {
  if (results.length === 0) return []
  const n = results.length
  const stops: { offset: number; color: string }[] = []
  let prev = statusOf(results[0])
  stops.push({ offset: 0, color: STATUS_COLOR[prev] })
  results.forEach((result, index) => {
    const status = statusOf(result)
    if (status !== prev) {
      const offset = n === 1 ? 0 : index / (n - 1)
      stops.push({ offset, color: STATUS_COLOR[prev] })
      stops.push({ offset, color: STATUS_COLOR[status] })
      prev = status
    }
  })
  stops.push({ offset: 1, color: STATUS_COLOR[prev] })
  return stops
}

interface TooltipPayloadEntry {
  payload?: YearlyResult
}

function ChartTooltip({
  active,
  payload,
  viewMode,
  eventsByYear,
}: {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  viewMode: "year" | "age"
  eventsByYear: Map<number, LifeEvent[]>
}) {
  const result = payload?.[0]?.payload
  if (!active || !result) return null
  const status = statusOf(result)
  const yearEvents = eventsByYear.get(result.year) ?? []

  return (
    <div className="rounded-2xl border border-mm-sand bg-white px-4 py-3 shadow-mm-hover">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_COLOR[status] }} />
        <p className="text-sm font-semibold text-mm-ink">
          {viewMode === "year" ? `${result.year}年` : `${result.husbandAge}歳`}
          <span className="ml-1.5 text-xs font-normal text-mm-ink-caption">
            {viewMode === "year" ? `（${result.husbandAge}歳）` : `（${result.year}年）`}
          </span>
        </p>
      </div>
      <dl className="mt-2 space-y-1 text-xs">
        <div className="flex items-center justify-between gap-6">
          <dt className="font-medium text-mm-ink">資産合計</dt>
          <dd
            className={`font-[family-name:var(--font-number)] font-semibold ${
              result.totalAssets < 0 ? "text-brand-coral" : "text-mm-ink"
            }`}
          >
            {formatMan(result.totalAssets)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-6">
          <dt className="flex items-center gap-1.5 text-mm-ink-secondary">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SERIES_COLOR.cash }} />
            現金貯蓄
          </dt>
          <dd
            className={`font-[family-name:var(--font-number)] font-semibold ${
              result.cashBalance < 0 ? "text-brand-coral" : "text-mm-ink"
            }`}
          >
            {formatMan(result.cashBalance)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-6">
          <dt className="flex items-center gap-1.5 text-mm-ink-secondary">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: SERIES_COLOR.investment }}
            />
            投資信託
          </dt>
          <dd className="font-[family-name:var(--font-number)] font-semibold text-mm-ink">
            {formatMan(result.investmentBalance)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-6">
          <dt className="text-mm-ink-secondary">年間収支</dt>
          <dd
            className={`font-[family-name:var(--font-number)] font-semibold ${
              result.netCashFlow < 0 ? "text-brand-coral" : "text-brand-green"
            }`}
          >
            {result.netCashFlow >= 0 ? "+" : ""}
            {formatMan(result.netCashFlow)}
          </dd>
        </div>
      </dl>
      {yearEvents.length > 0 && (
        <div className="mt-2 space-y-1 border-t border-mm-sand pt-2 text-xs">
          {yearEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between gap-6">
              <span className="text-mm-ink-secondary">
                {event.type === "income" ? "💰" : "🎪"} {event.name}
              </span>
              <span
                className={`font-[family-name:var(--font-number)] font-semibold ${
                  event.type === "expense" ? "text-brand-coral" : "text-brand-green"
                }`}
              >
                {event.type === "expense" ? "-" : "+"}
                {formatMan(event.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="mt-2 text-[11px] font-medium" style={{ color: STATUS_COLOR[status] }}>
        {STATUS_LABEL[status]}
      </p>
    </div>
  )
}

export function JourneyChart({
  results,
  events,
  metrics,
  onViewDetails,
}: {
  results: YearlyResult[]
  events: LifeEvent[]
  metrics: DashboardMetrics
  onViewDetails: () => void
}) {
  const [viewMode, setViewMode] = useState<"year" | "age">("year")
  const [seriesMode, setSeriesMode] = useState<"total" | "breakdown">("total")
  const gradientId = useId()
  const strokeStops = useMemo(() => buildStrokeStops(results), [results])
  const eventsByYear = useMemo(() => {
    const map = new Map<number, LifeEvent[]>()
    for (const event of events) {
      const list = map.get(event.year)
      if (list) list.push(event)
      else map.set(event.year, [event])
    }
    return map
  }, [events])

  if (results.length === 0) return null

  const first = results[0]
  const last = results[results.length - 1]
  const xKey = viewMode === "year" ? "year" : "husbandAge"
  const xUnit = viewMode === "year" ? "年" : "歳"

  const zoneAreas = metrics.segments.filter((segment) => segment.status !== "good")

  return (
    <section className="rounded-3xl bg-white p-5 shadow-mm-soft sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-mm-ink">あなたの未来の航路（キャッシュフロー予測）</h2>
          <InfoIcon className="h-4 w-4 text-mm-ink-caption" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-full bg-mm-soft-orange p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setSeriesMode("total")}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                seriesMode === "total" ? "bg-white text-mm-ink shadow-mm-soft" : "text-mm-ink-secondary"
              }`}
            >
              資産合計
            </button>
            <button
              type="button"
              onClick={() => setSeriesMode("breakdown")}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                seriesMode === "breakdown"
                  ? "bg-white text-mm-ink shadow-mm-soft"
                  : "text-mm-ink-secondary"
              }`}
            >
              現金・投信の内訳
            </button>
          </div>
          <div className="flex rounded-full bg-mm-soft-orange p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode("year")}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                viewMode === "year" ? "bg-white text-mm-ink shadow-mm-soft" : "text-mm-ink-secondary"
              }`}
            >
              年表示
            </button>
            <button
              type="button"
              onClick={() => setViewMode("age")}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                viewMode === "age" ? "bg-white text-mm-ink shadow-mm-soft" : "text-mm-ink-secondary"
              }`}
            >
              年齢表示
            </button>
          </div>
          <span className="text-xs text-mm-ink-caption">
            {viewMode === "year"
              ? `${first.year}年〜${last.year}年`
              : `${first.husbandAge}歳〜${last.husbandAge}歳`}
          </span>
          <button
            type="button"
            onClick={onViewDetails}
            className="flex items-center gap-1 text-xs font-semibold text-brand-orange hover:underline"
          >
            詳細を見る
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-mm-ink-secondary">
        {(Object.keys(STATUS_LABEL) as ZoneStatus[]).map((status) => (
          <span key={status} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_COLOR[status] }} />
            {STATUS_LABEL[status]}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <MapPinIcon className="h-3.5 w-3.5 text-brand-blue" />
          現在地
        </span>
        <span className="flex items-center gap-1.5">
          <FlagIcon className="h-3.5 w-3.5 text-brand-green" />
          目標
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-orange shadow-mm-soft" />
          ライフイベント
        </span>
        {seriesMode === "breakdown" && (
          <>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: SERIES_COLOR.cash }} />
              現金貯蓄
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: SERIES_COLOR.investment }}
              />
              投資信託（運用益込）
            </span>
          </>
        )}
      </div>

      <div className="mt-4 h-[340px] sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={results} margin={{ top: 24, right: 24, bottom: 4, left: 8 }}>
            <defs>
              <linearGradient id={`${gradientId}-stroke`} x1="0" y1="0" x2="1" y2="0">
                {strokeStops.map((stop, index) => (
                  <stop key={index} offset={stop.offset} stopColor={stop.color} />
                ))}
              </linearGradient>
              <linearGradient id={`${gradientId}-fill`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f6e9da" vertical={false} />
            <XAxis
              dataKey={xKey}
              interval={tickInterval(results.length)}
              tick={{ fontSize: 11, fill: "#9a8c82" }}
              tickFormatter={(value: number) => `${value}${xUnit}`}
              axisLine={{ stroke: "#f6e9da" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9a8c82" }}
              tickFormatter={formatAxisMan}
              axisLine={false}
              tickLine={false}
              width={56}
              label={{
                value: "（万円）",
                position: "insideTopLeft",
                offset: -18,
                fontSize: 11,
                fill: "#9a8c82",
              }}
            />

            {zoneAreas.map((segment, index) => (
              <ReferenceArea
                key={index}
                x1={viewMode === "year" ? segment.startYear : first.husbandAge + segment.startIndex}
                x2={viewMode === "year" ? segment.endYear : first.husbandAge + segment.endIndex}
                fill={STATUS_COLOR[segment.status === "warning" ? "warning" : "danger"]}
                fillOpacity={0.08}
              />
            ))}

            <ReferenceLine y={0} stroke="#9a8c82" strokeDasharray="4 4" strokeOpacity={0.6} />

            <Tooltip
              content={<ChartTooltip viewMode={viewMode} eventsByYear={eventsByYear} />}
              cursor={{ stroke: "#f97316", strokeOpacity: 0.35, strokeDasharray: "4 4" }}
            />

            {seriesMode === "total" ? (
              <Area
                type="monotone"
                dataKey="totalAssets"
                stroke={`url(#${gradientId}-stroke)`}
                strokeWidth={3}
                fill={`url(#${gradientId}-fill)`}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff" }}
                isAnimationActive
                animationDuration={1200}
              />
            ) : (
              <>
                <Area
                  type="monotone"
                  stackId="assets"
                  dataKey="cashBalance"
                  stroke={SERIES_COLOR.cash}
                  strokeWidth={2}
                  fill={SERIES_COLOR.cash}
                  fillOpacity={0.25}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "#ffffff" }}
                  isAnimationActive
                  animationDuration={1200}
                />
                <Area
                  type="monotone"
                  stackId="assets"
                  dataKey="investmentBalance"
                  stroke={SERIES_COLOR.investment}
                  strokeWidth={2}
                  fill={SERIES_COLOR.investment}
                  fillOpacity={0.25}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "#ffffff" }}
                  isAnimationActive
                  animationDuration={1200}
                />
              </>
            )}

            {results
              .filter((result) => eventsByYear.has(result.year))
              .map((result) => {
                const yearEvents = eventsByYear.get(result.year) ?? []
                const isIncome = result.eventIncome > result.eventExpense
                return (
                  <ReferenceDot
                    key={result.year}
                    x={viewMode === "year" ? result.year : result.husbandAge}
                    y={result.totalAssets}
                    r={6}
                    fill={isIncome ? "#22c55e" : "#f97316"}
                    stroke="#ffffff"
                    strokeWidth={2.5}
                    label={{
                      value: isIncome ? "💰" : "🎪",
                      position: "top",
                      fontSize: 13,
                      offset: 8,
                    }}
                  >
                    <title>
                      {yearEvents.map((e) => e.name).join("・")}（{result.year}年）
                    </title>
                  </ReferenceDot>
                )
              })}

            <ReferenceDot
              x={viewMode === "year" ? first.year : first.husbandAge}
              y={first.totalAssets}
              r={6}
              fill="#60a5fa"
              stroke="#ffffff"
              strokeWidth={2.5}
              label={{ value: "現在地", position: "top", fontSize: 11, fill: "#60a5fa", fontWeight: 600, offset: 10 }}
            />
            <ReferenceDot
              x={viewMode === "year" ? last.year : last.husbandAge}
              y={last.totalAssets}
              r={6}
              fill="#22c55e"
              stroke="#ffffff"
              strokeWidth={2.5}
              label={{ value: "目標", position: "top", fontSize: 11, fill: "#22c55e", fontWeight: 600, offset: 10 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {(metrics.cautionPeriod || metrics.deficitPeriod) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {metrics.cautionPeriod && (
            <span className="rounded-full bg-brand-amber/15 px-3 py-1.5 text-[11px] font-medium text-mm-ink">
              ⚠ 注意: {metrics.cautionPeriod.startYear}〜{metrics.cautionPeriod.endYear}年は収支が厳しくなります
            </span>
          )}
          {metrics.deficitPeriod && (
            <span className="rounded-full bg-brand-coral/15 px-3 py-1.5 text-[11px] font-medium text-mm-ink">
              🚨 警告: {metrics.deficitPeriod.startYear}〜{metrics.deficitPeriod.endYear}年に赤字の可能性があります
            </span>
          )}
        </div>
      )}
    </section>
  )
}
