"use client"

import { useMemo } from "react"

import { BasicSettingsSection } from "../components/input-form/basic-settings-section"
import { IncomeSection } from "../components/input-form/income-section"
import { LivingExpenseSection } from "../components/input-form/living-expense-section"
import { MortgageSection } from "../components/input-form/mortgage-section"
import { LifePlanChart } from "../components/life-plan-chart"
import { LifePlanTable } from "../components/life-plan-table"
import { simulate } from "../engine/simulate"
import { useLifePlanInput } from "../hooks/use-life-plan-input"

export default function Home() {
  const { input, setInput } = useLifePlanInput()
  const results = useMemo(() => simulate(input), [input])

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-8">
        <h1 className="text-2xl font-bold tracking-tight">ライフプランシミュレーター</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <BasicSettingsSection
            value={input.basic}
            onChange={(basic) => setInput({ ...input, basic })}
          />
          <IncomeSection
            value={input.income}
            onChange={(income) => setInput({ ...input, income })}
          />
          <LivingExpenseSection
            value={input.livingExpense}
            onChange={(livingExpense) => setInput({ ...input, livingExpense })}
          />
          <MortgageSection
            value={input.mortgage}
            onChange={(mortgage) => setInput({ ...input, mortgage })}
          />
        </div>

        <LifePlanTable results={results} />
        <LifePlanChart results={results} />
      </main>
    </div>
  )
}
