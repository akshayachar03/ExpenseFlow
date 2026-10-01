import authService from "./auth.service";
import type {
  CreateExpenseRequest,
  DeleteExpenseResponse,
  ExpenseResponse,
  ExpensesResponse,
  UpdateExpenseRequest,
} from "../types/expense";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = authService.getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Request failed.");
  }

  return data as T;
}

export const getExpenses = async (): Promise<ExpensesResponse> => {
  return request<ExpensesResponse>("/expenses");
};

export const createExpense = async (
  payload: CreateExpenseRequest
): Promise<ExpenseResponse> => {
  return request<ExpenseResponse>("/expenses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateExpense = async (
  id: string,
  payload: UpdateExpenseRequest
): Promise<ExpenseResponse> => {
  return request<ExpenseResponse>(`/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const deleteExpense = async (
  id: string
): Promise<DeleteExpenseResponse> => {
  return request<DeleteExpenseResponse>(`/expenses/${id}`, {
    method: "DELETE",
  });
};

const expenseService = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};

export default expenseService;