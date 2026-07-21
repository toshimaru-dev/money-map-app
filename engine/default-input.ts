import type { LifePlanInput } from "./types"

// サンプル(入力パラメータ.pdf / マスタ_ライフプラン表)をもとにした初期値。
// 一部の複雑なスケジュール(夫の再雇用・年金、変動金利など)はv1では簡略化している。
export const defaultInput: LifePlanInput = {
  basic: {
    startYear: 2026,
    simulationYears: 64,
    husbandAge: 32,
    wifeAge: 31,
    childBirthYearOffset: 4, // 4年後(2030年)に第一子誕生
    husbandSavings: 50,
    wifeSavings: 100,
    housingType: "mortgage",
  },
  income: {
    husband: {
      // 昇給①30万/年(〜8年目) → 昇給②10万/年(〜20年目) → 以降は年収上限を維持
      // (源データの再雇用・退職金・年金はv1では未対応)
      baseIncome: 640,
      raisePhases: [
        { id: "raise-1", label: "昇給フェーズ①", annualRaise: 30, untilYear: 8 },
        { id: "raise-2", label: "昇給フェーズ②", annualRaise: 10, untilYear: 20 },
      ],
    },
    wife: {
      // 通常時の年収。子育て期間中は reductionPhases で上書き
      baseIncome: 350,
      annualRaise: 0,
      raiseYears: 0,
      reductionPhases: [
        { id: "maternity", label: "産休・育休", fromChildAge: 0, toChildAge: 1, annual: 187 },
        { id: "short-hours", label: "復帰・時短勤務", fromChildAge: 2, toChildAge: 9, annual: 400 },
      ],
    },
    otherIncome: { annualAmount: 0, fromYear: 1, untilYear: 5 }, // その他収入(副業など)。既定は0
  },
  childRearing: [
    { id: "infant", label: "乳幼児期", fromChildAge: 0, toChildAge: 5, annualCost: 30, annualAllowance: 15 },
    { id: "elementary", label: "小学生", fromChildAge: 6, toChildAge: 11, annualCost: 37, annualAllowance: 12 },
    { id: "junior", label: "中学生", fromChildAge: 12, toChildAge: 14, annualCost: 75, annualAllowance: 0 },
    { id: "high", label: "高校", fromChildAge: 15, toChildAge: 17, annualCost: 120, annualAllowance: 0 },
    { id: "university", label: "大学", fromChildAge: 18, toChildAge: 21, annualCost: 170, annualAllowance: 0 },
  ],
  livingExpense: {
    // 費目ごとの夫・妻の月額。合計 夫9.4 / 妻5.0
    items: [
      { id: "lv-water", label: "水道", husbandMonthly: 0, wifeMonthly: 0.3 },
      { id: "lv-energy", label: "光熱費", husbandMonthly: 0, wifeMonthly: 2 },
      { id: "lv-food", label: "食費", husbandMonthly: 7, wifeMonthly: 0 },
      { id: "lv-transit", label: "交通費", husbandMonthly: 0.7, wifeMonthly: 0.7 },
      { id: "lv-daily", label: "日用品", husbandMonthly: 1, wifeMonthly: 1.7 },
      { id: "lv-comm", label: "通信費", husbandMonthly: 0.7, wifeMonthly: 0.3 },
    ],
    annualInflationRate: 1.0,
  },
  specificExpense: {
    // 夫: 通常項目 娯楽費3+サブスク2+保険0.4+その他2 = 7.4万/月, ローン 奨学金1.4(〜7年目)
    husband: {
      items: [
        { id: "h-fun", label: "娯楽費", monthly: 3 },
        { id: "h-sub", label: "サブスク", monthly: 2 },
        { id: "h-ins", label: "保険", monthly: 0.4 },
        { id: "h-etc", label: "その他", monthly: 2 },
      ],
      loans: [{ id: "h-loan", label: "奨学金", monthly: 1.4, payoffYear: 7 }],
    },
    // 妻: 通常項目 娯楽費3+サブスク2+保険0.4+その他2 = 7.4万/月, ローン 奨学金2(〜11年目)
    wife: {
      items: [
        { id: "w-fun", label: "娯楽費", monthly: 3 },
        { id: "w-sub", label: "サブスク", monthly: 2 },
        { id: "w-ins", label: "保険", monthly: 0.4 },
        { id: "w-etc", label: "その他", monthly: 2 },
      ],
      loans: [{ id: "w-loan", label: "奨学金", monthly: 2, payoffYear: 11 }],
    },
  },
  investment: {
    midTerm: { initialBalance: 0, annualContribution: 48, annualReturnRate: 6.0 },
    longTerm: { initialBalance: 0, annualContribution: 0, annualReturnRate: 3.0 },
  },
  mortgage: {
    principal: 8050,
    downPayment: 0,
    initialInterestRate: 1.45,
    termYears: 48,
    bonusPrincipal: 1500, // 8050万のうち1500万をボーナス返済に充当(残り6550万が通常返済分)
    // 変動金利(物価上昇連動): 5年ごとに+0.5%、4.0%で頭打ち
    maxInterestRate: 4.0,
    rateReviewIntervalYears: 5,
    rateStepUp: 0.5,
    // 参考データの長期修繕計画に合わせて、既定は段階的な値を使う
    maintenanceMode: "stepped",
    monthlyManagementFee: 1.9,
    monthlyRepairReserve: 1.1,
    maintenanceIncreaseRate: 1.5,
    managementFeeStages: [
      { id: "mf-1", label: "管理費", monthly: 1.9, untilYear: 48 },
    ],
    // 修繕積立金は 13.2 → 19.2 → 31.2 万円/年 (月額 1.1 → 1.6 → 2.6) と段階的に上がる
    repairReserveStages: [
      { id: "rr-1", label: "当初", monthly: 1.1, untilYear: 6 },
      { id: "rr-2", label: "第1回見直し後", monthly: 1.6, untilYear: 14 },
      { id: "rr-3", label: "第2回見直し後", monthly: 2.6, untilYear: 48 },
    ],
    fireInsurance: 3.5,
    earthquakeInsurance: 9.2,
    insuranceRenewalYears: 5,
  },
  rent: {
    monthlyRent: 15, // 月額賃料15万円
    renewalFee: 15, // 更新料(1ヶ月分)
    renewalIntervalYears: 2, // 2年ごとに更新
    rentIncreasePerRenewal: 0, // 更新ごとの賃料上昇(既定0)
  },
  tax: {
    socialInsuranceRate: 0.15,
    basicDeductionIncome: 48,
    basicDeductionResident: 43,
    autoTax: true,
    manualTaxAnnual: 100,
    autoSocialInsurance: true,
    manualSocialInsuranceAnnual: 150,
  },
  mortgageDeduction: {
    rate: 0.7,
    years: 13,
    capBalance: 4500,
  },
  // 山あり谷ありの大きな出費・臨時収入(明細やグラフのポイントに反映)
  events: [
    { id: "travel-1", name: "記念旅行", year: 2040, type: "expense", amount: 200 },
    { id: "renovation", name: "住宅リフォーム", year: 2050, type: "expense", amount: 500 },
    { id: "retirement-bonus", name: "退職金", year: 2059, type: "income", amount: 2330 },
    { id: "relocation", name: "老後の住み替え", year: 2062, type: "expense", amount: 1500 },
  ],
}
