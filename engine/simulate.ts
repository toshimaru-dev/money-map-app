import { childAgeAt, childRearingAt } from "./child"
import { calcRaisePhaseSchedule } from "./income"
import { calcLivingExpenseSchedule } from "./living-expense"
import { calcMortgagePlan } from "./mortgage"
import { rentAt } from "./rent"
import { specificExpenseAt } from "./specific-expense"
import { personTax, socialInsuranceAmount } from "./tax"
import type { LifePlanInput, YearlyResult } from "./types"

/** 妻の年収。子ども年齢が減額フェーズに入っていればその年収で上書きする。 */
function wifeIncomeAt(
  wife: LifePlanInput["income"]["wife"],
  elapsedYear: number,
  childAge: number,
): number {
  const phase = wife.reductionPhases.find(
    (p) => childAge >= 0 && childAge >= p.fromChildAge && childAge <= p.toChildAge,
  )
  if (phase) return phase.annual
  return wife.baseIncome + wife.annualRaise * Math.min(elapsedYear - 1, wife.raiseYears)
}

export function simulate(input: LifePlanInput): YearlyResult[] {
  const {
    basic,
    income,
    childRearing,
    livingExpense,
    specificExpense,
    investment,
    mortgage,
    rent,
    tax,
    mortgageDeduction,
    events,
  } = input
  const simulationYears = basic.simulationYears
  const isRenting = basic.housingType === "rent"

  const husbandIncomeSchedule = calcRaisePhaseSchedule(income.husband, simulationYears)
  const livingMonthly = livingExpense.items.reduce(
    (sum, item) => sum + item.husbandMonthly + item.wifeMonthly,
    0,
  )
  const livingExpenseSchedule = calcLivingExpenseSchedule(
    { monthlyAmount: livingMonthly, annualInflationRate: livingExpense.annualInflationRate },
    simulationYears,
  )
  const mortgagePlan = calcMortgagePlan(mortgage, basic.startYear, simulationYears)

  const eventIncomeByYear = new Map<number, number>()
  const eventExpenseByYear = new Map<number, number>()
  for (const event of events) {
    const target = event.type === "income" ? eventIncomeByYear : eventExpenseByYear
    target.set(event.year, (target.get(event.year) ?? 0) + event.amount)
  }

  const midRate = investment.midTerm.annualReturnRate / 100
  const longRate = investment.longTerm.annualReturnRate / 100
  const deductionRate = mortgageDeduction.rate / 100

  const results: YearlyResult[] = []
  let cashBalance = basic.husbandSavings + basic.wifeSavings
  let midBalance = investment.midTerm.initialBalance
  let longBalance = investment.longTerm.initialBalance

  for (let e = 1; e <= simulationYears; e++) {
    const i = e - 1
    const year = basic.startYear + i
    const childAge = childAgeAt(e, basic.childBirthYearOffset)

    // === 収入 ===
    const husbandIncome = husbandIncomeSchedule[i]
    const wifeIncome = wifeIncomeAt(income.wife, e, childAge)
    const { cost: childcareCost, allowance: childcareAllowance } = childRearingAt(childAge, childRearing)
    // その他収入(副業など)。設定した経過年数の期間だけ適用
    const otherIncome =
      e >= income.otherIncome.fromYear && e <= income.otherIncome.untilYear
        ? income.otherIncome.annualAmount
        : 0
    const eventIncome = eventIncomeByYear.get(year) ?? 0
    const totalIncome = husbandIncome + wifeIncome + childcareAllowance + otherIncome + eventIncome

    // === 支出(住居) ===
    const livingExpenseAmount = livingExpenseSchedule[i]
    // 住宅ローン or 賃貸で住居費を切り替える
    const mortgagePayment = isRenting ? 0 : mortgagePlan[i].totalPayment
    const mortgageBalance = isRenting ? 0 : mortgagePlan[i].totalBalance
    // 管理費・修繕積立金・保険をまとめて住宅の維持費として計上する
    const managementFee = isRenting ? 0 : mortgagePlan[i].maintenanceTotal
    const { annualRent, renewalFee: rentRenewalFee } = isRenting
      ? rentAt(rent, e)
      : { annualRent: 0, renewalFee: 0 }
    const rentPayment = annualRent

    const husbandSpecificExpense = specificExpenseAt(specificExpense.husband, e)
    const wifeSpecificExpense = specificExpenseAt(specificExpense.wife, e)
    const midTermContribution = investment.midTerm.annualContribution
    const longTermContribution = investment.longTerm.annualContribution

    // 住宅ローン控除(参考): 適用期間内は 年末残高×控除率(対象上限あり)。賃貸・購入初年度は0。
    const withinDeduction = !isRenting && e >= 2 && e <= mortgageDeduction.years + 1
    const mortgageDeductionAmount = withinDeduction
      ? Math.min(mortgageBalance, mortgageDeduction.capBalance) * deductionRate
      : 0

    // 税金: 自動計算(夫・妻の所得税+住民税から住宅ローン控除を差し引く) or 手動
    const grossTax = personTax(husbandIncome, tax) + personTax(wifeIncome, tax)
    const taxAmount = tax.autoTax
      ? Math.max(0, grossTax - mortgageDeductionAmount)
      : tax.manualTaxAnnual
    // 社会保険料: 自動計算(給与合計×率) or 手動
    const socialInsurance = tax.autoSocialInsurance
      ? socialInsuranceAmount(husbandIncome, wifeIncome, tax.socialInsuranceRate)
      : tax.manualSocialInsuranceAnnual

    const eventExpense = eventExpenseByYear.get(year) ?? 0

    const totalExpense =
      livingExpenseAmount +
      mortgagePayment +
      managementFee +
      rentPayment +
      rentRenewalFee +
      childcareCost +
      husbandSpecificExpense +
      wifeSpecificExpense +
      midTermContribution +
      longTermContribution +
      taxAmount +
      socialInsurance +
      eventExpense

    // === 収支・資産 ===
    const netCashFlow = totalIncome - totalExpense

    const midReturn = midBalance * midRate
    const longReturn = longBalance * longRate
    midBalance = midBalance + midReturn + midTermContribution
    longBalance = longBalance + longReturn + longTermContribution
    const investmentBalance = midBalance + longBalance
    const investmentReturn = midReturn + longReturn

    // 積立額は支出合計に含めて現金から拠出済み(二重計上しない)
    cashBalance = cashBalance + netCashFlow

    results.push({
      year,
      elapsedYears: e,
      husbandAge: basic.husbandAge + i,
      wifeAge: basic.wifeAge + i,
      childAge,
      husbandIncome,
      wifeIncome,
      childcareAllowance,
      otherIncome,
      eventIncome,
      totalIncome,
      livingExpense: livingExpenseAmount,
      mortgagePayment,
      mortgageBalance,
      managementFee,
      rentPayment,
      rentRenewalFee,
      childcareCost,
      husbandSpecificExpense,
      wifeSpecificExpense,
      midTermContribution,
      longTermContribution,
      mortgageDeduction: mortgageDeductionAmount,
      tax: taxAmount,
      socialInsurance,
      eventExpense,
      totalExpense,
      netCashFlow,
      investmentReturn,
      investmentBalance,
      cashBalance,
      totalAssets: cashBalance + investmentBalance,
    })
  }

  return results
}
