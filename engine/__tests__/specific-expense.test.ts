import { describe, expect, it } from "vitest"
import { specificExpenseAt } from "../specific-expense"
import type { PersonSpecificExpense } from "../types"

const person: PersonSpecificExpense = {
  items: [
    { id: "fun", label: "娯楽費", monthly: 3 },
    { id: "sub", label: "サブスク", monthly: 2 },
    { id: "ins", label: "保険", monthly: 0.4 },
    { id: "etc", label: "その他", monthly: 2 },
  ],
  loans: [{ id: "loan", label: "奨学金", monthly: 1.4, payoffYear: 7 }],
}

describe("specificExpenseAt (items + loans)", () => {
  it("includes loans up to and including the payoff year", () => {
    // 〜7年目: (7.4 + 1.4) × 12 = 105.6
    expect(specificExpenseAt(person, 1)).toBeCloseTo(8.8 * 12, 6)
    expect(specificExpenseAt(person, 7)).toBeCloseTo(8.8 * 12, 6)
  })

  it("drops the loan after the payoff year", () => {
    // 8年目以降: 7.4 × 12 = 88.8
    expect(specificExpenseAt(person, 8)).toBeCloseTo(7.4 * 12, 6)
    expect(specificExpenseAt(person, 40)).toBeCloseTo(7.4 * 12, 6)
  })

  it("returns 0 when there are no items or loans", () => {
    expect(specificExpenseAt({ items: [], loans: [] }, 5)).toBe(0)
  })
})
