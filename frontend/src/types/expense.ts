export type TransactionType = "income" | "expense";

export interface ExpenseCategory {
  _id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Expense {
  _id: string;
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  category: ExpenseCategory;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseRequest {
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  category: string;
}

export interface UpdateExpenseRequest {
  title?: string;
  description?: string;
  amount?: number;
  type?: TransactionType;
  date?: string;
  category?: string;
}

export interface ExpenseResponse {
  success: boolean;
  message: string;
  data: Expense;
}

export interface ExpensesResponse {
  success: boolean;
  data: Expense[];
}

export interface DeleteExpenseResponse {
  success: boolean;
  message: string;
}