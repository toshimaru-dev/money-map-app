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

/**
 * 複数の昇給フェーズを積み上げた収入スケジュール。
 * 各フェーズは untilYear(経過年数)まで毎年 annualRaise を昇給し、
 * 最後のフェーズを過ぎると昇給が止まって上限を維持する。
 */
export function calcRaisePhaseSchedule(
  config: {
    baseIncome: number
    raisePhases: { annualRaise: number; untilYear: number }[]
  },
  simulationYears: number
): number[] {
  const { baseIncome } = config
  // untilYear 昇順で処理する
  const phases = [...config.raisePhases].sort((a, b) => a.untilYear - b.untilYear)

  const result: number[] = []
  for (let e = 1; e <= simulationYears; e++) {
    let income = baseIncome
    let prevUntil = 1 // 昇給は経過年数2年目への遷移から始まる
    for (const phase of phases) {
      const steps = Math.max(0, Math.min(e, phase.untilYear) - prevUntil)
      income += phase.annualRaise * steps
      prevUntil = phase.untilYear
      if (e <= phase.untilYear) break
    }
    result.push(income)
  }
  return result
}
