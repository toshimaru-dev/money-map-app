# 設計書: 住宅ローン 初年度維持費の項目別トグル

対応する要件定義: ./requirements.md
作成日: 2026-07-21

## 1. アーキテクチャ概要

維持費計算は `engine/mortgage.ts` の `maintenanceAt()` に集約されている。ここに「経過1年目のとき、
トグルOFFの項目を0にする」分岐を1箇所だけ追加する。設定値は `MortgageConfig` に真偽値3つを追加し、
入力UI（住宅ローンの維持費カード）にトグルを追加する。住宅ローンページ・ライフプラン明細は
`maintenanceAt()` の結果（`maintenanceTotal` 等）を参照しているため、エンジンを直せば自動反映される。

## 2. 変更・追加するファイル一覧

| ファイル | 種別 | 内容 |
|---|---|---|
| `engine/types.ts` | 変更 | `MortgageConfig` に初年度トグル3つ（boolean）を追加 |
| `engine/mortgage.ts` | 変更 | `maintenanceAt()` に「経過1年目 & トグルOFF → 0」の分岐を追加 |
| `engine/default-input.ts` | 変更 | 追加した3フィールドの既定値（すべて `true`）を設定 |
| `components/data-input/data-input-page.tsx` | 変更 | `MortgageMaintenanceCard` に「初年度に含める」トグルを3つ追加 |
| `lib/storage.ts` | 変更 | `STORAGE_KEY` を v9 → v10 に更新 |
| `engine/__tests__/mortgage.test.ts` | 変更 | 初年度トグルの単体テストを追加 |

`components/mortgage/mortgage-page.tsx` は変更不要（エンジン結果を参照しているため自動反映）。

## 3. インターフェース設計

### `MortgageConfig`（`engine/types.ts`）に追加

維持費フィールド群（`monthlyManagementFee` などの近く）に、以下3つを追加する:

```ts
// 初年度(経過1年目)に各維持費を計上するか。false の場合、1年目のその項目は0になる。
includeFirstYearManagementFee: boolean // 管理費
includeFirstYearRepairReserve: boolean // 修繕積立金
includeFirstYearInsurance: boolean     // 保険(火災+地震)
```

### `default-input.ts`

`mortgage` に以下を追加（既定は全て `true` = 現状維持）:

```ts
includeFirstYearManagementFee: true,
includeFirstYearRepairReserve: true,
includeFirstYearInsurance: true,
```

## 4. データフロー・処理フロー

`maintenanceAt(config, elapsedYear)` を次のように変更する。
**まず現状ロジックで各項目の金額を算出し、その後で「経過1年目のときだけ」トグルOFFの項目を0にする。**
複利上昇・段階的の両モードに一律で効くよう、モード分岐の後段でまとめて処理する。

擬似コード:

```
isRenewalYear = renewalYears > 0 && (elapsedYear - 1) % renewalYears === 0
insurance = isRenewalYear ? (fireInsurance + earthquakeInsurance) : 0

if (mode === "stepped") {
  managementFee = stagedMonthlyAt(managementFeeStages, elapsedYear) * 12
  repairReserve = stagedMonthlyAt(repairReserveStages, elapsedYear) * 12
} else {
  growth = (1 + maintenanceIncreaseRate/100) ** (elapsedYear - 1)
  managementFee = monthlyManagementFee * 12 * growth
  repairReserve = monthlyRepairReserve * 12 * growth
}

// ★ 追加: 初年度トグル
if (elapsedYear === 1) {
  if (!includeFirstYearManagementFee) managementFee = 0
  if (!includeFirstYearRepairReserve) repairReserve = 0
  if (!includeFirstYearInsurance)     insurance = 0
}

return { managementFee, repairReserve, insurance }
```

`maintenanceTotal`（= managementFee + repairReserve + insurance）は既存の呼び出し側
（`calcMortgagePlan` 内）でそのまま合算されるため、変更不要。

## 5. エッジケース・エラーハンドリング方針

- `simulationYears === 0` や経過1年目が存在しないケースは既存どおり（ループが回らないだけ）。
- トグルは1年目のみに作用し、2年目以降のロジック（複利成長・段階切替・保険更新周期）には一切触れない。
- 3つとも `true`（既定）のとき、`maintenanceAt` の出力は変更前と完全一致すること（回帰防止）。

## 6. テスト方針（`engine/__tests__/mortgage.test.ts` に追加）

`calcMortgagePlan(config, 2027, ...)` を使い、`config` の各トグルを切り替えて検証する。

- **管理費OFF**: `includeFirstYearManagementFee: false` のとき `plan[0].managementFee === 0`、
  かつ `plan[1].managementFee` は既定（ON）の場合と同値（2年目以降不変）。
