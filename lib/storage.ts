import type { LifePlanInput } from "../engine/types"

// v10: 住宅ローン維持費に初年度の項目別計上設定を追加。
// 旧バージョンの保存データとは構造が異なるためキーを分けて無視する。
const STORAGE_KEY = "lifeplan-app:input:v10"

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
