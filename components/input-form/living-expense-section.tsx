"use client"

import { Card, Label, NumberField } from "@heroui/react"

import type { LifePlanInput } from "../../engine/types"

export function LivingExpenseSection({
  value,
  onChange,
}: {
  value: LifePlanInput["livingExpense"]
  onChange: (value: LifePlanInput["livingExpense"]) => void
}) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>生活費</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NumberField
            value={value.monthlyAmount}
            onChange={(monthlyAmount) => onChange({ ...value, monthlyAmount })}
          >
            <Label>月次生活費 (万円/月)</Label>
            <NumberField.Group className="grid-cols-1">
              <NumberField.Input />
            </NumberField.Group>
          </NumberField>
          <NumberField
            value={value.annualInflationRate}
            onChange={(annualInflationRate) => onChange({ ...value, annualInflationRate })}
          >
            <Label>物価上昇率 (%)</Label>
            <NumberField.Group className="grid-cols-1">
              <NumberField.Input />
            </NumberField.Group>
          </NumberField>
        </div>
      </Card.Content>
    </Card>
  )
}
