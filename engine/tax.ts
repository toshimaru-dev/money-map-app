/**
 * 税金・社会保険料の概算計算。
 * サンプル入力パラメータの注記に沿った簡易モデル:
 *   給与所得控除 + 累進課税(所得税速算表) + 住民税(課税所得×10%) を用いる。
 *   配偶者控除・扶養控除は含めない。単位はすべて万円。
 */

/** 給与所得控除(2020年〜の速算)。income は給与収入(万円)。 */
export function salaryIncomeDeduction(income: number): number {
  if (income <= 0) return 0
  if (income <= 162.5) return 55
  if (income <= 180) return income * 0.4 - 10
  if (income <= 360) return income * 0.3 + 8
  if (income <= 660) return income * 0.2 + 44
  if (income <= 850) return income * 0.1 + 110
  return 195
}

/** 所得税(速算表)。taxable は課税所得(万円)。 */
export function incomeTaxAmount(taxable: number): number {
  if (taxable <= 0) return 0
  if (taxable <= 195) return taxable * 0.05
  if (taxable <= 330) return taxable * 0.1 - 9.75
  if (taxable <= 695) return taxable * 0.2 - 42.75
  if (taxable <= 900) return taxable * 0.23 - 63.6
  if (taxable <= 1800) return taxable * 0.33 - 153.6
  if (taxable <= 4000) return taxable * 0.4 - 279.6
  return taxable * 0.45 - 479.6
}

export interface TaxConfig {
  socialInsuranceRate: number
  basicDeductionIncome: number
  basicDeductionResident: number
}

/** 一人分の税金(所得税+住民税)。社会保険料控除も差し引く。 */
export function personTax(annualIncome: number, config: TaxConfig): number {
  if (annualIncome <= 0) return 0
  const salaryDed = salaryIncomeDeduction(annualIncome)
  const socialInsurance = annualIncome * config.socialInsuranceRate

  const incomeTaxable = Math.max(0, annualIncome - salaryDed - socialInsurance - config.basicDeductionIncome)
  const incomeTax = incomeTaxAmount(incomeTaxable)

  const residentTaxable = Math.max(
    0,
    annualIncome - salaryDed - socialInsurance - config.basicDeductionResident,
  )
  const residentTax = residentTaxable * 0.1

  return incomeTax + residentTax
}

/** 世帯の社会保険料(給与合計に対する概算)。 */
export function socialInsuranceAmount(husbandIncome: number, wifeIncome: number, rate: number): number {
  return (husbandIncome + wifeIncome) * rate
}
