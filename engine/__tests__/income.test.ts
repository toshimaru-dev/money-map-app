import { describe, expect, it } from "vitest"
import { calcIncomeSchedule } from "../income"

describe("calcIncomeSchedule", () => {
  it("year 1 equals baseIncome exactly", () => {
    const schedule = calcIncomeSchedule({ baseIncome: 640, annualRaise: 30, raiseYears: 8 }, 10)
    expect(schedule[0]).toBe(640)
  })

  it("reaches baseIncome + annualRaise * raiseYears at year raiseYears + 1", () => {
    const config = { baseIncome: 640, annualRaise: 30, raiseYears: 8 }
    const schedule = calcIncomeSchedule(config, 15)
    expect(schedule[8]).toBe(640 + 30 * 8) // year 9 (index 8)
  })

  it("stays flat for several years after raises stop", () => {
    const config = { baseIncome: 640, annualRaise: 30, raiseYears: 8 }
    const schedule = calcIncomeSchedule(config, 15)
    const flatValue = 640 + 30 * 8
    expect(schedule[8]).toBe(flatValue)
    expect(schedule[9]).toBe(flatValue)
    expect(schedule[12]).toBe(flatValue)
    expect(schedule[14]).toBe(flatValue)
  })

  it("never raises when raiseYears is 0", () => {
    const config = { baseIncome: 350, annualRaise: 0, raiseYears: 0 }
    const schedule = calcIncomeSchedule(config, 10)
    for (const income of schedule) {
      expect(income).toBe(350)
    }
  })
})
