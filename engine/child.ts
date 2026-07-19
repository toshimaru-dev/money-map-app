import type { ChildRearingStage } from "./types"

/** 経過年数(1始まり)における子どもの年齢。未誕生は -1。 */
export function childAgeAt(elapsedYear: number, childBirthYearOffset: number): number {
  // 誕生する経過年数(childBirthYearOffset)で 0 歳
  const age = elapsedYear - 1 - childBirthYearOffset
  return age < 0 ? -1 : age
}

/** 子ども年齢に該当するステージの年額を返す(費用・手当)。 */
export function childRearingAt(
  childAge: number,
  stages: ChildRearingStage[],
): { cost: number; allowance: number } {
  if (childAge < 0) return { cost: 0, allowance: 0 }
  const stage = stages.find((s) => childAge >= s.fromChildAge && childAge <= s.toChildAge)
  if (!stage) return { cost: 0, allowance: 0 }
  return { cost: stage.annualCost, allowance: stage.annualAllowance }
}
