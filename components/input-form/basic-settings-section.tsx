"use client"

import { Card, Label, NumberField } from "@heroui/react"

import type { LifePlanInput } from "../../engine/types"

export function BasicSettingsSection({
  value,
  onChange,
}: {
  value: LifePlanInput["basic"]
  onChange: (value: LifePlanInput["basic"]) => void
}) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>基本設定</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NumberField
            value={value.startYear}
            onChange={(startYear) => onChange({ ...value, startYear })}
            formatOptions={{ useGrouping: false }}
          >
            <Label>開始年 (年)</Label>
            {/* grid-cols-1: this section has no increment/decrement buttons, so
                override NumberField.Group's default 40px-1fr-40px grid (sized for
                those buttons), which otherwise clips the input to 40px. */}
            <NumberField.Group className="grid-cols-1">
              <NumberField.Input />
            </NumberField.Group>
          </NumberField>
          <NumberField
            value={value.simulationYears}
            onChange={(simulationYears) => onChange({ ...value, simulationYears })}
          >
            <Label>シミュレーション年数 (年)</Label>
            <NumberField.Group className="grid-cols-1">
              <NumberField.Input />
            </NumberField.Group>
          </NumberField>
          <NumberField
            value={value.husbandAge}
            onChange={(husbandAge) => onChange({ ...value, husbandAge })}
          >
            <Label>夫の現在年齢 (歳)</Label>
            <NumberField.Group className="grid-cols-1">
              <NumberField.Input />
            </NumberField.Group>
          </NumberField>
          <NumberField
            value={value.wifeAge}
            onChange={(wifeAge) => onChange({ ...value, wifeAge })}
          >
            <Label>妻の現在年齢 (歳)</Label>
            <NumberField.Group className="grid-cols-1">
              <NumberField.Input />
            </NumberField.Group>
          </NumberField>
          <NumberField
            value={value.husbandSavings}
            onChange={(husbandSavings) => onChange({ ...value, husbandSavings })}
            formatOptions={{ useGrouping: false }}
          >
            <Label>夫の現在貯蓄 (万円)</Label>
            <NumberField.Group className="grid-cols-1">
              <NumberField.Input />
            </NumberField.Group>
          </NumberField>
          <NumberField
            value={value.wifeSavings}
            onChange={(wifeSavings) => onChange({ ...value, wifeSavings })}
            formatOptions={{ useGrouping: false }}
          >
            <Label>妻の現在貯蓄 (万円)</Label>
            <NumberField.Group className="grid-cols-1">
              <NumberField.Input />
            </NumberField.Group>
          </NumberField>
        </div>
      </Card.Content>
    </Card>
  )
}
