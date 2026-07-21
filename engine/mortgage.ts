import type { MaintenanceStage, MortgageConfig, MortgageYearlyResult } from "./types"

/** 元利均等返済の年間返済額(年次モデルのPMT)。 */
export function annuityPayment(principal: number, annualRate: number, years: number): number {
  if (years <= 0) return 0
  if (annualRate === 0) return principal / years
  return (principal * annualRate) / (1 - (1 + annualRate) ** -years)
}

/**
 * 経過年 e に適用される金利(年率%)。
 * 見直し間隔ごとに上昇幅を加算し、上限に達したらそれ以降は上限を維持する。
 */
export function interestRateAt(config: MortgageConfig, elapsedYear: number): number {
  const interval = config.rateReviewIntervalYears
  const steps = interval > 0 ? Math.floor((elapsedYear - 1) / interval) : 0
  return Math.min(config.initialInterestRate + steps * config.rateStepUp, config.maxInterestRate)
}

interface TrancheYear {
  opening: number
  payment: number
  interest: number
  principal: number
  closing: number
}

const ZERO_YEAR: TrancheYear = { opening: 0, payment: 0, interest: 0, principal: 0, closing: 0 }

/**
 * 1本の元金(通常返済分 or ボーナス返済分)を年次で償却する。
 * 金利が見直されるたびに、その時点の残高・残年数・新金利で返済額を組み直す。
 */
function amortize(
  principal: number,
  config: MortgageConfig,
  simulationYears: number,
): TrancheYear[] {
  const rows: TrancheYear[] = []
  let balance = principal
  let payment = 0
  let previousRate = Number.NaN

  for (let e = 1; e <= simulationYears; e++) {
    if (e > config.termYears || balance <= 0) {
      rows.push({ ...ZERO_YEAR })
      continue
    }

    const rate = interestRateAt(config, e) / 100
    if (rate !== previousRate) {
      payment = annuityPayment(balance, rate, config.termYears - e + 1)
      previousRate = rate
    }

    const opening = balance
    const interest = opening * rate
    let principalPaid = payment - interest
    let yearPayment = payment
    // 最終年、および丸め誤差で元金を超えた場合は残高を残さず精算する
    if (e === config.termYears || principalPaid >= opening) {
      principalPaid = opening
      yearPayment = opening + interest
    }
    const closing = opening - principalPaid

    rows.push({ opening, payment: yearPayment, interest, principal: principalPaid, closing })
    balance = closing
  }

  return rows
}

/**
 * 段階的な維持費の、経過年 e に適用される月額。
 * untilYear 昇順で最初に該当する段階を使い、最後の段階を過ぎたらその月額を維持する。
 */
export function stagedMonthlyAt(stages: MaintenanceStage[], elapsedYear: number): number {
  if (stages.length === 0) return 0
  const sorted = [...stages].sort((a, b) => a.untilYear - b.untilYear)
  const stage = sorted.find((s) => elapsedYear <= s.untilYear)
  return (stage ?? sorted[sorted.length - 1]).monthly
}

/**
 * 経過年 e の維持費(管理費・修繕積立金・保険)。
 * 管理費・修繕積立金は複利上昇と段階的な値の2方式に対応する。
 */
function maintenanceAt(
  config: MortgageConfig,
  elapsedYear: number,
): { managementFee: number; repairReserve: number; insurance: number } {
  const renewalYears = config.insuranceRenewalYears
  // 更新年(1年目、以降は更新頻度ごと)に、次の更新までの保険料をまとめて支払う
  const isRenewalYear = renewalYears > 0 && (elapsedYear - 1) % renewalYears === 0
  const insurance = isRenewalYear ? config.fireInsurance + config.earthquakeInsurance : 0

  if (config.maintenanceMode === "stepped") {
    return {
      managementFee: stagedMonthlyAt(config.managementFeeStages, elapsedYear) * 12,
      repairReserve: stagedMonthlyAt(config.repairReserveStages, elapsedYear) * 12,
      insurance,
    }
  }

  const growth = (1 + config.maintenanceIncreaseRate / 100) ** (elapsedYear - 1)
  return {
    managementFee: config.monthlyManagementFee * 12 * growth,
    repairReserve: config.monthlyRepairReserve * 12 * growth,
    insurance,
  }
}

/**
 * 住宅ローンの年次シミュレーション。
 * 借入金額から頭金を引いた額を、ボーナス返済に充当する元金とそれ以外に分けて別々に償却する。
 */
export function calcMortgagePlan(
  config: MortgageConfig,
  startYear: number,
  simulationYears: number,
): MortgageYearlyResult[] {
  const financed = Math.max(0, config.principal - config.downPayment)
  const bonusPrincipal = Math.min(Math.max(0, config.bonusPrincipal), financed)
  const regularPrincipal = financed - bonusPrincipal

  const regular = amortize(regularPrincipal, config, simulationYears)
  const bonus = amortize(bonusPrincipal, config, simulationYears)

  const results: MortgageYearlyResult[] = []
  for (let e = 1; e <= simulationYears; e++) {
    const i = e - 1
    const r = regular[i]
    const b = bonus[i]
    const isRepaying = e <= config.termYears
    const { managementFee, repairReserve, insurance } = maintenanceAt(config, e)
    const maintenanceTotal = managementFee + repairReserve + insurance

    const monthlyRegularPayment = r.payment / 12

    results.push({
      year: startYear + i,
      elapsedYears: e,
      interestRate: isRepaying ? interestRateAt(config, e) : 0,
      remainingYears: isRepaying ? config.termYears - e + 1 : 0,
      regularOpening: r.opening,
      regularPayment: r.payment,
      regularInterest: r.interest,
      regularPrincipal: r.principal,
      regularClosing: r.closing,
      bonusOpening: b.opening,
      bonusPayment: b.payment,
      bonusInterest: b.interest,
      bonusPrincipal: b.principal,
      bonusClosing: b.closing,
      totalPayment: r.payment + b.payment,
      totalInterest: r.interest + b.interest,
      totalBalance: r.closing + b.closing,
      managementFee,
      repairReserve,
      insurance,
      maintenanceTotal,
      monthlyRegularPayment,
      monthlyOutlay: monthlyRegularPayment + maintenanceTotal / 12,
    })
  }

  return results
}
