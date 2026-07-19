"use client"

import { useState } from "react"

import { BellIcon, RefreshIcon } from "../icons"

export function GreetingHeader() {
  const [refreshing, setRefreshing] = useState(false)

  function handleRefresh() {
    setRefreshing(true)
    window.setTimeout(() => setRefreshing(false), 600)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-mm-ink sm:text-[28px]">
          こんにちは ☀️
        </h1>
        <p className="mt-1 text-sm text-mm-ink-secondary">
          あなたの未来の航路を、今日も少しだけ前へ進めましょう。
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="通知"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-mm-ink-secondary shadow-mm-soft transition-colors hover:text-brand-orange"
        >
          <BellIcon className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-coral" />
        </button>
        <button
          type="button"
          onClick={handleRefresh}
          className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-mm-ink shadow-mm-soft transition-transform hover:scale-[1.02]"
        >
          <RefreshIcon className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          データを更新
        </button>
      </div>
    </div>
  )
}
