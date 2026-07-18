export function calcMortgageSchedule(
  config: { principal: number; interestRate: number; termYears: number },
  simulationYears: number
): { payment: number[]; balance: number[] } {
  const { principal, interestRate, termYears } = config
  const r = interestRate / 100

  // v1 simplification: standard fixed-rate annual amortization (PMT), not the source
  // spreadsheet's monthly/variable-rate model.
  const pmt = r === 0 ? principal / termYears : (principal * r) / (1 - (1 + r) ** -termYears)

  const payment: number[] = new Array(simulationYears).fill(0)
  const balance: number[] = new Array(simulationYears).fill(0)

  let balanceStart = principal
  const activeYears = Math.min(termYears, simulationYears)
  for (let e = 1; e <= activeYears; e++) {
    const interest = balanceStart * r
    const principalPaid = pmt - interest
    let balanceEnd = balanceStart - principalPaid
    if (e === termYears && Math.abs(balanceEnd) < 1e-6) {
      balanceEnd = 0
    }
    payment[e - 1] = pmt
    balance[e - 1] = balanceEnd
    balanceStart = balanceEnd
  }

  return { payment, balance }
}
