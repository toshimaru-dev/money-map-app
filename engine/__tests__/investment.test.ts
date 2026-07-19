import { describe, expect, it } from "vitest"
import { defaultInput } from "../default-input"
import { simulate } from "../simulate"
import type { LifePlanInput } from "../types"

function withInvestment(
  midTerm: LifePlanInput["investment"]["midTerm"],
  longTerm: LifePlanInput["investment"]["longTerm"],
): LifePlanInput {
  return { ...defaultInput, events: [], investment: { midTerm, longTerm } }
}

const noReturn = { initialBalance: 0, annualContribution: 0, annualReturnRate: 0 }

describe("simulate: investment (mid/long term)", () => {
  it("keeps investment at zero when nothing is configured", () => {
    const results = simulate(withInvestment(noReturn, noReturn))
    for (const r of results) {
      expect(r.investmentBalance).toBe(0)
      expect(r.investmentReturn).toBe(0)
      expect(r.totalAssets).toBeCloseTo(r.cashBalance, 6)
    }
  })

  it("grows the mid-term balance by return then contribution", () => {
    const results = simulate(
      withInvestment({ initialBalance: 1000, annualContribution: 100, annualReturnRate: 6 }, noReturn),
    )
    // Year 1: 1000 * 6% = 60 return, then +100 contribution → 1160
    expect(results[0].investmentReturn).toBeCloseTo(60, 6)
    expect(results[0].investmentBalance).toBeCloseTo(1160, 6)
    // Year 2: 1160 * 6% = 69.6, then +100 → 1329.6
    expect(results[1].investmentBalance).toBeCloseTo(1160 * 1.06 + 100, 6)
  })

  it("sums mid and long term balances into investmentBalance", () => {
    const results = simulate(
      withInvestment(
        { initialBalance: 500, annualContribution: 0, annualReturnRate: 0 },
        { initialBalance: 300, annualContribution: 0, annualReturnRate: 0 },
      ),
    )
    expect(results[0].investmentBalance).toBeCloseTo(800, 6)
  })

  it("counts the contribution as an expense so total assets are unchanged at 0% return", () => {
    const base = simulate(withInvestment(noReturn, noReturn))
    const invested = simulate(
      withInvestment({ initialBalance: 0, annualContribution: 120, annualReturnRate: 0 }, noReturn),
    )
    const last = invested.length - 1
    expect(invested[last].totalAssets).toBeCloseTo(base[last].totalAssets, 6)
    expect(invested[0].cashBalance).toBeCloseTo(base[0].cashBalance - 120, 6)
    expect(invested[0].investmentBalance).toBeCloseTo(120, 6)
  })
})
