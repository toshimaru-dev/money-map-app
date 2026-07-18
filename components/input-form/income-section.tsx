"use client"

import { Card, Label, NumberField } from "@heroui/react"

import type { LifePlanInput } from "../../engine/types"

type PersonIncome = LifePlanInput["income"]["husband"]

function PersonIncomeFields({
  value,
  onChange,
}: {
  value: PersonIncome
  onChange: (value: PersonIncome) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <NumberField
        value={value.baseIncome}
        onChange={(baseIncome) => onChange({ ...value, baseIncome })}
        formatOptions={{ useGrouping: false }}
      >
        <Label>現在年収 (万円)</Label>
        <NumberField.Group className="grid-cols-1">
          <NumberField.Input />
        </NumberField.Group>
      </NumberField>
      <NumberField
        value={value.annualRaise}
        onChange={(annualRaise) => onChange({ ...value, annualRaise })}
      >
        <Label>昇給額 (万円/年)</Label>
        <NumberField.Group className="grid-cols-1">
          <NumberField.Input />
        </NumberField.Group>
      </NumberField>
      <NumberField
        value={value.raiseYears}
        onChange={(raiseYears) => onChange({ ...value, raiseYears })}
      >
        <Label>昇給適用年数 (年)</Label>
        <NumberField.Group className="grid-cols-1">
          <NumberField.Input />
        </NumberField.Group>
      </NumberField>
    </div>
  )
}

export function IncomeSection({
  value,
  onChange,
}: {
  value: LifePlanInput["income"]
  onChange: (value: LifePlanInput["income"]) => void
}) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>収入</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground/80">夫</h3>
            <PersonIncomeFields
              value={value.husband}
              onChange={(husband) => onChange({ ...value, husband })}
            />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground/80">妻</h3>
            <PersonIncomeFields
              value={value.wife}
              onChange={(wife) => onChange({ ...value, wife })}
            />
          </div>
        </div>
      </Card.Content>
    </Card>
  )
}
