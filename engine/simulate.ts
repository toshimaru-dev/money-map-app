import { calcIncomeSchedule } from "./income"
import { calcLivingExpenseSchedule } from "./living-expense"
import { calcMortgageSchedule } from "./mortgage"
import type { LifePlanInput, YearlyResult } from "./types"

export function simulate(input: LifePlanInput): YearlyResult[] {
  const { basic, income, livingExpense, mortgage } = input
  const simulationYears = basic.simulationYears

  const husbandIncomeSchedule = calcIncomeSchedule(income.husband, simulationYears)
  const wifeIncomeSchedule = calcIncomeSchedule(income.wife, simulationYears)
  const livingExpenseSchedule = calcLivingExpenseSchedule(livingExpense, simulationYears)
  const mortgageSchedule = calcMortgageSchedule(mortgage, simulationYears)

  const results: YearlyResult[] = []
  let cashBalance = basic.husbandSavings + basic.wifeSavings

  for (let e = 1; e <= simulationYears; e++) {
    const i = e - 1

    const husbandIncome = husbandIncomeSchedule[i]
    const wifeIncome = wifeIncomeSchedule[i]
    const totalIncome = husbandIncome + wifeIncome

    const livingExpenseAmount = livingExpenseSchedule[i]
    const mortgagePayment = mortgageSchedule.payment[i]
    const mortgageBalance = mortgageSchedule.balance[i]
    // v1 simplification: flat management fee every year, no annual escalation.
    const managementFee = mortgage.annualManagementFee

    const totalExpense = livingExpenseAmount + mortgagePayment + managementFee
    const netCashFlow = totalIncome - totalExpense

    cashBalance = cashBalance + netCashFlow

    results.push({
      year: basic.startYear + i,
      elapsedYears: e,
      husbandAge: basic.husbandAge + i,
      wifeAge: basic.wifeAge + i,
      husbandIncome,
      wifeIncome,
      totalIncome,
      livingExpense: livingExpenseAmount,
      mortgagePayment,
      mortgageBalance,
      managementFee,
      totalExpense,
      netCashFlow,
      cashBalance,
    })
  }

  return results
}
