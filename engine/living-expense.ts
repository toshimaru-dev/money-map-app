export function calcLivingExpenseSchedule(
  config: { monthlyAmount: number; annualInflationRate: number },
  simulationYears: number
): number[] {
  const { monthlyAmount, annualInflationRate } = config
  const rate = annualInflationRate / 100
  const result: number[] = []
  for (let e = 1; e <= simulationYears; e++) {
    result.push(monthlyAmount * 12 * (1 + rate) ** (e - 1))
  }
  return result
}
