import type { LifePlanInput } from "./types"

export const defaultInput: LifePlanInput = {
  basic: {
    startYear: 2026,
    simulationYears: 64,
    husbandAge: 32,
    wifeAge: 31,
    husbandSavings: 50,
    wifeSavings: 100,
  },
  income: {
    husband: {
      baseIncome: 640,
      // Source has a second, smaller raise stage (+10万円/年 until year 20) not represented in v1
      annualRaise: 30,
      raiseYears: 8,
    },
    wife: {
      // Source income is an irregular year-by-year table (maternity-leave dip to ~187万円,
      // early-career ramp from ~518万円); approximated here as a flat steady-state income
      baseIncome: 350,
      annualRaise: 0,
      raiseYears: 0,
    },
  },
  livingExpense: {
    monthlyAmount: 14.4,
    annualInflationRate: 1.0,
  },
  mortgage: {
    principal: 8050,
    // Source rate is an initial variable rate; v1 treats it as fixed for the full term
    interestRate: 1.45,
    termYears: 48,
    // 管理費1.9万円/月 + 修繕積立金1.1万円/月。源データの1.5%毎年上昇はv1では未対応
    annualManagementFee: 36,
  },
}
