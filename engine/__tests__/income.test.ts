import { describe, expect, it } from "vitest"
import { calcIncomeSchedule, calcRaisePhaseSchedule } from "../income"

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

describe("calcRaisePhaseSchedule (multiple raise phases)", () => {
  it("stacks raise phases and matches the sample husband income", () => {
    const s = calcRaisePhaseSchedule(
      {
        baseIncome: 640,
        raisePhases: [
          { annualRaise: 30, untilYear: 8 },
          { annualRaise: 10, untilYear: 20 },
        ],
      },
      25,
    )
    expect(s[0]).toBe(640) // e1
    expect(s[7]).toBe(850) // e8 (昇給①終了)
    expect(s[8]).toBe(860) // e9 (昇給②開始)
    expect(s[19]).toBe(970) // e20 (上限到達)
    expect(s[24]).toBe(970) // 以降は上限維持
  })

  it("handles no phases (flat income)", () => {
    const s = calcRaisePhaseSchedule({ baseIncome: 500, raisePhases: [] }, 3)
    expect(s).toEqual([500, 500, 500])
  })
})
