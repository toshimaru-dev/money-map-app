"use client"

import { useState } from "react"

import { Card } from "@heroui/react"

import { stagedMonthlyAt } from "../../engine/mortgage"
import type {
  ChildRearingStage,
  LifePlanInput,
  LivingExpenseItem,
  MaintenanceStage,
  PersonSpecificExpense,
  RaisePhase,
  SpecificExpenseItem,
  SpecificExpenseLoan,
  WifeIncomeReductionPhase,
} from "../../engine/types"
import { EventSection } from "../input-form/event-section"
import { PlusIcon } from "../icons"
import { CellNumber, CellText, LabeledNumber, LabeledText } from "./fields"

type Setter = (input: LifePlanInput) => void

type InputTab = "basic" | "income" | "expense" | "housing" | "events"

const TABS: { key: InputTab; label: string }[] = [
  { key: "basic", label: "基本設定" },
  { key: "income", label: "収入" },
  { key: "expense", label: "支出" },
  { key: "housing", label: "住宅ローン" },
  { key: "events", label: "ライフイベント" },
]

/** カード内の合計。数値を1つの見出しとして目立たせる。 */
interface CardTotal {
  label: string
  value: number
  unit: string
  digits?: number
}

function TotalBadge({ label, value, unit, digits = 1 }: CardTotal) {
  return (
    <span className="flex items-baseline gap-2 rounded-full bg-mm-soft-orange px-4 py-1.5">
      <span className="text-xs font-medium text-mm-ink-secondary">{label}</span>
      <span className="font-[family-name:var(--font-number)] text-base font-bold text-mm-ink">
        {value.toLocaleString("ja-JP", {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        })}
      </span>
      <span className="text-xs text-mm-ink-secondary">{unit}</span>
    </span>
  )
}

function PersonCard({
  title,
  accent,
  totals,
  children,
}: {
  title: string
  accent: string
  totals?: CardTotal[]
  children: React.ReactNode
}) {
  return (
    <Card>
      <Card.Header>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <Card.Title>
            <span className={accent}>{title}</span>
          </Card.Title>
          {totals && totals.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {totals.map((total) => (
                <TotalBadge key={total.label} {...total} />
              ))}
            </div>
          )}
        </div>
      </Card.Header>
      <Card.Content>{children}</Card.Content>
    </Card>
  )
}

