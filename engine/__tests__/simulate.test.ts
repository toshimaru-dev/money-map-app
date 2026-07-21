import { describe, expect, it } from "vitest"
import { defaultInput } from "../default-input"
import { simulate } from "../simulate"

describe("simulate", () => {
  const results = simulate(defaultInput)

  it("returns an array of length simulationYears", () => {
    expect(results).toHaveLength(defaultInput.basic.simulationYears)
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
  })

  it("marks child age as -1 before birth and 0 at the birth year", () => {
    // childBirthYearOffset = 4 → elapsed year 5 (index 4) is child age 0
    expect(results[3].childAge).toBe(-1)
    expect(results[4].childAge).toBe(0)
    expect(results[5].childAge).toBe(1)
  })

  it("keeps totalIncome consistent with its components", () => {
    for (const r of results) {
      expect(r.totalIncome).toBeCloseTo(
        r.husbandIncome + r.wifeIncome + r.childcareAllowance + r.otherIncome + r.eventIncome,
        6,
      )
    }
  })

  it("keeps totalExpense consistent with all expense components (events included)", () => {
    for (const r of results) {
      const sum =
        r.livingExpense +
        r.mortgagePayment +
        r.managementFee +
        r.rentPayment +
        r.rentRenewalFee +
        r.childcareCost +
        r.husbandSpecificExpense +
        r.wifeSpecificExpense +
        r.midTermContribution +
        r.longTermContribution +
        r.tax +
        r.socialInsurance +
        r.eventExpense
      // 住宅ローン控除(参考表示)は sum に含まれない = totalExpense と一致する
      expect(r.totalExpense).toBeCloseTo(sum, 6)
    }
  })

  it("threads cashBalance cumulatively via netCashFlow only (contributions already in expenses)", () => {
    let expected = defaultInput.basic.husbandSavings + defaultInput.basic.wifeSavings
    for (const r of results) {
      expected += r.netCashFlow
      expect(r.cashBalance).toBeCloseTo(expected, 6)
    }
  })

  it("keeps totalAssets = cash + investment", () => {
    for (const r of results) {
      expect(r.totalAssets).toBeCloseTo(r.cashBalance + r.investmentBalance, 6)
    }
  })
})
