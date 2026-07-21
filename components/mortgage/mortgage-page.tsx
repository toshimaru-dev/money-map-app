"use client"

import { useMemo, useState } from "react"

import { calcMortgagePlan } from "../../engine/mortgage"
import type { LifePlanInput, MortgageYearlyResult } from "../../engine/types"
import { PencilIcon } from "../icons"

function formatMan(value: number, digits = 1): string {
  return value.toLocaleString("ja-JP", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

function formatRate(value: number): string {
  return `${value.toFixed(3)}%`
}

/** 概況カード。ローン全体を一目で把握するための数値。 */
function SummaryCard({
  label,
  value,
  unit,
  hint,
  accent,
}: {
  label: string
  value: string
  unit?: string
  hint?: string
  accent?: string
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-mm-soft">
      <p className="text-xs font-medium text-mm-ink-secondary">{label}</p>
      <p className={`mt-2 font-[family-name:var(--font-number)] text-2xl font-bold ${accent ?? "text-mm-ink"}`}>
        {value}
        {unit && <span className="ml-1 text-sm font-medium text-mm-ink-secondary">{unit}</span>}
      </p>
      {hint && <p className="mt-1 text-xs text-mm-ink-caption">{hint}</p>}
    </div>
  )
}

/** 金利が切り替わる年だけを抜き出した推移。 */
function rateTimeline(plan: MortgageYearlyResult[]): { year: number; elapsedYears: number; rate: number }[] {
  const timeline: { year: number; elapsedYears: number; rate: number }[] = []
  for (const row of plan) {
    if (row.remainingYears === 0) continue
    const previous = timeline[timeline.length - 1]
    if (!previous || previous.rate !== row.interestRate) {
      timeline.push({ year: row.year, elapsedYears: row.elapsedYears, rate: row.interestRate })
    }
  }
  return timeline
}

/** 管理費+修繕積立金の月額が切り替わる年だけを抜き出した推移(段階的な設定のとき使う)。 */
function maintenanceTimeline(
  plan: MortgageYearlyResult[],
): { year: number; elapsedYears: number; monthly: number }[] {
  const timeline: { year: number; elapsedYears: number; monthly: number }[] = []
  for (const row of plan) {
    const monthly = (row.managementFee + row.repairReserve) / 12
    const previous = timeline[timeline.length - 1]
    if (!previous || Math.abs(previous.monthly - monthly) > 1e-9) {
      timeline.push({ year: row.year, elapsedYears: row.elapsedYears, monthly })
    }
  }
  return timeline
}

const TH_CLASS = "whitespace-nowrap px-3 py-2 text-right text-xs font-semibold text-mm-ink-secondary"
const TD_CLASS =
  "whitespace-nowrap px-3 py-2 text-right text-sm tabular-nums font-[family-name:var(--font-number)]"

type Detail = "summary" | "breakdown"

export function MortgagePage({
  input,
  onOpenInput,
}: {
  input: LifePlanInput
  onOpenInput: () => void
}) {
  const [detail, setDetail] = useState<Detail>("summary")
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  const mortgage = input.mortgage
  // ローンそのものの物語なので、シミュレーション年数ではなく返済期間の全体を表示する
  const plan = useMemo(
    () => calcMortgagePlan(mortgage, input.basic.startYear, mortgage.termYears),
    [mortgage, input.basic.startYear],
  )

  const financed = Math.max(0, mortgage.principal - mortgage.downPayment)
  const totalPaid = plan.reduce((sum, row) => sum + row.totalPayment, 0)
  const totalInterest = plan.reduce((sum, row) => sum + row.totalInterest, 0)
  const totalMaintenance = plan.reduce((sum, row) => sum + row.maintenanceTotal, 0)
  const timeline = rateTimeline(plan)
  const isStepped = mortgage.maintenanceMode === "stepped"
  const maintenanceSteps = maintenanceTimeline(plan)
  const first = plan[0]
  const payoffYear = input.basic.startYear + mortgage.termYears - 1

  if (input.basic.housingType === "rent") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-mm-ink">住宅ローン</h1>
          <p className="mt-1 text-sm text-mm-ink-secondary">
            住宅ローンの返済計画と維持費をまとめて確認できます。
          </p>
        </div>
        <div className="rounded-3xl bg-white p-12 text-center shadow-mm-soft">
          <p className="text-lg font-semibold text-mm-ink">現在は「賃貸」で試算しています</p>
          <p className="mt-1 text-sm text-mm-ink-secondary">
            住宅ローンの試算を見るには、データ入力の「基本設定」で住まいを「住宅ローン」に切り替えてください。
          </p>
          <button
            type="button"
            onClick={onOpenInput}
            className="mt-4 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-amber px-4 py-2.5 text-sm font-semibold text-white shadow-mm-soft transition-transform hover:scale-[1.02]"
          >
            データ入力を開く
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-mm-ink">住宅ローン</h1>
          <p className="mt-1 text-sm text-mm-ink-secondary">
            変動金利・ボーナス返済・維持費を含めた返済計画です。数値の変更は「データ入力」の住宅ローンタブから行います。
          </p>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="借入総額"
          value={formatMan(financed, 0)}
          unit="万円"
          hint={`借入 ${formatMan(mortgage.principal, 0)} − 頭金 ${formatMan(mortgage.downPayment, 0)}`}
        />
        <SummaryCard
          label="総返済額"
          value={formatMan(totalPaid, 0)}
          unit="万円"
          hint={`${mortgage.termYears}年 / ${payoffYear}年に完済`}
        />
        <SummaryCard
          label="総利息"
          value={formatMan(totalInterest, 0)}
          unit="万円"
          accent="text-brand-coral"
          hint={`借入総額に対して ${((totalInterest / Math.max(financed, 1)) * 100).toFixed(1)}%`}
        />
        <SummaryCard
          label="初年度の月の支払い"
          value={formatMan(first.monthlyOutlay, 2)}
          unit="万円"
          hint={`返済 ${formatMan(first.monthlyRegularPayment, 2)} + 維持費 ${formatMan(first.maintenanceTotal / 12, 2)}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* 金利の推移 */}
        <section className="rounded-3xl bg-white p-6 shadow-mm-soft">
          <h3 className="text-sm font-semibold text-mm-ink">適用金利の推移</h3>
          <p className="mt-0.5 text-xs text-mm-ink-caption">
            {mortgage.rateReviewIntervalYears}年ごとに +{mortgage.rateStepUp}%、上限{" "}
            {mortgage.maxInterestRate}% で頭打ちになります。
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {timeline.map((step) => (
              <li
                key={step.elapsedYears}
                className="flex items-center justify-between rounded-2xl bg-mm-soft-orange px-4 py-2.5 text-sm"
              >
                <span className="text-mm-ink-secondary">
                  {step.elapsedYears}年目（{step.year}年）〜
                </span>
                <span className="font-[family-name:var(--font-number)] font-semibold text-mm-ink">
                  {formatRate(step.rate)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* 維持費 */}
        <section className="rounded-3xl bg-white p-6 shadow-mm-soft">
          <h3 className="text-sm font-semibold text-mm-ink">維持費</h3>
          <p className="mt-0.5 text-xs text-mm-ink-caption">
            {isStepped
              ? "管理費・修繕積立金は、設定した段階ごとに切り替わります。"
              : `管理費・修繕積立金は年 ${mortgage.maintenanceIncreaseRate}%（複利）で上昇します。`}
          </p>
          {isStepped && (
            <ul className="mt-4 flex flex-col gap-2">
              {maintenanceSteps.map((step) => (
                <li
                  key={step.elapsedYears}
                  className="flex items-center justify-between rounded-2xl bg-mm-soft-orange px-4 py-2.5 text-sm"
                >
                  <span className="text-mm-ink-secondary">
                    {step.elapsedYears}年目（{step.year}年）〜
                  </span>
                  <span className="font-[family-name:var(--font-number)] font-semibold text-mm-ink">
                    月 {formatMan(step.monthly, 1)} 万円
                  </span>
                </li>
              ))}
            </ul>
          )}
          <dl className="mt-4 flex flex-col gap-2 text-sm">
            {[
              [
                "管理費（初年度・月額）",
                `${formatMan(first.managementFee / 12, 1)} 万円`,
              ],
              [
                "修繕積立金（初年度・月額）",
                `${formatMan(first.repairReserve / 12, 1)} 万円`,
              ],
              [
                "火災保険 + 地震保険",
                `${formatMan(mortgage.fireInsurance + mortgage.earthquakeInsurance, 1)} 万円 / ${mortgage.insuranceRenewalYears}年ごと`,
              ],
              [
                "保険料（月額平均）",
                `${formatMan((mortgage.fireInsurance + mortgage.earthquakeInsurance) / (mortgage.insuranceRenewalYears * 12), 2)} 万円`,
              ],
              ["返済期間中の維持費 合計", `${formatMan(totalMaintenance, 0)} 万円`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-2xl bg-mm-soft-orange px-4 py-2.5"
              >
                <dt className="text-mm-ink-secondary">{label}</dt>
                <dd className="font-[family-name:var(--font-number)] font-semibold text-mm-ink">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {/* 年次返済テーブル */}
      <section className="rounded-3xl bg-white p-6 shadow-mm-soft">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-mm-ink">返済スケジュール（万円）</h3>
            <p className="mt-0.5 text-xs text-mm-ink-caption">
              行をクリックすると、その年をハイライトできます
            </p>
          </div>
          <div className="flex rounded-full bg-mm-soft-orange p-1 text-sm font-medium">
            {(
              [
                ["summary", "合計"],
                ["breakdown", "内訳（通常・ボーナス）"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={detail === key}
                onClick={() => setDetail(key)}
                className={`rounded-full px-4 py-1.5 transition-colors ${
                  detail === key
                    ? "bg-white text-mm-ink shadow-mm-soft"
                    : "text-mm-ink-secondary hover:text-mm-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[560px] overflow-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-mm-sand">
                <th scope="col" className={`${TH_CLASS} text-left`}>
                  経過年数
                </th>
                <th scope="col" className={TH_CLASS}>
                  西暦
                </th>
                <th scope="col" className={TH_CLASS}>
                  適用金利
                </th>
                <th scope="col" className={TH_CLASS}>
                  残返済年数
                </th>
                {detail === "breakdown" ? (
                  <>
                    <th scope="col" className={TH_CLASS}>
                      通常: 返済額
                    </th>
                    <th scope="col" className={TH_CLASS}>
                      通常: 利息
                    </th>
                    <th scope="col" className={TH_CLASS}>
                      通常: 元金
                    </th>
                    <th scope="col" className={TH_CLASS}>
                      ボーナス: 返済額
                    </th>
                    <th scope="col" className={TH_CLASS}>
                      ボーナス: 利息
                    </th>
                    <th scope="col" className={TH_CLASS}>
                      ボーナス: 元金
                    </th>
                  </>
                ) : (
                  <>
                    <th scope="col" className={TH_CLASS}>
                      年間返済額
                    </th>
                    <th scope="col" className={TH_CLASS}>
                      うち利息
                    </th>
                    <th scope="col" className={TH_CLASS}>
                      うち元金
                    </th>
                  </>
                )}
                <th scope="col" className={TH_CLASS}>
                  年末残高
                </th>
                <th scope="col" className={TH_CLASS}>
                  維持費
                </th>
                <th scope="col" className={TH_CLASS}>
                  月の支払い
                </th>
              </tr>
            </thead>
            <tbody>
              {plan.map((row) => {
                const isSelected = selectedYear === row.year
                const rowClass = isSelected ? "bg-brand-amber/25 font-semibold" : "hover:bg-mm-cream"
                return (
                  <tr
                    key={row.year}
                    onClick={() => setSelectedYear(isSelected ? null : row.year)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        setSelectedYear(isSelected ? null : row.year)
                      }
                    }}
                    tabIndex={0}
                    aria-selected={isSelected}
                    className={`cursor-pointer border-b border-mm-sand/60 outline-none transition-colors last:border-b-0 focus-visible:ring-2 focus-visible:ring-brand-orange ${rowClass}`}
                  >
                    <th scope="row" className={`${TD_CLASS} text-left font-medium`}>
                      {row.elapsedYears}年目
                    </th>
                    <td className={TD_CLASS}>{row.year}</td>
                    <td className={TD_CLASS}>{formatRate(row.interestRate)}</td>
                    <td className={TD_CLASS}>{row.remainingYears}</td>
                    {detail === "breakdown" ? (
                      <>
                        <td className={TD_CLASS}>{formatMan(row.regularPayment)}</td>
                        <td className={`${TD_CLASS} text-brand-coral`}>{formatMan(row.regularInterest)}</td>
                        <td className={TD_CLASS}>{formatMan(row.regularPrincipal)}</td>
                        <td className={TD_CLASS}>{formatMan(row.bonusPayment)}</td>
                        <td className={`${TD_CLASS} text-brand-coral`}>{formatMan(row.bonusInterest)}</td>
                        <td className={TD_CLASS}>{formatMan(row.bonusPrincipal)}</td>
                      </>
                    ) : (
                      <>
                        <td className={TD_CLASS}>{formatMan(row.totalPayment)}</td>
                        <td className={`${TD_CLASS} text-brand-coral`}>{formatMan(row.totalInterest)}</td>
                        <td className={TD_CLASS}>
                          {formatMan(row.regularPrincipal + row.bonusPrincipal)}
                        </td>
                      </>
                    )}
                    <td className={TD_CLASS}>{formatMan(row.totalBalance)}</td>
                    <td className={TD_CLASS}>{formatMan(row.maintenanceTotal)}</td>
                    <td className={TD_CLASS}>{formatMan(row.monthlyOutlay, 2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-mm-ink-caption">
          「月の支払い」は通常返済分の月額と維持費の月割りの合計です。ボーナス返済分（年{" "}
          {formatMan(first.bonusPayment)} 万円〜）は含みません。
        </p>
      </section>
    </div>
  )
}