- **修繕積立金OFF**: 同様に `plan[0].repairReserve === 0`、`plan[1].repairReserve` は不変。
- **保険OFF**: `includeFirstYearInsurance: false` のとき `plan[0].insurance === 0`、
  かつ次の更新年 `plan[5].insurance`（6年目）は火災+地震の満額のまま。
- **既定(全てON)での回帰**: 既存の維持費テスト（1年目 管理費22.8 / 修繕積立金13.2 等）がそのまま通ること。
- 複利上昇モード（`maintenanceMode: "compound"`）でも管理費/修繕積立金OFFが1年目0になることを1ケース追加。

## 7. Codexへの実装指示（このまま渡せる形）

```
このリポジトリ（Next.js + TypeScript のライフプラン試算アプリ）に、住宅ローンの
「初年度(経過1年目)に各維持費を計上するかを項目ごとに選択できる」機能を追加してください。
維持費は 管理費 / 修繕積立金 / 保険 の3項目です。既定は全て「含める」で、既存の試算結果を変えないこと。

## 1. engine/types.ts
`MortgageConfig` インターフェースの維持費フィールド群（monthlyManagementFee などの近く）に、
以下3つの boolean を追加してください:
  includeFirstYearManagementFee: boolean // 管理費: 初年度に計上するか
  includeFirstYearRepairReserve: boolean // 修繕積立金: 初年度に計上するか
  includeFirstYearInsurance: boolean     // 保険(火災+地震): 初年度に計上するか
コメントで「false の場合、経過1年目のその項目は0になる」旨を書いてください。

## 2. engine/mortgage.ts の maintenanceAt()
現状は管理費・修繕積立金・保険を算出して返しています。ロジックはそのままに、
**関数の最後（return の直前）に「経過1年目(elapsedYear === 1)のときだけ、対応するトグルが false の
項目を0にする」分岐を追加**してください。複利上昇("compound")・段階的("stepped")の両モードに一律で
効くよう、モード分岐で各値を算出した後にまとめて処理すること。3つとも true のとき出力が従来と
完全一致することを守ってください（2年目以降・保険更新周期には一切手を加えない）。

## 3. engine/default-input.ts
mortgage 設定に次を追加（既定は全て true）:
  includeFirstYearManagementFee: true,
  includeFirstYearRepairReserve: true,
  includeFirstYearInsurance: true,

## 4. components/data-input/data-input-page.tsx の MortgageMaintenanceCard
「維持費・保険」カード内に、各項目の「初年度に含める」トグルを追加してください:
  - 「管理費・修繕積立金」セクションに、管理費用と修繕積立金用の2つのトグル
  - 「保険」セクションに、保険用の1つのトグル
トグルは既存UIと一貫したスタイルにすること（このファイル内の AutoManualToggle のような
セグメント型ピル、または aria-pressed を持つトグルボタン）。ラベルは「初年度に含める / 含めない」など
分かりやすく。トグルの値は該当 boolean フィールドに setInput 経由で反映してください。
複利上昇・段階的どちらのモードでも管理費/修繕積立金のトグルが表示されるようにすること。

## 5. lib/storage.ts
STORAGE_KEY を "lifeplan-app:input:v9" から "lifeplan-app:input:v10" に更新してください
（構造が変わるため。旧データは無視して初期値にフォールバックする既存挙動のまま）。

## 6. engine/__tests__/mortgage.test.ts
以下の単体テストを追加してください（calcMortgagePlan を使用、config は defaultInput.mortgage を土台に上書き）:
  - includeFirstYearManagementFee:false → plan[0].managementFee===0、plan[1].managementFee は既定時と同値
  - includeFirstYearRepairReserve:false → plan[0].repairReserve===0、plan[1].repairReserve は既定時と同値
  - includeFirstYearInsurance:false → plan[0].insurance===0、plan[5].insurance は火災+地震の満額のまま
  - maintenanceMode:"compound" かつ includeFirstYearManagementFee:false でも plan[0].managementFee===0
  - 既定(全ON)では既存の維持費テストが変わらず通ること

## 制約
- 上記以外のファイルは変更しないでください（components/mortgage/mortgage-page.tsx は変更不要）。
- 2年目以降の維持費挙動、返済(元利均等・ボーナス・変動金利)ロジックには一切触れないでください。
- 変更後、`npm test` / `npx tsc --noEmit` / `npx eslint` がすべて通ることを確認してください。
```

## 8. リスク・懸念点

- 住宅ローンページの「管理費（初年度・月額）」表示は `plan[0].managementFee/12` を参照するため、
  管理費を初年度OFFにすると 0 と表示される。これは「初年度」表示として正しい挙動なので許容する
  （評価フェーズで表示の分かりやすさを確認する）。
- トグルの既定値は必ず `true`。ここが false になると既存ユーザーの試算が勝手に変わるため、
  評価フェーズで「全ON時に回帰なし」を必ず確認する。
