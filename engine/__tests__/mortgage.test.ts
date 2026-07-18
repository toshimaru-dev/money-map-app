import { describe, expect, it } from "vitest"
import { defaultInput } from "../default-input"
import { calcMortgageSchedule } from "../mortgage"

describe("calcMortgageSchedule", () => {
  it("handles zero interest rate as simple straight-line amortization", () => {
    const { payment, balance } = calcMortgageSchedule(
      { principal: 1200, interestRate: 0, termYears: 12 },
      12
    )
    for (const p of payment) {
      expect(p).toBeCloseTo(100, 8)
    }
    for (let i = 0; i < 12; i++) {
      expect(balance[i]).toBeCloseTo(1200 - 100 * (i + 1), 8)
    }
    expect(balance[11]).toBe(0)
  })

  it("amortizes to (near) zero by termYears with a positive interest rate", () => {
    const { balance } = calcMortgageSchedule(defaultInput.mortgage, defaultInput.mortgage.termYears)
    const last = balance[defaultInput.mortgage.termYears - 1]
    expect(Math.abs(last)).toBeLessThan(0.01)
  })

  it("balance is monotonically non-increasing", () => {
    const { balance } = calcMortgageSchedule(defaultInput.mortgage, defaultInput.mortgage.termYears)
    for (let i = 1; i < balance.length; i++) {
      expect(balance[i]).toBeLessThanOrEqual(balance[i - 1])
    }
  })

  it("payment and balance are 0 for elapsed years beyond termYears", () => {
    const termYears = 12
    const simulationYears = 15
    const { payment, balance } = calcMortgageSchedule(
      { principal: 1200, interestRate: 1.5, termYears },
      simulationYears
    )
    expect(payment).toHaveLength(simulationYears)
    expect(balance).toHaveLength(simulationYears)
    for (let i = termYears; i < simulationYears; i++) {
      expect(payment[i]).toBe(0)
      expect(balance[i]).toBe(0)
    }
  })
})
