"use client"

import type { ComponentType } from "react"

import {
  AssetChartIcon,
  ChevronRightIcon,
  FileTextIcon,
  FlagIcon,
  HomeIcon,
  LighthouseIcon,
  PencilIcon,
  PlayIcon,
  RouteIcon,
  SettingsIcon,
  TrendingUpIcon,
  UserIcon,
} from "../icons"
import type { ViewKey } from "../../lib/view-types"

const NAV_ITEMS: { key: ViewKey; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { key: "home", label: "ホーム", icon: HomeIcon },
  { key: "input", label: "データ入力", icon: PencilIcon },
  { key: "plan", label: "ライフプラン", icon: RouteIcon },
  { key: "cashflow", label: "キャッシュフロー", icon: TrendingUpIcon },
  { key: "assets", label: "資産推移", icon: AssetChartIcon },
  { key: "goals", label: "目標", icon: FlagIcon },
  { key: "report", label: "レポート", icon: FileTextIcon },
  { key: "simulation", label: "シミュレーション", icon: PlayIcon },
  { key: "settings", label: "設定", icon: SettingsIcon },
]

export function Sidebar({
  activeView,
  onNavigate,
}: {
  activeView: ViewKey
  onNavigate: (view: ViewKey) => void
}) {
  return (
    <aside className="hidden h-full min-h-screen w-60 shrink-0 flex-col gap-6 border-r border-mm-sand bg-mm-warm-white px-4 py-6 lg:flex">
      <div className="flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-orange to-brand-amber text-white shadow-mm-soft">
          <RouteIcon className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold tracking-tight text-mm-ink">MoneyMap</span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = activeView === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onNavigate(key)}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gradient-to-r from-brand-orange to-brand-amber text-white shadow-mm-soft"
                  : "text-mm-ink-secondary hover:bg-mm-soft-orange hover:text-mm-ink"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <div className="rounded-3xl bg-mm-soft-orange p-4 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-orange shadow-mm-soft">
            <LighthouseIcon className="h-6 w-6" />
          </span>
          <p className="mt-3 text-xs leading-relaxed text-mm-ink-secondary">
            未来の地図を
            <br />
            一緒に描いていきましょう
          </p>
          <button
            type="button"
            onClick={() => onNavigate("input")}
            className="mt-3 w-full rounded-2xl bg-gradient-to-r from-brand-orange to-brand-amber px-3 py-2 text-xs font-semibold text-white shadow-mm-soft transition-transform hover:scale-[1.02]"
          >
            データを入力する
          </button>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("settings")}
          className="flex items-center gap-2 rounded-2xl px-2 py-2 text-left transition-colors hover:bg-mm-soft-orange"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mm-sand text-mm-ink-secondary">
            <UserIcon className="h-5 w-5" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-medium text-mm-ink">ゲストさん</span>
            <span className="flex items-center gap-0.5 text-xs text-mm-ink-caption">
              プロフィールを見る
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </span>
          </span>
        </button>
      </div>
    </aside>
  )
}
