import { describe, expect, it } from "vitest"
import { defaultInput } from "../default-input"
import { annuityPayment, calcMortgagePlan, interestRateAt, stagedMonthlyAt } from "../mortgage"
import type { MortgageConfig } from "../types"

const config = defaultInput.mortgage

describe("interestRateAt", () => {
  it("steps up every review interval and stops at the cap", () => {
    // 開始1.45% / 5年ごとに+0.5% / 上限4.0%
    const expected: [number, number][] = [
      [1, 1.45],
      [5, 1.45],
      [6, 1.95],
      [11, 2.45],
      [16, 2.95],
      [21, 3.45],
      [26, 3.95],
      [31, 4.0], // 3.95 + 0.5 = 4.45 だが上限で頭打ち
      [48, 4.0],
    ]
    for (const [elapsedYear, rate] of expected) {
      expect(interestRateAt(config, elapsedYear)).toBeCloseTo(rate, 10)
    }
  })

  it("keeps the initial rate when the review interval is 0", () => {
    expect(interestRateAt({ ...config, rateReviewIntervalYears: 0 }, 30)).toBeCloseTo(1.45, 10)
  })
})

describe("stagedMonthlyAt", () => {
  const stages = [
    { id: "b", label: "第1回見直し後", monthly: 1.6, untilYear: 14 },
    { id: "a", label: "当初", monthly: 1.1, untilYear: 6 }, // 入力順が前後していても正しく扱う
    { id: "c", label: "第2回見直し後", monthly: 2.6, untilYear: 20 },
  ]

  it("picks the stage whose untilYear covers the elapsed year", () => {
    expect(stagedMonthlyAt(stages, 1)).toBe(1.1)
    expect(stagedMonthlyAt(stages, 6)).toBe(1.1)
    expect(stagedMonthlyAt(stages, 7)).toBe(1.6)
    expect(stagedMonthlyAt(stages, 14)).toBe(1.6)
    expect(stagedMonthlyAt(stages, 15)).toBe(2.6)
  })

  it("keeps the last stage's amount beyond the final untilYear", () => {
    expect(stagedMonthlyAt(stages, 999)).toBe(2.6)
  })

  it("returns 0 when there are no stages", () => {
    expect(stagedMonthlyAt([], 5)).toBe(0)
  })
})

describe("annuityPayment", () => {
  it("falls back to straight-line amortization at 0%", () => {
    expect(annuityPayment(1200, 0, 12)).toBeCloseTo(100, 10)
  })
})

