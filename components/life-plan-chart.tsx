"use client"

import { Card } from "@heroui/react"
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { YearlyResult } from "../engine/types"

const GRID_COLOR = "#f6e9da"
const AXIS_COLOR = "#9a8c82"
const LINE_COLOR = "#f97316"
const POSITIVE_BAR_COLOR = "#22c55e"
const NEGATIVE_BAR_COLOR = "#fb7185"

function formatYen(value: number): string {
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

interface TooltipEntry {
  name?: string
  value?: number
  color?: string
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: number }) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-2xl border border-mm-sand bg-white px-4 py-3 shadow-mm-hover">
      <p className="text-sm font-semibold text-mm-ink">{label}年</p>
      <dl className="mt-2 space-y-1 text-xs">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-6">
            <dt className="flex items-center gap-1.5 text-mm-ink-secondary">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </dt>
            <dd className="font-[family-name:var(--font-number)] font-semibold text-mm-ink">
              {formatYen(Number(entry.value))}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function LifePlanChart({ results }: { results: YearlyResult[] }) {
  if (results.length === 0) {
    return (
      <section className="rounded-3xl bg-white p-6 text-center text-sm text-mm-ink-caption shadow-mm-soft">
        データがありません
      </section>
    )
  }

  const interval = tickInterval(results.length)

  return (
    <Card>
      <Card.Header>
        <Card.Title>資産残高と年間収支の推移</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-mm-ink-secondary">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-4 rounded-full" style={{ backgroundColor: LINE_COLOR }} />
            資産合計（左軸・線）
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: POSITIVE_BAR_COLOR }} />
            年間収支 黒字（右軸・棒）
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: NEGATIVE_BAR_COLOR }} />
            年間収支 赤字
          </span>
        </div>
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={results} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis
              dataKey="year"
              interval={interval}
              stroke={AXIS_COLOR}
              tick={{ fontSize: 11, fill: AXIS_COLOR }}
              tickLine={false}
            />
            <YAxis
              yAxisId="assets"
              tickFormatter={formatAxisMan}
              stroke={AXIS_COLOR}
              tick={{ fontSize: 11, fill: AXIS_COLOR }}
              axisLine={false}
              tickLine={false}
              width={56}
              label={{ value: "資産(万円)", position: "insideTopLeft", offset: -6, fontSize: 10, fill: AXIS_COLOR }}
            />
            <YAxis
              yAxisId="cashflow"
              orientation="right"
              tickFormatter={formatAxisMan}
              stroke={AXIS_COLOR}
              tick={{ fontSize: 11, fill: AXIS_COLOR }}
              axisLine={false}
              tickLine={false}
              width={52}
              label={{ value: "収支(万円)", position: "insideTopRight", offset: -6, fontSize: 10, fill: AXIS_COLOR }}
            />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine yAxisId="cashflow" y={0} stroke={AXIS_COLOR} strokeOpacity={0.4} />
            <Bar yAxisId="cashflow" dataKey="netCashFlow" name="年間収支" barSize={6} radius={[2, 2, 0, 0]}>
              {results.map((result) => (
                <Cell
                  key={result.year}
                  fill={result.netCashFlow < 0 ? NEGATIVE_BAR_COLOR : POSITIVE_BAR_COLOR}
                />
              ))}
            </Bar>
            <Line
              yAxisId="assets"
              type="monotone"
              dataKey="totalAssets"
              name="資産合計"
              stroke={LINE_COLOR}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Card.Content>
    </Card>
  )
}
