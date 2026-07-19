"use client"

import { Input, Label, NumberField, TextField } from "@heroui/react"

export function LabeledNumber({
  label,
  value,
  onChange,
  integer = false,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  integer?: boolean
}) {
  return (
    <NumberField
      value={value}
      onChange={onChange}
      minValue={0}
      formatOptions={integer ? { useGrouping: false } : undefined}
    >
      <Label>{label}</Label>
      <NumberField.Group className="grid-cols-1">
        <NumberField.Input />
      </NumberField.Group>
    </NumberField>
  )
}

export function LabeledText({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <TextField value={value} onChange={onChange}>
      <Label>{label}</Label>
      <Input />
    </TextField>
  )
}

/** ラベルなしのテーブルセル用の数値入力。 */
export function CellNumber({
  value,
  onChange,
  ariaLabel,
  integer = false,
}: {
  value: number
  onChange: (value: number) => void
  ariaLabel: string
  integer?: boolean
}) {
  return (
    <NumberField
      value={value}
      onChange={onChange}
      minValue={0}
      aria-label={ariaLabel}
      formatOptions={integer ? { useGrouping: false } : undefined}
    >
      <NumberField.Group className="grid-cols-1">
        <NumberField.Input />
      </NumberField.Group>
    </NumberField>
  )
}

/** ラベルなしのテーブルセル用のテキスト入力。 */
export function CellText({
  value,
  onChange,
  ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  ariaLabel: string
}) {
  return (
    <TextField value={value} onChange={onChange} aria-label={ariaLabel}>
      <Input />
    </TextField>
  )
}
