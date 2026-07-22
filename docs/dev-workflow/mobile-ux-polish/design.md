# 設計書: モバイルUXの改善（A: 入力のはみ出し解消 / C: タップ領域・余白・ナビ微調整）

対応する要件定義: ./requirements.md
作成日: 2026-07-22

## 1. アーキテクチャ概要

表示（CSS/レイアウト）のみの変更。計算・型・保存ロジックには触れない。
はみ出しの原因は、基礎生活費・固有の支出が **HTMLの `<table>` で固定列レイアウト**を組んでおり、
狭幅で列が縮まず数値入力が見切れること。これを、このファイル内の他の入力行（昇給フェーズ・
子育てステージ・維持費の段階リスト）が既に採用している **`grid-cols-1 sm:grid-cols-[...]` の
レスポンシブ行**に置き換える。デスクトップ（`sm` 以上）はヘッダ行＋整列した列で従来と同等の見た目、
モバイル（`sm` 未満）は各行が縦積みで各フィールドにラベルが付く形にする。

## 2. 変更・追加するファイル一覧

| ファイル | 種別 | 内容 |
|---|---|---|
| `components/data-input/data-input-page.tsx` | 変更 | `LivingExpenseCard` / `SpecificExpenseCard` の table をレスポンシブ grid 行に置換。`RowDeleteButton` / `AddRowButton` のタップ領域調整 |
| `app/page.tsx` | 変更 | モバイル上部ナビ（画面切替セレクト）のタップ領域・余白の調整 |

`engine/`・`lib/`・テストは変更しない（計算不変）。`components/data-input/fields.tsx` は原則触らない
（必要が生じた場合のみ入力欄の最小高さ調整に留める）。

## 3. インターフェース設計（レイアウト方針）

### 3.1 レスポンシブ行の共通形

各テーブルを次の構造に置き換える（`<table>` をやめ `<div>` ベースに）:

- **ヘッダ行**（`sm` 以上のみ表示）: `hidden sm:grid` に列テンプレートを当て、列見出しを表示。
  例（基礎生活費）: `sm:grid-cols-[1fr_8rem_8rem_2.5rem]`（現行 `w-32`=8rem, 削除列 `w-10`=2.5rem に相当）。
- **データ行**: `grid grid-cols-1 gap-2 sm:grid-cols-[<同じテンプレート>] sm:items-center sm:gap-2`。
  - モバイルでは各フィールドをラベル付きで縦積み。ラベルは各フィールドの前に
    `<span className="sm:hidden text-xs text-mm-ink-secondary">夫(月額 万円)</span>` のように置き、
    `sm` 以上では非表示（ヘッダ行が見出しを担うため）。
  - 入力（`CellText` / `CellNumber`）は幅100%で表示（既存コンポーネントのまま。親が幅を与える）。
  - モバイル時は行を軽くグルーピング: `rounded-2xl border border-mm-sand p-3 sm:border-0 sm:p-0 sm:rounded-none`。
- **削除**: モバイルは押しやすいテキストボタン（例「削除」, `py-2.5`, 高さ≥44px, 幅広め）、
  `sm` 以上は現行の丸アイコンボタン。`RowDeleteButton` をレスポンシブ対応にするか、
  行内で `sm:hidden` / `hidden sm:flex` を切り替える。

### 3.2 各テーブルの列テンプレート

- 基礎生活費（`LivingExpenseCard`）: 費目 / 夫(月額) / 妻(月額) / 削除
  → `sm:grid-cols-[1fr_8rem_8rem_2.5rem]`。合計行も同じ列に合わせ、モバイルでは
  「合計(月額) 夫 X / 妻 Y」を1行で読める形にする。
- 固有の支出・通常項目（`SpecificExpenseCard` items）: 内訳 / 月額 / 削除
  → `sm:grid-cols-[1fr_8rem_2.5rem]`。
- 固有の支出・ローン（`SpecificExpenseCard` loans）: 内訳 / 月額 / 払い終わり / 削除
  → `sm:grid-cols-[1fr_8rem_9rem_2.5rem]`（払い終わり列は現行 `w-36`=9rem）。

### 3.3 C: タップ領域・余白・ナビ

- `RowDeleteButton`: 現行 `h-9 w-9`(36px)。モバイルは高さ≥44px（例 `h-11` 相当のテキストボタン）、
  `sm` 以上は従来サイズ。
- `AddRowButton`: 現行 `py-2`。モバイルは `py-3`（高さ≥44px）、`sm:py-2` で従来に戻す。
- `app/page.tsx` モバイル上部ナビのセレクト: `py-1.5` → `py-2.5` 目安にタップ領域確保。バーの余白も微調整。
- データ入力のタブボタン: 既に折返し済み。タップ高さが44px未満なら `py-2.5` 目安に調整（デスクトップは据え置き）。

## 4. データフロー・処理フロー

表示のみの変更でありデータフローは不変。各行の `onChange`（update/remove/add）は現行の
ハンドラをそのまま使う。値・型・計算・保存は一切変えない。

## 5. エッジケース・エラーハンドリング方針

