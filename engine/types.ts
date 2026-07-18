export interface LifePlanInput {
  basic: {
    startYear: number
    simulationYears: number
    husbandAge: number
    wifeAge: number
    husbandSavings: number // 万円
    wifeSavings: number // 万円
  }
  income: {
    // annualRaise/raiseYears model a single raise stage before income flattens (v1 simplification)
    husband: { baseIncome: number; annualRaise: number; raiseYears: number }
    wife: { baseIncome: number; annualRaise: number; raiseYears: number }
  }
  livingExpense: {
    monthlyAmount: number // 万円/月
    annualInflationRate: number // % e.g. 1.0 means 1.0%
  }
  mortgage: {
    principal: number // 借入金額(万円)
    interestRate: number // 固定金利(年率%) e.g. 1.45 means 1.45%
    termYears: number
    annualManagementFee: number // 管理費+修繕積立金(簡略化して定額/年、万円)
  }
}

export interface YearlyResult {
  year: number
  elapsedYears: number
  husbandAge: number
  wifeAge: number
  husbandIncome: number
  wifeIncome: number
  totalIncome: number
  livingExpense: number
  mortgagePayment: number
  mortgageBalance: number
  managementFee: number
  totalExpense: number
  netCashFlow: number
  cashBalance: number
}
