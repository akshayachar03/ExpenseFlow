import authService from "./auth.service";
import type { DashboardResponse } from "../types/dashboard";

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

export const getDashboard = async (): Promise<DashboardResponse> => {
  return request<DashboardResponse>("/dashboard");
};

const dashboardService = {
  getDashboard,
};

export default dashboardService;