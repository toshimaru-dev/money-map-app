import { describe, expect, it } from "vitest"
import { defaultInput } from "../default-input"
import { simulate } from "../simulate"
import type { LifePlanInput } from "../types"

function baseInput(): LifePlanInput {
  return { ...defaultInput, events: [] }
}

describe("simulate: life events", () => {
  it("applies no event income/expense when events is empty", () => {
    const results = simulate(baseInput())
    for (const r of results) {
      expect(r.eventIncome).toBe(0)
      expect(r.eventExpense).toBe(0)
    }
  })

  it("includes an expense event in totalExpense in the matching year only", () => {
    const input = baseInput()
    input.events = [
      { id: "e1", name: "車購入", year: input.basic.startYear + 3, type: "expense", amount: 300 },
    ]
    const results = simulate(input)
    const baseline = simulate(baseInput())

    expect(results[3].eventExpense).toBe(300)
    expect(results[3].totalExpense).toBeCloseTo(baseline[3].totalExpense + 300, 6)
    expect(results[3].netCashFlow).toBeCloseTo(baseline[3].netCashFlow - 300, 6)
    expect(results[2].eventExpense).toBe(0)
  })

  it("includes an income event in totalIncome as eventIncome", () => {
    const input = baseInput()
    input.events = [
      { id: "e1", name: "退職金", year: input.basic.startYear + 4, type: "income", amount: 2000 },
    ]
    const results = simulate(input)
    const baseline = simulate(baseInput())

    expect(results[4].eventIncome).toBe(2000)
    expect(results[4].totalIncome).toBeCloseTo(baseline[4].totalIncome + 2000, 6)
    expect(results[4].netCashFlow).toBeCloseTo(baseline[4].netCashFlow + 2000, 6)
  })

  it("threads event cash flow through the cumulative balance", () => {
    const input = baseInput()
    input.events = [
      { id: "e1", name: "リフォーム", year: input.basic.startYear + 2, type: "expense", amount: 1000 },
    ]
    const results = simulate(input)
    const baseline = simulate(baseInput())
    const last = results.length - 1

    expect(results[last].cashBalance).toBeCloseTo(baseline[last].cashBalance - 1000, 6)
  })
})
