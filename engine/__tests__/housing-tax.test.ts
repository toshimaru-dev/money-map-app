import { describe, expect, it } from "vitest"
import { defaultInput } from "../default-input"
import { rentAt } from "../rent"
import { simulate } from "../simulate"
import type { LifePlanInput } from "../types"

describe("rentAt", () => {
  const config = { monthlyRent: 15, renewalFee: 15, renewalIntervalYears: 2, rentIncreasePerRenewal: 1 }

  it("charges the renewal fee only on renewal years", () => {
    expect(rentAt(config, 1).renewalFee).toBe(0)
    expect(rentAt(config, 2).renewalFee).toBe(0)
    expect(rentAt(config, 3).renewalFee).toBe(15) // 2年ごと → 3年目に更新
    expect(rentAt(config, 5).renewalFee).toBe(15)
  })

  it("raises the rent by rentIncreasePerRenewal each renewal", () => {
    expect(rentAt(config, 1).annualRent).toBeCloseTo(15 * 12, 6)
    expect(rentAt(config, 3).annualRent).toBeCloseTo(16 * 12, 6) // +1 after 1st renewal
    expect(rentAt(config, 5).annualRent).toBeCloseTo(17 * 12, 6) // +2 after 2nd renewal
  })
})

describe("simulate: housing type", () => {
  it("has no mortgage cost and uses rent when housingType is rent", () => {
    const input: LifePlanInput = {
      ...defaultInput,
      basic: { ...defaultInput.basic, housingType: "rent" },
    }
    const results = simulate(input)
    for (const r of results) {
      expect(r.mortgagePayment).toBe(0)
      expect(r.mortgageBalance).toBe(0)
      expect(r.managementFee).toBe(0)
      expect(r.mortgageDeduction).toBe(0)
    }
    expect(results[0].rentPayment).toBeGreaterThan(0)
  })

  it("has no rent cost when housingType is mortgage", () => {
    const results = simulate(defaultInput)
    for (const r of results) {
      expect(r.rentPayment).toBe(0)
      expect(r.rentRenewalFee).toBe(0)
    }
    expect(results[0].mortgagePayment).toBeGreaterThan(0)
  })
})

describe("simulate: tax/social-insurance manual override", () => {
  it("uses the manual annual values when auto is off", () => {
    const input: LifePlanInput = {
      ...defaultInput,
      events: [],
      tax: {
        ...defaultInput.tax,
        autoTax: false,
        manualTaxAnnual: 120,
        autoSocialInsurance: false,
        manualSocialInsuranceAnnual: 200,
      },
    }
    const results = simulate(input)
    for (const r of results) {
      expect(r.tax).toBe(120)
      expect(r.socialInsurance).toBe(200)
    }
  })

  it("auto-computes tax/social-insurance from income when auto is on", () => {
    const results = simulate({ ...defaultInput, events: [] })
    // year1: 社会保険料 = (640 + 350) × 0.15 = 148.5
    expect(results[0].socialInsurance).toBeCloseTo(148.5, 4)
    expect(results[0].tax).toBeGreaterThan(0)
  })
})
