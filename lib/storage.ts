import type { LifePlanInput } from "../engine/types"

// v9: 将来プラン(不定期支出)を廃止し、ライフイベントに統合。
// 旧バージョンの保存データとは構造が異なるためキーを分けて無視する。
const STORAGE_KEY = "lifeplan-app:input:v9"

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
