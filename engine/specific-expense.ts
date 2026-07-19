import type { PersonSpecificExpense } from "./types"

/**
 * 経過年数(1始まり)における固有支出の年額(万円)。
 * 通常項目は毎年発生し、ローン項目は払い終わり(payoffYear)までのみ発生する。
 */
export function specificExpenseAt(person: PersonSpecificExpense, elapsedYear: number): number {
  const itemsMonthly = person.items.reduce((sum, item) => sum + item.monthly, 0)
  const loansMonthly = person.loans.reduce(
    (sum, loan) => sum + (elapsedYear <= loan.payoffYear ? loan.monthly : 0),
    0,
  )
  return (itemsMonthly + loansMonthly) * 12
}
