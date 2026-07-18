"use client"

import { Card, Label, NumberField } from "@heroui/react"

import type { LifePlanInput } from "../../engine/types"

export function MortgageSection({
  value,
  onChange,
}: {
  value: LifePlanInput["mortgage"]
  onChange: (value: LifePlanInput["mortgage"]) => void
}) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>住宅ローン</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NumberField
            value={value.principal}
            onChange={(principal) => onChange({ ...value, principal })}
            formatOptions={{ useGrouping: false }}
          >
            <Label>借入金額 (万円)</Label>
            <NumberField.Group className="grid-cols-1">
              <NumberField.Input />
            </NumberField.Group>
          </NumberField>
          <NumberField
            value={value.interestRate}
            onChange={(interestRate) => onChange({ ...value, interestRate })}
          >
            <Label>金利 (%)</Label>
            <NumberField.Group className="grid-cols-1">
              <NumberField.Input />
            </NumberField.Group>
          </NumberField>
          <NumberField
            value={value.termYears}
            onChange={(termYears) => onChange({ ...value, termYears })}
          >
            <Label>返済期間 (年)</Label>
            <NumberField.Group className="grid-cols-1">
              <NumberField.Input />
            </NumberField.Group>
          </NumberField>
          <NumberField
            value={value.annualManagementFee}
            onChange={(annualManagementFee) => onChange({ ...value, annualManagementFee })}
          >
            <Label>管理費・修繕積立金 (万円/年)</Label>
            <NumberField.Group className="grid-cols-1">
              <NumberField.Input />
            </NumberField.Group>
          </NumberField>
        </div>
      </Card.Content>
    </Card>
  )
}
