"use client"

import { useMemo, useState } from "react"

import { DataInputPage } from "../components/data-input/data-input-page"
import { AnalyticsRow } from "../components/dashboard/analytics-row"
import { GreetingHeader } from "../components/dashboard/greeting-header"
import { JourneyChart } from "../components/dashboard/journey-chart"
import { KpiCards } from "../components/dashboard/kpi-cards"
import { NextActionBar } from "../components/dashboard/next-action-bar"
import { PencilIcon, RouteIcon } from "../components/icons"
import { Sidebar } from "../components/layout/sidebar"
import { LifePlanChart } from "../components/life-plan-chart"
import { LifePlanTable } from "../components/life-plan-table"
import { MortgagePage } from "../components/mortgage/mortgage-page"
import type { DashboardMetrics } from "../lib/dashboard-metrics"
import { simulate } from "../engine/simulate"
import type { YearlyResult } from "../engine/types"
import { useLifePlanInput } from "../hooks/use-life-plan-input"
import { computeDashboardMetrics } from "../lib/dashboard-metrics"
import type { ViewKey } from "../lib/view-types"

const VIEW_LABELS: Record<ViewKey, string> = {
  home: "ホーム",
  input: "データ入力",
  plan: "ライフプラン",
  cashflow: "キャッシュフロー",
  assets: "資産推移",
  mortgage: "住宅ローン",
  goals: "目標",
  report: "レポート",
  simulation: "シミュレーション",
  settings: "設定",
}

/** 閲覧ページ共通のヘッダー。データ変更は入力ページへ誘導する。 */
function ViewHeader({
  title,
  description,
  onOpenInput,
}: {
  title: string
  description: string
  onOpenInput: () => void
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-mm-ink">{title}</h1>
        <p className="mt-1 text-sm text-mm-ink-secondary">{description}</p>
      </div>
      <button
        type="button"
        onClick={onOpenInput}
        className="flex shrink-0 items-center gap-1.5 rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-mm-ink shadow-mm-soft transition-transform hover:scale-[1.02]"
      >
        <PencilIcon className="h-4 w-4" />
        データを編集
      </button>
    </div>
  )
}

function PlanView({
  results,
  events,
  metrics,
  onOpenInput,
}: {
  results: YearlyResult[]
  events: ReturnType<typeof useLifePlanInput>["input"]["events"]
  metrics: DashboardMetrics | null
  onOpenInput: () => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <ViewHeader
        title="ライフプラン"
        description="入力データから予測した将来の収支・資産の推移を確認できます。数値の変更は「データ入力」から行います。"
        onOpenInput={onOpenInput}
      />
      {metrics && (
        <JourneyChart results={results} events={events} metrics={metrics} onViewDetails={onOpenInput} />
      )}
      <LifePlanChart results={results} />
      <LifePlanTable results={results} />
    </div>
  )
}

function CashflowView({ results, onOpenInput }: { results: YearlyResult[]; onOpenInput: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <ViewHeader
        title="キャッシュフロー"
        description="年間の収支と資産残高の推移です。"
        onOpenInput={onOpenInput}
      />
      <LifePlanChart results={results} />
    </div>
  )
}

function AssetsView({
  results,
  events,
  metrics,
  onOpenInput,
}: {
  results: YearlyResult[]
  events: ReturnType<typeof useLifePlanInput>["input"]["events"]
  metrics: DashboardMetrics | null
  onOpenInput: () => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <ViewHeader
        title="資産推移"
        description="現金貯蓄と投資信託を含む資産の推移です。グラフ右上で内訳表示に切り替えられます。"
        onOpenInput={onOpenInput}
      />
      {metrics ? (
        <JourneyChart results={results} events={events} metrics={metrics} onViewDetails={onOpenInput} />
      ) : (
        <LifePlanChart results={results} />
      )}
    </div>
  )
}

function PlaceholderView({ view, onOpenHome }: { view: ViewKey; onOpenHome: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-3xl bg-white p-12 text-center shadow-mm-soft">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mm-soft-orange text-brand-orange">
        <RouteIcon className="h-7 w-7" />
      </span>
      <div>
        <p className="text-lg font-semibold text-mm-ink">{VIEW_LABELS[view]}は準備中です</p>
        <p className="mt-1 text-sm text-mm-ink-secondary">この画面は現在開発中です。もうしばらくお待ちください。</p>
      </div>
      <button
        type="button"
        onClick={onOpenHome}
        className="rounded-2xl bg-gradient-to-r from-brand-orange to-brand-amber px-4 py-2.5 text-sm font-semibold text-white shadow-mm-soft transition-transform hover:scale-[1.02]"
      >
        ホームに戻る
      </button>
    </div>
  )
}

export default function Home() {
  const { input, setInput } = useLifePlanInput()
  const [activeView, setActiveView] = useState<ViewKey>("home")
  const results = useMemo(() => simulate(input), [input])
  const metrics = useMemo(
    () =>
      computeDashboardMetrics(
        results,
        input.basic.husbandSavings +
          input.basic.wifeSavings +
          input.investment.midTerm.initialBalance +
          input.investment.longTerm.initialBalance,
      ),
    [
      results,
      input.basic.husbandSavings,
      input.basic.wifeSavings,
      input.investment.midTerm.initialBalance,
      input.investment.longTerm.initialBalance,
    ],
  )

  function openInput() {
    setActiveView("input")
  }
  function openPlan() {
    setActiveView("plan")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-mm-cream">
      <div className="h-full overflow-y-auto">
        <Sidebar activeView={activeView} onNavigate={setActiveView} />
      </div>

      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <div className="flex items-center gap-2 border-b border-mm-sand bg-mm-warm-white px-4 py-2.5 lg:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-orange to-brand-amber text-white">
            <RouteIcon className="h-4 w-4" />
          </span>
          <span className="font-bold text-mm-ink">MoneyMap</span>
          <select
            value={activeView}
            onChange={(event) => setActiveView(event.target.value as ViewKey)}
            className="ml-auto rounded-xl border border-mm-sand bg-white px-2.5 py-2.5 text-sm text-mm-ink"
          >
            {Object.entries(VIEW_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
          {activeView === "home" && metrics && (
            <>
              <GreetingHeader />
              <KpiCards metrics={metrics} />
              <JourneyChart
                results={results}
                events={input.events}
                metrics={metrics}
                onViewDetails={openPlan}
              />
              <AnalyticsRow results={results} metrics={metrics} onOpenPlan={openInput} />
              <NextActionBar onOpenPlan={openInput} />
            </>
          )}

          {activeView === "input" && <DataInputPage input={input} setInput={setInput} />}

          {activeView === "plan" && (
            <PlanView results={results} events={input.events} metrics={metrics} onOpenInput={openInput} />
          )}

          {activeView === "cashflow" && <CashflowView results={results} onOpenInput={openInput} />}

          {activeView === "assets" && (
            <AssetsView results={results} events={input.events} metrics={metrics} onOpenInput={openInput} />
          )}

          {activeView === "mortgage" && <MortgagePage input={input} onOpenInput={openInput} />}

          {(activeView === "goals" ||
            activeView === "report" ||
            activeView === "simulation" ||
            activeView === "settings") && (
            <PlaceholderView view={activeView} onOpenHome={() => setActiveView("home")} />
          )}
        </div>
      </main>
    </div>
  )
}
