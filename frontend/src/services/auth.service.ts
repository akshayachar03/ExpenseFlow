import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "../types/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const TOKEN_KEY = "expenseflow_token";
const USER_KEY = "expenseflow_user";

async function request<T>(
  endpoint: string,
  options: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Request failed.");
  }

  return data as T;
}

export const register = async (
  payload: RegisterRequest
): Promise<AuthResponse> => {
  const response = await request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  saveAuth(response.data.token, response.data.user);

  return response;
};

export const login = async (
  payload: LoginRequest
): Promise<AuthResponse> => {
  const response = await request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  saveAuth(response.data.token, response.data.user);

  return response;
};

export const saveAuth = (token: string, user: User): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getUser = (): User | null => {
  const value = localStorage.getItem(USER_KEY);

  if (!value) {
    return null;
  }

  return JSON.parse(value) as User;
};

export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const authService = {
  register,
  login,
  saveAuth,
  getToken,
  getUser,
  isAuthenticated,
  logout,
};

export default authService;