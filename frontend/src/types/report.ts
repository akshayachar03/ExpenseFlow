export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  transactionCount: number;
}

export interface ReportResponse {
  success: boolean;
  data: ReportSummary;
}