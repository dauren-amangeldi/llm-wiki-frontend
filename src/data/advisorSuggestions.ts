/** Advisor suggestion prompts — universal, no role filtering */
export interface AdvisorSuggestion {
  icon: string;
  key: string;
}

export const ADVISOR_SUGGESTIONS: AdvisorSuggestion[] = [
  { icon: "shield",         key: "adv_pm_partner_risks" },
  { icon: "lightbulb",      key: "adv_employee_apply" },
  { icon: "book-open",      key: "adv_employee_explain" },
  { icon: "trending-up",    key: "adv_employee_growth" },
  { icon: "target",         key: "adv_employee_kpi" },
  { icon: "users",          key: "adv_employee_team" },
  { icon: "alert-triangle", key: "adv_pm_risks" },
  { icon: "compass",        key: "adv_gd_strategy" },
];
