import type { LifePlanInput } from "../engine/types"

const STORAGE_KEY = "lifeplan-app:input"

export function loadLifePlanInput(): LifePlanInput | null {
  if (typeof window === "undefined") return null

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw === null) return null

  try {
    return JSON.parse(raw) as LifePlanInput
  } catch {
    return null
  }
}

export function saveLifePlanInput(input: LifePlanInput): void {
  if (typeof window === "undefined") return

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(input))
}
