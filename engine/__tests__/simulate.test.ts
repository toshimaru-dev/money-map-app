import { describe, expect, it } from "vitest"
import { defaultInput } from "../default-input"
import { simulate } from "../simulate"

describe("simulate", () => {
  const results = simulate(defaultInput)

  it("returns an array of length simulationYears", () => {
    expect(results).toHaveLength(defaultInput.basic.simulationYears)
  })

  it("applies the starting cash balance correctly in year 1", () => {
    const year1 = results[0]
    const expectedStart = defaultInput.basic.husbandSavings + defaultInput.basic.wifeSavings
    expect(year1.cashBalance).toBeCloseTo(expectedStart + year1.netCashFlow, 8)
  })

  it("computes year/elapsedYears/ages correctly for year 1 and year 5", () => {
    const year1 = results[0]
    expect(year1.year).toBe(defaultInput.basic.startYear)
    expect(year1.elapsedYears).toBe(1)
    expect(year1.husbandAge).toBe(defaultInput.basic.husbandAge)
    expect(year1.wifeAge).toBe(defaultInput.basic.wifeAge)

    const year5 = results[4]
    expect(year5.year).toBe(defaultInput.basic.startYear + 4)
    expect(year5.elapsedYears).toBe(5)
    expect(year5.husbandAge).toBe(defaultInput.basic.husbandAge + 4)
    expect(year5.wifeAge).toBe(defaultInput.basic.wifeAge + 4)
  })

  it("keeps totalIncome/totalExpense/netCashFlow internally consistent for every year", () => {
    for (const r of results) {
      expect(r.totalIncome).toBeCloseTo(r.husbandIncome + r.wifeIncome, 8)
      expect(r.totalExpense).toBeCloseTo(r.livingExpense + r.mortgagePayment + r.managementFee, 8)
      expect(r.netCashFlow).toBeCloseTo(r.totalIncome - r.totalExpense, 8)
    }
  })

  it("threads cashBalance across years cumulatively", () => {
    let expectedBalance = defaultInput.basic.husbandSavings + defaultInput.basic.wifeSavings
    for (const r of results) {
      expectedBalance += r.netCashFlow
      expect(r.cashBalance).toBeCloseTo(expectedBalance, 8)
    }
  })
})
