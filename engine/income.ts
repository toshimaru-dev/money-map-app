export function calcIncomeSchedule(
  config: { baseIncome: number; annualRaise: number; raiseYears: number },
  simulationYears: number
): number[] {
  const { baseIncome, annualRaise, raiseYears } = config
  const result: number[] = []
  for (let e = 1; e <= simulationYears; e++) {
    result.push(baseIncome + annualRaise * Math.min(e - 1, raiseYears))
  }
  return result
}
