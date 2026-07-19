export type LifeEventType = "income" | "expense"

export interface LifeEvent {
  id: string
  name: string
  year: number // 西暦
  type: LifeEventType // 収入イベント / 支出イベント
  amount: number // 万円。常に正の値で入力する
}

/** 妻の収入減フェーズ。子どもの年齢で区切り、その期間の年収を上書きする。 */
export interface WifeIncomeReductionPhase {
  id: string
  label: string
  fromChildAge: number // この子ども年齢から
  toChildAge: number // この子ども年齢まで（含む）
  annual: number // この期間の妻の年収(万円)
}

/** 子育て関連費用・手当。子どもの年齢のレンジで指定する。 */
export interface ChildRearingStage {
  id: string
  label: string
  fromChildAge: number
  toChildAge: number
  annualCost: number // 子育て関連費用(年額, 万円)
  annualAllowance: number // 子育て関連手当(年額, 万円)
}

/** 固有支出の項目(娯楽費・サブスク・保険など、月額)。 */
export interface SpecificExpenseItem {
  id: string
  label: string
  monthly: number // 月額(万円)
}

/** 固有支出のうちローン(奨学金など)。払い終わりの経過年数まで発生する。 */
export interface SpecificExpenseLoan {
  id: string
  label: string
  monthly: number // 月額(万円)
  payoffYear: number // 払い終わり(経過年数、この年まで発生)
}

/** 一人分の固有支出。通常項目とローン項目に分かれる。 */
export interface PersonSpecificExpense {
  items: SpecificExpenseItem[]
  loans: SpecificExpenseLoan[]
}

/** 基礎生活費の費目(夫・妻の月額)。 */
export interface LivingExpenseItem {
  id: string
  label: string
  husbandMonthly: number // 夫の月額(万円)
  wifeMonthly: number // 妻の月額(万円)
}

/** 金融商品の積立枠(中期向け・長期向け)。 */
export interface InvestmentTrack {
  initialBalance: number // 現在残高(万円)
  annualContribution: number // 年間積立額(万円)
  annualReturnRate: number // 想定利回り(年率%)
}

export interface PersonIncome {
  baseIncome: number
  annualRaise: number
  raiseYears: number
}

/** 昇給フェーズ。指定の経過年数まで、毎年この昇給額を適用する。 */
export interface RaisePhase {
  id: string
  label: string
  annualRaise: number // 昇給額(万円/年)
  untilYear: number // この経過年数まで昇給を適用(以降は昇給停止=上限維持)
}

export interface HusbandIncome {
  baseIncome: number
  raisePhases: RaisePhase[]
}

export type HousingType = "mortgage" | "rent"

/** 賃貸の設定。 */
export interface RentConfig {
  monthlyRent: number // 月額賃料(万円)
  renewalFee: number // 更新料(万円)
  renewalIntervalYears: number // 更新間隔(年)
  rentIncreasePerRenewal: number // 更新ごとの賃料上昇(万円/月)
}

export interface LifePlanInput {
  basic: {
    startYear: number
    simulationYears: number
    husbandAge: number
    wifeAge: number
    childBirthYearOffset: number // 子供誕生時の経過年数(何年後に生まれるか)
    husbandSavings: number // 万円
    wifeSavings: number // 万円
    housingType: HousingType // 住宅ローン / 賃貸
  }
  income: {
    husband: HusbandIncome
    wife: PersonIncome & {
      // 子育て期間中の収入ダウンなど、子ども年齢で区切った減額フェーズ
      reductionPhases: WifeIncomeReductionPhase[]
    }
    // その他収入(副業・短期的な収入など)。fromYear〜untilYear(経過年数)の期間に適用
    otherIncome: {
      annualAmount: number // 万円/年
      fromYear: number // 適用開始(経過年数)
      untilYear: number // 適用終了(経過年数、この年まで)
    }
  }
  childRearing: ChildRearingStage[]
  livingExpense: {
    items: LivingExpenseItem[] // 費目ごとの夫・妻の月額
    annualInflationRate: number // 物価上昇率(年率%)
  }
  specificExpense: {
    husband: PersonSpecificExpense
    wife: PersonSpecificExpense
  }
  investment: {
    midTerm: InvestmentTrack
    longTerm: InvestmentTrack
  }
  futurePlan: {
    annualAmount: number // 将来プラン(不定期支出)の年間目安(万円/年)
  }
  mortgage: {
    principal: number // 借入金額(万円)
    interestRate: number // 固定金利(年率%)
    termYears: number
    annualManagementFee: number // 管理費+修繕積立金(定額/年、万円)
  }
  rent: RentConfig
  tax: {
    socialInsuranceRate: number // 給与に対する社会保険料率(0.15など)
    basicDeductionIncome: number // 基礎控除(所得税, 万円)
    basicDeductionResident: number // 基礎控除(住民税, 万円)
    // 税金・社会保険料は基本的に収入から自動計算。手動指定も可能。
    autoTax: boolean
    manualTaxAnnual: number // autoTax=false のとき使う税金(万円/年)
    autoSocialInsurance: boolean
    manualSocialInsuranceAnnual: number // autoSocialInsurance=false のとき使う社会保険料(万円/年)
  }
  mortgageDeduction: {
    rate: number // 年末残高に対する控除率(%)
    years: number // 適用年数
    capBalance: number // 控除対象の年末残高上限(万円)
  }
  events: LifeEvent[]
}

export interface YearlyResult {
  year: number
  elapsedYears: number
  husbandAge: number
  wifeAge: number
  childAge: number // 未誕生は -1
  // 収入
  husbandIncome: number
  wifeIncome: number
  childcareAllowance: number // 子育て関連手当
  otherIncome: number // その他収入(副業など、毎年)
  eventIncome: number // ライフイベント(収入)
  totalIncome: number
  // 支出
  livingExpense: number
  mortgagePayment: number
  mortgageBalance: number
  managementFee: number
  rentPayment: number // 住宅賃料(年額)
  rentRenewalFee: number // 更新料(その年)
  childcareCost: number // 子育て関連費用
  husbandSpecificExpense: number // 夫: 固有の支出
  wifeSpecificExpense: number // 妻: 固有の支出
  midTermContribution: number // 金融商品積立額(中期向け)
  longTermContribution: number // 金融商品積立額(長期向け)
  futurePlan: number // 将来プラン(不定期支出)
  mortgageDeduction: number // 住宅ローン控除(税額控除, 参考表示)
  tax: number // 税金(住宅ローン控除の変化を反映)
  socialInsurance: number // 社会保険料
  eventExpense: number // ライフイベント(支出)
  totalExpense: number
  // 収支・資産
  netCashFlow: number
  investmentReturn: number // 運用益(中期+長期)
  investmentBalance: number // 投資信託残高(中期+長期)
  cashBalance: number // 現金貯蓄残高
  totalAssets: number // cashBalance + investmentBalance
}
