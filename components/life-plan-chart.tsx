"use client"

import { Card } from "@heroui/react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { YearlyResult } from "../engine/types"

const GRID_COLOR = "#8884"
const AXIS_COLOR = "#71717a"
const LINE_COLOR = "#2563eb"
const POSITIVE_BAR_COLOR = "#2563eb"
const NEGATIVE_BAR_COLOR = "#dc2626"

function formatYen(value: number): string {
  return `${value.toLocaleString("ja-JP", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}万円`
}

function tickInterval(count: number): number | "preserveStartEnd" {
  if (count <= 12) return 0
  return Math.ceil(count / 12) - 1
}

export function LifePlanChart({ results }: { results: YearlyResult[] }) {
  if (results.length === 0) {
    return (
      <section className="rounded-xl border border-black/10 bg-background p-6 text-center text-sm text-foreground/60 shadow-sm dark:border-white/10">
        データがありません
      </section>
    )
  }

  const interval = tickInterval(results.length)

  return (
    <Card>
      <Card.Header>
        <Card.Title>グラフ</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="flex flex-col gap-8">
          <div>
            <h3 className="mb-4 text-sm font-semibold">資産残高の推移</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={results} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis
                  dataKey="year"
                  interval={interval}
                  stroke={AXIS_COLOR}
                  tick={{ fontSize: 12, fill: AXIS_COLOR }}
                />
                <YAxis stroke={AXIS_COLOR} tick={{ fontSize: 12, fill: AXIS_COLOR }} />
                <Tooltip
                  labelFormatter={(label) => `${label}年`}
                  formatter={(value) => [formatYen(Number(value)), "資産残高"]}
                  contentStyle={{ fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="cashBalance"
                  stroke={LINE_COLOR}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">年間収支の推移</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={results} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis
                  dataKey="year"
                  interval={interval}
                  stroke={AXIS_COLOR}
                  tick={{ fontSize: 12, fill: AXIS_COLOR }}
                />
                <YAxis stroke={AXIS_COLOR} tick={{ fontSize: 12, fill: AXIS_COLOR }} />
                <Tooltip
                  labelFormatter={(label) => `${label}年`}
                  formatter={(value) => [formatYen(Number(value)), "年間収支"]}
                  contentStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="netCashFlow">
                  {results.map((result) => (
                    <Cell
                      key={result.year}
                      fill={result.netCashFlow < 0 ? NEGATIVE_BAR_COLOR : POSITIVE_BAR_COLOR}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card.Content>
    </Card>
  )
}
