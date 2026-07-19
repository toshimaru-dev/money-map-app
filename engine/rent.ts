import type { RentConfig } from "./types"

/**
 * 経過年数(1始まり)における賃料と更新料。
 * 更新間隔ごとに更新料が発生し、更新のたびに月額賃料が上昇する。
 */
export function rentAt(config: RentConfig, elapsedYear: number): { annualRent: number; renewalFee: number } {
  const interval = Math.max(1, Math.round(config.renewalIntervalYears))
  // これまでに発生した更新回数(1年目は0回)
  const renewals = Math.floor((elapsedYear - 1) / interval)
  const monthlyRent = config.monthlyRent + config.rentIncreasePerRenewal * renewals
  // 更新が発生する年(2年目以降で更新間隔の倍数)は更新料を計上
  const isRenewalYear = elapsedYear > 1 && (elapsedYear - 1) % interval === 0
  return {
    annualRent: monthlyRent * 12,
    renewalFee: isRenewalYear ? config.renewalFee : 0,
  }
}
