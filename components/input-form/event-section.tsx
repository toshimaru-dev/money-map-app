"use client"

import { Card, Input, Label, NumberField, TextField } from "@heroui/react"

import type { LifeEvent, LifeEventType } from "../../engine/types"
import { PlusIcon } from "../icons"

const GROUP_CONFIG: Record<
  LifeEventType,
  { title: string; hint: string; defaultName: string; amountLabel: string; accent: string }
> = {
  income: {
    title: "収入イベント",
    hint: "退職金・相続・臨時収入など、まとまった収入を追加します。",
    defaultName: "新しい収入イベント",
    amountLabel: "収入額 (万円)",
    accent: "text-brand-green",
  },
  expense: {
    title: "支出イベント",
    hint: "住宅購入・教育費・車の買い替えなど、まとまった支出を追加します。",
    defaultName: "新しい支出イベント",
    amountLabel: "支出額 (万円)",
    accent: "text-brand-coral",
  },
}

function EventGroup({
  type,
  events,
  startYear,
  onChange,
}: {
  type: LifeEventType
  events: LifeEvent[]
  startYear: number
  onChange: (next: LifeEvent[]) => void
}) {
  const config = GROUP_CONFIG[type]
  const groupEvents = events.filter((event) => event.type === type)

  function updateEvent(id: string, patch: Partial<LifeEvent>) {
    onChange(events.map((event) => (event.id === id ? { ...event, ...patch } : event)))
  }

  function removeEvent(id: string) {
    onChange(events.filter((event) => event.id !== id))
  }

  function addEvent() {
    onChange([
      ...events,
      {
        id: crypto.randomUUID(),
        name: config.defaultName,
        year: startYear + 5,
        type,
        amount: 100,
      },
    ])
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className={`text-sm font-semibold ${config.accent}`}>{config.title}</h3>
        <p className="mt-0.5 text-xs text-mm-ink-caption">{config.hint}</p>
      </div>

      {groupEvents.length === 0 && (
        <p className="rounded-2xl bg-mm-soft-orange px-4 py-3 text-sm text-mm-ink-secondary">
          まだ{config.title}がありません。「{config.title}を追加」から追加してみましょう。
        </p>
      )}

      {groupEvents.map((event) => (
        <div
          key={event.id}
          className="grid grid-cols-1 items-end gap-3 rounded-2xl border border-mm-sand p-3 sm:grid-cols-[1fr_130px_150px_auto]"
        >
          <TextField value={event.name} onChange={(name) => updateEvent(event.id, { name })}>
            <Label>イベント名</Label>
            <Input />
          </TextField>
          <NumberField
            value={event.year}
            onChange={(year) => updateEvent(event.id, { year })}
            minValue={0}
            formatOptions={{ useGrouping: false }}
          >
            <Label>年 (西暦)</Label>
            <NumberField.Group className="grid-cols-1">
              <NumberField.Input />
            </NumberField.Group>
          </NumberField>
          <NumberField
            value={event.amount}
            onChange={(amount) => updateEvent(event.id, { amount })}
            minValue={0}
          >
            <Label>{config.amountLabel}</Label>
            <NumberField.Group className="grid-cols-1">
              <NumberField.Input />
            </NumberField.Group>
          </NumberField>
          <button
            type="button"
            onClick={() => removeEvent(event.id)}
            className="h-10 rounded-2xl px-3 text-sm font-medium text-brand-coral transition-colors hover:bg-brand-coral/10 md:h-9"
          >
            削除
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addEvent}
        className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-mm-sand px-4 py-2.5 text-sm font-medium text-mm-ink-secondary transition-colors hover:border-brand-orange hover:text-brand-orange"
      >
        <PlusIcon className="h-4 w-4" />
        {config.title}を追加
      </button>
    </div>
  )
}

export function EventSection({
  value,
  startYear,
  onChange,
}: {
  value: LifeEvent[]
  startYear: number
  onChange: (value: LifeEvent[]) => void
}) {
  return (
    <Card className="lg:col-span-2">
      <Card.Header>
        <Card.Title>ライフイベント</Card.Title>
        <Card.Description>
          収入イベントと支出イベントを分けて入力します。金額はすべて正の値で入力してください。
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <EventGroup type="income" events={value} startYear={startYear} onChange={onChange} />
          <EventGroup type="expense" events={value} startYear={startYear} onChange={onChange} />
        </div>
      </Card.Content>
    </Card>
  )
}
