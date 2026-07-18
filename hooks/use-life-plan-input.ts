"use client"

import { useEffect, useState } from "react"

import { defaultInput } from "../engine/default-input"
import type { LifePlanInput } from "../engine/types"
import { loadLifePlanInput, saveLifePlanInput } from "../lib/storage"

export function useLifePlanInput(): {
  input: LifePlanInput
  setInput: (input: LifePlanInput) => void
  updateInput: (updater: (draft: LifePlanInput) => LifePlanInput) => void
} {
  const [input, setInput] = useState<LifePlanInput>(defaultInput)

  useEffect(() => {
    const loaded = loadLifePlanInput()
    if (loaded !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage hydration after mount to avoid SSR/hydration mismatch; loadLifePlanInput() can't run during SSR
      setInput(loaded)
    }
  }, [])

  useEffect(() => {
    if (input === defaultInput) return
    saveLifePlanInput(input)
  }, [input])

  function updateInput(updater: (draft: LifePlanInput) => LifePlanInput): void {
    setInput((prev) => updater(prev))
  }

  return { input, setInput, updateInput }
}