- 項目が0件のとき、追加ボタンのみ表示される点は従来どおり。
- 数値入力の桁が増えても、モバイルは1フィールド1行なので折返し・見切れが起きない。
- デスクトップ（`sm` 以上）は列テンプレートで従来と同じ整列を保つ（回帰なし）。

## 6. テスト方針

- 計算ロジックは不変のため、既存の自動テスト（`npm test`）は変更なしで通ること。
- レイアウトは自動テスト対象外のため、評価フェーズで実機（320px / 375px / デスクトップ1280px）を
  ブラウザ確認する（はみ出し・ページ横あふれ・タップ領域・デスクトップ回帰）。

## 7. Codexへの実装指示（このまま渡せる形）

```
Next.js + TypeScript のライフプラン試算アプリで、データ入力画面のモバイルUXを改善してください。
表示（CSS/レイアウト）のみの変更で、計算・型・保存ロジック（engine/ や lib/storage.ts）は一切
変更しないこと。デスクトップ（Tailwind の sm 以上, 640px+）の見た目は従来と同等に保ち、
モバイル（sm 未満）でのはみ出しを解消します。

対象ファイル: components/data-input/data-input-page.tsx と app/page.tsx のみ。

## A. テーブル型入力のモバイル対応（最優先）
components/data-input/data-input-page.tsx の以下2カードは現在 <table> で固定列レイアウトのため、
320px 幅で数値入力が画面から見切れます。これを、同ファイル内の他の入力行（例: MaintenanceStageList,
ChildRearingCard, HusbandIncomeCard の昇給フェーズ行）が使っている
`grid grid-cols-1 sm:grid-cols-[...]` のレスポンシブ行に置き換えてください。

1. LivingExpenseCard（基礎生活費）: 列は 費目 / 夫(月額 万円) / 妻(月額 万円) / 削除。
   - <table> をやめ div ベースに。
   - ヘッダ行は `hidden sm:grid sm:grid-cols-[1fr_8rem_8rem_2.5rem]` で列見出しを表示。
   - 各データ行は `grid grid-cols-1 gap-2 sm:grid-cols-[1fr_8rem_8rem_2.5rem] sm:items-center`。
     モバイルでは各入力の前に `<span className="sm:hidden text-xs text-mm-ink-secondary">…</span>` で
     フィールド名（夫(月額 万円) 等）を出し、sm 以上では非表示にする。
     モバイルの各行は `rounded-2xl border border-mm-sand p-3 sm:border-0 sm:p-0 sm:rounded-none` で
     軽くグルーピング。
   - 入力は既存の CellText / CellNumber をそのまま使う（親 grid セルが幅を与えるので幅100%で収まる）。
   - 合計(月額)行も同じ列テンプレートに合わせ、モバイルでも「合計 夫X / 妻Y」が読める形にする。
   - 「費目を追加」ボタンと「物価上昇率」入力は現状維持（モバイルで縦並びになるよう flex-wrap は保持）。
2. SpecificExpenseCard（夫/妻の固有の支出）:
   - 通常項目テーブル: 内訳 / 月額 / 削除 → `sm:grid-cols-[1fr_8rem_2.5rem]` で同様に置換。
   - ローンテーブル: 内訳 / 月額 / 払い終わり(年後) / 削除 → `sm:grid-cols-[1fr_8rem_9rem_2.5rem]` で置換。
   - どちらもヘッダ行は `hidden sm:grid`、データ行はモバイル縦積み＋フィールドラベル、という同じ方式。

## C. タップ領域・余白・ナビの微調整
- RowDeleteButton: 現在 h-9 w-9(36px)。上記モバイル行では押しやすいテキストボタン（「削除」, 高さ≥44px,
  例 py-2.5 で横widthも十分）にし、sm 以上では従来の丸「×」アイコンボタンを使う（レスポンシブ切替でよい）。
- AddRowButton: 現在 py-2。モバイルで py-3（高さ≥44px）にし `sm:py-2` で従来に戻す。
- app/page.tsx のモバイル上部ナビ（lg:hidden のバー内の <select>）: py-1.5 → py-2.5 目安でタップ領域を確保し、
  バーの余白を軽く整える。
- データ入力のタブボタン（role="tab"）: タップ高さが不足していれば py を +0.5 目安で調整（sm 以上は据え置き）。

## 制約
- 対象2ファイル以外は変更しない。engine/・lib/・テストは触らない（計算・データ不変）。
- 既存の aria-label / aria-pressed を維持する。
- デスクトップ（1280px）でのデータ入力の見た目が実質変わらないこと（ヘッダ行＋整列列のまま）。
- 変更後 `npm test` / `npx tsc --noEmit` / `npx eslint` がすべて通ること。
```

## 8. リスク・懸念点

- `<table>` から div へ置換する際、デスクトップの列整列がヘッダとズレないよう、ヘッダ行とデータ行で
  同一の grid テンプレート文字列を使うこと（評価フェーズでデスクトップ回帰を必ず確認）。
- モバイルのフィールドラベル追加で情報量が増えるが、`sm:hidden` によりデスクトップには出さない。
- C のタップ領域拡大がデスクトップの詰まったレイアウトに影響しないよう、すべて `sm:` で従来値へ戻す。