describe("calcMortgagePlan", () => {
  const plan = calcMortgagePlan(config, 2027, config.termYears)

  it("splits the financed principal into a regular and a bonus tranche", () => {
    expect(plan[0].regularOpening).toBeCloseTo(6550, 6) // 8050 - 頭金0 - ボーナス1500
    expect(plan[0].bonusOpening).toBeCloseTo(1500, 6)
  })

  it("matches the reference schedule for the regular tranche", () => {
    // [経過年, 期首残高, 年間返済額, 利息, 元金返済]
    const reference: [number, number, number, number, number][] = [
      [1, 6550.0, 190.4, 95.0, 95.4],
      [5, 6160.1, 190.4, 89.3, 101.0],
      [6, 6059.0, 209.4, 118.2, 91.3], // 金利見直しで返済額を組み直す
      [11, 5584.5, 227.5, 136.8, 90.7],
      [31, 3468.4, 274.0, 138.7, 135.2], // 上限4.0%に到達
      [48, 263.4, 274.0, 10.5, 263.4],
    ]
    for (const [e, opening, payment, interest, principal] of reference) {
      const row = plan[e - 1]
      expect(row.regularOpening).toBeCloseTo(opening, 0)
      expect(row.regularPayment).toBeCloseTo(payment, 0)
      expect(row.regularInterest).toBeCloseTo(interest, 0)
      expect(row.regularPrincipal).toBeCloseTo(principal, 0)
    }
  })

  it("matches the reference schedule for the bonus tranche", () => {
    expect(plan[0].bonusPayment).toBeCloseTo(43.6, 1)
    expect(plan[0].bonusInterest).toBeCloseTo(21.75, 2) // 参考表の21.8は表示丸め
    expect(plan[5].bonusPayment).toBeCloseTo(48.0, 1)
    expect(plan[47].bonusOpening).toBeCloseTo(60.3, 1)
  })

  it("matches the reference combined payment and year-end balance", () => {
    expect(plan[0].totalPayment).toBeCloseTo(234.0, 1)
    expect(plan[0].totalBalance).toBeCloseTo(7932.8, 0)
    expect(plan[5].totalPayment).toBeCloseTo(257.4, 1)
    expect(plan[30].totalPayment).toBeCloseTo(336.7, 1)
  })

  it("fully repays by the end of the term", () => {
    const last = plan[config.termYears - 1]
    expect(last.totalBalance).toBeCloseTo(0, 8)
    expect(last.remainingYears).toBe(1)
  })

  it("keeps the balance monotonically non-increasing", () => {
    for (let i = 1; i < plan.length; i++) {
      expect(plan[i].totalBalance).toBeLessThanOrEqual(plan[i - 1].totalBalance + 1e-9)
    }
  })

  it("stops payments after the term but keeps charging maintenance", () => {
    const longPlan = calcMortgagePlan(config, 2027, config.termYears + 3)
    const after = longPlan[config.termYears]
    expect(after.totalPayment).toBe(0)
    expect(after.totalBalance).toBe(0)
    expect(after.remainingYears).toBe(0)
    expect(after.maintenanceTotal).toBeGreaterThan(0)
  })

  it("charges insurance on renewal years only", () => {
    // 保険は5年ごと(1,6,11年目...)に火災+地震を一括で支払う
    expect(plan[0].insurance).toBeCloseTo(3.5 + 9.2, 6)
    expect(plan[1].insurance).toBe(0)
    expect(plan[5].insurance).toBeCloseTo(3.5 + 9.2, 6)
  })

  it("can exclude only the first-year management fee", () => {
    const excluded = calcMortgagePlan(
      { ...config, includeFirstYearManagementFee: false },
      2027,
      config.termYears,
    )
    expect(excluded[0].managementFee).toBe(0)
    expect(excluded[1].managementFee).toBe(plan[1].managementFee)
  })

  it("can exclude only the first-year repair reserve", () => {
    const excluded = calcMortgagePlan(
      { ...config, includeFirstYearRepairReserve: false },
      2027,
      config.termYears,
    )
    expect(excluded[0].repairReserve).toBe(0)
    expect(excluded[1].repairReserve).toBe(plan[1].repairReserve)
  })

  it("can exclude only the first-year insurance", () => {
    const excluded = calcMortgagePlan(
      { ...config, includeFirstYearInsurance: false },
      2027,
      config.termYears,
    )
    expect(excluded[0].insurance).toBe(0)
    expect(excluded[5].insurance).toBeCloseTo(config.fireInsurance + config.earthquakeInsurance, 6)
  })

  it("can exclude the first-year management fee in compound mode", () => {
    const compound = calcMortgagePlan(
      { ...config, maintenanceMode: "compound", includeFirstYearManagementFee: false },
      2027,
      2,
    )
    expect(compound[0].managementFee).toBe(0)
  })

  it("uses the stepped maintenance schedule from the reference sheet by default", () => {
    // 管理費は据え置き 22.8万円/年、修繕積立金は 13.2 → 19.2 → 31.2 と段階的に上がる
    const expected: [number, number][] = [
      [1, 13.2],
      [6, 13.2],
      [7, 19.2],
      [14, 19.2],
      [15, 31.2],
      [48, 31.2], // 最後の段階を過ぎてもその月額を維持する
    ]
    for (const [elapsedYear, repairReserve] of expected) {
      const row = plan[elapsedYear - 1]
      expect(row.managementFee).toBeCloseTo(22.8, 6)
      expect(row.repairReserve).toBeCloseTo(repairReserve, 6)
    }
  })

  it("compounds the maintenance fees in compound mode", () => {
    const compound = calcMortgagePlan({ ...config, maintenanceMode: "compound" }, 2027, 3)
    expect(compound[0].managementFee).toBeCloseTo(1.9 * 12, 6)
    expect(compound[0].repairReserve).toBeCloseTo(1.1 * 12, 6)
    // 2年目は1.5%上昇
    expect(compound[1].managementFee).toBeCloseTo(1.9 * 12 * 1.015, 6)
    expect(compound[2].repairReserve).toBeCloseTo(1.1 * 12 * 1.015 ** 2, 6)
  })

  it("subtracts the down payment from the financed amount", () => {
    const withDownPayment: MortgageConfig = { ...config, downPayment: 1050, bonusPrincipal: 0 }
    const p = calcMortgagePlan(withDownPayment, 2027, 1)
    expect(p[0].regularOpening).toBeCloseTo(7000, 6)
    expect(p[0].bonusOpening).toBe(0)
  })

  it("handles a 0% loan as straight-line amortization", () => {
    const zeroRate: MortgageConfig = {
      ...config,
      principal: 1200,
      downPayment: 0,
      bonusPrincipal: 0,
      initialInterestRate: 0,
      maxInterestRate: 0,
      rateStepUp: 0,
      termYears: 12,
    }
    const p = calcMortgagePlan(zeroRate, 2027, 12)
    for (const row of p) {
      expect(row.regularPayment).toBeCloseTo(100, 8)
      expect(row.regularInterest).toBeCloseTo(0, 8)
    }
    expect(p[11].totalBalance).toBeCloseTo(0, 8)
  })
})
