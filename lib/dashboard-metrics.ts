import type { YearlyResult } from "../engine/types"

export type ZoneStatus = "good" | "warning" | "danger"

export interface YearStatus {
  year: number
  status: ZoneStatus
}

export interface ZoneSegment {
  status: ZoneStatus
  startYear: number
  endYear: number
  startIndex: number
  endIndex: number
  length: number
}

export interface YearRange {
  startYear: number
  endYear: number
  years: number
}

export interface DashboardMetrics {
  statuses: YearStatus[]
  segments: ZoneSegment[]
  goalProbability: number
  goalProbabilityTone: ZoneStatus
  lifetimeCashFlow: number
  cautionPeriod: YearRange | null
  deficitPeriod: YearRange | null
  finalTotalAssets: number
  startingSavings: number
  assetChangeAmount: number
  assetChangePercent: number | null
  monthlyIncomeAvg: number
  monthlyExpenseAvg: number
  monthlySavingsAvg: number
  currentYear: number
  destinationYear: number
}

function statusOf(result: YearlyResult): ZoneStatus {
  if (result.totalAssets < 0) return "danger"
  if (result.netCashFlow < 0) return "warning"
  return "good"
}

function buildSegments(statuses: YearStatus[]): ZoneSegment[] {
  const segments: ZoneSegment[] = []
  statuses.forEach((entry, index) => {
    const previous = segments[segments.length - 1]
    if (previous && previous.status === entry.status) {
      previous.endYear = entry.year
      previous.endIndex = index
      previous.length += 1
      return
    }
    segments.push({
      status: entry.status,
      startYear: entry.year,
      endYear: entry.year,
      startIndex: index,
      endIndex: index,
      length: 1,
    })
  })
  return segments
}

function longestSegment(segments: ZoneSegment[], status: ZoneStatus): ZoneSegment | null {
  return segments
    .filter((segment) => segment.status === status)
    .reduce<ZoneSegment | null>((longest, segment) => {
      if (!longest || segment.length > longest.length) return segment
      return longest
    }, null)
}

export function computeDashboardMetrics(
  results: YearlyResult[],
  startingSavings: number,
): DashboardMetrics | null {
  if (results.length === 0) return null

  const statuses: YearStatus[] = results.map((result) => ({
    year: result.year,
    status: statusOf(result),
  }))
  const segments = buildSegments(statuses)

  const goodCount = statuses.filter((entry) => entry.status === "good").length
  const goalProbability = Math.round((goodCount / statuses.length) * 100)
  const goalProbabilityTone: ZoneStatus =
    goalProbability >= 70 ? "good" : goalProbability >= 40 ? "warning" : "danger"

  const lifetimeCashFlow = results.reduce((sum, result) => sum + result.netCashFlow, 0)

  const cautionSegment = longestSegment(segments, "warning")
  const cautionPeriod: YearRange | null = cautionSegment
    ? {
        startYear: cautionSegment.startYear,
        endYear: cautionSegment.endYear,
        years: cautionSegment.length,
      }
    : null

  const dangerSegment = longestSegment(segments, "danger")
  const deficitPeriod: YearRange | null = dangerSegment
    ? {
        startYear: dangerSegment.startYear,
        endYear: dangerSegment.endYear,
        years: dangerSegment.length,
      }
    : null

  const finalTotalAssets = results[results.length - 1].totalAssets
  const assetChangeAmount = finalTotalAssets - startingSavings
  const assetChangePercent =
    startingSavings !== 0 ? (assetChangeAmount / Math.abs(startingSavings)) * 100 : null

  const monthlyIncomeAvg =
    results.reduce((sum, result) => sum + result.totalIncome, 0) / results.length / 12
  const monthlyExpenseAvg =
    results.reduce((sum, result) => sum + result.totalExpense, 0) / results.length / 12
  const monthlySavingsAvg = monthlyIncomeAvg - monthlyExpenseAvg

  return {
    statuses,
    segments,
    goalProbability,
    goalProbabilityTone,
    lifetimeCashFlow,
    cautionPeriod,
    deficitPeriod,
    finalTotalAssets,
    startingSavings,
    assetChangeAmount,
    assetChangePercent,
    monthlyIncomeAvg,
    monthlyExpenseAvg,
    monthlySavingsAvg,
    currentYear: results[0].year,
    destinationYear: results[results.length - 1].year,
  }
}

export function formatManYen(value: number, options?: { signed?: boolean }): string {
  const sign = options?.signed && value > 0 ? "+" : ""
  return `${sign}${Math.round(value).toLocaleString("ja-JP")}万円`
}

export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`
}
