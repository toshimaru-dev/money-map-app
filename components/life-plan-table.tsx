import type { YearlyResult } from "../engine/types"

function formatInt(value: number): string {
  return String(value)
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
}

const ROWS: RowConfig[] = [
  { key: "year", label: "西暦", format: formatInt },
  { key: "elapsedYears", label: "経過年数", format: formatInt },
  { key: "husbandAge", label: "夫: 年齢", format: formatInt },
  { key: "wifeAge", label: "妻: 年齢", format: formatInt },
  { key: "husbandIncome", label: "夫: 収入", format: formatDecimal },
  { key: "wifeIncome", label: "妻: 収入", format: formatDecimal },
  { key: "totalIncome", label: "収入合計", format: formatDecimal, emphasis: true },
  { key: "livingExpense", label: "生活費", format: formatDecimal },
  { key: "mortgagePayment", label: "住宅ローン返済額", format: formatDecimal },
  { key: "mortgageBalance", label: "住宅ローン: 残債", format: formatDecimal },
  { key: "managementFee", label: "管理費・修繕積立金", format: formatDecimal },
  { key: "totalExpense", label: "支出合計", format: formatDecimal, emphasis: true },
  { key: "netCashFlow", label: "年間収支", format: formatDecimal, negativeColor: true },
  { key: "cashBalance", label: "資産残高", format: formatDecimal, emphasis: true },
]

const LABEL_CELL_CLASS =
  "sticky left-0 whitespace-nowrap border-r border-black/10 px-3 py-2 text-left align-middle text-sm dark:border-white/10"
const YEAR_CELL_CLASS = "min-w-[88px] px-3 py-2 text-right align-middle text-sm tabular-nums whitespace-nowrap"

export function LifePlanTable({ results }: { results: YearlyResult[] }) {
  if (results.length === 0) {
    return (
      <section className="rounded-xl border border-black/10 bg-background p-6 text-center text-sm text-foreground/60 shadow-sm dark:border-white/10">
        データがありません
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-black/10 bg-background p-6 shadow-sm dark:border-white/10">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10">
              {/* z-20 explicitly outranks the body row labels' z-10 below, so the header stays on top regardless of Tailwind's class emission order */}
              <th
                scope="col"
                className={`${LABEL_CELL_CLASS} z-20 bg-background font-semibold`}
              >
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
            {ROWS.map((row) => (
              <tr key={row.key} className="border-b border-black/5 last:border-b-0 dark:border-white/5">
                <th
                  scope="row"
                  className={`${LABEL_CELL_CLASS} z-10 font-medium ${
                    row.emphasis ? "bg-foreground/[0.04] font-semibold" : "bg-background"
                  }`}
                >
                  {row.label}
                </th>
                {results.map((result) => {
                  const value = result[row.key]
                  const isNegative = row.negativeColor && value < 0
                  return (
                    <td
                      key={result.year}
                      className={`${YEAR_CELL_CLASS} ${row.emphasis ? "bg-foreground/[0.04] font-semibold" : ""} ${
                        isNegative ? "text-red-600 dark:text-red-400" : ""
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
