# MoneyMap Journey Map Specification

Version: 1.0

---

# 概要

Journey Map は MoneyMap の中心となる UI コンポーネント。

通常の折れ線グラフではなく、

**人生・資産推移を一本の道として可視化する。**

ユーザーは数字ではなく

「旅」

として未来を理解する。

---

# Design Concept

Google Maps

+

Nintendo World Map

+

Airbnb Illustration

+

等高線地図

---

# 技術構成

```text
React
├── SVG
├── d3-shape
├── Framer Motion
├── react-zoom-pan-pinch
└── Tailwind CSS
```

---

# レイヤー構成

```
JourneyMap

├── Background
│     ├── Sky
│     ├── Mountains
│     ├── Trees
│     ├── Clouds
│     └── River
│
├── Terrain
│     ├── Contour Lines
│     ├── Green Area
│     ├── Yellow Area
│     └── Red Area
│
├── Route
│     ├── Path
│     ├── Route Shadow
│     ├── Route Glow
│     └── Route Animation
│
├── Markers
│     ├── Current
│     ├── Event
│     ├── Goal
│     └── Warning
│
├── Tooltip
│
└── UI Overlay
```

---

# SVG構造

```text
<svg>

<defs>

Gradient

Glow

DropShadow

Pattern

</defs>

<g id="background"/>

<g id="terrain"/>

<g id="route"/>

<g id="markers"/>

<g id="labels"/>

<g id="overlay"/>

</svg>
```

---

# Canvas Size

Desktop

```
1600 × 700
```

Tablet

```
1024 × 500
```

Mobile

```
390 × 600
```

---

# Background

背景はSVGで描画。

画像は使用しない。

---

## Sky

Gradient

```
#FFF7ED

↓

#FFFFFF
```

---

## Mountains

3〜5層

Opacity

```
15%

25%

35%
```

Bezier Curveで生成。

---

## Trees

SVGアイコン。

ランダム配置。

---

## River

1本。

水色。

```
#8ED8F8
```

Opacity

40%

---

## Clouds

5〜8個。

ゆっくり横移動。

Duration

40秒

Infinite

---

# Terrain

Journeyの下に表示。

等高線を生成。

---

方法

Perlin Noise

または

Simplex Noise

---

Contour数

```
15〜20本
```

Opacity

```
10%
```

Stroke

```
#D9C6A3
```

---

# Journey Route

SVG Path

Bezier Curve

---

例

```
M0,420

C200,320

450,480

700,350

1000,520

1400,180
```

---

線幅

```
8px
```

Shadow

```
12px Blur
```

---

Gradient

```
Blue

↓

Green

↓

Amber

↓

Red

↓

Green
```

区間ごとに色を変更。

---

# Route Animation

初回ロード

道が描かれる。

```
stroke-dasharray

stroke-dashoffset
```

Duration

```
2秒
```

Ease

```
easeOut
```

---

現在地

Pulse Animation

Scale

```
1 → 1.15
```

Repeat

Infinite

---

# Terrain Color

## Safe Area

```
#A7F3D0
```

---

## Warning

```
#FDE68A
```

---

## Danger

```
#FCA5A5
```

---

色はグラデーション。

境界をぼかす。

---

# Current Marker

📍

Blue

Shadow付き。

クリック可能。

表示

```
現在地

2026年

34歳
```

---

# Goal Marker

🏁

緑。

旗アイコン。

クリック

↓

目標内容表示。

---

# Event Marker

アイコン例

🏠

住宅購入

---

👶

出産

---

🎓

教育費

---

🚗

車

---

💼

転職

---

✈️

旅行

---

💰

退職

---

マーカーは

円形。

白背景。

影付き。

---

Hover

少し浮く。

Tooltip表示。

---

# Warning Area

赤字予測

↓

地形が赤くなる。

さらに

薄い波紋アニメーション。

---

# Tooltip

カード表示。

内容

```
住宅購入

2033年

支出

420万円
```

白背景。

角丸16px。

---

# Mini Animation

木

ゆっくり揺れる。

---

川

キラキラ。

---

雲

横移動。

---

現在地

鼓動。

---

道

光が流れる。

---

# Zoom

react-zoom-pan-pinch

対応。

ホイール

ピンチ

ドラッグ

---

最大

```
2.5倍
```

最小

```
0.8倍
```

---

# Timeline

画面上部。

```
2025────────2055
```

スライダー移動。

移動すると

現在地も移動。

---

# Data Structure

```ts
type JourneyNode = {
  year: number
  age: number
  asset: number
  cashflow: number
  status: "safe" | "warning" | "danger"
  events: Event[]
}
```

---

# Event

```ts
type Event = {
  id: string
  type: "house" | "car" | "child" | "retire"
  title: string
  cost: number
}
```

---

# Component Structure

```
JourneyMap

BackgroundLayer

TerrainLayer

RouteLayer

RoutePoint

CurrentMarker

GoalMarker

EventMarker

Tooltip

ZoomControls

Legend

Timeline
```

---

# Motion

Framer Motion

使用。

Hover

```
scale 1.05
```

Card

```
translateY(-4)
```

Route

Glow Animation

Current Marker

Pulse

Cloud

translateX

---

# Accessibility

- すべての色状態（安全・注意・危険）は色だけでなくアイコンやラベルでも区別する
- キーボードで各イベントマーカーにフォーカス可能
- SVG要素に適切な `aria-label` を付与
- コントラスト比は WCAG AA 以上を目標とする

---

# Performance

- SVGノード数は 300 以下を目安にする
- 等高線は初回生成後にキャッシュする
- 背景レイヤーは `React.memo` で再レンダリングを防ぐ
- アニメーションは `transform` と `opacity` を中心に実装し、レイアウト再計算を避ける
- ズーム・パン中はツールチップ更新を一時停止し、操作感を優先する

---

# UX Goal

Journey Map を開いた瞬間に

**「数字を読む」のではなく、未来への旅を眺めている**

と感じられること。

ユーザーは危険な年を「赤いグラフ」としてではなく、

**"谷" や "険しい地形"**

として直感的に理解し、

改善策を試すことで道が滑らかに変化する様子を体験できる。

これにより MoneyMap は、単なる家計管理アプリではなく、

**未来を一緒に設計するナビゲーションツール**としての価値を提供する。
