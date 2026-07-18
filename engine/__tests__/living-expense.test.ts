import { describe, expect, it } from "vitest"
import { calcLivingExpenseSchedule } from "../living-expense"

describe("calcLivingExpenseSchedule", () => {
  it("year 1 equals monthlyAmount * 12 exactly with no inflation applied yet", () => {
    const schedule = calcLivingExpenseSchedule({ monthlyAmount: 25, annualInflationRate: 2 }, 10)
    expect(schedule[0]).toBe(25 * 12)
  })

  it("compounds annualInflationRate starting from year 2", () => {
    const config = { monthlyAmount: 25, annualInflationRate: 2 }
    const schedule = calcLivingExpenseSchedule(config, 10)
    const yearN = 6
    const expected = config.monthlyAmount * 12 * 1.02 ** (yearN - 1)
    expect(schedule[yearN - 1]).toBeCloseTo(expected, 8)
  })

  it("produces a flat schedule when annualInflationRate is 0", () => {
    const schedule = calcLivingExpenseSchedule({ monthlyAmount: 25, annualInflationRate: 0 }, 10)
    for (const expense of schedule) {
      expect(expense).toBe(25 * 12)
    }
  })
})
