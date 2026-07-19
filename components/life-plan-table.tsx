import type { YearlyResult } from "../engine/types"

function formatInt(value: number): string {
  return String(value)
}

function formatChildAge(value: number): string {
  return value < 0 ? "—" : String(value)
}

function formatDecimal(value: number): string {
  return value.toLocaleString("ja-JP", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}

interface RowConfig {
  key: keyof YearlyResult
  label: string
  format: (value: number) => string
  emphasis?: boolean
  negativeColor?: boolean
  muted?: boolean // 参考表示(住宅ローン控除など)
  hideIfAllZero?: boolean // 全年で0なら非表示(住宅ローン/賃貸の切り替え用)
}

const ROWS: RowConfig[] = [
  { key: "year", label: "西暦", format: formatInt },
  { key: "elapsedYears", label: "経過年数", format: formatInt },
  { key: "husbandAge", label: "夫: 年齢", format: formatInt },
  { key: "wifeAge", label: "妻: 年齢", format: formatInt },
  { key: "childAge", label: "子ども: 年齢", format: formatChildAge },
  // 収入
  { key: "husbandIncome", label: "夫: 収入", format: formatDecimal },
  { key: "wifeIncome", label: "妻: 収入", format: formatDecimal },
  { key: "childcareAllowance", label: "子育て関連手当", format: formatDecimal },
  { key: "otherIncome", label: "その他収入(副業など)", format: formatDecimal, hideIfAllZero: true },
  { key: "eventIncome", label: "その他収入(イベント)", format: formatDecimal, hideIfAllZero: true },
  { key: "totalIncome", label: "収入合計", format: formatDecimal, emphasis: true },
  // 支出
  { key: "livingExpense", label: "生活費", format: formatDecimal },
  { key: "mortgagePayment", label: "住宅ローン返済額", format: formatDecimal, hideIfAllZero: true },
  { key: "mortgageBalance", label: "住宅ローン: 残債", format: formatDecimal, hideIfAllZero: true },
  { key: "managementFee", label: "管理費・修繕積立金", format: formatDecimal, hideIfAllZero: true },
  { key: "rentPayment", label: "住宅賃料", format: formatDecimal, hideIfAllZero: true },
  { key: "rentRenewalFee", label: "更新料", format: formatDecimal, hideIfAllZero: true },
  { key: "childcareCost", label: "子育て関連費用", format: formatDecimal },
  { key: "husbandSpecificExpense", label: "夫: 固有の支出", format: formatDecimal },
  { key: "wifeSpecificExpense", label: "妻: 固有の支出", format: formatDecimal },
  { key: "midTermContribution", label: "金融商品積立額(中期向け)", format: formatDecimal },
  { key: "futurePlan", label: "将来プラン(不定期支出)", format: formatDecimal },
  { key: "mortgageDeduction", label: "住宅ローン控除(参考)", format: formatDecimal, muted: true, hideIfAllZero: true },
  { key: "tax", label: "税金", format: formatDecimal },
  { key: "socialInsurance", label: "社会保険料", format: formatDecimal },
  { key: "eventExpense", label: "ライフイベント支出", format: formatDecimal },
  { key: "totalExpense", label: "支出合計", format: formatDecimal, emphasis: true },
  // 収支・資産
  { key: "netCashFlow", label: "年間収支", format: formatDecimal, negativeColor: true },
  { key: "investmentBalance", label: "投資信託残高", format: formatDecimal },
  { key: "cashBalance", label: "現金貯蓄残高", format: formatDecimal, negativeColor: true },
  { key: "totalAssets", label: "資産合計", format: formatDecimal, emphasis: true, negativeColor: true },
]

const LABEL_CELL_CLASS =
  "sticky left-0 whitespace-nowrap border-r border-mm-sand px-3 py-2 text-left align-middle text-sm"
const YEAR_CELL_CLASS =
  "min-w-[88px] px-3 py-2 text-right align-middle text-sm tabular-nums whitespace-nowrap font-[family-name:var(--font-number)]"

export function LifePlanTable({ results }: { results: YearlyResult[] }) {
  if (results.length === 0) {
    return (
      <section className="rounded-3xl bg-white p-6 text-center text-sm text-mm-ink-caption shadow-mm-soft">
        データがありません
      </section>
    )
  }

  // 住宅ローン/賃貸などモードで使われない全0の行は隠す
  const rows = ROWS.filter(
    (row) => !row.hideIfAllZero || results.some((result) => (result[row.key] as number) !== 0),
  )

  return (
    <section className="rounded-3xl bg-white p-6 shadow-mm-soft">
      <h3 className="mb-4 text-sm font-semibold text-mm-ink">年次シミュレーション明細</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-mm-sand">
              {/* z-20 explicitly outranks the body row labels' z-10 below, so the header stays on top regardless of Tailwind's class emission order */}
              <th scope="col" className={`${LABEL_CELL_CLASS} z-20 bg-white font-semibold`}>
                項目
              </th>
              {results.map((result) => (
                <th key={result.year} scope="col" className={`${YEAR_CELL_CLASS} font-semibold`}>
                  {result.year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-mm-sand/60 last:border-b-0">
                <th
                  scope="row"
                  className={`${LABEL_CELL_CLASS} z-10 font-medium ${
                    row.emphasis ? "bg-mm-soft-orange font-semibold" : "bg-white"
                  } ${row.muted ? "text-mm-ink-caption" : ""}`}
                >
                  {row.label}
                </th>
                {results.map((result) => {
                  const value = result[row.key]
                  const isNegative = row.negativeColor && value < 0
                  return (
                    <td
                      key={result.year}
                      className={`${YEAR_CELL_CLASS} ${row.emphasis ? "bg-mm-soft-orange font-semibold" : ""} ${
                        isNegative ? "text-brand-coral" : row.muted ? "text-mm-ink-caption" : ""
                      }`}
                    >
                      {row.format(value)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