/* ============================== 基本設定 ============================== */
function BasicCard({ input, setInput }: { input: LifePlanInput; setInput: Setter }) {
  const b = input.basic
  const set = (patch: Partial<LifePlanInput["basic"]>) =>
    setInput({ ...input, basic: { ...b, ...patch } })
  return (
    <Card className="lg:col-span-2">
      <Card.Header>
        <Card.Title>基本設定</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <LabeledNumber label="開始年 (西暦)" value={b.startYear} onChange={(v) => set({ startYear: v })} integer />
          <LabeledNumber label="シミュレーション年数 (年)" value={b.simulationYears} onChange={(v) => set({ simulationYears: v })} />
          <LabeledNumber label="夫の現在年齢 (歳)" value={b.husbandAge} onChange={(v) => set({ husbandAge: v })} />
          <LabeledNumber label="妻の現在年齢 (歳)" value={b.wifeAge} onChange={(v) => set({ wifeAge: v })} />
          <LabeledNumber label="子の誕生 (何年後)" value={b.childBirthYearOffset} onChange={(v) => set({ childBirthYearOffset: v })} />
          <LabeledNumber label="夫の現在貯蓄 (万円)" value={b.husbandSavings} onChange={(v) => set({ husbandSavings: v })} integer />
          <LabeledNumber label="妻の現在貯蓄 (万円)" value={b.wifeSavings} onChange={(v) => set({ wifeSavings: v })} integer />
        </div>
        <div className="mt-4">
          <span className="mb-1.5 block text-sm text-mm-ink-secondary">住まい</span>
          <div className="flex rounded-full bg-mm-soft-orange p-1 text-sm font-medium">
            {(
              [
                ["mortgage", "住宅ローン"],
                ["rent", "賃貸"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={b.housingType === key}
                onClick={() => set({ housingType: key })}
                className={`rounded-full px-4 py-2 transition-colors ${
                  b.housingType === key ? "bg-white text-mm-ink shadow-mm-soft" : "text-mm-ink-secondary hover:text-mm-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Card.Content>
    </Card>
  )
}

/* ============================== 収入 ============================== */
function HusbandIncomeCard({ input, setInput }: { input: LifePlanInput; setInput: Setter }) {
  const h = input.income.husband
  const setHusband = (patch: Partial<typeof h>) =>
    setInput({ ...input, income: { ...input.income, husband: { ...h, ...patch } } })

  const updatePhase = (id: string, patch: Partial<RaisePhase>) =>
    setHusband({ raisePhases: h.raisePhases.map((p) => (p.id === id ? { ...p, ...patch } : p)) })
  const removePhase = (id: string) =>
    setHusband({ raisePhases: h.raisePhases.filter((p) => p.id !== id) })
  const addPhase = () => {
    const lastUntil = h.raisePhases.reduce((max, p) => Math.max(max, p.untilYear), 1)
    setHusband({
      raisePhases: [
        ...h.raisePhases,
        {
          id: crypto.randomUUID(),
          label: `昇給フェーズ${h.raisePhases.length + 1}`,
          annualRaise: 10,
          untilYear: lastUntil + 5,
        },
      ],
    })
  }

  return (
    <PersonCard title="夫の収入" accent="text-brand-blue">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <LabeledNumber label="現在年収 (万円)" value={h.baseIncome} onChange={(v) => setHusband({ baseIncome: v })} integer />
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-semibold text-mm-ink">昇給フェーズ</h3>
            <p className="mt-0.5 text-xs text-mm-ink-caption">
              指定の経過年数まで毎年その昇給額を適用します。最後のフェーズを過ぎると年収は維持されます。
            </p>
          </div>
          {h.raisePhases.length === 0 && (
            <p className="rounded-2xl bg-mm-soft-orange px-4 py-3 text-sm text-mm-ink-secondary">
              昇給フェーズがありません。「フェーズを追加」から昇給額と期間を設定できます。
            </p>
          )}
          {h.raisePhases.map((phase) => (
            <div
              key={phase.id}
              className="grid grid-cols-1 items-end gap-3 rounded-2xl border border-mm-sand p-3 sm:grid-cols-[1fr_140px_150px_auto]"
            >
              <LabeledText label="フェーズ名" value={phase.label} onChange={(v) => updatePhase(phase.id, { label: v })} />
              <LabeledNumber label="昇給額 (万円/年)" value={phase.annualRaise} onChange={(v) => updatePhase(phase.id, { annualRaise: v })} />
              <LabeledNumber label="適用終了 (経過年数)" value={phase.untilYear} onChange={(v) => updatePhase(phase.id, { untilYear: v })} />
              <button
                type="button"
                onClick={() => removePhase(phase.id)}
                className="h-10 rounded-2xl px-3 text-sm font-medium text-brand-coral transition-colors hover:bg-brand-coral/10 md:h-9"
              >
                削除
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addPhase}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-mm-sand px-4 py-2.5 text-sm font-medium text-mm-ink-secondary transition-colors hover:border-brand-orange hover:text-brand-orange"
          >
            <PlusIcon className="h-4 w-4" />
            フェーズを追加
          </button>
        </div>
      </div>
    </PersonCard>
  )
}

function WifeIncomeCard({ input, setInput }: { input: LifePlanInput; setInput: Setter }) {
  const w = input.income.wife
  const setWife = (patch: Partial<typeof w>) =>
    setInput({ ...input, income: { ...input.income, wife: { ...w, ...patch } } })

  const updatePhase = (id: string, patch: Partial<WifeIncomeReductionPhase>) =>
    setWife({ reductionPhases: w.reductionPhases.map((p) => (p.id === id ? { ...p, ...patch } : p)) })
  const removePhase = (id: string) =>
    setWife({ reductionPhases: w.reductionPhases.filter((p) => p.id !== id) })
  const addPhase = () =>
    setWife({
      reductionPhases: [
        ...w.reductionPhases,
        { id: crypto.randomUUID(), label: "収入減フェーズ", fromChildAge: 0, toChildAge: 2, annual: 200 },
      ],
    })

  return (
    <PersonCard title="妻の収入" accent="text-brand-coral">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <LabeledNumber label="通常時の年収 (万円)" value={w.baseIncome} onChange={(v) => setWife({ baseIncome: v })} integer />
          <LabeledNumber label="昇給額 (万円/年)" value={w.annualRaise} onChange={(v) => setWife({ annualRaise: v })} />
          <LabeledNumber label="昇給適用年数 (年)" value={w.raiseYears} onChange={(v) => setWife({ raiseYears: v })} />
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-semibold text-mm-ink">収入減フェーズ（子育て期間中の収入ダウン）</h3>
            <p className="mt-0.5 text-xs text-mm-ink-caption">
              子どもの年齢の範囲で、その期間の妻の年収を上書きします。
            </p>
          </div>
          {w.reductionPhases.length === 0 && (
            <p className="rounded-2xl bg-mm-soft-orange px-4 py-3 text-sm text-mm-ink-secondary">
              フェーズがありません。「フェーズを追加」から収入減の期間を設定できます。
            </p>
          )}
          {w.reductionPhases.map((phase) => (
            <div
              key={phase.id}
              className="grid grid-cols-1 items-end gap-3 rounded-2xl border border-mm-sand p-3 sm:grid-cols-[1fr_110px_110px_120px_auto]"
            >
              <LabeledText label="フェーズ名" value={phase.label} onChange={(v) => updatePhase(phase.id, { label: v })} />
              <LabeledNumber label="子: 年齢から" value={phase.fromChildAge} onChange={(v) => updatePhase(phase.id, { fromChildAge: v })} />
              <LabeledNumber label="子: 年齢まで" value={phase.toChildAge} onChange={(v) => updatePhase(phase.id, { toChildAge: v })} />
              <LabeledNumber label="年収 (万円)" value={phase.annual} onChange={(v) => updatePhase(phase.id, { annual: v })} integer />
              <button
                type="button"
                onClick={() => removePhase(phase.id)}
                className="h-10 rounded-2xl px-3 text-sm font-medium text-brand-coral transition-colors hover:bg-brand-coral/10 md:h-9"
              >
                削除
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addPhase}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-mm-sand px-4 py-2.5 text-sm font-medium text-mm-ink-secondary transition-colors hover:border-brand-orange hover:text-brand-orange"
          >
            <PlusIcon className="h-4 w-4" />
            フェーズを追加
          </button>
        </div>
      </div>
    </PersonCard>
  )
}

/* 子育て関連のステージ編集(収入=手当 / 支出=費用 で編集フィールドを切り替え) */
function ChildRearingCard({
  input,
  setInput,
  mode,
}: {
  input: LifePlanInput
  setInput: Setter
  mode: "allowance" | "cost"
}) {
  const stages = input.childRearing
  const update = (id: string, patch: Partial<ChildRearingStage>) =>
    setInput({ ...input, childRearing: stages.map((s) => (s.id === id ? { ...s, ...patch } : s)) })
  const remove = (id: string) =>
    setInput({ ...input, childRearing: stages.filter((s) => s.id !== id) })
  const add = () =>
    setInput({
      ...input,
      childRearing: [
        ...stages,
        { id: crypto.randomUUID(), label: "ステージ", fromChildAge: 0, toChildAge: 5, annualCost: 0, annualAllowance: 0 },
      ],
    })

  const isAllowance = mode === "allowance"
  const title = isAllowance ? "子ども（子育て関連手当）" : "子ども（子育て関連費用）"
  const valueLabel = isAllowance ? "手当 (万円/年)" : "費用 (万円/年)"

  // 各ステージの年額 × その年数を積み上げた、子育て期間トータルの金額
  const lifetimeTotal = stages.reduce((sum, stage) => {
    const years = Math.max(0, stage.toChildAge - stage.fromChildAge + 1)
    return sum + (isAllowance ? stage.annualAllowance : stage.annualCost) * years
  }, 0)

  return (
    <PersonCard
      title={title}
      accent="text-brand-green"
      totals={[
        {
          label: isAllowance ? "手当 全期間合計" : "費用 全期間合計",
          value: lifetimeTotal,
          unit: "万円",
          digits: 0,
        },
      ]}
    >
      <div className="flex flex-col gap-3">
        <p className="text-xs text-mm-ink-caption">子どもの年齢の範囲ごとに設定します。</p>
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="grid grid-cols-1 items-end gap-3 rounded-2xl border border-mm-sand p-3 sm:grid-cols-[1fr_100px_100px_130px_auto]"
          >
            <LabeledText label="ステージ名" value={stage.label} onChange={(v) => update(stage.id, { label: v })} />
            <LabeledNumber label="子: 年齢から" value={stage.fromChildAge} onChange={(v) => update(stage.id, { fromChildAge: v })} />
            <LabeledNumber label="子: 年齢まで" value={stage.toChildAge} onChange={(v) => update(stage.id, { toChildAge: v })} />
            {isAllowance ? (
              <LabeledNumber label={valueLabel} value={stage.annualAllowance} onChange={(v) => update(stage.id, { annualAllowance: v })} />
            ) : (
              <LabeledNumber label={valueLabel} value={stage.annualCost} onChange={(v) => update(stage.id, { annualCost: v })} />
            )}
            <button
              type="button"
              onClick={() => remove(stage.id)}
              className="h-10 rounded-2xl px-3 text-sm font-medium text-brand-coral transition-colors hover:bg-brand-coral/10 md:h-9"
            >
              削除
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-mm-sand px-4 py-2.5 text-sm font-medium text-mm-ink-secondary transition-colors hover:border-brand-orange hover:text-brand-orange"
        >
          <PlusIcon className="h-4 w-4" />
          ステージを追加
        </button>
      </div>
    </PersonCard>
  )
}

function OtherIncomeCard({ input, setInput }: { input: LifePlanInput; setInput: Setter }) {
  const other = input.income.otherIncome
  const set = (patch: Partial<LifePlanInput["income"]["otherIncome"]>) =>
    setInput({ ...input, income: { ...input.income, otherIncome: { ...other, ...patch } } })
  return (
    <PersonCard title="その他収入" accent="text-brand-green">
      <p className="mb-3 text-xs text-mm-ink-caption">
        副業・短期的な収入など。適用する期間(経過年数)も設定できます。
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <LabeledNumber label="その他収入 (万円/年)" value={other.annualAmount} onChange={(v) => set({ annualAmount: v })} />
        <LabeledNumber label="開始 (経過年数)" value={other.fromYear} onChange={(v) => set({ fromYear: v })} />
        <LabeledNumber label="終了 (経過年数)" value={other.untilYear} onChange={(v) => set({ untilYear: v })} />
      </div>
    </PersonCard>
  )
}

/* ============================== 支出 ============================== */
function RowDeleteButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex min-h-[44px] w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-medium text-brand-coral transition-colors hover:bg-brand-coral/10 sm:h-9 sm:min-h-0 sm:w-9 sm:rounded-full sm:px-0 sm:py-0"
    >
      <span className="sm:hidden">削除</span>
      <span className="hidden sm:inline">×</span>
    </button>
  )
}

function AddRowButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-mm-sand px-4 py-3 text-sm font-medium text-mm-ink-secondary transition-colors hover:border-brand-orange hover:text-brand-orange sm:py-2"
    >
      <PlusIcon className="h-4 w-4" />
      {label}
    </button>
  )
}

function SpecificExpenseCard({
  title,
  accent,
  value,
  onChange,
}: {
  title: string
  accent: string
  value: PersonSpecificExpense
  onChange: (value: PersonSpecificExpense) => void
}) {
  const updateItem = (id: string, patch: Partial<SpecificExpenseItem>) =>
    onChange({ ...value, items: value.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) })
  const removeItem = (id: string) =>
    onChange({ ...value, items: value.items.filter((it) => it.id !== id) })
  const addItem = () =>
    onChange({ ...value, items: [...value.items, { id: crypto.randomUUID(), label: "項目", monthly: 0 }] })

  const updateLoan = (id: string, patch: Partial<SpecificExpenseLoan>) =>
    onChange({ ...value, loans: value.loans.map((l) => (l.id === id ? { ...l, ...patch } : l)) })
  const removeLoan = (id: string) =>
    onChange({ ...value, loans: value.loans.filter((l) => l.id !== id) })
  const addLoan = () =>
    onChange({
      ...value,
      loans: [...value.loans, { id: crypto.randomUUID(), label: "ローン", monthly: 0, payoffYear: 10 }],
    })

  const monthlyTotal =
    value.items.reduce((s, it) => s + it.monthly, 0) + value.loans.reduce((s, l) => s + l.monthly, 0)

  return (
    <PersonCard
      title={title}
      accent={accent}
      totals={[
        { label: "月額合計", value: monthlyTotal, unit: "万円" },
        { label: "年額", value: monthlyTotal * 12, unit: "万円" },
      ]}
    >
      <p className="mb-3 text-xs text-mm-ink-caption">
        娯楽費・保険などの通常項目とローン(奨学金など)を入力します。
      </p>

      <div className="flex flex-col gap-4">
        {/* 通常項目 */}
        <div>
          <div className="w-full max-w-lg">
            <div className="hidden border-b border-mm-sand sm:grid sm:grid-cols-[1fr_8rem_2.5rem] sm:gap-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-mm-ink-secondary">固有支出内訳</div>
              <div className="px-2 py-1.5 text-xs font-semibold text-mm-ink-secondary">支出(月額 万円)</div>
              <div />
            </div>
            <div className="flex flex-col gap-3 sm:gap-0">
              {value.items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 gap-2 rounded-2xl border border-mm-sand p-3 sm:grid-cols-[1fr_8rem_2.5rem] sm:items-center sm:rounded-none sm:border-0 sm:border-b sm:border-mm-sand/60 sm:p-0"
                >
                  <div className="flex flex-col gap-1 sm:px-2 sm:py-1.5">
                    <span className="text-xs text-mm-ink-secondary sm:hidden">固有支出内訳</span>
                    <CellText ariaLabel="項目名" value={item.label} onChange={(v) => updateItem(item.id, { label: v })} />
                  </div>
                  <div className="flex flex-col gap-1 sm:px-2 sm:py-1.5">
                    <span className="text-xs text-mm-ink-secondary sm:hidden">支出(月額 万円)</span>
                    <CellNumber ariaLabel="月額" value={item.monthly} onChange={(v) => updateItem(item.id, { monthly: v })} />
                  </div>
                  <div className="sm:px-0.5 sm:py-1.5">
                    <RowDeleteButton onClick={() => removeItem(item.id)} label="項目を削除" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2">
            <AddRowButton onClick={addItem} label="項目を追加" />
          </div>
        </div>

        {/* ローン */}
        <div>
          <h4 className="mb-1.5 text-sm font-semibold text-mm-ink">ローン</h4>
          <div className="w-full max-w-2xl">
            <div className="hidden border-b border-mm-sand sm:grid sm:grid-cols-[1fr_8rem_9rem_2.5rem] sm:gap-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-mm-ink-secondary">固有支出内訳</div>
              <div className="px-2 py-1.5 text-xs font-semibold text-mm-ink-secondary">支出(月額 万円)</div>
              <div className="px-2 py-1.5 text-xs font-semibold text-mm-ink-secondary">払い終わり(年後)</div>
              <div />
            </div>
            <div className="flex flex-col gap-3 sm:gap-0">
              {value.loans.map((loan) => (
                <div
                  key={loan.id}
                  className="grid grid-cols-1 gap-2 rounded-2xl border border-mm-sand p-3 sm:grid-cols-[1fr_8rem_9rem_2.5rem] sm:items-center sm:rounded-none sm:border-0 sm:border-b sm:border-mm-sand/60 sm:p-0"
                >
                  <div className="flex flex-col gap-1 sm:px-2 sm:py-1.5">
                    <span className="text-xs text-mm-ink-secondary sm:hidden">固有支出内訳</span>
                    <CellText ariaLabel="ローン名" value={loan.label} onChange={(v) => updateLoan(loan.id, { label: v })} />
                  </div>
                  <div className="flex flex-col gap-1 sm:px-2 sm:py-1.5">
                    <span className="text-xs text-mm-ink-secondary sm:hidden">支出(月額 万円)</span>
                    <CellNumber ariaLabel="月額" value={loan.monthly} onChange={(v) => updateLoan(loan.id, { monthly: v })} />
                  </div>
                  <div className="flex flex-col gap-1 sm:px-2 sm:py-1.5">
                    <span className="text-xs text-mm-ink-secondary sm:hidden">払い終わり(年後)</span>
                    <CellNumber ariaLabel="払い終わり" value={loan.payoffYear} onChange={(v) => updateLoan(loan.id, { payoffYear: v })} />
                  </div>
                  <div className="sm:px-0.5 sm:py-1.5">
                    <RowDeleteButton onClick={() => removeLoan(loan.id)} label="ローンを削除" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2">
            <AddRowButton onClick={addLoan} label="ローンを追加" />
          </div>
        </div>
      </div>
    </PersonCard>
  )
}

function LivingExpenseCard({ input, setInput }: { input: LifePlanInput; setInput: Setter }) {
  const lv = input.livingExpense
  const updateItem = (id: string, patch: Partial<LivingExpenseItem>) =>
    setInput({ ...input, livingExpense: { ...lv, items: lv.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) } })
  const removeItem = (id: string) =>
    setInput({ ...input, livingExpense: { ...lv, items: lv.items.filter((it) => it.id !== id) } })
  const addItem = () =>
    setInput({
      ...input,
      livingExpense: { ...lv, items: [...lv.items, { id: crypto.randomUUID(), label: "費目", husbandMonthly: 0, wifeMonthly: 0 }] },
    })

  const husbandTotal = lv.items.reduce((s, it) => s + it.husbandMonthly, 0)
  const wifeTotal = lv.items.reduce((s, it) => s + it.wifeMonthly, 0)

  return (
    <PersonCard
      title="基礎生活費"
      accent="text-mm-ink"
      totals={[
        { label: "月額合計", value: husbandTotal + wifeTotal, unit: "万円" },
        { label: "年額", value: (husbandTotal + wifeTotal) * 12, unit: "万円" },
      ]}
    >
      <div className="w-full max-w-2xl">
        <div className="hidden border-b border-mm-sand sm:grid sm:grid-cols-[1fr_8rem_8rem_2.5rem] sm:gap-2">
          <div className="px-2 py-1.5 text-xs font-semibold text-mm-ink-secondary">費目</div>
          <div className="px-2 py-1.5 text-xs font-semibold text-mm-ink-secondary">夫(月額 万円)</div>
          <div className="px-2 py-1.5 text-xs font-semibold text-mm-ink-secondary">妻(月額 万円)</div>
          <div />
        </div>
        <div className="flex flex-col gap-3 sm:gap-0">
          {lv.items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-1 gap-2 rounded-2xl border border-mm-sand p-3 sm:grid-cols-[1fr_8rem_8rem_2.5rem] sm:items-center sm:rounded-none sm:border-0 sm:border-b sm:border-mm-sand/60 sm:p-0"
            >
              <div className="flex flex-col gap-1 sm:px-2 sm:py-1.5">
                <span className="text-xs text-mm-ink-secondary sm:hidden">費目</span>
                <CellText ariaLabel="費目名" value={item.label} onChange={(v) => updateItem(item.id, { label: v })} />
              </div>
              <div className="flex flex-col gap-1 sm:px-2 sm:py-1.5">
                <span className="text-xs text-mm-ink-secondary sm:hidden">夫(月額 万円)</span>
                <CellNumber ariaLabel="夫の月額" value={item.husbandMonthly} onChange={(v) => updateItem(item.id, { husbandMonthly: v })} />
              </div>
              <div className="flex flex-col gap-1 sm:px-2 sm:py-1.5">
                <span className="text-xs text-mm-ink-secondary sm:hidden">妻(月額 万円)</span>
                <CellNumber ariaLabel="妻の月額" value={item.wifeMonthly} onChange={(v) => updateItem(item.id, { wifeMonthly: v })} />
              </div>
              <div className="sm:px-0.5 sm:py-1.5">
                <RowDeleteButton onClick={() => removeItem(item.id)} label="費目を削除" />
              </div>
            </div>
          ))}
          <div className="grid grid-cols-1 gap-1 rounded-2xl bg-mm-soft-orange p-3 font-semibold text-mm-ink sm:grid-cols-[1fr_8rem_8rem_2.5rem] sm:gap-2 sm:rounded-none sm:bg-transparent sm:p-0">
            <div className="py-1 text-sm sm:px-2 sm:py-1.5">合計 (月額)</div>
            <div className="flex items-center justify-between py-1 text-sm font-[family-name:var(--font-number)] sm:block sm:px-2 sm:py-1.5">
              <span className="font-[family-name:var(--font-sans)] text-xs text-mm-ink-secondary sm:hidden">夫</span>
              {husbandTotal.toFixed(1)}
            </div>
            <div className="flex items-center justify-between py-1 text-sm font-[family-name:var(--font-number)] sm:block sm:px-2 sm:py-1.5">
              <span className="font-[family-name:var(--font-sans)] text-xs text-mm-ink-secondary sm:hidden">妻</span>
              {wifeTotal.toFixed(1)}
            </div>
            <div />
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-end gap-4">
        <AddRowButton onClick={addItem} label="費目を追加" />
        <div className="w-48">
          <LabeledNumber
            label="物価上昇率 (%/年)"
            value={lv.annualInflationRate}
            onChange={(v) => setInput({ ...input, livingExpense: { ...lv, annualInflationRate: v } })}
          />
        </div>
      </div>
    </PersonCard>
  )
}

/* ============================== 住宅ローン ============================== */
function MortgageLoanCard({ input, setInput }: { input: LifePlanInput; setInput: Setter }) {
  const mg = input.mortgage
  const set = (patch: Partial<LifePlanInput["mortgage"]>) =>
    setInput({ ...input, mortgage: { ...mg, ...patch } })

  const financed = Math.max(0, mg.principal - mg.downPayment)
  const regularPrincipal = Math.max(0, financed - mg.bonusPrincipal)

  return (
    <PersonCard
      title="借入条件"
      accent="text-mm-ink"
      totals={[
        { label: "借入総額", value: financed, unit: "万円", digits: 0 },
        { label: "うち通常返済分", value: regularPrincipal, unit: "万円", digits: 0 },
      ]}
    >
      <p className="mb-3 text-xs text-mm-ink-caption">
        借入金額から頭金を引いた額を、ボーナス返済に充当する元金とそれ以外に分けて別々に返済計画を組みます。
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <LabeledNumber label="借入金額 (万円)" value={mg.principal} onChange={(v) => set({ principal: v })} integer />
        <LabeledNumber label="頭金 (万円)" value={mg.downPayment} onChange={(v) => set({ downPayment: v })} integer />
        <LabeledNumber label="開始金利 (年率%)" value={mg.initialInterestRate} onChange={(v) => set({ initialInterestRate: v })} />
        <LabeledNumber label="返済期間 (年)" value={mg.termYears} onChange={(v) => set({ termYears: v })} />
        <LabeledNumber label="ボーナス返済に充当する元金 (万円)" value={mg.bonusPrincipal} onChange={(v) => set({ bonusPrincipal: v })} integer />
      </div>
    </PersonCard>
  )
}

function MortgageRateCard({ input, setInput }: { input: LifePlanInput; setInput: Setter }) {
  const mg = input.mortgage
  const set = (patch: Partial<LifePlanInput["mortgage"]>) =>
    setInput({ ...input, mortgage: { ...mg, ...patch } })

  // 上限に到達するまでに必要な見直し回数から、頭打ちになる年を求める
  const stepsToCap =
    mg.rateStepUp > 0 ? Math.ceil((mg.maxInterestRate - mg.initialInterestRate) / mg.rateStepUp) : 0
  const capYear = stepsToCap * mg.rateReviewIntervalYears + 1

  return (
    <PersonCard
      title="変動金利（物価上昇連動）の前提"
      accent="text-mm-ink"
      totals={[{ label: "上限到達", value: capYear, unit: "年目", digits: 0 }]}
    >
      <p className="mb-3 text-xs text-mm-ink-caption">
        見直し間隔ごとに金利を引き上げ、上限に達したらそれ以降は上限を維持します。
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <LabeledNumber label="金利の上限 (年率%)" value={mg.maxInterestRate} onChange={(v) => set({ maxInterestRate: v })} />
        <LabeledNumber label="金利見直し間隔 (年)" value={mg.rateReviewIntervalYears} onChange={(v) => set({ rateReviewIntervalYears: v })} />
        <LabeledNumber label="1回あたりの上昇幅 (年率%)" value={mg.rateStepUp} onChange={(v) => set({ rateStepUp: v })} />
      </div>
    </PersonCard>
  )
}

/** 段階的な維持費(管理費 or 修繕積立金)の編集。 */
function MaintenanceStageList({
  title,
  description,
  stages,
  onChange,
}: {
  title: string
  description: string
  stages: MaintenanceStage[]
  onChange: (stages: MaintenanceStage[]) => void
}) {
  const update = (id: string, patch: Partial<MaintenanceStage>) =>
    onChange(stages.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  const remove = (id: string) => onChange(stages.filter((s) => s.id !== id))
  const add = () => {
    const lastUntil = stages.reduce((max, s) => Math.max(max, s.untilYear), 0)
    const lastMonthly = stages.length > 0 ? stages[stages.length - 1].monthly : 0
    onChange([
      ...stages,
      {
        id: crypto.randomUUID(),
        label: `第${stages.length}回見直し後`,
        monthly: lastMonthly,
        untilYear: lastUntil + 10,
      },
    ])
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold text-mm-ink">{title}</h3>
        <p className="mt-0.5 text-xs text-mm-ink-caption">{description}</p>
      </div>
      {stages.length === 0 && (
        <p className="rounded-2xl bg-mm-soft-orange px-4 py-3 text-sm text-mm-ink-secondary">
          段階がありません。「段階を追加」から金額と期間を設定できます。
        </p>
      )}
      {stages.map((stage) => (
        <div
          key={stage.id}
          className="grid grid-cols-1 items-end gap-3 rounded-2xl border border-mm-sand p-3 sm:grid-cols-[1fr_140px_160px_auto]"
        >
          <LabeledText label="段階名" value={stage.label} onChange={(v) => update(stage.id, { label: v })} />
          <LabeledNumber label="月額 (万円)" value={stage.monthly} onChange={(v) => update(stage.id, { monthly: v })} />
          <LabeledNumber label="適用終了 (経過年数)" value={stage.untilYear} onChange={(v) => update(stage.id, { untilYear: v })} />
          <button
            type="button"
            onClick={() => remove(stage.id)}
            className="h-10 rounded-2xl px-3 text-sm font-medium text-brand-coral transition-colors hover:bg-brand-coral/10 md:h-9"
          >
            削除
          </button>
        </div>
      ))}
      <AddRowButton onClick={add} label="段階を追加" />
    </div>
  )
}

function MortgageMaintenanceCard({ input, setInput }: { input: LifePlanInput; setInput: Setter }) {
  const mg = input.mortgage
  const set = (patch: Partial<LifePlanInput["mortgage"]>) =>
    setInput({ ...input, mortgage: { ...mg, ...patch } })

  const isStepped = mg.maintenanceMode === "stepped"
  // 初年度(経過年数1年目)の月額。方式によって参照するデータが変わる
  const firstYearManagementFee = mg.includeFirstYearManagementFee
    ? isStepped
      ? stagedMonthlyAt(mg.managementFeeStages, 1)
      : mg.monthlyManagementFee
    : 0
  const firstYearRepairReserve = mg.includeFirstYearRepairReserve
    ? isStepped
      ? stagedMonthlyAt(mg.repairReserveStages, 1)
      : mg.monthlyRepairReserve
    : 0
  const monthlyBase = firstYearManagementFee + firstYearRepairReserve
  const insurancePerRenewal = mg.fireInsurance + mg.earthquakeInsurance
  const insuranceMonthly =
    mg.insuranceRenewalYears > 0 ? insurancePerRenewal / (mg.insuranceRenewalYears * 12) : 0
  const firstYearInsuranceMonthly = mg.includeFirstYearInsurance ? insuranceMonthly : 0

  return (
    <PersonCard
      title="維持費・保険"
      accent="text-mm-ink"
      totals={[
        { label: "初年度の月額合計", value: monthlyBase + firstYearInsuranceMonthly, unit: "万円", digits: 2 },
        { label: "初年度の年額", value: (monthlyBase + firstYearInsuranceMonthly) * 12, unit: "万円" },
      ]}
    >
      <div className="flex flex-col gap-5">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h3 className="text-sm font-semibold text-mm-ink">管理費・修繕積立金</h3>
            <div className="flex rounded-full bg-mm-soft-orange p-0.5 text-xs font-medium">
              {(
                [
                  ["compound", "複利上昇"],
                  ["stepped", "段階的"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={mg.maintenanceMode === key}
                  onClick={() => set({ maintenanceMode: key })}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    mg.maintenanceMode === key
                      ? "bg-white text-mm-ink shadow-mm-soft"
                      : "text-mm-ink-secondary hover:text-mm-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FirstYearInclusionToggle
              label="管理費"
              included={mg.includeFirstYearManagementFee}
              onChange={(includeFirstYearManagementFee) => set({ includeFirstYearManagementFee })}
            />
            <FirstYearInclusionToggle
              label="修繕積立金"
              included={mg.includeFirstYearRepairReserve}
              onChange={(includeFirstYearRepairReserve) => set({ includeFirstYearRepairReserve })}
            />
          </div>

          {isStepped ? (
            <div className="flex flex-col gap-5">
              <p className="text-xs text-mm-ink-caption">
                長期修繕計画のような段階的な値上げを、金額と適用期間で入力します。最後の段階を過ぎると、その月額を維持します。
              </p>
              <MaintenanceStageList
                title="管理費"
                description="経過年数の区切りごとの月額です。値上げがなければ1段階だけで構いません。"
                stages={mg.managementFeeStages}
                onChange={(managementFeeStages) => set({ managementFeeStages })}
              />
              <MaintenanceStageList
                title="修繕積立金"
                description="長期修繕計画の見直しに合わせて段階を追加します。"
                stages={mg.repairReserveStages}
                onChange={(repairReserveStages) => set({ repairReserveStages })}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-mm-ink-caption">
                初年度の月額から、毎年一定率で複利上昇します。
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <LabeledNumber label="管理費 (月額 万円)" value={mg.monthlyManagementFee} onChange={(v) => set({ monthlyManagementFee: v })} />
                <LabeledNumber label="修繕積立金 (月額 万円)" value={mg.monthlyRepairReserve} onChange={(v) => set({ monthlyRepairReserve: v })} />
                <LabeledNumber label="年間上昇率 (複利 %)" value={mg.maintenanceIncreaseRate} onChange={(v) => set({ maintenanceIncreaseRate: v })} />
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-mm-ink">保険</h3>
          <p className="mb-3 text-xs text-mm-ink-caption">更新のたびに一括で支払う前提です。</p>
          <div className="mb-4 max-w-md">
            <FirstYearInclusionToggle
              label="火災保険・地震保険"
              included={mg.includeFirstYearInsurance}
              onChange={(includeFirstYearInsurance) => set({ includeFirstYearInsurance })}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <LabeledNumber label="火災保険 (万円/更新)" value={mg.fireInsurance} onChange={(v) => set({ fireInsurance: v })} />
            <LabeledNumber label="地震保険 (万円/更新)" value={mg.earthquakeInsurance} onChange={(v) => set({ earthquakeInsurance: v })} />
            <LabeledNumber label="保険更新頻度 (年)" value={mg.insuranceRenewalYears} onChange={(v) => set({ insuranceRenewalYears: v })} />
          </div>
          <p className="mt-3 text-xs text-mm-ink-caption">
            保険料の月額平均: {insuranceMonthly.toFixed(2)}万円（{insurancePerRenewal.toFixed(1)}万円 ÷{" "}
            {mg.insuranceRenewalYears}年）
          </p>
        </div>
      </div>
    </PersonCard>
  )
}

function FirstYearInclusionToggle({
  label,
  included,
  onChange,
}: {
  label: string
  included: boolean
  onChange: (included: boolean) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-mm-sand px-3 py-2">
      <span className="text-xs font-medium text-mm-ink">{label}: 初年度に含める</span>
      <div className="flex rounded-full bg-mm-soft-orange p-0.5 text-xs font-medium">
        {(
          [
            [true, "含める"],
            [false, "含めない"],
          ] as const
        ).map(([key, text]) => (
          <button
            key={String(key)}
            type="button"
            aria-label={`${label}を初年度に${text}`}
            aria-pressed={included === key}
            onClick={() => onChange(key)}
            className={`rounded-full px-3 py-1 transition-colors ${
              included === key
                ? "bg-white text-mm-ink shadow-mm-soft"
                : "text-mm-ink-secondary hover:text-mm-ink"
            }`}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}

function RentCard({ input, setInput }: { input: LifePlanInput; setInput: Setter }) {
  const rent = input.rent
  const set = (patch: Partial<LifePlanInput["rent"]>) =>
    setInput({ ...input, rent: { ...rent, ...patch } })
  return (
    <PersonCard
      title="住宅賃料"
      accent="text-mm-ink"
      totals={[
        { label: "年額（更新料を除く）", value: rent.monthlyRent * 12, unit: "万円" },
      ]}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <LabeledNumber label="月額賃料 (万円)" value={rent.monthlyRent} onChange={(v) => set({ monthlyRent: v })} />
        <LabeledNumber label="更新料 (万円)" value={rent.renewalFee} onChange={(v) => set({ renewalFee: v })} />
        <LabeledNumber label="更新タイミング (○年ごと)" value={rent.renewalIntervalYears} onChange={(v) => set({ renewalIntervalYears: v })} />
        <LabeledNumber label="賃料上昇 (更新ごと 万円/月)" value={rent.rentIncreasePerRenewal} onChange={(v) => set({ rentIncreasePerRenewal: v })} />
      </div>
    </PersonCard>
  )
}

function InvestmentCard({ input, setInput }: { input: LifePlanInput; setInput: Setter }) {
  const mid = input.investment.midTerm
  const long = input.investment.longTerm
  const setMid = (patch: Partial<LifePlanInput["investment"]["midTerm"]>) =>
    setInput({ ...input, investment: { ...input.investment, midTerm: { ...mid, ...patch } } })
  const setLong = (patch: Partial<LifePlanInput["investment"]["longTerm"]>) =>
    setInput({ ...input, investment: { ...input.investment, longTerm: { ...long, ...patch } } })
  return (
    <PersonCard
      title="金融商品積立"
      accent="text-mm-ink"
      totals={[
        {
          label: "年間積立合計",
          value: mid.annualContribution + long.annualContribution,
          unit: "万円",
        },
        {
          label: "現在残高合計",
          value: mid.initialBalance + long.initialBalance,
          unit: "万円",
          digits: 0,
        },
      ]}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <LabeledNumber label="中期: 現在残高 (万円)" value={mid.initialBalance} onChange={(v) => setMid({ initialBalance: v })} integer />
        <LabeledNumber label="中期: 年間積立額 (万円)" value={mid.annualContribution} onChange={(v) => setMid({ annualContribution: v })} />
        <LabeledNumber label="中期: 利回り (%/年)" value={mid.annualReturnRate} onChange={(v) => setMid({ annualReturnRate: v })} />
        <LabeledNumber label="長期: 現在残高 (万円)" value={long.initialBalance} onChange={(v) => setLong({ initialBalance: v })} integer />
        <LabeledNumber label="長期: 年間積立額 (万円)" value={long.annualContribution} onChange={(v) => setLong({ annualContribution: v })} />
        <LabeledNumber label="長期: 利回り (%/年)" value={long.annualReturnRate} onChange={(v) => setLong({ annualReturnRate: v })} />
      </div>
    </PersonCard>
  )
}

function TaxCard({ input, setInput }: { input: LifePlanInput; setInput: Setter }) {
  const tax = input.tax
  const ded = input.mortgageDeduction
  const setTax = (patch: Partial<LifePlanInput["tax"]>) =>
    setInput({ ...input, tax: { ...tax, ...patch } })
  const setDeduction = (patch: Partial<LifePlanInput["mortgageDeduction"]>) =>
    setInput({ ...input, mortgageDeduction: { ...ded, ...patch } })
  return (
    <PersonCard title="税金・社会保険料" accent="text-mm-ink">
      <p className="mb-3 text-xs text-mm-ink-caption">
        税金・社会保険料は基本的に収入から自動計算します（給与所得控除＋累進課税＋住民税の概算）。必要なら手動で金額を指定できます。
      </p>
      <div className="flex flex-col gap-5">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h3 className="text-sm font-semibold text-mm-ink">税金</h3>
            <AutoManualToggle
              auto={tax.autoTax}
              onChange={(auto) => setTax({ autoTax: auto })}
            />
          </div>
          {tax.autoTax ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <LabeledNumber label="基礎控除 (所得税, 万円)" value={tax.basicDeductionIncome} onChange={(v) => setTax({ basicDeductionIncome: v })} />
              <LabeledNumber label="基礎控除 (住民税, 万円)" value={tax.basicDeductionResident} onChange={(v) => setTax({ basicDeductionResident: v })} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <LabeledNumber label="税金 (万円/年)" value={tax.manualTaxAnnual} onChange={(v) => setTax({ manualTaxAnnual: v })} />
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center gap-3">
            <h3 className="text-sm font-semibold text-mm-ink">社会保険料</h3>
            <AutoManualToggle
              auto={tax.autoSocialInsurance}
              onChange={(auto) => setTax({ autoSocialInsurance: auto })}
            />
          </div>
          {tax.autoSocialInsurance ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <LabeledNumber label="社会保険料率 (0〜1)" value={tax.socialInsuranceRate} onChange={(v) => setTax({ socialInsuranceRate: v })} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <LabeledNumber label="社会保険料 (万円/年)" value={tax.manualSocialInsuranceAnnual} onChange={(v) => setTax({ manualSocialInsuranceAnnual: v })} />
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-mm-ink">住宅ローン控除</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <LabeledNumber label="控除率 (%)" value={ded.rate} onChange={(v) => setDeduction({ rate: v })} />
            <LabeledNumber label="適用年数" value={ded.years} onChange={(v) => setDeduction({ years: v })} />
            <LabeledNumber label="控除対象の残高上限 (万円)" value={ded.capBalance} onChange={(v) => setDeduction({ capBalance: v })} integer />
          </div>
        </div>
      </div>
    </PersonCard>
  )
}

function AutoManualToggle({ auto, onChange }: { auto: boolean; onChange: (auto: boolean) => void }) {
  return (
    <div className="flex rounded-full bg-mm-soft-orange p-0.5 text-xs font-medium">
      {(
        [
          [true, "自動計算"],
          [false, "手動"],
        ] as const
      ).map(([key, label]) => (
        <button
          key={String(key)}
          type="button"
          aria-pressed={auto === key}
          onClick={() => onChange(key)}
          className={`rounded-full px-3 py-1 transition-colors ${
            auto === key ? "bg-white text-mm-ink shadow-mm-soft" : "text-mm-ink-secondary hover:text-mm-ink"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

/* ============================== ページ ============================== */
export function DataInputPage({ input, setInput }: { input: LifePlanInput; setInput: Setter }) {
  const [activeTab, setActiveTab] = useState<InputTab>("basic")

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-mm-ink">データ入力</h1>
        <p className="mt-1 text-sm text-mm-ink-secondary">
          ライフプランのデータはこのページで入力・変更します。他のページは結果の閲覧用です。
        </p>
      </div>

      {/* タブ切り替え */}
      <div
        role="tablist"
        aria-label="入力カテゴリ"
        className="flex flex-wrap gap-1 self-start rounded-full bg-mm-soft-orange p-1 text-sm font-medium"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2.5 transition-colors sm:py-2 ${
                isActive ? "bg-white text-mm-ink shadow-mm-soft" : "text-mm-ink-secondary hover:text-mm-ink"
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === "basic" && <BasicCard input={input} setInput={setInput} />}

      {activeTab === "income" && (
        <div className="grid grid-cols-1 gap-5">
          <HusbandIncomeCard input={input} setInput={setInput} />
          <WifeIncomeCard input={input} setInput={setInput} />
          <OtherIncomeCard input={input} setInput={setInput} />
          <ChildRearingCard input={input} setInput={setInput} mode="allowance" />
        </div>
      )}

      {activeTab === "expense" && (
        <div className="grid grid-cols-1 gap-5">
          <LivingExpenseCard input={input} setInput={setInput} />
          <SpecificExpenseCard
            title="夫（固有の支出）"
            accent="text-brand-blue"
            value={input.specificExpense.husband}
            onChange={(husband) => setInput({ ...input, specificExpense: { ...input.specificExpense, husband } })}
          />
          <SpecificExpenseCard
            title="妻（固有の支出）"
            accent="text-brand-coral"
            value={input.specificExpense.wife}
            onChange={(wife) => setInput({ ...input, specificExpense: { ...input.specificExpense, wife } })}
          />
          <ChildRearingCard input={input} setInput={setInput} mode="cost" />
          <InvestmentCard input={input} setInput={setInput} />
          <TaxCard input={input} setInput={setInput} />
        </div>
      )}

      {activeTab === "housing" && (
        <div className="grid grid-cols-1 gap-5">
          {input.basic.housingType === "rent" ? (
            <>
              <p className="rounded-2xl bg-mm-soft-orange px-4 py-3 text-sm text-mm-ink-secondary">
                現在は「賃貸」で試算しています。住宅ローンの設定を使うには、「基本設定」で住まいを「住宅ローン」に切り替えてください。
              </p>
              <RentCard input={input} setInput={setInput} />
            </>
          ) : (
            <>
              <MortgageLoanCard input={input} setInput={setInput} />
              <MortgageRateCard input={input} setInput={setInput} />
              <MortgageMaintenanceCard input={input} setInput={setInput} />
            </>
          )}
        </div>
      )}

      {activeTab === "events" && (
        <div className="grid grid-cols-1">
          <EventSection
            value={input.events}
            startYear={input.basic.startYear}
            onChange={(events) => setInput({ ...input, events })}
          />
        </div>
      )}
    </div>
  )
}
