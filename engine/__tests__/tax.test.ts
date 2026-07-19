import { describe, expect, it } from "vitest"
import { incomeTaxAmount, personTax, salaryIncomeDeduction, socialInsuranceAmount } from "../tax"

const config = { socialInsuranceRate: 0.15, basicDeductionIncome: 48, basicDeductionResident: 43 }

describe("tax: matches sample (year 1)", () => {
  it("salary income deduction (給与所得控除)", () => {
    // 夫: 収入640 → 640*0.2+44 = 172
    expect(salaryIncomeDeduction(640)).toBeCloseTo(172, 6)
    // 妻: 収入518 → 518*0.2+44 = 147.6
    expect(salaryIncomeDeduction(518)).toBeCloseTo(147.6, 6)
    // 上限195
    expect(salaryIncomeDeduction(1200)).toBe(195)
  })

  it("progressive income tax (所得税速算)", () => {
    // 課税所得324 → 324*0.10 - 9.75 = 22.65
    expect(incomeTaxAmount(324)).toBeCloseTo(22.65, 6)
  })

  it("per-person tax (所得税+住民税)", () => {
    // 夫 income640: incomeTax 22.65 + residentTax 32.9 = 55.55
    expect(personTax(640, config)).toBeCloseTo(55.55, 4)
    // 妻 income518: 14.72 + 24.97 = 39.69
    expect(personTax(518, config)).toBeCloseTo(39.69, 4)
  })

  it("household social insurance (社会保険料)", () => {
    // (640 + 518) * 0.15 = 173.7
    expect(socialInsuranceAmount(640, 518, 0.15)).toBeCloseTo(173.7, 6)
  })
})
