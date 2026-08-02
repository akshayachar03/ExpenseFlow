import type { Expense } from "./expense";

export interface ExpenseByCategory {
  category: string;
  amount: number;
}

export interface DashboardSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;

  monthlyIncome: number;
  monthlyExpense: number;

  expenseByCategory: ExpenseByCategory[];

  recentTransactions: Expense[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardSummary;
}